// PDF lab-report import. Extracts the text layer with pdf.js (lazy-loaded so
// the main bundle stays small), reconstructs lines, then heuristically pulls
// out the sample date and marker values. Tuned for European lab sheets
// (decimal commas, "do/od" one-sided ranges, Serbian marker names) but the
// heuristics are generic. Always show users a preview before saving.

import { MARKERS, makeCustomMarker } from './catalog.js'

export async function extractPdfLines(file) {
  // The legacy build supports several Safari/iOS versions back; the modern
  // build needs the very latest browsers and fails opaquely on older ones.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const lines = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    // page.getTextContent() async-iterates a ReadableStream internally, which
    // Safari/WebKit doesn't support — read the stream manually instead.
    const reader = page.streamTextContent().getReader()
    const rawItems = []
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      rawItems.push(...value.items)
    }
    const items = rawItems
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5] }))
      .sort((a, b) => b.y - a.y || a.x - b.x)
    // Rolling clustering: lab PDFs place a row's value a few px off the
    // label's baseline, so chain items whose y is within 4px of the previous.
    let group = null
    let lastY = null
    const groups = []
    for (const it of items) {
      if (group && Math.abs(lastY - it.y) <= 4) {
        group.push(it)
      } else {
        group = [it]
        groups.push(group)
      }
      lastY = it.y
    }
    for (const g of groups) {
      g.sort((a, b) => a.x - b.x)
      lines.push(g.map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim())
    }
  }
  return lines
}

const SERBIAN_MAP = { đ: 'dj', ž: 'z', š: 's', č: 'c', ć: 'c' }

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[đžšćč]/g, (c) => SERBIAN_MAP[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// The analyte name leads a lab row, so the match appearing EARLIEST in the
// line wins ("Non-HDL … Holesterol" → non-HDL, "eGFR (klirens kreatinina)"
// → eGFR). Ties broken by longest alias (MCHC over MCH).
function matchMarkerInLine(line) {
  const n = norm(line)
  let best = null
  let bestIdx = Infinity
  let bestLen = 0
  for (const m of MARKERS) {
    for (const cand of [m.name, ...m.aliases]) {
      const c = norm(cand)
      if (c.length < 3) continue
      const idx = n.indexOf(c)
      if (idx === -1) continue
      if (idx < bestIdx || (idx === bestIdx && c.length > bestLen)) {
        best = m.id
        bestIdx = idx
        bestLen = c.length
      }
    }
  }
  if (best) return best
  // Fallback for short marker codes printed as a standalone leading token
  // (LH, CK, C3, RF, PT…) that the substring pass skips because they're < 3
  // chars. Exact whole-token match on the first few tokens only, so it can't
  // pick up a 2-letter code buried inside another word.
  const tokens = line.split(/[^A-Za-zÀ-ž0-9]+/).filter(Boolean).slice(0, 3)
  for (const t of tokens) {
    const tn = norm(t)
    if (tn.length < 2 || tn.length > 4) continue
    for (const m of MARKERS) {
      if (norm(m.id) === tn || norm(m.name) === tn || m.aliases.some((a) => norm(a) === tn)) return m.id
    }
  }
  return null
}

// The reference range printed alongside the value. European lab sheets write
// it several ways: two-sided "a - b", one-sided "do b" (≤) / "od a" (≥), or
// "< b" / "> a". Tiered lipids (LDL) print an "opt: < x" optimal threshold
// next to a borderline band — prefer the optimal one. Returns { lo, hi } with a
// null side for one-sided ranges, or null when nothing parseable is found.
export function extractRange(line, value) {
  const s = line.replace(/(\d),(\d)/g, '$1.$2')
  const num = '(\\d+(?:\\.\\d+)?)'
  // Tiered lipids ("opt: < x") always win over a borderline band.
  const opt = s.match(new RegExp(`opt\\S*\\s*:?\\s*([<>])\\s*${num}`, 'i'))
  if (opt) return opt[1] === '<' ? { lo: null, hi: +opt[2] } : { lo: +opt[2], hi: null }

  // Collect every range on the line with its position. Lines can carry more
  // than one (e.g. a differential row: a %-range and an absolute-count range),
  // so we pair the range with the value rather than blindly taking the first.
  const found = []
  for (const m of s.matchAll(new RegExp(`${num}\\s*[-–]\\s*${num}`, 'g'))) {
    let lo = +m[1]
    let hi = +m[2]
    if (lo > hi) [lo, hi] = [hi, lo]
    found.push({ idx: m.index, r: { lo, hi } })
  }
  for (const m of s.matchAll(new RegExp(`\\bdo\\s*${num}`, 'gi'))) found.push({ idx: m.index, r: { lo: null, hi: +m[1] } })
  for (const m of s.matchAll(new RegExp(`\\bod\\s*${num}`, 'gi'))) found.push({ idx: m.index, r: { lo: +m[1], hi: null } })
  for (const m of s.matchAll(new RegExp(`<\\s*${num}`, 'g'))) found.push({ idx: m.index, r: { lo: null, hi: +m[1] } })
  for (const m of s.matchAll(new RegExp(`>\\s*${num}`, 'g'))) found.push({ idx: m.index, r: { lo: +m[1], hi: null } })
  if (found.length === 0) return null
  found.sort((a, b) => a.idx - b.idx)
  if (found.length === 1 || value == null) return found[0].r

  // Pair with the value: take the range that comes right after the value's
  // position (the value sits between its label and its own range). Fall back to
  // the closest range before it, else the first.
  const vstr = String(value).replace('.', '\\.')
  const vre = new RegExp(`(?<![\\d.])${vstr}(?![\\d.])`, 'g')
  let vpos = -1
  for (const m of s.matchAll(vre)) vpos = m.index
  if (vpos < 0) return found[0].r
  const after = found.find((f) => f.idx > vpos)
  if (after) return after.r
  return found[found.length - 1].r
}

// Lines that carry numbers but are never analyte results: patient/header
// metadata and dates. Used to keep them out of the custom-marker capture.
const NON_RESULT_RE =
  /datum|ro[dđ]j?en|menstr|uzork|uzimanj|protokol|jlpb|jmbg|izve[sš]taj|prezime|adres|[sš]ifra|godin|\bpol\b|\bstr\b|\btel\b/i

function extractValue(line) {
  let s = line.replace(/(\d),(\d)/g, '$1.$2')
  s = s.replace(/\d{1,2}[./]\d{1,2}[./]\d{2,4}/g, ' ') // dates
  s = s.replace(/\d{1,2}:\d{2}/g, ' ') // times
  s = s.replace(/\d+(\.\d+)?\s*[-–]\s*\d+(\.\d+)?/g, ' ') // two-sided ranges
  s = s.replace(/\b(do|od)\s*\d+(\.\d+)?/gi, ' ') // one-sided ranges
  s = s.replace(/(opt|gran|rizi\S*)\s*:?\s*[<>]?\s*\d+(\.\d+)?/gi, ' ') // risk tiers
  s = s.replace(/x\s*10\s*\/?\s*L?\s*\d*/gi, ' ') // ×10⁹/L artifacts
  s = s.replace(/\b\d+\s*h\b/gi, ' ') // "1h"
  s = s.replace(/1,73\s*m2|1\.73\s*m2/gi, ' ') // eGFR unit
  // Bare numbers are measured values; "<15"-style numbers are reference
  // cutoffs — unless a prefixed number is all that remains (a below-detection
  // result like "Estradiol < 20"), in which case use it.
  const tokens = [...s.matchAll(/([<>]?)\s*(\d+(?:\.\d+)?)/g)]
  if (tokens.length === 0) return null
  const bare = tokens.filter((t) => !t[1])
  const pick = bare.length > 0 ? bare[bare.length - 1] : tokens[tokens.length - 1]
  const v = parseFloat(pick[2])
  return isFinite(v) ? v : null
}

const DATE_RE = /(\d{1,2})[./](\d{1,2})[./](\d{4})/
// "Datum rođenja" (also OCR'd/typed as rodjenja/rodenja), birth, JMBG — these
// lines carry the patient's birth date, never the sample date.
const BIRTH_RE = /ro[dđ]j?enj|birth|jmbg/i
const SAMPLING_RE = /uzork|uzimanj|sample|collect/i

const fmtDate = (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`

// Header rows often merge into one line ("Datum rođenja: 15.03.1978 ...
// Datum uzorkovanja: 10.06.2026"), so when a sampling keyword is present,
// take the date closest AFTER it rather than the first date on the line.
function dateNearKeyword(line, kwRe) {
  const kw = line.search(kwRe)
  if (kw === -1) return null
  let best = null
  let bestDist = Infinity
  for (const m of line.matchAll(new RegExp(DATE_RE.source, 'g'))) {
    const dist = m.index >= kw ? m.index - kw : kw - m.index + 10000
    if (dist < bestDist) {
      bestDist = dist
      best = m
    }
  }
  return best
}

function findReportDate(lines) {
  for (const l of lines) {
    const m = dateNearKeyword(l, SAMPLING_RE)
    if (m && (m.index >= l.search(SAMPLING_RE) || !BIRTH_RE.test(l))) return fmtDate(m)
  }
  for (const l of lines) {
    const m = l.match(DATE_RE)
    if (m && /datum|date/i.test(l) && !BIRTH_RE.test(l)) return fmtDate(m)
  }
  for (const l of lines) {
    const m = l.match(DATE_RE)
    if (m && !BIRTH_RE.test(l)) return fmtDate(m)
  }
  return null
}

// Best-effort lab name + sample type from the header, shown on the home pill.
function findLab(lines) {
  for (const l of lines) {
    const m = l.match(/\b(medlab|biomedica|konzilijum|beo-?lab|zavod za[^,\n]*)\b/i)
    if (m) return /medlab/i.test(m[1]) ? 'MEDLAB' : m[1].replace(/\s+/g, ' ').trim()
  }
  return ''
}

function findSample(lines) {
  for (const l of lines) {
    if (/\bserum/i.test(l)) return 'Serum'
    if (/\bplazma|plasma/i.test(l)) return 'Plasma'
    if (/\burin/i.test(l)) return 'Urine'
    if (/puna krv|whole blood|krvna slika/i.test(l)) return 'Whole blood'
  }
  return ''
}

// Common lab unit tokens — used to tell a result row from prose when the
// analyte isn't a known marker.
const UNIT_RE =
  /(mmol\/l|[µμu]mol\/l|nmol\/l|pmol\/l|mg\/dl|mg\/l|[µμu]g\/l|ng\/ml|ng\/l|pg\/ml|miu\/ml|iu\/ml|iu\/l|mu\/l|u\/l|g\/l|mm\/h|fl\b|\bpg\b|%)/i

function extractUnit(line) {
  if (/×\s*10|x\s*10\s*\d*\s*\/?\s*l/i.test(line)) return '×10⁹/L'
  const m = line.match(UNIT_RE)
  return m ? m[1].replace(/^umol/i, 'µmol').replace(/^ug\//i, 'µg/') : ''
}

const METHOD_RE = /\b(SPF|ELISA|CMIA|ECLIA|CLIA|ECL|HPLC|ISE|PAP|RIA|EIA|LIA|FPIA|MEIA|IT|calc|turb|neph|Friedewald)\b/gi
const FLAG_RE = /^[VÂº°*•·\-–]$/

// The analyte name leads the row: keep tokens up to the first standalone
// number (the measured value), drop leading lab flags and the method column.
// Token-based so names containing digits (Beta-2, Omega-3) stay intact.
function extractAnalyteName(line) {
  const out = []
  for (const t of line.split(/\s+/)) {
    if (/^[<>]?\d+([.,]\d+)?$/.test(t)) break
    out.push(t)
  }
  while (out.length && FLAG_RE.test(out[0])) out.shift()
  return out
    .join(' ')
    .replace(METHOD_RE, ' ')
    .replace(/[™®©*]/g, ' ') // quality-mark / footnote symbols, not part of the name
    .replace(/^[\s\-–:]+/, '')
    .replace(/[\s\-–:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseLabLines(lines) {
  const date = findReportDate(lines)
  const lab = findLab(lines)
  const sample = findSample(lines)

  const values = {}
  const ranges = {}
  const markers = {} // defs for custom (non-catalog) analytes found in this report
  for (const line of lines) {
    // Skip boilerplate / sub-lines that mention numbers without being results.
    if (/zabranjeno|referentn|akreditovan|kontrol|umnozavanje|fotokopiranje|konsultovati|izrazeno|jedinic[ae]|napomena/i.test(line))
      continue
    const v = extractValue(line)
    if (v == null) continue
    const r = extractRange(line, v)
    const id = matchMarkerInLine(line)
    if (id) {
      if (values[id] != null) continue
      values[id] = v
      if (r) ranges[id] = r
    } else {
      // Unrecognized analyte → capture as a custom marker only for a genuine
      // result row: it must carry a real unit, must not be a date / identifier
      // / header line, and must have a real word for a name. This keeps birth
      // and sampling dates (and IDs) from becoming markers.
      const unit = extractUnit(line)
      if (!unit) continue
      if (DATE_RE.test(line) || NON_RESULT_RE.test(line)) continue
      const name = extractAnalyteName(line)
      if (!/[a-zšđžčćž]{3,}/i.test(name)) continue
      const cm = makeCustomMarker(name, unit)
      if (values[cm.id] != null) continue
      values[cm.id] = v
      if (r) ranges[cm.id] = r
      markers[cm.id] = { name: cm.name, unit: cm.unit, panel: 'Other' }
    }
  }
  return { date, values, ranges, markers, lab, sample }
}

// PDF lab-report import. Extracts the text layer with pdf.js (lazy-loaded so
// the main bundle stays small), reconstructs lines, then heuristically pulls
// out the sample date and marker values. Tuned for European lab sheets
// (decimal commas, "do/od" one-sided ranges, Serbian marker names) but the
// heuristics are generic. Always show users a preview before saving.

import { MARKERS } from './catalog.js'

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
  return best
}

// The reference range printed alongside the value. European lab sheets write
// it several ways: two-sided "a - b", one-sided "do b" (≤) / "od a" (≥), or
// "< b" / "> a". Tiered lipids (LDL) print an "opt: < x" optimal threshold
// next to a borderline band — prefer the optimal one. Returns { lo, hi } with a
// null side for one-sided ranges, or null when nothing parseable is found.
export function extractRange(line) {
  const s = line.replace(/(\d),(\d)/g, '$1.$2')
  const num = '(\\d+(?:\\.\\d+)?)'
  let m = s.match(new RegExp(`opt\\S*\\s*:?\\s*([<>])\\s*${num}`, 'i'))
  if (m) return m[1] === '<' ? { lo: null, hi: +m[2] } : { lo: +m[2], hi: null }
  m = s.match(new RegExp(`${num}\\s*[-–]\\s*${num}`))
  if (m) {
    let lo = +m[1]
    let hi = +m[2]
    if (lo > hi) [lo, hi] = [hi, lo]
    return { lo, hi }
  }
  m = s.match(new RegExp(`\\bdo\\s*${num}`, 'i'))
  if (m) return { lo: null, hi: +m[1] }
  m = s.match(new RegExp(`\\bod\\s*${num}`, 'i'))
  if (m) return { lo: +m[1], hi: null }
  m = s.match(new RegExp(`<\\s*${num}`))
  if (m) return { lo: null, hi: +m[1] }
  m = s.match(new RegExp(`>\\s*${num}`))
  if (m) return { lo: +m[1], hi: null }
  return null
}

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

export function parseLabLines(lines) {
  const date = findReportDate(lines)
  const lab = findLab(lines)
  const sample = findSample(lines)

  const values = {}
  const ranges = {}
  for (const line of lines) {
    // Skip boilerplate that mentions analyses without carrying results.
    if (/zabranjeno|referentn|akreditovan|kontrol|umnozavanje|fotokopiranje|konsultovati/i.test(line)) continue
    const id = matchMarkerInLine(line)
    if (!id || values[id] != null) continue
    const v = extractValue(line)
    if (v != null) {
      values[id] = v
      const r = extractRange(line)
      if (r) ranges[id] = r
    }
  }
  return { date, values, ranges, lab, sample }
}

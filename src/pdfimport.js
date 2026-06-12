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

export function parseLabLines(lines) {
  let date = null
  for (const l of lines) {
    const m = l.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/)
    if (m && /uzork|uzimanj|datum|date|sample|collect/i.test(l)) {
      date = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
      break
    }
  }
  if (!date) {
    for (const l of lines) {
      const m = l.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/)
      if (m) {
        date = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
        break
      }
    }
  }

  const values = {}
  for (const line of lines) {
    // Skip boilerplate that mentions analyses without carrying results.
    if (/zabranjeno|referentn|akreditovan|kontrol|umnozavanje|fotokopiranje|konsultovati/i.test(line)) continue
    const id = matchMarkerInLine(line)
    if (!id || values[id] != null) continue
    const v = extractValue(line)
    if (v != null) values[id] = v
  }
  return { date, values }
}

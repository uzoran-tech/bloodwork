import { markerById, matchMarker, statusOf, midOf, MARKERS } from './catalog.js'

const KEY = 'bloodtrack.reports'

// A report: { id, date: 'YYYY-MM-DD', lab, notes, values: { markerId: number } }

export function loadReports() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(r) ? r : []
  } catch {
    return []
  }
}

export function saveReports(reports) {
  localStorage.setItem(KEY, JSON.stringify(reports))
}

export const sortByDate = (reports) => [...reports].sort((a, b) => a.date.localeCompare(b.date))

export function seriesFor(reports, markerId) {
  return sortByDate(reports)
    .filter((r) => r.values[markerId] != null)
    .map((r) => ({ date: r.date, value: r.values[markerId] }))
}

export function trackedMarkers(reports) {
  const ids = new Set()
  for (const r of reports) for (const id of Object.keys(r.values)) ids.add(id)
  return MARKERS.filter((m) => ids.has(m.id))
}

// Merge a new report into the list; one report per date (values are combined),
// so importing the same lab sheet twice doesn't duplicate.
export function mergeReport(reports, report) {
  const existing = reports.find((r) => r.date === report.date)
  if (existing) {
    return reports.map((r) =>
      r.date === report.date
        ? { ...r, lab: report.lab || r.lab, notes: report.notes || r.notes, values: { ...r.values, ...report.values } }
        : r
    )
  }
  return [...reports, { id: `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...report }]
}

// CSV: header optional, rows of "date,marker,value[,unit]". Accepts marker ids,
// English names, or Serbian lab names; "<x"/" >x" prefixes are stripped.
export function parseCSV(text) {
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const errors = []
  let imported = 0
  let reports = []
  for (const row of rows) {
    const cells = row.split(/[,;\t]/).map((c) => c.trim())
    if (cells.length < 3) continue
    const [d, name, raw] = cells
    if (/^date$/i.test(d)) continue
    const date = normalizeDate(d)
    if (!date) {
      errors.push(`Unrecognized date: "${d}"`)
      continue
    }
    const id = matchMarker(name)
    if (!id) {
      errors.push(`Unknown marker: "${name}"`)
      continue
    }
    const value = parseFloat(String(raw).replace(/[<>]/g, '').replace(',', '.'))
    if (!isFinite(value)) {
      errors.push(`Bad value for ${name}: "${raw}"`)
      continue
    }
    reports = mergeReport(reports, { date, lab: '', notes: '', values: { [id]: value } })
    imported += 1
  }
  return { reports, imported, errors }
}

function normalizeDate(s) {
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})\.?$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return null
}

export function toCSV(reports) {
  const lines = ['date,marker,value,unit']
  for (const r of sortByDate(reports)) {
    for (const [id, v] of Object.entries(r.values)) {
      const m = markerById(id)
      lines.push(`${r.date},${id},${v},${m ? m.unit : ''}`)
    }
  }
  return lines.join('\n')
}

// ---- Insights (rule-based, descriptive only — not medical advice) ----

export function buildInsights(reports) {
  const insights = []
  for (const m of trackedMarkers(reports)) {
    const s = seriesFor(reports, m.id)
    if (s.length === 0) continue
    const latest = s[s.length - 1]
    const st = statusOf(m, latest.value)

    if (st !== 'normal') {
      insights.push({
        tone: 'warn',
        markerId: m.id,
        text: `${m.name} is ${st === 'high' ? 'above' : 'below'} the reference range (${latest.value} ${m.unit}).`,
      })
    }

    if (s.length >= 2) {
      const prev = s[s.length - 2]
      const prevSt = statusOf(m, prev.value)
      if (prevSt !== 'normal' && st === 'normal') {
        insights.push({
          tone: 'good',
          markerId: m.id,
          text: `${m.name} moved back into range (${prev.value} → ${latest.value} ${m.unit}).`,
        })
      } else if (prev.value !== 0) {
        const pct = ((latest.value - prev.value) / Math.abs(prev.value)) * 100
        if (Math.abs(pct) >= 15) {
          const towardMid = Math.abs(latest.value - midOf(m)) < Math.abs(prev.value - midOf(m))
          insights.push({
            tone: towardMid ? 'good' : st === 'normal' ? 'info' : 'warn',
            markerId: m.id,
            text: `${m.name} ${pct > 0 ? 'rose' : 'fell'} ${Math.abs(pct).toFixed(0)}% since the previous test${towardMid ? ', moving toward mid-range' : ''}.`,
          })
        }
      }
    }

    if (s.length >= 4) {
      const half = Math.floor(s.length / 2)
      const avg = (arr) => arr.reduce((t, p) => t + p.value, 0) / arr.length
      const a = avg(s.slice(0, half))
      const b = avg(s.slice(half))
      if (a !== 0 && Math.abs((b - a) / Math.abs(a)) >= 20 / 100) {
        insights.push({
          tone: 'info',
          markerId: m.id,
          text: `Long-term, ${m.name} averages ${b > a ? 'higher' : 'lower'} in recent tests (${a.toFixed(1)} → ${b.toFixed(1)} ${m.unit}).`,
        })
      }
    }
  }
  const order = { warn: 0, good: 1, info: 2 }
  return insights.sort((x, y) => order[x.tone] - order[y.tone])
}

export function rangeStats(reports) {
  const tracked = trackedMarkers(reports)
  if (reports.length === 0 || tracked.length === 0) return { inRange: 0, total: 0, flags: [] }
  const flags = []
  let inRange = 0
  let total = 0
  for (const m of tracked) {
    const s = seriesFor(reports, m.id)
    if (s.length === 0) continue
    total += 1
    const latest = s[s.length - 1]
    const st = statusOf(m, latest.value)
    if (st === 'normal') inRange += 1
    else flags.push({ marker: m, value: latest.value, status: st, date: latest.date })
  }
  return { inRange, total, flags }
}

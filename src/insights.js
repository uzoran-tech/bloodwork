// Insight engine — the "early-warning + interpreter" magnet.
//
// Turns a user's full history into plain-language insights: per-marker trends
// (drift, crossings, approaching a limit) and cross-marker PATTERNS (insulin
// resistance, iron deficiency, kidney decline, thyroid, lipid risk, liver) —
// the interpretation a single lab report or a 7-minute visit doesn't give you.
//
// Everything is framed as information to discuss with a doctor, never a
// diagnosis. Pure functions — no UI, fully testable.

import { trackedMarkers, seriesFor } from './store.js'
import { markerById, statusOf, refRange } from './catalog.js'

const SEV_ORDER = { alert: 0, watch: 1, info: 2, good: 3 }

// How much a finding should rise to the top. impact = base(kind) × clinical
// weight (× recency tiebreak). Patterns outrank the singles they explain, and
// those singles are suppressed once a pattern claims them.
const BASE = { pattern: 3.3, alert: 3.0, watch: 2.0, info: 1.2, good: 0.9 }
// Clinical weight by body system — seeded here, to be reviewed by a clinician
// before any real launch. Higher = more worth surfacing first.
const PANEL_WEIGHT = {
  'Liver & Kidney': 1.0,
  Cardiac: 1.0,
  Metabolic: 0.95,
  Lipids: 0.9,
  'Tumor Markers': 0.9,
  Hormones: 0.85,
  'Blood Count': 0.8,
  Coagulation: 0.8,
  Inflammation: 0.7,
  Electrolytes: 0.6,
  'Vitamins & Minerals': 0.55,
  Other: 0.4,
}
const weightOf = (m) => PANEL_WEIGHT[m?.panel] ?? 0.5

const fmtMonth = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
const pct = (a, b) => (b === 0 ? null : ((a - b) / Math.abs(b)) * 100)
const r1 = (n) => (Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10)

function analyze(m, series) {
  const latest = series[series.length - 1]
  const first = series[0]
  const prev = series.length > 1 ? series[series.length - 2] : null
  const { lo, hi } = refRange(m, latest.range)
  const st = statusOf(m, latest.value, latest.range)
  const prevSt = prev ? statusOf(m, prev.value, prev.range) : null
  const changeFirst = first ? pct(latest.value, first.value) : null
  const changePrev = prev ? pct(latest.value, prev.value) : null

  // Length of the monotonic tail (consecutive moves in one direction).
  let up = 0
  let down = 0
  for (let i = series.length - 1; i > 0; i--) {
    if (series[i].value > series[i - 1].value) {
      if (down) break
      up++
    } else if (series[i].value < series[i - 1].value) {
      if (up) break
      down++
    } else break
  }

  // In range but creeping toward a bound (within 12%) and moving that way.
  let approaching = null
  if (changePrev != null && st === 'normal') {
    if (hi != null && latest.value >= hi * 0.88 && changePrev > 0) approaching = 'high'
    else if (lo != null && latest.value <= lo * 1.12 && changePrev < 0) approaching = 'low'
  }
  return { latest, first, prev, lo, hi, st, prevSt, changeFirst, changePrev, monoUp: up, monoDown: down, approaching, n: series.length }
}

function markerInsights(m, series) {
  const out = []
  const a = analyze(m, series)
  const span = a.n > 1 ? `${fmtMonth(a.first.date)}–${fmtMonth(a.latest.date)}` : fmtMonth(a.latest.date)

  if (a.prev && a.prevSt === 'normal' && a.st !== 'normal') {
    out.push({ key: `cross-${m.id}`, severity: 'alert', tier: 'free', icon: '⚠️', title: `${m.name} just moved out of range`, detail: `Now ${a.latest.value} ${m.unit} (${a.st === 'high' ? 'above' : 'below'} range), from ${a.prev.value} on ${fmtMonth(a.prev.date)}. Worth raising with your doctor.`, markerIds: [m.id], date: a.latest.date, trend: 1.15 })
  } else if (a.st !== 'normal') {
    out.push({ key: `oor-${m.id}`, severity: 'alert', tier: 'free', icon: '⚠️', title: `${m.name} is ${a.st === 'high' ? 'high' : 'low'}`, detail: `Latest ${a.latest.value} ${m.unit}, ${a.st === 'high' ? 'above' : 'below'} the reference range.`, markerIds: [m.id], date: a.latest.date })
  }

  if (a.prev && a.prevSt !== 'normal' && a.st === 'normal') {
    out.push({ key: `back-${m.id}`, severity: 'good', tier: 'free', icon: '✅', title: `${m.name} is back in range`, detail: `${a.prev.value} → ${a.latest.value} ${m.unit}. Nice.`, markerIds: [m.id], date: a.latest.date })
  }

  if (a.st === 'normal' && a.approaching) {
    out.push({ key: `near-${m.id}`, severity: 'watch', tier: 'premium', icon: '📈', title: `${m.name} is creeping toward the ${a.approaching === 'high' ? 'upper' : 'lower'} limit`, detail: `Now ${a.latest.value} ${m.unit}, trending ${a.approaching === 'high' ? 'up' : 'down'}. Still in range — but the kind of slow drift that's easy to miss.`, markerIds: [m.id], date: a.latest.date, trend: 1.1 })
  }

  if (a.monoUp >= 3 || a.monoDown >= 3) {
    const rising = a.monoUp >= 3
    out.push({ key: `drift-${m.id}`, severity: 'watch', tier: 'premium', icon: rising ? '↗️' : '↘️', title: `${m.name} has ${rising ? 'risen' : 'fallen'} ${rising ? a.monoUp : a.monoDown} tests in a row`, detail: `${a.first.value} → ${a.latest.value} ${m.unit} over ${span}. A consistent direction is worth a look.`, markerIds: [m.id], date: a.latest.date, trend: 1.1 })
  } else if (a.changeFirst != null && Math.abs(a.changeFirst) >= 25 && a.n >= 2) {
    const up = a.changeFirst > 0
    out.push({ key: `chg-${m.id}`, severity: 'info', tier: 'premium', icon: up ? '↗️' : '↘️', title: `${m.name} ${up ? 'up' : 'down'} ${Math.abs(r1(a.changeFirst))}% since ${fmtMonth(a.first.date)}`, detail: `${a.first.value} → ${a.latest.value} ${m.unit}.`, markerIds: [m.id], date: a.latest.date })
  }
  for (const i of out) i.weight = weightOf(m)
  return out
}

// Cross-marker patterns — the interpretation that needs the whole picture.
function patterns(reports) {
  const out = []
  const pick = (id) => {
    const m = markerById(id)
    if (!m) return null
    const s = seriesFor(reports, id)
    if (!s.length) return null
    const latest = s[s.length - 1]
    return {
      id, m, v: latest.value, unit: m.unit,
      st: statusOf(m, latest.value, latest.range),
      rising: s.length > 1 && latest.value > s[0].value,
      falling: s.length > 1 && latest.value < s[0].value,
      date: latest.date,
    }
  }
  const ids = (...xs) => xs.filter((x) => x).map((x) => x.id)

  const hba1c = pick('hba1c')
  const ins = pick('insulin')
  const glu = pick('glucose')
  if (hba1c && ins && (hba1c.v >= 5.7 || hba1c.rising) && (ins.v > 12 || ins.rising || ins.st === 'high')) {
    out.push({ key: 'pat-ir', severity: 'watch', tier: 'premium', icon: '🍞', title: 'Early signs of insulin resistance', detail: `HbA1c ${hba1c.v}% and fasting insulin ${ins.v} ${ins.unit} are both ${hba1c.rising || ins.rising ? 'trending up' : 'elevated'}. This pattern can precede type 2 diabetes by years — worth discussing metabolic health (and possibly an OGTT) with your doctor.`, markerIds: ids(hba1c, ins, glu), date: hba1c.date })
  }

  const fer = pick('ferritin')
  const hgb = pick('hgb')
  const mcv = pick('mcv')
  if (fer && (fer.v < 30 || fer.st === 'low' || fer.falling) && ((hgb && hgb.st === 'low') || (mcv && mcv.st === 'low') || fer.st === 'low')) {
    out.push({ key: 'pat-iron', severity: 'watch', tier: 'premium', icon: '🩸', title: 'Possible iron-deficiency pattern', detail: `Ferritin ${fer.v} ${fer.unit} is low${hgb && hgb.st === 'low' ? ' and hemoglobin is below range' : ''}${mcv && mcv.st === 'low' ? ' with small red cells (low MCV)' : ''}. Low iron stores can sap energy — ask your doctor about iron studies.`, markerIds: ids(fer, hgb, mcv, pick('iron')), date: fer.date })
  }

  const egfr = pick('egfr')
  const cr = pick('creatinine')
  if ((egfr && (egfr.falling || egfr.st === 'low')) || (cr && (cr.rising || cr.st === 'high'))) {
    out.push({ key: 'pat-kidney', severity: 'watch', tier: 'premium', icon: '🫘', title: 'Kidney filtration trending down', detail: `${egfr ? `eGFR is ${egfr.v} ${egfr.unit}` : ''}${egfr && cr ? ', ' : ''}${cr ? `creatinine ${cr.v} ${cr.unit}` : ''} — kidney function has shifted over time. Often nothing serious, but the trajectory is worth monitoring.`, markerIds: ids(egfr, cr, pick('urea')), date: (egfr || cr).date })
  }

  const tsh = pick('tsh')
  const ft4 = pick('ft4')
  if (tsh && (tsh.v > 4 || tsh.rising) && (!ft4 || ft4.falling || ft4.st === 'low')) {
    out.push({ key: 'pat-thyroid', severity: 'watch', tier: 'premium', icon: '🦋', title: 'Thyroid may be slowing down', detail: `TSH ${tsh.v} ${tsh.unit} is ${tsh.rising ? 'rising' : 'elevated'}${ft4 ? `, with Free T4 ${ft4.v} ${ft4.unit}` : ''}. A rising TSH can signal an underactive thyroid — worth a thyroid check.`, markerIds: ids(tsh, ft4, pick('ft3')), date: tsh.date })
  }

  const ldl = pick('ldl')
  const hdl = pick('hdl')
  const trig = pick('trig')
  if (ldl && ldl.st === 'high' && ((hdl && hdl.st === 'low') || (trig && trig.st === 'high'))) {
    out.push({ key: 'pat-lipid', severity: 'watch', tier: 'premium', icon: '🫀', title: 'Lipid profile points to higher cardiovascular risk', detail: `LDL ${ldl.v} ${ldl.unit} is above range${hdl && hdl.st === 'low' ? ', HDL is low' : ''}${trig && trig.st === 'high' ? ', triglycerides are high' : ''}. Worth a cardiovascular-risk conversation.`, markerIds: ids(ldl, hdl, trig, pick('chol'), pick('apob')), date: ldl.date })
  }

  const alt = pick('alt')
  const ast = pick('ast')
  const ggt = pick('ggt')
  if ([alt, ast, ggt].filter((x) => x && x.st === 'high').length >= 2) {
    out.push({ key: 'pat-liver', severity: 'watch', tier: 'premium', icon: '🫄', title: 'Liver enzymes are elevated', detail: `More than one liver enzyme is above range. Often diet, alcohol or medication related — but persistent elevation deserves a check.`, markerIds: ids(alt, ast, ggt), date: (alt || ast || ggt).date })
  }

  // Patterns always outrank the singles they explain. Weight the few we have by
  // how directly the pattern points at something actionable.
  const PATTERN_WEIGHT = {
    'pat-ir': 1.0, 'pat-kidney': 1.0, 'pat-lipid': 1.0,
    'pat-liver': 0.9, 'pat-thyroid': 0.9, 'pat-iron': 0.8,
  }
  for (const i of out) {
    i.pattern = true
    i.weight = PATTERN_WEIGHT[i.key] ?? 0.9
  }
  return out
}

export function buildInsightReport(reports) {
  const pats = patterns(reports)

  // A pattern already interprets its member markers, so suppress those markers'
  // standalone alerts/watches — surface the interpretation, not five echoes of
  // it. "Good news" (back-in-range) is never suppressed; it's always welcome.
  const claimed = new Set()
  for (const p of pats) for (const id of p.markerIds || []) claimed.add(id)

  const perMarker = []
  for (const m of trackedMarkers(reports)) {
    const s = seriesFor(reports, m.id)
    if (s.length) perMarker.push(...markerInsights(m, s))
  }
  const singles = perMarker.filter(
    (i) => i.severity === 'good' || !(i.markerIds || []).some((id) => claimed.has(id)),
  )

  const all = [...pats, ...singles]

  // impact = base(kind) × clinical weight × trajectory × recency. Newest report
  // gets full recency; older findings decay gently so a fresh shift outranks a
  // year-old one of the same kind.
  const newest = Math.max(0, ...all.map((i) => new Date(i.date || 0).getTime()))
  for (const i of all) {
    const ageMonths = newest ? (newest - new Date(i.date || 0).getTime()) / (1000 * 60 * 60 * 24 * 30) : 0
    const recency = ageMonths <= 6 ? 1 : Math.max(0.6, 1 - (ageMonths - 6) * 0.03)
    const base = BASE[i.pattern ? 'pattern' : i.severity] ?? 1
    i.impact = base * (i.weight ?? 0.5) * (i.trend ?? 1) * recency
  }

  all.sort((a, b) => b.impact - a.impact || new Date(b.date || 0) - new Date(a.date || 0))
  return all
}

// A plain-text summary to bring to a doctor's appointment.
export function visitSummary(reports) {
  const insights = buildInsightReport(reports)
  const top = insights.filter((i) => i.severity === 'alert' || i.severity === 'watch').slice(0, 8)
  const lines = ['My bloodwork — points to discuss', '']
  if (top.length === 0) {
    lines.push('Everything looks stable and in range across my tracked markers.')
  } else {
    for (const i of top) lines.push(`• ${i.title}. ${i.detail}`)
    lines.push('', 'Questions:')
    lines.push('- Are any of these trends a concern at this stage?')
    lines.push('- Should anything be re-tested or monitored more closely?')
    lines.push('- Is there anything in my history I should be doing differently?')
  }
  lines.push('', '(Generated by BloodTrack from my lab history — not medical advice.)')
  return lines.join('\n')
}

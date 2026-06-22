// AI reconciliation layer.
//
// After the deterministic parser runs, some analyte rows can't be matched to a
// known marker. This module decides, for each, whether it's actually a known
// marker printed under an unfamiliar name (reconcile it) or a genuinely new
// analyte (normalize it). It's built behind a swappable `reconcile()` entry
// point: today that's an on-device stand-in (no API, fully testable); later the
// `reconcile()` function can call a real LLM (e.g. via a Supabase Edge Function
// that keeps the API key server-side) without any caller changing.

import { MARKERS } from './catalog.js'

const SR = { đ: 'dj', ž: 'z', š: 's', č: 'c', ć: 'c' }
function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[đžšćč]/g, (c) => SR[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
const tokens = (s) => norm(s).split(' ').filter((t) => t.length >= 2)

// Similarity of an unknown analyte to a candidate marker: word overlap, plus
// bonuses for one name containing the other and for a matching unit.
function score(name, unit, m) {
  const a = new Set(tokens(name))
  const b = new Set(tokens([m.name, ...m.aliases].join(' ')))
  if (a.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  const union = new Set([...a, ...b]).size
  const jaccard = inter / union
  const an = norm(name)
  const bn = norm(m.name)
  const contain = an && bn && (an.includes(bn) || bn.includes(an)) ? 0.4 : 0
  const unitBonus = unit && m.unit && norm(unit) === norm(m.unit) ? 0.15 : 0
  return Math.min(1, jaccard + contain + unitBonus)
}

const cleanName = (s) => String(s).replace(/[™®©*]/g, '').replace(/\s+/g, ' ').trim()

// The on-device stand-in for the AI. Conservative: only claims a match when
// confident, otherwise returns a normalized custom marker.
export function localReconcile(unknowns, known = MARKERS) {
  return unknowns.map((u) => {
    let best = null
    let bestScore = 0
    for (const m of known) {
      const s = score(u.name, u.unit, m)
      if (s > bestScore) {
        bestScore = s
        best = m
      }
    }
    if (best && bestScore >= 0.6) {
      return { name: u.name, matchId: best.id, confidence: +bestScore.toFixed(2) }
    }
    return { name: u.name, matchId: null, custom: { name: cleanName(u.name), panel: 'Other', unit: u.unit || '' } }
  })
}

// Swappable entry point. Async so a network/LLM implementation drops in later.
export async function reconcile(unknowns) {
  return localReconcile(unknowns)
}

// Apply reconciliation results onto parsed data. Pure + testable. Moves a
// matched value/range onto the known marker id (without clobbering a value the
// parser already found there) and drops the custom entry; otherwise updates the
// custom marker's normalized name/unit/panel.
export function applyReconciliation({ values, ranges, markers }, results) {
  const v = { ...values }
  const r = { ...(ranges || {}) }
  const mk = { ...(markers || {}) }
  const knownIds = new Set(MARKERS.map((m) => m.id))
  const matchedIds = []
  for (const res of results) {
    const cid = Object.keys(mk).find((id) => mk[id].name === res.name)
    if (!cid) continue
    if (res.matchId && knownIds.has(res.matchId)) {
      if (v[res.matchId] == null) {
        v[res.matchId] = v[cid]
        if (r[cid]) r[res.matchId] = r[cid]
      }
      delete v[cid]
      delete r[cid]
      delete mk[cid]
      matchedIds.push(res.matchId)
    } else if (res.custom) {
      mk[cid] = {
        name: res.custom.name || mk[cid].name,
        unit: res.custom.unit || mk[cid].unit,
        panel: res.custom.panel || 'Other',
      }
    }
  }
  return { values: v, ranges: r, markers: mk, matchedIds }
}

// Run reconciliation over a parsed report's unknown rows and return the enriched
// data plus the ids the reconciler matched (for a UI hint). Safe no-op when
// there are no unknowns.
export async function enrich(parsed) {
  const unknownIds = Object.keys(parsed.markers || {})
  if (unknownIds.length === 0) return { ...parsed, matchedIds: [] }
  const unknowns = unknownIds.map((id) => ({
    name: parsed.markers[id].name,
    unit: parsed.markers[id].unit,
    value: parsed.values[id],
    range: parsed.ranges?.[id] || null,
  }))
  try {
    const results = await reconcile(unknowns)
    const applied = applyReconciliation(parsed, results)
    return { ...parsed, ...applied }
  } catch {
    return { ...parsed, matchedIds: [] }
  }
}

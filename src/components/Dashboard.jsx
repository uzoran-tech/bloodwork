import { sortByDate, seriesFor } from '../store.js'
import { markerById, statusOf, PANELS } from '../catalog.js'
import { IconBell } from './Icons.jsx'

const TINTS = ['t-rose', 't-teal', 't-lav', 't-amber', 't-blue']
// Kept for Trends/Reports, which import it.
export const panelTint = (panel) => TINTS[PANELS.indexOf(panel) % TINTS.length]

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// Reference summary with units, from the catalog's numeric bounds.
function refSummary(m) {
  if (m.lo != null && m.hi != null) return `Ref ${m.lo}–${m.hi} ${m.unit}`
  if (m.hi != null) return `Ref below ${m.hi} ${m.unit}`
  if (m.lo != null) return `Ref above ${m.lo} ${m.unit}`
  return 'No reference provided'
}

// How far out of range, for ordering worst-first.
const distance = (m, v) =>
  statusOf(m, v) === 'high' ? v / m.hi : statusOf(m, v) === 'low' ? m.lo / Math.max(v, 1e-9) : 0

// A small range-position bar: green band = reference, dot = latest value.
function HomeRangeBar({ m, value }) {
  if (m.lo == null && m.hi == null) return null
  const lo = m.lo ?? Math.min(value, m.hi) * 0.5
  const hi = m.hi ?? Math.max(value, m.lo) * 1.5
  const span = hi - lo || Math.abs(hi) || 1
  const min = lo - span * 0.4
  const max = hi + span * 0.4
  const at = (v) => Math.max(4, Math.min(96, ((v - min) / (max - min)) * 100))
  const target =
    m.lo != null && m.hi != null ? `Target ${m.lo}–${m.hi}` : m.hi != null ? `Target <${m.hi}` : `Target >${m.lo}`
  return (
    <span className="hbar">
      <span className="hbar-track">
        <span className="hbar-band" style={{ left: `${at(lo)}%`, width: `${at(hi) - at(lo)}%` }} />
        <span className="hbar-pin" style={{ left: `${at(value)}%` }} />
        <span className="hbar-pill" style={{ left: `${at(value)}%` }}>
          {value}
        </span>
      </span>
      <span className="hbar-scale">{target}</span>
    </span>
  )
}

// Home insights: change/pattern only, never a plain status restatement.
// Movement is judged against the boundary the value relates to, not a midpoint,
// so one-sided markers (CRP lower-is-better, HDL higher-is-better) read right,
// and in-range drift isn't labeled "Worsened".
function deriveInsights(reports, latest) {
  const cands = []
  for (const id of Object.keys(latest.values)) {
    const m = markerById(id)
    if (!m) continue
    const s = seriesFor(reports, id)
    if (s.length < 2) continue
    const prev = s[s.length - 2].value
    const cur = s[s.length - 1].value
    if (prev === cur) continue
    const pct = Math.abs((cur - prev) / Math.abs(prev)) * 100
    const stPrev = statusOf(m, prev)
    const stCur = statusOf(m, cur)
    let label, tone, tail, salience

    if (stPrev !== 'normal' && stCur === 'normal') {
      label = 'Improved'
      tone = 'good'
      tail = 'back in range'
      salience = 2000 + pct
    } else if (stPrev === 'normal' && stCur !== 'normal') {
      label = 'Worsened'
      tone = 'review'
      tail = 'now needs review'
      salience = 1500 + pct
    } else if (stCur !== 'normal') {
      // Still out of range: closer to the breached bound = better.
      const bound = stCur === 'high' ? m.hi : m.lo
      if (pct < 2) continue
      const closer = Math.abs(cur - bound) < Math.abs(prev - bound)
      label = closer ? 'Improved' : 'Worsened'
      tone = closer ? 'good' : 'review'
      tail = closer ? 'closer to target' : 'further from target'
      salience = 500 + pct
    } else {
      // In range both times: only surface a big move, as a neutral trend.
      if (pct < 15) continue
      label = 'Trend'
      tone = 'neutral'
      tail = null
      salience = pct
    }

    cands.push({
      markerId: m.id,
      m,
      value: cur,
      title: m.name,
      label,
      tone,
      copy: `${prev} → ${cur} ${m.unit}${tail ? `, ${tail}` : ''}`,
      salience,
    })
  }
  cands.sort((a, b) => b.salience - a.salience)
  const items = cands.slice(0, 2)

  // Pattern: where the need-review markers cluster.
  const need = Object.entries(latest.values)
    .map(([id, v]) => ({ m: markerById(id), v }))
    .filter((x) => x.m && statusOf(x.m, x.v) !== 'normal')
  if (need.length >= 2 && items.length < 3) {
    const byPanel = {}
    for (const n of need) byPanel[n.m.panel] = (byPanel[n.m.panel] || 0) + 1
    const [topPanel, cnt] = Object.entries(byPanel).sort((a, b) => b[1] - a[1])[0]
    if (cnt >= 2) {
      items.push({
        markerId: need.find((n) => n.m.panel === topPanel).m.id,
        title: `Most review markers are ${topPanel.toLowerCase()}`,
        tone: 'neutral',
        copy: `${cnt} of ${need.length} markers needing review`,
      })
    }
  }

  if (items.length === 0) {
    const anyId = Object.keys(latest.values)[0]
    if (reports.length < 2) {
      items.push({ markerId: anyId, title: 'Baseline created', tone: 'neutral', copy: 'Future results will show what changed.' })
    } else {
      items.push({ markerId: anyId, title: 'Holding steady', tone: 'good', copy: 'No major shifts since your previous results.' })
    }
  }
  return items.slice(0, 3)
}

export default function Dashboard({ reports, onOpenMarker, onOpenPanel, onViewReport, theme, onToggleTheme }) {
  const sorted = sortByDate(reports)
  const latest = sorted[sorted.length - 1]
  // Placeholder profile name until profile editing exists; matches the home reference.
  const name = (() => {
    try {
      return localStorage.getItem('bloodtrack.name') || 'Zoran'
    } catch {
      return 'Zoran'
    }
  })()

  const entries = Object.entries(latest.values)
    .map(([id, v]) => ({ m: markerById(id), v }))
    .filter((x) => x.m)
  const inRange = entries.filter((x) => statusOf(x.m, x.v) === 'normal')
  const needReview = entries
    .filter((x) => statusOf(x.m, x.v) !== 'normal')
    .sort((a, b) => distance(b.m, b.v) - distance(a.m, a.v))

  const inNames = inRange.map((x) => x.m.name)
  const shownNames = inNames.slice(0, 12)
  const moreNames = inNames.length - shownNames.length
  const inRangeText = shownNames.join(' · ') + (moreNames > 0 ? ` · +${moreNames} more` : '')

  const insights = deriveInsights(reports, latest)

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-avatar">{name[0].toUpperCase()}</div>
        <button className="icon-btn" title="Notifications" aria-label="Notifications">
          <IconBell size={20} />
        </button>
      </header>

      <div className="home-intro">
        <p className="eyebrow">Home</p>
        <h1 className="home-title">Hello, {name}</h1>
        <p className="home-sub">Latest bloodwork</p>
      </div>

      <section className="lr-card">
        <div className="lr-top">
          <div>
            <p className="eyebrow">Latest results</p>
            <h2 className="lr-date">{fmtDate(latest.date)}</h2>
          </div>
          {latest.lab && (
            <span className="lab-pill">
              <strong>{latest.lab}</strong>
              {latest.sample && <small>{latest.sample}</small>}
            </span>
          )}
        </div>

        <div className="count-tiles">
          <div className="count-tile neutral">
            <span>{entries.length}</span>
            <small>Reviewed</small>
          </div>
          <div className="count-tile good">
            <span>{inRange.length}</span>
            <small>In range</small>
          </div>
          <div className="count-tile review">
            <span>{needReview.length}</span>
            <small>Need review</small>
          </div>
        </div>

        {needReview.length > 0 && (
          <div className="lr-section">
            <div className="lr-section-head">
              <strong>Needs attention</strong>
              <span className="count-pill">{needReview.length}</span>
            </div>
            <div className="attn-list">
              {needReview.map(({ m, v }) => {
                const st = statusOf(m, v)
                return (
                  <button key={m.id} className="attn-cell" onClick={() => onOpenMarker(m.id)}>
                    <span className="attn-name">{m.name}</span>
                    <span className={`attn-arrow ${st}`}>{st === 'high' ? '↑' : '↓'}</span>
                    <span className="attn-value">
                      {v} {m.unit}
                    </span>
                    <span className="attn-ref">{refSummary(m)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {inRange.length > 0 && (
          <div className="lr-section">
            <div className="lr-section-head">
              <strong>In range</strong>
              <span className="count-pill">{inRange.length}</span>
            </div>
            <div className="inrange-summary">
              <span className="inrange-check">✓</span>
              <div>
                <h4>
                  {inRange.length} marker{inRange.length === 1 ? '' : 's'} currently within range
                </h4>
                <p>{inRangeText}</p>
              </div>
            </div>
          </div>
        )}

        <button className="lr-cta" onClick={onViewReport}>
          View full report <span>›</span>
        </button>
      </section>

      <div className="home-insights">
        <div className="ins-head">
          <strong>Trends &amp; insights</strong>
          <span className="count-pill">{insights.length}</span>
        </div>
        <div className="ins-card">
          {insights.map((ins, i) => (
            <button key={i} className="ins-item" onClick={() => onOpenMarker(ins.markerId)}>
              <span className="ins-top">
                <strong>{ins.title}</strong>
                {ins.label && <em className={`ins-label ${ins.tone}`}>{ins.label}</em>}
              </span>
              {ins.m && (ins.m.lo != null || ins.m.hi != null) && <HomeRangeBar m={ins.m} value={ins.value} />}
              <span className="ins-copy">{ins.copy}</span>
            </button>
          ))}
          <button className="ins-cta" onClick={() => onOpenPanel(null)}>
            View trends <span>›</span>
          </button>
        </div>
      </div>

      <div className="pad">
        <p className="disclaimer">
          Counts cover the markers in your latest report against general adult reference ranges; your
          lab's printed range takes precedence. This is not medical advice — discuss results with your
          doctor.
        </p>
      </div>
    </div>
  )
}

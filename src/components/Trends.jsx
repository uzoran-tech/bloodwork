import { useState } from 'react'
import { trackedMarkers, seriesFor, buildInsights } from '../store.js'
import { PANELS, statusOf, midOf } from '../catalog.js'
import { Sparkline } from './Charts.jsx'
import { panelTint } from './Dashboard.jsx'

// In range / watch / action: out-of-range within 20% of the bound is "watch",
// beyond that "action".
function severity(m, v) {
  if (m.hi != null && v > m.hi) return v > m.hi * 1.2 ? 'action' : 'watch'
  if (m.lo != null && v < m.lo) return v < m.lo * 0.8 ? 'action' : 'watch'
  return 'inrange'
}

const pctChange = (s) => {
  if (s.length < 2) return null
  const prev = s[s.length - 2].value
  if (prev === 0) return null
  return ((s[s.length - 1].value - prev) / Math.abs(prev)) * 100
}

const spanLabel = (s) => {
  if (s.length < 2) return null
  const w = Math.max(1, Math.round((new Date(s[s.length - 1].date) - new Date(s[0].date)) / (7 * 86400000)))
  if (w < 10) return `${w}w`
  if (w < 104) return `${Math.round(w / 4.33)}mo`
  return `${w < 260 ? (w / 52).toFixed(1) : Math.round(w / 52)}y`
}

// Color encodes meaning, not direction: green when the change moves the value
// toward mid-range, red when away — a rising "good" marker should look good.
const deltaTone = (m, s) => {
  if (s.length < 2) return 'flat'
  const mid = midOf(m)
  const latest = s[s.length - 1].value
  const prev = s[s.length - 2].value
  return Math.abs(latest - mid) <= Math.abs(prev - mid) ? 'good' : 'bad'
}

function Delta({ value, tone }) {
  if (value == null) return null
  const flat = Math.abs(value) < 0.5
  const arrow = flat ? '·' : value > 0 ? '▲' : '▼'
  return (
    <span className={`delta ${flat ? 'flat' : tone}`}>
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export default function Trends({ reports, onOpenMarker, initialPanel }) {
  const [panel, setPanel] = useState(initialPanel || 'ALL')
  const [sevFilter, setSevFilter] = useState(null)
  const tracked = trackedMarkers(reports)
  const insights = buildInsights(reports)

  const rows = tracked
    .map((m) => {
      const s = seriesFor(reports, m.id)
      if (s.length === 0) return null
      const latest = s[s.length - 1]
      return {
        m,
        s,
        latest,
        status: statusOf(m, latest.value),
        sev: severity(m, latest.value),
        delta: pctChange(s),
      }
    })
    .filter(Boolean)

  const tally = { inrange: 0, watch: 0, action: 0 }
  for (const r of rows) tally[r.sev] += 1

  // Focus: the furthest-out-of-range marker; movers: biggest recent % changes.
  const out = rows.filter((r) => r.sev !== 'inrange')
  const focus = out.sort((a, b) => {
    const dist = (r) =>
      r.status === 'high' ? r.latest.value / r.m.hi : r.m.lo / Math.max(r.latest.value, 1e-9)
    return dist(b) - dist(a)
  })[0]
  const focusNote = focus && insights.find((i) => i.markerId === focus.m.id)

  const movers = rows
    .filter((r) => r.delta != null && r !== focus)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4)
    .filter((r) => Math.abs(r.delta) >= 5)

  const panels = PANELS.filter((p) => tracked.some((m) => m.panel === p))
  const visible = rows.filter(
    (r) => (panel === 'ALL' || r.m.panel === panel) && (!sevFilter || r.sev === sevFilter)
  )
  const toggleSev = (sev) => setSevFilter(sevFilter === sev ? null : sev)

  return (
    <div className="trends pad">
      <div className="trends-head">
        <div>
          <p className="eyebrow">Your body, over time</p>
          <h2>Trends</h2>
        </div>
      </div>

      <div className="tally-row">
        {[
          ['inrange', 'In range'],
          ['watch', 'Watch'],
          ['action', 'Action'],
        ].map(([sev, label]) => (
          <button
            key={sev}
            className={`tally ${sev} ${sevFilter === sev ? 'active' : ''}`}
            onClick={() => toggleSev(sev)}
            title={`Filter the list to ${label.toLowerCase()} markers`}
          >
            <span className="tally-label">
              <span className="dot" /> {label}
            </span>
            <strong>{tally[sev]}</strong>
          </button>
        ))}
      </div>
      {sevFilter && (
        <p className="filter-hint">
          Showing {visible.length} {sevFilter === 'inrange' ? 'in-range' : sevFilter} marker
          {visible.length === 1 ? '' : 's'} —{' '}
          <button className="section-link" onClick={() => setSevFilter(null)}>
            clear filter
          </button>
        </p>
      )}

      {focus && (
        <button className="focus-card" onClick={() => onOpenMarker(focus.m.id)}>
          <div className="focus-pills">
            <span className="pill-outline">Focus right now</span>
            <span className={`pill-tone ${focus.status}`}>
              {focus.status === 'high' ? 'Elevated' : 'Low'}
            </span>
          </div>
          <div className="focus-row">
            <div>
              <h4>{focus.m.name}</h4>
              <span className="focus-sub">
                {focus.m.panel} · {focus.s.length} tests
              </span>
            </div>
            <div className="focus-value">
              <strong>{focus.latest.value}</strong> <small>{focus.m.unit}</small>
              {focus.delta != null && Math.abs(focus.delta) >= 0.5 && (
                <div className={`focus-delta ${deltaTone(focus.m, focus.s)}`}>
                  {focus.delta > 0 ? '▲' : '▼'} {Math.abs(focus.delta).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
          <Sparkline series={focus.s} marker={focus.m} width={320} height={74} className="focus-chart" />
          {focusNote && (
            <div className="focus-note">
              <span className="insight-avatar">✨</span>
              {focusNote.text.charAt(0).toUpperCase() + focusNote.text.slice(1)}
            </div>
          )}
        </button>
      )}

      {movers.length > 0 && (
        <>
          <div className="section-head">
            <strong>Top movers</strong>
            <span className="muted">since previous test</span>
          </div>
          <div className="mover-row">
            {movers.map((r) => (
              <button
                key={r.m.id}
                className={`mover-card ${panelTint(r.m.panel)}`}
                onClick={() => onOpenMarker(r.m.id)}
              >
                <span className="mover-cat">{r.m.panel}</span>
                <strong>{r.m.name}</strong>
                <div className="mover-value">
                  {r.latest.value} <small>{r.m.unit}</small>
                </div>
                <Sparkline series={r.s} marker={r.m} width={134} height={30} />
                <div className="mover-foot">
                  <Delta value={r.delta} tone={deltaTone(r.m, r.s)} />
                  {spanLabel(r.s) != null && <span className="span">{spanLabel(r.s)}</span>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="section-head">
        <strong>All markers</strong>
      </div>
      <div className="pill-row">
        <button className={panel === 'ALL' ? 'active' : ''} onClick={() => setPanel('ALL')}>
          All
        </button>
        {panels.map((p) => (
          <button key={p} className={panel === p ? 'active' : ''} onClick={() => setPanel(p)}>
            {p}
          </button>
        ))}
      </div>
      <div className="marker-list">
        {visible.map((r, i) => (
          <button
            key={r.m.id}
            className="marker-row"
            style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
            onClick={() => onOpenMarker(r.m.id)}
          >
            <span className={`marker-chip ${panelTint(r.m.panel)}`}>
              <Sparkline series={r.s.slice(-8)} marker={r.m} width={36} height={20} />
            </span>
            <span className="marker-row-main">
              <span className="marker-row-name">
                <strong>{r.m.name}</strong>
                <span className={`badge ${r.status}`}>{r.status}</span>
              </span>
              <span className="marker-row-sub">
                {r.m.panel} · {r.m.unit}
              </span>
            </span>
            <span className="marker-row-val">
              <strong>{r.latest.value}</strong>
              <Delta value={r.delta} tone={deltaTone(r.m, r.s)} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

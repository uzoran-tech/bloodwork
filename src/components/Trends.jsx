import { useState } from 'react'
import { trackedMarkers, seriesFor, buildInsights } from '../store.js'
import { PANELS, statusOf } from '../catalog.js'
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

const weeksSpan = (s) => {
  if (s.length < 2) return null
  const ms = new Date(s[s.length - 1].date) - new Date(s[0].date)
  return Math.max(1, Math.round(ms / (7 * 86400000)))
}

function Delta({ value }) {
  if (value == null) return null
  const cls = Math.abs(value) < 0.5 ? 'flat' : value > 0 ? 'up' : 'down'
  const arrow = Math.abs(value) < 0.5 ? '·' : value > 0 ? '▲' : '▼'
  return (
    <span className={`delta ${cls}`}>
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export default function Trends({ reports, onOpenMarker, initialPanel }) {
  const [panel, setPanel] = useState(initialPanel || 'ALL')
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
  const visible = rows.filter((r) => panel === 'ALL' || r.m.panel === panel)

  return (
    <div className="trends pad">
      <div className="trends-head">
        <div>
          <p className="eyebrow">Your body, over time</p>
          <h2>Trends</h2>
        </div>
      </div>

      <div className="tally-row">
        <div className="tally inrange">
          <span className="tally-label">
            <span className="dot" /> In range
          </span>
          <strong>{tally.inrange}</strong>
        </div>
        <div className="tally watch">
          <span className="tally-label">
            <span className="dot" /> Watch
          </span>
          <strong>{tally.watch}</strong>
        </div>
        <div className="tally action">
          <span className="tally-label">
            <span className="dot" /> Action
          </span>
          <strong>{tally.action}</strong>
        </div>
      </div>

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
                <div className={`focus-delta ${focus.delta > 0 ? 'up' : 'down'}`}>
                  {focus.delta > 0 ? '▲' : '▼'} {Math.abs(focus.delta).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
          <Sparkline series={focus.s} marker={focus.m} width={320} height={74} className="focus-chart" />
          {focusNote && (
            <div className="focus-note">
              <span className="insight-avatar">✨</span>
              {focusNote.text}
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
                  <Delta value={r.delta} />
                  {weeksSpan(r.s) != null && <span className="span">{weeksSpan(r.s)}w</span>}
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
              {r.m.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}
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
              <Delta value={r.delta} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

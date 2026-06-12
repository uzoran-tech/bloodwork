import { useEffect, useState } from 'react'
import { rangeStats, buildInsights, sortByDate, seriesFor, trackedMarkers } from '../store.js'
import { PANELS, PANEL_ICONS, statusOf } from '../catalog.js'

const TINTS = ['t-rose', 't-teal', 't-lav', 't-amber', 't-blue']
export const panelTint = (panel) => TINTS[PANELS.indexOf(panel) % TINTS.length]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard({ reports, onOpenMarker, onOpenPanel, theme, onToggleTheme }) {
  const { inRange, total, flags } = rangeStats(reports)
  const insights = buildInsights(reports)
  const pct = total ? Math.round((inRange / total) * 100) : 0

  // Same score computed without the newest report = "vs last test".
  const sorted = sortByDate(reports)
  let delta = null
  if (sorted.length > 1) {
    const prev = rangeStats(sorted.slice(0, -1))
    if (prev.total > 0) delta = pct - Math.round((prev.inRange / prev.total) * 100)
  }

  const scoreBadge = pct >= 85 ? 'optimal' : pct >= 60 ? 'good' : 'attention'
  const headline =
    flags.length === 0
      ? 'Everything is in range today'
      : `${flags.length} marker${flags.length > 1 ? 's' : ''} could use a look`

  // Sweep the ring from 0 to the real value on mount.
  const [shownPct, setShownPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setShownPct(pct), 60)
    return () => clearTimeout(t)
  }, [pct])

  const tracked = trackedMarkers(reports)
  const panels = PANELS.map((panel) => {
    const markers = tracked.filter((m) => m.panel === panel)
    if (markers.length === 0) return null
    let status = 'good'
    for (const m of markers) {
      const s = seriesFor(reports, m.id)
      if (s.length && statusOf(m, s[s.length - 1].value) !== 'normal') status = 'attention'
    }
    return { panel, count: markers.length, status }
  }).filter(Boolean)

  const topInsight = insights[0]

  return (
    <div className="dashboard">
      <div className="hero">
        <div className="hero-top">
          <div>
            <p className="hero-greet">{greeting()}</p>
            <h2>{headline}</h2>
          </div>
          <button
            className="avatar-btn"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            onClick={onToggleTheme}
          >
            <span className="avatar-face">{theme === 'light' ? '☺' : '☾'}</span>
          </button>
        </div>

        <div className="score-card">
          <div>
            <p className="score-label">In-range score</p>
            <div className="score-value">
              {pct}
              <small>/100</small>
            </div>
            <div className="score-meta">
              <span className={`badge ${scoreBadge}`}>{scoreBadge}</span>
              {delta != null && delta !== 0 && (
                <span>
                  {delta > 0 ? '+' : ''}
                  {delta} vs last test
                </span>
              )}
            </div>
          </div>
          <div className="ring" style={{ '--pct': shownPct }}>
            <span>
              {inRange}/{total}
            </span>
          </div>
        </div>
      </div>

      <div className="pad">
        <div className="section-head">
          <strong>Health categories</strong>
          <button className="section-link" onClick={() => onOpenPanel(null)}>
            See all
          </button>
        </div>
        <div className="cat-grid">
          {panels.map((p, i) => (
            <button
              key={p.panel}
              className={`cat-card ${panelTint(p.panel)}`}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => onOpenPanel(p.panel)}
            >
              <span className="cat-icon">{PANEL_ICONS[p.panel]}</span>
              <span>
                <strong>{p.panel}</strong>
                <span className="cat-status">{p.status === 'good' ? 'Good' : 'Attention'}</span>
              </span>
            </button>
          ))}
        </div>

        {topInsight && (
          <>
            <div className="section-head">
              <strong>Insight</strong>
            </div>
            <div className="insight-hero" onClick={() => onOpenMarker(topInsight.markerId)}>
              <span className="insight-avatar">✨</span>
              <div>
                <div className="insight-hero-head">
                  <strong>BloodTrack · Insight</strong>
                  <span className="badge new">New</span>
                </div>
                <p>{topInsight.text}</p>
                <span className="open-link">Open marker →</span>
              </div>
            </div>
          </>
        )}

        {insights.length > 1 && (
          <ul className="insight-list" style={{ marginTop: 10 }}>
            {insights.slice(1, 7).map((ins, i) => (
              <li key={i} className={`insight ${ins.tone}`} onClick={() => onOpenMarker(ins.markerId)}>
                {ins.text}
              </li>
            ))}
          </ul>
        )}

        {flags.length > 0 && (
          <>
            <div className="section-head">
              <strong>Needs attention</strong>
              <button className="section-link" onClick={() => onOpenPanel(null)}>
                View all
              </button>
            </div>
            <div className="flag-list">
              {flags.map((f) => (
                <button key={f.marker.id} className="flag-row" onClick={() => onOpenMarker(f.marker.id)}>
                  <span className={`flag-bar ${f.status}`} />
                  <span>
                    <span className="flag-name">{f.marker.name}</span>
                    <span className="flag-sub">
                      {f.status === 'high' ? 'Above' : 'Below'}{' '}
                      {f.status === 'high' ? f.marker.hi : f.marker.lo} target
                    </span>
                  </span>
                  <span className="flag-value">
                    <strong>{f.value}</strong>
                    <small>{f.marker.unit}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="disclaimer">
          Reference ranges are general adult values; your lab's printed range takes precedence. This
          is not medical advice — discuss results with your doctor.
        </p>
      </div>
    </div>
  )
}

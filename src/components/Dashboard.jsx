import { useEffect, useState } from 'react'
import { rangeStats, buildInsights, sortByDate, seriesFor } from '../store.js'
import { markerById } from '../catalog.js'
import { Sparkline } from './Charts.jsx'

export default function Dashboard({ reports, onOpenMarker }) {
  const { inRange, total, flags } = rangeStats(reports)
  const insights = buildInsights(reports)
  const sorted = sortByDate(reports)
  const latest = sorted[sorted.length - 1]
  const pct = total ? Math.round((inRange / total) * 100) : 0

  // Sweep the ring from 0 to the real value on mount.
  const [shownPct, setShownPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setShownPct(pct), 60)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="dashboard">
      <section className="stat-row">
        <div className="stat-card big">
          <div className="ring" style={{ '--pct': shownPct }}>
            <span>{pct}%</span>
          </div>
          <div>
            <strong>
              {inRange} of {total} markers in range
            </strong>
            <span className="muted">latest results per marker</span>
          </div>
        </div>
        <div className="stat-card">
          <strong>{reports.length}</strong>
          <span className="muted">reports</span>
        </div>
        <div className="stat-card">
          <strong>{latest.date}</strong>
          <span className="muted">last test</span>
        </div>
      </section>

      {flags.length > 0 && (
        <section>
          <h3>
            <span className="h3-icon">⚠️</span> Needs attention
          </h3>
          <div className="flag-list">
            {flags.map((f) => (
              <button key={f.marker.id} className="flag-row" onClick={() => onOpenMarker(f.marker.id)}>
                <span className={`badge ${f.status}`}>{f.status}</span>
                <span className="flag-name">{f.marker.name}</span>
                <span className="flag-value">
                  {f.value} {f.marker.unit}
                </span>
                <Sparkline series={seriesFor(reports, f.marker.id)} marker={f.marker} width={90} height={28} />
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3>
          <span className="h3-icon">✨</span> Insights
        </h3>
        {insights.length === 0 ? (
          <p className="muted">Nothing notable yet — add more reports to unlock trend insights.</p>
        ) : (
          <ul className="insight-list">
            {insights.slice(0, 8).map((ins, i) => (
              <li key={i} className={`insight ${ins.tone}`} onClick={() => onOpenMarker(ins.markerId)}>
                {ins.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="disclaimer">
        Reference ranges are general adult values; your lab's printed range takes precedence. This is
        not medical advice — discuss results with your doctor.
      </p>
    </div>
  )
}

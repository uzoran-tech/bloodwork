import { trackedMarkers, seriesFor } from '../store.js'
import { PANELS, PANEL_ICONS, statusOf } from '../catalog.js'
import { Sparkline } from './Charts.jsx'

export default function Trends({ reports, onOpenMarker }) {
  const tracked = trackedMarkers(reports)

  return (
    <div className="trends">
      {PANELS.map((panel) => {
        const markers = tracked.filter((m) => m.panel === panel)
        if (markers.length === 0) return null
        return (
          <section key={panel}>
            <h3>
              <span className="h3-icon">{PANEL_ICONS[panel]}</span> {panel}
            </h3>
            <div className="marker-grid">
              {markers.map((m, i) => {
                const s = seriesFor(reports, m.id)
                const latest = s[s.length - 1]
                const st = statusOf(m, latest.value)
                const first = s[0]
                const delta = s.length > 1 && first.value !== 0 ? ((latest.value - first.value) / Math.abs(first.value)) * 100 : null
                return (
                  <button
                    key={m.id}
                    className="marker-card"
                    style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
                    onClick={() => onOpenMarker(m.id)}
                  >
                    <div className="marker-card-head">
                      <span className="marker-name">{m.name}</span>
                      <span className={`badge ${st}`}>{st}</span>
                    </div>
                    <div className="marker-value">
                      {latest.value} <small>{m.unit}</small>
                    </div>
                    <Sparkline series={s} marker={m} width={150} height={34} />
                    <div className="marker-foot muted">
                      {s.length} tests
                      {delta != null && (
                        <span> · {delta > 0 ? '+' : ''}{delta.toFixed(0)}% all-time</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

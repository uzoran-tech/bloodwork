import { seriesFor } from '../store.js'
import { markerById, statusOf, rangeLabel, PANEL_ICONS } from '../catalog.js'
import { INFO } from '../info.js'
import { TrendChart } from './Charts.jsx'
import { IconClose } from './Icons.jsx'

export default function MarkerDetail({ markerId, reports, onClose }) {
  const m = markerById(markerId)
  const s = seriesFor(reports, markerId)
  if (!m || s.length === 0) return null
  const latest = s[s.length - 1]
  const values = s.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((t, v) => t + v, 0) / values.length
  const first = s[0]
  const delta = s.length > 1 && first.value !== 0 ? ((latest.value - first.value) / Math.abs(first.value)) * 100 : null

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div>
            <h2>{m.name}</h2>
            <span className="muted">
              {PANEL_ICONS[m.panel]} {m.panel} · reference {rangeLabel(m)} {m.unit}
            </span>
          </div>
          <button className="icon-btn" title="Close" onClick={onClose}>
            <IconClose size={18} />
          </button>
        </div>

        <div className="sheet-reading">
          <div>
            <div className="big-value">
              {latest.value} <small>{m.unit}</small>
            </div>
            <span className="muted">Last reading · {latest.date}</span>
          </div>
          <span className={`badge ${statusOf(m, latest.value)}`}>{statusOf(m, latest.value)}</span>
        </div>

        <TrendChart series={s} marker={m} />

        <div className="stat-row">
          <div className="stat-card">
            <span className="stat-label">Avg</span>
            <strong>{avg.toFixed(avg >= 100 ? 0 : 1)}</strong>
            <span className="stat-unit">{m.unit}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Max</span>
            <strong>{max}</strong>
            <span className="stat-unit">{m.unit}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Min</span>
            <strong>{min}</strong>
            <span className="stat-unit">{m.unit}</span>
          </div>
          {delta != null && (
            <div className="stat-card">
              <span className="stat-label">All-time</span>
              <strong>
                {delta > 0 ? '+' : ''}
                {delta.toFixed(0)}%
              </strong>
              <span className="stat-unit">vs first test</span>
            </div>
          )}
        </div>

        {INFO[m.id] && (
          <div className="learn">
            <h3>
              <span className="h3-icon">📖</span> What is {m.name}?
            </h3>
            <p className="learn-what">{INFO[m.id].what}</p>
            <h3>
              <span className="h3-icon">💡</span> Good to know
            </h3>
            <ul className="learn-tips">
              {INFO[m.id].tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
            <p className="disclaimer">
              General education, not medical advice — always interpret results with your doctor.
            </p>
          </div>
        )}

        <h3>
          <span className="h3-icon">🗓️</span> History
        </h3>
        <table className="history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...s].reverse().map((p) => (
              <tr key={p.date}>
                <td>{p.date}</td>
                <td>
                  {p.value} {m.unit}
                </td>
                <td>
                  <span className={`badge ${statusOf(m, p.value)}`}>{statusOf(m, p.value)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

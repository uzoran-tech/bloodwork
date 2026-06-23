import { useState } from 'react'
import { seriesFor } from '../store.js'
import { markerById, statusOf, rangeLabel, refRange, PANEL_ICONS } from '../catalog.js'
import { removeReading } from '../dataStore.js'
import { webLinks } from '../links.js'
import { INFO } from '../info.js'
import { TrendChart } from './Charts.jsx'
import { IconClose, IconTrash } from './Icons.jsx'

// Where the latest value sits relative to the reference band, as a bar with a
// dot — faster to read than comparing numbers. One-sided ranges get a soft
// synthetic far bound just for positioning.
function RangeBar({ m, value, range }) {
  const { lo: rlo, hi: rhi } = refRange(m, range)
  if (rlo == null && rhi == null) return null
  const lo = rlo ?? Math.min(value, rhi) * 0.5
  const hi = rhi ?? Math.max(value, rlo) * 1.5
  const span = hi - lo || Math.abs(hi) || 1
  const min = lo - span * 0.35
  const max = hi + span * 0.35
  const at = (v) => Math.max(1.5, Math.min(98.5, ((v - min) / (max - min)) * 100))
  return (
    <div className="range-bar">
      <div className="range-track">
        <div className="range-band" style={{ left: `${at(lo)}%`, width: `${at(hi) - at(lo)}%` }} />
        <div className={`range-dot ${statusOf(m, value, range)}`} style={{ left: `${at(value)}%` }} />
      </div>
      <div className="range-labels">
        <span>{rlo != null ? `low < ${rlo}` : ''}</span>
        <span>{rhi != null ? `high > ${rhi}` : ''}</span>
      </div>
    </div>
  )
}

export default function MarkerDetail({ markerId, reports, onClose, refresh }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const m = markerById(markerId)
  const s = seriesFor(reports, markerId)
  if (!m || s.length === 0) return null

  async function deleteReading(point) {
    if (!confirm(`Delete the ${point.date} reading for ${m.name}?`)) return
    setBusy(true)
    setError(null)
    try {
      await removeReading(point.id, markerId)
      // Last one for this marker — nothing left to show.
      if (s.length <= 1) onClose()
      else await refresh()
    } catch (err) {
      setError(err?.message || "Couldn't delete that reading.")
    } finally {
      setBusy(false)
    }
  }
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
              {PANEL_ICONS[m.panel]} {m.panel} · reference {rangeLabel(m, latest.range)} {m.unit}
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
          <span className={`badge ${statusOf(m, latest.value, latest.range)}`}>{statusOf(m, latest.value, latest.range)}</span>
        </div>

        <RangeBar m={m} value={latest.value} range={latest.range} />

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

        <div className="learn">
          <h3>
            <span className="h3-icon">🔗</span> Learn more on the web
          </h3>
          <ul className="sources">
            {webLinks(m).map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  <span className="src-main">
                    <strong>{src.title}</strong>
                    <small>{src.source}</small>
                  </span>
                  <span className="src-arrow">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="disclaimer">Opens the article in your browser.</p>
        </div>

        <h3>
          <span className="h3-icon">🗓️</span> History
        </h3>
        {error && <p className="feedback warn">{error}</p>}
        <table className="history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Value</th>
              <th>Status</th>
              <th aria-label="Delete"></th>
            </tr>
          </thead>
          <tbody>
            {[...s].reverse().map((p) => (
              <tr key={p.id || p.date}>
                <td>{p.date}</td>
                <td>
                  {p.value} {m.unit}
                </td>
                <td>
                  <span className={`badge ${statusOf(m, p.value, p.range)}`}>{statusOf(m, p.value, p.range)}</span>
                </td>
                <td>
                  <button
                    className="row-del"
                    title="Delete this reading"
                    onClick={() => deleteReading(p)}
                    disabled={busy}
                  >
                    <IconTrash size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

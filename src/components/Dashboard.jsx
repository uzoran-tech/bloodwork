import { useState } from 'react'
import { trackedMarkers, seriesFor } from '../store.js'
import { statusOf, PANELS, PANEL_ICONS } from '../catalog.js'
import {
  IconFlask,
  IconCheckCircle,
  IconArrowUp,
  IconArrowDown,
  IconInfo,
  IconSearch,
} from './Icons.jsx'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const ST = {
  normal: { label: 'In range', Icon: IconCheckCircle },
  high: { label: 'High', Icon: IconArrowUp },
  low: { label: 'Low', Icon: IconArrowDown },
}

function refLine(m) {
  if (m.lo != null && m.hi != null) return `Ref. ${m.lo} - ${m.hi}`
  if (m.hi != null) return `Ref. < ${m.hi}`
  if (m.lo != null) return `Ref. > ${m.lo}`
  return 'No reference range'
}

function MarkerRow({ m, v, date, st, onOpen }) {
  const { label, Icon } = ST[st]
  return (
    <button className="mk-row" onClick={() => onOpen(m.id)}>
      <span className="mk-left">
        <span className="mk-name">{m.name}</span>
        <span className="mk-meta">
          <span className={`mk-pill ${st}`}>
            <Icon size={14} /> {label}
          </span>
          <span className="mk-date">{fmtDate(date)}</span>
        </span>
      </span>
      <span className="mk-right">
        <span className={`mk-value ${st}`}>
          {v} <small>{m.unit}</small>
        </span>
        <span className="mk-ref">{refLine(m)}</span>
      </span>
    </button>
  )
}

export default function Dashboard({ reports, onOpenMarker }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all') // all | in | out

  const name = (() => {
    try {
      return localStorage.getItem('bloodtrack.name') || 'Zoran'
    } catch {
      return 'Zoran'
    }
  })()

  // Every marker ever tracked, shown with its most-recent value + date.
  const rows = trackedMarkers(reports).map((m) => {
    const s = seriesFor(reports, m.id)
    const last = s[s.length - 1]
    return { m, v: last.value, date: last.date, st: statusOf(m, last.value) }
  })

  const total = rows.length
  const inN = rows.filter((r) => r.st === 'normal').length
  const outN = total - inN

  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    if (status === 'in' && r.st !== 'normal') return false
    if (status === 'out' && r.st === 'normal') return false
    if (q && !r.m.name.toLowerCase().includes(q)) return false
    return true
  })

  const groups = PANELS.map((panel) => ({
    panel,
    items: filtered.filter((r) => r.m.panel === panel),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="home">
      <div className="home-top">
        <div className="home-avatar">{name[0].toUpperCase()}</div>
        <div className="home-greet">
          <h1 className="home-title">Hello, {name}</h1>
          <p className="home-sub">All your tracked markers</p>
        </div>
      </div>

      <div className="report-sheet">
        <div className="sheet-summary">
          <div className="stat-summary" role="group" aria-label="Filter by status">
            <button
              className={`stat-col all ${status === 'all' ? 'active' : ''}`}
              onClick={() => setStatus('all')}
            >
              <span className="stat-ic blue">
                <IconFlask size={18} />
              </span>
              <span className="stat-tx">
                <small>Markers</small>
                <strong>{total}</strong>
              </span>
            </button>
            <button
              className={`stat-col in ${status === 'in' ? 'active' : ''}`}
              onClick={() => setStatus('in')}
            >
              <span className="stat-ic green">
                <IconCheckCircle size={18} />
              </span>
              <span className="stat-tx">
                <small>In range</small>
                <strong className="green">{inN}</strong>
              </span>
            </button>
            <button
              className={`stat-col out ${status === 'out' ? 'active' : ''}`}
              onClick={() => setStatus('out')}
            >
              <span className="stat-ic red">
                <IconArrowUp size={18} />
              </span>
              <span className="stat-tx">
                <small>Out of range</small>
                <strong className="red">{outN}</strong>
              </span>
            </button>
          </div>

          <div className="controls">
            <div className="search-bar">
              <IconSearch size={18} />
              <input
                type="search"
                placeholder="Search markers"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="mk-empty">No markers match.</p>
        ) : (
          groups.map((g) => (
            <div className="result-group" key={g.panel}>
              <div className="group-head">
                <span className="group-title">
                  <span className="group-ico">{PANEL_ICONS[g.panel]}</span> {g.panel}
                </span>
                <span className="group-count">{g.items.length}</span>
              </div>
              {g.items.map((r) => (
                <MarkerRow key={r.m.id} {...r} onOpen={onOpenMarker} />
              ))}
            </div>
          ))
        )}

        <div className="sheet-note">
          <IconInfo size={16} />
          <span>
            Each marker shows its most recent result and the date it was drawn. Reference intervals
            are general adult values; interpret results with your doctor — not medical advice.
          </span>
        </div>
      </div>
    </div>
  )
}

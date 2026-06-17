import { useState } from 'react'
import { sortByDate } from '../store.js'
import { markerById, statusOf } from '../catalog.js'
import { IconFlask, IconCheckCircle, IconArrowUp, IconArrowDown, IconInfo, IconVial } from './Icons.jsx'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const ST = {
  normal: { label: 'In range', Icon: IconCheckCircle },
  high: { label: 'High', Icon: IconArrowUp },
  low: { label: 'Low', Icon: IconArrowDown },
}

// Reference line, units sit beside the value.
function refLine(m) {
  if (m.lo != null && m.hi != null) return `Ref. ${m.lo} - ${m.hi}`
  if (m.hi != null) return `Ref. < ${m.hi}`
  if (m.lo != null) return `Ref. > ${m.lo}`
  return 'No reference range'
}

const distance = (m, v) =>
  statusOf(m, v) === 'high' ? v / m.hi : statusOf(m, v) === 'low' ? m.lo / Math.max(v, 1e-9) : 0

function MarkerRow({ m, v, onOpen }) {
  const st = statusOf(m, v)
  const { label, Icon } = ST[st]
  return (
    <button className="mk-row" onClick={() => onOpen(m.id)}>
      <span className="mk-left">
        <span className="mk-name">{m.name}</span>
        <span className={`mk-pill ${st}`}>
          <Icon size={14} /> {label}
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
  const [filter, setFilter] = useState('all') // all | out | in
  const sorted = sortByDate(reports)
  const latest = sorted[sorted.length - 1]
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
  const outRange = entries
    .filter((x) => statusOf(x.m, x.v) !== 'normal')
    .sort((a, b) => distance(b.m, b.v) - distance(a.m, a.v))

  const visible = filter === 'out' ? outRange : filter === 'in' ? inRange : entries

  return (
    <div className="home">
      <div className="home-top">
        <div className="home-avatar">{name[0].toUpperCase()}</div>
        <div className="home-greet">
          <h1 className="home-title">Hello, {name}</h1>
          <p className="home-sub">Your latest bloodwork</p>
        </div>
      </div>

      <div className="report-sheet">
        <div className="sheet-summary">
          <p className="eyebrow">Latest results</p>
          <h2 className="lr-date">{fmtDate(latest.date)}</h2>
          {(latest.sample || latest.lab) && (
            <p className="sample-line">
              <IconVial size={15} />
              {latest.sample ? (
                <>
                  Sample: <strong>{latest.sample}</strong>
                </>
              ) : (
                'Lab report'
              )}
              {latest.lab && <span className="sample-lab">· {latest.lab}</span>}
            </p>
          )}

          <div className="stat-summary">
            <div className="stat-col">
              <span className="stat-ic blue">
                <IconFlask size={18} />
              </span>
              <span className="stat-tx">
                <small>Total markers</small>
                <strong>{entries.length}</strong>
              </span>
            </div>
            <div className="stat-col">
              <span className="stat-ic green">
                <IconCheckCircle size={18} />
              </span>
              <span className="stat-tx">
                <small>In range</small>
                <strong className="green">{inRange.length}</strong>
              </span>
            </div>
            <div className="stat-col">
              <span className="stat-ic red">
                <IconArrowUp size={18} />
              </span>
              <span className="stat-tx">
                <small>Out of range</small>
                <strong className="red">{outRange.length}</strong>
              </span>
            </div>
          </div>

          <div className="filter-chips">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              All ({entries.length})
            </button>
            <button className={filter === 'out' ? 'active' : ''} onClick={() => setFilter('out')}>
              Out of range ({outRange.length})
            </button>
            <button className={filter === 'in' ? 'active' : ''} onClick={() => setFilter('in')}>
              In range ({inRange.length})
            </button>
          </div>
        </div>

        <div className="mk-list">
          {visible.map(({ m, v }) => (
            <MarkerRow key={m.id} m={m} v={v} onOpen={onOpenMarker} />
          ))}
          {visible.length === 0 && <p className="mk-empty">No markers in this filter.</p>}
        </div>

        <div className="sheet-note">
          <IconInfo size={16} />
          <span>
            Reference intervals are general adult values; your lab's printed range takes precedence.
            Interpret results together with your doctor — this is not medical advice.
          </span>
        </div>
      </div>
    </div>
  )
}

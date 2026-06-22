import { useState } from 'react'
import { trackedMarkers, seriesFor } from '../store.js'
import { statusOf, refRange, PANELS, PANEL_ICONS, GROUPS } from '../catalog.js'
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

function refLine(m, range) {
  const { lo, hi } = refRange(m, range)
  if (lo != null && hi != null) return `Ref. ${lo} - ${hi}`
  if (hi != null) return `Ref. < ${hi}`
  if (lo != null) return `Ref. > ${lo}`
  return 'No reference range'
}

// One marker row. `label` overrides the displayed name (used by group cards to
// show the condition, e.g. "Fasting", instead of the full marker name).
function MarkerRow({ m, v, date, st, range, onOpen, label: nameLabel, sub }) {
  const { label, Icon } = ST[st]
  return (
    <button className={`mk-row ${sub ? 'mk-subrow' : ''}`} onClick={() => onOpen(m.id)}>
      <span className="mk-left">
        <span className="mk-name">{nameLabel || m.name}</span>
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
        <span className="mk-ref">{refLine(m, range)}</span>
      </span>
    </button>
  )
}

// A connected-marker card: one box, a labeled sub-row per member.
function MarkerGroup({ name, members, onOpen }) {
  return (
    <div className="mk-group">
      <div className="mk-group-title">{name}</div>
      {members.map((r) => (
        <MarkerRow key={r.m.id} {...r} label={r.m.groupSub} sub onOpen={onOpen} />
      ))}
    </div>
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
    return { m, v: last.value, date: last.date, range: last.range, st: statusOf(m, last.value, last.range) }
  })

  const total = rows.length
  const inN = rows.filter((r) => r.st === 'normal').length
  const outN = total - inN

  // A marker group becomes one card only when 2+ of its members are tracked.
  const groupCounts = {}
  for (const r of rows) if (r.m.group) groupCounts[r.m.group] = (groupCounts[r.m.group] || 0) + 1
  const isGrouped = (m) => m.group && groupCounts[m.group] >= 2

  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    if (status === 'in' && r.st !== 'normal') return false
    if (status === 'out' && r.st === 'normal') return false
    if (q) {
      const groupName = isGrouped(r.m) ? GROUPS[r.m.group]?.name || '' : ''
      if (!r.m.name.toLowerCase().includes(q) && !groupName.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Assemble a panel's rows into render items, collapsing grouped markers into
  // a single group card while keeping their order of first appearance.
  function panelItems(panel) {
    const items = []
    const seen = new Map()
    for (const r of filtered) {
      if (r.m.panel !== panel) continue
      if (isGrouped(r.m)) {
        let item = seen.get(r.m.group)
        if (!item) {
          item = { type: 'group', key: r.m.group, name: GROUPS[r.m.group]?.name || r.m.name, members: [] }
          seen.set(r.m.group, item)
          items.push(item)
        }
        item.members.push(r)
      } else {
        items.push({ type: 'single', key: r.m.id, row: r })
      }
    }
    return items
  }

  // Built-in panel order first, then any custom panels (e.g. "Other") that
  // auto-installed markers belong to.
  const extraPanels = [...new Set(rows.map((r) => r.m.panel).filter((p) => !PANELS.includes(p)))]
  const groups = [...PANELS, ...extraPanels]
    .map((panel) => {
      const items = panelItems(panel)
      const count = items.reduce((n, it) => n + (it.type === 'group' ? it.members.length : 1), 0)
      return { panel, items, count }
    })
    .filter((g) => g.items.length > 0)

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
                <span className="group-count">{g.count}</span>
              </div>
              {g.items.map((it) =>
                it.type === 'group' ? (
                  <MarkerGroup key={it.key} name={it.name} members={it.members} onOpen={onOpenMarker} />
                ) : (
                  <MarkerRow key={it.key} {...it.row} onOpen={onOpenMarker} />
                )
              )}
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

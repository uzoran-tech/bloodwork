import { useState, useEffect, useRef } from 'react'
import { trackedMarkers, seriesFor } from '../store.js'
import { statusOf, refRange, PANELS, PANEL_ICONS } from '../catalog.js'
import { IconCheckCircle, IconArrowUp, IconArrowDown, IconInfo, IconSearch } from './Icons.jsx'

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

// Eased count-up for dynamic numbers. Pairs with tabular-nums so the width
// never shifts mid-animation. Respects reduced-motion by jumping to target.
function useCountUp(target, ms = 900) {
  const [n, setN] = useState(target)
  const from = useRef(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(target)
      from.current = target
      return
    }
    let raf
    const start = performance.now()
    const a = from.current
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(a + (target - a) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return n
}

// The focal point: a ring whose arc and centre number animate in once on load.
function HealthRing({ pct }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const shown = useCountUp(pct)
  const tone = pct >= 80 ? 'good' : pct >= 50 ? 'warn' : 'bad'
  return (
    <div className={`hring ${tone}`} style={{ '--dash': circ, '--off': offset }}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="hring-track" cx="60" cy="60" r={r} />
        <circle
          className="hring-fill"
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="hring-center">
        <strong className="tnum">
          {shown}
          <small>%</small>
        </strong>
        <span>in range</span>
      </div>
    </div>
  )
}

function MarkerRow({ m, v, date, st, range, onOpen }) {
  const { label, Icon } = ST[st]
  return (
    <button className="mk-row press" onClick={() => onOpen(m.id)}>
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
        <span className={`mk-value tnum ${st}`}>
          {v} <small>{m.unit}</small>
        </span>
        <span className="mk-ref">{refLine(m, range)}</span>
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

  const rows = trackedMarkers(reports).map((m) => {
    const s = seriesFor(reports, m.id)
    const last = s[s.length - 1]
    return { m, v: last.value, date: last.date, range: last.range, st: statusOf(m, last.value, last.range) }
  })

  const total = rows.length
  const inN = rows.filter((r) => r.st === 'normal').length
  const outN = total - inN
  const pct = total ? Math.round((inN / total) * 100) : 0
  const lastDate = rows.reduce((mx, r) => (r.date > mx ? r.date : mx), '')

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

  const legend = [
    { key: 'all', label: 'All', n: total, cls: '' },
    { key: 'in', label: 'In range', n: inN, cls: 'green' },
    { key: 'out', label: 'Out of range', n: outN, cls: 'red' },
  ]

  return (
    <div className="home v2">
      <header className="home-top enter" style={{ '--i': 0 }}>
        <div className="home-avatar">{name[0].toUpperCase()}</div>
        <div className="home-greet">
          <h1 className="home-title">Hello, {name}</h1>
          <p className="home-sub">
            {lastDate ? `Last drawn ${fmtDate(lastDate)}` : 'All your tracked markers'}
          </p>
        </div>
      </header>

      <section className="health-hero enter" style={{ '--i': 1 }} aria-label="Markers in range">
        <HealthRing pct={pct} />
        <div className="hero-legend" role="group" aria-label="Filter by status">
          {legend.map((it) => (
            <button
              key={it.key}
              className={`legend-row press ${status === it.key ? 'active' : ''}`}
              onClick={() => setStatus(it.key)}
            >
              <span className={`legend-dot ${it.cls}`} />
              <span className="legend-label">{it.label}</span>
              <span className={`legend-n tnum ${it.cls}`}>{it.n}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="search-bar enter" style={{ '--i': 2 }}>
        <IconSearch size={18} />
        <input
          type="search"
          placeholder="Search markers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {groups.length === 0 ? (
        <p className="mk-empty enter" style={{ '--i': 3 }}>
          No markers match.
        </p>
      ) : (
        groups.map((g, gi) => (
          <div className="result-group enter" key={g.panel} style={{ '--i': gi + 3 }}>
            <div className="group-head">
              <span className="group-title">
                <span className="group-ico">{PANEL_ICONS[g.panel]}</span> {g.panel}
              </span>
              <span className="group-count tnum">{g.items.length}</span>
            </div>
            {g.items.map((r) => (
              <MarkerRow key={r.m.id} {...r} onOpen={onOpenMarker} />
            ))}
          </div>
        ))
      )}

      <div className="sheet-note enter" style={{ '--i': groups.length + 4 }}>
        <IconInfo size={16} />
        <span>
          Each marker shows its most recent result against the range on that report. Interpret
          results with your doctor — not medical advice.
        </span>
      </div>
    </div>
  )
}

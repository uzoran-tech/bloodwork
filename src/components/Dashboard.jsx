import { sortByDate } from '../store.js'
import { markerById, statusOf, PANELS, PANEL_ICONS } from '../catalog.js'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const ST = {
  normal: { label: 'In range', icon: '✓' },
  high: { label: 'High', icon: '↑' },
  low: { label: 'Low', icon: '↓' },
}

// Reference line without units (units sit beside the value), matching the design.
function refLine(m) {
  if (m.lo != null && m.hi != null) return `Ref. ${m.lo}–${m.hi}`
  if (m.hi != null) return `Ref. < ${m.hi}`
  if (m.lo != null) return `Ref. > ${m.lo}`
  return 'No reference range'
}

// How far out of range, to order the needs-attention list worst-first.
const distance = (m, v) =>
  statusOf(m, v) === 'high' ? v / m.hi : statusOf(m, v) === 'low' ? m.lo / Math.max(v, 1e-9) : 0

function MarkerRow({ m, v, onOpen }) {
  const st = statusOf(m, v)
  return (
    <button className="mk-row" onClick={() => onOpen(m.id)}>
      <span className="mk-left">
        <span className="mk-name">{m.name}</span>
        <span className={`mk-pill ${st}`}>
          <span className="mk-pill-ico">{ST[st].icon}</span> {ST[st].label}
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
  const sorted = sortByDate(reports)
  const latest = sorted[sorted.length - 1]
  // Placeholder profile name until profile editing exists; matches the reference.
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
  const needReview = entries
    .filter((x) => statusOf(x.m, x.v) !== 'normal')
    .sort((a, b) => distance(b.m, b.v) - distance(a.m, a.v))
  const inRange = entries.filter((x) => statusOf(x.m, x.v) === 'normal')

  // In-range results grouped by panel (Hormones, Vitamins & Minerals, …) so
  // they scan by body system. Flagged markers stay in Needs attention above.
  const groups = PANELS.map((panel) => ({
    panel,
    items: inRange.filter((x) => x.m.panel === panel),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-avatar">{name[0].toUpperCase()}</div>
      </header>

      <div className="home-intro">
        <p className="eyebrow">Home</p>
        <h1 className="home-title">Hello, {name}</h1>
        <p className="home-sub">Latest bloodwork</p>
      </div>

      <section className="lr-card">
        <div className="lr-top">
          <div>
            <p className="eyebrow">Latest results</p>
            <h2 className="lr-date">{fmtDate(latest.date)}</h2>
          </div>
          {latest.lab && (
            <span className="lab-pill">
              <strong>{latest.lab}</strong>
              {latest.sample && <small>{latest.sample}</small>}
            </span>
          )}
        </div>

        <div className="count-tiles">
          <div className="count-tile neutral">
            <span>{entries.length}</span>
            <small>Reviewed</small>
          </div>
          <div className="count-tile good">
            <span>{inRange.length}</span>
            <small>In range</small>
          </div>
          <div className="count-tile review">
            <span>{needReview.length}</span>
            <small>Need review</small>
          </div>
        </div>
      </section>

      <div className="results">
        {needReview.length > 0 && (
          <div className="result-group">
            <div className="group-head">
              <span className="group-title">Needs attention</span>
              <span className="group-count">{needReview.length}</span>
            </div>
            {needReview.map(({ m, v }) => (
              <MarkerRow key={m.id} m={m} v={v} onOpen={onOpenMarker} />
            ))}
          </div>
        )}

        {groups.map((g) => (
          <div className="result-group" key={g.panel}>
            <div className="group-head">
              <span className="group-title">
                <span className="group-ico">{PANEL_ICONS[g.panel]}</span> {g.panel}
              </span>
              <span className="group-count">{g.items.length}</span>
            </div>
            {g.items.map(({ m, v }) => (
              <MarkerRow key={m.id} m={m} v={v} onOpen={onOpenMarker} />
            ))}
          </div>
        ))}
      </div>

      <div className="pad">
        <p className="disclaimer">
          Reference intervals are general adult values; your lab's printed range takes precedence.
          This is not medical advice — discuss results with your doctor.
        </p>
      </div>
    </div>
  )
}

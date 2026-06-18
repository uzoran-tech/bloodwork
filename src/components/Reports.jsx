import { useState } from 'react'
import { sortByDate, toCSV } from '../store.js'
import { deleteReport, clearAllReports } from '../dataStore.js'
import { markerById, statusOf } from '../catalog.js'
import { IconExport, IconTrash } from './Icons.jsx'

const DOC_TINTS = ['t-lav', 't-rose', 't-teal', 't-amber', 't-blue']

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

function relDate(d) {
  const days = Math.round((Date.now() - new Date(d)) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.round(days / 30)} mo ago`
  return `${(days / 365).toFixed(days < 730 ? 1 : 0)} yr ago`
}

function sourceIcon(notes) {
  if (/\.pdf/i.test(notes || '')) return '📄'
  if (/photo|\.(jpe?g|png|heic|webp)/i.test(notes || '')) return '📷'
  return '🧪'
}

export default function Reports({ reports, refresh, onAdd, onSignOut }) {
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const sorted = sortByDate(reports).reverse()
  const totalValues = reports.reduce((t, r) => t + Object.keys(r.values).length, 0)

  async function remove(id) {
    if (!confirm('Delete this report?')) return
    setBusy(true)
    setError(null)
    try {
      await deleteReport(id)
      await refresh()
    } catch (err) {
      setError(err?.message || "Couldn't delete that report.")
    } finally {
      setBusy(false)
    }
  }

  function exportCSV() {
    const blob = new Blob([toCSV(reports)], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bloodtrack-export.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function clearAll() {
    if (!confirm('Delete ALL of your reports? Export first if you want a backup.')) return
    setBusy(true)
    setError(null)
    try {
      await clearAllReports()
      await refresh()
    } catch (err) {
      setError(err?.message || "Couldn't clear your data.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="reports">
      <div className="hero short">
        <div className="hero-top">
          <div>
            <p className="hero-greet">
              {reports.length} report{reports.length === 1 ? '' : 's'} · {totalValues} markers
            </p>
            <h2>Your reports</h2>
          </div>
        </div>
      </div>

      <div className="pad">
        {error && <p className="feedback warn">{error}</p>}

        <button className="upload-cta" onClick={onAdd}>
          <span className="upload-plus">+</span>
          <span>
            <strong>Upload new report</strong>
            <span className="muted">PDF, photo, or CSV</span>
          </span>
          <span className="chev">›</span>
        </button>

        <div className="section-head">
          <strong>Recent</strong>
        </div>

        {sorted.map((r, i) => {
          const entries = Object.entries(r.values)
          const statuses = new Set(
            entries.map(([id, v]) => {
              const m = markerById(id)
              return m ? statusOf(m, v, r.ranges?.[id]) : 'normal'
            })
          )
          const isOpen = open === r.id
          return (
            <div key={r.id} className="report-card">
              <button className="report-head" onClick={() => setOpen(isOpen ? null : r.id)}>
                <span className={`report-doc ${DOC_TINTS[i % DOC_TINTS.length]}`}>{sourceIcon(r.notes)}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="report-title">
                    <strong>{r.lab || 'Lab report'}</strong>
                  </span>
                  <span className="report-sub">
                    {fmtDate(r.date)} · {relDate(r.date)}
                  </span>
                  <span className="report-foot">
                    {entries.length} markers
                    <span className="dot-strip">
                      {statuses.has('normal') && <i className="d-green" />}
                      {statuses.has('low') && <i className="d-amber" />}
                      {statuses.has('high') && <i className="d-red" />}
                    </span>
                    <span style={{ marginLeft: 'auto' }}>{isOpen ? '▾' : '▸'}</span>
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="report-body">
                  <table className="history">
                    <tbody>
                      {entries.map(([id, v]) => {
                        const m = markerById(id)
                        if (!m) return null
                        const range = r.ranges?.[id]
                        return (
                          <tr key={id}>
                            <td>{m.name}</td>
                            <td>
                              {v} {m.unit}
                            </td>
                            <td>
                              <span className={`badge ${statusOf(m, v, range)}`}>{statusOf(m, v, range)}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {r.notes && <p className="muted">{r.notes}</p>}
                  <button className="btn danger small" onClick={() => remove(r.id)} disabled={busy}>
                    <IconTrash size={15} /> Delete report
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <div className="report-actions">
          <button className="btn ghost small" onClick={exportCSV}>
            <IconExport size={15} /> Export CSV backup
          </button>
          <button className="btn danger small" onClick={clearAll} disabled={busy}>
            <IconTrash size={15} /> Clear all data
          </button>
        </div>

        {onSignOut && (
          <div className="account-bar">
            <button className="btn ghost small" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

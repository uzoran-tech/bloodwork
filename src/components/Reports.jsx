import { useState } from 'react'
import { sortByDate, toCSV } from '../store.js'
import { markerById, statusOf } from '../catalog.js'
import { IconExport, IconTrash } from './Icons.jsx'

const DOC_TINTS = ['t-lav', 't-rose', 't-teal', 't-amber', 't-blue']

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

export default function Reports({ reports, setReports, onAdd, theme, onToggleTheme }) {
  const [open, setOpen] = useState(null)
  const sorted = sortByDate(reports).reverse()
  const totalValues = reports.reduce((t, r) => t + Object.keys(r.values).length, 0)

  function remove(id) {
    if (confirm('Delete this report?')) setReports(reports.filter((r) => r.id !== id))
  }

  function exportCSV() {
    const blob = new Blob([toCSV(reports)], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bloodtrack-export.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function clearAll() {
    if (confirm('Delete ALL data from this device? Export first if you want a backup.')) {
      setReports([])
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
          <button
            className="avatar-btn"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            onClick={onToggleTheme}
          >
            <span className="avatar-face">{theme === 'light' ? '☺' : '☾'}</span>
          </button>
        </div>
      </div>

      <div className="pad">
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
              return m ? statusOf(m, v) : 'normal'
            })
          )
          const isOpen = open === r.id
          return (
            <div key={r.id} className="report-card">
              <button className="report-head" onClick={() => setOpen(isOpen ? null : r.id)}>
                <span className={`report-doc ${DOC_TINTS[i % DOC_TINTS.length]}`}>📄</span>
                <span style={{ minWidth: 0 }}>
                  <span className="report-title">
                    <strong>{r.lab || 'Lab report'}</strong>
                  </span>
                  <span className="report-sub">{fmtDate(r.date)}</span>
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
                        return (
                          <tr key={id}>
                            <td>{m.name}</td>
                            <td>
                              {v} {m.unit}
                            </td>
                            <td>
                              <span className={`badge ${statusOf(m, v)}`}>{statusOf(m, v)}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {r.notes && <p className="muted">{r.notes}</p>}
                  <button className="btn danger small" onClick={() => remove(r.id)}>
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
          <button className="btn danger small" onClick={clearAll}>
            <IconTrash size={15} /> Clear all data
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { sortByDate, toCSV } from '../store.js'
import { markerById, statusOf } from '../catalog.js'
import { IconExport, IconTrash } from './Icons.jsx'

export default function Reports({ reports, setReports }) {
  const [open, setOpen] = useState(null)
  const sorted = sortByDate(reports).reverse()

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
      <div className="report-actions">
        <button className="btn ghost small" onClick={exportCSV}>
          <IconExport size={15} /> Export CSV backup
        </button>
        <button className="btn danger small" onClick={clearAll}>
          <IconTrash size={15} /> Clear all data
        </button>
      </div>

      {sorted.map((r) => {
        const entries = Object.entries(r.values)
        const flags = entries.filter(([id, v]) => {
          const m = markerById(id)
          return m && statusOf(m, v) !== 'normal'
        })
        const isOpen = open === r.id
        return (
          <div key={r.id} className="report-card">
            <button className="report-head" onClick={() => setOpen(isOpen ? null : r.id)}>
              <div>
                <strong>{r.date}</strong>
                {r.lab && <span className="muted"> · {r.lab}</span>}
              </div>
              <span className="muted">
                {entries.length} markers{flags.length > 0 ? ` · ${flags.length} flagged` : ''} {isOpen ? '▾' : '▸'}
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
    </div>
  )
}

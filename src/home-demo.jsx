// Interactive preview of the redesigned homepage with mock data (no auth/db).
// Tap a marker to open its detail. Not shipped.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './components/Dashboard.jsx'
import MarkerDetail from './components/MarkerDetail.jsx'
import { setCustomMarkers } from './catalog.js'
import './styles.css'

const reports = [
  {
    id: 'demo-2',
    date: '2026-06-10',
    lab: 'Zavod',
    sample: 'Serum',
    notes: '',
    values: {
      glucose: 4.6, glucose2h: 7.2, insulin: 8.0, insulin2h: 31,
      testosterone: 1.52, freetesto: 4.6, tsh: 2.1, ft4: 14.0,
      vitd: 42, ferritin: 250, chol: 5.35, ldl: 3.7, hdl: 1.44, trig: 0.9,
      urea: 7.7, creatinine: 78, hgb: 150, wbc: 5.5, x_roma_index: 2.4,
    },
    ranges: {
      glucose: { lo: 3.9, hi: 6.1 }, insulin: { lo: 2.6, hi: 24.9 },
      testosterone: { lo: 0.48, hi: 1.85 }, freetesto: { lo: 4.25, hi: 30 },
      urea: { lo: 3, hi: 9.2 }, creatinine: { lo: 53, hi: 114.9 },
    },
    markers: { x_roma_index: { name: 'ROMA index', unit: '%', panel: 'Other' } },
  },
  {
    id: 'demo-1',
    date: '2025-12-02',
    lab: 'Zavod',
    sample: 'Serum',
    notes: '',
    values: { glucose: 5.2, ldl: 4.1, hdl: 1.3, vitd: 31, urea: 6.9, tsh: 3.0 },
    ranges: { glucose: { lo: 3.9, hi: 6.1 }, urea: { lo: 3, hi: 9.2 } },
    markers: {},
  },
]

// Register the custom markers so they resolve like built-ins (as App does).
const cm = new Map()
for (const r of reports) for (const [id, def] of Object.entries(r.markers || {})) {
  if (!cm.has(id)) cm.set(id, { id, name: def.name, unit: def.unit || '', panel: def.panel || 'Other', lo: null, hi: null, aliases: [], custom: true })
}
setCustomMarkers([...cm.values()])

function Demo() {
  const [detailId, setDetailId] = useState(null)
  return (
    <div className="app">
      <main className="main">
        <div className="view">
          <Dashboard reports={reports} onOpenMarker={setDetailId} />
        </div>
      </main>
      {detailId && (
        <MarkerDetail markerId={detailId} reports={reports} onClose={() => setDetailId(null)} refresh={async () => {}} />
      )}
    </div>
  )
}

document.documentElement.dataset.theme = 'light'
createRoot(document.getElementById('root')).render(<Demo />)

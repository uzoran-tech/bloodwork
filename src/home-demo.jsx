// Standalone, interactive preview of the redesigned homepage with mock data,
// so the design can be clicked through without the Supabase auth wall. Tapping
// a marker opens its detail sheet, like the real app. Not shipped.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './components/Dashboard.jsx'
import MarkerDetail from './components/MarkerDetail.jsx'
import './styles.css'

const reports = [
  {
    id: 'demo-1',
    date: '2026-06-10',
    lab: 'Zavod za laboratorijsku dijagnostiku',
    sample: 'Serum',
    notes: '',
    values: {
      tsh: 2.1,
      testosterone: 6.0,
      vitd: 42,
      ferritin: 250,
      magnesium: 0.92,
      glucose: 5.1,
      hba1c: 5.2,
      chol: 5.35,
      ldl: 3.7,
      hdl: 1.44,
      trig: 0.9,
      urea: 7.7,
      hgb: 150,
    },
    ranges: { urea: { lo: 3, hi: 9.2 } },
  },
  {
    id: 'demo-0',
    date: '2025-12-02',
    lab: 'Zavod za laboratorijsku dijagnostiku',
    sample: 'Serum',
    notes: '',
    // An earlier draw so marker detail charts show a trend.
    values: { tsh: 3.4, vitd: 31, ldl: 4.1, hdl: 1.3, glucose: 5.4, urea: 6.9, hba1c: 5.5 },
    ranges: { urea: { lo: 3, hi: 9.2 } },
  },
]

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
        <MarkerDetail markerId={detailId} reports={reports} onClose={() => setDetailId(null)} />
      )}
    </div>
  )
}

document.documentElement.dataset.theme = 'light'
createRoot(document.getElementById('root')).render(<Demo />)

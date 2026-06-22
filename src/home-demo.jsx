// Standalone preview of the redesigned homepage with mock data, so the design
// can be rendered/screenshotted without the Supabase auth wall. Not shipped.
import { createRoot } from 'react-dom/client'
import Dashboard from './components/Dashboard.jsx'
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
    // The report's own range for urea (3.0–9.2) keeps 7.7 in range.
    ranges: { urea: { lo: 3, hi: 9.2 } },
  },
]

document.documentElement.dataset.theme = 'light'

createRoot(document.getElementById('root')).render(
  <div className="app">
    <main className="main">
      <div className="view">
        <Dashboard reports={reports} onOpenMarker={() => {}} />
      </div>
    </main>
  </div>
)

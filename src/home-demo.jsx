// Interactive preview of the Insights tab (and Overview), with a multi-year
// mock history so the engine produces real trends + patterns. No auth/db.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './components/Dashboard.jsx'
import Insights from './components/Insights.jsx'
import Reports from './components/Reports.jsx'
import MarkerDetail from './components/MarkerDetail.jsx'
import { IconPulse, IconReports, IconTrend } from './components/Icons.jsx'
import './styles.css'

// Evolving history so drifts and cross-marker patterns fire.
const reports = [
  {
    id: 'r1', date: '2021-11-01', lab: 'Demo', sample: 'Serum', notes: '', ranges: {},
    values: { hba1c: 5.2, insulin: 7, glucose: 4.9, ferritin: 62, hgb: 150, mcv: 88, egfr: 96, creatinine: 70, tsh: 2.0, ft4: 14.5, ldl: 3.1, hdl: 1.5, trig: 1.2, alt: 30, ast: 26, ggt: 28, vitd: 55 },
  },
  {
    id: 'r2', date: '2022-12-01', lab: 'Demo', sample: 'Serum', notes: '', ranges: {},
    values: { hba1c: 5.5, insulin: 12, glucose: 5.3, ferritin: 40, hgb: 138, mcv: 84, egfr: 84, creatinine: 84, tsh: 3.2, ft4: 12.5, ldl: 3.7, hdl: 1.3, trig: 1.6, alt: 42, ast: 38, ggt: 45, vitd: 34 },
  },
  {
    id: 'r3', date: '2024-06-01', lab: 'Demo', sample: 'Serum', notes: '', ranges: {},
    values: { hba1c: 5.9, insulin: 19, glucose: 5.9, ferritin: 18, hgb: 120, mcv: 79, egfr: 68, creatinine: 104, tsh: 4.8, ft4: 9.5, ldl: 4.3, hdl: 1.1, trig: 2.2, alt: 58, ast: 49, ggt: 72, vitd: 78 },
  },
]

const TABS = [
  { id: 'dashboard', label: 'Overview', Icon: IconPulse },
  { id: 'insights', label: 'Insights', Icon: IconTrend },
  { id: 'add', label: 'Add', fab: true },
  { id: 'reports', label: 'Reports', Icon: IconReports },
]

function Demo() {
  const [tab, setTab] = useState('insights')
  const [detailId, setDetailId] = useState(null)
  return (
    <div className="app">
      <main className="main">
        <div className="view" key={tab}>
          {tab === 'dashboard' && <Dashboard reports={reports} onOpenMarker={setDetailId} />}
          {tab === 'insights' && <Insights reports={reports} onOpenMarker={setDetailId} />}
          {tab === 'reports' && <Reports reports={reports} refresh={async () => {}} onAdd={() => setTab('dashboard')} />}
          {tab === 'add' && <p style={{ padding: 24, color: '#6c7689' }}>Import screen (not in this preview).</p>}
        </div>
      </main>
      {detailId && (
        <MarkerDetail markerId={detailId} reports={reports} onClose={() => setDetailId(null)} refresh={async () => {}} />
      )}
      <nav className="tabbar">
        {TABS.map(({ id, label, Icon, fab }) => (
          <button key={id} className={`tab ${fab ? 'add-tab' : ''} ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <span className="tab-icon">{fab ? <span className="tab-plus">+</span> : <Icon size={21} />}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

document.documentElement.dataset.theme = 'light'
createRoot(document.getElementById('root')).render(<Demo />)

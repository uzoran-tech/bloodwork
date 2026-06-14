import { useEffect, useState } from 'react'
import { loadReports, saveReports } from './store.js'
import { demoReports } from './demo.js'
import Dashboard from './components/Dashboard.jsx'
import Reports from './components/Reports.jsx'
import AddData from './components/AddData.jsx'
import MarkerDetail from './components/MarkerDetail.jsx'
import { IconPulse, IconReports, IconPlus, IconDrop } from './components/Icons.jsx'

const TABS = [
  { id: 'dashboard', label: 'Overview', Icon: IconPulse },
  { id: 'add', label: 'Add', Icon: IconPlus, fab: true },
  { id: 'reports', label: 'Reports', Icon: IconReports },
]

const THEME_KEY = 'bloodtrack.theme'

export default function App() {
  const [reports, setReports] = useState(loadReports)
  const [tab, setTab] = useState('dashboard')
  const [detailId, setDetailId] = useState(null)

  useEffect(() => {
    saveReports(reports)
  }, [reports])

  // Light theme only (no toggle); keep the attribute stable for CSS.
  useEffect(() => {
    document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#2f405e')
  }, [])

  const empty = reports.length === 0

  return (
    <div className="app">
      <main className="main">
        {empty && tab !== 'add' ? (
          <div className="view">
            <div className="welcome-hero">
              <span className="welcome-icon">
                <IconDrop size={64} />
              </span>
              <h2>Track your bloodwork over time</h2>
            </div>
            <div className="welcome-body">
              <p>
                Add your lab reports and BloodTrack shows every marker against its reference range,
                grouped by what needs attention.
              </p>
              <button className="btn primary" onClick={() => setTab('add')}>
                Add your first report
              </button>
              <button className="btn ghost" onClick={() => setReports(demoReports())}>
                Explore with demo data
              </button>
              <p className="disclaimer">
                Data stays on this device. BloodTrack describes your numbers — it is not medical
                advice.
              </p>
            </div>
          </div>
        ) : (
          <div className="view" key={tab}>
            {tab === 'dashboard' && <Dashboard reports={reports} onOpenMarker={setDetailId} />}
            {tab === 'reports' && (
              <Reports reports={reports} setReports={setReports} onAdd={() => setTab('add')} />
            )}
            {tab === 'add' && (
              <AddData reports={reports} setReports={setReports} done={() => setTab('dashboard')} />
            )}
          </div>
        )}
      </main>

      {detailId && <MarkerDetail markerId={detailId} reports={reports} onClose={() => setDetailId(null)} />}

      <nav className="tabbar">
        {TABS.map(({ id, label, Icon, fab }) => (
          <button
            key={id}
            className={`tab ${fab ? 'add-tab' : ''} ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <span className="tab-icon">
              {fab ? <span className="tab-plus">+</span> : <Icon size={21} />}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

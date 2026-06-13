import { useEffect, useState } from 'react'
import { loadReports, saveReports } from './store.js'
import { demoReports } from './demo.js'
import Dashboard from './components/Dashboard.jsx'
import Trends from './components/Trends.jsx'
import Reports from './components/Reports.jsx'
import AddData from './components/AddData.jsx'
import MarkerDetail from './components/MarkerDetail.jsx'
import { IconPulse, IconTrend, IconReports, IconPlus, IconDrop } from './components/Icons.jsx'

const TABS = [
  { id: 'dashboard', label: 'Overview', Icon: IconPulse },
  { id: 'trends', label: 'Trends', Icon: IconTrend },
  { id: 'add', label: 'Add', Icon: IconPlus, fab: true },
  { id: 'reports', label: 'Reports', Icon: IconReports },
]

const THEME_KEY = 'bloodtrack.theme'
const THEME_COLORS = { light: '#5a67f2', dark: '#4a55d8' }

export default function App() {
  const [reports, setReports] = useState(loadReports)
  const [tab, setTab] = useState('dashboard')
  const [detailId, setDetailId] = useState(null)
  const [trendsPanel, setTrendsPanel] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => {
    saveReports(reports)
  }, [reports])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  const openPanel = (panel) => {
    setTrendsPanel(panel)
    setTab('trends')
  }

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
                Add lab reports and BloodTrack charts every marker against its reference range,
                spots trends, and surfaces what changed.
              </p>
              <button className="btn primary" onClick={() => setTab('add')}>
                Add your first report
              </button>
              <button className="btn ghost" onClick={() => setReports(demoReports())}>
                Explore with 5 years of demo data
              </button>
              <p className="disclaimer">
                Data stays on this device. BloodTrack describes your numbers — it is not medical
                advice.
              </p>
            </div>
          </div>
        ) : (
          <div className="view" key={tab}>
            {tab === 'dashboard' && (
              <Dashboard
                reports={reports}
                onOpenMarker={setDetailId}
                onOpenPanel={openPanel}
                onViewReport={() => setTab('reports')}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            )}
            {tab === 'trends' && (
              <Trends reports={reports} onOpenMarker={setDetailId} initialPanel={trendsPanel} />
            )}
            {tab === 'reports' && (
              <Reports
                reports={reports}
                setReports={setReports}
                onAdd={() => setTab('add')}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
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
            onClick={() => {
              if (id === 'trends') setTrendsPanel(null)
              setTab(id)
            }}
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

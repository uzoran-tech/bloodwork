import { useEffect, useState } from 'react'
import { loadReports, saveReports } from './store.js'
import { demoReports } from './demo.js'
import Dashboard from './components/Dashboard.jsx'
import Trends from './components/Trends.jsx'
import Reports from './components/Reports.jsx'
import AddData from './components/AddData.jsx'
import MarkerDetail from './components/MarkerDetail.jsx'
import { IconPulse, IconTrend, IconReports, IconPlus, IconSun, IconMoon, IconDrop } from './components/Icons.jsx'

const TABS = [
  { id: 'dashboard', label: 'Overview', Icon: IconPulse },
  { id: 'trends', label: 'Trends', Icon: IconTrend },
  { id: 'reports', label: 'Reports', Icon: IconReports },
  { id: 'add', label: 'Add', Icon: IconPlus },
]

const THEME_KEY = 'bloodtrack.theme'
const THEME_COLORS = { light: '#f4f6f9', dark: '#0f1115' }

export default function App() {
  const [reports, setReports] = useState(loadReports)
  const [tab, setTab] = useState('dashboard')
  const [detailId, setDetailId] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => {
    saveReports(reports)
  }, [reports])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  const empty = reports.length === 0

  return (
    <div className="app">
      <header className="header">
        <IconDrop />
        <h1>BloodTrack</h1>
        {!empty && <span className="header-count">{reports.length} reports</span>}
        <button
          className="icon-btn"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>
      </header>

      <main className="main">
        {empty && tab !== 'add' ? (
          <div className="welcome view">
            <div className="welcome-icon">
              <IconDrop size={64} />
            </div>
            <h2>Track your bloodwork over time</h2>
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
              Data stays on this device. BloodTrack describes your numbers — it is not medical advice.
            </p>
          </div>
        ) : (
          <div className="view" key={tab}>
            {tab === 'dashboard' && <Dashboard reports={reports} onOpenMarker={setDetailId} />}
            {tab === 'trends' && <Trends reports={reports} onOpenMarker={setDetailId} />}
            {tab === 'reports' && <Reports reports={reports} setReports={setReports} />}
            {tab === 'add' && (
              <AddData reports={reports} setReports={setReports} done={() => setTab('dashboard')} />
            )}
          </div>
        )}
      </main>

      {detailId && <MarkerDetail markerId={detailId} reports={reports} onClose={() => setDetailId(null)} />}

      <nav className="tabbar">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <span className="tab-icon">
              <Icon size={21} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth.jsx'
import Auth from './Auth.jsx'
import { listReports } from './dataStore.js'
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

export default function App() {
  const { user, loading, recovering, signOut } = useAuth()

  const [reports, setReports] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [detailId, setDetailId] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
  }, [])

  const refresh = useCallback(async () => {
    setDataError(null)
    try {
      setReports(await listReports())
    } catch (err) {
      setDataError(err?.message || 'Could not load your reports.')
    }
  }, [])

  // Load this user's reports once authenticated; clear on sign-out.
  useEffect(() => {
    if (!user) {
      setReports([])
      return
    }
    setDataLoading(true)
    refresh().finally(() => setDataLoading(false))
  }, [user, refresh])

  if (loading) {
    return (
      <div className="splash">
        <span className="welcome-icon">
          <IconDrop size={56} />
        </span>
      </div>
    )
  }

  if (recovering) return <Auth mode="reset" />
  if (!user) return <Auth />

  const empty = reports.length === 0

  return (
    <div className="app">
      <main className="main">
        {dataLoading ? (
          <div className="splash">
            <span className="welcome-icon">
              <IconDrop size={56} />
            </span>
          </div>
        ) : empty && tab !== 'add' ? (
          <div className="view">
            <div className="welcome-hero">
              <span className="welcome-icon">
                <IconDrop size={64} />
              </span>
              <h2>Track your bloodwork over time</h2>
            </div>
            <div className="welcome-body">
              {dataError && <p className="feedback warn">{dataError}</p>}
              <p>
                Add your lab reports and BloodTrack shows every marker against its reference range,
                grouped by what needs attention.
              </p>
              <button className="btn primary" onClick={() => setTab('add')}>
                Add your first report
              </button>
              <button className="btn ghost" onClick={signOut}>
                Sign out
              </button>
              <p className="disclaimer">
                Your data is stored privately in your account — discuss results with your doctor.
              </p>
            </div>
          </div>
        ) : (
          <div className="view" key={tab}>
            {tab === 'dashboard' && <Dashboard reports={reports} onOpenMarker={setDetailId} />}
            {tab === 'reports' && (
              <Reports
                reports={reports}
                refresh={refresh}
                onAdd={() => setTab('add')}
                onSignOut={signOut}
              />
            )}
            {tab === 'add' && (
              <AddData reports={reports} refresh={refresh} done={() => setTab('dashboard')} />
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

import { useMemo, useState } from 'react'
import { markerById } from '../catalog.js'
import { buildInsightReport, visitSummary } from '../insights.js'
import { IconInfo } from './Icons.jsx'

const SECTIONS = [
  { sev: 'alert', title: 'Needs attention', tone: 'alert' },
  { sev: 'watch', title: 'Worth watching', tone: 'watch' },
  { sev: 'info', title: 'Trends', tone: 'info' },
  { sev: 'good', title: 'Good news', tone: 'good' },
]

function InsightCard({ i, onOpenMarker }) {
  return (
    <div className={`insight ${i.severity}`}>
      <span className="insight-ic" aria-hidden="true">{i.icon}</span>
      <div className="insight-body">
        <strong className="insight-title">{i.title}</strong>
        <p className="insight-detail">{i.detail}</p>
        {i.markerIds?.length > 0 && (
          <div className="insight-chips">
            {i.markerIds.map((id) => {
              const m = markerById(id)
              if (!m) return null
              return (
                <button key={id} className="insight-chip" onClick={() => onOpenMarker(id)}>
                  {m.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Insights({ reports, onOpenMarker }) {
  const insights = useMemo(() => buildInsightReport(reports), [reports])
  const [copied, setCopied] = useState(false)

  const alerts = insights.filter((i) => i.severity === 'alert').length
  const watch = insights.filter((i) => i.severity === 'watch').length

  async function copySummary() {
    const text = visitSummary(reports)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: surface the text so the user can copy manually.
      window.prompt('Copy your visit summary:', text)
    }
  }

  const empty = insights.length === 0

  return (
    <div className="insights-screen">
      <header className="ins-hero">
        <div className="ins-hero-top">
          <h1>Insights</h1>
          <span className="ins-premium">Premium</span>
        </div>
        <p className="ins-sub">
          Your personal early-warning system — the slow changes and cross-marker patterns a single
          report won't show.
        </p>
        {!empty && (
          <div className="ins-counts">
            <span className={`ins-count ${alerts ? 'alert' : 'muted'}`}>
              <strong>{alerts}</strong> need attention
            </span>
            <span className={`ins-count ${watch ? 'watch' : 'muted'}`}>
              <strong>{watch}</strong> to watch
            </span>
          </div>
        )}
      </header>

      {empty ? (
        <div className="ins-empty">
          <p>
            {reports.length === 0
              ? 'Add a couple of lab reports and BloodTrack will start spotting trends and patterns across them.'
              : 'Everything looks steady and in range across your tracked markers. Add more reports over time and the picture sharpens.'}
          </p>
        </div>
      ) : (
        <>
          <button className="ins-visit" onClick={copySummary}>
            <span>📋</span>
            <span>
              <strong>{copied ? 'Copied to clipboard' : 'Prepare for your doctor visit'}</strong>
              <small>A summary of what changed + questions to ask</small>
            </span>
          </button>

          {SECTIONS.map(({ sev, title, tone }) => {
            const items = insights.filter((i) => i.severity === sev)
            if (items.length === 0) return null
            return (
              <section className="ins-section" key={sev}>
                <h2 className={`ins-sec-title ${tone}`}>{title}</h2>
                {items.map((i) => (
                  <InsightCard key={i.key} i={i} onOpenMarker={onOpenMarker} />
                ))}
              </section>
            )
          })}
        </>
      )}

      <p className="ins-disclaimer">
        <IconInfo size={14} /> BloodTrack highlights trends to discuss with your doctor. It is not a
        diagnosis and not medical advice.
      </p>
    </div>
  )
}

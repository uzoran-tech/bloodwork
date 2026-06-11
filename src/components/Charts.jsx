import { statusOf } from '../catalog.js'

const COLORS = { normal: '#34c98e', low: '#5aa9ff', high: '#ff6b5e' }

function scale(series, marker, w, h, pad) {
  const xs = series.map((p) => new Date(p.date).getTime())
  const ys = series.map((p) => p.value)
  let yMin = Math.min(...ys)
  let yMax = Math.max(...ys)
  if (marker.lo != null) yMin = Math.min(yMin, marker.lo)
  if (marker.hi != null) yMax = Math.max(yMax, marker.hi)
  const ySpan = yMax - yMin || 1
  yMin -= ySpan * 0.12
  yMax += ySpan * 0.12
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const x = (t) => (xMax === xMin ? w / 2 : pad + ((t - xMin) / (xMax - xMin)) * (w - pad * 2))
  const y = (v) => h - pad - ((v - yMin) / (yMax - yMin)) * (h - pad * 2)
  return { x, y }
}

export function Sparkline({ series, marker, width = 120, height = 36 }) {
  if (series.length === 0) return null
  const { x, y } = scale(series, marker, width, height, 4)
  const pts = series.map((p) => `${x(new Date(p.date).getTime()).toFixed(1)},${y(p.value).toFixed(1)}`)
  const last = series[series.length - 1]
  const color = COLORS[statusOf(marker, last.value)]
  return (
    <svg width={width} height={height} className="sparkline" aria-hidden>
      {marker.lo != null && marker.hi != null && (
        <rect x={0} y={y(marker.hi)} width={width} height={Math.max(0, y(marker.lo) - y(marker.hi))} fill="var(--band)" />
      )}
      {series.length > 1 && (
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      )}
      <circle cx={x(new Date(last.date).getTime())} cy={y(last.value)} r="3" fill={color} />
    </svg>
  )
}

export function TrendChart({ series, marker, width = 640, height = 260 }) {
  if (series.length === 0) return null
  const pad = 30
  const { x, y } = scale(series, marker, width, height, pad)
  const pts = series.map((p) => ({
    cx: x(new Date(p.date).getTime()),
    cy: y(p.value),
    ...p,
  }))
  const last = series[series.length - 1]

  const bandTop = marker.hi != null ? y(marker.hi) : pad
  const bandBottom = marker.lo != null ? y(marker.lo) : height - pad

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart">
      <rect x={pad} y={bandTop} width={width - pad * 2} height={Math.max(0, bandBottom - bandTop)} fill="rgba(52,201,142,0.10)" />
      {marker.hi != null && (
        <>
          <line x1={pad} x2={width - pad} y1={y(marker.hi)} y2={y(marker.hi)} stroke="var(--dash)" strokeDasharray="4 4" />
          <text x={width - pad} y={y(marker.hi) - 5} textAnchor="end" className="chart-label">{marker.hi}</text>
        </>
      )}
      {marker.lo != null && (
        <>
          <line x1={pad} x2={width - pad} y1={y(marker.lo)} y2={y(marker.lo)} stroke="var(--dash)" strokeDasharray="4 4" />
          <text x={width - pad} y={y(marker.lo) + 14} textAnchor="end" className="chart-label">{marker.lo}</text>
        </>
      )}
      {series.length > 1 && (
        <polyline
          className="chart-line"
          pathLength="1"
          points={pts.map((p) => `${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ')}
          fill="none"
          stroke="var(--red)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {pts.map((p, i) => (
        <g key={p.date}>
          <circle
            className="chart-dot"
            style={{ animationDelay: `${0.15 + (i / pts.length) * 0.8}s` }}
            cx={p.cx}
            cy={p.cy}
            r={i === pts.length - 1 ? 5 : 3.5}
            fill={COLORS[statusOf(marker, p.value)]}
            stroke="var(--card)"
            strokeWidth="1.5"
          />
          {(i === 0 || i === pts.length - 1) && (
            <text x={p.cx} y={height - 8} textAnchor={i === 0 ? 'start' : 'end'} className="chart-label">
              {p.date.slice(0, 7)}
            </text>
          )}
        </g>
      ))}
      <text x={pad} y={18} className="chart-latest">
        {last.value} {marker.unit}
      </text>
    </svg>
  )
}

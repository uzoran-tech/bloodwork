import { describe, it, expect } from 'vitest'
import { buildInsightReport, visitSummary } from './insights.js'

// Two-visit history that should produce: an out-of-range alert (LDL), a rising
// trend / insulin-resistance pattern, and a "back in range" good-news item.
const reports = [
  {
    id: 'a',
    date: '2022-03-01',
    values: { ldl: 2.9, hba1c: 5.2, insulin: 8, vitd: 40 },
    ranges: {},
  },
  {
    id: 'b',
    date: '2024-06-01',
    values: { ldl: 4.2, hba1c: 5.9, insulin: 18, vitd: 75 },
    ranges: { vitd: { lo: 50, hi: 150 } },
  },
]

describe('buildInsightReport', () => {
  const insights = buildInsightReport(reports)

  it('flags a marker that is currently out of range as an alert', () => {
    expect(insights.some((i) => i.severity === 'alert' && i.markerIds.includes('ldl'))).toBe(true)
  })

  it('detects the insulin-resistance cross-marker pattern', () => {
    const ir = insights.find((i) => i.key === 'pat-ir')
    expect(ir).toBeTruthy()
    expect(ir.markerIds).toEqual(expect.arrayContaining(['hba1c', 'insulin']))
    expect(ir.tier).toBe('premium')
  })

  it('orders alerts before watch/info/good', () => {
    const sev = insights.map((i) => i.severity)
    const firstWatch = sev.indexOf('watch')
    const lastAlert = sev.lastIndexOf('alert')
    if (firstWatch !== -1 && lastAlert !== -1) expect(lastAlert).toBeLessThan(firstWatch)
  })

  it('returns nothing for a single all-in-range report', () => {
    const calm = [{ id: 'x', date: '2024-01-01', values: { tsh: 2.1 }, ranges: {} }]
    expect(buildInsightReport(calm)).toHaveLength(0)
  })
})

describe('visitSummary', () => {
  it('produces a shareable summary with the key items and questions', () => {
    const text = visitSummary(reports)
    expect(text).toContain('points to discuss')
    expect(text).toContain('Questions:')
    expect(text).toContain('not medical advice')
  })
})

import { describe, it, expect } from 'vitest'
import { statusOf, refRange, rangeLabel, markerById } from './catalog.js'
import { extractRange, parseLabLines } from './pdfimport.js'
import { mergeReport, seriesFor } from './store.js'

const urea = markerById('urea') // catalog default lo 3.2 / hi 7.4

describe('refRange', () => {
  it('uses the report range when provided', () => {
    expect(refRange(urea, { lo: 3, hi: 9.2 })).toEqual({ lo: 3, hi: 9.2 })
  })
  it('falls back to the catalog when range is missing or empty', () => {
    expect(refRange(urea, null)).toEqual({ lo: urea.lo, hi: urea.hi })
    expect(refRange(urea, { lo: null, hi: null })).toEqual({ lo: urea.lo, hi: urea.hi })
  })
  it('keeps a one-sided report range as one-sided', () => {
    expect(refRange(urea, { lo: null, hi: 9.2 })).toEqual({ lo: null, hi: 9.2 })
  })
})

describe('statusOf with a report range', () => {
  it('flags 7.7 high against the catalog default (3.2–7.4)', () => {
    expect(statusOf(urea, 7.7)).toBe('high')
  })
  it('treats 7.7 as in range against the lab range (3.0–9.2)', () => {
    expect(statusOf(urea, 7.7, { lo: 3, hi: 9.2 })).toBe('normal')
  })
  it('still flags out-of-range against the lab range', () => {
    expect(statusOf(urea, 10, { lo: 3, hi: 9.2 })).toBe('high')
    expect(statusOf(urea, 2, { lo: 3, hi: 9.2 })).toBe('low')
  })
})

describe('rangeLabel with a report range', () => {
  it('shows the report two-sided range', () => {
    expect(rangeLabel(urea, { lo: 3, hi: 9.2 })).toBe('3–9.2')
  })
  it('shows one-sided ranges', () => {
    expect(rangeLabel(urea, { lo: null, hi: 9.2 })).toBe('< 9.2')
    expect(rangeLabel(urea, { lo: 3, hi: null })).toBe('> 3')
  })
})

describe('extractRange (lab range formats)', () => {
  const cases = [
    ['two-sided', 'V Urea SPF 7,7 3,0 - 9,2 mmol/L', { lo: 3, hi: 9.2 }],
    ['upper "do"', 'V AST (GOT) SPF 20,0 do 34,0 U/L', { lo: null, hi: 34 }],
    ['lower "od"', 'V HDL - Holesterol SPF 1,44 od 1,6 mmol/L <', { lo: 1.6, hi: null }],
    ['operator "<"', 'hs CRP IT 0,96 < 7,9 mg/L', { lo: null, hi: 7.9 }],
    ['tiered prefers opt', 'LDL Friedewald 3,7 gran: 3,4-4,09 opt: < 3,4 mmol/L >', { lo: null, hi: 3.4 }],
  ]
  for (const [name, line, expected] of cases) {
    it(name, () => expect(extractRange(line)).toEqual(expected))
  }
  it('returns null when no range is present', () => {
    expect(extractRange('Some heading with no numbers')).toBeNull()
  })
})

describe('parseLabLines captures values and ranges together', () => {
  it('reads urea value and its printed range', () => {
    const { values, ranges } = parseLabLines(['V Urea SPF 7,7 3,0 - 9,2 mmol/L'])
    expect(values.urea).toBe(7.7)
    expect(ranges.urea).toEqual({ lo: 3, hi: 9.2 })
  })
})

describe('ranges flow through the store', () => {
  it('mergeReport combines ranges like values', () => {
    const a = mergeReport([], { date: '2024-01-01', values: { urea: 7.7 }, ranges: { urea: { lo: 3, hi: 9.2 } } })
    const b = mergeReport(a, { date: '2024-01-01', values: { tsh: 1.5 }, ranges: { tsh: { lo: 0.3, hi: 5 } } })
    expect(b[0].ranges).toEqual({ urea: { lo: 3, hi: 9.2 }, tsh: { lo: 0.3, hi: 5 } })
  })
  it('seriesFor carries each point’s range', () => {
    const reports = [
      { date: '2024-01-01', values: { urea: 7.7 }, ranges: { urea: { lo: 3, hi: 9.2 } } },
      { date: '2024-02-01', values: { urea: 6.0 } }, // older import without a range
    ]
    const s = seriesFor(reports, 'urea')
    expect(s[0].range).toEqual({ lo: 3, hi: 9.2 })
    expect(s[1].range).toBeNull()
  })
})

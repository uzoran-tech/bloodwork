import { describe, it, expect, beforeEach } from 'vitest'
import { parseLabLines } from './pdfimport.js'
import {
  makeCustomMarker,
  setCustomMarkers,
  markerById,
  allMarkers,
  matchMarker,
} from './catalog.js'

beforeEach(() => setCustomMarkers([]))

describe('makeCustomMarker', () => {
  it('builds a stable slug id under the Other panel with no catalog range', () => {
    const m = makeCustomMarker('Beta-2 microglobulin', 'mg/L')
    expect(m.id).toBe('x_beta_2_microglobulin')
    expect(m.panel).toBe('Other')
    expect(m.lo).toBeNull()
    expect(m.hi).toBeNull()
    // same name → same id, so re-imports merge
    expect(makeCustomMarker('Beta-2 microglobulin').id).toBe(m.id)
  })
})

describe('parseLabLines captures unknown analytes as custom markers', () => {
  it('keeps name (with digits), value, unit and range', () => {
    const { values, ranges, markers } = parseLabLines([
      'Beta-2 mikroglobulin 2,1 0,8 - 2,2 mg/L',
    ])
    const id = 'x_beta_2_mikroglobulin'
    expect(values[id]).toBe(2.1)
    expect(ranges[id]).toEqual({ lo: 0.8, hi: 2.2 })
    expect(markers[id]).toEqual({ name: 'Beta-2 mikroglobulin', unit: 'mg/L', panel: 'Other' })
  })

  it('does not invent markers from prose without a unit or range', () => {
    const { values, markers } = parseLabLines(['Protokol 3206', 'str. 1 / 2'])
    expect(Object.keys(values)).toHaveLength(0)
    expect(Object.keys(markers)).toHaveLength(0)
  })

  it('prefers a real catalog marker over a custom one', () => {
    const { values, markers } = parseLabLines(['V Urea SPF 7,7 3,0 - 9,2 mmol/L'])
    expect(values.urea).toBe(7.7)
    expect(Object.keys(markers)).toHaveLength(0)
  })
})

describe('custom marker registry', () => {
  it('resolves registered custom markers via markerById and allMarkers', () => {
    const m = makeCustomMarker('Koenzim Q10', 'µg/L')
    setCustomMarkers([m])
    expect(markerById(m.id)).toMatchObject({ id: m.id, name: 'Koenzim Q10' })
    expect(allMarkers().some((x) => x.id === m.id)).toBe(true)
    expect(matchMarker('Koenzim Q10')).toBe(m.id)
  })
})

import { describe, it, expect } from 'vitest'
import { markerById, matchMarker } from './catalog.js'
import { parseLabLines } from './pdfimport.js'

// Regression: a clear MEDLAB photo of an Androstenedione result failed to
// import because the marker wasn't in the catalog, surfacing a misleading
// "picture not clear" message. The marker name on the report is the Serbian
// spelling "Androstendion".
describe('androstenedione import', () => {
  it('is in the catalog under Hormones', () => {
    expect(markerById('androstenedione')?.panel).toBe('Hormones')
  })

  it('matches the Serbian spelling and the English name', () => {
    expect(matchMarker('androstendion')).toBe('androstenedione')
    expect(matchMarker('Androstenedione')).toBe('androstenedione')
  })

  it('parses value and printed range from the report line', () => {
    const { values, ranges } = parseLabLines(['Androstendion 5,09 ELISA 0,3 - 3,3 ng/mL >'])
    expect(values.androstenedione).toBe(5.09)
    expect(ranges.androstenedione).toEqual({ lo: 0.3, hi: 3.3 })
  })
})

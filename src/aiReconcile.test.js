import { describe, it, expect } from 'vitest'
import { localReconcile, applyReconciliation, enrich } from './aiReconcile.js'

describe('localReconcile (on-device AI stand-in)', () => {
  it('matches a known marker printed under a fuzzy/abbreviated name', () => {
    const [r] = localReconcile([{ name: 'Holesterol ukupni', unit: 'mmol/L' }])
    expect(r.matchId).toBe('chol')
  })

  it('matches even with a small misspelling + unit hint', () => {
    const [r] = localReconcile([{ name: 'Trigliceridi', unit: 'mmol/L' }])
    expect(r.matchId).toBe('trig')
  })

  it('leaves a genuinely novel analyte as a normalized custom marker', () => {
    const [r] = localReconcile([{ name: '™ ROMA index', unit: '%' }])
    expect(r.matchId).toBeNull()
    expect(r.custom).toEqual({ name: 'ROMA index', panel: 'Other', unit: '%' })
  })
})

describe('applyReconciliation', () => {
  it('moves a matched custom value onto the known marker id', () => {
    const parsed = {
      values: { x_holesterol: 5.2 },
      ranges: { x_holesterol: { lo: null, hi: 5.2 } },
      markers: { x_holesterol: { name: 'Holesterol', unit: 'mmol/L', panel: 'Other' } },
    }
    const out = applyReconciliation(parsed, [{ name: 'Holesterol', matchId: 'chol' }])
    expect(out.values.chol).toBe(5.2)
    expect(out.values.x_holesterol).toBeUndefined()
    expect(out.markers.x_holesterol).toBeUndefined()
    expect(out.ranges.chol).toEqual({ lo: null, hi: 5.2 })
    expect(out.matchedIds).toEqual(['chol'])
  })

  it('does not clobber a value the parser already captured', () => {
    const parsed = {
      values: { chol: 6.0, x_holesterol: 5.2 },
      ranges: {},
      markers: { x_holesterol: { name: 'Holesterol', unit: 'mmol/L', panel: 'Other' } },
    }
    const out = applyReconciliation(parsed, [{ name: 'Holesterol', matchId: 'chol' }])
    expect(out.values.chol).toBe(6.0) // kept
    expect(out.values.x_holesterol).toBeUndefined() // duplicate dropped
  })

  it('normalizes a custom marker that has no match', () => {
    const parsed = {
      values: { x_roma: 2.4 },
      ranges: {},
      markers: { x_roma: { name: '™ ROMA index', unit: '%', panel: 'Other' } },
    }
    const out = applyReconciliation(parsed, [
      { name: '™ ROMA index', matchId: null, custom: { name: 'ROMA index', panel: 'Other', unit: '%' } },
    ])
    expect(out.markers.x_roma.name).toBe('ROMA index')
    expect(out.matchedIds).toEqual([])
  })
})

describe('enrich', () => {
  it('is a no-op when there are no unknown markers', async () => {
    const parsed = { values: { tsh: 2.1 }, ranges: {}, markers: {} }
    const out = await enrich(parsed)
    expect(out.values).toEqual({ tsh: 2.1 })
    expect(out.matchedIds).toEqual([])
  })
})

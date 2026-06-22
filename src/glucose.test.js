import { describe, it, expect } from 'vitest'
import { parseLabLines } from './pdfimport.js'

// Fasting glucose and 2h-post-meal glucose are one test with two connected
// readings. They must import as distinct markers, not collapse into one.
describe('connected glucose readings', () => {
  it('keeps fasting and 2h post-meal glucose as separate markers', () => {
    const { values, ranges } = parseLabLines([
      'Glukoza SPF 4,6 3,9 - 6,1 mmol/L',
      'Glukoza - 2 h posle jela SPF 4,9 mmol/L',
    ])
    expect(values.glucose).toBe(4.6)
    expect(values.glucose2h).toBe(4.9)
    expect(ranges.glucose).toEqual({ lo: 3.9, hi: 6.1 })
  })

  it('plain "Glukoza" is still fasting glucose', () => {
    const { values } = parseLabLines(['Glukoza 5,1 3,9 - 6,1 mmol/L'])
    expect(values.glucose).toBe(5.1)
    expect(values.glucose2h).toBeUndefined()
  })
})

describe('connected insulin readings', () => {
  it('keeps fasting and "Insulin - posle" (after) as separate markers', () => {
    const { values } = parseLabLines([
      'V Insulin 5,0 CMIA 2,6 - 24,9 µIU/mL',
      'V Insulin - posle 15,7 CMIA µIU/mL',
    ])
    expect(values.insulin).toBe(5.0)
    expect(values.insulin2h).toBe(15.7)
  })

  it('plain "Insulin" is still fasting insulin', () => {
    const { values } = parseLabLines(['Insulin 7,2 2,6 - 24,9 µIU/mL'])
    expect(values.insulin).toBe(7.2)
    expect(values.insulin2h).toBeUndefined()
  })
})

describe('short marker codes', () => {
  it('matches a 2-letter code (LH) printed as a standalone leading token', () => {
    const { values } = parseLabLines(['V LH 4,48 CMIA * mIU/mL'])
    expect(values.lh).toBe(4.48)
  })

  it('does not match a short code buried mid-word', () => {
    // "Alkalna" must not be read as LH/ALP via a stray substring.
    const { values } = parseLabLines(['Holesterol 5,2 mmol/L'])
    expect(values.lh).toBeUndefined()
    expect(values.chol).toBe(5.2)
  })
})

describe('differential blood count (two ranges per row)', () => {
  it('pairs the absolute range with the absolute value, not the % range', () => {
    const { values, ranges } = parseLabLines(['Monociti 8,8 2,0-10,0 0,35 0,08-1,00 x 10⁹/L'])
    expect(values.monocytes).toBe(0.35)
    expect(ranges.monocytes).toEqual({ lo: 0.08, hi: 1 })
  })
})

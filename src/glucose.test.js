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

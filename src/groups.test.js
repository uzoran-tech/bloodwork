import { describe, it, expect } from 'vitest'
import { MARKERS, GROUPS, markerById } from './catalog.js'

describe('connected-marker groups', () => {
  it('every grouped marker references a defined group and has a sub-label', () => {
    for (const m of MARKERS) {
      if (!m.group) continue
      expect(GROUPS[m.group], `group "${m.group}" for ${m.id}`).toBeDefined()
      expect(typeof m.groupSub).toBe('string')
    }
  })

  it('each defined group has at least two member markers', () => {
    const counts = {}
    for (const m of MARKERS) if (m.group) counts[m.group] = (counts[m.group] || 0) + 1
    for (const key of Object.keys(GROUPS)) expect(counts[key]).toBeGreaterThanOrEqual(2)
  })

  it('glucose and insulin variants belong to their groups', () => {
    expect(markerById('glucose').group).toBe('glucose')
    expect(markerById('glucose2h').group).toBe('glucose')
    expect(markerById('insulin').group).toBe('insulin')
    expect(markerById('insulin2h').group).toBe('insulin')
  })
})

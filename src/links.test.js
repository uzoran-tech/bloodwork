import { describe, it, expect } from 'vitest'
import { webLinks } from './links.js'
import { markerById, MARKERS } from './catalog.js'

describe('webLinks', () => {
  it('gives Free T4 a specific Wikipedia article + the verified MedlinePlus page', () => {
    const links = webLinks(markerById('ft4'))
    expect(links[0]).toEqual({
      title: 'Thyroxine (T4)',
      source: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Thyroxine',
    })
    expect(links[1].source).toBe('MedlinePlus · NIH')
    expect(links[1].url).toBe('https://medlineplus.gov/lab-tests/thyroxine-t4-test/')
  })

  it('always returns at least one link, titled by the article (never a bare source name)', () => {
    for (const m of MARKERS) {
      const links = webLinks(m)
      expect(links.length).toBeGreaterThanOrEqual(1)
      for (const l of links) {
        expect(l.title).toBeTruthy()
        expect(l.title).not.toBe(l.source) // title is the article, not the source
        expect(l.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('falls back to a Wikipedia search-go link (never a 404) for uncurated markers', () => {
    // A custom marker isn't in the curated map.
    const custom = { id: 'x_foo', name: 'Some Novel Analyte', unit: '%', panel: 'Other', aliases: [] }
    const [link] = webLinks(custom)
    expect(link.source).toBe('Wikipedia')
    expect(link.url).toContain('go=Go')
  })
})

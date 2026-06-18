import { describe, it, expect, vi, beforeEach } from 'vitest'

// Shared, resettable mock state for the chainable Supabase query builder.
const state = {
  calls: [],
  list: { data: [], error: null }, // resolves .order() (listReports)
  existing: { data: null, error: null }, // resolves .maybeSingle() (save lookup)
  upserted: { data: null, error: null }, // resolves .single() (after upsert)
  mutate: { error: null }, // resolves delete chains (thenable)
}

function builder() {
  const b = {
    // chainable
    select: vi.fn(() => b),
    eq: vi.fn((col, val) => {
      state.calls.push(['eq', col, val])
      return b
    }),
    upsert: vi.fn((row, opts) => {
      state.calls.push(['upsert', row, opts])
      return b
    }),
    delete: vi.fn(() => {
      state.calls.push(['delete'])
      return b
    }),
    not: vi.fn((...a) => {
      state.calls.push(['not', ...a])
      return b
    }),
    // terminal
    order: vi.fn(() => Promise.resolve(state.list)),
    maybeSingle: vi.fn(() => Promise.resolve(state.existing)),
    single: vi.fn(() => Promise.resolve(state.upserted)),
    // makes `await <chain>` (delete/not) resolve to the mutate result
    then: (resolve) => resolve(state.mutate),
  }
  return b
}

vi.mock('./supabaseClient.js', () => ({
  supabase: { from: vi.fn(() => builder()) },
}))

import { listReports, saveReport, deleteReport, clearAllReports } from './dataStore.js'

beforeEach(() => {
  state.calls = []
  state.list = { data: [], error: null }
  state.existing = { data: null, error: null }
  state.upserted = { data: null, error: null }
  state.mutate = { error: null }
})

describe('listReports', () => {
  it('returns the rows from Supabase', async () => {
    state.list = { data: [{ id: '1', date: '2024-01-01', values: {} }], error: null }
    const out = await listReports()
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe('1')
  })

  it('returns [] when data is null', async () => {
    state.list = { data: null, error: null }
    expect(await listReports()).toEqual([])
  })

  it('throws on error', async () => {
    state.list = { data: null, error: new Error('boom') }
    await expect(listReports()).rejects.toThrow('boom')
  })
})

describe('saveReport', () => {
  it('upserts a fresh report when none exists for the date', async () => {
    state.existing = { data: null, error: null }
    state.upserted = { data: { id: 'new', date: '2024-01-01', values: { tsh: 1.5 } }, error: null }
    await saveReport({ date: '2024-01-01', values: { tsh: 1.5 } })
    const upsert = state.calls.find((c) => c[0] === 'upsert')
    expect(upsert[1].values).toEqual({ tsh: 1.5 })
    expect(upsert[1].id).toBeUndefined()
    expect(upsert[2]).toEqual({ onConflict: 'user_id,date' })
  })

  it('merges into and reuses the id of an existing same-date report', async () => {
    state.existing = {
      data: { id: 'ex1', date: '2024-01-01', lab: 'Medlab', sample: '', notes: '', values: { tsh: 1.5 } },
      error: null,
    }
    state.upserted = { data: { id: 'ex1' }, error: null }
    await saveReport({ date: '2024-01-01', lab: '', values: { vitd: 32 } })
    const upsert = state.calls.find((c) => c[0] === 'upsert')
    expect(upsert[1].id).toBe('ex1')
    expect(upsert[1].values).toEqual({ tsh: 1.5, vitd: 32 })
    expect(upsert[1].lab).toBe('Medlab') // existing lab preserved
  })

  it('throws if the lookup fails', async () => {
    state.existing = { data: null, error: new Error('select failed') }
    await expect(saveReport({ date: '2024-01-01', values: {} })).rejects.toThrow('select failed')
  })
})

describe('deleteReport', () => {
  it('deletes by id', async () => {
    await deleteReport('abc')
    expect(state.calls).toContainEqual(['delete'])
    expect(state.calls).toContainEqual(['eq', 'id', 'abc'])
  })

  it('throws on error', async () => {
    state.mutate = { error: new Error('nope') }
    await expect(deleteReport('abc')).rejects.toThrow('nope')
  })
})

describe('clearAllReports', () => {
  it('issues a filtered delete of own rows', async () => {
    await clearAllReports()
    expect(state.calls).toContainEqual(['delete'])
    expect(state.calls.some((c) => c[0] === 'not')).toBe(true)
  })

  it('throws on error', async () => {
    state.mutate = { error: new Error('denied') }
    await expect(clearAllReports()).rejects.toThrow('denied')
  })
})

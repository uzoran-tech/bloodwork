import { describe, it, expect } from 'vitest'
import { mergeReport, parseCSV, toCSV, sortByDate } from './store.js'

describe('mergeReport', () => {
  it('appends a new report when the date is unseen', () => {
    const out = mergeReport([], { date: '2024-01-01', values: { tsh: 1.5 } })
    expect(out).toHaveLength(1)
    expect(out[0].values).toEqual({ tsh: 1.5 })
    expect(out[0].id).toBeTruthy()
  })

  it('combines values into the existing report for the same date', () => {
    const start = mergeReport([], { date: '2024-01-01', values: { tsh: 1.5 } })
    const out = mergeReport(start, { date: '2024-01-01', values: { vitd: 32 } })
    expect(out).toHaveLength(1)
    expect(out[0].values).toEqual({ tsh: 1.5, vitd: 32 })
  })

  it('overwrites a marker value when the same marker is re-reported', () => {
    const start = mergeReport([], { date: '2024-01-01', values: { tsh: 1.5 } })
    const out = mergeReport(start, { date: '2024-01-01', values: { tsh: 2.0 } })
    expect(out[0].values.tsh).toBe(2.0)
  })

  it('keeps existing lab/notes when the incoming report omits them', () => {
    const start = mergeReport([], { date: '2024-01-01', lab: 'Medlab', notes: 'fasting', values: { tsh: 1.5 } })
    const out = mergeReport(start, { date: '2024-01-01', lab: '', notes: '', values: { vitd: 32 } })
    expect(out[0].lab).toBe('Medlab')
    expect(out[0].notes).toBe('fasting')
  })
})

describe('sortByDate', () => {
  it('sorts ascending by date without mutating the input', () => {
    const input = [{ date: '2024-03-01' }, { date: '2024-01-01' }, { date: '2024-02-01' }]
    const out = sortByDate(input)
    expect(out.map((r) => r.date)).toEqual(['2024-01-01', '2024-02-01', '2024-03-01'])
    expect(input[0].date).toBe('2024-03-01')
  })
})

describe('parseCSV', () => {
  it('imports valid rows and merges by date', () => {
    const { reports, imported, errors } = parseCSV('2024-01-01,tsh,1.71\n2024-01-01,vitd,32')
    expect(imported).toBe(2)
    expect(errors).toHaveLength(0)
    expect(reports).toHaveLength(1)
    expect(reports[0].values).toEqual({ tsh: 1.71, vitd: 32 })
  })

  it('skips a header row and reports unknown markers', () => {
    const { imported, errors } = parseCSV('date,marker,value\n2024-01-01,not_a_marker,5')
    expect(imported).toBe(0)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts dd.mm.yyyy dates and comma decimals', () => {
    const { reports, imported } = parseCSV('10.06.2024,tsh,1,71')
    expect(imported).toBe(1)
    expect(reports[0].date).toBe('2024-06-10')
  })
})

describe('toCSV', () => {
  it('round-trips through parseCSV', () => {
    const { reports } = parseCSV('2024-01-01,tsh,1.71')
    const csv = toCSV(reports)
    expect(csv.split('\n')[0]).toBe('date,marker,value,unit')
    const again = parseCSV(csv)
    expect(again.reports[0].values.tsh).toBe(1.71)
  })
})

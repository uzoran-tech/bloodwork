import { supabase } from './supabaseClient.js'
import { mergeReport } from './store.js'

// Per-user report access. Row-Level Security scopes every query to the signed-in
// user, so these never need an explicit user filter. Row shape matches the
// client report shape ({ id, date, lab, sample, notes, values }).

const COLS = 'id, date, lab, sample, notes, values'

export async function listReports() {
  const { data, error } = await supabase.from('reports').select(COLS).order('date', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Insert-or-merge by date, preserving mergeReport's "one report per date,
// combine values, keep existing lab/sample/notes" semantics.
export async function saveReport(report) {
  const { data: existing, error: selErr } = await supabase
    .from('reports')
    .select(COLS)
    .eq('date', report.date)
    .maybeSingle()
  if (selErr) throw selErr

  // mergeReport returns the full list; with at most one existing row for this
  // date, the merged report for report.date is the row we upsert.
  const merged = mergeReport(existing ? [existing] : [], report).find((r) => r.date === report.date)

  const row = {
    date: merged.date,
    lab: merged.lab || '',
    sample: merged.sample || '',
    notes: merged.notes || '',
    values: merged.values,
  }
  if (existing) row.id = existing.id

  const { data, error } = await supabase
    .from('reports')
    .upsert(row, { onConflict: 'user_id,date' })
    .select(COLS)
    .single()
  if (error) throw error
  return data
}

export async function deleteReport(id) {
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) throw error
}

export async function clearAllReports() {
  // RLS limits this to the caller's own rows; the filter is required by the API.
  const { error } = await supabase.from('reports').delete().not('id', 'is', null)
  if (error) throw error
}

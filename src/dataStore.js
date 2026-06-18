import { supabase } from './supabaseClient.js'
import { mergeReport } from './store.js'

// Per-user report access. Row-Level Security scopes every query to the signed-in
// user, so these never need an explicit user filter. Row shape matches the
// client report shape ({ id, date, lab, sample, notes, values, ranges }).
//
// `ranges` (per-report reference ranges captured at import) lives in a jsonb
// column added after launch. We select '*' and tolerate its absence so the app
// keeps working on a project that hasn't run the migration yet — see README.

export async function listReports() {
  const { data, error } = await supabase.from('reports').select('*').order('date', { ascending: true })
  if (error) throw error
  return data ?? []
}

// True when an error is Postgres complaining about a missing `ranges` column,
// i.e. the migration hasn't been run. In that case we retry without ranges.
const isMissingRangesColumn = (error) =>
  error && (error.code === '42703' || /ranges/i.test(error.message || ''))

// Insert-or-merge by date, preserving mergeReport's "one report per date,
// combine values, keep existing lab/sample/notes" semantics.
export async function saveReport(report) {
  const { data: existing, error: selErr } = await supabase
    .from('reports')
    .select('*')
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
    ranges: merged.ranges || {},
  }
  if (existing) row.id = existing.id

  let { data, error } = await supabase
    .from('reports')
    .upsert(row, { onConflict: 'user_id,date' })
    .select('*')
    .single()

  // Older project without the `ranges` column: drop it and retry once.
  if (error && isMissingRangesColumn(error)) {
    const { ranges, ...rest } = row
    void ranges
    ;({ data, error } = await supabase
      .from('reports')
      .upsert(rest, { onConflict: 'user_id,date' })
      .select('*')
      .single())
  }
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

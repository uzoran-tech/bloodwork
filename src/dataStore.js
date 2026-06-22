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

// True when an error is Postgres complaining about a missing column (the
// `ranges`/`markers` migrations haven't been run). We retry without them.
const isMissingColumn = (error) =>
  error && (error.code === '42703' || /column .* does not exist|ranges|markers/i.test(error.message || ''))

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
    markers: merged.markers || {},
  }
  if (existing) row.id = existing.id

  let { data, error } = await supabase
    .from('reports')
    .upsert(row, { onConflict: 'user_id,date' })
    .select('*')
    .single()

  // Older project without the `ranges`/`markers` columns. Dropping them would
  // silently lose the report's own reference ranges (so values get judged
  // against generic catalog defaults) and any new custom markers (which would
  // appear then vanish). When the report actually carries that data, fail
  // loudly with an actionable message instead of saving a degraded row.
  if (error && isMissingColumn(error)) {
    if (Object.keys(row.ranges || {}).length > 0 || Object.keys(row.markers || {}).length > 0) {
      throw new Error(
        'This import needs a one-time database update so the report’s reference ranges (and any new markers) are saved — otherwise values are judged against generic defaults. Run the ranges and markers migrations from the README, then import again.'
      )
    }
    const { ranges, markers, ...rest } = row
    void ranges
    void markers
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

// Remove a single marker's reading from one report (its value, range, and any
// custom def). If that was the report's last value, delete the whole report.
export async function removeReading(reportId, markerId) {
  const { data: rep, error: selErr } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .maybeSingle()
  if (selErr) throw selErr
  if (!rep) return

  const values = { ...(rep.values || {}) }
  const ranges = { ...(rep.ranges || {}) }
  const markers = { ...(rep.markers || {}) }
  delete values[markerId]
  delete ranges[markerId]
  delete markers[markerId]

  if (Object.keys(values).length === 0) {
    const { error } = await supabase.from('reports').delete().eq('id', reportId)
    if (error) throw error
    return
  }

  const row = { values, ranges, markers }
  let { error } = await supabase.from('reports').update(row).eq('id', reportId)
  if (error && isMissingColumn(error)) {
    const { ranges: _r, markers: _m, ...rest } = row
    void _r
    void _m
    ;({ error } = await supabase.from('reports').update(rest).eq('id', reportId))
  }
  if (error) throw error
}

export async function clearAllReports() {
  // RLS limits this to the caller's own rows; the filter is required by the API.
  const { error } = await supabase.from('reports').delete().not('id', 'is', null)
  if (error) throw error
}

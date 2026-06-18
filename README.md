# BloodTrack 🩸

Track your bloodwork over time. BloodTrack charts every lab marker against
its reference range, spots trends across years of results, and surfaces
plain-language insights — all on your device.

A mobile-first PWA built with React + Vite. Each person signs in with their
own account; results are stored privately per user in Supabase (Postgres +
Auth), isolated by Row-Level Security so no two accounts can see each other's
data.

## Features

- **Overview dashboard** — how many markers are in range, an attention list
  for out-of-range values, and rule-based insights (back-in-range moves,
  significant changes, long-term averages).
- **Trends** — every marker grouped by panel with sparklines; tap one for a
  full chart with its reference band, change-over-time stats, and history.
- **Add results four ways** — manual entry, CSV import (English or Serbian
  marker names; `2024-06-10` or `10.06.2024` dates), **PDF upload** that
  reads the text layer of lab reports, or **photo scan** that OCRs a picture
  of a paper report on-device — with a review step before anything is saved.
- **Learn** — a plain-language "what is this / good to know" explainer for
  each of ~50 markers.
- **Light & dark themes**, friendly icons, smooth animations, offline support,
  and an "Add to Home Screen" install experience on iOS.

## Accounts & cloud setup (Supabase)

Authentication and per-user storage run on [Supabase](https://supabase.com).
The app reads two build-time env vars — `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` — which are inlined into the bundle. They are
public/safe: Row-Level Security is the real access boundary. **Never** put the
`service_role` key in the client, CI, or this repo.

One-time setup:

1. **Create a Supabase project** (choose an EU region, e.g. Frankfurt, for
   health data). From **Settings → API**, copy the **Project URL** and the
   **anon public** key.
2. **Run the schema** in the SQL Editor:

   ```sql
   create table public.reports (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
     date date not null,
     lab text not null default '',
     sample text not null default '',
     notes text not null default '',
     values jsonb not null default '{}'::jsonb,
     ranges jsonb not null default '{}'::jsonb,
     created_at timestamptz not null default now(),
     unique (user_id, date)
   );
   create index reports_user_date_idx on public.reports (user_id, date);
   alter table public.reports enable row level security;
   create policy "reports_select_own" on public.reports for select using (user_id = auth.uid());
   create policy "reports_insert_own" on public.reports for insert with check (user_id = auth.uid());
   create policy "reports_update_own" on public.reports for update using (user_id = auth.uid()) with check (user_id = auth.uid());
   create policy "reports_delete_own" on public.reports for delete using (user_id = auth.uid());

   -- Table-level privileges for the API roles. RLS (above) still restricts every
   -- row to its owner; without these grants Postgres rejects all access with
   -- "permission denied for table reports" before RLS is even evaluated.
   grant usage on schema public to anon, authenticated;
   grant select, insert, update, delete on table public.reports to anon, authenticated;
   ```

   **Already created the table before this column existed?** Add it once:

   ```sql
   alter table public.reports add column if not exists ranges jsonb not null default '{}'::jsonb;
   ```

   `ranges` stores each report's own printed reference range per marker (e.g.
   `{"urea": {"lo": 3.0, "hi": 9.2}}`), so a value is judged against the lab's
   range rather than a generic default. The app tolerates the column being
   absent (it falls back to the catalog range), but interpretation is only
   correct once it's added and reports are re-imported.

3. **Auth → URL Configuration**: set **Site URL** to your deployed URL
   (`https://<you>.github.io/bloodwork/`) and add it to **Redirect URLs**
   (plus `http://localhost:5174/` for local dev). These are where email
   confirmation and password-reset links return. Enable **Confirm email** and
   set the minimum password length to 8.
4. **GitHub → Settings → Secrets and variables → Actions**: add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` so the deploy workflow can
   inject them at build time.

For local dev, copy `.env.example` to `.env` and fill in the same two values.
(The app still builds without them — it just can't authenticate.)

## Run it

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev            # http://localhost:5174
```

Production build:

```bash
npm run build
npm run preview
```

Run the tests:

```bash
npm test
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
app (injecting the `VITE_SUPABASE_*` secrets) and publishes it to a `gh-pages`
branch. GitHub Pages then serves it at
`https://<your-username>.github.io/bloodwork/`. (First time: this also
auto-enables Pages on a public repo.)

The Vite `base` is relative (`./`), so the same build works at any path.

## Privacy & disclaimer

Each account's reports are stored privately in Supabase and isolated by
Row-Level Security; the repository contains no personal data. Moving results
to the cloud is a deliberate change from the app's earlier on-device-only
model — host it in an EU region for health data. BloodTrack describes your
numbers against general reference ranges and is **not medical advice** —
always interpret results with your doctor.

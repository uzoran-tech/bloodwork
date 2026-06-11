# BloodTrack 🩸

Track your bloodwork over time. BloodTrack charts every lab marker against
its reference range, spots trends across years of results, and surfaces
plain-language insights — all on your device.

A mobile-first PWA built with React + Vite. No backend; your results live in
the browser's local storage and never leave your phone.

## Features

- **Overview dashboard** — how many markers are in range, an attention list
  for out-of-range values, and rule-based insights (back-in-range moves,
  significant changes, long-term averages).
- **Trends** — every marker grouped by panel with sparklines; tap one for a
  full chart with its reference band, change-over-time stats, and history.
- **Add results three ways** — manual entry, CSV import (English or Serbian
  marker names; `2024-06-10` or `10.06.2024` dates), or **PDF upload** that
  reads the text layer of lab reports and lets you review every value before
  saving.
- **Learn** — a plain-language "what is this / good to know" explainer for
  each of ~50 markers.
- **Light & dark themes**, friendly icons, smooth animations, offline support,
  and an "Add to Home Screen" install experience on iOS.

## Run it

```bash
npm install
npm run dev        # http://localhost:5174
```

Production build:

```bash
npm run build
npm run preview
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
app and publishes it to a `gh-pages` branch. GitHub Pages then serves it at
`https://<your-username>.github.io/bloodtrack/`. (First time: this also
auto-enables Pages on a public repo.)

The Vite `base` is relative (`./`), so the same build works at any path.

## Privacy & disclaimer

BloodTrack stores everything locally and contains no personal data in the
repository. It describes your numbers against general reference ranges and is
**not medical advice** — always interpret results with your doctor.

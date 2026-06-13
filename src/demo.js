// Five years of plausible demo data so the app shows real visuals before any
// import. Deterministic (seeded) so everyone sees the same demo.

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const rand = rng(42)
const jitter = (v, amp) => v + (rand() - 0.5) * 2 * amp

// Each entry: marker id → trajectory of base values across the 11 semi-annual
// tests (2021 → 2026). Roughly: vit D improves, LDL improves, ferritin dips
// then recovers, homocysteine drifts up, the rest wobble in range.
const TRAJECTORIES = {
  tsh: [2.8, 2.9, 3.1, 2.6, 2.4, 2.2, 2.0, 1.9, 1.8, 1.7, 1.7],
  ft4: [11.0, 11.5, 11.2, 12.0, 12.4, 12.1, 12.6, 12.8, 12.5, 12.7, 12.7],
  testosterone: [14.0, 14.5, 15.2, 16.0, 15.5, 16.8, 17.5, 18.2, 19.0, 20.1, 21.0],
  vitd: [32, 35, 41, 47, 52, 58, 63, 60, 66, 70, 74],
  b12: [310, 340, 380, 420, 460, 520, 560, 600, 640, 680, 720],
  ferritin: [120, 95, 70, 45, 28, 36, 55, 70, 82, 88, 92],
  homocysteine: [7.0, 7.2, 7.5, 7.9, 8.1, 8.4, 8.6, 8.9, 9.2, 9.6, 10.1],
  glucose: [5.4, 5.6, 5.3, 5.8, 5.5, 5.2, 5.4, 5.1, 5.3, 5.0, 5.2],
  chol: [6.1, 5.9, 5.8, 5.5, 5.4, 5.2, 5.0, 4.9, 4.8, 4.7, 4.6],
  ldl: [4.1, 3.9, 3.8, 3.6, 3.4, 3.2, 3.1, 3.0, 2.9, 2.8, 2.7],
  hdl: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.3, 1.4, 1.4],
  trig: [2.2, 2.0, 1.9, 1.8, 1.6, 1.5, 1.4, 1.4, 1.3, 1.2, 1.2],
  hgb: [148, 150, 146, 152, 149, 151, 153, 150, 152, 154, 151],
  alt: [35, 38, 44, 40, 36, 33, 30, 28, 27, 26, 25],
  crp: [4.2, 3.8, 6.1, 2.9, 2.2, 1.8, 1.5, 1.9, 1.4, 1.2, 1.1],
}

const AMPLITUDE = {
  tsh: 0.15, ft4: 0.3, testosterone: 0.6, vitd: 2, b12: 15, ferritin: 4,
  homocysteine: 0.2, glucose: 0.1, chol: 0.1, ldl: 0.08, hdl: 0.04, trig: 0.06,
  hgb: 2, alt: 2, crp: 0.2,
}

export function demoReports() {
  const reports = []
  const start = new Date('2021-03-15')
  for (let i = 0; i < 11; i++) {
    const d = new Date(start)
    d.setMonth(d.getMonth() + i * 6)
    const date = d.toISOString().slice(0, 10)
    const values = {}
    for (const [id, traj] of Object.entries(TRAJECTORIES)) {
      // skip some markers in some years so the data looks organically sparse
      if (rand() < 0.12 && i !== 0 && i !== 10) continue
      values[id] = round(jitter(traj[i], AMPLITUDE[id]), id)
    }
    reports.push({ id: `demo-${i}`, date, lab: 'MEDLAB', sample: 'Serum', notes: i === 0 ? 'Baseline' : '', values })
  }
  return reports
}

function round(v, id) {
  const coarse = ['b12', 'vitd', 'ferritin', 'hgb', 'alt'].includes(id)
  return Math.round(v * (coarse ? 1 : 100)) / (coarse ? 1 : 100)
}

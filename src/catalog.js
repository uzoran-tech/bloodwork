// Marker catalog. Units and reference ranges follow SI conventions common to
// European labs. Ranges are general adult defaults — labs vary, and your own
// report's range always wins for interpretation. lo/hi of null = one-sided.

export const MARKERS = [
  // Hormones
  { id: 'tsh', name: 'TSH', unit: 'µIU/mL', panel: 'Hormones', lo: 0.35, hi: 4.94, aliases: ['hstsh', 'thyroid stimulating hormone'] },
  { id: 'ft4', name: 'Free T4', unit: 'pmol/L', panel: 'Hormones', lo: 9.0, hi: 19.1, aliases: ['slobodni t4', 'free thyroxine', 'ft4'] },
  { id: 'ft3', name: 'Free T3', unit: 'pmol/L', panel: 'Hormones', lo: 2.9, hi: 6.8, aliases: ['slobodni t3', 'ft3'] },
  { id: 'testosterone', name: 'Testosterone (total)', unit: 'nmol/L', panel: 'Hormones', lo: 7.66, hi: 24.82, aliases: ['testosteron', 'testosteron uk', 'total testosterone'] },
  { id: 'estradiol', name: 'Estradiol', unit: 'pg/mL', panel: 'Hormones', lo: null, hi: 56, aliases: ['e2'] },
  { id: 'freetesto', name: 'Testosterone (free)', unit: 'pg/mL', panel: 'Hormones', lo: 2.15, hi: 16.5, aliases: ['free testosteron', 'slobodni testosteron'] },
  { id: 'igf1', name: 'IGF-1', unit: 'ng/mL', panel: 'Hormones', lo: 88.5, hi: 216, aliases: ['igf-1', 'somatomedin c'] },
  { id: 'cortisol', name: 'Cortisol (morning)', unit: 'nmol/L', panel: 'Hormones', lo: 101.2, hi: 536.7, aliases: ['kortizol', 'kortizol jutarnji'] },
  // Tumor markers
  { id: 'psa', name: 'PSA (total)', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 3.5, aliases: ['ukupni psa', 'prostate specific antigen'] },
  { id: 'cea', name: 'CEA', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 5, aliases: ['carcinoembryonic antigen'] },
  // Vitamins & minerals
  { id: 'vitd', name: 'Vitamin D (25-OH)', unit: 'nmol/L', panel: 'Vitamins & Minerals', lo: 50, hi: 150, aliases: ['vitamin 25-oh d', '25-oh d', 'vitamin d'] },
  { id: 'b12', name: 'Vitamin B12', unit: 'pg/mL', panel: 'Vitamins & Minerals', lo: 197, hi: 771, aliases: ['vitamin b12', 'cobalamin'] },
  { id: 'folate', name: 'Folate', unit: 'ng/mL', panel: 'Vitamins & Minerals', lo: 3.9, hi: 26.8, aliases: ['folna kiselina', 'folic acid'] },
  { id: 'ferritin', name: 'Ferritin', unit: 'ng/mL', panel: 'Vitamins & Minerals', lo: 30, hi: 400, aliases: ['feritin'] },
  { id: 'iron', name: 'Iron (serum)', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 11.6, hi: 31.3, aliases: ['gvozdje', 'gvozde', 'fe'] },
  { id: 'zinc', name: 'Zinc', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 7.0, hi: 23.0, aliases: ['cink', 'zn'] },
  { id: 'magnesium', name: 'Magnesium', unit: 'mmol/L', panel: 'Vitamins & Minerals', lo: 0.66, hi: 1.07, aliases: ['mg', 'magnezijum'] },
  // Metabolic
  { id: 'glucose', name: 'Glucose (fasting)', unit: 'mmol/L', panel: 'Metabolic', lo: 3.9, hi: 6.1, aliases: ['glukoza', 'secer'] },
  { id: 'hba1c', name: 'HbA1c', unit: '%', panel: 'Metabolic', lo: 4.0, hi: 5.7, aliases: ['glikozilirani hemoglobin'] },
  { id: 'homocysteine', name: 'Homocysteine', unit: 'µmol/L', panel: 'Metabolic', lo: 5.5, hi: 16.2, aliases: ['homocystein', 'homocistein'] },
  { id: 'insulin', name: 'Insulin (fasting)', unit: 'µIU/mL', panel: 'Metabolic', lo: 2.6, hi: 24.9, aliases: [] },
  { id: 'uricacid', name: 'Uric acid', unit: 'µmol/L', panel: 'Metabolic', lo: 208, hi: 428, aliases: ['mokracna kiselina'] },
  // Lipids
  { id: 'chol', name: 'Total cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 5.2, aliases: ['holesterol', 'cholesterol'] },
  { id: 'ldl', name: 'LDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 3.4, aliases: ['ldl holesterol'] },
  { id: 'hdl', name: 'HDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: 1.6, hi: null, aliases: ['hdl holesterol'] },
  { id: 'trig', name: 'Triglycerides', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 1.7, aliases: ['trigliceridi'] },
  { id: 'nonhdl', name: 'Non-HDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 3.4, aliases: ['non-hdl holesterol', 'non hdl'] },
  { id: 'apob', name: 'Apolipoprotein B', unit: 'mg/dL', panel: 'Lipids', lo: 49, hi: 173, aliases: ['apo b'] },
  // Blood count
  { id: 'hgb', name: 'Hemoglobin', unit: 'g/L', panel: 'Blood Count', lo: 137, hi: 175, aliases: ['hemoglobin'] },
  { id: 'hct', name: 'Hematocrit', unit: 'L/L', panel: 'Blood Count', lo: 0.4, hi: 0.51, aliases: ['hematokrit'] },
  { id: 'wbc', name: 'White blood cells', unit: '×10⁹/L', panel: 'Blood Count', lo: 4.0, hi: 10.0, aliases: ['leukociti', 'leukocytes'] },
  { id: 'rbc', name: 'Red blood cells', unit: '×10¹²/L', panel: 'Blood Count', lo: 4.5, hi: 6.2, aliases: ['eritrociti', 'erythrocytes'] },
  { id: 'plt', name: 'Platelets', unit: '×10⁹/L', panel: 'Blood Count', lo: 140, hi: 400, aliases: ['trombociti'] },
  { id: 'mcv', name: 'MCV', unit: 'fL', panel: 'Blood Count', lo: 80, hi: 96, aliases: [] },
  { id: 'mch', name: 'MCH', unit: 'pg', panel: 'Blood Count', lo: 27, hi: 32, aliases: [] },
  { id: 'mchc', name: 'MCHC', unit: 'g/L', panel: 'Blood Count', lo: 310, hi: 350, aliases: [] },
  { id: 'neutrophils', name: 'Neutrophils (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 2.0, hi: 7.5, aliases: ['neutrofili'] },
  { id: 'lymphocytes', name: 'Lymphocytes (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0.8, hi: 4.0, aliases: ['limfociti'] },
  { id: 'monocytes', name: 'Monocytes (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0.08, hi: 1.0, aliases: ['monociti'] },
  { id: 'eosinophils', name: 'Eosinophils (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0, hi: 0.4, aliases: ['eozinofili'] },
  { id: 'basophils', name: 'Basophils (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0, hi: 0.1, aliases: ['bazofili'] },
  // Liver & kidney
  { id: 'alt', name: 'ALT', unit: 'U/L', panel: 'Liver & Kidney', lo: null, hi: 41, aliases: ['gpt', 'alanin aminotransferaza'] },
  { id: 'ast', name: 'AST', unit: 'U/L', panel: 'Liver & Kidney', lo: null, hi: 40, aliases: ['got', 'aspartat aminotransferaza'] },
  { id: 'ggt', name: 'GGT', unit: 'U/L', panel: 'Liver & Kidney', lo: null, hi: 60, aliases: ['gama gt'] },
  { id: 'urea', name: 'Urea', unit: 'mmol/L', panel: 'Liver & Kidney', lo: 3.2, hi: 7.4, aliases: [] },
  { id: 'creatinine', name: 'Creatinine', unit: 'µmol/L', panel: 'Liver & Kidney', lo: 53, hi: 114.9, aliases: ['kreatinin'] },
  { id: 'egfr', name: 'eGFR', unit: 'mL/min/1.73m²', panel: 'Liver & Kidney', lo: 60, hi: null, aliases: ['klirens kreatinina', 'gfr'] },
  // Inflammation
  { id: 'crp', name: 'CRP', unit: 'mg/L', panel: 'Inflammation', lo: null, hi: 5, aliases: ['c-reactive protein', 'c reaktivni protein'] },
  { id: 'esr', name: 'Sedimentation (1h)', unit: 'mm/h', panel: 'Inflammation', lo: null, hi: 15, aliases: ['sedimentacija', 'se'] },
]

export const PANELS = [...new Set(MARKERS.map((m) => m.panel))]

export const PANEL_ICONS = {
  Hormones: '🧪',
  'Tumor Markers': '🎗️',
  'Vitamins & Minerals': '💊',
  Metabolic: '⚡',
  Lipids: '🫀',
  'Blood Count': '🩸',
  'Liver & Kidney': '🫘',
  Inflammation: '🔥',
}

export const markerById = (id) => MARKERS.find((m) => m.id === id)

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')

// Match a free-text name (CSV import) to a marker id.
export function matchMarker(text) {
  const n = norm(text)
  if (!n) return null
  for (const m of MARKERS) {
    if (norm(m.id) === n || norm(m.name) === n) return m.id
    if (m.aliases.some((a) => norm(a) === n)) return m.id
  }
  for (const m of MARKERS) {
    if (norm(m.name).includes(n) || m.aliases.some((a) => norm(a).includes(n))) return m.id
  }
  return null
}

// The reference range to interpret a value against: the one printed on the
// report (when import captured it) always wins; otherwise the catalog default.
// A report range is { lo, hi } with either side null for a one-sided range.
export function refRange(marker, range) {
  if (range && (range.lo != null || range.hi != null)) {
    return { lo: range.lo ?? null, hi: range.hi ?? null }
  }
  return { lo: marker.lo, hi: marker.hi }
}

export function statusOf(marker, value, range) {
  const { lo, hi } = refRange(marker, range)
  if (lo != null && value < lo) return 'low'
  if (hi != null && value > hi) return 'high'
  return 'normal'
}

export function rangeLabel(m, range) {
  const { lo, hi } = refRange(m, range)
  if (lo != null && hi != null) return `${lo}–${hi}`
  if (hi != null) return `< ${hi}`
  if (lo != null) return `> ${lo}`
  return '—'
}

// Midpoint used to judge whether a change moves toward or away from "ideal".
export function midOf(m) {
  if (m.lo != null && m.hi != null) return (m.lo + m.hi) / 2
  if (m.hi != null) return m.hi * 0.5
  return m.lo * 1.5
}

// Curated "Learn more" links per marker. Each link shows the ARTICLE title with
// the source underneath. Wikipedia gives a specific, stable article for every
// marker (with a search fallback that never 404s); MedlinePlus lab-test pages
// are added where a real, verified page exists.

const wikiUrl = (page) => `https://en.wikipedia.org/wiki/${encodeURIComponent(page.replace(/ /g, '_'))}`
const wikiSearch = (term) =>
  `https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(term)}&go=Go`
const medUrl = (slug) => `https://medlineplus.gov/lab-tests/${slug}/`

// id -> { title (article name shown), page (Wikipedia article) }
const WIKI = {
  // Thyroid / hormones
  tsh: { title: 'Thyroid-stimulating hormone (TSH)', page: 'Thyroid-stimulating hormone' },
  ft4: { title: 'Thyroxine (T4)', page: 'Thyroxine' },
  tt4: { title: 'Thyroxine (T4)', page: 'Thyroxine' },
  ft3: { title: 'Triiodothyronine (T3)', page: 'Triiodothyronine' },
  tt3: { title: 'Triiodothyronine (T3)', page: 'Triiodothyronine' },
  tpoab: { title: 'Anti-thyroid antibodies', page: 'Anti-thyroid autoantibodies' },
  tgab: { title: 'Anti-thyroid antibodies', page: 'Anti-thyroid autoantibodies' },
  thyroglobulin: { title: 'Thyroglobulin', page: 'Thyroglobulin' },
  testosterone: { title: 'Testosterone', page: 'Testosterone' },
  freetesto: { title: 'Testosterone', page: 'Testosterone' },
  estradiol: { title: 'Estradiol', page: 'Estradiol' },
  progesterone: { title: 'Progesterone', page: 'Progesterone' },
  lh: { title: 'Luteinizing hormone (LH)', page: 'Luteinizing hormone' },
  fsh: { title: 'Follicle-stimulating hormone (FSH)', page: 'Follicle-stimulating hormone' },
  prolactin: { title: 'Prolactin', page: 'Prolactin' },
  shbg: { title: 'Sex hormone-binding globulin', page: 'Sex hormone-binding globulin' },
  dheas: { title: 'DHEA sulfate (DHEA-S)', page: 'Dehydroepiandrosterone sulfate' },
  androstenedione: { title: 'Androstenedione', page: 'Androstenedione' },
  ohp17: { title: '17α-Hydroxyprogesterone', page: '17α-Hydroxyprogesterone' },
  amh: { title: 'Anti-Müllerian hormone', page: 'Anti-Müllerian hormone' },
  betahcg: { title: 'Human chorionic gonadotropin (hCG)', page: 'Human chorionic gonadotropin' },
  cortisol: { title: 'Cortisol', page: 'Cortisol' },
  acth: { title: 'Adrenocorticotropic hormone (ACTH)', page: 'Adrenocorticotropic hormone' },
  aldosterone: { title: 'Aldosterone', page: 'Aldosterone' },
  igf1: { title: 'Insulin-like growth factor 1 (IGF-1)', page: 'Insulin-like growth factor 1' },
  gh: { title: 'Growth hormone', page: 'Growth hormone' },
  pth: { title: 'Parathyroid hormone (PTH)', page: 'Parathyroid hormone' },
  insulin: { title: 'Insulin', page: 'Insulin' },
  insulin2h: { title: 'Insulin', page: 'Insulin' },
  cpeptide: { title: 'C-peptide', page: 'C-peptide' },
  // Tumor markers
  psa: { title: 'Prostate-specific antigen (PSA)', page: 'Prostate-specific antigen' },
  freepsa: { title: 'Prostate-specific antigen (PSA)', page: 'Prostate-specific antigen' },
  cea: { title: 'Carcinoembryonic antigen (CEA)', page: 'Carcinoembryonic antigen' },
  afp: { title: 'Alpha-fetoprotein (AFP)', page: 'Alpha-fetoprotein' },
  ca125: { title: 'CA-125', page: 'CA-125' },
  nse: { title: 'Neuron-specific enolase', page: 'Neuron-specific enolase' },
  // Vitamins & minerals
  vitd: { title: 'Vitamin D', page: 'Vitamin D' },
  b12: { title: 'Vitamin B12', page: 'Vitamin B12' },
  folate: { title: 'Folate (vitamin B9)', page: 'Folate' },
  vitb1: { title: 'Thiamine (vitamin B1)', page: 'Thiamine' },
  vitb6: { title: 'Vitamin B6', page: 'Vitamin B6' },
  vita: { title: 'Vitamin A', page: 'Vitamin A' },
  vite: { title: 'Vitamin E', page: 'Vitamin E' },
  vitc: { title: 'Vitamin C', page: 'Vitamin C' },
  ferritin: { title: 'Ferritin', page: 'Ferritin' },
  iron: { title: 'Serum iron', page: 'Serum iron' },
  transferrin: { title: 'Transferrin', page: 'Transferrin' },
  tibc: { title: 'Total iron-binding capacity', page: 'Total iron-binding capacity' },
  uibc: { title: 'Total iron-binding capacity', page: 'Total iron-binding capacity' },
  tsat: { title: 'Transferrin saturation', page: 'Transferrin saturation' },
  ceruloplasmin: { title: 'Ceruloplasmin', page: 'Ceruloplasmin' },
  // Metabolic
  glucose: { title: 'Blood sugar (glucose)', page: 'Blood sugar level' },
  glucose2h: { title: 'Glucose tolerance test', page: 'Glucose tolerance test' },
  hba1c: { title: 'Glycated hemoglobin (HbA1c)', page: 'Glycated hemoglobin' },
  homocysteine: { title: 'Homocysteine', page: 'Homocysteine' },
  uricacid: { title: 'Uric acid', page: 'Uric acid' },
  lactate: { title: 'Lactic acid', page: 'Lactic acid' },
  // Lipids
  chol: { title: 'Cholesterol', page: 'Cholesterol' },
  ldl: { title: 'Low-density lipoprotein (LDL)', page: 'Low-density lipoprotein' },
  hdl: { title: 'High-density lipoprotein (HDL)', page: 'High-density lipoprotein' },
  trig: { title: 'Triglycerides', page: 'Triglyceride' },
  nonhdl: { title: 'Cholesterol', page: 'Cholesterol' },
  vldl: { title: 'Very-low-density lipoprotein (VLDL)', page: 'Very low-density lipoprotein' },
  apob: { title: 'Apolipoprotein B', page: 'Apolipoprotein B' },
  apoa1: { title: 'Apolipoprotein A1', page: 'Apolipoprotein A1' },
  lpa: { title: 'Lipoprotein(a)', page: 'Lipoprotein(a)' },
  // Cardiac
  troponin: { title: 'Troponin', page: 'Troponin' },
  ck: { title: 'Creatine kinase (CK)', page: 'Creatine kinase' },
  ckmb: { title: 'Creatine kinase (CK-MB)', page: 'Creatine kinase' },
  ntprobnp: { title: 'Brain natriuretic peptide (NT-proBNP)', page: 'Brain natriuretic peptide' },
  myoglobin: { title: 'Myoglobin', page: 'Myoglobin' },
  // Blood count
  hgb: { title: 'Hemoglobin', page: 'Hemoglobin' },
  hct: { title: 'Hematocrit', page: 'Hematocrit' },
  wbc: { title: 'White blood cell', page: 'White blood cell' },
  rbc: { title: 'Red blood cell', page: 'Red blood cell' },
  plt: { title: 'Platelet', page: 'Platelet' },
  mcv: { title: 'Mean corpuscular volume (MCV)', page: 'Mean corpuscular volume' },
  mch: { title: 'Mean corpuscular hemoglobin (MCH)', page: 'Mean corpuscular hemoglobin' },
  mchc: { title: 'Mean corpuscular hemoglobin concentration', page: 'Mean corpuscular hemoglobin concentration' },
  rdw: { title: 'Red blood cell distribution width (RDW)', page: 'Red blood cell distribution width' },
  mpv: { title: 'Mean platelet volume (MPV)', page: 'Mean platelet volume' },
  neutrophils: { title: 'Neutrophil', page: 'Neutrophil' },
  lymphocytes: { title: 'Lymphocyte', page: 'Lymphocyte' },
  monocytes: { title: 'Monocyte', page: 'Monocyte' },
  eosinophils: { title: 'Eosinophil', page: 'Eosinophil' },
  basophils: { title: 'Basophil', page: 'Basophil' },
  reticulocytes: { title: 'Reticulocyte', page: 'Reticulocyte' },
  // Coagulation
  inr: { title: 'Prothrombin time / INR', page: 'Prothrombin time' },
  pt: { title: 'Prothrombin time', page: 'Prothrombin time' },
  aptt: { title: 'Partial thromboplastin time (aPTT)', page: 'Partial thromboplastin time' },
  fibrinogen: { title: 'Fibrinogen', page: 'Fibrinogen' },
  ddimer: { title: 'D-dimer', page: 'D-dimer' },
  // Liver & kidney
  alt: { title: 'Alanine transaminase (ALT)', page: 'Alanine transaminase' },
  ast: { title: 'Aspartate transaminase (AST)', page: 'Aspartate transaminase' },
  ggt: { title: 'Gamma-glutamyltransferase (GGT)', page: 'Gamma-glutamyltransferase' },
  alp: { title: 'Alkaline phosphatase (ALP)', page: 'Alkaline phosphatase' },
  bilirubin: { title: 'Bilirubin', page: 'Bilirubin' },
  dbilirubin: { title: 'Bilirubin', page: 'Bilirubin' },
  protein: { title: 'Serum total protein', page: 'Serum total protein' },
  albumin: { title: 'Albumin', page: 'Albumin' },
  ldh: { title: 'Lactate dehydrogenase (LDH)', page: 'Lactate dehydrogenase' },
  amylase: { title: 'Amylase', page: 'Amylase' },
  lipase: { title: 'Lipase', page: 'Lipase' },
  urea: { title: 'Blood urea nitrogen (urea)', page: 'Blood urea nitrogen' },
  creatinine: { title: 'Creatinine', page: 'Creatinine' },
  cystatinc: { title: 'Cystatin C', page: 'Cystatin C' },
  egfr: { title: 'Renal function (eGFR)', page: 'Renal function' },
  // Inflammation & immune
  crp: { title: 'C-reactive protein (CRP)', page: 'C-reactive protein' },
  hscrp: { title: 'C-reactive protein (CRP)', page: 'C-reactive protein' },
  esr: { title: 'Erythrocyte sedimentation rate (ESR)', page: 'Erythrocyte sedimentation rate' },
  procalcitonin: { title: 'Procalcitonin', page: 'Procalcitonin' },
  rf: { title: 'Rheumatoid factor', page: 'Rheumatoid factor' },
  c3: { title: 'Complement component 3', page: 'Complement component 3' },
  c4: { title: 'Complement component 4', page: 'Complement component 4' },
  igg: { title: 'Immunoglobulin G (IgG)', page: 'Immunoglobulin G' },
  iga: { title: 'Immunoglobulin A (IgA)', page: 'Immunoglobulin A' },
  igm: { title: 'Immunoglobulin M (IgM)', page: 'Immunoglobulin M' },
  ige: { title: 'Immunoglobulin E (IgE)', page: 'Immunoglobulin E' },
  // Electrolytes
  sodium: { title: 'Sodium in biology', page: 'Sodium in biology' },
  potassium: { title: 'Potassium in biology', page: 'Potassium in biology' },
  calcium: { title: 'Calcium in biology', page: 'Calcium in biology' },
  magnesium: { title: 'Magnesium in biology', page: 'Magnesium in biology' },
}

// id -> { title, slug } for verified MedlinePlus lab-test pages.
const MED = {
  ft4: { title: 'Thyroxine (T4) Test', slug: 'thyroxine-t4-test' },
  tt4: { title: 'Thyroxine (T4) Test', slug: 'thyroxine-t4-test' },
  tsh: { title: 'TSH (Thyroid-Stimulating Hormone) Test', slug: 'tsh-thyroid-stimulating-hormone-test' },
  vitd: { title: 'Vitamin D Test', slug: 'vitamin-d-test' },
  ferritin: { title: 'Ferritin Blood Test', slug: 'ferritin-blood-test' },
  glucose: { title: 'Blood Glucose Test', slug: 'blood-glucose-test' },
  glucose2h: { title: 'Blood Glucose Test', slug: 'blood-glucose-test' },
  chol: { title: 'Cholesterol Levels', slug: 'cholesterol-levels' },
  ldl: { title: 'Cholesterol Levels', slug: 'cholesterol-levels' },
  hdl: { title: 'Cholesterol Levels', slug: 'cholesterol-levels' },
  trig: { title: 'Cholesterol Levels', slug: 'cholesterol-levels' },
  nonhdl: { title: 'Cholesterol Levels', slug: 'cholesterol-levels' },
}
const CBC_SLUG = { title: 'Complete Blood Count (CBC)', slug: 'complete-blood-count-cbc' }
for (const id of ['hgb', 'hct', 'wbc', 'rbc', 'plt', 'mcv', 'mch', 'mchc', 'rdw', 'mpv', 'neutrophils', 'lymphocytes', 'monocytes', 'eosinophils', 'basophils', 'reticulocytes', 'immgran']) {
  MED[id] = CBC_SLUG
}

const cleanName = (m) => m.name.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()

// Returns [{ title, source, url }] — a specific Wikipedia article (or reliable
// search fallback) first, then a MedlinePlus lab-test page when one exists.
export function webLinks(m) {
  const links = []
  const w = WIKI[m.id]
  if (w) links.push({ title: w.title, source: 'Wikipedia', url: wikiUrl(w.page) })
  else links.push({ title: cleanName(m), source: 'Wikipedia', url: wikiSearch(cleanName(m)) })
  const med = MED[m.id]
  if (med) links.push({ title: med.title, source: 'MedlinePlus · NIH', url: medUrl(med.slug) })
  return links
}

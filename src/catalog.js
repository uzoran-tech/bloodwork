// Marker catalog. Units and reference ranges follow SI conventions common to
// European labs. Ranges are general adult defaults — labs vary, and your own
// report's range always wins for interpretation. lo/hi of null = one-sided.

export const MARKERS = [
  // Hormones — thyroid
  { id: 'tsh', name: 'TSH', unit: 'µIU/mL', panel: 'Hormones', lo: 0.35, hi: 4.94, aliases: ['hstsh', 'thyroid stimulating hormone', 'tireostimulirajuci hormon'] },
  { id: 'ft4', name: 'Free T4', unit: 'pmol/L', panel: 'Hormones', lo: 9.0, hi: 19.1, aliases: ['slobodni t4', 'free thyroxine', 'ft4'] },
  { id: 'ft3', name: 'Free T3', unit: 'pmol/L', panel: 'Hormones', lo: 2.9, hi: 6.8, aliases: ['slobodni t3', 'ft3'] },
  { id: 'tt4', name: 'Total T4', unit: 'nmol/L', panel: 'Hormones', lo: 66, hi: 181, aliases: ['ukupni t4', 'total t4', 'tiroksin'] },
  { id: 'tt3', name: 'Total T3', unit: 'nmol/L', panel: 'Hormones', lo: 1.3, hi: 3.1, aliases: ['ukupni t3', 'total t3', 'trijodtironin'] },
  { id: 'tpoab', name: 'Anti-TPO antibodies', unit: 'IU/mL', panel: 'Hormones', lo: null, hi: 34, aliases: ['anti tpo', 'anti-tpo', 'tireoperoksidaza antitela', 'tpo at'] },
  { id: 'tgab', name: 'Anti-Tg antibodies', unit: 'IU/mL', panel: 'Hormones', lo: null, hi: 115, aliases: ['anti tg', 'anti-tg', 'tireoglobulin antitela'] },
  { id: 'thyroglobulin', name: 'Thyroglobulin', unit: 'ng/mL', panel: 'Hormones', lo: null, hi: 55, aliases: ['tireoglobulin'] },
  // Hormones — reproductive & adrenal
  { id: 'testosterone', name: 'Testosterone (total)', unit: 'nmol/L', panel: 'Hormones', lo: 7.66, hi: 24.82, aliases: ['testosteron', 'testosteron uk', 'total testosterone'] },
  { id: 'freetesto', name: 'Testosterone (free)', unit: 'pg/mL', panel: 'Hormones', lo: 2.15, hi: 16.5, aliases: ['free testosteron', 'slobodni testosteron'] },
  { id: 'estradiol', name: 'Estradiol', unit: 'pg/mL', panel: 'Hormones', lo: null, hi: 56, aliases: ['estradiol', 'e2'] },
  { id: 'progesterone', name: 'Progesterone', unit: 'nmol/L', panel: 'Hormones', lo: null, hi: 3.18, aliases: ['progesteron'] },
  { id: 'lh', name: 'LH', unit: 'IU/L', panel: 'Hormones', lo: 1.7, hi: 8.6, aliases: ['luteinizing hormone', 'lutropin', 'luteinizirajuci hormon'] },
  { id: 'fsh', name: 'FSH', unit: 'IU/L', panel: 'Hormones', lo: 1.5, hi: 12.4, aliases: ['follicle stimulating hormone', 'folikulostimulirajuci hormon', 'folitropin'] },
  { id: 'prolactin', name: 'Prolactin', unit: 'ng/mL', panel: 'Hormones', lo: 4.0, hi: 15.2, aliases: ['prolaktin'] },
  { id: 'shbg', name: 'SHBG', unit: 'nmol/L', panel: 'Hormones', lo: 18.3, hi: 54.1, aliases: ['sex hormone binding globulin', 'globulin koji vezuje polne hormone'] },
  { id: 'dheas', name: 'DHEA-S', unit: 'µmol/L', panel: 'Hormones', lo: 2.2, hi: 15.2, aliases: ['dhea sulfat', 'dehidroepiandrosteron sulfat', 'dhea-so4'] },
  { id: 'androstenedione', name: 'Androstenedione', unit: 'ng/mL', panel: 'Hormones', lo: 0.3, hi: 3.3, aliases: ['androstendion', 'androstenedion', '4-androstenedione'] },
  { id: 'ohp17', name: '17-OH Progesterone', unit: 'nmol/L', panel: 'Hormones', lo: null, hi: 6.0, aliases: ['17-oh progesteron', '17 oh progesteron', '17-hidroksiprogesteron'] },
  { id: 'amh', name: 'Anti-Müllerian hormone', unit: 'ng/mL', panel: 'Hormones', lo: 1.0, hi: 9.0, aliases: ['amh', 'anti-milerov hormon'] },
  { id: 'betahcg', name: 'Beta-hCG', unit: 'mIU/mL', panel: 'Hormones', lo: null, hi: 5, aliases: ['beta hcg', 'b-hcg', 'beta-hcg', 'humani horionski gonadotropin'] },
  { id: 'cortisol', name: 'Cortisol (morning)', unit: 'nmol/L', panel: 'Hormones', lo: 101.2, hi: 536.7, aliases: ['kortizol', 'kortizol jutarnji'] },
  { id: 'acth', name: 'ACTH', unit: 'pg/mL', panel: 'Hormones', lo: 7.2, hi: 63.3, aliases: ['adrenokortikotropni hormon'] },
  { id: 'aldosterone', name: 'Aldosterone', unit: 'pg/mL', panel: 'Hormones', lo: 30, hi: 160, aliases: ['aldosteron'] },
  { id: 'igf1', name: 'IGF-1', unit: 'ng/mL', panel: 'Hormones', lo: 88.5, hi: 216, aliases: ['igf-1', 'somatomedin c'] },
  { id: 'gh', name: 'Growth hormone', unit: 'ng/mL', panel: 'Hormones', lo: null, hi: 3.0, aliases: ['hormon rasta', 'somatotropin'] },
  { id: 'pth', name: 'Parathyroid hormone (PTH)', unit: 'pg/mL', panel: 'Hormones', lo: 15, hi: 65, aliases: ['parathormon', 'paratiroidni hormon', 'pth'] },
  // Tumor markers
  { id: 'psa', name: 'PSA (total)', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 3.5, aliases: ['ukupni psa', 'prostate specific antigen', 'psa ukupni'] },
  { id: 'freepsa', name: 'PSA (free)', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: null, aliases: ['slobodni psa', 'free psa'] },
  { id: 'cea', name: 'CEA', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 5, aliases: ['carcinoembryonic antigen', 'karcinoembrionalni antigen'] },
  { id: 'afp', name: 'AFP (alpha-fetoprotein)', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 7, aliases: ['alfa fetoprotein', 'alfa-fetoprotein', 'alpha-fetoprotein'] },
  { id: 'ca125', name: 'CA 125', unit: 'U/mL', panel: 'Tumor Markers', lo: null, hi: 35, aliases: ['ca 125', 'ca-125'] },
  { id: 'ca153', name: 'CA 15-3', unit: 'U/mL', panel: 'Tumor Markers', lo: null, hi: 25, aliases: ['ca 15-3', 'ca15-3'] },
  { id: 'ca199', name: 'CA 19-9', unit: 'U/mL', panel: 'Tumor Markers', lo: null, hi: 37, aliases: ['ca 19-9', 'ca19-9'] },
  { id: 'ca724', name: 'CA 72-4', unit: 'U/mL', panel: 'Tumor Markers', lo: null, hi: 6.9, aliases: ['ca 72-4', 'ca72-4'] },
  { id: 'he4', name: 'HE4', unit: 'pmol/L', panel: 'Tumor Markers', lo: null, hi: 70, aliases: ['he-4'] },
  { id: 'nse', name: 'NSE', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 16.3, aliases: ['neuron specific enolase', 'neuron-specificna enolaza'] },
  { id: 'scc', name: 'SCC antigen', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 1.5, aliases: ['scc antigen', 'skvamozni'] },
  { id: 'cyfra', name: 'CYFRA 21-1', unit: 'ng/mL', panel: 'Tumor Markers', lo: null, hi: 3.3, aliases: ['cyfra 21-1', 'cyfra21-1'] },
  // Vitamins & minerals
  { id: 'vitd', name: 'Vitamin D (25-OH)', unit: 'nmol/L', panel: 'Vitamins & Minerals', lo: 50, hi: 150, aliases: ['vitamin 25-oh d', '25-oh d', 'vitamin d'] },
  { id: 'b12', name: 'Vitamin B12', unit: 'pg/mL', panel: 'Vitamins & Minerals', lo: 197, hi: 771, aliases: ['vitamin b12', 'cobalamin', 'kobalamin'] },
  { id: 'folate', name: 'Folate', unit: 'ng/mL', panel: 'Vitamins & Minerals', lo: 3.9, hi: 26.8, aliases: ['folna kiselina', 'folic acid', 'folati'] },
  { id: 'vitb1', name: 'Vitamin B1 (thiamine)', unit: 'nmol/L', panel: 'Vitamins & Minerals', lo: 66.5, hi: 200, aliases: ['tiamin', 'thiamine', 'vitamin b1'] },
  { id: 'vitb6', name: 'Vitamin B6', unit: 'nmol/L', panel: 'Vitamins & Minerals', lo: 20, hi: 121, aliases: ['piridoksin', 'vitamin b6', 'piridoksal'] },
  { id: 'vita', name: 'Vitamin A (retinol)', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 1.05, hi: 2.45, aliases: ['retinol', 'vitamin a'] },
  { id: 'vite', name: 'Vitamin E', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 12, hi: 42, aliases: ['tokoferol', 'vitamin e', 'alfa tokoferol'] },
  { id: 'vitc', name: 'Vitamin C', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 26.1, hi: 84.6, aliases: ['askorbinska kiselina', 'vitamin c', 'ascorbic acid'] },
  { id: 'ferritin', name: 'Ferritin', unit: 'ng/mL', panel: 'Vitamins & Minerals', lo: 30, hi: 400, aliases: ['feritin'] },
  { id: 'iron', name: 'Iron (serum)', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 11.6, hi: 31.3, aliases: ['gvozdje', 'gvozde', 'serumsko gvozdje'] },
  { id: 'transferrin', name: 'Transferrin', unit: 'g/L', panel: 'Vitamins & Minerals', lo: 2.0, hi: 3.6, aliases: ['transferin'] },
  { id: 'tibc', name: 'TIBC', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 45, hi: 72, aliases: ['ukupni kapacitet vezivanja gvozdja', 'total iron binding capacity', 'tibc'] },
  { id: 'uibc', name: 'UIBC', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 24.2, hi: 70.1, aliases: ['nezasiceni kapacitet vezivanja gvozdja', 'uibc'] },
  { id: 'tsat', name: 'Transferrin saturation', unit: '%', panel: 'Vitamins & Minerals', lo: 20, hi: 50, aliases: ['saturacija transferina', 'zasicenje transferina'] },
  { id: 'zinc', name: 'Zinc', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 7.0, hi: 23.0, aliases: ['cink'] },
  { id: 'copper', name: 'Copper', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 11, hi: 22, aliases: ['bakar'] },
  { id: 'selenium', name: 'Selenium', unit: 'µmol/L', panel: 'Vitamins & Minerals', lo: 0.89, hi: 1.65, aliases: ['selen'] },
  { id: 'magnesium', name: 'Magnesium', unit: 'mmol/L', panel: 'Vitamins & Minerals', lo: 0.66, hi: 1.07, aliases: ['magnezijum'] },
  // Electrolytes
  { id: 'sodium', name: 'Sodium', unit: 'mmol/L', panel: 'Electrolytes', lo: 136, hi: 145, aliases: ['natrijum'] },
  { id: 'potassium', name: 'Potassium', unit: 'mmol/L', panel: 'Electrolytes', lo: 3.5, hi: 5.1, aliases: ['kalijum'] },
  { id: 'chloride', name: 'Chloride', unit: 'mmol/L', panel: 'Electrolytes', lo: 98, hi: 107, aliases: ['hloridi', 'hlor'] },
  { id: 'calcium', name: 'Calcium (total)', unit: 'mmol/L', panel: 'Electrolytes', lo: 2.15, hi: 2.55, aliases: ['kalcijum', 'ukupni kalcijum'] },
  { id: 'ical', name: 'Calcium (ionized)', unit: 'mmol/L', panel: 'Electrolytes', lo: 1.12, hi: 1.32, aliases: ['jonizovani kalcijum', 'ionized calcium'] },
  { id: 'phosphorus', name: 'Phosphorus', unit: 'mmol/L', panel: 'Electrolytes', lo: 0.81, hi: 1.45, aliases: ['fosfor', 'fosfati', 'neorganski fosfor'] },
  { id: 'bicarbonate', name: 'Bicarbonate', unit: 'mmol/L', panel: 'Electrolytes', lo: 22, hi: 29, aliases: ['bikarbonati'] },
  // Metabolic
  { id: 'glucose', name: 'Glucose (fasting)', unit: 'mmol/L', panel: 'Metabolic', lo: 3.9, hi: 6.1, aliases: ['glukoza', 'secer u krvi', 'glikemija'] },
  { id: 'hba1c', name: 'HbA1c', unit: '%', panel: 'Metabolic', lo: 4.0, hi: 5.7, aliases: ['glikozilirani hemoglobin', 'glikirani hemoglobin'] },
  { id: 'insulin', name: 'Insulin (fasting)', unit: 'µIU/mL', panel: 'Metabolic', lo: 2.6, hi: 24.9, aliases: ['insulin'] },
  { id: 'cpeptide', name: 'C-peptide', unit: 'ng/mL', panel: 'Metabolic', lo: 1.1, hi: 4.4, aliases: ['c-peptid', 'c peptid'] },
  { id: 'fructosamine', name: 'Fructosamine', unit: 'µmol/L', panel: 'Metabolic', lo: 205, hi: 285, aliases: ['fruktozamin'] },
  { id: 'homocysteine', name: 'Homocysteine', unit: 'µmol/L', panel: 'Metabolic', lo: 5.5, hi: 16.2, aliases: ['homocystein', 'homocistein'] },
  { id: 'uricacid', name: 'Uric acid', unit: 'µmol/L', panel: 'Metabolic', lo: 208, hi: 428, aliases: ['mokracna kiselina', 'urati'] },
  { id: 'lactate', name: 'Lactate', unit: 'mmol/L', panel: 'Metabolic', lo: 0.5, hi: 2.2, aliases: ['laktat', 'mlecna kiselina'] },
  // Lipids
  { id: 'chol', name: 'Total cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 5.2, aliases: ['holesterol', 'cholesterol', 'ukupni holesterol'] },
  { id: 'ldl', name: 'LDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 3.4, aliases: ['ldl holesterol'] },
  { id: 'hdl', name: 'HDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: 1.6, hi: null, aliases: ['hdl holesterol'] },
  { id: 'trig', name: 'Triglycerides', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 1.7, aliases: ['trigliceridi'] },
  { id: 'nonhdl', name: 'Non-HDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 3.4, aliases: ['non-hdl holesterol', 'non hdl'] },
  { id: 'vldl', name: 'VLDL cholesterol', unit: 'mmol/L', panel: 'Lipids', lo: null, hi: 1.0, aliases: ['vldl holesterol'] },
  { id: 'apob', name: 'Apolipoprotein B', unit: 'mg/dL', panel: 'Lipids', lo: 49, hi: 173, aliases: ['apo b'] },
  { id: 'apoa1', name: 'Apolipoprotein A1', unit: 'mg/dL', panel: 'Lipids', lo: 110, hi: 205, aliases: ['apo a1', 'apolipoprotein a1'] },
  { id: 'lpa', name: 'Lipoprotein(a)', unit: 'mg/dL', panel: 'Lipids', lo: null, hi: 30, aliases: ['lipoprotein a', 'lp(a)'] },
  // Cardiac
  { id: 'troponin', name: 'Troponin I (hs)', unit: 'ng/L', panel: 'Cardiac', lo: null, hi: 34, aliases: ['troponin', 'troponin i', 'visoko senzitivni troponin'] },
  { id: 'ck', name: 'Creatine kinase (CK)', unit: 'U/L', panel: 'Cardiac', lo: 39, hi: 308, aliases: ['kreatin kinaza', 'cpk'] },
  { id: 'ckmb', name: 'CK-MB', unit: 'U/L', panel: 'Cardiac', lo: null, hi: 24, aliases: ['ck-mb', 'kreatin kinaza mb'] },
  { id: 'ntprobnp', name: 'NT-proBNP', unit: 'pg/mL', panel: 'Cardiac', lo: null, hi: 125, aliases: ['nt-probnp', 'nt pro bnp', 'probnp'] },
  { id: 'myoglobin', name: 'Myoglobin', unit: 'ng/mL', panel: 'Cardiac', lo: null, hi: 72, aliases: ['mioglobin'] },
  // Blood count
  { id: 'hgb', name: 'Hemoglobin', unit: 'g/L', panel: 'Blood Count', lo: 137, hi: 175, aliases: ['hemoglobin'] },
  { id: 'hct', name: 'Hematocrit', unit: 'L/L', panel: 'Blood Count', lo: 0.4, hi: 0.51, aliases: ['hematokrit'] },
  { id: 'wbc', name: 'White blood cells', unit: '×10⁹/L', panel: 'Blood Count', lo: 4.0, hi: 10.0, aliases: ['leukociti', 'leukocytes'] },
  { id: 'rbc', name: 'Red blood cells', unit: '×10¹²/L', panel: 'Blood Count', lo: 4.5, hi: 6.2, aliases: ['eritrociti', 'erythrocytes'] },
  { id: 'plt', name: 'Platelets', unit: '×10⁹/L', panel: 'Blood Count', lo: 140, hi: 400, aliases: ['trombociti'] },
  { id: 'mcv', name: 'MCV', unit: 'fL', panel: 'Blood Count', lo: 80, hi: 96, aliases: ['srednji volumen eritrocita'] },
  { id: 'mch', name: 'MCH', unit: 'pg', panel: 'Blood Count', lo: 27, hi: 32, aliases: [] },
  { id: 'mchc', name: 'MCHC', unit: 'g/L', panel: 'Blood Count', lo: 310, hi: 350, aliases: [] },
  { id: 'rdw', name: 'RDW', unit: '%', panel: 'Blood Count', lo: 11.5, hi: 14.5, aliases: ['rdw-cv'] },
  { id: 'mpv', name: 'MPV', unit: 'fL', panel: 'Blood Count', lo: 7.5, hi: 11.5, aliases: ['srednji volumen trombocita'] },
  { id: 'reticulocytes', name: 'Reticulocytes', unit: '%', panel: 'Blood Count', lo: 0.5, hi: 2.5, aliases: ['retikulociti'] },
  { id: 'neutrophils', name: 'Neutrophils (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 2.0, hi: 7.5, aliases: ['neutrofili'] },
  { id: 'lymphocytes', name: 'Lymphocytes (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0.8, hi: 4.0, aliases: ['limfociti'] },
  { id: 'monocytes', name: 'Monocytes (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0.08, hi: 1.0, aliases: ['monociti'] },
  { id: 'eosinophils', name: 'Eosinophils (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0, hi: 0.4, aliases: ['eozinofili'] },
  { id: 'basophils', name: 'Basophils (abs)', unit: '×10⁹/L', panel: 'Blood Count', lo: 0, hi: 0.1, aliases: ['bazofili'] },
  // Coagulation
  { id: 'inr', name: 'INR', unit: 'ratio', panel: 'Coagulation', lo: 0.8, hi: 1.2, aliases: ['pt inr'] },
  { id: 'pt', name: 'Prothrombin time', unit: '%', panel: 'Coagulation', lo: 70, hi: 130, aliases: ['protrombinsko vreme', 'protrombin'] },
  { id: 'aptt', name: 'aPTT', unit: 's', panel: 'Coagulation', lo: 26, hi: 40, aliases: ['aptv', 'aktivirano parcijalno tromboplastinsko vreme'] },
  { id: 'fibrinogen', name: 'Fibrinogen', unit: 'g/L', panel: 'Coagulation', lo: 2.0, hi: 4.0, aliases: ['fibrinogen'] },
  { id: 'ddimer', name: 'D-dimer', unit: 'mg/L', panel: 'Coagulation', lo: null, hi: 0.5, aliases: ['d-dimer', 'd dimer'] },
  // Liver & kidney
  { id: 'alt', name: 'ALT', unit: 'U/L', panel: 'Liver & Kidney', lo: null, hi: 41, aliases: ['gpt', 'alanin aminotransferaza'] },
  { id: 'ast', name: 'AST', unit: 'U/L', panel: 'Liver & Kidney', lo: null, hi: 40, aliases: ['got', 'aspartat aminotransferaza'] },
  { id: 'ggt', name: 'GGT', unit: 'U/L', panel: 'Liver & Kidney', lo: null, hi: 60, aliases: ['gama gt', 'gama glutamil transferaza'] },
  { id: 'alp', name: 'Alkaline phosphatase (ALP)', unit: 'U/L', panel: 'Liver & Kidney', lo: 35, hi: 105, aliases: ['alkalna fosfataza', 'alkaline phosphatase'] },
  { id: 'bilirubin', name: 'Bilirubin (total)', unit: 'µmol/L', panel: 'Liver & Kidney', lo: null, hi: 21, aliases: ['ukupni bilirubin', 'bilirubin ukupni', 'total bilirubin', 'bilirubin'] },
  { id: 'dbilirubin', name: 'Bilirubin (direct)', unit: 'µmol/L', panel: 'Liver & Kidney', lo: null, hi: 5, aliases: ['direktni bilirubin', 'direct bilirubin', 'konjugovani bilirubin'] },
  { id: 'protein', name: 'Total protein', unit: 'g/L', panel: 'Liver & Kidney', lo: 66, hi: 83, aliases: ['ukupni proteini', 'total protein', 'proteini'] },
  { id: 'albumin', name: 'Albumin', unit: 'g/L', panel: 'Liver & Kidney', lo: 35, hi: 52, aliases: ['albumini'] },
  { id: 'ldh', name: 'LDH', unit: 'U/L', panel: 'Liver & Kidney', lo: 135, hi: 225, aliases: ['laktat dehidrogenaza', 'lactate dehydrogenase'] },
  { id: 'amylase', name: 'Amylase', unit: 'U/L', panel: 'Liver & Kidney', lo: 28, hi: 100, aliases: ['amilaza'] },
  { id: 'lipase', name: 'Lipase', unit: 'U/L', panel: 'Liver & Kidney', lo: 13, hi: 60, aliases: ['lipaza'] },
  { id: 'urea', name: 'Urea', unit: 'mmol/L', panel: 'Liver & Kidney', lo: 3.2, hi: 7.4, aliases: ['urea', 'ureja'] },
  { id: 'creatinine', name: 'Creatinine', unit: 'µmol/L', panel: 'Liver & Kidney', lo: 53, hi: 114.9, aliases: ['kreatinin'] },
  { id: 'cystatinc', name: 'Cystatin C', unit: 'mg/L', panel: 'Liver & Kidney', lo: 0.5, hi: 0.96, aliases: ['cistatin c'] },
  { id: 'egfr', name: 'eGFR', unit: 'mL/min/1.73m²', panel: 'Liver & Kidney', lo: 60, hi: null, aliases: ['klirens kreatinina', 'gfr'] },
  // Inflammation & immune
  { id: 'crp', name: 'CRP', unit: 'mg/L', panel: 'Inflammation', lo: null, hi: 5, aliases: ['c-reactive protein', 'c reaktivni protein'] },
  { id: 'hscrp', name: 'hs-CRP', unit: 'mg/L', panel: 'Inflammation', lo: null, hi: 3.0, aliases: ['hs crp', 'high sensitivity crp', 'visoko senzitivni crp'] },
  { id: 'esr', name: 'Sedimentation (1h)', unit: 'mm/h', panel: 'Inflammation', lo: null, hi: 15, aliases: ['sedimentacija', 'sedimentacija eritrocita'] },
  { id: 'procalcitonin', name: 'Procalcitonin', unit: 'ng/mL', panel: 'Inflammation', lo: null, hi: 0.5, aliases: ['prokalcitonin', 'pct'] },
  { id: 'rf', name: 'Rheumatoid factor', unit: 'IU/mL', panel: 'Inflammation', lo: null, hi: 14, aliases: ['reumatoidni faktor', 'rf'] },
  { id: 'aso', name: 'ASO (antistreptolysin O)', unit: 'IU/mL', panel: 'Inflammation', lo: null, hi: 200, aliases: ['antistreptolizin', 'aso titar', 'asto'] },
  { id: 'c3', name: 'Complement C3', unit: 'g/L', panel: 'Inflammation', lo: 0.9, hi: 1.8, aliases: ['komplement c3'] },
  { id: 'c4', name: 'Complement C4', unit: 'g/L', panel: 'Inflammation', lo: 0.1, hi: 0.4, aliases: ['komplement c4'] },
  { id: 'igg', name: 'IgG', unit: 'g/L', panel: 'Inflammation', lo: 7.0, hi: 16.0, aliases: ['imunoglobulin g'] },
  { id: 'iga', name: 'IgA', unit: 'g/L', panel: 'Inflammation', lo: 0.7, hi: 4.0, aliases: ['imunoglobulin a'] },
  { id: 'igm', name: 'IgM', unit: 'g/L', panel: 'Inflammation', lo: 0.4, hi: 2.3, aliases: ['imunoglobulin m'] },
  { id: 'ige', name: 'IgE (total)', unit: 'IU/mL', panel: 'Inflammation', lo: null, hi: 100, aliases: ['imunoglobulin e', 'ukupni ige', 'total ige'] },
]

export const PANELS = [...new Set(MARKERS.map((m) => m.panel))]

export const PANEL_ICONS = {
  Hormones: '🧪',
  'Tumor Markers': '🎗️',
  'Vitamins & Minerals': '💊',
  Electrolytes: '🧂',
  Metabolic: '⚡',
  Lipids: '🫀',
  Cardiac: '❤️',
  'Blood Count': '🩸',
  Coagulation: '🩹',
  'Liver & Kidney': '🫘',
  Inflammation: '🔥',
  Other: '🧫',
}

// Custom markers learned from imported reports — analytes that aren't in the
// built-in catalog. Registered at runtime (from the user's saved reports) so
// they resolve and render exactly like built-in markers. They live under the
// 'Other' panel and carry no catalog range, so status uses the report's range.
let CUSTOM = []
export function setCustomMarkers(list) {
  CUSTOM = Array.isArray(list) ? list : []
}
export const customMarkers = () => CUSTOM
export const allMarkers = () => (CUSTOM.length ? [...MARKERS, ...CUSTOM] : MARKERS)

// Build a custom marker object from a name + optional unit (id is a stable
// slug so re-imports of the same analyte merge instead of duplicating).
export function makeCustomMarker(name, unit) {
  const clean = String(name).replace(/\s+/g, ' ').trim()
  const slug = 'x_' + clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return { id: slug, name: clean, unit: unit || '', panel: 'Other', lo: null, hi: null, aliases: [], custom: true }
}

export const markerById = (id) => MARKERS.find((m) => m.id === id) || CUSTOM.find((m) => m.id === id)

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')

// Match a free-text name (CSV import) to a marker id.
export function matchMarker(text) {
  const n = norm(text)
  if (!n) return null
  for (const m of allMarkers()) {
    if (norm(m.id) === n || norm(m.name) === n) return m.id
    if (m.aliases.some((a) => norm(a) === n)) return m.id
  }
  for (const m of allMarkers()) {
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

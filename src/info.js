// Plain-language education for each marker: what it measures and general
// lifestyle context. Descriptive only — never a substitute for a doctor.

export const INFO = {
  tsh: {
    what: 'Thyroid-stimulating hormone is the brain\'s "volume knob" for the thyroid. High TSH usually means the thyroid is underactive; low TSH suggests it\'s overactive.',
    tips: ['Test in the morning when possible — TSH naturally fluctuates during the day.', 'Iodine, selenium and zinc all play roles in thyroid function.', 'Retest after 6–8 weeks if a value is borderline; single readings can mislead.'],
  },
  ft4: {
    what: 'Free T4 is the main hormone the thyroid produces, measured in its active unbound form. Together with TSH it gives a picture of thyroid health.',
    tips: ['Interpreted together with TSH, not alone.', 'Biotin supplements can distort the assay — pause them a few days before testing.'],
  },
  ft3: {
    what: 'Free T3 is the most active thyroid hormone, mostly converted from T4 in tissues. It drives metabolism, temperature and energy.',
    tips: ['Low-calorie dieting can temporarily lower T3.', 'Usually checked when TSH/T4 are abnormal or symptoms persist.'],
  },
  testosterone: {
    what: 'The primary male sex hormone, affecting muscle, bone density, mood, libido and red blood cell production. Levels naturally decline slowly with age.',
    tips: ['Test between 7–10 a.m. when levels peak, ideally fasted.', 'Sleep, strength training and healthy body fat support natural production.', 'Anabolic steroid use pushes values far above range and suppresses the body\'s own production — worth an honest conversation with your doctor.'],
  },
  freetesto: {
    what: 'The small fraction of testosterone not bound to proteins — the part that is biologically available to tissues. Often more informative than total testosterone.',
    tips: ['Best interpreted alongside total testosterone and SHBG.', 'Morning, fasted samples give the most comparable results.'],
  },
  estradiol: {
    what: 'The main estrogen. Men produce it too (largely converted from testosterone); it matters for bone health, mood, and libido in both sexes.',
    tips: ['In men, very high testosterone (or aromatization) raises estradiol.', 'Body fat increases conversion of testosterone to estradiol.'],
  },
  igf1: {
    what: 'Insulin-like growth factor 1 reflects growth-hormone activity. It supports muscle and tissue repair; both very low and very high levels are worth attention.',
    tips: ['Levels naturally decline with age.', 'Sleep quality strongly influences growth hormone and IGF-1.'],
  },
  cortisol: {
    what: 'The "stress hormone", highest in the early morning and falling through the day. Chronic extremes affect sleep, blood pressure, blood sugar and immunity.',
    tips: ['Always note sampling time — an evening value can look "low" misleadingly.', 'Chronic stress, shift work and poor sleep disturb the daily rhythm.'],
  },
  psa: {
    what: 'Prostate-specific antigen screens for prostate conditions. Mild rises can come from benign enlargement, infection, or even recent exercise — not only cancer.',
    tips: ['Avoid cycling and ejaculation 48h before the test; both can bump PSA.', 'The trend over years matters more than one value.'],
  },
  cea: {
    what: 'Carcinoembryonic antigen is a general tumor marker used mostly for monitoring, not diagnosis. Smokers often run slightly higher values.',
    tips: ['A normal CEA is reassuring but doesn\'t rule disease out; an isolated mild rise is rarely meaningful on its own.'],
  },
  vitd: {
    what: 'Vitamin D is made in skin from sunlight and supports bones, muscles, immunity and mood. Deficiency is extremely common in northern latitudes, especially in winter.',
    tips: ['Levels are usually lowest at the end of winter.', 'Fatty fish, eggs and fortified foods help; many people need supplements — dose with your doctor.', 'Vitamin D is fat-soluble: take supplements with a meal.'],
  },
  b12: {
    what: 'Vitamin B12 is essential for nerves, red blood cells and DNA. Deficiency causes fatigue and tingling; it\'s mostly found in animal foods.',
    tips: ['Values above range are usually from supplements and rarely concerning — mention it to your doctor anyway.', 'Long-term metformin or acid blockers can lower B12.'],
  },
  folate: {
    what: 'Folate (B9) works hand-in-hand with B12 to build red blood cells and recycle homocysteine. Found in leafy greens, beans and liver.',
    tips: ['Pairs with B12 — deficiency of either raises homocysteine.'],
  },
  ferritin: {
    what: 'Ferritin reflects the body\'s iron stores. Low ferritin is the earliest sign of iron deficiency; high ferritin can mean iron overload or inflammation.',
    tips: ['Ferritin rises with any inflammation, so interpret with CRP.', 'Vitamin C improves iron absorption; tea and coffee around meals reduce it.'],
  },
  iron: {
    what: 'Serum iron is the iron circulating in blood right now. It swings with recent meals and time of day, so it\'s read together with ferritin.',
    tips: ['Test fasted in the morning for comparable values.'],
  },
  zinc: {
    what: 'A trace mineral involved in immunity, wound healing, taste, and testosterone production.',
    tips: ['Oysters, red meat, pumpkin seeds and legumes are rich sources.', 'High-dose zinc long-term can deplete copper.'],
  },
  magnesium: {
    what: 'Magnesium supports muscles, nerves, sleep, blood pressure and over 300 enzymes. Blood levels only loosely reflect total body stores.',
    tips: ['Nuts, seeds, whole grains, legumes and dark chocolate are good sources.', 'Heavy sweating and alcohol increase losses.'],
  },
  glucose: {
    what: 'Fasting blood sugar. Consistently elevated values point toward insulin resistance and, eventually, type 2 diabetes.',
    tips: ['A truly fasted sample needs 8–12 hours without calories.', 'Regular movement — even walking after meals — improves glucose control.', 'Pair with HbA1c for the longer-term picture.'],
  },
  hba1c: {
    what: 'Glycated hemoglobin reflects average blood sugar over the past ~3 months — the long-exposure photo to glucose\'s snapshot.',
    tips: ['Less affected by day-to-day variation, ideal for tracking trends.', 'Anemia and some hemoglobin variants can skew it.'],
  },
  homocysteine: {
    what: 'An amino-acid byproduct recycled with the help of B12, folate and B6. Elevated levels are linked to cardiovascular risk.',
    tips: ['Rising homocysteine often signals suboptimal B-vitamin status.', 'It\'s modifiable: B vitamins, exercise, and not smoking all help.'],
  },
  insulin: {
    what: 'The hormone that moves glucose into cells. High fasting insulin with normal glucose is an early sign of insulin resistance, years before diabetes.',
    tips: ['Strength training and weight management improve insulin sensitivity markedly.'],
  },
  uricacid: {
    what: 'A breakdown product of purines. High levels can crystallize in joints (gout) and associate with metabolic syndrome.',
    tips: ['Beer, sugary drinks and organ meats raise it; coffee, dairy and hydration lower it.'],
  },
  chol: {
    what: 'Total cholesterol sums all cholesterol-carrying particles. Useful as an overview, but the LDL/HDL/ApoB breakdown tells the real story.',
    tips: ['Diet shifts (more fiber, less saturated fat) typically move it 10–15%.', 'Look at the whole lipid panel and trends, not one number.'],
  },
  ldl: {
    what: '"Bad" cholesterol — the particles that deposit cholesterol in artery walls. The main lipid target for cardiovascular prevention.',
    tips: ['Soluble fiber (oats, beans), nuts and replacing saturated fats lower LDL.', 'Genetics matter a lot; persistent high values deserve a doctor\'s plan.'],
  },
  hdl: {
    what: '"Good" cholesterol — particles that carry cholesterol away from tissues. Higher is generally protective, though extreme values lose benefit.',
    tips: ['Exercise, weight loss and quitting smoking raise HDL.', 'HDL responds slowly — judge it over months.'],
  },
  trig: {
    what: 'Triglycerides are blood fats from food and liver production. High values link with insulin resistance and pancreatitis risk.',
    tips: ['Very responsive to lifestyle: less sugar/alcohol and more activity can halve them.', 'Requires proper fasting — a recent meal inflates values.'],
  },
  nonhdl: {
    what: 'Total cholesterol minus HDL — i.e., all the potentially artery-clogging particles together. Many guidelines consider it a better target than LDL alone.',
    tips: ['Tracks well even without fasting.', 'Goal is usually ~0.8 mmol/L above your LDL goal.'],
  },
  apob: {
    what: 'Apolipoprotein B counts the actual number of atherogenic particles (one ApoB per particle). Many cardiologists consider it the most accurate lipid risk marker.',
    tips: ['Particularly informative when triglycerides are high or results are borderline.', 'Same levers as LDL: diet, exercise, and medication when indicated.'],
  },
  hgb: {
    what: 'Hemoglobin is the oxygen-carrying protein in red blood cells. Low means anemia; high can come from altitude, dehydration, smoking — or androgen use.',
    tips: ['Testosterone and anabolic steroids raise hemoglobin and hematocrit; this needs monitoring.', 'Iron, B12 and folate are the building blocks.'],
  },
  hct: {
    what: 'Hematocrit is the percentage of blood volume occupied by red cells. It moves together with hemoglobin and affects blood thickness.',
    tips: ['Hydration status shifts it noticeably.', 'Values creeping above range make blood more viscous — flag it to your doctor.'],
  },
  wbc: {
    what: 'White blood cells are the immune system\'s army. High counts usually mean the body is fighting something; low counts can follow infections or medications.',
    tips: ['Intense exercise and stress temporarily raise counts.', 'The differential (which cell types) tells more than the total.'],
  },
  rbc: {
    what: 'The count of red blood cells, which carry oxygen from the lungs to every tissue.',
    tips: ['Interpreted with hemoglobin, hematocrit and cell size (MCV).'],
  },
  plt: {
    what: 'Platelets are the cells that form clots and stop bleeding.',
    tips: ['Mild fluctuations are common and usually meaningless; persistent extremes deserve follow-up.'],
  },
  mcv: {
    what: 'Mean corpuscular volume — the average size of red blood cells. Small cells suggest iron deficiency; large cells point to B12/folate issues or alcohol.',
    tips: ['A great clue for *why* an anemia exists.'],
  },
  mch: {
    what: 'The average amount of hemoglobin per red blood cell. Usually moves together with MCV.',
    tips: ['Low MCH with low MCV is the classic iron-deficiency pattern.'],
  },
  mchc: {
    what: 'The hemoglobin concentration inside red cells — how "densely packed" each cell is.',
    tips: ['Rarely abnormal alone; read in context of the full blood count.'],
  },
  neutrophils: {
    what: 'The most numerous white cells and first responders to bacterial infection and acute stress.',
    tips: ['Rise with bacterial infections and corticosteroids; viral illnesses often lower them.'],
  },
  lymphocytes: {
    what: 'The white cells of targeted immunity — T cells, B cells and NK cells. Often rise during viral infections.',
    tips: ['Transient swings during/after infections are normal.'],
  },
  monocytes: {
    what: 'Clean-up and surveillance cells that mature into tissue macrophages.',
    tips: ['Mild elevation often follows recovering infections.'],
  },
  eosinophils: {
    what: 'White cells involved in allergies and defense against parasites.',
    tips: ['Allergies, asthma and eczema are the usual reasons for elevation.'],
  },
  basophils: {
    what: 'The rarest white cells, involved in allergic and inflammatory responses.',
    tips: ['Almost always a tiny number; isolated small changes mean little.'],
  },
  alt: {
    what: 'A liver enzyme that leaks into blood when liver cells are stressed — the most liver-specific of the routine enzymes.',
    tips: ['Alcohol, fatty liver, some medications and intense workouts raise it.', 'Fatty-liver-related elevations respond well to weight loss.'],
  },
  ast: {
    what: 'An enzyme from liver *and* muscle. Elevated AST with normal ALT often reflects muscle work rather than liver trouble.',
    tips: ['Skip heavy training 48h before testing for a cleaner reading.'],
  },
  ggt: {
    what: 'A sensitive liver/bile-duct enzyme, strongly responsive to alcohol and some medications.',
    tips: ['Often the first enzyme to rise with regular alcohol use — and it falls within weeks of cutting back.'],
  },
  urea: {
    what: 'A waste product of protein breakdown cleared by the kidneys. Reflects both kidney function and protein intake/hydration.',
    tips: ['High-protein diets and dehydration raise it without kidney disease.'],
  },
  creatinine: {
    what: 'A muscle byproduct cleared by the kidneys at a steady rate — the standard kidney-function marker.',
    tips: ['More muscle mass = naturally higher creatinine.', 'Creatine supplements raise it slightly without harming kidneys — tell your doctor you take it.'],
  },
  egfr: {
    what: 'Estimated glomerular filtration rate — how many milliliters of blood your kidneys filter per minute, calculated from creatinine, age and sex. Above 90 is ideal; above 60 is generally acceptable.',
    tips: ['Hydrate normally before testing.', 'A muscular build can underestimate eGFR slightly (more creatinine ≠ worse kidneys).'],
  },
  crp: {
    what: 'C-reactive protein rises with inflammation anywhere in the body, from infections to chronic low-grade inflammation linked to heart risk.',
    tips: ['Even minor colds spike it — retest when healthy.', 'Sleep, exercise and weight management lower baseline inflammation.'],
  },
  esr: {
    what: 'Sedimentation rate — an old but useful inflammation gauge measuring how fast red cells settle in a tube.',
    tips: ['Slower to rise and fall than CRP; the two together give the best picture.'],
  },
}

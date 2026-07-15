export const DRUG_CATEGORIES = [
  // === 1. INFECTIOUS DISEASES & ANTIMICROBIALS ===
  { key: "cat-antibiotics-penicillin", name: "Antibiotics - Penicillins & Cephalosporins" },
  { key: "cat-antibiotics-macrolide", name: "Antibiotics - Macrolides & Fluoroquinolones" },
  { key: "cat-antibiotics-other", name: "Antibiotics - Other / Aminoglycosides" },
  { key: "cat-antivirals-general", name: "Antivirals - General" },
  { key: "cat-antivirals-hiv", name: "Antivirals - Anti-Retrovirals (ARVs)" },
  { key: "cat-antifungals", name: "Antifungals (Systemic & Topical)" },
  { key: "cat-antimalarials", name: "Antimalarials" },
  { key: "cat-antiparasitics", name: "Antiparasitics & Anthelmintics" },

  // === 2. PAIN, INFLAMMATION & ANESTHESIA ===
  { key: "cat-analgesics-nsaids", name: "Analgesics - NSAIDs (Anti-inflammatory)" },
  { key: "cat-analgesics-non-opioid", name: "Analgesics - Non-Opioids (Paracetamol, etc.)" },
  { key: "cat-analgesics-opioids", name: "Analgesics - Opioids & Narcotics (Controlled)" },
  { key: "cat-anesthetics-local", name: "Anesthetics - Local" },
  { key: "cat-anesthetics-general", name: "Anesthetics - General & Muscle Relaxants" },
  { key: "cat-antigout", name: "Antigout Agents" },

  // === 3. CARDIOVASCULAR (HEART & BLOOD PRESSURE) ===
  { key: "cat-cvs-antihypertensives", name: "Cardiovascular - Antihypertensives" },
  { key: "cat-cvs-statins", name: "Cardiovascular - Lipid-Lowering (Statins)" },
  { key: "cat-cvs-diuretics", name: "Cardiovascular - Diuretics" },
  { key: "cat-cvs-antiarrhythmics", name: "Cardiovascular - Antiarrhythmics" },
  { key: "cat-cvs-antianginals", name: "Cardiovascular - Nitrates & Antianginals" },
  { key: "cat-blood-coagulants", name: "Blood - Anticoagulants & Antiplatelets" },

  // === 4. CENTRAL NERVOUS SYSTEM & MENTAL HEALTH ===
  { key: "cat-cns-antidepressants", name: "CNS - Antidepressants" },
  { key: "cat-cns-anxiolytics", name: "CNS - Anxiolytics & Sedatives" },
  { key: "cat-cns-antipsychotics", name: "CNS - Antipsychotics" },
  { key: "cat-cns-anticonvulsants", name: "CNS - Anticonvulsants / Anti-Epileptics" },
  { key: "cat-cns-antiparkinson", name: "CNS - Anti-Parkinson Agents" },
  { key: "cat-cns-stimulants", name: "CNS - Stimulants & ADHD Medications" },

  // === 5. ENDOCRINE, DIABETES & HORMONES ===
  { key: "cat-endocrine-antidiabetics", name: "Endocrine - Oral Antidiabetics" },
  { key: "cat-endocrine-insulin", name: "Endocrine - Insulins" },
  { key: "cat-endocrine-thyroid", name: "Endocrine - Thyroid Hormones & Antithyroid" },
  { key: "cat-endocrine-corticosteroids", name: "Endocrine - Systemic Corticosteroids" },
  { key: "cat-endocrine-contraceptives", name: "Endocrine - Hormonal Contraceptives" },

  // === 6. RESPIRATORY SYSTEM ===
  { key: "cat-resp-bronchodilators", name: "Respiratory - Bronchodilators (Asthma/COPD)" },
  { key: "cat-resp-corticosteroids", name: "Respiratory - Inhaled Corticosteroids" },
  { key: "cat-resp-antihistamines", name: "Respiratory - Antihistamines & Allergy" },
  { key: "cat-resp-cough-cold", name: "Respiratory - Antitussives & Decongestants" },

  // === 7. GASTROINTESTINAL SYSTEM ===
  { key: "cat-gi-antacids", name: "GI - Antacids & Proton Pump Inhibitors (PPIs)" },
  { key: "cat-gi-antiemetics", name: "GI - Antiemetics (Anti-Nausea)" },
  { key: "cat-gi-laxatives", name: "GI - Laxatives & Antidiarrheals" },
  { key: "cat-gi-antispasmodics", name: "GI - Antispasmodics" },

  // === 8. SPECIALIZED MEDICAL FIELDS ===
  { key: "cat-obgyn-oxytocics", name: "OBGYN - Oxytocics & Uterine Relaxants" },
  { key: "cat-urologicals", name: "Urologicals (ED, BPH & Urinary Tract)" },
  { key: "cat-oncology-cytotoxic", name: "Oncology - Cytotoxic Chemotherapy" },
  { key: "cat-oncology-targeted", name: "Oncology - Targeted & Immunotherapy" },
  { key: "cat-immunosuppressants", name: "Immunosuppressants (Transplant/Autoimmune)" },

  // === 9. TOPICALS & SENSORY ORGANS ===
  { key: "cat-dermatological-steroids", name: "Dermatological - Topical Steroids" },
  { key: "cat-dermatological-other", name: "Dermatological - Antiseptics & Protectives" },
  { key: "cat-ophthalmology", name: "Ophthalmic Preparations (Eye)" },
  { key: "cat-otologicals", name: "Otological Preparations (Ear)" },

  // === 10. NUTRITION & PREVENTATIVE CARE ===
  { key: "cat-vitamins-minerals", name: "Vitamins, Minerals & Electrolytes" },
  { key: "cat-vaccines-immunologicals", name: "Vaccines & Immunological Serums" }
];

export type DrugMockCategoryList = typeof DRUG_CATEGORIES[number];

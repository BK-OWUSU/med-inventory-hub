export const DRUG_CATEGORIES = [
  // === 1. INFECTIOUS DISEASES & ANTIMICROBIALS ===
  { 
    name: "Antibiotics - Penicillins & Cephalosporins", 
    description: "Beta-lactam antibiotics used to treat bacterial infections like pneumonia and skin infections. Examples: Amoxicillin, Ceftriaxone." 
  },
  { 
    name: "Antibiotics - Macrolides & Fluoroquinolones", 
    description: "Broad-spectrum antibiotics for respiratory, urinary, and tissue infections. Examples: Azithromycin, Ciprofloxacin." 
  },
  { 
    name: "Antibiotics - Other / Aminoglycosides", 
    description: "Diverse and potent antibacterial agents for severe, complex, or resistant infections. Examples: Gentamicin, Doxycycline." 
  },
  { 
    name: "Antivirals - General", 
    description: "Medications that inhibit viral replication to treat herpes, influenza, and hepatitis infections. Examples: Acyclovir, Oseltamivir." 
  },
  { 
    name: "Antivirals - Anti-Retrovirals (ARVs)", 
    description: "Specialized viral suppression therapies used to manage and prevent HIV/AIDS transmission. Examples: Tenofovir, Dolutegravir." 
  },
  { 
    name: "Antifungals (Systemic & Topical)", 
    description: "Treatments targeting localized skin or systemic internal fungal and yeast infections. Examples: Fluconazole, Clotrimazole." 
  },
  { 
    name: "Antimalarials", 
    description: "Prophylaxis and acute treatment for preventing and eradicating Plasmodium malaria parasites. Examples: Artemether-Lumefantrine." 
  },
  { 
    name: "Antiparasitics & Anthelmintics", 
    description: "Agents designed to eliminate parasitic worms, protozoa, and scabies infestations. Examples: Albendazole, Ivermectin." 
  },

  // === 2. PAIN, INFLAMMATION & ANESTHESIA ===
  { 
    name: "Analgesics - NSAIDs (Anti-inflammatory)", 
    description: "Non-steroidal drugs that reduce acute pain, swelling, fever, and systemic inflammation. Examples: Ibuprofen, Diclofenac." 
  },
  { 
    name: "Analgesics - Non-Opioids (Paracetamol, etc.)", 
    description: "First-line therapies used for mild-to-moderate pain management and fever reduction. Example: Paracetamol (Acetaminophen)." 
  },
  { 
    name: "Analgesics - Opioids & Narcotics (Controlled)", 
    description: "Highly regulated controlled substances used for treating severe, acute, or chronic oncology pain. Examples: Morphine, Tramadol." 
  },
  { 
    name: "Anesthetics - Local", 
    description: "Reversible numbing agents used to block pain sensations in specific localized nerve regions. Example: Lidocaine." 
  },
  { 
    name: "Anesthetics - General & Muscle Relaxants", 
    description: "Agents used to induce reversible unconsciousness for surgeries or reduce muscle spasms. Examples: Propofol, Diazepam." 
  },
  { 
    name: "Antigout Agents", 
    description: "Medications that treat acute gout flares or lower systemic uric acid levels long-term. Examples: Allopurinol, Colchicine." 
  },

  // === 3. CARDIOVASCULAR (HEART & BLOOD PRESSURE) ===
  { 
    name: "Cardiovascular - Antihypertensives", 
    description: "Blood pressure lowering agents including ACE inhibitors, ARBs, and beta-blockers. Examples: Lisinopril, Amlodipine." 
  },
  { 
    name: "Cardiovascular - Lipid-Lowering (Statins)", 
    description: "HMG-CoA reductase inhibitors used to lower LDL cholesterol and mitigate cardiovascular risks. Examples: Atorvastatin, Rosuvastatin." 
  },
  { 
    name: "Cardiovascular - Diuretics", 
    description: "Water pills that eliminate excess fluid buildup to treat hypertension and edema. Examples: Furosemide, Hydrochlorothiazide." 
  },
  { 
    name: "Cardiovascular - Antiarrhythmics", 
    description: "Medications used to stabilize and correct irregular or abnormal cardiac electrical rhythms. Examples: Amiodarone, Digoxin." 
  },
  { 
    name: "Cardiovascular - Nitrates & Antianginals", 
    description: "Vasodilators that optimize blood flow to the heart muscle to relieve chest pain. Example: Glyceryl Trinitrate (GTN)." 
  },
  { 
    name: "Blood - Anticoagulants & Antiplatelets", 
    description: "Blood thinners that prevent stroke and heart attacks by inhibiting thrombus formation. Examples: Warfarin, Clopidogrel, Aspirin." 
  },

  // === 4. CENTRAL NERVOUS SYSTEM & MENTAL HEALTH ===
  { 
    name: "CNS - Antidepressants", 
    description: "Neurotransmitter regulators used to manage clinical depression and chronic anxiety states. Examples: Fluoxetine, Amitriptyline." 
  },
  { 
    name: "CNS - Anxiolytics & Sedatives", 
    description: "Central nervous system depressants used to treat acute panic, anxiety, and sleep disorders. Examples: Lorazepam, Zolpidem." 
  },
  { 
    name: "CNS - Antipsychotics", 
    description: "Dopamine antagonists utilized for managing schizophrenia, bipolar mania, and severe psychosis. Examples: Haloperidol, Olanzapine." 
  },
  { 
    name: "CNS - Anticonvulsants / Anti-Epileptics", 
    description: "Membrane-stabilizing agents that prevent epileptic seizures and manage neuropathic pain. Examples: Carbamazepine, Valproic Acid." 
  },
  { 
    name: "CNS - Anti-Parkinson Agents", 
    description: "Dopaminergic drugs that improve motor control and reduce tremors in Parkinson's disease. Example: Levodopa-Carbidopa." 
  },
  { 
    name: "CNS - Stimulants & ADHD Medications", 
    description: "Controlled neural stimulants used to enhance focus, attention, and alertness in ADHD patients. Example: Methylphenidate." 
  },

  // === 5. ENDOCRINE, DIABETES & HORMONES ===
  { 
    name: "Endocrine - Oral Antidiabetics", 
    description: "Non-insulin glucose-lowering oral agents used to manage Type 2 Diabetes Mellitus. Examples: Metformin, Glibenclamide." 
  },
  { 
    name: "Endocrine - Insulins", 
    description: "Injectable hormone replacement therapy vital for Type 1 and advanced Type 2 Diabetes control. Examples: Soluble Insulin, NPH." 
  },
  { 
    name: "Endocrine - Thyroid Hormones & Antithyroid", 
    description: "Hormonal agents used to regulate metabolism due to hyperthyroidism or hypothyroidism. Examples: Levothyroxine, Carbimazole." 
  },
  { 
    name: "Endocrine - Systemic Corticosteroids", 
    description: "Powerful oral or injectable anti-inflammatory and immunosuppressive hormonal drugs. Examples: Prednisolone, Dexamethasone." 
  },
  { 
    name: "Endocrine - Hormonal Contraceptives", 
    description: "Synthetic hormones used to prevent pregnancy or regulate menstrual cycle abnormalities. Examples: Combined Oral Contraceptive Pills." 
  },

  // === 6. RESPIRATORY SYSTEM ===
  { 
    name: "Respiratory - Bronchodilators (Asthma/COPD)", 
    description: "Inhaled or oral rescue medications that relax airway smooth muscles during spasms. Examples: Salbutamol, Aminophylline." 
  },
  { 
    name: "Respiratory - Inhaled Corticosteroids", 
    description: "Daily maintenance inhalers that suppress airway inflammation to prevent asthma attacks. Examples: Fluticasone, Budesonide." 
  },
  { 
    name: "Respiratory - Antihistamines & Allergy", 
    description: "Blockers of histamine receptors used to treat allergic rhinitis, hives, and pruritus. Examples: Cetirizine, Loratadine." 
  },
  { 
    name: "Respiratory - Antitussives & Decongestants", 
    description: "Symptomatic remedies used to quiet dry coughs or reduce nasal passages congestion. Examples: Dextromethorphan, Pseudoephedrine." 
  },

  // === 7. GASTROINTESTINAL SYSTEM ===
  { 
    name: "GI - Antacids & Proton Pump Inhibitors (PPIs)", 
    description: "Acid reducers used to treat acid reflux, heartburn, gastritis, and peptic ulcer disease. Examples: Omeprazole, Magnesium Trisilicate." 
  },
  { 
    name: "GI - Antiemetics (Anti-Nausea)", 
    description: "Medications that target the brain or gut centers to prevent vomiting and nausea. Examples: Metoclopramide, Ondansetron." 
  },
  { 
    name: "GI - Laxatives & Antidiarrheals", 
    description: "Treatments to promote bowel movements or solidifying stool to manage diarrhea. Examples: Bisacodyl, Loperamide." 
  },
  { 
    name: "GI - Antispasmodics", 
    description: "Anticholinergic drugs that reduce painful smooth muscle cramping in the digestive tract. Example: Hyoscine Butylbromide." 
  },

  // === 8. SPECIALIZED MEDICAL FIELDS ===
  { 
    name: "OBGYN - Oxytocics & Uterine Relaxants", 
    description: "Hormonal agents used to induce labor, control postpartum bleeding, or halt preterm contractions. Examples: Oxytocin, Misoprostol." 
  },
  { 
    name: "Urologicals (ED, BPH & Urinary Tract)", 
    description: "Treatments for prostate enlargement, erectile dysfunction, and bladder control issues. Examples: Tamsulosin, Sildenafil." 
  },
  { 
    name: "Oncology - Cytotoxic Chemotherapy", 
    description: "Cell-killing hazardous drugs used to eradicate rapidly dividing cancer cell populations. Examples: Cyclophosphamide, Methotrexate." 
  },
  { 
    name: "Oncology - Targeted & Immunotherapy", 
    description: "Advanced precision cancer therapies that block specific proteins or boost the immune system. Examples: Tamoxifen, Rituximab." 
  },
  { 
    name: "Immunosuppressants (Transplant/Autoimmune)", 
    description: "Drugs that block immune responses to prevent organ transplant rejection or treat lupus and RA. Examples: Cyclosporine, Azathioprine." 
  },

  // === 9. TOPICALS & SENSORY ORGANS ===
  { 
    name: "Dermatological - Topical Steroids", 
    description: "Ointments and creams applied directly to the skin to calm eczema, dermatitis, and rashes. Example: Hydrocortisone." 
  },
  { 
    name: "Dermatological - Antiseptics & Protectives", 
    description: "Topical sanitizers, wound protectants, and antibacterial creams for superficial skin cuts. Examples: Cetrimide, Zinc Oxide." 
  },
  { 
    name: "Ophthalmic Preparations (Eye)", 
    description: "Sterile eye drops or ointments for managing glaucoma, eye infections, or dry eyes. Examples: Timolol, Chloramphenicol." 
  },
  {name: "Otological Preparations (Ear)",description: "Specialized fluid formulations for dissolving earwax blockages or treating outer ear infections. Example: Ciprofloxacin ear drops."},

// === 10. NUTRITION & PREVENTATIVE CARE ===
{name: "Vitamins, Minerals & Electrolytes",description: "Nutritional supplements used to treat deficiencies, support immunity, and replace lost fluids. Examples: Folic Acid, Oral Rehydration Salts."},
{name: "Vaccines & Immunological Serums",description: "Biological agents providing active or passive immunity against major infectious viral and bacterial pathogens. Example: BCG Vaccine."}
];
export type DrugMockCategoryList = typeof DRUG_CATEGORIES[number];

// Offline data for Tier 2/3 cities - works without internet

// ── SYMPTOM CHECKER DECISION TREE ──
export const symptomDecisionTree = {
  start: {
    question: "What is your primary concern?",
    options: [
      { text: "Fever / Temperature", next: "fever" },
      { text: "Breathing Difficulty", next: "breathing" },
      { text: "Stomach / Digestive", next: "stomach" },
      { text: "Pain / Body Ache", next: "pain" },
      { text: "Skin / Rashes", next: "skin" },
      { text: "Eye / Ear / Throat", next: "ent" },
      { text: "Women's Health", next: "womens" },
      { text: "Child Health", next: "child" },
      { text: "Mental Health / Stress", next: "mental" },
      { text: "Injury / Accident", next: "injury" },
    ]
  },
  fever: {
    question: "How long have you had fever?",
    options: [
      { text: "Less than 2 days", next: "fever_short" },
      { text: "2-5 days", next: "fever_medium" },
      { text: "More than 5 days", next: "fever_long" },
    ]
  },
  fever_short: {
    question: "Do you have any of these additional symptoms?",
    options: [
      { text: "Runny nose / cough", next: "result_cold" },
      { text: "Body ache / headache", next: "result_viral" },
      { text: "Vomiting / loose motions", next: "result_gastro" },
      { text: "Rash on body", next: "result_viral_rash" },
    ]
  },
  fever_medium: {
    question: "Do you have any of these danger signs?",
    options: [
      { text: "High fever (>103°F)", next: "result_dengue_suspect" },
      { text: "Joint/muscle pain + headache", next: "result_dengue_suspect" },
      { text: "Chills + sweating cycles", next: "result_malaria_suspect" },
      { text: "Mild fever + fatigue", next: "result_viral" },
    ]
  },
  fever_long: {
    result: true,
    severity: "high",
    title: "⚠️ Prolonged Fever — See Doctor Urgently",
    advice: "Fever lasting more than 5 days could indicate typhoid, tuberculosis, or other serious infections. Visit the nearest PHC/hospital immediately.",
    actions: ["Visit nearest hospital/PHC immediately", "Get blood tests done (CBC, Widal, Blood Culture)", "Stay hydrated — drink ORS/water", "Take paracetamol for fever (not aspirin)", "Note all symptoms to share with doctor"],
    whenToCall108: true
  },
  breathing: {
    question: "How severe is the breathing difficulty?",
    options: [
      { text: "Mild — occasional shortness of breath", next: "result_mild_breathing" },
      { text: "Moderate — difficulty with normal activity", next: "result_moderate_breathing" },
      { text: "Severe — unable to speak/walk/lips turning blue", next: "result_emergency_breathing" },
      { text: "Wheezing / whistling sound", next: "result_asthma" },
    ]
  },
  stomach: {
    question: "What is the main symptom?",
    options: [
      { text: "Diarrhea / Loose motions", next: "result_diarrhea" },
      { text: "Vomiting", next: "result_vomiting" },
      { text: "Stomach pain", next: "result_stomach_pain" },
      { text: "Constipation", next: "result_constipation" },
      { text: "Blood in stool", next: "result_blood_stool" },
    ]
  },
  pain: {
    question: "Where is the pain?",
    options: [
      { text: "Headache", next: "result_headache" },
      { text: "Chest pain", next: "result_chest_pain" },
      { text: "Joint / bone pain", next: "result_joint_pain" },
      { text: "Back pain", next: "result_back_pain" },
      { text: "Abdominal pain", next: "result_stomach_pain" },
    ]
  },
  skin: {
    question: "What does the skin issue look like?",
    options: [
      { text: "Red rash / itching", next: "result_skin_allergy" },
      { text: "Boils / pus-filled bumps", next: "result_skin_infection" },
      { text: "White patches", next: "result_fungal" },
      { text: "Insect / animal bite", next: "result_bite" },
    ]
  },
  ent: {
    question: "What area is affected?",
    options: [
      { text: "Sore throat / difficulty swallowing", next: "result_throat" },
      { text: "Ear pain / discharge", next: "result_ear" },
      { text: "Eye redness / watering", next: "result_eye" },
      { text: "Blocked nose / sinus", next: "result_sinus" },
    ]
  },
  womens: {
    question: "What is the concern?",
    options: [
      { text: "Irregular periods / heavy bleeding", next: "result_menstrual" },
      { text: "Pregnancy related", next: "result_pregnancy" },
      { text: "Urinary infection symptoms", next: "result_uti" },
      { text: "Breast lump / pain", next: "result_breast" },
    ]
  },
  child: {
    question: "Child's main symptom?",
    options: [
      { text: "Fever in child", next: "result_child_fever" },
      { text: "Not eating / crying excessively", next: "result_child_distress" },
      { text: "Diarrhea in child", next: "result_child_diarrhea" },
      { text: "Cough / breathing difficulty in child", next: "result_child_breathing" },
    ]
  },
  mental: {
    question: "What are you experiencing?",
    options: [
      { text: "Anxiety / constant worry", next: "result_anxiety" },
      { text: "Sadness / hopelessness", next: "result_depression" },
      { text: "Sleep problems", next: "result_insomnia" },
      { text: "Panic attacks", next: "result_panic" },
    ]
  },
  injury: {
    question: "Type of injury?",
    options: [
      { text: "Cut / wound / bleeding", next: "result_wound" },
      { text: "Burn", next: "result_burn" },
      { text: "Fracture / broken bone", next: "result_fracture" },
      { text: "Snake / animal bite", next: "result_bite" },
    ]
  },
  // ── RESULTS ──
  result_cold: { result: true, severity: "low", title: "Common Cold / Flu", advice: "This appears to be a common cold. Usually resolves in 3-5 days.", actions: ["Rest and drink plenty of warm fluids", "Take paracetamol for fever/body ache", "Steam inhalation for blocked nose", "Honey + warm water for cough", "Visit PHC if symptoms worsen after 3 days"], medicines: [{name:"Paracetamol 500mg",dosage:"1 tablet every 6 hours",use:"Fever and body ache",img:"paracetamol"},{name:"Cetirizine 10mg",dosage:"1 tablet at bedtime",use:"Runny nose and sneezing",img:"cetirizine"},{name:"Cough Syrup (Dextromethorphan)",dosage:"10ml every 8 hours",use:"Dry cough relief",img:"cough_syrup"}] },
  result_viral: { result: true, severity: "low", title: "Viral Fever", advice: "Most likely a viral infection. Usually self-limiting.", actions: ["Rest at home for 2-3 days", "Take paracetamol 500mg every 6 hours for fever", "Drink ORS/water frequently", "Eat light, easily digestible food", "Visit doctor if fever persists beyond 3 days"], medicines: [{name:"Paracetamol 500mg",dosage:"1 tablet every 6 hours",use:"Reduces fever and pain",img:"paracetamol"},{name:"ORS (Oral Rehydration Salts)",dosage:"1 sachet in 1 litre water, sip throughout day",use:"Prevents dehydration",img:"ors"}] },
  result_gastro: { result: true, severity: "medium", title: "Gastro / Food Poisoning", advice: "Likely a stomach infection. Focus on preventing dehydration.", actions: ["Drink ORS after each loose motion", "Eat only khichdi, curd-rice, bananas", "Avoid spicy and oily food", "Take Zinc tablets if available", "Visit PHC if blood in stool or severe dehydration"], medicines: [{name:"ORS (Oral Rehydration Salts)",dosage:"After every loose motion",use:"Prevents dehydration",img:"ors"},{name:"Pantoprazole 40mg",dosage:"1 tablet before breakfast",use:"Reduces stomach acid",img:"antacid"},{name:"Zinc Tablets 20mg",dosage:"1 tablet daily for 14 days",use:"Speeds recovery from diarrhea",img:"paracetamol"}] },
  result_viral_rash: { result: true, severity: "medium", title: "Viral Rash / Measles Suspect", advice: "Fever with rash could be measles, chickenpox, or other viral illness.", actions: ["Isolate from other family members", "Check vaccination history", "Visit PHC for proper diagnosis", "Keep skin clean and dry", "Do not scratch the rash"], whenToCall108: false },
  result_dengue_suspect: { result: true, severity: "high", title: "Dengue/Viral Fever Suspected", advice: "High fever with body pain could indicate dengue. Seek immediate medical care.", actions: ["Get NS1 antigen / dengue test immediately", "Drink plenty of fluids (papaya leaf juice may help platelets)", "Take ONLY paracetamol (NOT aspirin/ibuprofen)", "Monitor for warning signs: bleeding gums, blood in vomit/stool", "Visit hospital if platelet count drops below 100,000"], whenToCall108: true, medicines: [{name:"Paracetamol 500mg",dosage:"1 tablet every 6 hours (do NOT take aspirin)",use:"Fever control",img:"paracetamol"},{name:"ORS (Oral Rehydration Salts)",dosage:"Sip frequently throughout the day",use:"Prevents dehydration",img:"ors"}] },
  result_malaria_suspect: { result: true, severity: "high", title: "Malaria Suspected", advice: "Cyclic fever with chills is suspicious for malaria. Blood test needed.", actions: ["Get malaria blood test (rapid test or slide test)", "Visit PHC/hospital immediately", "Use mosquito net until recovered", "Take prescribed antimalarials on time", "Stay hydrated"], whenToCall108: true, medicines: [{name:"Paracetamol 500mg",dosage:"1 tablet every 6 hours for fever",use:"Controls fever and chills",img:"paracetamol"},{name:"ORS (Oral Rehydration Salts)",dosage:"Sip frequently",use:"Prevents dehydration from sweating",img:"ors"}] },
  result_mild_breathing: { result: true, severity: "low", title: "Mild Breathing Issues", advice: "Could be due to allergies, mild infection, or anxiety.", actions: ["Practice slow deep breathing", "Avoid dust, smoke and allergens", "Try steam inhalation", "Visit doctor if worsening", "Avoid vigorous exercise until better"] },
  result_moderate_breathing: { result: true, severity: "medium", title: "Moderate Breathing Difficulty", advice: "This needs medical evaluation. Could be pneumonia, TB, or asthma.", actions: ["Visit nearest hospital/PHC today", "Sit upright, don't lie flat", "Stay calm and breathe slowly", "Get chest X-ray done", "Oxygen may be needed"], whenToCall108: false },
  result_emergency_breathing: { result: true, severity: "critical", title: "EMERGENCY — Severe Breathing Distress", advice: "CALL 108 IMMEDIATELY. This is a medical emergency.", actions: ["CALL 108 NOW", "Sit upright / do not lie down", "Loosen tight clothing", "If available, give oxygen", "Do NOT give water if barely conscious"], whenToCall108: true },
  result_diarrhea: { result: true, severity: "medium", title: "Diarrhea / Loose Motions", advice: "Focus on preventing dehydration. Most cases resolve in 2-3 days.", actions: ["Drink ORS after every loose motion", "Homemade ORS: 1L water + 6 tsp sugar + 0.5 tsp salt", "Eat bananas, curd rice, light dal", "Avoid milk, spicy food, caffeine", "Visit PHC if blood in stool or lasting >3 days"], medicines: [{name:"ORS (Oral Rehydration Salts)",dosage:"After every loose motion",use:"Replaces lost fluids and salts",img:"ors"},{name:"Zinc Tablets 20mg",dosage:"1 tablet daily for 14 days",use:"Reduces duration and severity",img:"paracetamol"}] },
  result_vomiting: { result: true, severity: "medium", title: "Vomiting", advice: "Avoid solid food for a few hours. Sip liquids slowly.", actions: ["Sip small amounts of water/ORS frequently", "Avoid solid food for 2-4 hours", "After vomiting stops, start with bland food", "Take ondansetron/domperidone if available", "Visit doctor if vomiting blood or lasting >24 hours"] },
  result_stomach_pain: { result: true, severity: "medium", title: "Stomach/Abdominal Pain", advice: "Could be gastritis, infection, or appendicitis if severe.", actions: ["Note location and severity of pain", "Try antacid if upper stomach burning", "Avoid spicy/oily food", "Visit PHC if severe or right lower abdomen pain", "CALL 108 if unbearable pain with fever"], whenToCall108: false },
  result_constipation: { result: true, severity: "low", title: "Constipation", advice: "Usually resolves with diet changes.", actions: ["Drink 8-10 glasses of water daily", "Eat papaya, prune, high-fiber food", "Walk for 30 minutes daily", "Try Isabgol (psyllium husk) with warm milk", "Visit doctor if blood in stool or lasting >2 weeks"] },
  result_blood_stool: { result: true, severity: "high", title: "Blood in Stool — See Doctor", advice: "Blood in stool needs immediate evaluation. Could be piles, infection, or ulcer.", actions: ["Visit hospital immediately", "Note color (bright red vs dark/black)", "Stay hydrated", "Do NOT ignore this symptom", "Get stool test and blood test done"], whenToCall108: false },
  result_headache: { result: true, severity: "low", title: "Headache", advice: "Most headaches are tension-type or migraine. Usually not serious.", actions: ["Take paracetamol 500mg", "Rest in a dark, quiet room", "Apply cold compress on forehead", "Stay hydrated", "Visit doctor if worst headache ever, or with fever + stiff neck"], medicines: [{name:"Paracetamol 500mg",dosage:"1 tablet, can repeat after 6 hours",use:"Pain relief",img:"paracetamol"}] },
  result_chest_pain: { result: true, severity: "critical", title: "Chest Pain — Seek Immediate Help", advice: "Chest pain can be a heart attack sign. Do not delay!", actions: ["CALL 108 immediately if severe", "Chew 1 aspirin 325mg (if not allergic)", "Sit upright and stay calm", "Do NOT exert yourself", "Note if pain goes to arm/jaw"], whenToCall108: true },
  result_joint_pain: { result: true, severity: "low", title: "Joint/Bone Pain", advice: "Could be arthritis, strain, or infection if with fever.", actions: ["Rest the affected joint", "Apply hot or cold compress", "Take paracetamol for pain", "Gentle stretching/exercise", "Visit doctor if swelling, redness, or fever"] },
  result_back_pain: { result: true, severity: "low", title: "Back Pain", advice: "Most back pain is muscular and resolves in 1-2 weeks.", actions: ["Stay active — bed rest makes it worse", "Apply hot compress", "Take paracetamol for pain", "Good posture when sitting", "Visit doctor if pain shoots down legs"] },
  result_skin_allergy: { result: true, severity: "low", title: "Skin Allergy / Rash", advice: "Likely an allergic reaction. Identify and avoid the trigger.", actions: ["Apply calamine lotion", "Take antihistamine (cetirizine)", "Avoid scratching", "Wear loose cotton clothes", "Visit doctor if spreading rapidly or with breathing issues"], medicines: [{name:"Cetirizine 10mg",dosage:"1 tablet daily",use:"Stops itching and allergic reaction",img:"cetirizine"},{name:"Calamine Lotion",dosage:"Apply on affected area 2-3 times daily",use:"Soothes itching and rash",img:"antiseptic_cream"}] },
  result_skin_infection: { result: true, severity: "medium", title: "Skin Infection", advice: "Boils or pus-filled bumps indicate bacterial infection.", actions: ["Keep area clean with antiseptic", "Do NOT squeeze or pop boils", "Apply antibiotic ointment", "Visit PHC for oral antibiotics if needed", "Maintain hygiene — wash hands frequently"], medicines: [{name:"Antiseptic Cream (Povidone-Iodine)",dosage:"Apply on affected area after cleaning, 2-3 times daily",use:"Prevents infection spread",img:"antiseptic_cream"},{name:"Paracetamol 500mg",dosage:"1 tablet every 6 hours if pain",use:"Pain and swelling relief",img:"paracetamol"}] },
  result_fungal: { result: true, severity: "low", title: "Fungal Infection", advice: "White patches or ring-shaped rash suggests fungal infection.", actions: ["Apply antifungal cream (clotrimazole)", "Keep skin dry and clean", "Wear loose cotton clothes", "Don't share towels/clothes", "Visit doctor if not improving in 2 weeks"] },
  result_bite: { result: true, severity: "critical", title: "Animal/Snake Bite — Hospital URGENTLY", advice: "DO NOT DELAY. Snake/animal bites can be life-threatening.", actions: ["RUSH to nearest hospital immediately", "For snake bite: Do NOT cut/suck wound, keep limb still", "Wash wound with soap and water", "Note the color/type of snake if possible", "Get anti-venom / anti-rabies as needed"], whenToCall108: true },
  result_throat: { result: true, severity: "low", title: "Sore Throat", advice: "Usually viral. Gargling helps.", actions: ["Gargle with warm salt water 3-4 times daily", "Drink warm liquids (ginger tea, turmeric milk)", "Take paracetamol for pain", "Suck on lozenges", "Visit doctor if white patches on throat or lasting >5 days"] },
  result_ear: { result: true, severity: "medium", title: "Ear Problem", advice: "Ear pain/discharge needs medical evaluation.", actions: ["Do NOT insert anything in ear", "Take paracetamol for pain", "Keep ear dry", "Visit PHC/ENT doctor", "If discharge — likely infection, needs antibiotics"] },
  result_eye: { result: true, severity: "medium", title: "Eye Problem", advice: "Eye redness with discharge could be conjunctivitis.", actions: ["Wash eyes with clean water frequently", "Do NOT rub eyes", "Avoid sharing towels", "Apply prescribed eye drops", "Visit doctor if vision affected or pain severe"] },
  result_sinus: { result: true, severity: "low", title: "Sinusitis / Nasal Blockage", advice: "Sinus congestion usually resolves with home care.", actions: ["Steam inhalation 3-4 times daily", "Use saline nasal spray", "Drink warm fluids", "Take paracetamol for headache/pain", "Visit doctor if facial pain severe or lasting >10 days"] },
  result_menstrual: { result: true, severity: "medium", title: "Menstrual Issues", advice: "Irregular or heavy periods need evaluation.", actions: ["Track your cycle pattern", "Visit gynecologist/PHC", "Take iron supplements if heavy bleeding", "Hot compress for cramps", "Blood test to check for anemia"] },
  result_pregnancy: { result: true, severity: "medium", title: "Pregnancy Concern", advice: "Pregnancy needs regular check-ups. Many govt centers offer free care.", actions: ["Regular antenatal checkups at PHC/CHC", "Take iron and folic acid tablets daily", "Get vaccinated (TT) on schedule", "CALL 108 if severe pain, bleeding, or headache", "Deliver at hospital — not at home"], whenToCall108: false },
  result_uti: { result: true, severity: "medium", title: "Urinary Infection Suspected", advice: "Burning urination with frequency is likely UTI.", actions: ["Drink lots of water (3-4 liters/day)", "Visit PHC for urine test", "Antibiotics needed — don't self-medicate", "Don't hold urine for long periods", "Maintain personal hygiene"] },
  result_breast: { result: true, severity: "high", title: "⚠️ Breast Concern — See Doctor", advice: "Any lump needs evaluation. Early detection saves lives.", actions: ["Visit gynecologist/hospital for examination", "Get mammogram/ultrasound if recommended", "Perform monthly self-examination", "Don't panic — most lumps are benign", "Early detection is the best protection"] },
  result_child_fever: { result: true, severity: "medium", title: "Child Fever", advice: "Fever in children needs careful monitoring.", actions: ["Give paracetamol syrup (dose by weight)", "Sponge with lukewarm water", "Keep child hydrated — ORS, breast milk", "Remove excess clothing", "VISIT PHC if <1 year old, or fever >103°F, or seizures"], whenToCall108: false },
  result_child_distress: { result: true, severity: "medium", title: "Child Distress", advice: "Not eating or excessive crying needs evaluation.", actions: ["Check for fever, rash, ear pulling", "Offer breast milk/fluids frequently", "Check diaper area for rash", "Observe for 6-12 hours", "Visit PHC if no improvement or child becomes lethargic"] },
  result_child_diarrhea: { result: true, severity: "high", title: "⚠️ Child Diarrhea — Risk of Dehydration", advice: "Children dehydrate very quickly. ORS is life-saving.", actions: ["Give ORS after every loose motion", "Continue breastfeeding", "Give Zinc tablets for 14 days", "Signs of dehydration: dry mouth, no tears, sunken eyes", "RUSH to hospital if dehydrated or blood in stool"], whenToCall108: true },
  result_child_breathing: { result: true, severity: "high", title: "⚠️ Child Breathing Difficulty", advice: "Rapid breathing in children can indicate pneumonia.", actions: ["Count breaths per minute (>40 for >1yr = fast)", "Keep child upright", "Visit hospital immediately", "Don't give cough syrup to small children", "Oxygen may be needed"], whenToCall108: true },
  result_anxiety: { result: true, severity: "low", title: "Anxiety / Worry", advice: "Anxiety is common and treatable. You are not alone.", actions: ["Practice deep breathing: 4-7-8 technique", "Talk to someone you trust", "Reduce phone/news time", "Walk/exercise for 30 mins daily", "NIMHANS helpline: 080-46110007", "iCALL: 9152987821"] },
  result_depression: { result: true, severity: "medium", title: "Feeling Low / Depression", advice: "Depression is a medical condition, not weakness. Help is available.", actions: ["Talk to someone you trust today", "Maintain routine — eat, sleep, walk", "Vandrevala Foundation helpline: 1860-2662-345", "NIMHANS: 080-46110007", "Visit nearest PHC for counseling", "You matter. Recovery is possible."] },
  result_insomnia: { result: true, severity: "low", title: "Sleep Problems", advice: "Sleep issues are common but fixable.", actions: ["Fixed sleep/wake time daily", "No phone/screen 1 hour before bed", "Avoid tea/coffee after 4 PM", "Dark, quiet, cool room for sleep", "Visit doctor if lasting >2 weeks"] },
  result_panic: { result: true, severity: "medium", title: "Panic Attacks", advice: "Panic attacks feel scary but are not dangerous.", actions: ["Breathe slowly: 4 seconds in, 4 out", "Ground yourself: name 5 things you can see", "Remind yourself: 'This will pass'", "Sit down, close eyes, focus on breathing", "Seek therapy — CBT is very effective"] },
  result_wound: { result: true, severity: "medium", title: "Wound / Bleeding", advice: "Most wounds heal with proper cleaning.", actions: ["Wash with clean water + soap", "Press clean cloth on wound to stop bleeding", "Apply antiseptic (Betadine/Dettol)", "Cover with clean bandage", "Get tetanus shot if deep wound or rusty object", "Visit PHC if deep or won't stop bleeding"], medicines: [{name:"Antiseptic Cream (Povidone-Iodine)",dosage:"Apply after cleaning wound",use:"Prevents infection",img:"antiseptic_cream"},{name:"Paracetamol 500mg",dosage:"1 tablet every 6 hours if pain",use:"Pain relief",img:"paracetamol"}] },
  result_burn: { result: true, severity: "medium", title: "Burn Injury", advice: "Cool the burn immediately. Do NOT apply toothpaste/butter.", actions: ["Run cool (not cold) water for 10-20 mins", "Do NOT apply toothpaste, ice, or butter", "Do NOT burst blisters", "Cover loosely with clean cloth", "Take paracetamol for pain", "Visit hospital if burn larger than palm or on face/joints"] },
  result_fracture: { result: true, severity: "high", title: "⚠️ Suspected Fracture", advice: "Don't move the injured part. Immobilize and seek help.", actions: ["Do NOT try to straighten the bone", "Immobilize with a splint (sticks + cloth)", "Apply ice wrapped in cloth to reduce swelling", "Keep injured part elevated", "Visit hospital for X-ray"], whenToCall108: true },
};

// ── FIRST AID GUIDES ──
export const firstAidGuides = [
  {
    id: 'snake_bite',
    title: '🐍 Snake Bite',
    severity: 'critical',
    steps: [
      'Keep calm. Move away from the snake.',
      'Keep the bitten limb STILL and below heart level.',
      'Remove any rings, watches, or tight clothing near the bite.',
      'Do NOT cut the wound or try to suck out venom.',
      'Do NOT apply a tourniquet.',
      'Do NOT apply ice, heat, or herbal remedies.',
      'Mark the time of the bite.',
      'Note the snake\'s color/pattern if safely possible.',
      'RUSH to the nearest hospital immediately for anti-venom.',
      'CALL 108 for ambulance.'
    ]
  },
  {
    id: 'burns',
    title: '🔥 Burns',
    severity: 'high',
    steps: [
      'Run cool (NOT cold) water over the burn for 10-20 minutes.',
      'Do NOT apply toothpaste, butter, or ice.',
      'Do NOT burst any blisters.',
      'Remove clothing/jewelry near the burn (if not stuck).',
      'Cover loosely with clean, non-fluffy bandage.',
      'Take paracetamol for pain.',
      'Drink plenty of water.',
      'Seek medical help if: burn is larger than palm, on face/hands/joints, or causes blisters.'
    ]
  },
  {
    id: 'choking',
    title: '😫 Choking',
    severity: 'critical',
    steps: [
      'If person can cough — encourage them to keep coughing.',
      'If person CANNOT cough/speak/breathe:',
      'Stand behind them, lean them forward.',
      'Give 5 sharp back blows between shoulder blades.',
      'If still choking: Heimlich maneuver — fist above navel, pull inward & upward.',
      'Repeat 5 back blows + 5 abdominal thrusts.',
      'If person becomes unconscious: start CPR.',
      'CALL 108 immediately.',
      'For infants: 5 back blows + 5 chest thrusts (2 fingers on breastbone).'
    ]
  },
  {
    id: 'heart_attack',
    title: '❤️ Heart Attack Signs',
    severity: 'critical',
    steps: [
      'Signs: Chest pain/pressure, pain in arm/jaw/back, breathlessness, sweating.',
      'CALL 108 IMMEDIATELY.',
      'Make person sit upright, loosen tight clothing.',
      'Give 1 aspirin 325mg to chew (if not allergic).',
      'If person becomes unconscious and no pulse: start CPR.',
      'CPR: 30 chest compressions + 2 breaths, repeat.',
      'Use AED if available.',
      'Do NOT leave the person alone.',
      'Time is critical — every minute matters.'
    ]
  },
  {
    id: 'dehydration',
    title: '💧 Dehydration (ORS)',
    severity: 'high',
    steps: [
      'Signs: Dry mouth, dark urine, dizziness, sunken eyes (in children).',
      'Homemade ORS: 1 liter clean water + 6 teaspoons sugar + ½ teaspoon salt.',
      'Give small sips frequently (not large gulps).',
      'For children: 1 cup ORS after every loose motion.',
      'Continue breastfeeding for infants.',
      'Coconut water and buttermilk are also helpful.',
      'DANGER signs: No urine for 6+ hours, lethargic, very fast breathing.',
      'Rush to hospital if danger signs present.'
    ]
  },
  {
    id: 'fracture',
    title: '🦴 Fracture / Broken Bone',
    severity: 'high',
    steps: [
      'Do NOT move the injured part.',
      'Do NOT try to push bone back.',
      'Immobilize: Use sticks/cardboard as splint, tie with cloth.',
      'Apply ice pack wrapped in cloth (20 mins on, 20 mins off).',
      'Elevate the injured limb if possible.',
      'Give paracetamol for pain (NOT aspirin).',
      'For open fracture (bone visible): Cover with clean cloth, do not touch.',
      'Transport to hospital carefully, keeping limb immobilized.'
    ]
  },
  {
    id: 'drowning',
    title: '🌊 Drowning / Near-Drowning',
    severity: 'critical',
    steps: [
      'Pull person out of water (ensure your own safety first).',
      'Lay person on their back on a flat surface.',
      'Check if breathing. If not breathing: start CPR immediately.',
      'CPR: 30 chest compressions + 2 rescue breaths. Repeat.',
      'Do NOT try to pump water out of stomach.',
      'Turn on side if vomiting occurs.',
      'Keep person warm with blankets/clothes.',
      'CALL 108 even if person seems recovered.',
      'All near-drowning victims must be evaluated at hospital.'
    ]
  },
  {
    id: 'heatstroke',
    title: '☀️ Heatstroke',
    severity: 'high',
    steps: [
      'Signs: Very high body temp, confusion, dry/hot skin, no sweating.',
      'Move person to shade or cool area immediately.',
      'Remove excess clothing.',
      'Cool body: Pour water, fan, apply wet cloths to neck/armpits/groin.',
      'Give cool water to drink (if conscious).',
      'Do NOT give very cold/iced drinks.',
      'CALL 108 if confusion, unconsciousness, or temp >104°F.',
      'Heatstroke can be fatal — act quickly.'
    ]
  }
];

// ── PHC/CHC DATABASE (Sample — organized by state/district) ──
export const phcDatabase = [
  // UTTAR PRADESH
  { state: "Uttar Pradesh", district: "Lucknow", name: "PHC Malihabad", type: "PHC", address: "Malihabad Block, Lucknow", phone: "0522-2840XXX", services: ["OPD", "Maternal Care", "Immunization", "Lab"] },
  { state: "Uttar Pradesh", district: "Lucknow", name: "CHC Mohanlalganj", type: "CHC", address: "Mohanlalganj, Lucknow", phone: "0522-2860XXX", services: ["OPD", "Surgery", "Maternal Care", "Emergency", "Lab", "X-Ray"] },
  { state: "Uttar Pradesh", district: "Varanasi", name: "PHC Cholapur", type: "PHC", address: "Cholapur Block, Varanasi", phone: "0542-25XXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  { state: "Uttar Pradesh", district: "Agra", name: "CHC Fatehpur Sikri", type: "CHC", address: "Fatehpur Sikri, Agra", phone: "0562-28XXXXX", services: ["OPD", "Surgery", "Emergency", "Lab"] },
  // BIHAR
  { state: "Bihar", district: "Patna", name: "PHC Danapur", type: "PHC", address: "Danapur Block, Patna", phone: "0612-25XXXXX", services: ["OPD", "Maternal Care", "Immunization", "Lab"] },
  { state: "Bihar", district: "Patna", name: "CHC Phulwari Sharif", type: "CHC", address: "Phulwari Sharif, Patna", phone: "0612-23XXXXX", services: ["OPD", "Surgery", "Maternal Care", "Emergency"] },
  { state: "Bihar", district: "Gaya", name: "PHC Bodh Gaya", type: "PHC", address: "Bodh Gaya Block, Gaya", phone: "0631-22XXXXX", services: ["OPD", "Immunization", "Maternal Care"] },
  // MADHYA PRADESH
  { state: "Madhya Pradesh", district: "Bhopal", name: "PHC Berasia", type: "PHC", address: "Berasia Block, Bhopal", phone: "0755-28XXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  { state: "Madhya Pradesh", district: "Indore", name: "CHC Mhow", type: "CHC", address: "Mhow, Indore", phone: "0732-28XXXXX", services: ["OPD", "Surgery", "Emergency", "Lab", "X-Ray"] },
  // RAJASTHAN
  { state: "Rajasthan", district: "Jaipur", name: "PHC Amber", type: "PHC", address: "Amber Block, Jaipur", phone: "0141-25XXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  { state: "Rajasthan", district: "Jodhpur", name: "CHC Osian", type: "CHC", address: "Osian, Jodhpur", phone: "0291-26XXXXX", services: ["OPD", "Surgery", "Emergency", "Maternal Care"] },
  // MAHARASHTRA
  { state: "Maharashtra", district: "Pune", name: "PHC Mulshi", type: "PHC", address: "Mulshi Taluka, Pune", phone: "020-25XXXXXX", services: ["OPD", "Maternal Care", "Immunization", "Lab"] },
  { state: "Maharashtra", district: "Nashik", name: "CHC Igatpuri", type: "CHC", address: "Igatpuri, Nashik", phone: "02553-2XXXXX", services: ["OPD", "Surgery", "Emergency", "Lab"] },
  // TAMIL NADU
  { state: "Tamil Nadu", district: "Chennai", name: "PHC Tambaram", type: "PHC", address: "Tambaram, Chennai", phone: "044-22XXXXXX", services: ["OPD", "Maternal Care", "Immunization", "Lab"] },
  { state: "Tamil Nadu", district: "Madurai", name: "CHC Usilampatti", type: "CHC", address: "Usilampatti, Madurai", phone: "04549-2XXXXX", services: ["OPD", "Surgery", "Emergency", "Maternal Care"] },
  // KARNATAKA
  { state: "Karnataka", district: "Bangalore Rural", name: "PHC Nelamangala", type: "PHC", address: "Nelamangala, Bangalore Rural", phone: "080-27XXXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  { state: "Karnataka", district: "Mysore", name: "CHC Hunsur", type: "CHC", address: "Hunsur, Mysore", phone: "08222-2XXXXX", services: ["OPD", "Surgery", "Emergency", "Lab"] },
  // WEST BENGAL
  { state: "West Bengal", district: "Kolkata", name: "PHC Baruipur", type: "PHC", address: "Baruipur, South 24 Parganas", phone: "033-24XXXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  // ODISHA
  { state: "Odisha", district: "Bhubaneswar", name: "CHC Jatni", type: "CHC", address: "Jatni, Khurda", phone: "0674-24XXXXX", services: ["OPD", "Surgery", "Emergency", "Maternal Care"] },
  // CHHATTISGARH
  { state: "Chhattisgarh", district: "Raipur", name: "PHC Abhanpur", type: "PHC", address: "Abhanpur Block, Raipur", phone: "0771-25XXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  // JHARKHAND  
  { state: "Jharkhand", district: "Ranchi", name: "PHC Kanke", type: "PHC", address: "Kanke Block, Ranchi", phone: "0651-24XXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
  // ASSAM
  { state: "Assam", district: "Guwahati", name: "PHC Sonapur", type: "PHC", address: "Sonapur, Kamrup Metro", phone: "0361-28XXXXX", services: ["OPD", "Maternal Care", "Immunization"] },
];

// ── HELPLINE NUMBERS ──
export const helplines = [
  { name: "Ambulance", number: "108", desc: "National emergency ambulance service", icon: "🚑" },
  { name: "Medical Emergency", number: "102", desc: "Mother & child ambulance", icon: "🏥" },
  { name: "Women Helpline", number: "181", desc: "Women in distress", icon: "👩" },
  { name: "Child Helpline", number: "1098", desc: "Children in need", icon: "👶" },
  { name: "Mental Health (NIMHANS)", number: "080-46110007", desc: "24/7 mental health support", icon: "🧠" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "Mental health helpline", icon: "💚" },
  { name: "iCALL", number: "9152987821", desc: "Psychosocial helpline", icon: "📞" },
  { name: "Poison Control", number: "1800-11-6117", desc: "National poison helpline", icon: "☠️" },
  { name: "TB Helpline", number: "1800-11-6666", desc: "Tuberculosis info & support", icon: "🫁" },
  { name: "AIDS Helpline", number: "1097", desc: "HIV/AIDS information", icon: "🎗️" },
  { name: "Police", number: "100", desc: "Police emergency", icon: "👮" },
  { name: "Fire", number: "101", desc: "Fire emergency", icon: "🔥" },
];

export const statesList = [...new Set(phcDatabase.map(p => p.state))].sort();
export const getDistrictsByState = (state) => [...new Set(phcDatabase.filter(p => p.state === state).map(p => p.district))].sort();

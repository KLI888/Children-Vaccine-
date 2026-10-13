import { addDays, format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import {
  VaccineDefinition,
  ScheduleRule,
  ChildVaccination,
  ScheduledReminder,
  VaccinationStatus,
  ReminderStage,
} from './types';

export const SCHEDULE_VERSION = {
  id: 'uip-india-2024-v1',
  name: 'National Immunization Schedule (NIS) — UIP India',
  sourceOrg: 'Ministry of Health & Family Welfare (MoHFW), Govt. of India',
  sourceUrl: 'https://www.mohfw.gov.in/sites/default/files/Routine%20Immunization%20Manual%20For%20Health%20Workers.pdf',
  lastReviewed: '2026-10-13',
};

// 1. OFFICIAL VACCINE DEFINITIONS
export const VACCINE_DEFINITIONS: Record<string, VaccineDefinition> = {
  bcg: {
    id: 'bcg',
    name: 'BCG (Bacillus Calmette–Guérin)',
    marathiName: 'बीसीजी (क्षयरोग प्रतिबंधक लस)',
    shortCode: 'BCG',
    category: 'uip_mandatory',
    diseasesPrevented: 'Childhood Tuberculosis (TB) and Tubercular Meningitis',
    marathiDiseasesPrevented: 'बालपणातील क्षयरोग (टीबी) आणि मेंदूचा क्षयरोग',
    description: 'BCG vaccine protects infants against severe forms of childhood tuberculosis. Given once at birth or as early as possible within the first year of life.',
    marathiDescription: 'बीसीजी लस बालकांना क्षयरोगाच्या गंभीर रूपांपासून संरक्षण देते. जन्मानंतर शक्य तितक्या लवकर किंवा पहिल्या वर्षात दिली जाते.',
    commonReactions: [
      'Small raised red papule at injection site after 2–3 weeks',
      'Small scar usually forms after 6–12 weeks (normal healing process)',
      'Mild localized tenderness',
    ],
    marathiCommonReactions: [
      '२–३ आठवड्यांनंतर टोचलेल्या जागेवर लहान लाल पुरळ येणे',
      '६–१२ आठवड्यांनंतर कायमस्वरूपी लहान खूण तयार होणे (नैसर्गिक प्रक्रिया)',
      'टोचलेल्या ठिकाणी हलके दुखणे',
    ],
    warningSigns: [
      'Large abscess (>10mm) or persistent purulent discharge',
      'Enlarged painful lymph nodes in the armpit or neck (>1cm)',
      'High persistent fever (>102°F)',
    ],
    marathiWarningSigns: [
      'मोठी गाठ (१० मिमी पेक्षा जास्त) किंवा सतत पू येणे',
      'काखेत किंवा मानेमध्ये वेदनादायक सुजलेल्या लिम्फ नोड्स',
      'सतत तीव्र ताप (१०२° फॅ पेक्षा जास्त)',
    ],
    routeAndSite: '0.1 mL Intradermal (Left upper arm)',
    marathiRouteAndSite: '०.१ मिली इंट्राडर्मल (डाव्या हाताचा दंड)',
    sourceRef: 'MoHFW Universal Immunization Programme Manual',
    lastReviewed: '2026-10-13',
  },
  hepb: {
    id: 'hepb',
    name: 'Hepatitis B (Birth Dose)',
    marathiName: 'हेपॅटायटिस बी (जन्म डोस)',
    shortCode: 'Hep B-0',
    category: 'uip_mandatory',
    diseasesPrevented: 'Hepatitis B viral infection and chronic liver disease',
    marathiDiseasesPrevented: 'हेपॅटायटिस बी विषाणू संसर्ग व यकृताचा दीर्घकालीन आजार',
    description: 'Crucial birth dose given within 24 hours of birth to prevent perinatal transmission from mother to child.',
    marathiDescription: 'आईकडून बाळाला होणारा संसर्ग रोखण्यासाठी जन्माच्या २४ तासांच्या आत दिली जाणारी अत्यंत महत्त्वाची लस.',
    commonReactions: ['Soreness at injection site', 'Mild fever for 24–48 hours', 'Fussiness'],
    marathiCommonReactions: ['टोचलेल्या जागेवर दुखणे', '२४–४८ तास हलका ताप', 'बाळ चिडचिड करणे'],
    warningSigns: ['Severe allergic reaction (hives, difficulty breathing)', 'High fever above 102°F'],
    marathiWarningSigns: ['तीव्र ॲलर्जी (अंगावर पुरळ उठणे, श्वास घेण्यास त्रास)', '१०२° फॅ पेक्षा जास्त तीव्र ताप'],
    routeAndSite: '0.5 mL Intramuscular (Anterolateral mid-thigh)',
    marathiRouteAndSite: '०.५ मिली इंट्रामस्क्युलर (मांडीचा पुढील बाहेरील भाग)',
    sourceRef: 'MoHFW Routine Immunization Guidelines',
    lastReviewed: '2026-10-13',
  },
  opv: {
    id: 'opv',
    name: 'Oral Polio Vaccine (OPV)',
    marathiName: 'तोंडी पोलिओ लस (ओपीव्ही)',
    shortCode: 'OPV',
    category: 'uip_mandatory',
    diseasesPrevented: 'Poliomyelitis (Infantile Paralysis)',
    marathiDiseasesPrevented: 'पोलिओ (बालपक्षाघात)',
    description: 'Live attenuated oral polio vaccine drops administered at birth (zero dose), 6, 10, 14 weeks, and booster at 16–24 months.',
    marathiDescription: 'तोंडात दिले जाणारे पोलिओचे २ थेंब (० डोस जन्मावेळी, नंतर ६, १०, १४ आठवड्यांत आणि बूस्टर १६–२४ महिन्यांत).',
    commonReactions: ['Rarely mild loose stools or transient irritability', 'No injection pain'],
    marathiCommonReactions: ['क्वचित पातळ शौच किंवा हलकी चिडचिड', 'इंजेक्शनचे दुखणे नसते'],
    warningSigns: ['Severe allergic reaction within hours of administration (extremely rare)'],
    marathiWarningSigns: ['लस घेतल्यानंतर तीव्र ॲलर्जी (अतिशय दुर्मिळ)'],
    routeAndSite: '2 Drops Orally',
    marathiRouteAndSite: '२ थेंब तोंडावाटे',
    sourceRef: 'MoHFW National Immunization Schedule',
    lastReviewed: '2026-10-13',
  },
  pentavalent: {
    id: 'pentavalent',
    name: 'Pentavalent (DPT + Hep B + Hib)',
    marathiName: 'पेंटाव्हॅलेंट (घटसर्प, डांग्या खोकला, धनुर्वात, हेपॅटायटिस बी, हिब)',
    shortCode: 'Penta',
    category: 'uip_mandatory',
    diseasesPrevented: 'Diphtheria, Pertussis (Whooping Cough), Tetanus, Hepatitis B, and Haemophilus Influenzae Type b pneumonia/meningitis',
    marathiDiseasesPrevented: 'घटसर्प, डांग्या खोकला, धनुर्वात, हेपॅटायटिस बी, आणि हिब न्यूमोनिया/मेंदूज्वर',
    description: 'A 5-in-1 combination vaccine given at 6, 10, and 14 weeks. Replaces individual DPT and Hep B doses for early infant protection.',
    marathiDescription: '५ रोगांपासून एकाच इंजेक्शनमध्ये संरक्षण देणारी लस. ६, १० आणि १४ आठवड्यांत दिली जाते.',
    commonReactions: [
      'Low to moderate fever for 1–2 days',
      'Pain, swelling, or redness at injection site in the thigh',
      'Irritability, sleepiness, or mild crying',
    ],
    marathiCommonReactions: [
      '१–२ दिवस हलका ते मध्यम ताप',
      'मांडीवर टोचलेल्या ठिकाणी दुखणे, सूज किंवा लालसरपणा',
      'चिडचिड किंवा जास्त झोप येणे',
    ],
    warningSigns: [
      'Continuous inconsolable crying for more than 3 hours',
      'Fever higher than 103°F (39.5°C)',
      'Convulsions or seizures within 72 hours',
    ],
    marathiWarningSigns: [
      'बाळ सलग ३ तासांपेक्षा जास्त वेळ शांत न होता रडणे',
      '१०३° फॅ पेक्षा जास्त अतिउष्ण ताप',
      '७२ तासांत झटके किंवा आकडी येणे',
    ],
    routeAndSite: '0.5 mL Intramuscular (Anterolateral mid-thigh)',
    marathiRouteAndSite: '०.५ मिली इंट्रामस्क्युलर (मांडीचा पुढील बाहेरील भाग)',
    sourceRef: 'MoHFW UIP India Guidelines',
    lastReviewed: '2026-10-13',
  },
  fipv: {
    id: 'fipv',
    name: 'Fractional Inactivated Poliovirus Vaccine (fIPV)',
    marathiName: 'एफआयपीव्ही (इनॲक्टिव्हेटेड पोलिओ लस)',
    shortCode: 'fIPV',
    category: 'uip_mandatory',
    diseasesPrevented: 'Poliomyelitis (Strengthened systemic immunity against all poliovirus types)',
    marathiDiseasesPrevented: 'पोलिओ विषाणूचे सर्व प्रकार (रक्तातील रोगप्रतिकारशक्ती)',
    description: 'Intradermal killed poliovirus vaccine administered in fractional doses at 6 weeks, 14 weeks, and 9 months according to MoHFW guidelines.',
    marathiDescription: 'त्वचेच्या थरात दिली जाणारी पोलिओची विशेष लस (६ आठवडे, १४ आठवडे आणि ९ महिने).',
    commonReactions: ['Small red spot or wheal at injection site', 'Mild localized soreness'],
    marathiCommonReactions: ['टोचलेल्या जागेवर लहान लाल व्रण', 'हलके दुखणे'],
    warningSigns: ['High fever', 'Severe swelling spreading beyond shoulder'],
    marathiWarningSigns: ['तीव्र ताप', 'खांद्याबाहेर पसरलेली मोठी सूज'],
    routeAndSite: '0.1 mL Intradermal (Right upper arm)',
    marathiRouteAndSite: '०.१ मिली इंट्राडर्मल (उजव्या हाताचा दंड)',
    sourceRef: 'MoHFW fIPV Policy Circular',
    lastReviewed: '2026-10-13',
  },
  rvv: {
    id: 'rvv',
    name: 'Rotavirus Vaccine (RVV)',
    marathiName: 'रोटाव्हायरस लस (अतिसार प्रतिबंधक)',
    shortCode: 'RVV',
    category: 'uip_mandatory',
    diseasesPrevented: 'Severe Rotavirus Diarrhea and Dehydration in infants',
    marathiDiseasesPrevented: 'रोटाव्हायरसमुळे होणारा गंभीर अतिसार आणि निर्जलीकरण (उलट्या-जुलाब)',
    description: 'Oral drops given at 6, 10, and 14 weeks to shield infants against life-threatening dehydration from viral diarrhea.',
    marathiDescription: '६, १० आणि १४ आठवड्यांत तोंडावाटे दिले जाणारे थेंब, जे बालकांना जुलाब व डिहायड्रेशनपासून वाचवतात.',
    commonReactions: ['Mild irritability', 'Temporary loose stools or gas in a small percentage of infants'],
    marathiCommonReactions: ['हलकी चिडचिड', 'काही बालकांमध्ये थोडा वेळ पातळ शौच किंवा गॅस'],
    warningSigns: [
      'Severe abdominal pain (drawing legs to abdomen with screaming)',
      'Blood in stools or currant-jelly stools (sign of intussusception)',
      'Persistent vomiting and refusal to feed',
    ],
    marathiWarningSigns: [
      'पोटात अतिशय तीव्र कळा (बाळ पाय पोटाशी धरून रडणे)',
      'शौचातून रक्त पडणे',
      'सतत उलट्या होणे आणि दूध पिण्यास नकार देणे',
    ],
    routeAndSite: '5 Drops / 2.5 mL Orally (per brand formulation)',
    marathiRouteAndSite: '५ थेंब तोंडावाटे',
    sourceRef: 'MoHFW Universal Immunization Programme',
    lastReviewed: '2026-10-13',
  },
  pcv: {
    id: 'pcv',
    name: 'Pneumococcal Conjugate Vaccine (PCV)',
    marathiName: 'पीसीव्ही (न्यूमोकोकल न्यूमोनिया लस)',
    shortCode: 'PCV',
    category: 'uip_mandatory',
    diseasesPrevented: 'Streptococcus pneumoniae (Severe Pneumonia, Bacteremia, and Meningitis)',
    marathiDiseasesPrevented: 'न्यूमोकोकल न्यूमोनिया, रक्ताचा संसर्ग आणि मेंदूज्वर',
    description: 'Protects against dangerous bacterial pneumonia and blood infections. Given at 6 weeks, 14 weeks, with booster at 9 months.',
    marathiDescription: 'फुफ्फुसांचा न्यूमोनिया आणि गंभीर संसर्गापासून संरक्षण. ६ आठवडे, १४ आठवडे आणि ९ व्या महिन्यात बूस्टर.',
    commonReactions: ['Fever (usually mild to moderate)', 'Redness and tenderness at thigh injection site', 'Loss of appetite for a day'],
    marathiCommonReactions: ['हलका ते मध्यम ताप', 'मांडीवर टोचलेल्या ठिकाणी लालसरपणा व दुखणे', 'दिवसभर भूक मंदावणे'],
    warningSigns: ['High fever (>102°F)', 'Extreme lethargy or unresponsiveness', 'Swelling exceeding injection area'],
    marathiWarningSigns: ['१०२° फॅ पेक्षा जास्त ताप', 'अतिशय सुस्ती किंवा बाळ प्रतिसाद न देणे', 'मोठी सूज'],
    routeAndSite: '0.5 mL Intramuscular (Anterolateral mid-thigh)',
    marathiRouteAndSite: '०.५ मिली इंट्रामस्क्युलर (मांडीचा पुढील भाग)',
    sourceRef: 'MoHFW PCV Nationwide Rollout Guidelines',
    lastReviewed: '2026-10-13',
  },
  mr: {
    id: 'mr',
    name: 'Measles & Rubella (MR Vaccine)',
    marathiName: 'गोवर आणि रुबेला (एमआर लस)',
    shortCode: 'MR',
    category: 'uip_mandatory',
    diseasesPrevented: 'Measles (Khasra) and Rubella (German Measles)',
    marathiDiseasesPrevented: 'गोवर आणि रुबेला (जर्मन गोवर)',
    description: 'Subcutaneous vaccine given at 9–12 months (Dose 1) and 16–24 months (Dose 2) to eliminate measles and prevent congenital rubella syndrome.',
    marathiDescription: 'गोवर आणि रुबेलापासून संरक्षणासाठी ९–१२ महिने (डोस १) आणि १६–२४ महिने (डोस २) या वयात दिली जाते.',
    commonReactions: [
      'Mild fever 5–12 days post-vaccination (delayed viral immune response)',
      'Transient faint rash lasting 1–2 days',
      'Mild local discomfort',
    ],
    marathiCommonReactions: [
      'लस दिल्यानंतर ५–१२ दिवसांनी हलका ताप (नैसर्गिक प्रतिकारशक्ती)',
      '१–२ दिवस अंगावर बारीक हलके पुरळ',
      'टोचलेल्या ठिकाणी हलके दुखणे',
    ],
    warningSigns: ['High persistent fever', 'Difficulty breathing or wheezing', 'Stiff neck or convulsions'],
    marathiWarningSigns: ['सतत तीव्र ताप', 'श्वास घेण्यास त्रास किंवा घरघर', 'मान ताठ होणे किंवा झटके'],
    routeAndSite: '0.5 mL Subcutaneous (Right upper arm)',
    marathiRouteAndSite: '०.५ मिली सबम्युकोसल/सबक्युटेनियस (उजव्या हाताचा दंड)',
    sourceRef: 'MoHFW Measles-Rubella Elimination Strategy',
    lastReviewed: '2026-10-13',
  },
  je: {
    id: 'je',
    name: 'Japanese Encephalitis (JE Vaccine)',
    marathiName: 'जपानी मेंदूज्वर लस (जेई)',
    shortCode: 'JE',
    category: 'uip_regional',
    diseasesPrevented: 'Mosquito-borne Japanese Encephalitis viral brain infection',
    marathiDiseasesPrevented: 'डासांमुळे होणारा जपानी मेंदूज्वर (मेंदूची सूज)',
    description: 'Provided in endemic districts across India at 9–12 months (Dose 1) and 16–24 months (Dose 2). Check with local health centre for district eligibility.',
    marathiDescription: 'मेंदूज्वराचा प्रादुर्भाव असलेल्या जिल्ह्यांमध्ये ९–१२ महिने आणि १६–२४ महिन्यांत दिली जाते.',
    commonReactions: ['Mild headache or irritability in older toddlers', 'Low-grade fever', 'Sore arm'],
    marathiCommonReactions: ['हलके डोकेदुखी किंवा चिडचिड', 'हलका ताप', 'हातात वेदना'],
    warningSigns: ['High fever', 'Altered sensorium or disorientation', 'Seizures'],
    marathiWarningSigns: ['तीव्र ताप', 'बाळ गोंधळलेले वाटणे किंवा बेशुद्ध होणे', 'आकडी'],
    routeAndSite: '0.5 mL Subcutaneous (Left upper arm)',
    marathiRouteAndSite: '०.५ मिली सबक्युटेनियस (डाव्या हाताचा दंड)',
    sourceRef: 'National Vector Borne Disease Control Programme',
    lastReviewed: '2026-10-13',
  },
  vitamina: {
    id: 'vitamina',
    name: 'Vitamin A Supplementation',
    marathiName: 'व्हिटॅमिन ए द्रावण (दृष्टी व प्रतिकारशक्ती)',
    shortCode: 'Vit A',
    category: 'uip_mandatory',
    diseasesPrevented: 'Night blindness, corneal xerophthalmia, and immune deficiency',
    marathiDiseasesPrevented: 'रातांधळेपणा, डोळ्यांचे विकार आणि रोगप्रतिकारशक्तीची कमतरता',
    description: 'Dose 1 (1 lakh IU) at 9 months alongside MR-1. Dose 2 (2 lakh IU) at 16–24 months with MR-2, followed by bi-annual doses till 5 years.',
    marathiDescription: '९ व्या महिन्यात १ लाख युनिट्स, १६–२४ महिन्यांत २ लाख युनिट्स, त्यानंतर ५ वर्षांपर्यंत दर ६ महिन्यांनी दिले जाणारे द्रावण.',
    commonReactions: ['Rarely mild nausea or transient vomiting', 'Generally very safe and well tolerated'],
    marathiCommonReactions: ['क्वचित मळमळ किंवा उलट्या', 'सहसा अतिशय सुरक्षित'],
    warningSigns: ['Bulging fontanelle or persistent vomiting (very rare transient side effect)'],
    marathiWarningSigns: ['टाळू फुगणे किंवा सतत उलट्या होणे (अतिशय दुर्मिळ)'],
    routeAndSite: '1 mL / 2 mL Orally via spoon/dropper',
    marathiRouteAndSite: '१ किंवा २ मिली तोंडावाटे चमच्याने',
    sourceRef: 'MoHFW Micronutrient Supplementation Guidelines',
    lastReviewed: '2026-10-13',
  },
  dpt: {
    id: 'dpt',
    name: 'DPT Booster (Diphtheria, Pertussis, Tetanus)',
    marathiName: 'डीपीटी बूस्टर (घटसर्प, डांग्या खोकला, धनुर्वात)',
    shortCode: 'DPT',
    category: 'uip_mandatory',
    diseasesPrevented: 'Diphtheria, Pertussis, Tetanus immunity reinforcement',
    marathiDiseasesPrevented: 'घटसर्प, डांग्या खोकला आणि धनुर्वात रोगप्रतिकारशक्तीचे मजबुतीकरण',
    description: 'DPT Booster-1 given at 16–24 months; DPT Booster-2 given at 5–6 years before school entry.',
    marathiDescription: 'डीपीटी बूस्टर-१ सोळा ते २४ महिन्यांत; डीपीटी बूस्टर-२ पाच ते सहा वर्षांत शाळेत जाण्यापूर्वी दिली जाते.',
    commonReactions: ['Fever for 24–48 hours', 'Swelling and deep muscle tenderness at injection site', 'Limping for a day if given in thigh'],
    marathiCommonReactions: ['२४–४८ तास ताप', 'टोचलेल्या जागी सूज आणि स्नायूंमध्ये दुखणे', '१ दिवस चालताना लंगडणे'],
    warningSigns: ['High fever (>103°F)', 'Extreme swelling extending down to knee or elbow', 'Convulsions'],
    marathiWarningSigns: ['१०३° फॅ पेक्षा जास्त ताप', 'गुडघ्यापर्यंत किंवा कोपरापर्यंत सूज पसरणे', 'झटके'],
    routeAndSite: '0.5 mL Intramuscular (Thigh anterolateral or Deltoid for older kids)',
    marathiRouteAndSite: '०.५ मिली इंट्रामस्क्युलर (मांडी किंवा दंडावर)',
    sourceRef: 'MoHFW Routine Immunization Schedule',
    lastReviewed: '2026-10-13',
  },
  // 12th UIP Core Vaccine: Td (Tetanus and adult Diphtheria) Booster
  td: {
    id: 'td',
    name: 'Td (Tetanus & adult Diphtheria Vaccine)',
    marathiName: 'टीडी लस (धनुर्वात व घटसर्प)',
    shortCode: 'Td',
    category: 'uip_mandatory',
    diseasesPrevented: 'Tetanus (Lockjaw) and Diphtheria in older children and adolescents',
    marathiDiseasesPrevented: 'धनुर्वात आणि घटसर्प (मोठ्या बालकांसाठी)',
    description: 'Administered at 5–6 years (school entry) and 10 years as per updated National Immunization Schedule guidelines.',
    marathiDescription: 'पाच ते सहा वर्षांत शाळेत जाताना धनुर्वात व घटसर्पापासून संरक्षणासाठी दिली जाणारी लस.',
    commonReactions: ['Mild pain and soreness in upper arm', 'Low grade fever'],
    marathiCommonReactions: ['दंडावर टोचलेल्या जागी हलके दुखणे', 'हलका ताप'],
    warningSigns: ['High persistent fever', 'Severe arm swelling or allergic reaction'],
    marathiWarningSigns: ['तीव्र ताप', 'हाताला मोठी सूज किंवा ॲलर्जी'],
    routeAndSite: '0.5 mL Intramuscular (Upper arm / Deltoid)',
    marathiRouteAndSite: '०.५ मिली इंट्रामस्क्युलर (उजव्या हाताचा दंड)',
    sourceRef: 'MoHFW National Immunization Schedule 2024–2026',
    lastReviewed: '2026-10-13',
  },
};

// 2. OFFICIAL SCHEDULE RULES (Offset in calendar days from Date of Birth)
// 6 weeks = 42 days, 10 weeks = 70 days, 14 weeks = 98 days
// 9 months ~ 274 days, 16 months ~ 486 days, 5 years ~ 1826 days
export const SCHEDULE_RULES: ScheduleRule[] = [
  // --- AT BIRTH ---
  {
    id: 'rule_bcg_0',
    vaccineId: 'bcg',
    doseNumber: 1,
    doseLabel: 'Dose 1 (Birth)',
    marathiDoseLabel: 'डोस १ (जन्मावेळी)',
    offsetDays: 0,
    ageText: 'At Birth (within 24 hours)',
    marathiAgeText: 'जन्मावेळी (२४ तासांत)',
    isMandatory: true,
  },
  {
    id: 'rule_hepb_0',
    vaccineId: 'hepb',
    doseNumber: 1,
    doseLabel: 'Birth Dose',
    marathiDoseLabel: 'जन्म डोस',
    offsetDays: 0,
    ageText: 'At Birth (within 24 hours)',
    marathiAgeText: 'जन्मावेळी (२४ तासांत)',
    isMandatory: true,
  },
  {
    id: 'rule_opv_0',
    vaccineId: 'opv',
    doseNumber: 1,
    doseLabel: 'Zero Dose (OPV-0)',
    marathiDoseLabel: 'झिरो डोस (ओपीव्ही-०)',
    offsetDays: 0,
    ageText: 'At Birth (within 15 days)',
    marathiAgeText: 'जन्मावेळी (१५ दिवसांत)',
    isMandatory: true,
  },

  // --- 6 WEEKS (42 Days) ---
  {
    id: 'rule_penta_1',
    vaccineId: 'pentavalent',
    doseNumber: 1,
    doseLabel: 'Dose 1',
    marathiDoseLabel: 'डोस १',
    offsetDays: 42,
    ageText: '6 Weeks',
    marathiAgeText: '६ आठवडे',
    isMandatory: true,
  },
  {
    id: 'rule_opv_1',
    vaccineId: 'opv',
    doseNumber: 2,
    doseLabel: 'Dose 1 (OPV-1)',
    marathiDoseLabel: 'डोस १ (ओपीव्ही-१)',
    offsetDays: 42,
    ageText: '6 Weeks',
    marathiAgeText: '६ आठवडे',
    isMandatory: true,
  },
  {
    id: 'rule_fipv_1',
    vaccineId: 'fipv',
    doseNumber: 1,
    doseLabel: 'Dose 1 (fIPV-1)',
    marathiDoseLabel: 'डोस १ (एफआयपीव्ही-१)',
    offsetDays: 42,
    ageText: '6 Weeks',
    marathiAgeText: '६ आठवडे',
    isMandatory: true,
  },
  {
    id: 'rule_rvv_1',
    vaccineId: 'rvv',
    doseNumber: 1,
    doseLabel: 'Dose 1 (RVV-1)',
    marathiDoseLabel: 'डोस १ (आरव्हीव्ही-१)',
    offsetDays: 42,
    ageText: '6 Weeks',
    marathiAgeText: '६ आठवडे',
    isMandatory: true,
  },
  {
    id: 'rule_pcv_1',
    vaccineId: 'pcv',
    doseNumber: 1,
    doseLabel: 'Dose 1 (PCV-1)',
    marathiDoseLabel: 'डोस १ (पीसीव्ही-१)',
    offsetDays: 42,
    ageText: '6 Weeks',
    marathiAgeText: '६ आठवडे',
    isMandatory: true,
  },

  // --- 10 WEEKS (70 Days) ---
  {
    id: 'rule_penta_2',
    vaccineId: 'pentavalent',
    doseNumber: 2,
    doseLabel: 'Dose 2',
    marathiDoseLabel: 'डोस २',
    offsetDays: 70,
    ageText: '10 Weeks',
    marathiAgeText: '१० आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },
  {
    id: 'rule_opv_2',
    vaccineId: 'opv',
    doseNumber: 3,
    doseLabel: 'Dose 2 (OPV-2)',
    marathiDoseLabel: 'डोस २ (ओपीव्ही-२)',
    offsetDays: 70,
    ageText: '10 Weeks',
    marathiAgeText: '१० आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },
  {
    id: 'rule_rvv_2',
    vaccineId: 'rvv',
    doseNumber: 2,
    doseLabel: 'Dose 2 (RVV-2)',
    marathiDoseLabel: 'डोस २ (आरव्हीव्ही-२)',
    offsetDays: 70,
    ageText: '10 Weeks',
    marathiAgeText: '१० आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },

  // --- 14 WEEKS (98 Days) ---
  {
    id: 'rule_penta_3',
    vaccineId: 'pentavalent',
    doseNumber: 3,
    doseLabel: 'Dose 3',
    marathiDoseLabel: 'डोस ३',
    offsetDays: 98,
    ageText: '14 Weeks',
    marathiAgeText: '१४ आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },
  {
    id: 'rule_opv_3',
    vaccineId: 'opv',
    doseNumber: 4,
    doseLabel: 'Dose 3 (OPV-3)',
    marathiDoseLabel: 'डोस ३ (ओपीव्ही-३)',
    offsetDays: 98,
    ageText: '14 Weeks',
    marathiAgeText: '१४ आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },
  {
    id: 'rule_fipv_2',
    vaccineId: 'fipv',
    doseNumber: 2,
    doseLabel: 'Dose 2 (fIPV-2)',
    marathiDoseLabel: 'डोस २ (एफआयपीव्ही-२)',
    offsetDays: 98,
    ageText: '14 Weeks',
    marathiAgeText: '१४ आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },
  {
    id: 'rule_rvv_3',
    vaccineId: 'rvv',
    doseNumber: 3,
    doseLabel: 'Dose 3 (RVV-3)',
    marathiDoseLabel: 'डोस ३ (आरव्हीव्ही-३)',
    offsetDays: 98,
    ageText: '14 Weeks',
    marathiAgeText: '१४ आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },
  {
    id: 'rule_pcv_2',
    vaccineId: 'pcv',
    doseNumber: 2,
    doseLabel: 'Dose 2 (PCV-2)',
    marathiDoseLabel: 'डोस २ (पीसीव्ही-२)',
    offsetDays: 98,
    ageText: '14 Weeks',
    marathiAgeText: '१४ आठवडे',
    isMandatory: true,
    minIntervalDays: 28,
  },

  // --- 9 TO 12 MONTHS (274 Days) ---
  {
    id: 'rule_mr_1',
    vaccineId: 'mr',
    doseNumber: 1,
    doseLabel: 'Dose 1 (MR-1)',
    marathiDoseLabel: 'डोस १ (एमआर-१)',
    offsetDays: 274,
    ageText: '9–12 Months',
    marathiAgeText: '९–१२ महिने',
    isMandatory: true,
  },
  {
    id: 'rule_pcv_booster',
    vaccineId: 'pcv',
    doseNumber: 3,
    doseLabel: 'Booster Dose',
    marathiDoseLabel: 'बूस्टर डोस',
    offsetDays: 274,
    ageText: '9 Months',
    marathiAgeText: '९ महिने',
    isMandatory: true,
  },
  {
    id: 'rule_vita_1',
    vaccineId: 'vitamina',
    doseNumber: 1,
    doseLabel: 'Dose 1 (1 lakh IU)',
    marathiDoseLabel: 'डोस १ (१ लाख युनिट्स)',
    offsetDays: 274,
    ageText: '9 Months',
    marathiAgeText: '९ महिने',
    isMandatory: true,
  },
  {
    id: 'rule_fipv_3',
    vaccineId: 'fipv',
    doseNumber: 3,
    doseLabel: 'Dose 3 (fIPV-3)',
    marathiDoseLabel: 'डोस ३ (एफआयपीव्ही-३)',
    offsetDays: 274,
    ageText: '9 Months',
    marathiAgeText: '९ महिने',
    isMandatory: true,
  },

  // --- 16 TO 24 MONTHS (486 Days) ---
  {
    id: 'rule_mr_2',
    vaccineId: 'mr',
    doseNumber: 2,
    doseLabel: 'Dose 2 (MR-2)',
    marathiDoseLabel: 'डोस २ (एमआर-२)',
    offsetDays: 486,
    ageText: '16–24 Months',
    marathiAgeText: '१६–२४ महिने',
    isMandatory: true,
  },
  {
    id: 'rule_dpt_boost1',
    vaccineId: 'dpt',
    doseNumber: 1,
    doseLabel: 'Booster 1 (DPT-B1)',
    marathiDoseLabel: 'बूस्टर १ (डीपीटी-बी१)',
    offsetDays: 486,
    ageText: '16–24 Months',
    marathiAgeText: '१६–२४ महिने',
    isMandatory: true,
  },
  {
    id: 'rule_opv_booster',
    vaccineId: 'opv',
    doseNumber: 5,
    doseLabel: 'Booster Dose',
    marathiDoseLabel: 'बूस्टर डोस',
    offsetDays: 486,
    ageText: '16–24 Months',
    marathiAgeText: '१६–२४ महिने',
    isMandatory: true,
  },
  {
    id: 'rule_vita_2',
    vaccineId: 'vitamina',
    doseNumber: 2,
    doseLabel: 'Dose 2 (2 lakh IU)',
    marathiDoseLabel: 'डोस २ (२ लाख युनिट्स)',
    offsetDays: 486,
    ageText: '16–24 Months',
    marathiAgeText: '१६–२४ महिने',
    isMandatory: true,
  },

  // --- 5 TO 6 YEARS (1826 Days) ---
  {
    id: 'rule_dpt_boost2',
    vaccineId: 'dpt',
    doseNumber: 2,
    doseLabel: 'Booster 2 (DPT-B2)',
    marathiDoseLabel: 'बूस्टर २ (डीपीटी-बी२)',
    offsetDays: 1826,
    ageText: '5–6 Years',
    marathiAgeText: '५–६ वर्षे',
    isMandatory: true,
  },

  // --- 5 TO 6 YEARS (1826 Days): 12th Vaccine Td School Booster ---
  {
    id: 'rule_td_1',
    vaccineId: 'td',
    doseNumber: 1,
    doseLabel: 'School Booster (Td)',
    marathiDoseLabel: 'शालेय बूस्टर (टीडी)',
    offsetDays: 1826,
    ageText: '5–6 Years',
    marathiAgeText: '५–६ वर्षे',
    isMandatory: true,
  },
];

// 3. VACCINATION TIMELINE GENERATOR
export function generateVaccinationSchedule(
  childId: string,
  dateOfBirthIso: string,
  includeOptionalIap: boolean = true
): ChildVaccination[] {
  const birthDate = parseISO(dateOfBirthIso);
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  const filteredRules = SCHEDULE_RULES.filter(
    (rule) => rule.isMandatory || includeOptionalIap
  );

  return filteredRules.map((rule, idx) => {
    const calculatedDate = addDays(birthDate, rule.offsetDays);
    const dueDateStr = format(calculatedDate, 'yyyy-MM-dd');

    let initialStatus: VaccinationStatus = 'scheduled';
    if (dueDateStr === todayStr) {
      initialStatus = 'due_today';
    } else if (dueDateStr < todayStr) {
      initialStatus = 'overdue';
    }

    return {
      id: `vax_${childId}_${rule.vaccineId}_${rule.doseNumber}`,
      childId,
      vaccineId: rule.vaccineId,
      doseNumber: rule.doseNumber,
      dueDate: dueDateStr,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

// 4. THREE-STAGE REMINDER ENGINE GENERATOR
// Stages:
// Stage 1: 7 days before
// Stage 2: 3 days before
// Stage 3: Day of vaccination (0 days)
export function generateThreeStageReminders(
  userId: string,
  child: { id: string; name: string },
  vaccination: ChildVaccination,
  todayIsoString?: string
): ScheduledReminder[] {
  // If dose is already completed, no reminders should ever be pending
  if (vaccination.status === 'completed') {
    return [];
  }

  const vaccineDef = VACCINE_DEFINITIONS[vaccination.vaccineId];
  const vaccineNameEn = vaccineDef?.name || vaccination.vaccineId.toUpperCase();
  const vaccineNameMr = vaccineDef?.marathiName || vaccineDef?.name || vaccination.vaccineId.toUpperCase();

  const dueDate = parseISO(vaccination.dueDate);
  const todayStr = todayIsoString || format(new Date(), 'yyyy-MM-dd');

  const stagesConfig: Array<{ stage: ReminderStage; daysOffset: number }> = [
    { stage: 'seven_day', daysOffset: -7 },
    { stage: 'three_day', daysOffset: -3 },
    { stage: 'same_day', daysOffset: 0 },
  ];

  const reminders: ScheduledReminder[] = [];

  for (const item of stagesConfig) {
    const triggerDateObj = addDays(dueDate, item.daysOffset);
    const triggerDateStr = format(triggerDateObj, 'yyyy-MM-dd');

    // Rule: Deterministic unique idempotency key
    const idempotencyKey = `rem_${child.id}_${vaccination.vaccineId}_${vaccination.doseNumber}_${item.stage}_${vaccination.dueDate}`;

    // Rule: If triggerDate has already passed when schedule is created, do not spam; mark as 'skipped_past'
    const isPast = triggerDateStr < todayStr;
    const status = isPast ? 'skipped_past' : 'pending';

    // Titles & Messages per official requirements
    let titleEn = '';
    let messageEn = '';
    let titleMr = '';
    let messageMr = '';

    if (item.stage === 'seven_day') {
      titleEn = 'Vaccination coming up next week';
      messageEn = `${child.name}'s ${vaccineNameEn} vaccination is scheduled for ${vaccination.dueDate}, seven days from now. Please plan your visit.`;
      titleMr = 'पुढील आठवड्यात लसीकरण येत आहे';
      messageMr = `${child.name} चे ${vaccineNameMr} लसीकरण ${vaccination.dueDate} रोजी (७ दिवसांनी) नियोजित आहे. कृपया आपल्या भेटीचे नियोजन करा.`;
    } else if (item.stage === 'three_day') {
      titleEn = 'Vaccination due in 3 days';
      messageEn = `${child.name}'s ${vaccineNameEn} vaccination is due on ${vaccination.dueDate}. Please review your plans and contact your healthcare provider if needed.`;
      titleMr = '३ दिवसांत लसीकरण देय आहे';
      messageMr = `${child.name} चे ${vaccineNameMr} लसीकरण ${vaccination.dueDate} रोजी देय आहे. कृपया आपल्या योजना तपासा आणि आवश्यक असल्यास डॉक्टरांशी संपर्क साधा.`;
    } else {
      titleEn = 'Vaccination due today';
      messageEn = `${child.name}'s ${vaccineNameEn} vaccination is scheduled for today. Please confirm the appointment or consult your healthcare provider if the schedule needs review.`;
      titleMr = 'आज लसीकरण देय आहे';
      messageMr = `${child.name} चे ${vaccineNameMr} लसीकरण आज नियोजित आहे. कृपया भेटीची खात्री करा किंवा वेळापत्रकाची तपासणी आवश्यक असल्यास डॉक्टरांशी संपर्क साधा.`;
    }

    reminders.push({
      id: idempotencyKey,
      userId,
      childId: child.id,
      vaccinationId: vaccination.id,
      stage: item.stage,
      triggerDate: triggerDateStr,
      idempotencyKey,
      status,
      titleEn,
      titleMr,
      messageEn,
      messageMr,
      deliveryChannel: 'in_app',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return reminders;
}

// 5. HELPER: Calculate Child Age in Months and Days
export function calculateChildAge(
  dateOfBirthIso: string,
  lang: 'en' | 'mr' = 'en'
): { years: number; months: number; days: number; formatted: string } {
  try {
    const birth = parseISO(dateOfBirthIso);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      // get previous month days
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) {
      return {
        years: 0,
        months: 0,
        days: 0,
        formatted: lang === 'mr' ? 'नुकतेच जन्मलेले' : 'Newborn',
      };
    }

    let formatted = '';
    if (lang === 'mr') {
      if (years > 0) {
        formatted = `${years} वर्षे ${months} महिने`;
      } else if (months > 0) {
        formatted = `${months} महिने ${days} दिवस`;
      } else {
        formatted = `${days} दिवस`;
      }
    } else {
      if (years > 0) {
        formatted = `${years}y ${months}m`;
      } else if (months > 0) {
        formatted = `${months}m ${days}d`;
      } else {
        formatted = `${days} days`;
      }
    }

    return { years, months, days, formatted };
  } catch {
    return {
      years: 0,
      months: 0,
      days: 0,
      formatted: lang === 'mr' ? 'अवैध तारीख' : 'Invalid date',
    };
  }
}

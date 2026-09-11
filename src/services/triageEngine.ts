import type { SocratesData, AyushDashavidhaData, RedFlagAlert } from '../types';

export interface TriageInput {
  complaintText: string;
  socrates?: Partial<SocratesData>;
  ayush?: Partial<AyushDashavidhaData>;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    pulseRate?: number;
    spo2?: number;
    tempF?: number;
  };
  painScore?: number;
}

export function evaluateRedFlags(input: TriageInput): RedFlagAlert {
  const text = (input.complaintText || '').toLowerCase();
  const socrates = input.socrates || {};
  const char = (socrates.character || '').toLowerCase();
  const rad = (socrates.radiation || '').toLowerCase();
  const assoc = (socrates.associations || []).map((a) => a.toLowerCase());
  const site = (socrates.site || '').toLowerCase();
  const vitals = input.vitals || {};
  const pain = input.painScore ?? socrates.severity ?? 0;

  const triggeredRules: string[] = [];
  let isCritical = false;
  let isWarning = false;

  // 1. Acute Coronary Syndrome (ACS / MI)
  const hasChestPain =
    site.includes('chest') ||
    text.includes('chest pain') ||
    text.includes('seene me dard') ||
    text.includes('chhati me dard') ||
    text.includes('marbu vali') ||
    text.includes('hruday');
  const hasCrushingPain = char.includes('crush') || char.includes('heavy') || char.includes('constrict') || text.includes('dabav') || text.includes('heavy');
  const hasArmJawRadiation =
    rad.includes('left arm') ||
    rad.includes('jaw') ||
    rad.includes('shoulder') ||
    text.includes('left hand') ||
    text.includes('baaye haath');
  const hasSweatingDyspnea =
    assoc.some((a) => a.includes('sweat') || a.includes('breath') || a.includes('dyspnea')) ||
    text.includes('pasina') ||
    text.includes('saans foolna') ||
    text.includes('breathless');

  if (hasChestPain && (hasCrushingPain || hasArmJawRadiation || hasSweatingDyspnea)) {
    isCritical = true;
    triggeredRules.push(
      'ACS Rule #1: Potential Acute Myocardial Infarction (Crushing/radiating chest discomfort with autonomic symptoms)'
    );
  }

  // 2. Stroke / TIA Signs (FAST)
  const strokeTerms = [
    'face drooping',
    'arm weakness',
    'slurred speech',
    'one side paralysis',
    'lakwa',
    'bolne me dikkat',
    'ek taraf kamzori',
    'stroke',
    'unilateral weakness',
  ];
  if (strokeTerms.some((term) => text.includes(term))) {
    isCritical = true;
    triggeredRules.push('Stroke Rule #2: Acute Neurological Deficit (Sudden hemiparesis / speech impairment)');
  }

  // 3. Respiratory Distress / Hypoxemia
  if ((vitals.spo2 && vitals.spo2 < 90) || text.includes('suffocation') || text.includes('cannot breathe') || text.includes('saans nahi aa rahi')) {
    isCritical = true;
    triggeredRules.push('Hypoxia Rule #3: Severe Respiratory Compromise (SpO2 < 90% or acute asphyxiation sensation)');
  } else if (vitals.spo2 && vitals.spo2 < 94) {
    isWarning = true;
    triggeredRules.push('Hypoxia Warning: Mild-to-Moderate Desaturation (SpO2 90-93%)');
  }

  // 4. Massive Bleeding / Hemoptysis / Hematemesis
  const bleedingTerms = [
    'coughing blood',
    'khoon ki ulti',
    'vomiting blood',
    'black tarry stool',
    'kala latrine',
    'rectal bleeding',
    'hemoptysis',
  ];
  if (bleedingTerms.some((term) => text.includes(term))) {
    isCritical = true;
    triggeredRules.push('Hemorrhage Rule #4: Active Gastrointestinal Bleed or Massive Hemoptysis');
  }

  // 5. Hypertensive Crisis or Severe Hypotension
  if (vitals.bpSystolic && vitals.bpSystolic >= 180) {
    isCritical = true;
    triggeredRules.push(`Hemodynamic Rule #5A: Hypertensive Crisis (Systolic BP ${vitals.bpSystolic} mmHg >= 180)`);
  } else if (vitals.bpSystolic && vitals.bpSystolic < 90) {
    isCritical = true;
    triggeredRules.push(`Hemodynamic Rule #5B: Shock / Hypotension (Systolic BP ${vitals.bpSystolic} mmHg < 90)`);
  }

  // 6. Severe Acute Pain (Score >= 9)
  if (pain >= 9 && site.includes('abdomen')) {
    isWarning = true;
    triggeredRules.push('Acute Abdomen Rule #6: Severe peritonitic abdominal pain (VAS >= 9)');
  }

  // 7. AYUSH Sannipataja / Acute Agni Failure Indicators
  if (input.ayush?.ashtavidha?.nadi?.toLowerCase().includes('sarpa') && text.includes('ghabrahat')) {
    isWarning = true;
    triggeredRules.push('AYUSH Rule #7: Sannipataja Dosha Prakopa with Vega-Arodha');
  }

  const tokenPrefix = isCritical ? 'EMERG-P1-' : isWarning ? 'URG-P2-' : 'OPD-P3-';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  if (isCritical) {
    return {
      isTriggered: true,
      level: 'CRITICAL',
      triagePriority: 'P1_EMERGENCY',
      triggeredRules,
      immediateAction:
        '🚨 IMMEDIATE ACTION: Escort patient to Emergency Resuscitation Room / Triage Desk 1. Alert On-Duty Casualty Medical Officer (CMO) and initiate 12-lead ECG & IV Access.',
      emergencyTokenCode: `${tokenPrefix}${randomSuffix}`,
      timestamp: new Date().toISOString(),
      acknowledgedByDoctor: false,
    };
  }

  if (isWarning) {
    return {
      isTriggered: true,
      level: 'WARNING',
      triagePriority: 'P2_URGENT',
      triggeredRules,
      immediateAction:
        '⚠️ PRIORITY ACTION: Priority OPD Triage Queue. Patient requires evaluation within 15 minutes by Senior Resident / Specialist.',
      emergencyTokenCode: `${tokenPrefix}${randomSuffix}`,
      timestamp: new Date().toISOString(),
      acknowledgedByDoctor: false,
    };
  }

  return {
    isTriggered: false,
    level: 'NORMAL',
    triagePriority: 'P3_ROUTINE',
    triggeredRules: [],
    immediateAction: 'Routine OPD consultation token allocated. Please wait for your turn in OPD Waiting Lounge.',
    emergencyTokenCode: `${tokenPrefix}${randomSuffix}`,
    timestamp: new Date().toISOString(),
    acknowledgedByDoctor: true,
  };
}

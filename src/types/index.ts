export type ClinicalMode = 'ALLOPATHIC' | 'AYUSH';

export type LanguageCode =
  | 'hi'
  | 'en'
  | 'mr'
  | 'ta'
  | 'te'
  | 'bn'
  | 'kn'
  | 'gu'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur';

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  voiceLangCode: string;
  flag: string;
}

export interface AbhaProfile {
  abhaNumber: string;
  abhaAddress: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  dob: string;
  mobile: string;
  pinCode: string;
  state: string;
  district: string;
  photoUrl: string;
  authMethod: 'QR_SCAN' | 'MOBILE_OTP' | 'BIOMETRIC' | 'DEMOGRAPHIC';
  verified: boolean;
  m1Token?: string;
  queueToken: string;
  queueNumber: number;
  registeredAt: string;
}

export interface SocratesData {
  site: string; // Anatomical area (Chest, Upper Abdomen, Head, Knee, etc.)
  onset: string; // e.g., "Sudden onset 2 hours ago", "Gradual over 3 weeks"
  character: string; // "Sharp / Stabbing", "Crushing / Constricting", "Dull Ache", "Throbbing", "Burning"
  radiation: string; // "Radiates to left arm and jaw", "Radiates to back", "Localized / None"
  associations: string[]; // ["Profuse Sweating", "Dyspnea / Breathlessness", "Nausea", "Dizziness"]
  timeCourse: string; // "Progressively worsening", "Intermittent episodes", "Constant"
  exacerbatingRelieving: string; // "Aggravated by exertion, relieved by rest"
  severity: number; // 1 to 10
  severityDescription: string;
  reviewOfSystems: {
    cardiovascular?: string;
    respiratory?: string;
    gastrointestinal?: string;
    neurological?: string;
    musculoskeletal?: string;
  };
}

export interface AyushDashavidhaData {
  prakriti: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshaja';
  vikriti: string; // Current aggravated dosha state (e.g., Pitta-Vata Vriddhi)
  sara: string; // Tissue quality (Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra, Sattva)
  samhanana: 'Compact / Su-samhanana' | 'Medium / Madhyama' | 'Loose / Hina';
  pramana: string; // Anthropometric proportion
  satmya: string; // Dietary adaptability (Shadrasa, Sarva-satmya, etc.)
  sattva: 'Pravara (High Mental Stamina)' | 'Madhyama (Moderate)' | 'Avara (Low)';
  aharaShakti: {
    abhyavaharana: 'High' | 'Moderate' | 'Low'; // Ingestion
    jaranaShakti: 'Teekshnagni' | 'Mandagni' | 'Vishamagni' | 'Samagni'; // Digestion
  };
  vyayamaShakti: 'High' | 'Moderate' | 'Low';
  vaya: 'Bala (Childhood)' | 'Madhyama (Adult)' | 'Vriddha (Geriatric)';
  ashtavidha: {
    nadi: string; // Pulse (e.g., Sarpa-gati / Manduka-gati / Hamsa-gati)
    mutra: string; // Urine appearance & frequency
    mala: string; // Stool consistency & bowel habit
    jihva: string; // Tongue (Sama - coated / Nirama - clear)
    shabda: string; // Voice tone & clarity
    sparsha: string; // Skin temperature & texture (Sheeta, Ushna, Ruksha, Snigdha)
    druk: string; // Eyes & conjunctiva
    akruti: string; // Facies & stature
  };
  aharaVihara: {
    dietHabits: string;
    sleepPattern: string; // Nidra quality (Sukh-nidra / Alpa-nidra / Anidra)
    dailyRoutine: string; // Dinacharya / Agni disturbances
  };
}

export interface RedFlagAlert {
  isTriggered: boolean;
  level: 'CRITICAL' | 'WARNING' | 'NORMAL';
  triagePriority: 'P1_EMERGENCY' | 'P2_URGENT' | 'P3_ROUTINE';
  triggeredRules: string[];
  immediateAction: string;
  emergencyTokenCode?: string;
  timestamp: string;
  acknowledgedByDoctor: boolean;
}

export interface ExtractedMedication {
  id: string;
  medicineName: string;
  genericName: string;
  dosage: string;
  form: 'Tablet' | 'Syrup' | 'Injection' | 'Capsule' | 'Inhaler' | 'Ointment' | 'Drops';
  frequency: 'OD (Once daily)' | 'BD (Twice daily)' | 'TDS (Thrice daily)' | 'QID (4 times)' | 'SOS (As needed)' | 'HS (Bedtime)';
  duration: string;
  snomedCode: string;
  rxNormCode: string;
  instructions: string;
  isConfirmed: boolean;
}

export interface ExtractedLabResult {
  id: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Lipid' | 'Renal' | 'Liver' | 'Thyroid' | 'Cardiac';
  loincCode: string;
  resultValue: number | string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  severity: 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'NORMAL';
  testDate: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'OPD_VISIT' | 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'IMMUNIZATION';
  title: string;
  facility: string;
  doctorName?: string;
  summary: string;
  tags: string[];
  keyFindings: string[];
}

export interface DocumentScanResult {
  id: string;
  fileName: string;
  fileType: 'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY' | 'HANDWRITTEN_NOTE';
  deskewedImageUrl: string;
  thumbnailUrl: string;
  extractedDate: string;
  facilityName: string;
  ocrConfidence: number;
  extractedMeds: ExtractedMedication[];
  extractedLabs: ExtractedLabResult[];
  rawOcrSnippets: string[];
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface SoapNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    socratesSummary?: SocratesData;
    ayushSummary?: AyushDashavidhaData;
    pastMedicalHistory: string[];
    medicationHistory: string[];
    allergies: string[];
    familyHistory: string;
    socialHabits: string;
  };
  objective: {
    vitals: {
      bpSystolic: number;
      bpDiastolic: number;
      pulseRate: number;
      spo2: number;
      tempF: number;
      respiratoryRate: number;
      painScore: number;
      bmi?: number;
    };
    physicalExamFindings: string[];
    extractedLabHighlights: ExtractedLabResult[];
    digitizedPastRx: ExtractedMedication[];
  };
  assessment: {
    provisionalDiagnoses: Array<{
      condition: string;
      icd10: string;
      snomedCt: string;
      confidence: number;
      rationale: string;
    }>;
    ayushDiagnosis?: {
      vyadhi: string;
      doshaDushya: string;
      samprapti: string;
    };
    redFlagsIdentified: string[];
    clinicalRiskRating: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  plan: {
    proposedInvestigations: string[];
    medicationRecommendations: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
      category: 'Allopathic' | 'AYUSH' | 'Supportive';
    }>;
    lifestyleAndDietAdvice: string[];
    triageDisposition: string;
    followUpInDays: number;
  };
  metadata: {
    generatedAt: string;
    modelVersion: string;
    mode: ClinicalMode;
    safetyLock: string;
    status: 'AI_DRAFT' | 'VERIFIED' | 'COMMITTED_TO_EMR';
    verifiedByDoctor?: string;
    committedTimestamp?: string;
    doctorNotes?: string;
  };
}

export interface PatientEncounter {
  id: string;
  patient: AbhaProfile;
  mode: ClinicalMode;
  language: LanguageCode;
  redFlag: RedFlagAlert;
  socrates?: SocratesData;
  ayush?: AyushDashavidhaData;
  scannedDocuments: DocumentScanResult[];
  soapNote: SoapNote;
  fhirBundle: any;
  status: 'WAITING' | 'IN_CONSULTATION' | 'EMERGENCY_ESCALATED' | 'COMPLETED';
  createdAt: string;
  kioskId: string;
}

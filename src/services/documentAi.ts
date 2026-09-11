import type { DocumentScanResult, ExtractedMedication, ExtractedLabResult, TimelineEvent } from '../types';

export const SAMPLE_DOCUMENTS: Array<{
  id: string;
  name: string;
  type: 'PRESCRIPTION' | 'LAB_REPORT';
  facility: string;
  doctor: string;
  date: string;
  previewUrl: string;
  meds: ExtractedMedication[];
  labs: ExtractedLabResult[];
  rawText: string[];
}> = [
  {
    id: 'doc-rx-cardio-01',
    name: 'Apollo Spectra - Cardiology Follow-up Rx',
    type: 'PRESCRIPTION',
    facility: 'Apollo Spectra Hospital, New Delhi',
    doctor: 'Dr. Alok Verma, MD, DM (Cardiology)',
    date: '2026-08-14',
    previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    meds: [
      {
        id: 'rx-1',
        medicineName: 'Ecosprin 75mg',
        genericName: 'Aspirin (Enteric Coated)',
        dosage: '75 mg',
        form: 'Tablet',
        frequency: 'OD (Once daily)',
        duration: '90 days',
        snomedCode: '387458008',
        rxNormCode: '1191',
        instructions: 'Take after lunch with water',
        isConfirmed: true,
      },
      {
        id: 'rx-2',
        medicineName: 'Atorva 20mg',
        genericName: 'Atorvastatin Calcium',
        dosage: '20 mg',
        form: 'Tablet',
        frequency: 'HS (Bedtime)',
        duration: '90 days',
        snomedCode: '387584000',
        rxNormCode: '83367',
        instructions: 'Take at bedtime daily',
        isConfirmed: true,
      },
      {
        id: 'rx-3',
        medicineName: 'Metolar XR 50mg',
        genericName: 'Metoprolol Succinate Extended Release',
        dosage: '50 mg',
        form: 'Tablet',
        frequency: 'OD (Once daily)',
        duration: '90 days',
        snomedCode: '372826007',
        rxNormCode: '866416',
        instructions: 'Take early morning before breakfast',
        isConfirmed: true,
      },
      {
        id: 'rx-4',
        medicineName: 'Sorbitrate 5mg (Sublingual)',
        genericName: 'Isosorbide Dinitrate',
        dosage: '5 mg',
        form: 'Tablet',
        frequency: 'SOS (As needed)',
        duration: '30 days',
        snomedCode: '387343004',
        rxNormCode: '6054',
        instructions: 'Place under tongue if chest pain occurs',
        isConfirmed: true,
      },
    ],
    labs: [],
    rawText: [
      'Apollo Spectra Clinics - Reg: ND/2026/8941',
      'Pt: Ramesh Kumar (54/M) | BP: 142/92 | HR: 84 bpm',
      'Rx: 1. Tab Ecosprin 75mg 1-0-0 (PC) x 90d',
      '    2. Tab Atorva 20mg 0-0-1 (HS) x 90d',
      '    3. Tab Metolar XR 50mg 1-0-0 (Morning) x 90d',
      '    4. Tab Sorbitrate 5mg S.L. SOS for angina',
      'Review after 3 months with Lipid profile & Serum Creatinine',
    ],
  },
  {
    id: 'doc-lab-metabolic-02',
    name: 'Dr. Lal PathLabs - Comprehensive Metabolic Panel',
    type: 'LAB_REPORT',
    facility: 'Dr. Lal PathLabs Central Lab, Lucknow',
    doctor: 'Dr. R. K. Singhania, MD (Biochem)',
    date: '2026-08-28',
    previewUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    meds: [],
    labs: [
      {
        id: 'lab-1',
        testName: 'Fasting Blood Glucose (FBG)',
        category: 'Biochemistry',
        loincCode: '1558-6',
        resultValue: 194,
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        isAbnormal: true,
        severity: 'HIGH',
        testDate: '2026-08-28',
      },
      {
        id: 'lab-2',
        testName: 'Glycated Hemoglobin (HbA1c)',
        category: 'Biochemistry',
        loincCode: '4548-4',
        resultValue: 9.4,
        unit: '%',
        referenceRange: '4.0 - 5.6',
        isAbnormal: true,
        severity: 'CRITICAL_HIGH',
        testDate: '2026-08-28',
      },
      {
        id: 'lab-3',
        testName: 'Serum Creatinine',
        category: 'Renal',
        loincCode: '2160-0',
        resultValue: 1.8,
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.2',
        isAbnormal: true,
        severity: 'HIGH',
        testDate: '2026-08-28',
      },
      {
        id: 'lab-4',
        testName: 'Total Cholesterol',
        category: 'Lipid',
        loincCode: '2093-3',
        resultValue: 242,
        unit: 'mg/dL',
        referenceRange: '< 200',
        isAbnormal: true,
        severity: 'HIGH',
        testDate: '2026-08-28',
      },
      {
        id: 'lab-5',
        testName: 'Triglycerides',
        category: 'Lipid',
        loincCode: '2571-8',
        resultValue: 290,
        unit: 'mg/dL',
        referenceRange: '< 150',
        isAbnormal: true,
        severity: 'HIGH',
        testDate: '2026-08-28',
      },
      {
        id: 'lab-6',
        testName: 'Estimated GFR (eGFR)',
        category: 'Renal',
        loincCode: '33914-3',
        resultValue: 48,
        unit: 'mL/min/1.73m2',
        referenceRange: '> 90',
        isAbnormal: true,
        severity: 'HIGH',
        testDate: '2026-08-28',
      },
    ],
    rawText: [
      'DR LAL PATHLABS - ACCREDITED NABL & CAP',
      'Patient: Sunita Devi | Age: 51 | Gender: Female',
      'Test: Fasting Plasma Glucose -> 194.0 mg/dL [H] (Ref: 70-99)',
      'Test: HbA1c (HPLC) -> 9.4% [H] (Ref: Normal < 5.7%)',
      'Test: Serum Creatinine -> 1.80 mg/dL [H] (Ref: 0.70-1.20)',
      'Test: Total Serum Cholesterol -> 242 mg/dL [H] (Ref: <200)',
      'Impression: Poorly controlled Type 2 Diabetes with stage 3 CKD markers',
    ],
  },
  {
    id: 'doc-ayush-03',
    name: 'All India Institute of Ayurveda - Panchakarma OPD Card',
    type: 'PRESCRIPTION',
    facility: 'All India Institute of Ayurveda (AIIA), New Delhi',
    doctor: 'Vaidya Anand Joshi, BAMS, MD (Ayurveda)',
    date: '2026-07-20',
    previewUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    meds: [
      {
        id: 'ay-1',
        medicineName: 'Ashwagandhadi Lehyam',
        genericName: 'Withania somnifera compound',
        dosage: '10 g',
        form: 'Ointment',
        frequency: 'BD (Twice daily)',
        duration: '30 days',
        snomedCode: 'AY-ASH-100',
        rxNormCode: 'AYUSH-101',
        instructions: 'Take with warm cow milk after meals (Rasayana)',
        isConfirmed: true,
      },
      {
        id: 'ay-2',
        medicineName: 'Triphala Guggulu',
        genericName: 'Haritaki, Bibhitaki, Amalaki & Commiphora mukul',
        dosage: '2 tablets (500mg each)',
        form: 'Tablet',
        frequency: 'BD (Twice daily)',
        duration: '45 days',
        snomedCode: 'AY-TRIPH-200',
        rxNormCode: 'AYUSH-102',
        instructions: 'Take with warm water before food for Amapachana',
        isConfirmed: true,
      },
      {
        id: 'ay-3',
        medicineName: 'Dashamoola Kwatha',
        genericName: 'Decoction of 10 therapeutic roots',
        dosage: '20 ml',
        form: 'Syrup',
        frequency: 'BD (Twice daily)',
        duration: '30 days',
        snomedCode: 'AY-DASH-300',
        rxNormCode: 'AYUSH-103',
        instructions: 'Dilute with 40ml boiled lukewarm water in morning & evening',
        isConfirmed: true,
      },
    ],
    labs: [],
    rawText: [
      'AIIA OPD - Kaya Chikitsa & Panchakarma Department',
      'Prakriti: Vata-Pitta | Agni: Mandagni | Koshta: Krura',
      'Rx: 1. Ashwagandhadi Lehyam 10g BD with Ksheera',
      '    2. Triphala Guggulu 2 tab BD with Ushnodaka',
      '    3. Dashamoola Kwatha 20ml BD with sama bhaga jala',
      'Pathya: Laghu, Supachya Ahara, Avoid Sheeta-Ruksha Ahara & Ratri Jagarana',
    ],
  },
];

export function parseDocumentScan(docPresetId?: string): DocumentScanResult {
  const sample = SAMPLE_DOCUMENTS.find((d) => d.id === docPresetId) || SAMPLE_DOCUMENTS[0];
  return {
    id: `scan-${Date.now()}`,
    fileName: sample.name,
    fileType: sample.type,
    deskewedImageUrl: sample.previewUrl,
    thumbnailUrl: sample.previewUrl,
    extractedDate: sample.date,
    facilityName: sample.facility,
    ocrConfidence: 96.8,
    extractedMeds: sample.meds,
    extractedLabs: sample.labs,
    rawOcrSnippets: sample.rawText,
    status: 'COMPLETED',
  };
}

export function assembleChronologicalTimeline(
  documents: DocumentScanResult[],
  additionalEvents: TimelineEvent[] = []
): TimelineEvent[] {
  const docEvents: TimelineEvent[] = documents.map((doc) => ({
    id: `event-${doc.id}`,
    date: doc.extractedDate,
    type: doc.fileType === 'PRESCRIPTION' ? 'PRESCRIPTION' : 'LAB_REPORT',
    title: doc.fileName,
    facility: doc.facilityName,
    summary:
      doc.fileType === 'PRESCRIPTION'
        ? `Prescribed ${doc.extractedMeds.length} active medications (${doc.extractedMeds.map((m) => m.medicineName).join(', ')})`
        : `Lab panel processed with ${doc.extractedLabs.length} markers (${doc.extractedLabs.filter((l) => l.isAbnormal).length} abnormal findings)`,
    tags:
      doc.fileType === 'PRESCRIPTION'
        ? ['Rx Extracted', 'TrOCR v2', 'RxNorm Tagged']
        : ['LOINC Matched', 'Abnormal Highlights', 'LayoutLMv3'],
    keyFindings:
      doc.fileType === 'PRESCRIPTION'
        ? doc.extractedMeds.map((m) => `${m.medicineName} (${m.dosage}) - ${m.frequency}`)
        : doc.extractedLabs.map((l) => `${l.testName}: ${l.resultValue} ${l.unit} [${l.severity}]`),
  }));

  const combined = [...additionalEvents, ...docEvents];
  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

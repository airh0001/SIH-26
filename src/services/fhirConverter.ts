import type { PatientEncounter } from '../types';

export function generateFhirR4Bundle(encounter: PatientEncounter): Record<string, any> {
  const patient = encounter.patient;
  const soap = encounter.soapNote;
  const bundleId = `bundle-${encounter.id}`;
  const now = new Date().toISOString();

  const fhirPatient = {
    fullUrl: `urn:uuid:patient-${patient.abhaNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
    resource: {
      resourceType: 'Patient',
      id: `patient-${patient.abhaNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
      },
      identifier: [
        {
          type: {
            coding: [
              {
                system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code',
                code: 'ABHA',
                display: 'Ayushman Bharat Health Account Number',
              },
            ],
          },
          system: 'https://healthid.abdm.gov.in',
          value: patient.abhaNumber,
        },
        {
          type: {
            coding: [
              {
                system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code',
                code: 'ABHA_ADDRESS',
                display: 'ABHA Address (PHR)',
              },
            ],
          },
          system: 'https://abdm.gov.in/phr',
          value: patient.abhaAddress,
        },
      ],
      name: [
        {
          text: patient.name,
          family: patient.name.split(' ').slice(-1)[0] || '',
          given: patient.name.split(' ').slice(0, -1),
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: patient.mobile,
        },
      ],
      gender: patient.gender.toLowerCase(),
      birthDate: patient.dob || '1985-05-12',
      address: [
        {
          state: patient.state,
          district: patient.district,
          postalCode: patient.pinCode,
          country: 'IND',
        },
      ],
    },
  };

  const fhirEncounter = {
    fullUrl: `urn:uuid:encounter-${encounter.id}`,
    resource: {
      resourceType: 'Encounter',
      id: `encounter-${encounter.id}`,
      status: encounter.status === 'COMPLETED' ? 'finished' : 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'Ambulatory / OPD Triage',
      },
      subject: {
        reference: fhirPatient.fullUrl,
        display: patient.name,
      },
      priority: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority',
            code: encounter.redFlag.triagePriority === 'P1_EMERGENCY' ? 'EM' : encounter.redFlag.triagePriority === 'P2_URGENT' ? 'UR' : 'R',
            display: encounter.redFlag.triagePriority,
          },
        ],
      },
      period: {
        start: encounter.createdAt,
      },
      serviceProvider: {
        display: 'AIIMS / District Hospital OPD Kiosk Terminal #04',
      },
    },
  };

  const conditions = (soap.assessment.provisionalDiagnoses || []).map((diag, idx) => ({
    fullUrl: `urn:uuid:condition-${encounter.id}-${idx}`,
    resource: {
      resourceType: 'Condition',
      id: `condition-${encounter.id}-${idx}`,
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'provisional',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: diag.icd10,
            display: diag.condition,
          },
          {
            system: 'http://snomed.info/sct',
            code: diag.snomedCt,
            display: diag.condition,
          },
        ],
        text: diag.condition,
      },
      subject: {
        reference: fhirPatient.fullUrl,
      },
      recordedDate: now,
    },
  }));

  const observations = [
    {
      fullUrl: `urn:uuid:obs-bp-${encounter.id}`,
      resource: {
        resourceType: 'Observation',
        id: `obs-bp-${encounter.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure panel with all children optional',
            },
          ],
          text: 'Blood Pressure',
        },
        subject: { reference: fhirPatient.fullUrl },
        component: [
          {
            code: {
              coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }],
            },
            valueQuantity: {
              value: soap.objective.vitals.bpSystolic,
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]',
            },
          },
          {
            code: {
              coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }],
            },
            valueQuantity: {
              value: soap.objective.vitals.bpDiastolic,
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]',
            },
          },
        ],
      },
    },
    {
      fullUrl: `urn:uuid:obs-spo2-${encounter.id}`,
      resource: {
        resourceType: 'Observation',
        id: `obs-spo2-${encounter.id}`,
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood by Pulse oximetry' }],
          text: 'Oxygen Saturation SpO2',
        },
        subject: { reference: fhirPatient.fullUrl },
        valueQuantity: {
          value: soap.objective.vitals.spo2,
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%',
        },
      },
    },
    {
      fullUrl: `urn:uuid:obs-pulse-${encounter.id}`,
      resource: {
        resourceType: 'Observation',
        id: `obs-pulse-${encounter.id}`,
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
          text: 'Pulse Rate',
        },
        subject: { reference: fhirPatient.fullUrl },
        valueQuantity: {
          value: soap.objective.vitals.pulseRate,
          unit: 'beats/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min',
        },
      },
    },
    {
      fullUrl: `urn:uuid:obs-pain-${encounter.id}`,
      resource: {
        resourceType: 'Observation',
        id: `obs-pain-${encounter.id}`,
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '72514-3', display: 'Pain severity - 0-10 verbal numeric rating [Score] - Reported' }],
          text: 'VAS / Wong-Baker Pain Score',
        },
        subject: { reference: fhirPatient.fullUrl },
        valueInteger: soap.objective.vitals.painScore,
      },
    },
  ];

  const medicationStatements = (soap.objective.digitizedPastRx || []).map((med, idx) => ({
    fullUrl: `urn:uuid:medstatement-${encounter.id}-${idx}`,
    resource: {
      resourceType: 'MedicationStatement',
      id: `medstatement-${encounter.id}-${idx}`,
      status: 'active',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: med.rxNormCode || 'UNKNOWN',
            display: med.medicineName,
          },
          {
            system: 'http://snomed.info/sct',
            code: med.snomedCode || 'UNKNOWN',
            display: med.medicineName,
          },
        ],
        text: `${med.medicineName} (${med.dosage}) - ${med.frequency}`,
      },
      subject: { reference: fhirPatient.fullUrl },
      dosage: [
        {
          text: `${med.dosage} ${med.frequency} for ${med.duration}`,
          patientInstruction: med.instructions,
        },
      ],
    },
  }));

  const composition = {
    fullUrl: `urn:uuid:composition-${encounter.id}`,
    resource: {
      resourceType: 'Composition',
      id: `composition-${encounter.id}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord'],
      },
      status: 'final',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '11488-4',
            display: 'Consultation note',
          },
        ],
        text: 'ABHA PRO AI-Assisted Multimodal OPD Intake Summary',
      },
      title: 'OPD Clinical Intake & Triage Record',
      date: now,
      subject: {
        reference: fhirPatient.fullUrl,
        display: patient.name,
      },
      encounter: {
        reference: fhirEncounter.fullUrl,
      },
      author: [
        {
          display: 'ABHA PRO Edge Dialogue & Document AI Engine v2.4 (HIP-Compliant)',
        },
      ],
      section: [
        {
          title: 'Chief Complaints & History of Present Illness (SOCRATES / AYUSH)',
          code: {
            coding: [{ system: 'http://loinc.org', code: '10154-3', display: 'Chief complaint' }],
          },
          text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml"><p><strong>Chief Complaint:</strong> ${soap.subjective.chiefComplaint}</p><p><strong>HPI:</strong> ${soap.subjective.historyOfPresentIllness}</p></div>`,
          },
        },
        {
          title: 'Objective Findings & Vitals',
          code: {
            coding: [{ system: 'http://loinc.org', code: '8716-3', display: 'Vital signs' }],
          },
          entry: observations.map((o) => ({ reference: o.fullUrl })),
        },
        {
          title: 'Provisional Assessment & Differential Diagnoses',
          code: {
            coding: [{ system: 'http://loinc.org', code: '51848-0', display: 'Assessment' }],
          },
          entry: conditions.map((c) => ({ reference: c.fullUrl })),
        },
        {
          title: 'Medication History & Extracted Prescriptions',
          code: {
            coding: [{ system: 'http://loinc.org', code: '10160-0', display: 'History of Medication use' }],
          },
          entry: medicationStatements.map((m) => ({ reference: m.fullUrl })),
        },
      ],
    },
  };

  return {
    resourceType: 'Bundle',
    id: bundleId,
    meta: {
      versionId: '1',
      lastUpdated: now,
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
      security: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'R',
          display: 'Restricted - ABDM Encrypted Health Record',
        },
      ],
    },
    identifier: {
      system: 'https://healthid.abdm.gov.in/bundle',
      value: `ABDM-DOC-${encounter.id}`,
    },
    type: 'document',
    timestamp: now,
    entry: [
      composition,
      fhirPatient,
      fhirEncounter,
      ...conditions,
      ...observations,
      ...medicationStatements,
    ],
  };
}

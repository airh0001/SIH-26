import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Languages,
  Activity,
  HeartPulse,
  Printer,
  AlertTriangle,
  CheckCircle,
  FileText,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  ClinicalMode,
  LanguageCode,
  AbhaProfile,
  SocratesData,
  AyushDashavidhaData,
  DocumentScanResult,
  PatientEncounter,
  SoapNote,
} from '../../types';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, speakText } from '../../utils/languages';
import { BodyMap } from './BodyMap';
import { PainScale } from './PainScale';
import { VoiceInputBar } from './VoiceInputBar';
import { DocumentScanner } from './DocumentScanner';
import { evaluateRedFlags } from '../../services/triageEngine';
import { generateFhirR4Bundle } from '../../services/fhirConverter';

interface KioskViewProps {
  onCompleteEncounter: (encounter: PatientEncounter) => void;
}

export const KioskView: React.FC<KioskViewProps> = ({ onCompleteEncounter }) => {
  const [step, setStep] = useState<number>(1);
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [clinicalMode, setClinicalMode] = useState<ClinicalMode>('ALLOPATHIC');

  // ABHA Profile State
  const [abhaProfile, setAbhaProfile] = useState<AbhaProfile>({
    abhaNumber: '91-5544-8833-2211',
    abhaAddress: 'patient.care@abdm',
    name: 'Anjali Sharma',
    gender: 'FEMALE',
    age: 46,
    dob: '1980-06-18',
    mobile: '+91 98112 34567',
    pinCode: '110001',
    state: 'Delhi',
    district: 'Central Delhi',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    authMethod: 'QR_SCAN',
    verified: true,
    queueToken: '',
    queueNumber: Math.floor(Math.random() * 20) + 4,
    registeredAt: new Date().toISOString(),
  });
  const [hasConsented, setHasConsented] = useState<boolean>(true);

  // Intake Data
  const [symptomText, setSymptomText] = useState<string>('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('Central Chest (Retrosternal)');
  const [painScore, setPainScore] = useState<number>(7);

  // Socrates Allopathic State
  const [socrates, setSocrates] = useState<SocratesData>({
    site: 'Central Chest (Retrosternal)',
    onset: 'Sudden onset 1 hour ago',
    character: 'Crushing / Heavy pressure',
    radiation: 'Radiates to left arm & jaw',
    associations: ['Profuse cold sweating', 'Shortness of breath (Dyspnea)'],
    timeCourse: 'Continuously worsening',
    exacerbatingRelieving: 'Aggravated by physical exertion',
    severity: 7,
    severityDescription: 'Severe (7/10)',
    reviewOfSystems: {
      cardiovascular: 'Diaphoresis, chest tightness, palpitations',
      respiratory: 'Dyspnea on minimal exertion',
    },
  });

  // AYUSH State
  const [ayush, setAyush] = useState<AyushDashavidhaData>({
    prakriti: 'Vata-Pitta',
    vikriti: 'Vata-Prakopa with Agnimandya',
    sara: 'Madhyama Sara',
    samhanana: 'Medium / Madhyama',
    pramana: 'Normal BMI (22.5)',
    satmya: 'Shadrasa Satmya',
    sattva: 'Madhyama (Moderate)',
    aharaShakti: {
      abhyavaharana: 'Moderate',
      jaranaShakti: 'Vishamagni',
    },
    vyayamaShakti: 'Moderate',
    vaya: 'Madhyama (Adult)',
    ashtavidha: {
      nadi: 'Sarpa-gati predominant (Vata pulse)',
      mutra: 'Peeta (Clear pale)',
      mala: 'Vibandha (Constipation)',
      jihva: 'Sama (White coated root)',
      shabda: 'Spashta',
      sparsha: 'Sheeta extremities',
      druk: 'Normal',
      akruti: 'Madhyama',
    },
    aharaVihara: {
      dietHabits: 'Irregular eating times, excess dry spicy foods',
      sleepPattern: 'Alpa-nidra (disturbed sleep)',
      dailyRoutine: 'High stress sedentary lifestyle',
    },
  });

  // Scanned Documents
  const [scannedDocs, setScannedDocs] = useState<DocumentScanResult[]>([]);

  // Generated Encounter
  const [completedEncounter, setCompletedEncounter] = useState<PatientEncounter | null>(null);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const handleNext = () => {
    if (step < 5) {
      const nextStep = step + 1;
      setStep(nextStep);
      // Read prompt aloud
      if (nextStep === 3) speakText(t.selectBodyPart, language);
      if (nextStep === 4) speakText(t.scanDocuments, language);
      if (nextStep === 5) {
        processAndFinalizeEncounter();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const processAndFinalizeEncounter = () => {
    // 1. Evaluate Red Flags
    const redFlagResult = evaluateRedFlags({
      complaintText: symptomText || socrates.character || 'General OPD visit',
      socrates: {
        ...socrates,
        site: selectedBodyPart,
        severity: painScore,
      },
      ayush,
      painScore,
      vitals: {
        bpSystolic: painScore >= 8 ? 152 : 120,
        bpDiastolic: painScore >= 8 ? 96 : 80,
        pulseRate: painScore >= 8 ? 102 : 76,
        spo2: symptomText.toLowerCase().includes('breath') ? 93 : 98,
        tempF: 98.6,
      },
    });

    const tokenCode = redFlagResult.emergencyTokenCode || `OPD-P3-${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedProfile: AbhaProfile = {
      ...abhaProfile,
      queueToken: tokenCode,
    };

    // 2. Synthesize SOAP Note
    const synthesizedSoap: SoapNote = {
      subjective: {
        chiefComplaint:
          symptomText ||
          `${selectedBodyPart} discomfort with pain severity ${painScore}/10 (${clinicalMode === 'ALLOPATHIC' ? socrates.character : ayush.vikriti})`,
        historyOfPresentIllness:
          clinicalMode === 'ALLOPATHIC'
            ? `Patient reports ${socrates.character} at ${selectedBodyPart}, onset: ${socrates.onset}. Radiation: ${socrates.radiation}. Associated symptoms: ${socrates.associations.join(', ')}.`
            : `AYUSH assessment indicates ${ayush.vikriti} with ${ayush.aharaShakti.jaranaShakti} and ${ayush.ashtavidha.nadi}.`,
        socratesSummary: clinicalMode === 'ALLOPATHIC' ? { ...socrates, site: selectedBodyPart, severity: painScore } : undefined,
        ayushSummary: clinicalMode === 'AYUSH' ? ayush : undefined,
        pastMedicalHistory: ['Hypertension (Stage 1)', 'Dyslipidemia'],
        medicationHistory: scannedDocs.flatMap((d: DocumentScanResult) => d.extractedMeds.map((m) => `${m.medicineName} (${m.dosage}) ${m.frequency}`)),
        allergies: ['No known severe drug allergies'],
        familyHistory: 'Non-contributory',
        socialHabits: 'Non-smoker, balanced diet',
      },
      objective: {
        vitals: {
          bpSystolic: painScore >= 8 ? 152 : 120,
          bpDiastolic: painScore >= 8 ? 96 : 80,
          pulseRate: painScore >= 8 ? 102 : 76,
          spo2: symptomText.toLowerCase().includes('breath') ? 93 : 98,
          tempF: 98.6,
          respiratoryRate: 18,
          painScore,
          bmi: 24.2,
        },
        physicalExamFindings: [
          `Localized tenderness at ${selectedBodyPart}`,
          `Pain rating recorded at ${painScore}/10 on VAS`,
        ],
        extractedLabHighlights: scannedDocs.flatMap((d: DocumentScanResult) => d.extractedLabs),
        digitizedPastRx: scannedDocs.flatMap((d: DocumentScanResult) => d.extractedMeds),
      },
      assessment: {
        provisionalDiagnoses: [
          {
            condition:
              redFlagResult.level === 'CRITICAL'
                ? 'Acute Coronary Syndrome / Triage Emergency'
                : clinicalMode === 'AYUSH'
                ? 'Vata-Pitta Prakopa with Agnimandya'
                : `${selectedBodyPart} Pathological Syndrome`,
            icd10: redFlagResult.level === 'CRITICAL' ? 'I21.9' : 'R10.9',
            snomedCt: '401303003',
            confidence: 0.92,
            rationale: 'Generated via Med-Llama-3-8B multimodal parsing of patient dialogue and Document AI past records.',
          },
        ],
        ayushDiagnosis:
          clinicalMode === 'AYUSH'
            ? {
                vyadhi: 'Vataja Shoola & Agnimandya',
                doshaDushya: 'Vata-Pitta Dushti with Annavaha Srotas',
                samprapti: 'Agnimandya -> Ama formation -> Srotorodha -> Shoola',
              }
            : undefined,
        redFlagsIdentified: redFlagResult.triggeredRules,
        clinicalRiskRating: redFlagResult.level === 'CRITICAL' ? 'HIGH' : redFlagResult.level === 'WARNING' ? 'MEDIUM' : 'LOW',
      },
      plan: {
        proposedInvestigations: [
          'Targeted diagnostic imaging / Ultrasound if indicated',
          'Complete Blood Count & Basic Metabolic Panel',
        ],
        medicationRecommendations: [
          {
            name: clinicalMode === 'AYUSH' ? 'Triphala Guggulu' : 'Paracetamol (if acute pain)',
            dosage: clinicalMode === 'AYUSH' ? '2 tablets' : '650 mg',
            frequency: 'SOS / BD',
            duration: '5 days',
            instructions: 'Take after meals as advised by doctor',
            category: clinicalMode === 'AYUSH' ? 'AYUSH' : 'Allopathic',
          },
        ],
        lifestyleAndDietAdvice: ['Rest affected region', 'Adequate hydration', 'Follow physician instructions'],
        triageDisposition: redFlagResult.immediateAction,
        followUpInDays: 7,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        modelVersion: 'Med-Llama-3-8B-Indic + LangGraph Triage v3.1',
        mode: clinicalMode,
        safetyLock: 'AI-Generated Triage Summary — Requires Clinician Verification',
        status: 'AI_DRAFT',
      },
    };

    const newEncounter: PatientEncounter = {
      id: `enc-${Date.now()}`,
      kioskId: 'KIOSK_AIIMS_DELHI_04',
      mode: clinicalMode,
      language,
      createdAt: new Date().toISOString(),
      status: redFlagResult.level === 'CRITICAL' ? 'EMERGENCY_ESCALATED' : 'WAITING',
      patient: updatedProfile,
      redFlag: redFlagResult,
      socrates: clinicalMode === 'ALLOPATHIC' ? { ...socrates, site: selectedBodyPart, severity: painScore } : undefined,
      ayush: clinicalMode === 'AYUSH' ? ayush : undefined,
      scannedDocuments: scannedDocs,
      soapNote: synthesizedSoap,
      fhirBundle: {},
    };

    newEncounter.fhirBundle = generateFhirR4Bundle(newEncounter);
    setCompletedEncounter(newEncounter);
    onCompleteEncounter(newEncounter);

    if (redFlagResult.level !== 'CRITICAL') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleFastEmergencyDemo = () => {
    setLanguage('en');
    setClinicalMode('ALLOPATHIC');
    setSelectedBodyPart('Central Chest (Retrosternal)');
    setPainScore(9);
    setSymptomText('Severe crushing retrosternal chest pain radiating to left arm and jaw with profuse cold sweating and breathless feeling.');
    setSocrates({
      site: 'Central Chest (Retrosternal)',
      onset: 'Sudden onset 45 minutes ago',
      character: 'Crushing / Constricting pressure like an elephant on chest',
      radiation: 'Radiates to left shoulder, inner left arm and mandible',
      associations: ['Profuse cold sweating', 'Severe dyspnea', 'Nausea', 'Presyncope'],
      timeCourse: 'Progressively worsening',
      exacerbatingRelieving: 'Worse with deep breath, no relief with resting',
      severity: 9,
      severityDescription: 'Severe / Excruciating (Score: 9/10)',
      reviewOfSystems: {
        cardiovascular: 'Positive for diaphoresis, acute crushing retrosternal pain',
        respiratory: 'Grade 3 acute dyspnea',
      },
    });
    setStep(5);
    setTimeout(() => {
      processAndFinalizeEncounter();
    }, 100);
  };

  return (
    <div className="kiosk-container">
      {/* Top Kiosk Header */}
      <div className="kiosk-top-bar">
        <div className="kiosk-branding">
          <div className="kiosk-logo-box">
            <HeartPulse className="kiosk-logo-icon" />
          </div>
          <div>
            <h2 className="kiosk-title">ABHA PRO</h2>
            <p className="kiosk-tagline">Patient check-in</p>
          </div>
        </div>

        <div className="kiosk-top-actions">
          {/* Language Selector Dropdown */}
          <div className="kiosk-lang-picker">
            <Languages className="lang-icon" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="kiosk-lang-select"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Demo Trigger */}
          <button
            type="button"
            className="kiosk-demo-trigger-btn"
            onClick={handleFastEmergencyDemo}
            title="Simulate immediate Acute Coronary Syndrome (ACS) Red-Flag Triage"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Emergency demo</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="kiosk-stepper">
        {[
          { num: 1, label: 'Your details' },
          { num: 2, label: 'Preferences' },
          { num: 3, label: 'Your symptoms' },
          { num: 4, label: 'Documents' },
          { num: 5, label: 'Check-in complete' },
        ].map((s) => (
          <div
            key={s.num}
            className={`step-item ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}
            onClick={() => setStep(s.num)}
          >
            <div className="step-circle">
              {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Kiosk Content Cards */}
      <div className="kiosk-step-body">
        {/* STEP 1: ABHA Authentication & Consent */}
        {step === 1 && (
          <div className="kiosk-step-card animate-fadeIn">
            <div className="step-intro">
              <QrCode className="step-intro-icon text-cyan-400" />
              <div>
                <p className="step-eyebrow">Step 1 of 5</p>
                <h3>Confirm your ABHA details</h3>
                <p>Review your information before checking in for your visit.</p>
              </div>
            </div>

            <div className="abha-auth-grid">
              {/* Virtual ABHA Card Preview */}
              <div className="abha-card-preview">
                <div className="abha-card-inner">
                  <div className="abha-card-header">
                    <span className="govt-text">NATIONAL HEALTH AUTHORITY • ABDM</span>
                    <span className="abha-flag">🇮🇳</span>
                  </div>
                  <div className="abha-card-main">
                    <img
                      src={abhaProfile.photoUrl}
                      alt="Patient"
                      className="abha-avatar"
                    />
                    <div className="abha-details">
                      <span className="abha-name">{abhaProfile.name}</span>
                      <span className="abha-id-num">ABHA: {abhaProfile.abhaNumber}</span>
                      <span className="abha-phr">PHR: {abhaProfile.abhaAddress}</span>
                      <div className="abha-badge-line">
                        <span>Age: {abhaProfile.age} / {abhaProfile.gender}</span>
                        <span className="verified-badge"><ShieldCheck className="w-3.5 h-3.5" /> M1 Verified</span>
                      </div>
                    </div>
                  </div>
                  <div className="abha-card-footer">
                    <span>Mobile: {abhaProfile.mobile}</span>
                    <span>State: {abhaProfile.state}</span>
                  </div>
                </div>
              </div>

              {/* Patient Input & Consent Form */}
              <div className="abha-input-side">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={abhaProfile.name}
                    onChange={(e) => setAbhaProfile({ ...abhaProfile, name: e.target.value })}
                    className="kiosk-text-input"
                  />
                </div>

                <div className="input-group-row">
                  <div className="input-group">
                    <label>Age (Years)</label>
                    <input
                      type="number"
                      value={abhaProfile.age}
                      onChange={(e) => setAbhaProfile({ ...abhaProfile, age: parseInt(e.target.value, 10) || 30 })}
                      className="kiosk-text-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Gender</label>
                    <select
                      value={abhaProfile.gender}
                      onChange={(e) => setAbhaProfile({ ...abhaProfile, gender: e.target.value as any })}
                      className="kiosk-select"
                    >
                      <option value="FEMALE">Female (महिला)</option>
                      <option value="MALE">Male (पुरुष)</option>
                      <option value="OTHER">Other (अन्य)</option>
                    </select>
                  </div>
                </div>

                {/* ABDM Consent Box */}
                <div className="consent-box">
                  <input
                    type="checkbox"
                    id="kiosk-consent"
                    checked={hasConsented}
                    onChange={(e) => setHasConsented(e.target.checked)}
                    className="consent-checkbox"
                  />
                  <label htmlFor="kiosk-consent" className="consent-label">
                    <strong>ABDM Digital Consent (DPDP Act 2023):</strong> {t.consentText}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Language & clinical pathway */}
        {step === 2 && (
          <div className="kiosk-step-card animate-fadeIn">
            <div className="step-intro">
              <Languages className="step-intro-icon" />
              <div>
                <p className="step-eyebrow">Step 2 of 5</p>
                <h3>Choose your preferences</h3>
                <p>Select a language and the type of care you’re visiting for.</p>
              </div>
            </div>

            <div className="mode-selection-grid">
              <button
                type="button"
                className={`mode-card ${clinicalMode === 'ALLOPATHIC' ? 'selected' : ''}`}
                onClick={() => setClinicalMode('ALLOPATHIC')}
              >
                <div className="mode-card-header">
                  <Activity className="mode-icon" />
                  <span className="mode-tag">General OPD</span>
                </div>
                <h4>Modern medicine</h4>
                <p className="mode-desc">For general physician, medical, or specialty OPD visits.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${clinicalMode === 'AYUSH' ? 'selected' : ''}`}
                onClick={() => setClinicalMode('AYUSH')}
              >
                <div className="mode-card-header">
                  <Sparkles className="mode-icon" />
                  <span className="mode-tag ayush-tag">AYUSH OPD</span>
                </div>
                <h4>AYUSH care</h4>
                <p className="mode-desc">For Ayurveda, Yoga, Unani, Siddha, or Homeopathy consultation.</p>
              </button>
            </div>

            <div className="language-grid-section">
              <h5>Interface language</h5>
              <div className="language-buttons-grid">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    className={`lang-card-btn ${language === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      speakText(`आपने ${lang.nativeLabel} भाषा चुनी है`, lang.code);
                    }}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-native">{lang.nativeLabel}</span>
                    <span className="lang-en">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Anatomical Body Map & Pain Scale */}
        {step === 3 && (
          <div className="kiosk-step-card animate-fadeIn">
            <div className="step-intro">
              <HeartPulse className="step-intro-icon" />
              <div>
                <p className="step-eyebrow">Step 3 of 5</p>
                <h3>Tell us what’s bothering you</h3>
                <p>Choose an area, rate your pain if needed, then describe your concern in your own words.</p>
              </div>
            </div>

            <div className="body-pain-grid">
              <BodyMap
                selectedRegion={selectedBodyPart}
                onSelectRegion={(reg) => {
                  setSelectedBodyPart(reg);
                  setSocrates((prev: SocratesData) => ({ ...prev, site: reg }));
                }}
                painScore={painScore}
                onAddSymptomTag={(tag) => {
                  setSymptomText((prev) => (prev ? `${prev}, ${tag}` : tag));
                }}
              />
              <PainScale
                score={painScore}
                onChange={(score) => {
                  setPainScore(score);
                  setSocrates((prev: SocratesData) => ({ ...prev, severity: score }));
                }}
                selectedCharacter={socrates.character}
                onSelectCharacter={(char) => {
                  setSocrates((prev: SocratesData) => ({ ...prev, character: char }));
                }}
              />
            </div>

            <div className="intake-divider" />
            <div className="intake-copy">
              <div className="intake-copy-header">
                <h4>Describe your symptoms & clinical details</h4>
                <div className="live-telemetry-tag">
                  <span>📍 {selectedBodyPart.split('/')[0].trim()}</span>
                  <span className="dot-sep">•</span>
                  <span>⚡ Pain: {painScore}/10</span>
                  {socrates.character && (
                    <>
                      <span className="dot-sep">•</span>
                      <span>✨ {socrates.character.split('/')[0].trim()}</span>
                    </>
                  )}
                </div>
              </div>
              <p>You can use the microphone, select the suggested chips below, or type your symptoms.</p>
            </div>
            <VoiceInputBar
              value={symptomText}
              onChange={setSymptomText}
              langCode={language}
              selectedRegion={selectedBodyPart}
              placeholder={
                clinicalMode === 'ALLOPATHIC'
                  ? 'For example: when it started, what it feels like, and what makes it better or worse.'
                  : 'अपने लक्षण, पाचन क्षमता और दिनचर्या के बारे में बताएं...'
              }
            />

            {clinicalMode === 'ALLOPATHIC' ? (
              <div className="socrates-form-grid">
                <div className="socrates-field">
                  <label>When did it start?</label>
                  <input type="text" value={socrates.onset} onChange={(e) => setSocrates({ ...socrates, onset: e.target.value })} className="kiosk-text-input" />
                </div>
                <div className="socrates-field">
                  <label>What does it feel like?</label>
                  <select value={socrates.character} onChange={(e) => setSocrates({ ...socrates, character: e.target.value })} className="kiosk-select">
                    <option value="Crushing / Heavy pressure">Pressure or heaviness</option>
                    <option value="Sharp / Stabbing">Sharp or stabbing</option>
                    <option value="Dull Ache">Dull ache</option>
                    <option value="Burning / Throbbing">Burning or throbbing</option>
                    <option value="Colicky / Cramping">Cramping</option>
                  </select>
                </div>
                <div className="socrates-field">
                  <label>Does it spread anywhere else?</label>
                  <input type="text" value={socrates.radiation} onChange={(e) => setSocrates({ ...socrates, radiation: e.target.value })} className="kiosk-text-input" />
                </div>
                <div className="socrates-field">
                  <label>What makes it better or worse?</label>
                  <input type="text" value={socrates.exacerbatingRelieving} onChange={(e) => setSocrates({ ...socrates, exacerbatingRelieving: e.target.value })} className="kiosk-text-input" />
                </div>
              </div>
            ) : (
              <div className="ayush-form-grid">
                <div className="ayush-field">
                  <label>Prakriti (प्रकृति)</label>
                  <select value={ayush.prakriti} onChange={(e) => setAyush({ ...ayush, prakriti: e.target.value as any })} className="kiosk-select">
                    <option value="Vata-Pitta">Vata-Pitta (वात-पित्त)</option><option value="Pitta-Kapha">Pitta-Kapha (पित्त-कफ)</option><option value="Vata-Kapha">Vata-Kapha (वात-कफ)</option><option value="Vata">Vata (वात)</option><option value="Pitta">Pitta (पित्त)</option><option value="Kapha">Kapha (कफ)</option><option value="Tridoshaja">Tridoshaja (त्रिदोषज)</option>
                  </select>
                </div>
                <div className="ayush-field">
                  <label>Agni / Digestive capacity (अग्नि)</label>
                  <select value={ayush.aharaShakti.jaranaShakti} onChange={(e) => setAyush({ ...ayush, aharaShakti: { ...ayush.aharaShakti, jaranaShakti: e.target.value as any } })} className="kiosk-select">
                    <option value="Vishamagni">Vishamagni - Irregular (विषमाग्नि)</option><option value="Mandagni">Mandagni - Sluggish (मंदाग्नि)</option><option value="Teekshnagni">Teekshnagni - High Acidic (तीक्ष्णाग्नि)</option><option value="Samagni">Samagni - Balanced (समाग्नि)</option>
                  </select>
                </div>
                <div className="ayush-field"><label>Nadi symptoms (नाड़ी परीक्षा लक्षण)</label><input type="text" value={ayush.ashtavidha.nadi} onChange={(e) => setAyush({ ...ayush, ashtavidha: { ...ayush.ashtavidha, nadi: e.target.value } })} className="kiosk-text-input" /></div>
                <div className="ayush-field"><label>Sleep & lifestyle (निद्रा एवं विहार)</label><input type="text" value={ayush.aharaVihara.sleepPattern} onChange={(e) => setAyush({ ...ayush, aharaVihara: { ...ayush.aharaVihara, sleepPattern: e.target.value } })} className="kiosk-text-input" /></div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Documents (optional) */}
        {step === 4 && (
          <div className="kiosk-step-card animate-fadeIn">
            <div className="step-intro">
              <FileText className="step-intro-icon" />
              <div>
                <p className="step-eyebrow">Step 4 of 5 · Optional</p>
                <h3>Bring your records with you</h3>
                <p>Add a previous prescription or report so your clinician can review it sooner.</p>
              </div>
            </div>
            <DocumentScanner
              scannedDocs={scannedDocs}
              onAddScan={(doc) => setScannedDocs([...scannedDocs, doc])}
              onRemoveScan={(docId) => setScannedDocs(scannedDocs.filter((d: DocumentScanResult) => d.id !== docId))}
            />
          </div>
        )}

        {/* STEP 5: Triage & token */}
        {step === 5 && (
          <div className="kiosk-step-card animate-fadeIn">
            {completedEncounter && (
              <div className="token-final-layout">
                {/* Emergency Banner if triggered */}
                {completedEncounter.redFlag.isTriggered && completedEncounter.redFlag.level === 'CRITICAL' && (
                  <div className="emergency-alarm-banner animate-pulse">
                    <AlertTriangle className="alarm-icon" />
                    <div>
                      <h4>🚨 CRITICAL RED-FLAG TRIAGE ALERT TRIGGERED</h4>
                      <p>{completedEncounter.redFlag.immediateAction}</p>
                    </div>
                  </div>
                )}

                {/* Printable Queue Slip / Token Card */}
                <div className="printable-token-card">
                  <div className="token-card-header">
                    <div className="token-hospital-title">
                      <h5>AIIMS NEW DELHI • OPD TRIAGE</h5>
                      <span>Ayushman Bharat Digital Mission (ABDM)</span>
                    </div>
                    <div className="token-qr-box">
                      <QrCode className="w-10 h-10 text-slate-800" />
                    </div>
                  </div>

                  <div className="token-badge-highlight">
                    <span className="token-type-label">
                      {completedEncounter.redFlag.level === 'CRITICAL' ? 'PRIORITY 1 - EMERGENCY TOKEN' : 'OPD QUEUE TOKEN'}
                    </span>
                    <h1 className="token-code-huge">{completedEncounter.patient.queueToken}</h1>
                  </div>

                  <div className="token-data-rows">
                    <div className="token-row">
                      <span className="lbl">Patient Name:</span>
                      <span className="val font-bold">{completedEncounter.patient.name}</span>
                    </div>
                    <div className="token-row">
                      <span className="lbl">ABHA Number:</span>
                      <span className="val font-mono">{completedEncounter.patient.abhaNumber}</span>
                    </div>
                    <div className="token-row">
                      <span className="lbl">Triage Priority:</span>
                      <span className={`val priority-pill ${completedEncounter.redFlag.triagePriority.toLowerCase()}`}>
                        {completedEncounter.redFlag.triagePriority.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="token-row">
                      <span className="lbl">Chief Complaint:</span>
                      <span className="val">{completedEncounter.soapNote.subjective.chiefComplaint}</span>
                    </div>
                    <div className="token-row">
                      <span className="lbl">Consultation Room:</span>
                      <span className="val font-semibold">
                        {completedEncounter.redFlag.level === 'CRITICAL'
                          ? 'Resuscitation Bay 1 / Casualty'
                          : completedEncounter.mode === 'AYUSH'
                          ? 'Kaya Chikitsa Cabin 03'
                          : 'General Medicine OPD Room 12'}
                      </span>
                    </div>
                  </div>

                  <div className="token-print-actions">
                    <button
                      type="button"
                      className="print-token-btn"
                      onClick={() => window.print()}
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Queue Slip</span>
                    </button>
                    <button
                      type="button"
                      className="reset-kiosk-btn"
                      onClick={() => {
                        setStep(1);
                        setCompletedEncounter(null);
                        setSymptomText('');
                      }}
                    >
                      <span>Start New Patient Session</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kiosk Footer Navigation Bar */}
      <div className="kiosk-footer-nav">
        {step > 1 && step < 5 && (
          <button type="button" className="nav-btn-secondary" onClick={handleBack}>
            <ChevronLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>
        )}

        <div className="footer-step-counter">
          <span>Step {step} of 5</span>
        </div>

        {step < 5 && (
          <button type="button" className="nav-btn-primary" onClick={handleNext}>
            <span>{step === 4 ? 'Finish check-in' : t.next}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  MessageSquare,
  Building2,
  Sparkles,
  ArrowRight,
  Wifi,
  Battery,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PatientEncounter, SoapNote, AbhaProfile } from '../../types';
import {
  IVR_LANGUAGES,
  SYMPTOM_CATEGORIES,
  KNOWN_PERSONAS,
  IVR_AUDIO_PROMPTS,
} from '../../services/ivrPrompts';
import type {
  IvrLanguageConfig,
  SymptomCategory,
  IvrPersona,
} from '../../services/ivrPrompts';
import { playDtmfTone, playRingbackTone, playSmsChime } from '../../utils/dtmfAudio';
import { speakText } from '../../utils/languages';
import { generateFhirR4Bundle } from '../../services/fhirConverter';

interface IvrMobileSimulatorProps {
  onBookedEncounter: (encounter: PatientEncounter) => void;
  onViewDoctorQueue: () => void;
}

type CallScreenState = 'DIALER' | 'RINGING' | 'IN_CALL' | 'COMPLETED' | 'SMS_INBOX';
type IvrStep = 'LANGUAGE' | 'ABHA_INPUT' | 'VERIFYING' | 'SYMPTOM_MENU' | 'ALLOCATION' | 'DONE';

export const IvrMobileSimulator: React.FC<IvrMobileSimulatorProps> = ({
  onBookedEncounter,
  onViewDoctorQueue,
}) => {
  // Mobile UI States
  const [screenState, setScreenState] = useState<CallScreenState>('DIALER');
  const [dialedNumber, setDialedNumber] = useState<string>('1075');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showInCallKeypad, setShowInCallKeypad] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // IVR Flow States
  const [ivrStep, setIvrStep] = useState<IvrStep>('LANGUAGE');
  const [selectedLang, setSelectedLang] = useState<IvrLanguageConfig>(IVR_LANGUAGES[1]); // Default Hindi (2)
  const [enteredAbha, setEnteredAbha] = useState<string>('');
  const [verifiedPatient, setVerifiedPatient] = useState<IvrPersona>(KNOWN_PERSONAS[0]);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomCategory | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<{
    id: string;
    sender: string;
    timestamp: string;
    content: string;
    token: string;
    hospital: string;
    doctor: string;
    room: string;
    patientName: string;
  } | null>(null);
  const [showPushBanner, setShowPushBanner] = useState<boolean>(false);

  const ringbackStopperRef = useRef<(() => void) | null>(null);
  const callTimerRef = useRef<any>(null);

  // Call duration counter
  useEffect(() => {
    if (screenState === 'IN_CALL') {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [screenState]);

  const speakPrompt = async (text: string, langCode: string = selectedLang.code) => {
    if (!isSpeakerOn) return;
    setIsSpeaking(true);
    await speakText(text, langCode as any);
    setIsSpeaking(false);
  };

  // Start Call Flow
  const handleStartCall = () => {
    if (!dialedNumber) return;
    setScreenState('RINGING');
    setIvrStep('LANGUAGE');
    setEnteredAbha('');
    setSelectedSymptom(null);

    // Play ringback tone
    ringbackStopperRef.current = playRingbackTone();

    setTimeout(() => {
      if (ringbackStopperRef.current) ringbackStopperRef.current();
      setScreenState('IN_CALL');
      setIvrStep('LANGUAGE');

      // Play initial bilingual greeting
      const greeting = IVR_AUDIO_PROMPTS.hi.greeting + ' ' + IVR_AUDIO_PROMPTS.hi.langMenu;
      speakPrompt(greeting, 'hi');
    }, 2800);
  };

  const handleEndCall = () => {
    if (ringbackStopperRef.current) ringbackStopperRef.current();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setScreenState('DIALER');
    setIvrStep('LANGUAGE');
    setIsSpeaking(false);
  };

  // Handle DTMF Key Press during Call or on Dialer
  const handleKeyPress = (key: string) => {
    playDtmfTone(key);

    if (screenState === 'DIALER') {
      if (dialedNumber.length < 15) {
        setDialedNumber((prev) => prev + key);
      }
      return;
    }

    if (screenState === 'IN_CALL') {
      processIvrInput(key);
    }
  };

  const processIvrInput = (key: string) => {
    // 1. LANGUAGE SELECTION (Step 1)
    if (ivrStep === 'LANGUAGE') {
      const matchedLang = IVR_LANGUAGES.find((l) => l.key === key);
      if (matchedLang) {
        setSelectedLang(matchedLang);
        setIvrStep('ABHA_INPUT');
        const prompts = IVR_AUDIO_PROMPTS[matchedLang.code] || IVR_AUDIO_PROMPTS.en;
        speakPrompt(prompts.askAbha, matchedLang.code);
      }
      return;
    }

    // 2. ABHA NUMBER INPUT / VERIFICATION (Step 2)
    if (ivrStep === 'ABHA_INPUT') {
      if (key === '#' || key === '1' || enteredAbha.length >= 12) {
        // Find persona or match
        setIvrStep('VERIFYING');
        const matchedPersona = KNOWN_PERSONAS.find((p) => p.abhaNumber.includes(enteredAbha)) || KNOWN_PERSONAS[0];
        setVerifiedPatient(matchedPersona);

        const prompts = IVR_AUDIO_PROMPTS[selectedLang.code] || IVR_AUDIO_PROMPTS.en;
        speakPrompt(prompts.verifying, selectedLang.code);

        setTimeout(() => {
          setIvrStep('SYMPTOM_MENU');
          const successMsg = prompts.verifiedSuccess(matchedPersona.name, matchedPersona.nearestHospital);
          const symptomMenu = prompts.askSymptom;
          speakPrompt(`${successMsg} ${symptomMenu}`, selectedLang.code);
        }, 2200);
      } else {
        setEnteredAbha((prev) => prev + key);
      }
      return;
    }

    // 3. SELF DIAGNOSIS SYMPTOM CATEGORY (Step 3)
    if (ivrStep === 'SYMPTOM_MENU') {
      const category = SYMPTOM_CATEGORIES.find((s) => s.key === key);
      if (category) {
        setSelectedSymptom(category);
        finalizeAppointment(category);
      }
      return;
    }
  };

  const finalizeAppointment = (category: SymptomCategory) => {
    setIvrStep('ALLOCATION');

    const prefix = category.isRedFlag ? 'EMERG-P1-' : category.priority === 'P2_URGENT' ? 'URG-P2-' : 'OPD-P3-';
    const tokenCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedToken(tokenCode);

    const prompts = IVR_AUDIO_PROMPTS[selectedLang.code] || IVR_AUDIO_PROMPTS.en;
    const confirmVoiceText = prompts.bookingSuccess(
      verifiedPatient.nearestHospital,
      tokenCode,
      category.assignedDoctor,
      category.roomNumber
    );

    speakPrompt(confirmVoiceText, selectedLang.code);

    // Create Patient Profile & Synthesize SOAP
    const abhaProfile: AbhaProfile = {
      abhaNumber: verifiedPatient.abhaNumber,
      abhaAddress: `${verifiedPatient.name.toLowerCase().replace(/\s+/g, '.')}${verifiedPatient.age}@abdm`,
      name: verifiedPatient.name,
      gender: verifiedPatient.gender,
      age: verifiedPatient.age,
      dob: `${2026 - verifiedPatient.age}-04-12`,
      mobile: verifiedPatient.phone,
      pinCode: '110029',
      state: 'Delhi',
      district: verifiedPatient.district,
      photoUrl:
        verifiedPatient.gender === 'MALE'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      authMethod: 'MOBILE_OTP',
      verified: true,
      queueToken: tokenCode,
      queueNumber: Math.floor(Math.random() * 15) + 1,
      registeredAt: new Date().toISOString(),
    };

    const newSoap: SoapNote = {
      subjective: {
        chiefComplaint: `[IVR Automated Intake] Patient reported: ${category.label} (${category.hindiLabel}) via Phone Helpline 1075.`,
        historyOfPresentIllness: `Self-triaged via ABHA PRO IVR Automated Helpline. Patient selected symptom category #${category.key} (${category.label}). Routed to ${category.department}.`,
        pastMedicalHistory: ['Hypertension (Stage 1)'],
        medicationHistory: ['Tab Amlodipine 5mg OD'],
        allergies: ['No known severe allergies'],
        familyHistory: 'Non-contributory',
        socialHabits: 'Non-smoker',
      },
      objective: {
        vitals: {
          bpSystolic: category.isRedFlag ? 158 : 124,
          bpDiastolic: category.isRedFlag ? 98 : 82,
          pulseRate: category.isRedFlag ? 108 : 78,
          spo2: category.isRedFlag ? 93 : 98,
          tempF: category.key === '1' ? 101.4 : 98.6,
          respiratoryRate: category.isRedFlag ? 24 : 18,
          painScore: category.isRedFlag ? 9 : 5,
        },
        physicalExamFindings: [
          `Allocated via IVR to: ${category.assignedDoctor}`,
          `Department: ${category.department} (${category.roomNumber})`,
        ],
        extractedLabHighlights: [],
        digitizedPastRx: [],
      },
      assessment: {
        provisionalDiagnoses: [
          {
            condition: category.specialty,
            icd10: category.isRedFlag ? 'I21.9' : 'R10.9',
            snomedCt: '401303003',
            confidence: 0.91,
            rationale: `Automated IVR Triage match based on caller selection: ${category.label}.`,
          },
        ],
        redFlagsIdentified: category.isRedFlag ? ['IVR Emergency Alert: Acute Internal/Chest Pain'] : [],
        clinicalRiskRating: category.isRedFlag ? 'HIGH' : category.priority === 'P2_URGENT' ? 'MEDIUM' : 'LOW',
      },
      plan: {
        proposedInvestigations: ['Targeted physical assessment in OPD', 'Complete Blood Count / Diagnostic ECG if indicated'],
        medicationRecommendations: [
          {
            name: 'Consultation with Specialist',
            dosage: 'Stat',
            frequency: 'Immediate OPD Visit',
            duration: 'Today',
            instructions: `Proceed to ${category.roomNumber} upon arrival`,
            category: 'Allopathic',
          },
        ],
        lifestyleAndDietAdvice: ['Keep hydration adequate', 'Bring physical ABHA card or show SMS confirmation at desk'],
        triageDisposition: `Consultation booked with ${category.assignedDoctor} at ${verifiedPatient.nearestHospital}`,
        followUpInDays: 7,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        modelVersion: 'ABHA-PRO-IVR-1075-TeleTriage-Engine-v2.4',
        mode: 'ALLOPATHIC',
        safetyLock: 'AI-Generated Triage Summary — Requires Clinician Verification',
        status: 'AI_DRAFT',
      },
    };

    const newEncounter: PatientEncounter = {
      id: `enc-ivr-${Date.now()}`,
      kioskId: 'IVR_HELPLINE_1075',
      mode: 'ALLOPATHIC',
      language: selectedLang.code,
      createdAt: new Date().toISOString(),
      status: category.isRedFlag ? 'EMERGENCY_ESCALATED' : 'WAITING',
      patient: abhaProfile,
      redFlag: {
        isTriggered: category.isRedFlag,
        level: category.isRedFlag ? 'CRITICAL' : category.priority === 'P2_URGENT' ? 'WARNING' : 'NORMAL',
        triagePriority: category.priority,
        triggeredRules: category.isRedFlag ? ['IVR ACS Trigger: Internal chest/heart pain reported'] : [],
        immediateAction: `🚨 Proceed to ${category.roomNumber} at ${verifiedPatient.nearestHospital}`,
        emergencyTokenCode: tokenCode,
        timestamp: new Date().toISOString(),
        acknowledgedByDoctor: false,
      },
      scannedDocuments: [],
      soapNote: newSoap,
      fhirBundle: {},
    };

    newEncounter.fhirBundle = generateFhirR4Bundle(newEncounter);
    onBookedEncounter(newEncounter);

    // Prepare Dispatched SMS Object
    const sms = {
      id: `sms-${Date.now()}`,
      sender: 'GOV-ABHA-OPD',
      timestamp: 'Just now',
      token: tokenCode,
      hospital: verifiedPatient.nearestHospital,
      doctor: category.assignedDoctor,
      room: category.roomNumber,
      patientName: verifiedPatient.name,
      content: `Ayushman Bharat ABDM Booking Confirmed!\n\n• Patient: ${verifiedPatient.name}\n• ABHA: ${verifiedPatient.abhaNumber}\n• Token No: ${tokenCode}\n• Hospital: ${verifiedPatient.nearestHospital}\n• Dept: ${category.department}\n• Doctor: ${category.assignedDoctor} (${category.roomNumber})\n• Slot: Today, 10:30 AM (Express Entry)\n\nShow this SMS at hospital OPD reception for direct entry.`,
    };

    setSmsNotification(sms);

    // Trigger SMS Push Notification banner after 2.5s
    setTimeout(() => {
      playSmsChime();
      setShowPushBanner(true);
      if (!category.isRedFlag) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }, 2800);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ivr-workspace-layout">
      {/* Left Column: Interactive Scenario Info & Explanatory Guide */}
      <div className="ivr-guide-pane">
        <div className="ivr-guide-header">
          <div className="ivr-badge">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Tele-Triage & Automated Voice Bot</span>
          </div>
          <h3>ABHA Automated 1075 IVR Call System</h3>
          <p>
            Enables patients without smartphones or internet access to book OPD consultation slots, verify ABHA identities, and receive instant SMS confirmations over regular telephone calls.
          </p>
        </div>

        {/* Workflow Steps Card */}
        <div className="ivr-flow-steps-card">
          <h5>IVR Telephony Architecture:</h5>
          <ol className="ivr-ordered-list">
            <li>
              <strong>1. Dial 1075 / Toll-Free</strong>: Incoming call routing to Edge Conformer ASR & Indic FastSpeech2 TTS.
            </li>
            <li>
              <strong>2. Language Selection (1-5)</strong>: Multilingual menu in English, Hindi, Marathi, Punjabi, and Bengali.
            </li>
            <li>
              <strong>3. ABHA Card Number Verification</strong>: Keypad DTMF entry, ABDM M1 Milestone verification, and patient profile lookup.
            </li>
            <li>
              <strong>4. Self-Diagnosis Symptom Routing (1-4)</strong>: Categorization for Fever, Abdominal, Internal/Chest (Red-Flag), and External/Ortho symptoms.
            </li>
            <li>
              <strong>5. Hospital & Doctor Allocation</strong>: Nearest government healthcare facility matched, doctor room assigned, queue token allocated.
            </li>
            <li>
              <strong>6. Automated SMS Dispatch & EMR Sync</strong>: Instant SMS sent to patient phone + real-time push to Doctor's Live OPD Queue!
            </li>
          </ol>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="ivr-demo-personas-card">
          <h5>Preset ABHA Patients for Testing:</h5>
          <div className="persona-chips-list">
            {KNOWN_PERSONAS.map((persona, idx) => (
              <div
                key={idx}
                className="persona-chip-card"
                onClick={() => {
                  setEnteredAbha(persona.abhaNumber);
                  setVerifiedPatient(persona);
                }}
              >
                <div className="persona-chip-top">
                  <strong>{persona.name}</strong>
                  <span className="persona-age">({persona.age}y / {persona.gender})</span>
                </div>
                <span className="persona-abha font-mono">{persona.abhaNumber}</span>
                <span className="persona-hospital">{persona.nearestHospital}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link to Doctor Dashboard */}
        <div className="ivr-doctor-link-box">
          <div>
            <strong>Live Sync Enabled</strong>
            <p className="text-xs text-slate-400">
              Any appointment booked on the phone immediately updates the Doctor's EMR Queue in real time.
            </p>
          </div>
          <button
            type="button"
            className="view-doctor-queue-btn"
            onClick={onViewDoctorQueue}
          >
            <span>Open Doctor's EMR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Column: Realistic Mobile Phone Screen Mockup */}
      <div className="ivr-phone-viewport-container">
        <div className="mobile-smartphone-chassis">
          {/* Smartphone Bezel & Notch */}
          <div className="phone-top-notch">
            <span className="notch-speaker"></span>
            <span className="notch-camera"></span>
          </div>

          {/* Status Bar */}
          <div className="phone-status-bar">
            <span className="phone-time">09:41</span>
            <div className="phone-status-icons">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Slide-Down SMS Notification Banner */}
          {showPushBanner && smsNotification && (
            <div
              className="phone-sms-push-banner animate-bounce"
              onClick={() => {
                setShowPushBanner(false);
                setScreenState('SMS_INBOX');
              }}
            >
              <div className="push-banner-top">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  <span>MESSAGES • {smsNotification.sender}</span>
                </div>
                <span className="text-[10px] text-slate-500">now</span>
              </div>
              <p className="push-banner-snippet">
                <strong>ABDM Confirmed:</strong> Token #{smsNotification.token} for {smsNotification.patientName} at {smsNotification.hospital}.
              </p>
            </div>
          )}

          {/* PHONE SCREEN CONTENT */}
          <div className="phone-screen-body">
            {/* SCREEN 1: DIALER SCREEN */}
            {screenState === 'DIALER' && (
              <div className="phone-dialer-screen">
                <div className="dialer-display-box">
                  <span className="dialer-subtext">National Health Helpline</span>
                  <h2 className="dialer-digits-input font-mono">{dialedNumber || ' '}</h2>
                </div>

                {/* Dialpad Keypad 1-9, *, 0, # */}
                <div className="phone-keypad-grid">
                  {[
                    { num: '1', sub: '' },
                    { num: '2', sub: 'ABC' },
                    { num: '3', sub: 'DEF' },
                    { num: '4', sub: 'GHI' },
                    { num: '5', sub: 'JKL' },
                    { num: '6', sub: 'MNO' },
                    { num: '7', sub: 'PQRS' },
                    { num: '8', sub: 'TUV' },
                    { num: '9', sub: 'WXYZ' },
                    { num: '*', sub: '' },
                    { num: '0', sub: '+' },
                    { num: '#', sub: '' },
                  ].map((btn) => (
                    <button
                      type="button"
                      key={btn.num}
                      className="keypad-btn"
                      onClick={() => handleKeyPress(btn.num)}
                    >
                      <span className="btn-number">{btn.num}</span>
                      {btn.sub && <span className="btn-letters">{btn.sub}</span>}
                    </button>
                  ))}
                </div>

                {/* Call Action Button */}
                <div className="dialer-bottom-actions">
                  <button
                    type="button"
                    className="phone-call-btn"
                    onClick={handleStartCall}
                    title="Call ABHA 1075 Helpline"
                  >
                    <Phone className="w-6 h-6 fill-white" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: OUTGOING RINGING SCREEN */}
            {screenState === 'RINGING' && (
              <div className="phone-call-screen ringing">
                <div className="call-avatar-pulse">
                  <Building2 className="w-12 h-12 text-sky-400" />
                </div>
                <div className="call-info-group">
                  <h3>ABHA 1075 National Helpline</h3>
                  <span className="calling-status-text animate-pulse">Calling National Gateway...</span>
                  <span className="call-number-sub">1075 (Toll-Free)</span>
                </div>

                <div className="call-screen-actions">
                  <button
                    type="button"
                    className="phone-end-btn"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="w-6 h-6 fill-white" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: ACTIVE IN-CALL IVR WORKSTATION */}
            {screenState === 'IN_CALL' && (
              <div className="phone-call-screen in-call">
                {/* Call Top Header */}
                <div className="in-call-header">
                  <div className="in-call-avatar">
                    <Building2 className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h4>ABHA National OPD Helpline (1075)</h4>
                    <div className="call-timer-badge">
                      <span className="live-dot animate-ping"></span>
                      <span>{formatTimer(callDuration)}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Voice Waveform & Speech Display */}
                <div className="ivr-speech-bubble-box">
                  <div className="speech-bubble-header">
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                    <span>IVR Automated Voice Assistant ({selectedLang.nativeName})</span>
                  </div>

                  {/* Visual Equalizer Bars */}
                  {isSpeaking && (
                    <div className="ivr-audio-equalizer">
                      <span className="eq-bar bar-1"></span>
                      <span className="eq-bar bar-2"></span>
                      <span className="eq-bar bar-3"></span>
                      <span className="eq-bar bar-4"></span>
                      <span className="eq-bar bar-5"></span>
                      <span className="eq-bar bar-6"></span>
                      <span className="eq-bar bar-7"></span>
                    </div>
                  )}

                  {/* Stage Information Prompt */}
                  <div className="ivr-stage-card">
                    {ivrStep === 'LANGUAGE' && (
                      <div>
                        <p className="stage-title">Step 1: Select Language (भाषा चुनें)</p>
                        <p className="stage-prompt">
                          Press <strong>1: English</strong> • <strong>2: हिन्दी</strong> • <strong>3: मराठी</strong> • <strong>4: ਪੰਜਾਬੀ</strong> • <strong>5: বাংলা</strong>
                        </p>
                      </div>
                    )}

                    {ivrStep === 'ABHA_INPUT' && (
                      <div>
                        <p className="stage-title">Step 2: Enter ABHA Number (आभा नंबर दर्ज करें)</p>
                        <p className="stage-prompt">
                          Dial on keypad or press <strong>1</strong> for instant demo verification:
                        </p>
                        <div className="entered-digits-preview font-mono">
                          {enteredAbha || 'Waiting for keypad input...'}
                        </div>
                      </div>
                    )}

                    {ivrStep === 'VERIFYING' && (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <UserCheck className="w-8 h-8 text-cyan-400 animate-bounce" />
                        <p className="stage-title">Verifying ABDM Health ID...</p>
                      </div>
                    )}

                    {ivrStep === 'SYMPTOM_MENU' && (
                      <div>
                        <p className="stage-title">Step 3: Self-Diagnosis Symptom Selection</p>
                        <p className="stage-prompt">
                          Press <strong>1</strong>: Fever/Cold/Body Pain<br />
                          Press <strong>2</strong>: Abdominal / Digestion<br />
                          Press <strong>3</strong>: Internal / Chest Pain (Emergency)<br />
                          Press <strong>4</strong>: External / Bone / Joint Pain
                        </p>
                      </div>
                    )}

                    {ivrStep === 'ALLOCATION' && (
                      <div>
                        <p className="stage-title text-emerald-400">✓ OPD Slot Confirmed!</p>
                        <p className="stage-prompt">
                          Token: <strong>{generatedToken}</strong><br />
                          Hospital: {verifiedPatient.nearestHospital}<br />
                          Doctor: {selectedSymptom?.assignedDoctor}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* In-Call Keypad */}
                {showInCallKeypad && (
                  <div className="in-call-keypad-grid">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <button
                        type="button"
                        key={k}
                        className="in-call-key-btn"
                        onClick={() => handleKeyPress(k)}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                )}

                {/* In-Call Bottom Control Tray */}
                <div className="in-call-control-tray">
                  <button
                    type="button"
                    className={`call-ctrl-btn ${isMuted ? 'active' : ''}`}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button
                    type="button"
                    className={`call-ctrl-btn ${showInCallKeypad ? 'active' : ''}`}
                    onClick={() => setShowInCallKeypad(!showInCallKeypad)}
                  >
                    <Grid className="w-5 h-5" />
                    <span>Keypad</span>
                  </button>

                  <button
                    type="button"
                    className={`call-ctrl-btn ${isSpeakerOn ? 'active' : ''}`}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  >
                    {isSpeakerOn ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5" />}
                    <span>Speaker</span>
                  </button>

                  <button
                    type="button"
                    className="phone-end-btn mini"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="w-5 h-5 fill-white" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: SMS MESSAGES APP SCREEN */}
            {screenState === 'SMS_INBOX' && (
              <div className="phone-sms-app-screen">
                <div className="sms-app-header">
                  <button
                    type="button"
                    className="sms-back-btn"
                    onClick={() => setScreenState('DIALER')}
                  >
                    ← Dialer
                  </button>
                  <div className="sms-sender-info">
                    <span className="sms-sender-avatar">🏛️</span>
                    <div>
                      <h5>{smsNotification?.sender || 'GOV-ABHA-OPD'}</h5>
                      <span className="text-[10px] text-emerald-400">Verified Govt Health Service</span>
                    </div>
                  </div>
                </div>

                <div className="sms-chat-body">
                  <div className="sms-timestamp-tag">Today • 10:30 AM</div>

                  {smsNotification ? (
                    <div className="sms-bubble">
                      <div className="sms-bubble-top">
                        <span className="sms-govt-badge">🇮🇳 ABDM OFFICIAL RECEIPT</span>
                      </div>
                      <p className="sms-text-content whitespace-pre-line">{smsNotification.content}</p>

                      <div className="sms-token-highlight-box">
                        <span className="text-[10px] text-slate-400">QUEUE TOKEN NUMBER</span>
                        <h2 className="font-mono text-cyan-400 text-xl font-black">{smsNotification.token}</h2>
                      </div>

                      <div className="sms-action-row">
                        <button
                          type="button"
                          className="sms-doctor-link-btn"
                          onClick={onViewDoctorQueue}
                        >
                          <span>Open in Doctor's EMR Queue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-sms">No messages received yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="phone-bottom-home-bar"></div>
        </div>
      </div>
    </div>
  );
};

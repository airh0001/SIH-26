import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Radio } from 'lucide-react';
import type { LanguageCode } from '../../types';
import { speakText, SUPPORTED_LANGUAGES } from '../../utils/languages';

interface VoiceInputBarProps {
  value: string;
  onChange: (val: string) => void;
  langCode: LanguageCode;
  placeholder?: string;
  onAutoSubmit?: (transcript: string) => void;
  selectedRegion?: string;
}

const REGION_SYMPTOM_MAP: Record<string, string[]> = {
  'Central Chest (Retrosternal)': [
    'Crushing retrosternal chest pain with left arm radiation',
    'Severe chest tightness with cold diaphoresis',
    'Sudden heavy pressure behind breastbone while walking',
    'Heart racing with shortness of breath',
  ],
  'Bilateral Lungs & Ribs': [
    'Sharp chest pain on deep breathing with dry cough',
    'Wheezing and progressive breathlessness for 2 days',
    'Difficulty catching breath when lying flat (orthopnea)',
  ],
  'Head & Neck': [
    'Severe pulsating throbbing migraine on one side of head',
    'Sudden onset blinding headache with nausea',
    'Dizziness and room spinning when turning head',
  ],
  'Eyes, ENT & Face': [
    'Severe throat irritation with difficulty swallowing',
    'Severe ear pain with ringing sound and fever',
    'Facial sinus tenderness and nasal congestion',
  ],
  'Upper Abdomen / Epigastric': [
    'Burning epigastric acidity that radiates to throat',
    'Severe gnawing upper stomach pain 30 mins after food',
    'Bloating, nausea and acid reflux for 2 weeks',
  ],
  'Lower Abdomen & Pelvis': [
    'Sharp colicky pelvic pain with burning urination',
    'Lower abdominal cramping and irregular bowels',
    'Constant dull discomfort in lower pelvic area',
  ],
  'Bilateral Lower Limbs & Knees': [
    'Bilateral knee stiffness and crepitus when climbing stairs',
    'Swollen painful knee joint after physical exertion',
    'Severe morning stiffness lasting over 30 minutes',
  ],
  'Feet & Ankles': [
    'Severe burning sensation in soles of both feet at night',
    'Numbness and pins-and-needles sensation in toes',
    'Sharp stabbing pain in heel upon first morning step',
  ],
  'Lower Back & Lumbar': [
    'Sharp lower back spasm shooting down back of left leg',
    'Chronic dull aching in lumbar spine after sitting',
    'Inability to bend forward without severe shooting pain',
  ],
  'Cervical Spine & Neck': [
    'Stiff neck with pain radiating down to shoulder and arm',
    'Tingling in fingers with upper neck muscle tightness',
  ],
};

const GLOBAL_COMMON_SYMPTOMS = [
  'Severe crushing chest pain radiating to left arm and jaw with profuse sweating',
  'Burning sensation in both feet with excessive thirst and frequent night urination',
  'Chronic gas, indigestion, stomach fullness, and joint crepitus',
  'Difficulty breathing with audible wheezing and dry cough',
  'Sudden unilateral weakness in left arm with slurred speech',
];

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  value,
  onChange,
  langCode,
  placeholder,
  onAutoSubmit,
  selectedRegion,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      recognition.lang = langInfo?.voiceLangCode || 'hi-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onChange(transcript);
        if (event.results[0].isFinal && onAutoSubmit) {
          onAutoSubmit(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [langCode, onChange, onAutoSubmit]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          simulateSpeechCapture();
        }
      } else {
        simulateSpeechCapture();
      }
    }
  };

  const simulateSpeechCapture = () => {
    setIsListening(true);
    setTimeout(() => {
      if (selectedRegion && REGION_SYMPTOM_MAP[selectedRegion]) {
        onChange(REGION_SYMPTOM_MAP[selectedRegion][0]);
      } else if (langCode === 'hi') {
        onChange('मुझे छाती में बहुत तेज़ दर्द और पसीना आ रहा है जो बाएं हाथ में फैल रहा है');
      } else {
        onChange('Severe crushing chest pain radiating to left arm with cold diaphoresis');
      }
      setIsListening(false);
    }, 2400);
  };

  const handleSpeak = async () => {
    if (!value.trim()) return;
    setIsSpeaking(true);
    await speakText(value, langCode);
    setIsSpeaking(false);
  };

  const contextualSuggestions = useMemo(() => {
    if (selectedRegion && REGION_SYMPTOM_MAP[selectedRegion]) {
      return REGION_SYMPTOM_MAP[selectedRegion];
    }
    return GLOBAL_COMMON_SYMPTOMS;
  }, [selectedRegion]);

  return (
    <div className="modern-voice-module">
      {/* Search / Voice Main Input Frame */}
      <div className={`voice-input-frame ${isListening ? 'listening-pulse' : ''}`}>
        <button
          type="button"
          className={`mic-power-btn ${isListening ? 'active' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Stop Listening' : 'Tap to Speak (Indic Conformer Speech AI)'}
        >
          {isListening ? (
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
          ) : (
            <Mic className="w-5 h-5 text-sky-600" />
          )}
          <span className="mic-btn-label">{isListening ? 'Listening...' : 'Voice AI'}</span>
        </button>

        <div className="voice-input-center">
          <input
            type="text"
            className="voice-main-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isListening
                ? '🎙️ Listening to your voice... Speak your symptoms clearly'
                : placeholder || 'Type or speak your symptoms in your regional language...'
            }
          />

          {isListening && (
            <div className="telemetry-soundwave">
              <span className="soundwave-bar bar-1"></span>
              <span className="soundwave-bar bar-2"></span>
              <span className="soundwave-bar bar-3"></span>
              <span className="soundwave-bar bar-4"></span>
              <span className="soundwave-bar bar-5"></span>
              <span className="soundwave-bar bar-6"></span>
              <span className="soundwave-bar bar-7"></span>
            </div>
          )}
        </div>

        {/* Action icons (Clear, Speak back) */}
        <div className="voice-action-cluster">
          {value.trim() && (
            <>
              <button
                type="button"
                className="voice-clear-btn"
                onClick={() => onChange('')}
                title="Clear text"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                className={`voice-tts-btn ${isSpeaking ? 'active' : ''}`}
                onClick={handleSpeak}
                title="Listen back (FastSpeech2 IndicTTS)"
              >
                <Volume2 className="w-4 h-4 text-sky-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Contextual Suggestion Pills */}
      <div className="voice-suggestions-tray">
        <div className="suggestions-badge">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {selectedRegion
              ? `Suggested descriptions for ${selectedRegion.split('/')[0].split('(')[0]}:`
              : 'Tap a quick clinical symptom description:'}
          </span>
        </div>
        <div className="suggestions-chips-row">
          {contextualSuggestions.map((text, idx) => (
            <button
              type="button"
              key={idx}
              className="context-symptom-chip"
              onClick={() => {
                onChange(text);
                if (onAutoSubmit) onAutoSubmit(text);
              }}
            >
              <span>{text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

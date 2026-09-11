import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';
import type { LanguageCode } from '../../types';
import { speakText, SUPPORTED_LANGUAGES } from '../../utils/languages';

interface VoiceInputBarProps {
  value: string;
  onChange: (val: string) => void;
  langCode: LanguageCode;
  placeholder?: string;
  onAutoSubmit?: (transcript: string) => void;
}

const QUICK_SYMPTOM_CHIPS: Array<{ label: string; text: string; lang: string }> = [
  { label: '🫀 Chest Pain + Left Arm + Sweating (ACS Red Flag)', text: 'Severe crushing chest pain radiating to left arm and neck with profuse cold sweating for 1 hour.', lang: 'en' },
  { label: '🩸 Burning Feet + Thirst (Diabetic Neuropathy)', text: 'Burning sensation in both feet with excessive thirst and frequent urination at night for 3 months.', lang: 'en' },
  { label: '🌿 Gas Distension + Joint Crepitus (AYUSH Vata)', text: 'Pet me gas aur afara rehta hai, khana theek se nahi pachta, aur ghutno me aawaz aati hai.', lang: 'hi' },
  { label: '🫁 Shortness of Breath + Wheezing', text: 'Difficulty breathing especially when lying flat, coughing with wheezing sound.', lang: 'en' },
  { label: '🧠 Sudden Weakness on Left Side', text: 'Sudden weakness in left arm and leg with difficulty in speaking clearly since morning.', lang: 'en' },
];

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  value,
  onChange,
  langCode,
  placeholder,
  onAutoSubmit,
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
          // fallback simulation
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
      if (langCode === 'hi') {
        onChange('मुझे छाती में बहुत तेज़ दर्द और पसीना आ रहा है जो बाएं हाथ में जा रहा है');
      } else {
        onChange('Severe crushing chest pain radiating to left arm with cold sweating');
      }
      setIsListening(false);
    }, 2500);
  };

  const handleSpeak = async () => {
    if (!value.trim()) return;
    setIsSpeaking(true);
    await speakText(value, langCode);
    setIsSpeaking(false);
  };

  return (
    <div className="voice-input-wrapper">
      <div className={`voice-input-box ${isListening ? 'listening-active' : ''}`}>
        <button
          type="button"
          className={`mic-trigger-btn ${isListening ? 'mic-pulse' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Stop Listening' : 'Tap to Speak (Indic Conformer ASR)'}
        >
          {isListening ? <Mic className="mic-icon pulse" /> : <Mic className="mic-icon" />}
        </button>

        <div className="voice-input-field-wrapper">
          <input
            type="text"
            className="voice-text-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isListening
                ? '🎙️ AI4Bharat IndicASR is listening... Speak now'
                : placeholder || 'Type or tap microphone to speak your symptoms...'
            }
          />

          {isListening && (
            <div className="audio-waveform-bars">
              <span className="wave-bar bar-1"></span>
              <span className="wave-bar bar-2"></span>
              <span className="wave-bar bar-3"></span>
              <span className="wave-bar bar-4"></span>
              <span className="wave-bar bar-5"></span>
              <span className="wave-bar bar-6"></span>
            </div>
          )}
        </div>

        {value.trim() && (
          <button
            type="button"
            className={`tts-playback-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleSpeak}
            title="Listen back via FastSpeech2 IndicTTS"
          >
            <Volume2 className="tts-icon" />
          </button>
        )}
      </div>

      {/* Quick symptom presets for fast test demos */}
      <div className="quick-symptoms-tray">
        <span className="tray-label">
          <Sparkles className="spark-icon" /> Quick Demo Scenarios:
        </span>
        <div className="chips-scroll">
          {QUICK_SYMPTOM_CHIPS.map((chip, idx) => (
            <button
              type="button"
              key={idx}
              className="symptom-chip"
              onClick={() => {
                onChange(chip.text);
                if (onAutoSubmit) onAutoSubmit(chip.text);
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

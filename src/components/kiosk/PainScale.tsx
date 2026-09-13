import React from 'react';
import { Activity, Zap, AlertTriangle, Sparkles } from 'lucide-react';

interface PainScaleProps {
  score: number;
  onChange: (score: number) => void;
  selectedCharacter?: string;
  onSelectCharacter?: (character: string) => void;
}

interface PainLevelMeta {
  score: number;
  label: string;
  hindi: string;
  emoji: string;
  color: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  desc: string;
}

const PAIN_METRICS: PainLevelMeta[] = [
  {
    score: 0,
    label: 'No Pain',
    hindi: 'दर्द नहीं',
    emoji: '😄',
    color: '#10b981',
    severity: 'Mild',
    desc: 'Completely comfortable, smiling, relaxed',
  },
  {
    score: 2,
    label: 'Mild Pain',
    hindi: 'हल्का दर्द',
    emoji: '🙂',
    color: '#22c55e',
    severity: 'Mild',
    desc: 'Noticeable twinge, easily tolerated, doesn’t interfere with tasks',
  },
  {
    score: 4,
    label: 'Moderate Pain',
    hindi: 'मध्यम दर्द',
    emoji: '😐',
    color: '#eab308',
    severity: 'Moderate',
    desc: 'Distracting ache, limits prolonged physical exertion',
  },
  {
    score: 6,
    label: 'Distressing Pain',
    hindi: 'कष्टदायी दर्द',
    emoji: '😣',
    color: '#f97316',
    severity: 'Moderate',
    desc: 'Hard to ignore or concentrate, interferes with sleep or eating',
  },
  {
    score: 8,
    label: 'Severe / Intense',
    hindi: 'तीव्र / असहनीय',
    emoji: '😫',
    color: '#ef4444',
    severity: 'Severe',
    desc: 'Excruciating, overwhelming sensation, urgent clinical relief needed',
  },
  {
    score: 10,
    label: 'Worst Possible',
    hindi: 'असहनीय आपातकाल',
    emoji: '😭',
    color: '#991b1b',
    severity: 'Critical',
    desc: 'Agonizing, incapacitating pain, priority emergency triage protocol',
  },
];

const PAIN_CHARACTERS = [
  { id: 'Crushing / Heavy pressure', label: 'Crushing / Heavy Pressure', hindi: 'दबाव या भारीपन', icon: '🪨', badge: 'High-Risk' },
  { id: 'Sharp / Stabbing', label: 'Sharp / Stabbing Piercing', hindi: 'तेज चुभन / सुई जैसा', icon: '⚡' },
  { id: 'Dull Ache', label: 'Constant Dull Ache', hindi: 'लगातार हल्का दर्द', icon: '⌛' },
  { id: 'Burning / Throbbing', label: 'Burning / Throbbing Pulse', hindi: 'जलन / टीस मारना', icon: '🔥' },
  { id: 'Colicky / Cramping', label: 'Colicky / Cramping Spasms', hindi: 'मरोड़दार / ऐंठन', icon: '🌀' },
];

export const PainScale: React.FC<PainScaleProps> = ({
  score,
  onChange,
  selectedCharacter,
  onSelectCharacter,
}) => {
  const currentMeta = PAIN_METRICS.reduce((prev, curr) =>
    Math.abs(curr.score - score) < Math.abs(prev.score - score) ? curr : prev
  );

  return (
    <div className="modern-painscale-card">
      {/* Top Clinical Header Bar */}
      <div className="painscale-header">
        <div className="header-left-title">
          <div className="pain-title-pill">
            <Activity className="w-3.5 h-3.5" style={{ color: currentMeta.color }} />
            <span className="overline-title">VAS SEVERITY GAUGE</span>
          </div>
          <h4 className="card-title">Pain Intensity & Sensation</h4>
          <p className="card-subtitle">
            Slide to rate pain severity from 0 (none) to 10 (worst imaginable)
          </p>
        </div>

        {/* Telemetry Numeric Dial & Emoji */}
        <div className="pain-telemetry-cluster">
          <div
            className="score-hero-display"
            style={{
              borderColor: currentMeta.color,
              boxShadow: `0 0 20px ${currentMeta.color}25`,
            }}
          >
            <span className="score-number" style={{ color: currentMeta.color }}>
              {score}
            </span>
            <span className="score-denom">/10</span>
          </div>

          <div className="score-desc-column">
            <div className="score-meta-badge" style={{ backgroundColor: `${currentMeta.color}18`, color: currentMeta.color }}>
              <span className="meta-emoji">{currentMeta.emoji}</span>
              <span className="meta-label">{currentMeta.label}</span>
            </div>
            <span className="meta-hindi">{currentMeta.hindi}</span>
          </div>
        </div>
      </div>

      {/* Wong-Baker Expressive Face Selector Deck */}
      <div className="wong-baker-deck">
        {PAIN_METRICS.map((item) => {
          const isSelected =
            score === item.score ||
            (item.score > 0 && Math.abs(score - item.score) < 1);

          return (
            <button
              type="button"
              key={item.score}
              className={`wb-face-tile ${isSelected ? 'active' : ''}`}
              onClick={() => onChange(item.score)}
              style={{
                borderColor: isSelected ? item.color : undefined,
                background: isSelected ? `${item.color}15` : undefined,
              }}
            >
              <span className="wb-emoji">{item.emoji}</span>
              <span className="wb-score" style={{ color: item.color }}>
                {item.score}
              </span>
              <span className="wb-label">{item.label.split(' ')[0]}</span>
              <span className="wb-hindi">{item.hindi}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Range Slider with Glowing Gradient Track */}
      <div className="vas-interactive-zone">
        <div className="slider-track-container">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={score}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="modern-vas-range"
            style={{
              accentColor: currentMeta.color,
            }}
          />
        </div>

        {/* Numeric Ticks */}
        <div className="slider-tick-strip">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => {
            const isCurrent = tick === score;
            return (
              <button
                type="button"
                key={tick}
                className={`tick-button ${isCurrent ? 'current' : ''}`}
                onClick={() => onChange(tick)}
                style={{
                  color: isCurrent ? currentMeta.color : undefined,
                  fontWeight: isCurrent ? 800 : 500,
                }}
              >
                {tick}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Sensation / Quality Selector */}
      {onSelectCharacter && (
        <div className="pain-character-section">
          <div className="character-header-row">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="character-title">Character of Sensation (दर्द का स्वरूप):</span>
          </div>
          <div className="character-pills-row">
            {PAIN_CHARACTERS.map((char) => {
              const isSelected = selectedCharacter === char.id;
              return (
                <button
                  type="button"
                  key={char.id}
                  className={`character-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectCharacter(char.id)}
                >
                  <span className="chip-icon">{char.icon}</span>
                  <span className="chip-label">{char.label}</span>
                  <span className="chip-hindi">({char.hindi})</span>
                  {char.badge && <span className="chip-badge-warn">{char.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

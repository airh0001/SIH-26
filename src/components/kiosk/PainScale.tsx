import React from 'react';

interface PainScaleProps {
  score: number;
  onChange: (score: number) => void;
}

const PAIN_LEVELS = [
  { score: 0, label: 'No Pain', hindi: 'दर्द नहीं', face: '😄', color: '#10b981', desc: 'Alert, smiling and comfortable' },
  { score: 2, label: 'Mild Pain', hindi: 'हल्का दर्द', face: '🙂', color: '#84cc16', desc: 'Noticeable but easily ignored' },
  { score: 4, label: 'Moderate Pain', hindi: 'मध्यम दर्द', face: '😐', color: '#eab308', desc: 'Interferes with tasks' },
  { score: 6, label: 'Severe Pain', hindi: 'तेज़ दर्द', face: '😣', color: '#f97316', desc: 'Hard to concentrate' },
  { score: 8, label: 'Very Severe', hindi: 'अत्यधिक दर्द', face: '😫', color: '#ef4444', desc: 'Disabling, unbearable' },
  { score: 10, label: 'Worst Possible', hindi: 'असहनीय दर्द', face: '😭', color: '#991b1b', desc: 'Agonizing, emergency triage' },
];

export const PainScale: React.FC<PainScaleProps> = ({ score, onChange }) => {
  const currentFace = PAIN_LEVELS.reduce((prev, curr) =>
    Math.abs(curr.score - score) < Math.abs(prev.score - score) ? curr : prev
  );

  return (
    <div className="pain-scale-card">
      <div className="pain-scale-header">
        <div className="pain-score-badge" style={{ backgroundColor: currentFace.color }}>
          <span className="pain-score-num">{score}</span>
          <span className="pain-score-max">/ 10</span>
        </div>
        <div className="pain-score-info">
          <div className="pain-label-row">
            <span className="pain-label-en">{currentFace.label}</span>
            <span className="pain-label-hi">({currentFace.hindi})</span>
          </div>
          <p className="pain-desc">{currentFace.desc}</p>
        </div>
        <div className="pain-face-large">{currentFace.face}</div>
      </div>

      {/* Wong-Baker Faces Row */}
      <div className="wong-baker-row">
        {PAIN_LEVELS.map((item) => {
          const isActive = score === item.score || (item.score > 0 && Math.abs(score - item.score) < 1);
          return (
            <button
              type="button"
              key={item.score}
              className={`face-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(item.score)}
              style={{
                borderColor: isActive ? item.color : 'transparent',
                backgroundColor: isActive ? `${item.color}20` : 'transparent',
              }}
            >
              <span className="face-emoji">{item.face}</span>
              <span className="face-score-num" style={{ color: item.color }}>{item.score}</span>
              <span className="face-short-label">{item.hindi}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive VAS Slider */}
      <div className="vas-slider-wrapper">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={score}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="vas-range-slider"
          style={{
            accentColor: currentFace.color,
          }}
        />
        <div className="vas-slider-ticks">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => (
            <span
              key={tick}
              className={`tick-mark ${tick === score ? 'active' : ''}`}
              onClick={() => onChange(tick)}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

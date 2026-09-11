import React from 'react';

interface BodyMapProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

interface RegionItem {
  id: string;
  label: string;
  hindiLabel: string;
  icon: string;
  cx: number;
  cy: number;
  radius: number;
}

const BODY_REGIONS: RegionItem[] = [
  { id: 'Head & Neck', label: 'Head & Neck', hindiLabel: 'सिर और गर्दन', icon: '🧠', cx: 150, cy: 45, radius: 24 },
  { id: 'Central Chest (Retrosternal)', label: 'Chest / Heart / Lungs', hindiLabel: 'छाती और फेफड़े', icon: '❤️', cx: 150, cy: 110, radius: 28 },
  { id: 'Upper Abdomen / Epigastric', label: 'Upper Abdomen / Stomach', hindiLabel: 'पेट का ऊपरी भाग', icon: '🫄', cx: 150, cy: 170, radius: 24 },
  { id: 'Lower Abdomen & Pelvis', label: 'Lower Abdomen / Bladder', hindiLabel: 'पेट का निचला भाग', icon: '🩺', cx: 150, cy: 220, radius: 22 },
  { id: 'Left Arm & Shoulder', label: 'Left Arm & Shoulder', hindiLabel: 'बायाँ हाथ और कंधा', icon: '💪', cx: 90, cy: 130, radius: 20 },
  { id: 'Right Arm & Shoulder', label: 'Right Arm & Shoulder', hindiLabel: 'दायाँ हाथ और कंधा', icon: '💪', cx: 210, cy: 130, radius: 20 },
  { id: 'Bilateral Lower Limbs & Knees', label: 'Knees & Legs', hindiLabel: 'घुटने और पैर', icon: '🦵', cx: 150, cy: 300, radius: 26 },
  { id: 'Feet & Ankles', label: 'Feet / Burning Soles', hindiLabel: 'पैर के तलवे और टखने', icon: '🦶', cx: 150, cy: 380, radius: 22 },
  { id: 'Back & Spine', label: 'Back & Spine', hindiLabel: 'कमर और रीढ़ की हड्डी', icon: '🦴', cx: 150, cy: 140, radius: 22 },
];

export const BodyMap: React.FC<BodyMapProps> = ({ selectedRegion, onSelectRegion }) => {
  return (
    <div className="body-map-container">
      <div className="body-map-header">
        <h4 className="body-map-title">Interactive Anatomical Body Map</h4>
        <p className="body-map-subtitle">Touch the affected anatomical zone on the diagram or select below</p>
      </div>

      <div className="body-map-layout">
        {/* SVG Anatomical Diagram */}
        <div className="body-map-svg-wrapper">
          <svg viewBox="0 0 300 430" className="body-silhouette-svg">
            {/* Ambient Silhouette Glow */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Stylized Human Body Silhouette */}
            {/* Head */}
            <circle cx="150" cy="45" r="30" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2" />
            {/* Neck */}
            <rect x="142" y="75" width="16" height="15" rx="3" fill="#334155" />
            {/* Torso */}
            <path
              d="M 105,90 L 195,90 L 180,240 L 120,240 Z"
              fill="url(#bodyGrad)"
              stroke="#64748b"
              strokeWidth="2"
              rx="10"
            />
            {/* Left Arm */}
            <path
              d="M 105,90 L 70,170 L 60,240 L 75,245 L 85,175 L 115,105 Z"
              fill="url(#bodyGrad)"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Right Arm */}
            <path
              d="M 195,90 L 230,170 L 240,240 L 225,245 L 215,175 L 185,105 Z"
              fill="url(#bodyGrad)"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Left Leg */}
            <path
              d="M 120,240 L 115,330 L 110,400 L 130,405 L 138,335 L 145,240 Z"
              fill="url(#bodyGrad)"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Right Leg */}
            <path
              d="M 180,240 L 185,330 L 190,400 L 170,405 L 162,335 L 155,240 Z"
              fill="url(#bodyGrad)"
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* Interactive Hotspot Targets */}
            {BODY_REGIONS.map((region) => {
              const isSelected = selectedRegion.toLowerCase().includes(region.id.toLowerCase().split(' ')[0]);
              return (
                <g
                  key={region.id}
                  className={`hotspot-group ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectRegion(region.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer pulse wave if selected */}
                  {isSelected && (
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r={region.radius + 12}
                      className="hotspot-pulse"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      opacity="0.8"
                    />
                  )}
                  {/* Target Circle */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={region.radius}
                    fill={isSelected ? '#ef4444' : '#0284c7'}
                    fillOpacity={isSelected ? 0.75 : 0.35}
                    stroke={isSelected ? '#fca5a5' : '#38bdf8'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />
                  <text
                    x={region.cx}
                    y={region.cy + 5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="700"
                    pointerEvents="none"
                  >
                    {region.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Region Selector Pills */}
        <div className="body-region-pills">
          <div className="pills-grid">
            {BODY_REGIONS.map((reg) => {
              const isSelected = selectedRegion.toLowerCase().includes(reg.id.toLowerCase().split(' ')[0]);
              return (
                <button
                  type="button"
                  key={reg.id}
                  className={`region-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectRegion(reg.id)}
                >
                  <span className="pill-icon">{reg.icon}</span>
                  <div className="pill-texts">
                    <span className="pill-primary">{reg.label}</span>
                    <span className="pill-secondary">{reg.hindiLabel}</span>
                  </div>
                  {isSelected && <span className="pill-checkmark">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import {
  Check,
  RotateCw,
  Search,
  Sparkles,
  Activity,
  Plus,
} from 'lucide-react';

export interface BodyRegion {
  id: string;
  label: string;
  hindiLabel: string;
  system: string;
  category: 'head' | 'chest' | 'abdomen' | 'limbs' | 'spine';
  view: 'front' | 'back';
  icon: string;
  cx: number;
  cy: number;
  r: number;
  commonSymptoms: string[];
  colorTheme?: string;
}

export const ANATOMICAL_REGIONS: BodyRegion[] = [
  // FRONT VIEW
  {
    id: 'Head & Neck',
    label: 'Head, Brain & Forehead',
    hindiLabel: 'सिर, माथा और मस्तिष्क',
    system: 'Neurological / Cranial',
    category: 'head',
    view: 'front',
    icon: '🧠',
    cx: 200,
    cy: 62,
    r: 34,
    commonSymptoms: ['Severe headache / Migraine', 'Dizziness or Vertigo', 'Throbbing temple pain', 'Lightheadedness'],
  },
  {
    id: 'Eyes, ENT & Face',
    label: 'Eyes, Ears, Nose & Throat',
    hindiLabel: 'आँख, कान, नाक और चेहरा',
    system: 'ENT / Craniofacial',
    category: 'head',
    view: 'front',
    icon: '👁️',
    cx: 200,
    cy: 96,
    r: 22,
    commonSymptoms: ['Blurred vision', 'Earache or ringing (Tinnitus)', 'Sinus facial pressure', 'Sore throat / Dysphagia'],
  },
  {
    id: 'Central Chest (Retrosternal)',
    label: 'Chest & Precordium (Heart)',
    hindiLabel: 'छाती और दिल (सीने में दर्द)',
    system: 'Cardiovascular & Thoracic',
    category: 'chest',
    view: 'front',
    icon: '🫀',
    cx: 200,
    cy: 168,
    r: 34,
    commonSymptoms: ['Crushing / Heavy retrosternal tightness', 'Left arm and jaw radiation', 'Profuse cold sweating', 'Rapid palpitations'],
  },
  {
    id: 'Bilateral Lungs & Ribs',
    label: 'Lungs, Ribcage & Breathing',
    hindiLabel: 'फेफड़े, पसलियां और सांस',
    system: 'Pulmonary & Respiratory',
    category: 'chest',
    view: 'front',
    icon: '🫁',
    cx: 148,
    cy: 172,
    r: 26,
    commonSymptoms: ['Shortness of breath (Dyspnea)', 'Pleuritic pain on deep breath', 'Wheezing / Asthmatic tightness', 'Cough with sputum'],
  },
  {
    id: 'Upper Abdomen / Epigastric',
    label: 'Upper Abdomen (Stomach & Liver)',
    hindiLabel: 'पेट का ऊपरी हिस्सा (आमाशय/गैस)',
    system: 'Gastrointestinal & Hepatic',
    category: 'abdomen',
    view: 'front',
    icon: '🫄',
    cx: 200,
    cy: 232,
    r: 32,
    commonSymptoms: ['Burning acidity / GERD', 'Severe post-prandial fullness', 'Epigastric gnawing pain', 'Nausea and vomiting'],
  },
  {
    id: 'Lower Abdomen & Pelvis',
    label: 'Lower Abdomen, Groin & Pelvis',
    hindiLabel: 'पेट का निचला भाग और श्रोणि',
    system: 'Gastrointestinal & Urogenital',
    category: 'abdomen',
    view: 'front',
    icon: '🩺',
    cx: 200,
    cy: 288,
    r: 30,
    commonSymptoms: ['Colicky lower abdominal cramps', 'Burning micturition (Dysuria)', 'Constipation / Irregular bowels', 'Pelvic pressure'],
  },
  {
    id: 'Left Arm & Shoulder',
    label: 'Left Shoulder & Bicep',
    hindiLabel: 'बायाँ कंधा और बांह',
    system: 'Musculoskeletal & Vascular',
    category: 'limbs',
    view: 'front',
    icon: '💪',
    cx: 106,
    cy: 182,
    r: 25,
    commonSymptoms: ['Referred angina pain', 'Frozen shoulder stiffness', 'Bicep tenderness', 'Arm weakness or numbness'],
  },
  {
    id: 'Right Arm & Shoulder',
    label: 'Right Shoulder & Bicep',
    hindiLabel: 'दायाँ कंधा और बांह',
    system: 'Musculoskeletal',
    category: 'limbs',
    view: 'front',
    icon: '💪',
    cx: 294,
    cy: 182,
    r: 25,
    commonSymptoms: ['Rotator cuff impingement', 'Shoulder joint pain', 'Inability to lift arm', 'Muscle pull'],
  },
  {
    id: 'Wrists & Hands',
    label: 'Wrists, Palms & Fingers',
    hindiLabel: 'कलाई, हथेलियां और उंगलियां',
    system: 'Nerve & Small Joints',
    category: 'limbs',
    view: 'front',
    icon: '🖐️',
    cx: 72,
    cy: 288,
    r: 22,
    commonSymptoms: ['Carpal tunnel tingling', 'Joint swelling & morning stiffness', 'Tremors or weakness', 'Numb fingertips'],
  },
  {
    id: 'Bilateral Lower Limbs & Knees',
    label: 'Knees & Quadriceps',
    hindiLabel: 'घुटने और जांघें (संधिवात)',
    system: 'Musculoskeletal (Joints)',
    category: 'limbs',
    view: 'front',
    icon: '🦵',
    cx: 160,
    cy: 420,
    r: 26,
    commonSymptoms: ['Knee joint crepitus / Sandhivata', 'Pain while climbing stairs', 'Swelling with morning stiffness', 'Quadricep strain'],
  },
  {
    id: 'Feet & Ankles',
    label: 'Feet, Soles & Ankles',
    hindiLabel: 'पैर के तलवे, टखने और अंगूठे',
    system: 'Peripheral Neuropathy & Joints',
    category: 'limbs',
    view: 'front',
    icon: '🦶',
    cx: 156,
    cy: 508,
    r: 24,
    commonSymptoms: ['Burning sole sensation (Neuropathy)', 'Ankle sprain / Swelling', 'Plantar fasciitis heel pain', 'Gouty great toe tenderness'],
  },

  // BACK VIEW
  {
    id: 'Cervical Spine & Neck',
    label: 'Cervical Spine & Occiput',
    hindiLabel: 'गर्दन का पिछला भाग व सर्वाइकल',
    system: 'Spine & Cervical Vertebrae',
    category: 'spine',
    view: 'back',
    icon: '🦴',
    cx: 200,
    cy: 90,
    r: 26,
    commonSymptoms: ['Cervical spondylosis stiffness', 'Pain radiating down shoulder', 'Tight neck spasm', 'Tension headache'],
  },
  {
    id: 'Upper Back & Scapula',
    label: 'Upper Back & Shoulder Blades',
    hindiLabel: 'ऊपरी पीठ और कंधे की हड्डी',
    system: 'Thoracic Musculoskeletal',
    category: 'back',
    view: 'back',
    icon: '🥋',
    cx: 200,
    cy: 162,
    r: 34,
    commonSymptoms: ['Interscapular muscle knots', 'Postural myofascial pain', 'Upper back burning', 'Pain between shoulders'],
  },
  {
    id: 'Back & Spine',
    label: 'Mid-Thoracic Spine',
    hindiLabel: 'मध्य रीढ़ की हड्डी',
    system: 'Thoracic Spine',
    category: 'spine',
    view: 'back',
    icon: '│',
    cx: 200,
    cy: 220,
    r: 25,
    commonSymptoms: ['Mid-back persistent ache', 'Pain exacerbated by prolonged sitting', 'Spinal midline tenderness', 'Rib cage band-like tightness'],
  },
  {
    id: 'Lower Back & Lumbar',
    label: 'Lower Back & Lumbar Spine (L1-L5)',
    hindiLabel: 'निचली कमर / लम्बर (कटिशूल)',
    system: 'Lumbar Spine & Sciatic Nerve',
    category: 'spine',
    view: 'back',
    icon: '🩻',
    cx: 200,
    cy: 278,
    r: 32,
    commonSymptoms: ['Acute lumbago / Spasm', 'Sciatica pain shooting down leg', 'Stiffness when bending forward', 'Disc compression discomfort'],
  },
  {
    id: 'Hips & Gluteal Area',
    label: 'Hips, Sacrum & Gluteal Area',
    hindiLabel: 'कूल्हा और नितंब',
    system: 'Pelvic Girdle & Sacroiliac',
    category: 'back',
    view: 'back',
    icon: '🍑',
    cx: 200,
    cy: 334,
    r: 32,
    commonSymptoms: ['Sacroiliitis joint pain', 'Piriformis syndrome hip ache', 'Deep gluteal tightness', 'Difficulty sitting'],
  },
  {
    id: 'Posterior Thighs & Calves',
    label: 'Hamstrings & Calves',
    hindiLabel: 'पिंडली और जांघ का पिछला भाग',
    system: 'Musculoskeletal & Vascular',
    category: 'limbs',
    view: 'back',
    icon: '🦵',
    cx: 160,
    cy: 450,
    r: 28,
    commonSymptoms: ['Calf cramps / Claudication', 'Achilles tendon tightness', 'Hamstring strain', 'Varicose vein heaviness'],
  },
];

interface BodyMapProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  painScore?: number;
  onAddSymptomTag?: (tag: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  selectedRegion,
  onSelectRegion,
  painScore = 5,
  onAddSymptomTag,
}) => {
  const currentRegion = useMemo(() => {
    return (
      ANATOMICAL_REGIONS.find((r) => r.id === selectedRegion) ||
      ANATOMICAL_REGIONS.find((r) => r.id === 'Central Chest (Retrosternal)') ||
      ANATOMICAL_REGIONS[0]
    );
  }, [selectedRegion]);

  const [view, setView] = useState<'front' | 'back'>(currentRegion.view || 'front');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic glow color based on painScore
  const painColor = useMemo(() => {
    if (painScore >= 8) return '#ef4444'; // Crimson red
    if (painScore >= 6) return '#f97316'; // Vivid orange
    if (painScore >= 4) return '#f59e0b'; // Amber yellow
    return '#0284c7'; // Medical Sky blue
  }, [painScore]);

  const handleSelect = (region: BodyRegion) => {
    setView(region.view);
    onSelectRegion(region.id);
  };

  const visibleRegions = useMemo(() => {
    return ANATOMICAL_REGIONS.filter((r) => {
      const matchesView = r.view === view;
      const matchesCat = activeCategory === 'all' || r.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hindiLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesView && matchesCat && matchesSearch;
    });
  }, [view, activeCategory, searchQuery]);

  return (
    <div className="modern-bodymap-card">
      {/* Top Header Controls */}
      <div className="bodymap-top-header">
        <div className="bodymap-header-title">
          <div className="header-icon-pill">
            <Activity className="w-4 h-4 text-sky-500" />
            <span className="overline-pill">ANATOMICAL LOCATOR</span>
          </div>
          <h4 className="title-text">Interactive Body Map</h4>
          <p className="subtitle-text">
            Touch or click on the anatomical model to pinpoint pain or select from clinical list
          </p>
        </div>

        {/* View Switch 3D Flip Toggle */}
        <div className="bodymap-view-switcher">
          <button
            type="button"
            className={`view-toggle-btn ${view === 'front' ? 'active' : ''}`}
            onClick={() => setView('front')}
          >
            <span>Anterior (Front)</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${view === 'back' ? 'active' : ''}`}
            onClick={() => setView('back')}
          >
            <span>Posterior (Back)</span>
          </button>
          <button
            type="button"
            className="view-rotate-icon-btn"
            onClick={() => setView(view === 'front' ? 'back' : 'front')}
            title="Flip 360° Perspective"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Category Filter Bar */}
      <div className="bodymap-filter-bar">
        {[
          { id: 'all', label: 'All Regions' },
          { id: 'head', label: 'Head & Neck' },
          { id: 'chest', label: 'Chest & Lungs' },
          { id: 'abdomen', label: 'Abdomen & Pelvis' },
          { id: 'spine', label: 'Spine & Back' },
          { id: 'limbs', label: 'Arms & Legs' },
        ].map((cat) => (
          <button
            type="button"
            key={cat.id}
            className={`cat-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage */}
      <div className="bodymap-stage-grid">
        {/* Left Column: High-Fidelity SVG Anatomical Viewport */}
        <div className="bodymap-viewport-panel">
          {/* Active view label */}
          <div className="viewport-overlay-legend">
            <div className="legend-indicator">
              <span className="view-indicator" style={{ backgroundColor: painColor }} />
              <span className="legend-label">
                {view === 'front' ? 'Anterior View (सामने)' : 'Posterior View (पीछे)'}
              </span>
            </div>
            <span className="interactive-hint">Tap any glowing zone</span>
          </div>

          <div className="svg-canvas-container">
            <svg
              viewBox="0 0 400 560"
              className="medical-anatomy-svg"
              aria-label="Interactive Human Anatomical Map"
            >
              <defs>
                {/* Silhouette Soft Lighting Gradient */}
                <linearGradient id="bodySilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                <linearGradient id="organGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
                </linearGradient>

                {/* Dynamic Selected Zone Glow Filter */}
                <filter id="hotspotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Anatomical Human Vector Body */}
              <g className="anatomical-silhouette-group">
                {view === 'front' ? (
                  <>
                    {/* Head & Cranium */}
                    <path
                      d="M200 24 C174 24 158 44 158 72 C158 98 174 116 200 118 C226 116 242 98 242 72 C242 44 226 24 200 24 Z"
                      className="anatomy-base-mesh"
                    />
                    {/* Ears */}
                    <path d="M158 64 C154 64 152 74 156 82 C158 84 159 84 159 84" className="anatomy-contour-line" />
                    <path d="M242 64 C246 64 248 74 244 82 C242 84 241 84 241 84" className="anatomy-contour-line" />

                    {/* Neck */}
                    <path d="M178 114 L176 138 L224 138 L222 114 Z" className="anatomy-base-mesh" />

                    {/* Torso: Shoulders, Chest, Waist, Hips */}
                    <path
                      d="M176 138 C148 140 120 148 98 164 C92 168 88 174 90 182 L106 240 C108 248 114 252 120 248 L138 214 C140 210 146 210 146 216 L144 290 C144 316 156 338 180 344 L180 348 L200 350 L220 348 L220 344 C244 338 256 316 256 290 L254 216 C254 210 260 210 262 214 L280 248 C286 252 292 248 294 240 L310 182 C312 174 308 168 302 164 C280 148 252 140 224 138 Z"
                      className="anatomy-base-mesh"
                    />

                    {/* Left Forearm & Hand */}
                    <path
                      d="M106 240 L82 308 C80 314 74 322 68 334 C64 342 70 350 78 348 L96 322 L118 250 Z"
                      className="anatomy-base-mesh"
                    />

                    {/* Right Forearm & Hand */}
                    <path
                      d="M294 240 L318 308 C320 314 326 322 332 334 C336 342 330 350 322 348 L304 322 L282 250 Z"
                      className="anatomy-base-mesh"
                    />

                    {/* Bilateral Legs & Thighs */}
                    {/* Left Leg */}
                    <path
                      d="M150 340 C140 370 138 410 142 444 C144 456 142 478 144 506 C144 516 138 522 136 526 C134 532 140 536 150 536 L174 536 C180 536 184 530 182 522 L178 506 C180 478 178 456 180 444 C184 410 182 370 180 346 Z"
                      className="anatomy-base-mesh"
                    />
                    {/* Right Leg */}
                    <path
                      d="M250 340 C260 370 262 410 258 444 C256 456 258 478 256 506 C256 516 262 522 264 526 C266 532 260 536 250 536 L226 536 C220 536 216 530 218 522 L222 506 C220 478 222 456 220 444 C216 410 218 370 220 346 Z"
                      className="anatomy-base-mesh"
                    />

                    {/* Subtle Anatomical Lines (Clavicles, Sternum, Rib Contours) */}
                    <path d="M176 140 Q200 148 224 140" className="anatomy-contour-line" />
                    <line x1="200" y1="146" x2="200" y2="210" className="anatomy-contour-line" strokeDasharray="2 3" />
                    <path d="M168 180 Q200 196 232 180" className="anatomy-contour-line" />
                    <circle cx="200" cy="270" r="2.5" fill="#94a3b8" />
                  </>
                ) : (
                  <>
                    {/* BACK VIEW */}
                    {/* Head Back */}
                    <path
                      d="M200 24 C174 24 158 44 158 72 C158 98 174 116 200 118 C226 116 242 98 242 72 C242 44 226 24 200 24 Z"
                      className="anatomy-base-mesh"
                    />
                    {/* Neck Back */}
                    <path d="M178 114 L174 138 L226 138 L222 114 Z" className="anatomy-base-mesh" />

                    {/* Back Torso & Shoulders */}
                    <path
                      d="M174 138 C146 140 118 148 96 164 C90 168 86 174 88 182 L104 240 C106 248 112 252 118 248 L136 214 C138 210 144 210 144 216 L142 290 C142 320 156 344 180 348 L180 350 L200 352 L220 350 L220 348 C244 344 258 320 258 290 L256 216 C256 210 262 210 264 214 L282 248 C288 252 294 248 296 240 L312 182 C314 174 310 168 304 164 C282 148 254 140 226 138 Z"
                      className="anatomy-base-mesh"
                    />

                    {/* Arms Back */}
                    <path
                      d="M104 240 L80 308 C78 314 72 322 66 334 C62 342 68 350 76 348 L94 322 L116 250 Z"
                      className="anatomy-base-mesh"
                    />
                    <path
                      d="M296 240 L320 308 C322 314 328 322 334 334 C338 342 332 350 324 348 L306 322 L284 250 Z"
                      className="anatomy-base-mesh"
                    />

                    {/* Spinal Column Contours (Cervical, Thoracic, Lumbar) */}
                    <line x1="200" y1="126" x2="200" y2="330" className="spine-back-guide" />

                    {/* Scapula Contours */}
                    <path d="M152 152 Q172 168 164 196" className="anatomy-contour-line" />
                    <path d="M248 152 Q228 168 236 196" className="anatomy-contour-line" />

                    {/* Gluteal Creases & Back Legs */}
                    <path d="M170 338 Q200 354 230 338" className="anatomy-contour-line" />
                    {/* Left Leg Back */}
                    <path
                      d="M150 344 C140 372 138 412 142 444 C144 456 142 478 144 506 C144 516 138 522 136 526 C134 532 140 536 150 536 L174 536 C180 536 184 530 182 522 L178 506 C180 478 178 456 180 444 C184 410 182 370 180 346 Z"
                      className="anatomy-base-mesh"
                    />
                    {/* Right Leg Back */}
                    <path
                      d="M250 344 C260 372 262 412 258 444 C256 456 258 478 256 506 C256 516 262 522 264 526 C266 532 260 536 250 536 L226 536 C220 536 216 530 218 522 L222 506 C220 478 222 456 220 444 C216 410 218 370 220 346 Z"
                      className="anatomy-base-mesh"
                    />
                    <path d="M156 444 Q165 448 174 444" className="anatomy-contour-line" />
                    <path d="M226 444 Q235 448 244 444" className="anatomy-contour-line" />
                  </>
                )}
              </g>

              {/* Hotspot Interactive Layer for Current View */}
              {ANATOMICAL_REGIONS.filter((r) => r.view === view).map((region) => {
                const isSelected = region.id === currentRegion.id;
                const isHovered = hoveredRegion?.id === region.id;

                return (
                  <g
                    key={region.id}
                    className={`interactive-hotspot ${isSelected ? 'selected' : ''} ${
                      isHovered ? 'hovered' : ''
                    }`}
                    onClick={() => handleSelect(region)}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Zone Disc / Halo */}
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r={region.r}
                      className="hotspot-base-circle"
                      style={{
                        fill: isSelected
                          ? `${painColor}2a`
                          : isHovered
                          ? 'rgba(14, 165, 233, 0.22)'
                          : 'rgba(226, 232, 240, 0.45)',
                        stroke: isSelected ? painColor : isHovered ? '#0284c7' : '#94a3b8',
                        strokeWidth: isSelected ? 2.5 : 1.2,
                        filter: isSelected ? 'url(#hotspotGlow)' : 'none',
                      }}
                    />

                    {/* Hotspot Center Beacon Dot */}
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r={isSelected ? 6 : 4}
                      className="hotspot-center-dot"
                      style={{
                        fill: isSelected ? painColor : isHovered ? '#0284c7' : '#64748b',
                      }}
                    />

                    {/* Icon or Symbol inside hotspot */}
                    {isSelected && (
                      <text
                        x={region.cx}
                        y={region.cy - region.r - 8}
                        textAnchor="middle"
                        className="hotspot-svg-label"
                        fill={painColor}
                      >
                        {region.icon} {region.label.split(' ')[0]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Column: Dynamic Region Inspector & Clinical Cards */}
        <div className="bodymap-inspector-panel">
          {/* Active Region Clinical Spotlight Banner */}
          <div
            className="selected-spotlight-card"
            style={{
              borderLeftColor: painColor,
            }}
          >
            <div className="spotlight-top-row">
              <div className="spotlight-icon-box">
                <span>{currentRegion.icon}</span>
              </div>
              <div className="spotlight-title-group">
                <span className="spotlight-system-tag">{currentRegion.system}</span>
                <h3 className="spotlight-name">{currentRegion.label}</h3>
                <span className="spotlight-hindi">{currentRegion.hindiLabel}</span>
              </div>
              <div className="spotlight-badge" style={{ backgroundColor: `${painColor}15`, color: painColor }}>
                <Check className="w-4 h-4" />
                <span>Selected</span>
              </div>
            </div>

            {/* Quick-Symptom Suggestion Chips tied to this exact body region */}
            <div className="spotlight-symptoms-tray">
              <div className="tray-label-row">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Frequently associated symptoms with this region:</span>
              </div>
              <div className="suggested-chips-wrap">
                {currentRegion.commonSymptoms.map((sym, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="symptom-tag-pill"
                    onClick={() => onAddSymptomTag && onAddSymptomTag(sym)}
                    title="Click to add symptom to clinical notes"
                  >
                    <Plus className="w-3 h-3 text-sky-500" />
                    <span>{sym}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Region Quick Search & Selector Grid */}
          <div className="region-list-container">
            <div className="region-search-row">
              <div className="search-input-wrap">
                <Search className="search-icon w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search body part (e.g. Chest, Knee, सिर)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="region-search-field"
                />
              </div>
              <span className="regions-count-pill">{visibleRegions.length} available</span>
            </div>

            <div className="regions-cards-grid">
              {visibleRegions.map((region) => {
                const isSelected = region.id === currentRegion.id;
                return (
                  <button
                    type="button"
                    key={region.id}
                    className={`region-select-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelect(region)}
                    style={{
                      borderColor: isSelected ? painColor : undefined,
                    }}
                  >
                    <div className="item-icon-circle" style={{ backgroundColor: isSelected ? `${painColor}20` : undefined }}>
                      <span>{region.icon}</span>
                    </div>
                    <div className="item-details">
                      <span className="item-en">{region.label}</span>
                      <span className="item-hi">{region.hindiLabel}</span>
                    </div>
                    {isSelected && (
                      <div className="item-check" style={{ color: painColor }}>
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

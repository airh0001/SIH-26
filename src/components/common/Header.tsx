import React from 'react';
import {
  HeartPulse,
  Monitor,
  PhoneCall,
  Stethoscope,
  SplitSquareVertical,
  AlertTriangle,
  Cpu,
  Radio,
  Sun,
} from 'lucide-react';
import type { PatientEncounter } from '../../types';

interface HeaderProps {
  currentView: 'KIOSK' | 'IVR' | 'DOCTOR' | 'DUAL';
  onSelectView: (view: 'KIOSK' | 'IVR' | 'DOCTOR' | 'DUAL') => void;
  encounters: PatientEncounter[];
}

export const Header: React.FC<HeaderProps> = ({ currentView, onSelectView, encounters }) => {
  const criticalCount = encounters.filter((e) => e.redFlag.triagePriority === 'P1_EMERGENCY').length;

  return (
    <header className="app-global-header">
      <div className="header-left">
        <div className="app-brand-pill">
          <div className="brand-logo-gem">
            <HeartPulse className="brand-icon" />
          </div>
          <div className="brand-title-group">
            <div className="brand-name-row">
              <span className="brand-name">ABHA PRO</span>
              <span className="brand-version">v2.5 (Clinical Light)</span>
            </div>
            <span className="brand-subtitle">Multimodal AI OPD Triage & Clinical Workstation</span>
          </div>
        </div>

        {/* ABDM & Edge Status Indicators */}
        <div className="status-indicators-strip">
          <div className="status-pill abdm-pill" title="ABDM Gateway M1, M2 & M3 Active">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>ABDM Gateway: Live</span>
          </div>
          <div className="status-pill edge-pill" title="On-Premise Clinical AI Model Ready">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span>Edge AI (Med-Llama-3)</span>
          </div>
        </div>
      </div>

      {/* Center View Selector Navigation */}
      <nav className="header-center-nav">
        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'DOCTOR' ? 'active' : ''}`}
          onClick={() => onSelectView('DOCTOR')}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor's EMR</span>
          {encounters.length > 0 && <span className="nav-badge">{encounters.length}</span>}
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'KIOSK' ? 'active' : ''}`}
          onClick={() => onSelectView('KIOSK')}
        >
          <Monitor className="w-4 h-4" />
          <span>Patient Kiosk</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'IVR' ? 'active' : ''}`}
          onClick={() => onSelectView('IVR')}
        >
          <PhoneCall className="w-4 h-4" />
          <span>IVR Phone (1075)</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'DUAL' ? 'active' : ''}`}
          onClick={() => onSelectView('DUAL')}
        >
          <SplitSquareVertical className="w-4 h-4" />
          <span>Dual Screen Sync</span>
        </button>
      </nav>

      {/* Right Emergency Alert Status & Mode Pill */}
      <div className="header-right">
        {criticalCount > 0 && (
          <div className="critical-header-alert">
            <AlertTriangle className="w-4 h-4" />
            <span>{criticalCount} P1 Emergency Alert</span>
          </div>
        )}

        <div className="theme-status-chip">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Clinical Light Mode</span>
        </div>
      </div>
    </header>
  );
};

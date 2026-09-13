import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { KioskView } from './components/kiosk/KioskView';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { IvrMobileSimulator } from './components/ivr/IvrMobileSimulator';
import { INITIAL_PATIENTS } from './store/encounterStore';
import type { PatientEncounter, SoapNote } from './types';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'KIOSK' | 'IVR' | 'DOCTOR' | 'DUAL'>('KIOSK');
  const [encounters, setEncounters] = useState<PatientEncounter[]>(INITIAL_PATIENTS);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>(INITIAL_PATIENTS[0]?.id || '');

  const handleCompleteEncounter = (newEncounter: PatientEncounter) => {
    // Add to top of queue
    setEncounters((prev) => [newEncounter, ...prev]);
    setSelectedEncounterId(newEncounter.id);
  };

  const handleCommitEncounter = (id: string, updatedSoap: SoapNote) => {
    setEncounters((prev) =>
      prev.map((enc) =>
        enc.id === id
          ? {
              ...enc,
              status: 'COMPLETED',
              soapNote: updatedSoap,
            }
          : enc
      )
    );
  };

  return (
    <div className="app-root-container">
      <Header
        currentView={viewMode}
        onSelectView={setViewMode}
        encounters={encounters}
      />

      <div className="app-viewport">
        {viewMode === 'KIOSK' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <KioskView onCompleteEncounter={handleCompleteEncounter} />
          </div>
        )}

        {viewMode === 'IVR' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <IvrMobileSimulator
              onBookedEncounter={handleCompleteEncounter}
              onViewDoctorQueue={() => setViewMode('DOCTOR')}
            />
          </div>
        )}

        {viewMode === 'DOCTOR' && (
          <DoctorDashboard
            encounters={encounters}
            selectedEncounterId={selectedEncounterId}
            onSelectEncounter={setSelectedEncounterId}
            onCommitEncounter={handleCommitEncounter}
          />
        )}

        {viewMode === 'DUAL' && (
          <div className="dual-split-viewport">
            <div className="dual-pane kiosk-side">
              <KioskView onCompleteEncounter={handleCompleteEncounter} />
            </div>
            <div className="dual-pane doctor-side">
              <DoctorDashboard
                encounters={encounters}
                selectedEncounterId={selectedEncounterId}
                onSelectEncounter={setSelectedEncounterId}
                onCommitEncounter={handleCommitEncounter}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

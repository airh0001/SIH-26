import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertOctagon,
  Clock,
  FileCheck2,
  Copy,
  Download,
  Activity,
  Calendar,
  Sparkles,
  FileText,
  Send,
  Stethoscope,
  Heart,
  Droplet,
  TrendingUp,
  Printer,
  Plus,
  Trash2,
  CheckCircle,
  Search,
  Thermometer,
} from 'lucide-react';
import type { PatientEncounter, SoapNote } from '../../types';
import { assembleChronologicalTimeline } from '../../services/documentAi';

interface DoctorDashboardProps {
  encounters: PatientEncounter[];
  selectedEncounterId: string;
  onSelectEncounter: (id: string) => void;
  onCommitEncounter: (id: string, updatedSoap: SoapNote) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  encounters,
  selectedEncounterId,
  onSelectEncounter,
  onCommitEncounter,
}) => {
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'CONSULT' | 'SOAP' | 'TIMELINE' | 'DOCS' | 'FHIR' | 'AYUSH'>('CONSULT');
  const [isCopiedJson, setIsCopiedJson] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugDosage, setNewDrugDosage] = useState('');
  const [newDrugFreq, setNewDrugFreq] = useState('1-0-1 (After Food)');
  const [newDrugDuration, setNewDrugDuration] = useState('5 Days');
  const [showAddDrugModal, setShowAddDrugModal] = useState(false);

  const selectedEncounter = encounters.find((e) => e.id === selectedEncounterId) || encounters[0];
  const [editableSoap, setEditableSoap] = useState<SoapNote>(selectedEncounter?.soapNote);

  // Sync when selected patient changes
  React.useEffect(() => {
    if (selectedEncounter) {
      setEditableSoap(selectedEncounter.soapNote);
      setIsCommitted(selectedEncounter.status === 'COMPLETED');
    }
  }, [selectedEncounter]);

  const filteredEncounters = encounters.filter((enc) => {
    const matchesFilter =
      filterPriority === 'ALL' ||
      (filterPriority === 'P1' && enc.redFlag.triagePriority === 'P1_EMERGENCY') ||
      (filterPriority === 'P2' && enc.redFlag.triagePriority === 'P2_URGENT') ||
      (filterPriority === 'P3' && enc.redFlag.triagePriority === 'P3_ROUTINE');

    const matchesSearch =
      searchQuery === '' ||
      enc.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.patient.queueToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.patient.abhaNumber.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  const timelineEvents = assembleChronologicalTimeline(selectedEncounter?.scannedDocuments || []);

  const handleCommitRecord = () => {
    if (!selectedEncounter) return;
    const committedSoap: SoapNote = {
      ...editableSoap,
      metadata: {
        ...editableSoap.metadata,
        status: 'COMMITTED_TO_EMR',
        verifiedByDoctor: 'Dr. Vivek Sengupta, MD (Consultant Physician, Reg: MCI-2014-9812)',
        committedTimestamp: new Date().toISOString(),
      },
    };
    onCommitEncounter(selectedEncounter.id, committedSoap);
    setIsCommitted(true);
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  const handleAddMedication = () => {
    if (!newDrugName.trim()) return;
    const newMed: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
      category: 'Allopathic' | 'AYUSH' | 'Supportive';
    } = {
      name: newDrugName.trim(),
      dosage: newDrugDosage.trim() || '500mg',
      frequency: newDrugFreq,
      duration: newDrugDuration,
      instructions: 'Take with warm water after meals',
      category: 'Allopathic',
    };

    setEditableSoap({
      ...editableSoap,
      plan: {
        ...editableSoap.plan,
        medicationRecommendations: [...editableSoap.plan.medicationRecommendations, newMed],
      },
    });

    setNewDrugName('');
    setNewDrugDosage('');
    setShowAddDrugModal(false);
  };

  const handleRemoveMedication = (index: number) => {
    const updated = [...editableSoap.plan.medicationRecommendations];
    updated.splice(index, 1);
    setEditableSoap({
      ...editableSoap,
      plan: {
        ...editableSoap.plan,
        medicationRecommendations: updated,
      },
    });
  };

  const handleCopyFhirJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedEncounter.fhirBundle, null, 2));
    setIsCopiedJson(true);
    setTimeout(() => setIsCopiedJson(false), 2000);
  };

  const handleDownloadFhirJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedEncounter.fhirBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ABDM_FHIR_Bundle_${selectedEncounter.patient.abhaNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="doctor-emr-container">
      {/* Sidebar: Live OPD Queue */}
      <aside className="opd-queue-sidebar">
        <div className="queue-header">
          <div className="queue-title-row">
            <Users className="w-5 h-5 text-sky-600" />
            <h4 className="queue-title">Live OPD Queue</h4>
          </div>
          <span className="queue-count-pill">{encounters.length} Patients</span>
        </div>

        {/* Search Patient Box */}
        <div className="queue-search-box">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, token, ABHA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="queue-search-input"
          />
        </div>

        {/* Priority Filter Tabs */}
        <div className="queue-filter-pills">
          <button
            type="button"
            className={`q-filter-btn ${filterPriority === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterPriority('ALL')}
          >
            All ({encounters.length})
          </button>
          <button
            type="button"
            className={`q-filter-btn p1 ${filterPriority === 'P1' ? 'active' : ''}`}
            onClick={() => setFilterPriority('P1')}
          >
            P1 Emerg
          </button>
          <button
            type="button"
            className={`q-filter-btn p2 ${filterPriority === 'P2' ? 'active' : ''}`}
            onClick={() => setFilterPriority('P2')}
          >
            P2 Urgent
          </button>
          <button
            type="button"
            className={`q-filter-btn p3 ${filterPriority === 'P3' ? 'active' : ''}`}
            onClick={() => setFilterPriority('P3')}
          >
            P3 Routine
          </button>
        </div>

        {/* Patients Queue List */}
        <div className="queue-patient-list">
          {filteredEncounters.map((enc) => {
            const isSelected = enc.id === selectedEncounter?.id;
            const isCrit = enc.redFlag.triagePriority === 'P1_EMERGENCY';

            return (
              <div
                key={enc.id}
                className={`queue-patient-card ${isSelected ? 'selected' : ''} ${isCrit ? 'crit-card' : ''}`}
                onClick={() => onSelectEncounter(enc.id)}
              >
                <div className="q-card-top">
                  <div className="q-avatar-box">
                    <img src={enc.patient.photoUrl} alt={enc.patient.name} className="q-avatar-img" />
                    {isCrit && <span className="q-crit-dot" />}
                  </div>
                  <div className="q-info">
                    <span className="q-name">{enc.patient.name}</span>
                    <span className="q-meta">
                      {enc.patient.age}y • {enc.patient.gender} • {enc.mode}
                    </span>
                  </div>
                  <span className={`q-token-badge ${enc.redFlag.triagePriority.toLowerCase()}`}>
                    {enc.patient.queueToken}
                  </span>
                </div>

                <div className="q-card-bottom">
                  <p className="q-complaint-snippet">
                    {enc.soapNote.subjective.chiefComplaint}
                  </p>
                  <div className="q-status-row">
                    <span className="q-time"><Clock className="w-3 h-3" /> Wait: 4m</span>
                    <span className="q-mode-pill">{enc.mode === 'AYUSH' ? '🌿 AYUSH' : '🩺 Allopathic'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Clinical Workstation Area */}
      <main className="doctor-workstation-main">
        {selectedEncounter ? (
          <>
            {/* Top Patient Identity Bar */}
            <header className="patient-banner">
              <div className="patient-banner-left">
                <img
                  src={selectedEncounter.patient.photoUrl}
                  alt={selectedEncounter.patient.name}
                  className="patient-banner-avatar"
                />
                <div className="patient-banner-text">
                  <div className="patient-name-row">
                    <h2 className="patient-main-name">{selectedEncounter.patient.name}</h2>
                    <span className="banner-token-badge">Token: {selectedEncounter.patient.queueToken}</span>
                    <span className="banner-abha-badge">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ABHA: {selectedEncounter.patient.abhaNumber}
                    </span>
                    <span className="banner-phr-badge">@{selectedEncounter.patient.abhaAddress}</span>
                  </div>
                  <div className="patient-demographics-row">
                    <span><strong>Age / Gender:</strong> {selectedEncounter.patient.age}y / {selectedEncounter.patient.gender}</span>
                    <span>•</span>
                    <span><strong>Location:</strong> {selectedEncounter.patient.district}, {selectedEncounter.patient.state}</span>
                    <span>•</span>
                    <span><strong>Phone:</strong> {selectedEncounter.patient.mobile}</span>
                    <span>•</span>
                    <span><strong>Channel:</strong> {selectedEncounter.kioskId.includes('IVR') ? '📞 IVR Helpline (1075)' : '🖥️ OPD Kiosk Terminal'}</span>
                  </div>
                </div>
              </div>

              {/* Triage Urgency Badge & Quick Vitals */}
              <div className="patient-banner-right">
                <div className={`triage-status-pill ${selectedEncounter.redFlag.triagePriority.toLowerCase()}`}>
                  {selectedEncounter.redFlag.triagePriority === 'P1_EMERGENCY' && <AlertOctagon className="w-5 h-5 text-red-600" />}
                  <span>{selectedEncounter.redFlag.triagePriority.replace('_', ' ')}</span>
                </div>
                <div className="vitals-quick-strip">
                  <div className="vital-chip">
                    <Droplet className="w-3.5 h-3.5 text-rose-500" />
                    <span>BP: <strong>{selectedEncounter.soapNote.objective.vitals.bpSystolic}/{selectedEncounter.soapNote.objective.vitals.bpDiastolic}</strong></span>
                  </div>
                  <div className="vital-chip">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span>Pulse: <strong>{selectedEncounter.soapNote.objective.vitals.pulseRate} bpm</strong></span>
                  </div>
                  <div className="vital-chip">
                    <Activity className="w-3.5 h-3.5 text-sky-600" />
                    <span>SpO2: <strong>{selectedEncounter.soapNote.objective.vitals.spo2}%</strong></span>
                  </div>
                  <div className="vital-chip">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    <span>Temp: <strong>{selectedEncounter.soapNote.objective.vitals.tempF}°F</strong></span>
                  </div>
                  <div className="vital-chip">
                    <span>Pain: <strong className="text-red-600">{selectedEncounter.soapNote.objective.vitals.painScore}/10</strong></span>
                  </div>
                </div>
              </div>
            </header>

            {/* Quick Action & Commit Bar */}
            <div className="doctor-quick-actions-bar">
              <div className="action-bar-left">
                <div className="doctor-badge-info">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  <span>Dr. Vivek Sengupta, MD • OPD Room 104</span>
                </div>
                {isCommitted ? (
                  <span className="committed-status-badge">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Prescription Signed & Committed to ABDM Gateway
                  </span>
                ) : (
                  <span className="pending-status-badge">
                    ● Pending Doctor Approval
                  </span>
                )}
              </div>

              <div className="action-bar-right">
                <button
                  type="button"
                  className="doc-secondary-btn"
                  onClick={handlePrintPrescription}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Prescription</span>
                </button>

                <button
                  type="button"
                  className={`doc-primary-btn ${isCommitted ? 'committed' : ''}`}
                  onClick={handleCommitRecord}
                  disabled={isCommitted}
                >
                  <Send className="w-4 h-4" />
                  <span>{isCommitted ? 'Signed & Submitted' : '✓ Sign & Commit Prescription (ABDM)'}</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="workstation-tab-bar">
              <button
                type="button"
                className={`w-tab-btn ${activeTab === 'CONSULT' ? 'active' : ''}`}
                onClick={() => setActiveTab('CONSULT')}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Quick Consultation & Prescription</span>
              </button>

              <button
                type="button"
                className={`w-tab-btn ${activeTab === 'SOAP' ? 'active' : ''}`}
                onClick={() => setActiveTab('SOAP')}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Full SOAP Note</span>
              </button>

              <button
                type="button"
                className={`w-tab-btn ${activeTab === 'TIMELINE' ? 'active' : ''}`}
                onClick={() => setActiveTab('TIMELINE')}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Patient Timeline ({timelineEvents.length})</span>
              </button>

              <button
                type="button"
                className={`w-tab-btn ${activeTab === 'DOCS' ? 'active' : ''}`}
                onClick={() => setActiveTab('DOCS')}
              >
                <FileText className="w-4 h-4" />
                <span>Scanned Records ({selectedEncounter.scannedDocuments.length})</span>
              </button>

              <button
                type="button"
                className={`w-tab-btn ${activeTab === 'FHIR' ? 'active' : ''}`}
                onClick={() => setActiveTab('FHIR')}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ABDM FHIR R4</span>
              </button>

              {selectedEncounter.mode === 'AYUSH' && (
                <button
                  type="button"
                  className={`w-tab-btn ${activeTab === 'AYUSH' ? 'active' : ''}`}
                  onClick={() => setActiveTab('AYUSH')}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AYUSH Dashavidha</span>
                </button>
              )}
            </div>

            {/* TAB 1: STREAMLINED QUICK CONSULTATION (SIMPLE & FAST FOR DOCTORS) */}
            {activeTab === 'CONSULT' && (
              <div className="consult-streamlined-layout">
                {/* Red Flag Warning Box if any */}
                {editableSoap.assessment.redFlagsIdentified.length > 0 && (
                  <div className="red-flag-banner-alert">
                    <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <strong className="text-red-900">Clinical Alert & Red-Flag Warnings:</strong>
                      <ul className="red-flag-list">
                        {editableSoap.assessment.redFlagsIdentified.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="consult-columns-grid">
                  {/* LEFT COLUMN: WHAT PATIENT REPORTED (INTAKE SUMMARY) */}
                  <div className="consult-column left-col">
                    <div className="clinical-card">
                      <div className="clinical-card-header bg-sky-50">
                        <h5>1. Patient Symptoms & Intake History</h5>
                        <span className="channel-tag">{selectedEncounter.kioskId.includes('IVR') ? '📞 Tele-IVR' : '🖥️ Kiosk Intake'}</span>
                      </div>
                      <div className="clinical-card-body">
                        <div className="summary-field">
                          <label className="field-label">Chief Complaint:</label>
                          <p className="complaint-text-highlight">{editableSoap.subjective.chiefComplaint}</p>
                        </div>

                        <div className="summary-field">
                          <label className="field-label">History of Present Illness (HPI):</label>
                          <textarea
                            rows={3}
                            value={editableSoap.subjective.historyOfPresentIllness}
                            onChange={(e) =>
                              setEditableSoap({
                                ...editableSoap,
                                subjective: { ...editableSoap.subjective, historyOfPresentIllness: e.target.value },
                              })
                            }
                            className="clean-textarea"
                            placeholder="Add or update patient symptom history..."
                          />
                        </div>

                        {editableSoap.subjective.socratesSummary && (
                          <div className="socrates-pill-box">
                            <span className="box-heading">Symptom Breakdown (SOCRATES):</span>
                            <div className="socrates-chips-list">
                              <span className="s-chip"><strong>Site:</strong> {editableSoap.subjective.socratesSummary.site}</span>
                              <span className="s-chip"><strong>Onset:</strong> {editableSoap.subjective.socratesSummary.onset}</span>
                              <span className="s-chip"><strong>Character:</strong> {editableSoap.subjective.socratesSummary.character}</span>
                              <span className="s-chip"><strong>Radiation:</strong> {editableSoap.subjective.socratesSummary.radiation}</span>
                              <span className="s-chip"><strong>Severity:</strong> {editableSoap.subjective.socratesSummary.severityDescription}</span>
                              <span className="s-chip"><strong>Associated:</strong> {editableSoap.subjective.socratesSummary.associations.join(', ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vitals Card */}
                    <div className="clinical-card">
                      <div className="clinical-card-header bg-slate-50">
                        <h5>2. Recorded Kiosk Vital Signs</h5>
                      </div>
                      <div className="clinical-card-body">
                        <div className="vitals-matrix">
                          <div className="v-box">
                            <span className="v-label">Blood Pressure</span>
                            <span className="v-val font-mono">{editableSoap.objective.vitals.bpSystolic}/{editableSoap.objective.vitals.bpDiastolic} <small>mmHg</small></span>
                          </div>
                          <div className="v-box">
                            <span className="v-label">Heart Rate</span>
                            <span className="v-val font-mono">{editableSoap.objective.vitals.pulseRate} <small>bpm</small></span>
                          </div>
                          <div className="v-box">
                            <span className="v-label">SpO2 Oxygen</span>
                            <span className="v-val font-mono">{editableSoap.objective.vitals.spo2}%</span>
                          </div>
                          <div className="v-box">
                            <span className="v-label">Temperature</span>
                            <span className="v-val font-mono">{editableSoap.objective.vitals.tempF} <small>°F</small></span>
                          </div>
                          <div className="v-box">
                            <span className="v-label">Resp Rate</span>
                            <span className="v-val font-mono">{editableSoap.objective.vitals.respiratoryRate} <small>/min</small></span>
                          </div>
                          <div className="v-box">
                            <span className="v-label">Pain Score</span>
                            <span className="v-val text-red-600 font-bold">{editableSoap.objective.vitals.painScore} <small>/10</small></span>
                          </div>
                        </div>

                        {editableSoap.objective.extractedLabHighlights.length > 0 && (
                          <div className="lab-summary-box">
                            <span className="box-heading">Digitized Prior Lab Records:</span>
                            <div className="lab-chips-grid">
                              {editableSoap.objective.extractedLabHighlights.map((lab) => (
                                <div key={lab.id} className={`lab-badge-item ${lab.isAbnormal ? 'abnormal' : ''}`}>
                                  <span>{lab.testName}: <strong>{lab.resultValue} {lab.unit}</strong></span>
                                  {lab.isAbnormal && <span className="badge-tag-danger">{lab.severity}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: DOCTOR'S ORDERS & PRESCRIPTION */}
                  <div className="consult-column right-col">
                    {/* Diagnosis & Assessment Card */}
                    <div className="clinical-card">
                      <div className="clinical-card-header bg-emerald-50">
                        <h5>3. Clinical Diagnosis (ICD-10 / SNOMED CT)</h5>
                      </div>
                      <div className="clinical-card-body">
                        <div className="diag-cards-stack">
                          {editableSoap.assessment.provisionalDiagnoses.map((diag, idx) => (
                            <div key={idx} className="diag-entry-box">
                              <div className="diag-title-row">
                                <strong className="diag-condition">{diag.condition}</strong>
                                <span className="diag-pill icd">ICD-10: {diag.icd10}</span>
                                <span className="diag-pill snomed">SNOMED: {diag.snomedCt}</span>
                                <span className="diag-pill conf">Match: {Math.round(diag.confidence * 100)}%</span>
                              </div>
                              <p className="diag-rationale-text">{diag.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prescription Medications Card */}
                    <div className="clinical-card">
                      <div className="clinical-card-header bg-sky-50 justify-between">
                        <h5>4. Prescribed Medications (Rx)</h5>
                        <button
                          type="button"
                          className="add-med-btn"
                          onClick={() => setShowAddDrugModal(true)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Medicine</span>
                        </button>
                      </div>
                      <div className="clinical-card-body">
                        {showAddDrugModal && (
                          <div className="add-drug-inline-form">
                            <h6>Add New Prescription Drug:</h6>
                            <div className="drug-form-grid">
                              <input
                                type="text"
                                placeholder="Drug Name (e.g., Paracetamol, Amoxicillin)"
                                value={newDrugName}
                                onChange={(e) => setNewDrugName(e.target.value)}
                                className="clean-input"
                              />
                              <input
                                type="text"
                                placeholder="Dosage (e.g. 500mg, 1 Tab)"
                                value={newDrugDosage}
                                onChange={(e) => setNewDrugDosage(e.target.value)}
                                className="clean-input"
                              />
                              <input
                                type="text"
                                placeholder="Frequency (e.g. 1-0-1 After Food)"
                                value={newDrugFreq}
                                onChange={(e) => setNewDrugFreq(e.target.value)}
                                className="clean-input"
                              />
                              <input
                                type="text"
                                placeholder="Duration (e.g. 5 Days)"
                                value={newDrugDuration}
                                onChange={(e) => setNewDrugDuration(e.target.value)}
                                className="clean-input"
                              />
                            </div>
                            <div className="drug-form-actions">
                              <button
                                type="button"
                                className="doc-primary-btn small"
                                onClick={handleAddMedication}
                              >
                                Add to Prescription
                              </button>
                              <button
                                type="button"
                                className="doc-secondary-btn small"
                                onClick={() => setShowAddDrugModal(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="medications-table-wrap">
                          <table className="clean-med-table">
                            <thead>
                              <tr>
                                <th>Medicine & Strength</th>
                                <th>Dosage Timing</th>
                                <th>Duration</th>
                                <th>Instructions</th>
                                <th style={{ width: '40px' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {editableSoap.plan.medicationRecommendations.map((med, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <strong className="med-name">{med.name}</strong>
                                    <div className="med-strength">{med.dosage} • {med.category}</div>
                                  </td>
                                  <td><span className="timing-pill">{med.frequency}</span></td>
                                  <td><span className="duration-pill">{med.duration}</span></td>
                                  <td className="text-slate-600 text-xs">{med.instructions}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="delete-med-btn"
                                      onClick={() => handleRemoveMedication(idx)}
                                      title="Remove medication"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Doctor's Advice & Disposition */}
                        <div className="summary-field" style={{ marginTop: '16px' }}>
                          <label className="field-label">Doctor's Clinical Advice & Follow-Up Instructions:</label>
                          <textarea
                            rows={3}
                            value={editableSoap.plan.triageDisposition}
                            onChange={(e) =>
                              setEditableSoap({
                                ...editableSoap,
                                plan: { ...editableSoap.plan, triageDisposition: e.target.value },
                              })
                            }
                            className="clean-textarea"
                            placeholder="Enter patient follow-up, dietary restrictions, or red-flag warning instructions..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FULL SOAP NOTE VIEW */}
            {activeTab === 'SOAP' && (
              <div className="soap-workstation-layout">
                <div className="soap-grid">
                  {/* S - SUBJECTIVE */}
                  <div className="soap-card">
                    <div className="soap-card-header subjective-header">
                      <h5>S • Subjective History (SOCRATES / AI-Captured)</h5>
                    </div>
                    <div className="soap-card-content">
                      <div className="soap-field-block">
                        <label>Chief Complaint:</label>
                        <p className="soap-text-val highlight">{editableSoap.subjective.chiefComplaint}</p>
                      </div>

                      <div className="soap-field-block">
                        <label>History of Present Illness (HPI):</label>
                        <textarea
                          rows={3}
                          value={editableSoap.subjective.historyOfPresentIllness}
                          onChange={(e) =>
                            setEditableSoap({
                              ...editableSoap,
                              subjective: { ...editableSoap.subjective, historyOfPresentIllness: e.target.value },
                            })
                          }
                          className="clean-textarea"
                        />
                      </div>
                    </div>
                  </div>

                  {/* O - OBJECTIVE */}
                  <div className="soap-card">
                    <div className="soap-card-header objective-header">
                      <h5>O • Objective Findings & Vitals</h5>
                    </div>
                    <div className="soap-card-content">
                      <table className="doctor-compact-table">
                        <thead>
                          <tr>
                            <th>BP</th>
                            <th>Pulse</th>
                            <th>SpO2</th>
                            <th>Temp</th>
                            <th>RR</th>
                            <th>Pain</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-mono">{editableSoap.objective.vitals.bpSystolic}/{editableSoap.objective.vitals.bpDiastolic}</td>
                            <td className="font-mono">{editableSoap.objective.vitals.pulseRate} bpm</td>
                            <td className="font-mono">{editableSoap.objective.vitals.spo2}%</td>
                            <td className="font-mono">{editableSoap.objective.vitals.tempF}°F</td>
                            <td className="font-mono">{editableSoap.objective.vitals.respiratoryRate}/m</td>
                            <td className="font-bold text-red-600">{editableSoap.objective.vitals.painScore}/10</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* A - ASSESSMENT */}
                  <div className="soap-card">
                    <div className="soap-card-header assessment-header">
                      <h5>A • AI Differential Assessment</h5>
                    </div>
                    <div className="soap-card-content">
                      <div className="diagnoses-list">
                        {editableSoap.assessment.provisionalDiagnoses.map((diag, idx) => (
                          <div key={idx} className="diagnosis-item-card">
                            <div className="diag-item-top">
                              <span className="diag-title">{diag.condition}</span>
                              <div className="diag-codes">
                                <span className="code-badge icd">ICD-10: {diag.icd10}</span>
                                <span className="code-badge snomed">SNOMED: {diag.snomedCt}</span>
                              </div>
                            </div>
                            <p className="diag-rationale">{diag.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* P - PLAN */}
                  <div className="soap-card">
                    <div className="soap-card-header plan-header">
                      <h5>P • Clinical Orders & Treatment Plan</h5>
                    </div>
                    <div className="soap-card-content">
                      <div className="meds-order-list">
                        {editableSoap.plan.medicationRecommendations.map((med, idx) => (
                          <div key={idx} className="med-order-item">
                            <div className="med-order-name">
                              <strong>{med.name}</strong> ({med.dosage})
                              <span className="med-cat-tag">{med.category}</span>
                            </div>
                            <div className="med-order-details">
                              <span>Freq: <strong>{med.frequency}</strong></span>
                              <span>Duration: {med.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CHRONOLOGICAL TIMELINE */}
            {activeTab === 'TIMELINE' && (
              <div className="timeline-tab-layout">
                <div className="timeline-header-box">
                  <h4>Chronological Longitudinal Patient Journey</h4>
                  <p>Aggregated from physical records, past ABDM consultations, and diagnostic labs</p>
                </div>

                <div className="vertical-timeline">
                  {timelineEvents.map((evt) => (
                    <div key={evt.id} className="timeline-item">
                      <div className="timeline-marker">
                        <Calendar className="w-4 h-4 text-sky-600" />
                      </div>
                      <div className="timeline-card">
                        <div className="timeline-card-top">
                          <span className="t-date">{evt.date}</span>
                          <span className="t-type-badge">{evt.type}</span>
                        </div>
                        <h5 className="t-title">{evt.title}</h5>
                        <span className="t-facility">{evt.facility}</span>
                        <p className="t-summary">{evt.summary}</p>
                        <div className="t-findings-chips">
                          {evt.keyFindings.map((f, idx) => (
                            <span key={idx} className="finding-chip">✓ {f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: EXTRACTED DOCUMENT AI */}
            {activeTab === 'DOCS' && (
              <div className="docs-tab-layout">
                <div className="docs-tab-header">
                  <h4>Document AI Vision & TrOCR Parser Results</h4>
                  <p>Digitized prescriptions, lab slips, and medical reports</p>
                </div>

                <div className="scanned-docs-grid">
                  {selectedEncounter.scannedDocuments.map((doc) => (
                    <div key={doc.id} className="doc-view-card">
                      <div className="doc-img-preview-box">
                        <img src={doc.deskewedImageUrl} alt={doc.fileName} className="doc-img" />
                        <div className="ocr-conf-overlay">OCR Confidence: {doc.ocrConfidence}%</div>
                      </div>
                      <div className="doc-meta-box">
                        <h5>{doc.fileName}</h5>
                        <span>{doc.facilityName} • {doc.extractedDate}</span>
                        <div className="raw-ocr-box">
                          <span className="box-title">Extracted Text Stream:</span>
                          <pre className="ocr-code">{doc.rawOcrSnippets.join('\n')}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: FHIR R4 / ABDM INSPECTOR */}
            {activeTab === 'FHIR' && (
              <div className="fhir-tab-layout">
                <div className="fhir-header-row">
                  <div>
                    <h4>ABDM FHIR R4 Standardized Document Bundle</h4>
                    <p>NRCeS NDHM Compliant Clinical Artifact</p>
                  </div>
                  <div className="fhir-action-btns">
                    <button type="button" className="fhir-tool-btn" onClick={handleCopyFhirJson}>
                      <Copy className="w-4 h-4" />
                      <span>{isCopiedJson ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                    <button type="button" className="fhir-tool-btn" onClick={handleDownloadFhirJson}>
                      <Download className="w-4 h-4" />
                      <span>Download Bundle</span>
                    </button>
                  </div>
                </div>

                <div className="fhir-json-viewer">
                  <pre className="fhir-pre">{JSON.stringify(selectedEncounter.fhirBundle, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* TAB 6: AYUSH RADAR */}
            {activeTab === 'AYUSH' && selectedEncounter.ayush && (
              <div className="ayush-tab-layout">
                <div className="ayush-tab-header">
                  <h4>AYUSH Dashavidha & Ashtavidha Pariksha Workstation</h4>
                  <p>Tridosha imbalance mapping, Prakriti assessment, and holistic dietary prescription</p>
                </div>

                <div className="ayush-modules-grid">
                  <div className="ayush-card">
                    <h5>Dashavidha Pariksha (दशविध परीक्षा)</h5>
                    <div className="ayush-data-table">
                      <div className="ayush-row"><span>1. Prakriti (प्रकृति):</span> <strong>{selectedEncounter.ayush.prakriti}</strong></div>
                      <div className="ayush-row"><span>2. Vikriti (विकृति):</span> <strong>{selectedEncounter.ayush.vikriti}</strong></div>
                      <div className="ayush-row"><span>3. Sara (सार):</span> <span>{selectedEncounter.ayush.sara}</span></div>
                      <div className="ayush-row"><span>4. Samhanana (संहनन):</span> <span>{selectedEncounter.ayush.samhanana}</span></div>
                      <div className="ayush-row"><span>5. Pramana (प्रमाण):</span> <span>{selectedEncounter.ayush.pramana}</span></div>
                      <div className="ayush-row"><span>6. Satmya (सात्म्य):</span> <span>{selectedEncounter.ayush.satmya}</span></div>
                      <div className="ayush-row"><span>7. Sattva (सत्त्व):</span> <span>{selectedEncounter.ayush.sattva}</span></div>
                      <div className="ayush-row"><span>8. Ahara Shakti (आहार शक्ति):</span> <span>{selectedEncounter.ayush.aharaShakti.jaranaShakti}</span></div>
                      <div className="ayush-row"><span>9. Vyayama Shakti (व्यायाम शक्ति):</span> <span>{selectedEncounter.ayush.vyayamaShakti}</span></div>
                      <div className="ayush-row"><span>10. Vaya (वय):</span> <span>{selectedEncounter.ayush.vaya}</span></div>
                    </div>
                  </div>

                  <div className="ayush-card">
                    <h5>Ashtavidha Pariksha (अष्टविध परीक्षा)</h5>
                    <div className="ayush-data-table">
                      <div className="ayush-row"><span>1. Nadi (नाड़ी):</span> <strong>{selectedEncounter.ayush.ashtavidha.nadi}</strong></div>
                      <div className="ayush-row"><span>2. Mutra (मूत्र):</span> <span>{selectedEncounter.ayush.ashtavidha.mutra}</span></div>
                      <div className="ayush-row"><span>3. Mala (मल):</span> <span>{selectedEncounter.ayush.ashtavidha.mala}</span></div>
                      <div className="ayush-row"><span>4. Jihva (जिह्वा):</span> <span>{selectedEncounter.ayush.ashtavidha.jihva}</span></div>
                      <div className="ayush-row"><span>5. Shabda (शब्द):</span> <span>{selectedEncounter.ayush.ashtavidha.shabda}</span></div>
                      <div className="ayush-row"><span>6. Sparsha (स्पर्श):</span> <span>{selectedEncounter.ayush.ashtavidha.sparsha}</span></div>
                      <div className="ayush-row"><span>7. Druk (दृक):</span> <span>{selectedEncounter.ayush.ashtavidha.druk}</span></div>
                      <div className="ayush-row"><span>8. Akruti (आकृति):</span> <span>{selectedEncounter.ayush.ashtavidha.akruti}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-encounter-selected">
            <Users className="w-12 h-12 text-slate-400" />
            <p>Select a patient encounter from the live OPD queue on the left.</p>
          </div>
        )}
      </main>
    </div>
  );
};

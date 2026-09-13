import React, { useState } from 'react';
import { Camera, FileText, CheckCircle2, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import type { DocumentScanResult } from '../../types';
import { SAMPLE_DOCUMENTS, parseDocumentScan } from '../../services/documentAi';

interface DocumentScannerProps {
  scannedDocs: DocumentScanResult[];
  onAddScan: (doc: DocumentScanResult) => void;
  onRemoveScan: (docId: string) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  scannedDocs,
  onAddScan,
  onRemoveScan,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('doc-rx-cardio-01');
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = (presetId?: string) => {
    setIsScanning(true);
    setTimeout(() => {
      const result = parseDocumentScan(presetId || selectedPresetId);
      onAddScan(result);
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="document-scanner-module">
      <div className="doc-scanner-header">
        <div>
          <h4 className="doc-scanner-title">Add a previous prescription or report</h4>
          <p className="doc-scanner-subtitle">
            Select a record below to add it to your clinician’s review.
          </p>
        </div>
        <div className="scanner-badge-row">
          <span className="scanner-badge"><ShieldCheck className="w-3.5 h-3.5" /> DPDP Zero-Retention Buffer</span>
          <span className="scanner-badge"><Zap className="w-3.5 h-3.5" /> On-Premise GPU Inference</span>
        </div>
      </div>

      <div className="scanner-main-grid">
        {/* Left: Feed & Preset Controls */}
        <div className="scanner-control-pane">
          <div className="scanner-feed-box">
            {isScanning ? (
              <div className="scanning-active-viewport">
                <div className="laser-scan-line"></div>
                <div className="scanning-spinner-box">
                  <RefreshCw className="spin-icon text-cyan-400" />
                  <span className="scanning-text">Reading your document…</span>
                </div>
              </div>
            ) : (
              <div className="scanner-camera-viewport">
                <div className="camera-overlay-frame">
                  <div className="corner-tl"></div>
                  <div className="corner-tr"></div>
                  <div className="corner-bl"></div>
                  <div className="corner-br"></div>
                  <Camera className="camera-center-icon" />
                  <span className="camera-guide-text">Align physical prescription within bounding box</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Document Feeder Options */}
          <div className="preset-docs-section">
            <span className="section-label">Choose a document to add</span>
            <div className="preset-list">
              {SAMPLE_DOCUMENTS.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  className={`preset-doc-card ${selectedPresetId === doc.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPresetId(doc.id);
                    handleStartScan(doc.id);
                  }}
                  disabled={isScanning}
                >
                  <FileText className="doc-icon" />
                  <div className="doc-card-info">
                    <span className="doc-name">{doc.name}</span>
                    <span className="doc-meta">{doc.type} • {doc.facility}</span>
                  </div>
                  <span className="doc-action-tag">Add record</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Extracted Digital Records */}
        <div className="extracted-records-pane">
          <div className="extracted-header">
            <h5>Your records ({scannedDocs.length} added)</h5>
          </div>

          {scannedDocs.length === 0 ? (
            <div className="empty-scan-placeholder">
              <FileText className="empty-icon" />
              <p>No records added yet. This step is optional.</p>
            </div>
          ) : (
            <div className="scanned-items-container">
              {scannedDocs.map((doc) => (
                <div key={doc.id} className="scanned-result-card">
                  <div className="result-card-top">
                    <div className="result-title-group">
                      <span className="result-doc-name">{doc.fileName}</span>
                      <span className="confidence-pill">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OCR Confidence: {doc.ocrConfidence}%
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-scan-btn"
                      onClick={() => onRemoveScan(doc.id)}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Extracted Rx Table */}
                  {doc.extractedMeds.length > 0 && (
                    <div className="extracted-meds-table-wrapper">
                      <span className="sub-table-title">Extracted Medications (RxNorm / SNOMED CT):</span>
                      <table className="kiosk-extracted-table">
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                            <th>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doc.extractedMeds.map((med) => (
                            <tr key={med.id}>
                              <td className="font-semibold text-sky-400">{med.medicineName}</td>
                              <td>{med.dosage}</td>
                              <td><span className="freq-badge">{med.frequency}</span></td>
                              <td>{med.duration}</td>
                              <td className="text-xs text-slate-300">{med.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Extracted Labs Table */}
                  {doc.extractedLabs.length > 0 && (
                    <div className="extracted-labs-table-wrapper">
                      <span className="sub-table-title">Extracted Lab Parameters (LOINC Mapped):</span>
                      <table className="kiosk-extracted-table">
                        <thead>
                          <tr>
                            <th>Test Parameter</th>
                            <th>Result Value</th>
                            <th>Reference</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doc.extractedLabs.map((lab) => (
                            <tr key={lab.id} className={lab.isAbnormal ? 'abnormal-row' : ''}>
                              <td className="font-semibold">{lab.testName}</td>
                              <td className="font-mono text-cyan-300">{lab.resultValue} {lab.unit}</td>
                              <td className="text-xs text-slate-400">{lab.referenceRange}</td>
                              <td>
                                {lab.isAbnormal ? (
                                  <span className={`status-pill abnormal ${lab.severity.toLowerCase()}`}>
                                    ⚠️ {lab.severity.replace('_', ' ')}
                                  </span>
                                ) : (
                                  <span className="status-pill normal">Normal</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

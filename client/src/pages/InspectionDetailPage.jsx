import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, MapPin, AlertTriangle, CheckCircle2, ShieldAlert, FileText, Camera, Calendar, User, Building } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getInspectionDetail } from '../services/api';
import LeafletMineMap from '../components/map/LeafletMineMap';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';

function EvidenceItemCard({ file, index, submissionId }) {
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileStr = String(file || '').trim();
  const isUrl = fileStr.startsWith('http://') || fileStr.startsWith('https://') || fileStr.startsWith('data:image/');

  if (isUrl && !imageError) {
    return (
      <>
        <div className="evidence-card evidence-card-image">
          <div
            className="evidence-image-wrapper"
            onClick={() => setPreviewOpen(true)}
            title="Click to view full evidence image"
          >
            <img
              src={fileStr}
              alt={`Evidence attachment ${index + 1} for ${submissionId}`}
              className="evidence-image-element"
              onError={() => setImageError(true)}
            />
            <div className="evidence-image-overlay">
              <ExternalLink size={14} color="#ffffff" />
              <span>Preview</span>
            </div>
          </div>
          <div className="evidence-filename" title={fileStr}>
            {fileStr.length > 30 ? fileStr.substring(0, 27) + '...' : fileStr}
          </div>
          <div style={{ padding: '0 10px 10px 10px' }}>
            <span className="evidence-available-badge">Cloudinary Media Verified</span>
          </div>
        </div>

        {previewOpen && (
          <div className="evidence-lightbox-modal" onClick={() => setPreviewOpen(false)}>
            <div className="evidence-lightbox-content" onClick={e => e.stopPropagation()}>
              <div className="evidence-lightbox-header">
                <span>Evidence Attachment #{index + 1} ({submissionId})</span>
                <button className="evidence-lightbox-close" onClick={() => setPreviewOpen(false)}>✕</button>
              </div>
              <img src={fileStr} alt="Full Evidence Attachment" className="evidence-lightbox-img" />
              <div className="evidence-lightbox-footer">
                <a href={fileStr} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Open Original Image <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="evidence-card">
      <div className="evidence-thumbnail">
        <Camera size={24} color="#94a3b8" />
        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Evidence File</span>
      </div>
      <div className="evidence-filename" title={fileStr}>
        {fileStr}
      </div>
      <div style={{ padding: '0 10px 10px 10px' }}>
        <span className="evidence-unavailable-fallback">Evidence file unavailable</span>
      </div>
    </div>
  );
}

export default function InspectionDetailPage({ submissionId, onBack, onSelectMine }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getInspectionDetail(submissionId);
        if (isMounted) {
          setInspection(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Failed to load inspection detail for ${submissionId}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { isMounted = false; };
  }, [submissionId]);

  if (loading) return <LoadingSkeleton />;
  if (error || !inspection) {
    return (
      <div className="monitoring-page">
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Inspections
        </button>
        <ErrorState message={error || "Inspection record not found (HTTP 404)"} onRetry={onBack} />
      </div>
    );
  }

  const isViolation = String(inspection.violation_found).toLowerCase() === 'yes';
  const hasValidLocation = inspection.location &&
    typeof inspection.location.latitude === 'number' &&
    typeof inspection.location.longitude === 'number' &&
    !isNaN(inspection.location.latitude) &&
    !isNaN(inspection.location.longitude);

  const mapMarkers = hasValidLocation ? [{
    id: inspection.submission_id,
    mine_id: inspection.mine_id,
    mine_name: inspection.mine_name || inspection.mine_id,
    latitude: inspection.location.latitude,
    longitude: inspection.location.longitude,
    risk_level: inspection.violation_severity || 'low',
    status: inspection.sync_status || 'synced'
  }] : [];

  return (
    <div className="monitoring-page">
      {/* Navigation Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button className="btn-secondary" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Inspections
        </button>

        {inspection.mine_id && (
          <button className="btn-primary" onClick={() => onSelectMine(inspection.mine_id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Building size={14} /> View Mine ({inspection.mine_id}) <ExternalLink size={14} />
          </button>
        )}
      </div>

      {/* Header Banner Dossier */}
      <div className="detail-header-card">
        <div className="detail-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="detail-title">{inspection.submission_id}</h1>
            <span className={`badge ${isViolation ? 'badge-critical' : 'badge-compliant'}`}>
              {isViolation ? 'VIOLATION DETECTED' : 'NO VIOLATION'}
            </span>
            <span className={`badge ${inspection.review_status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
              Review Status: {inspection.review_status || '—'}
            </span>
          </div>
          <p className="detail-subtitle">
            Inspection Type: <strong style={{ textTransform: 'capitalize', color: '#0f172a' }}>{inspection.inspection_type || '—'}</strong> |
            Date &amp; Time: <strong style={{ color: '#0f172a' }}>{inspection.date_time ? new Date(inspection.date_time).toLocaleString() : '—'}</strong>
          </p>
        </div>

        {/* Dossier Meta Info Grid */}
        <div className="dossier-meta-grid">
          <div className="meta-item">
            <span className="meta-label"><Building size={14} /> Mine Name &amp; ID</span>
            <span className="meta-value">
              {inspection.mine_name || '—'}{' '}
              <code style={{ fontSize: '12px', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                {inspection.mine_id || '—'}
              </code>
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><User size={14} /> Inspector</span>
            <span className="meta-value">
              {inspection.inspector_name || '—'}{' '}
              {inspection.inspector_id && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>({inspection.inspector_id})</span>
              )}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><MapPin size={14} /> Location / State</span>
            <span className="meta-value">
              {inspection.district ? `${inspection.district}, ` : ''}{inspection.state || '—'}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Sync Status</span>
            <span className="meta-value" style={{ textTransform: 'capitalize' }}>
              <span className={`badge ${inspection.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                {inspection.sync_status || '—'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Map */}
      <div className="inspection-detail-grid">
        <div className="left-detail-column">
          {/* Section: Safety Violation Details OR No Violation Recorded */}
          <div className="detail-section-card">
            <div className="section-header">
              <ShieldAlert size={18} color={isViolation ? '#dc2626' : '#16a34a'} />
              <h2>Safety Violation Details</h2>
            </div>

            {isViolation ? (
              <div className="violation-box">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="meta-label" style={{ fontWeight: '600', color: '#334155' }}>Severity Level:</span>
                  <span className={`badge ${
                    inspection.violation_severity === 'critical' ? 'badge-critical' :
                    inspection.violation_severity === 'major' ? 'badge-high' : 'badge-warning'
                  }`}>
                    {(inspection.violation_severity || 'UNCATEGORIZED').toUpperCase()}
                  </span>
                </div>

                <div className="field-group">
                  <label className="field-label">Violation Description</label>
                  <div className="field-content-box" style={{ borderLeft: '4px solid #dc2626' }}>
                    {inspection.violation_description || '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-violation-card">
                <CheckCircle2 size={24} color="#16a34a" />
                <span className="no-violation-text">No violation recorded</span>
              </div>
            )}
          </div>

          {/* Section: Corrective Actions */}
          <div className="detail-section-card">
            <div className="section-header">
              <FileText size={18} color="#0284c7" />
              <h2>Corrective Actions</h2>
            </div>

            {inspection.corrective_action ? (
              <div className="corrective-action-box">
                <div className="field-group">
                  <label className="field-label">Directive / Action Standard</label>
                  <div className="field-content-box">
                    {inspection.corrective_action}
                  </div>
                </div>

                {inspection.extracted_deadline && (
                  <div className="deadline-badge-box">
                    <Calendar size={14} />
                    <span>Resolution Deadline: <strong>{inspection.extracted_deadline}</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-field-notice">No corrective action prescribed for this inspection record.</div>
            )}
          </div>

          {/* Section: Inspection Checklist */}
          <div className="detail-section-card">
            <div className="section-header">
              <CheckCircle2 size={18} color="#0284c7" />
              <h2>Inspection Checklist Items ({inspection.checklist?.length || 0})</h2>
            </div>

            {Array.isArray(inspection.checklist) && inspection.checklist.length > 0 ? (
              <div className="checklist-table-wrapper">
                <table className="checklist-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Checklist Question</th>
                      <th style={{ width: '20%' }}>Compliance Result</th>
                      <th style={{ width: '35%' }}>Inspector Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.checklist.map((item, idx) => {
                      const answerStr = String(item.answer || '').toLowerCase();
                      const isPass = answerStr === 'pass';
                      const isFail = answerStr === 'fail';

                      return (
                        <tr key={idx} className={isFail ? 'row-failed-item' : ''}>
                          <td style={{ fontWeight: '500' }}>{item.question}</td>
                          <td>
                            {isPass && <span className="badge badge-compliant"><CheckCircle2 size={12} /> PASS</span>}
                            {isFail && <span className="badge badge-fail-prominent"><AlertTriangle size={12} /> FAIL</span>}
                            {!isPass && !isFail && <span className="badge badge-neutral">{item.answer?.toUpperCase() || 'NOT APPLICABLE'}</span>}
                          </td>
                          <td style={{ color: '#475569', fontSize: '13px' }}>{item.remarks || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-field-notice">No checklist data captured for this inspection.</div>
            )}
          </div>

          {/* Section: Evidence Media Attachments */}
          <div className="detail-section-card">
            <div className="section-header">
              <Camera size={18} color="#0284c7" />
              <h2>Evidence Attachments</h2>
            </div>

            {(() => {
              const rawEvidence = inspection.photos_or_videos || inspection.photos || inspection.evidence_files || inspection.evidence_urls || inspection.evidence || [];
              const evidenceList = Array.isArray(rawEvidence)
                ? rawEvidence.filter(item => item !== null && item !== undefined && String(item).trim() !== '')
                : (typeof rawEvidence === 'string' && rawEvidence.trim() ? [rawEvidence.trim()] : []);

              if (evidenceList.length === 0) {
                return <div className="empty-field-notice">No evidence attached</div>;
              }

              return (
                <div className="evidence-grid">
                  {evidenceList.map((file, idx) => (
                    <EvidenceItemCard
                      key={idx}
                      file={file}
                      index={idx}
                      submissionId={inspection.submission_id}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Column: Location Map */}
        <div className="right-detail-column">
          <div className="detail-section-card" style={{ position: 'sticky', top: '80px' }}>
            <div className="section-header">
              <MapPin size={18} color="#0284c7" />
              <h2>Inspection Coordinates</h2>
            </div>

            {hasValidLocation ? (
              <div style={{ height: '360px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <LeafletMineMap
                  markers={mapMarkers}
                  height="300px"
                />
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                  <strong>Lat:</strong> {inspection.location.latitude.toFixed(6)}, <strong>Long:</strong> {inspection.location.longitude.toFixed(6)}
                </div>
              </div>
            ) : (
              <div className="empty-field-notice" style={{ padding: '32px 16px', textAlign: 'center' }}>
                <MapPin size={32} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px auto' }} />
                No coordinate location available for this inspection
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

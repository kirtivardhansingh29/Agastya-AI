import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, MapPin, AlertOctagon, BellRing, FileText, Camera, User, Building, Wrench, Stethoscope, Users } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getIncidentDetail } from '../services/api';
import LeafletMineMap from '../components/map/LeafletMineMap';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';
import '../styles/incidents.css';

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

export default function IncidentDetailPage({ submissionId, onBack, onSelectMine }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getIncidentDetail(submissionId);
        if (isMounted) {
          setIncident(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Failed to load incident detail for ${submissionId}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { isMounted = false; };
  }, [submissionId]);

  if (loading) return <LoadingSkeleton />;
  if (error || !incident) {
    return (
      <div className="monitoring-page">
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Incidents
        </button>
        <ErrorState message={error || "Incident record not found (HTTP 404)"} onRetry={onBack} />
      </div>
    );
  }

  const sev = String(incident.severity || '').toLowerCase();
  const isFatal = sev === 'fatal';
  const isCritical = sev === 'critical';
  const isMajor = sev === 'major';
  const isAuthAlert = String(incident.notify_authority_immediately).toLowerCase() === 'yes';

  const severityBadgeClass =
    isFatal ? 'badge-fatal-prominent' :
    isCritical ? 'badge-critical' :
    isMajor ? 'badge-high' : 'badge-warning';

  const hasValidLocation = incident.location &&
    typeof incident.location.latitude === 'number' &&
    typeof incident.location.longitude === 'number' &&
    !isNaN(incident.location.latitude) &&
    !isNaN(incident.location.longitude);

  const mapMarkers = hasValidLocation ? [{
    id: incident.submission_id,
    mine_id: incident.mine_id,
    mine_name: incident.mine_name || incident.mine_id,
    latitude: incident.location.latitude,
    longitude: incident.location.longitude,
    risk_level: incident.severity || 'high',
    status: incident.sync_status || 'synced'
  }] : [];

  const peopleAffectedCount = typeof incident.people_affected === 'number' ? incident.people_affected : 0;
  const affectedDetails = Array.isArray(incident.affected_person_details) ? incident.affected_person_details : [];

  // Extract evidence list
  const rawEvidence = incident.photos_or_videos || incident.photos || incident.evidence_files || incident.evidence_urls || incident.evidence || [];
  const evidenceList = Array.isArray(rawEvidence)
    ? rawEvidence.filter(item => item !== null && item !== undefined && String(item).trim() !== '')
    : (typeof rawEvidence === 'string' && rawEvidence.trim() ? [rawEvidence.trim()] : []);

  return (
    <div className="monitoring-page">
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button className="btn-secondary" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Incidents
        </button>

        {incident.mine_id && (
          <button className="btn-primary" onClick={() => onSelectMine(incident.mine_id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Building size={14} /> View Mine ({incident.mine_id}) <ExternalLink size={14} />
          </button>
        )}
      </div>

      {/* Dossier Header Card */}
      <div className="detail-header-card">
        <div className="detail-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="detail-title">{incident.submission_id}</h1>
            <span className={`badge ${severityBadgeClass}`}>
              {(incident.severity || 'UNCATEGORIZED').toUpperCase()}
            </span>
            {isAuthAlert && (
              <span className="badge badge-critical" style={{ background: '#7f1d1d', color: '#ffffff', border: '1px solid #991b1b' }}>
                <BellRing size={12} /> IMMEDIATE AUTHORITY ALERT
              </span>
            )}
            <span className={`badge ${incident.review_status === 'resolved' ? 'badge-operating' : 'badge-warning'}`}>
              Review Status: {incident.review_status ? incident.review_status.replace('_', ' ') : '—'}
            </span>
          </div>
          <p className="detail-subtitle">
            Incident Type: <strong style={{ textTransform: 'capitalize', color: '#0f172a' }}>{incident.incident_type ? incident.incident_type.replace('_', ' ') : '—'}</strong> |
            Date &amp; Time: <strong style={{ color: '#0f172a' }}>{incident.date_time ? new Date(incident.date_time).toLocaleString() : '—'}</strong>
          </p>
        </div>

        {/* Dossier Meta Info Grid */}
        <div className="dossier-meta-grid">
          <div className="meta-item">
            <span className="meta-label"><Building size={14} /> Mine Name &amp; ID</span>
            <span className="meta-value">
              {incident.mine_name || '—'}{' '}
              <code style={{ fontSize: '12px', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                {incident.mine_id || '—'}
              </code>
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><User size={14} /> Inspector</span>
            <span className="meta-value">
              {incident.inspector_name || '—'}{' '}
              {incident.inspector_id && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>({incident.inspector_id})</span>
              )}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><MapPin size={14} /> Location / State</span>
            <span className="meta-value">
              {incident.district ? `${incident.district}, ` : ''}{incident.state || '—'}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Sync Status</span>
            <span className="meta-value" style={{ textTransform: 'capitalize' }}>
              <span className={`badge ${incident.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                {incident.sync_status || '—'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Map */}
      <div className="inspection-detail-grid">
        <div className="left-detail-column">
          {/* Section: Complete Description */}
          <div className="detail-section-card">
            <div className="section-header">
              <AlertOctagon size={18} color="#dc2626" />
              <h2>Complete Incident Description</h2>
            </div>
            <div className="field-content-box" style={{ borderLeft: '4px solid #dc2626' }}>
              {incident.description || '—'}
            </div>
          </div>

          {/* Section: Immediate Action Taken */}
          <div className="detail-section-card">
            <div className="section-header">
              <FileText size={18} color="#0284c7" />
              <h2>Immediate Action Taken</h2>
            </div>
            <div className="field-content-box" style={{ borderLeft: '4px solid #0284c7', background: '#f0f9ff' }}>
              {incident.immediate_action_taken || '—'}
            </div>
          </div>

          {/* Section: People Affected */}
          <div className="detail-section-card">
            <div className="section-header">
              <Users size={18} color={peopleAffectedCount > 0 ? '#dc2626' : '#16a34a'} />
              <h2>People Affected ({peopleAffectedCount})</h2>
            </div>

            {peopleAffectedCount === 0 ? (
              <div className="no-violation-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span className="no-violation-text">No people affected</span>
              </div>
            ) : (
              <div className="affected-persons-box">
                <div style={{ fontWeight: '700', color: '#b91c1c', marginBottom: '8px', fontSize: '13px' }}>
                  Recorded Casualty / Impacted Personnel Details:
                </div>
                {affectedDetails.length > 0 ? (
                  <ul className="affected-persons-list">
                    {affectedDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="field-content-box" style={{ color: '#b91c1c' }}>
                    {peopleAffectedCount} personnel recorded as affected.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Medical Attention & Equipment */}
          <div className="detail-section-card">
            <div className="section-header">
              <Stethoscope size={18} color="#0284c7" />
              <h2>Medical Attention &amp; Equipment Involved</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="field-group">
                <label className="field-label"><Stethoscope size={13} /> Medical Attention Required</label>
                <div>
                  <span className={`badge ${String(incident.medical_attention_required).toLowerCase() === 'yes' ? 'badge-critical' : 'badge-compliant'}`}>
                    {String(incident.medical_attention_required).toUpperCase() === 'YES' ? 'YES (REQUIRED)' : 'NO'}
                  </span>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label"><Wrench size={13} /> Equipment Involved</label>
                <div className="meta-value">
                  {incident.equipment_involved || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Incident Evidence Attachments */}
          <div className="detail-section-card">
            <div className="section-header">
              <Camera size={18} color="#0284c7" />
              <h2>Evidence Attachments</h2>
            </div>

            {evidenceList.length > 0 ? (
              <div className="evidence-grid">
                {evidenceList.map((file, idx) => (
                  <EvidenceItemCard
                    key={idx}
                    file={file}
                    index={idx}
                    submissionId={incident.submission_id}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-field-notice">No evidence attached</div>
            )}
          </div>
        </div>


        {/* Right Column: Location Map */}
        <div className="right-detail-column">
          <div className="detail-section-card" style={{ position: 'sticky', top: '80px' }}>
            <div className="section-header">
              <MapPin size={18} color="#0284c7" />
              <h2>Incident Coordinates</h2>
            </div>

            {hasValidLocation ? (
              <div style={{ height: '360px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <LeafletMineMap
                  markers={mapMarkers}
                  height="300px"
                />
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                  <strong>Lat:</strong> {incident.location.latitude.toFixed(6)}, <strong>Long:</strong> {incident.location.longitude.toFixed(6)}
                </div>
              </div>
            ) : (
              <div className="empty-field-notice" style={{ padding: '32px 16px', textAlign: 'center' }}>
                <MapPin size={32} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px auto' }} />
                Location unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

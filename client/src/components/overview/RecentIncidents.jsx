import React, { useState } from 'react';
import { Database, Smartphone, CheckCircle, ExternalLink, ShieldAlert, FileText, Send } from 'lucide-react';

export default function RecentIncidents({ incidents }) {
  const [filterMode, setFilterMode] = useState('all');

  const rawList = incidents || [];
  const displayList = filterMode === 'immediate'
    ? rawList.filter(i => i.severity === 'critical' || i.severity === 'major')
    : rawList;

  const totalCount = rawList.length;
  const immediateCount = rawList.filter(i => i.severity === 'critical' || i.severity === 'major').length;

  return (
    <section className="incidents-section">
      <div className="incidents-section-header">
        <div className="incidents-header-left">
          <div className="incidents-title-row">
            <span className="incidents-title">Recent Incidents &amp; Field Safety Submissions</span>
            <span className="badge-tag badge-raw">
              <Database size={9} />
              [RAW MOBILE DATA]
            </span>
          </div>
          <span className="incidents-subtext">
            Directly received from Mobile Inspector handhelds. Incidents flagged for immediate regulatory dispatch require authority sign-off within 60 minutes.
          </span>
        </div>

        <div className="incidents-filter-tabs">
          <span className="incidents-filter-label">Filter by status:</span>
          <button
            className={`filter-tab-pill ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-tab-pill ${filterMode === 'immediate' ? 'active-danger' : ''}`}
            onClick={() => setFilterMode('immediate')}
          >
            Immediate Action ({immediateCount})
          </button>
        </div>
      </div>

      {displayList.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No recent incidents reported
        </div>
      ) : (
        <div className="incidents-cards-grid">
          {displayList.slice(0, 3).map((item) => {
            const isCritical = item.severity === 'critical';
            const isMajor = item.severity === 'major';
            const isResolved = item.review_status === 'resolved';

            const headerBadgeClass =
              isCritical ? 'badge-critical' :
              isMajor ? 'badge-warning' : 'badge-neutral';

            const photoCount = Array.isArray(item.photos_or_videos) ? item.photos_or_videos.length : 0;

            return (
              <div key={item.submission_id} className="incident-card">
                <div className="incident-card-top-bar">
                  <div className="incident-badges-group">
                    <span className={`badge-tag ${headerBadgeClass}`}>
                      {item.badge_label || (isCritical ? 'AUTHORITY ALERT' : isMajor ? 'MAJOR HAZARD' : 'RESOLVED ON-SITE')}
                    </span>
                    {isCritical && (
                      <span className="badge-tag badge-critical">CRITICAL</span>
                    )}
                  </div>
                  <span className="incident-sub-id">{item.submission_id}</span>
                </div>

                <div>
                  <h3 className="incident-title">{item.description ? item.description.split('.')[0] : 'Safety Incident Reported'}</h3>
                  <span className="incident-location-line">{item.location_display || item.mine_id}</span>
                </div>

                <div className="incident-details-box">
                  <div className="incident-detail-item">
                    <span className="incident-detail-label">People Affected</span>
                    <span className="incident-detail-val" style={{ color: item.people_affected > 0 ? 'var(--critical-red)' : 'inherit' }}>
                      {item.people_affected !== undefined && item.people_affected !== null
                        ? item.people_affected
                        : '—'}
                    </span>
                  </div>

                  <div className="incident-detail-item">
                    <span className="incident-detail-label">Inspector ID</span>
                    <span className="incident-detail-val font-mono">{item.inspector_id || '—'}</span>
                  </div>

                  <div className="incident-detail-item">
                    <span className="incident-detail-label">Telemetry Timestamp</span>
                    <span className="incident-detail-val">
                      {item.date_time ? new Date(item.date_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>

                  <div className="incident-detail-item">
                    <span className="incident-detail-label">
                      {isResolved ? 'Review Status' : 'GPS Coordinate'}
                    </span>
                    <span className="incident-detail-val" style={{ color: isResolved ? 'var(--compliant-green)' : 'inherit' }}>
                      {isResolved
                        ? 'CLOSED'
                        : item.location?.latitude && item.location?.longitude
                          ? `${item.location.latitude.toFixed(4)}° N, ${item.location.longitude.toFixed(4)}° E`
                          : '—'}
                    </span>
                  </div>
                </div>

                <div className="incident-sync-notice">
                  {isResolved ? <CheckCircle size={12} color="#16a34a" /> : <Smartphone size={12} />}
                  <span>{item.sync_source || 'Synced via Inspector Mobile Device'}</span>
                </div>

                <div className="incident-actions-bar">
                  {isCritical && (
                    <>
                      <button
                        className="btn-outline"
                        onClick={() => alert(`Viewing ${photoCount} mobile photo attachments`)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        View Photos ({photoCount})
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => alert(`Dispatching DGMS inquiry commission for ${item.submission_id}`)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        <Send size={11} />
                        <span>Dispatch Inquiry</span>
                      </button>
                    </>
                  )}

                {isMajor && (
                  <>
                    <button
                      className="btn-outline"
                      onClick={() => alert(`Opening mobile inspection checklist for ${item.submission_id}`)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      <FileText size={11} />
                      <span>Inspection Form</span>
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => alert(`Issuing formal DGMS Show-Cause notice under CMR-2017`)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      <ShieldAlert size={11} />
                      <span>Issue Show-Cause</span>
                    </button>
                  </>
                )}

                {isResolved && (
                  <button
                    className="btn-outline"
                    onClick={() => alert(`Downloading signed closure certificate for ${item.submission_id}`)}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    <ExternalLink size={11} />
                    <span>View Closure Certificate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
}

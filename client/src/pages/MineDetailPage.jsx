import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, ClipboardCheck, ShieldAlert, AlertOctagon, RefreshCw, Users, FileText, CheckCircle, Sparkles } from 'lucide-react';
import LeafletMineMap from '../components/map/LeafletMineMap';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import {
  getMine,
  getMineSummary,
  getMineInspections,
  getMineIncidents,
  getMineViolations,
  getMineAttendance,
  getMineContractors,
  getMineGrievances,
  getAIMineAnalysis
} from '../services/api';
import '../styles/mine-detail.css';
import '../styles/ai-risk.css';


export default function MineDetailPage({ mineId, onBack, onSelectInspection, onSelectIncident, onSelectContractor, onSelectGrievance, onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mineData, setMineData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [attendanceRes, setAttendanceRes] = useState(null);
  const [mineContractors, setMineContractors] = useState([]);
  const [mineGrievances, setMineGrievances] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);

  const handleRunAiAnalysis = async () => {
    if (isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      setAiError(null);
      setActiveTab('ai-analysis');
      const res = await getAIMineAnalysis(mineId);
      setAiAnalysis(res);
    } catch (err) {
      console.error("AI Analysis error:", err);
      setAiError(err.message || "Failed to generate AI mine risk analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const loadDossierData = useCallback(async () => {
    if (!mineId) return;
    try {
      setLoading(true);
      setError(null);
      const [mineRes, summaryRes, inspRes, incRes, violRes, attRes, contrRes, grvRes] = await Promise.all([
        getMine(mineId),
        getMineSummary(mineId),
        getMineInspections(mineId),
        getMineIncidents(mineId),
        getMineViolations(mineId).catch(() => []),
        getMineAttendance(mineId).catch(() => null),
        getMineContractors(mineId).catch(() => []),
        getMineGrievances(mineId).catch(() => [])
      ]);

      setMineData(mineRes);
      setSummaryData(summaryRes);
      setInspections(inspRes || []);
      setIncidents(incRes || []);
      setViolations(violRes || []);
      setAttendanceRes(attRes || null);
      setMineContractors(contrRes || []);
      setMineGrievances(grvRes || []);
    } catch (err) {
      console.error(`Error loading dossier for mine ${mineId}:`, err);
      setError(err.message || "Failed to load mine dossier");
    } finally {
      setLoading(false);
    }
  }, [mineId]);

  useEffect(() => {
    loadDossierData();
  }, [loadDossierData]);

  if (loading && !mineData) {
    return <LoadingSkeleton />;
  }

  if (error && !mineData) {
    return <ErrorState message={error} onRetry={loadDossierData} />;
  }

  const lat = mineData?.location?.latitude;
  const lon = mineData?.location?.longitude;
  const hasCoordinates = typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);

  const mapMarker = hasCoordinates ? [{
    mine_id: mineData.mine_id,
    mine_name: mineData.mine_name,
    state: mineData.state,
    district: mineData.district,
    operator: mineData.operator,
    status: mineData.status,
    risk_level: mineData.risk_level,
    latitude: lat,
    longitude: lon
  }] : [];

  const riskLevel = mineData?.risk_level;
  const riskBadgeClass =
    riskLevel === 'critical' ? 'badge-critical' :
    riskLevel === 'high' ? 'badge-high' :
    riskLevel === 'warning' ? 'badge-warning' :
    riskLevel === 'compliant' ? 'badge-compliant' : 'badge-neutral';

  return (
    <div className="detail-page">
      {/* Back Button */}
      <button className="detail-back-btn" onClick={onBack}>
        <ArrowLeft size={14} />
        <span>Back to Mine Directory</span>
      </button>

      {/* Mine Header Box */}
      <div className="detail-header-card">
        <div className="detail-header-main">
          <div className="detail-title-row" style={{ alignItems: 'center' }}>
            <h1 className="detail-mine-title">{mineData?.mine_name || '—'}</h1>
            <span className={`badge ${mineData?.status === 'operating' ? 'badge-operating' : 'badge-suspended'}`}>
              {mineData?.status || '—'}
            </span>
            <span className={`badge ${riskBadgeClass}`}>
              {riskLevel ? riskLevel.toUpperCase() : 'UNKNOWN'}
            </span>
            <button
              className="btn-ai-analyze"
              disabled={isAnalyzing}
              onClick={handleRunAiAnalysis}
              style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '12px' }}
            >
              <Sparkles size={14} />
              <span>{isAnalyzing ? 'Analyzing mine data...' : 'AI ANALYSIS'}</span>
            </button>
          </div>

          <div className="detail-header-meta">
            <span>Mine ID: <strong className="mine-id-code">{mineData?.mine_id}</strong></span>
            <span>State: <strong>{mineData?.state || '—'}</strong></span>
            <span>District: <strong>{mineData?.district || '—'}</strong></span>
            <span>Operator: <strong>{mineData?.operator || '—'}</strong></span>
          </div>

          <div className="detail-header-meta" style={{ marginTop: '4px' }}>
            <span>Coalfield: <strong>{mineData?.coalfield || '—'}</strong></span>
            <span>Methane Level: <strong>{mineData?.methane_level || '—'}</strong></span>
            <span>Inspector in Charge: <strong>{mineData?.inspector_in_charge || '—'}</strong></span>
          </div>
        </div>

        {/* Selected Mine Map Thumbnail */}
        <div className="detail-map-thumbnail-container">
          {hasCoordinates ? (
            <LeafletMineMap markers={mapMarker} height="100%" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '12px' }}>
              No location data available
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="detail-kpi-grid">
        <div className="detail-kpi-card">
          <span className="detail-kpi-label">Total Inspections</span>
          <span className="detail-kpi-val">{summaryData?.totalInspections ?? '—'}</span>
        </div>
        <div className="detail-kpi-card">
          <span className="detail-kpi-label">Total Violations</span>
          <span className="detail-kpi-val" style={{ color: summaryData?.totalViolations > 0 ? '#fb923c' : '#ffffff' }}>
            {summaryData?.totalViolations ?? '—'}
          </span>
        </div>
        <div className="detail-kpi-card">
          <span className="detail-kpi-label">Critical Violations</span>
          <span className="detail-kpi-val" style={{ color: summaryData?.criticalViolations > 0 ? '#f87171' : '#ffffff' }}>
            {summaryData?.criticalViolations ?? '—'}
          </span>
        </div>
        <div className="detail-kpi-card">
          <span className="detail-kpi-label">Total Incidents</span>
          <span className="detail-kpi-val" style={{ color: summaryData?.totalIncidents > 0 ? '#f87171' : '#ffffff' }}>
            {summaryData?.totalIncidents ?? '—'}
          </span>
        </div>
        <div className="detail-kpi-card">
          <span className="detail-kpi-label">Pending Sync</span>
          <span className="detail-kpi-val" style={{ color: summaryData?.pendingSyncCount > 0 ? '#facc15' : '#ffffff' }}>
            {summaryData?.pendingSyncCount ?? '—'}
          </span>
        </div>
        <div className="detail-kpi-card">
          <span className="detail-kpi-label">Latest Attendance</span>
          <span className="detail-kpi-val">
            {summaryData?.latestAttendanceHeadcount !== null && summaryData?.latestAttendanceHeadcount !== undefined
              ? `${summaryData.latestAttendanceHeadcount} Workers`
              : '—'}
          </span>
        </div>
      </div>

      {/* Dossier Tabs Bar */}
      <div className="detail-tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'inspections' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspections')}
        >
          Inspections ({inspections.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          Incidents ({incidents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'violations' ? 'active' : ''}`}
          onClick={() => setActiveTab('violations')}
        >
          Violations
        </button>
        <button
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === 'grievances' ? 'active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          Grievances ({mineGrievances.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'contractors' ? 'active' : ''}`}
          onClick={() => setActiveTab('contractors')}
        >
          Contractors ({mineContractors.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          className={`tab-btn ${activeTab === 'corrective-actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('corrective-actions')}
        >
          Corrective Actions
        </button>
        <button
          className={`tab-btn ${activeTab === 'ai-analysis' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('ai-analysis');
            if (!aiAnalysis && !isAnalyzing) {
              handleRunAiAnalysis();
            }
          }}
          style={{ color: activeTab === 'ai-analysis' ? '#c084fc' : '#a855f7', fontWeight: '700' }}
        >
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
          AI Risk Analysis
        </button>
      </div>

      {/* Tab Contents */}
      <div className="tab-content-card">
        {activeTab === 'overview' && (
          <div className="dossier-meta-list">
            <div className="dossier-meta-box">
              <label>Official Mine Name</label>
              <span>{mineData?.mine_name || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Unique Regulatory ID</label>
              <span className="mine-id-code">{mineData?.mine_id}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Coalfield Region</label>
              <span>{mineData?.coalfield || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>State &amp; District</label>
              <span>{mineData?.state || '—'} • {mineData?.district || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Operating Organization</label>
              <span>{mineData?.operator || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Operational Status</label>
              <span>{mineData?.status || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Continuous Methane Level</label>
              <span>{mineData?.methane_level || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Gas Breach Status</label>
              <span style={{ color: mineData?.gas_breach ? '#f87171' : '#4ade80' }}>
                {mineData?.gas_breach === true ? 'GAS BREACH DETECTED' : mineData?.gas_breach === false ? 'No Breach' : '—'}
              </span>
            </div>
            <div className="dossier-meta-box">
              <label>Risk Level Classification</label>
              <span>{mineData?.risk_level ? mineData.risk_level.toUpperCase() : 'UNKNOWN'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Assigned DGMS Inspector</label>
              <span>{mineData?.inspector_in_charge || '—'}</span>
            </div>
            <div className="dossier-meta-box">
              <label>Geographic Coordinates</label>
              <span>
                {hasCoordinates ? `Lat: ${lat}°, Lon: ${lon}°` : '—'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div>
            {inspections.length === 0 ? (
              <div className="empty-state-box">No inspection records found for this mine.</div>
            ) : (
              <div className="table-wrapper">
                <table className="mine-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Date / Time</th>
                      <th>Inspector</th>
                      <th>Type</th>
                      <th>Violation Found</th>
                      <th>Severity</th>
                      <th>Review Status</th>
                      <th>Sync Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map(insp => (
                      <tr key={insp.submission_id} style={{ cursor: 'pointer' }} onClick={() => onSelectInspection && onSelectInspection(insp.submission_id)}>
                        <td className="mine-id-code">{insp.submission_id}</td>
                        <td>{insp.date_time ? new Date(insp.date_time).toLocaleString() : '—'}</td>
                        <td>{insp.inspector_name || insp.inspector_id || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{insp.inspection_type || '—'}</td>
                        <td>
                          <span className={`badge ${String(insp.violation_found).toLowerCase() === 'yes' ? 'badge-critical' : 'badge-compliant'}`}>
                            {insp.violation_found ? String(insp.violation_found).toUpperCase() : '—'}
                          </span>
                        </td>
                        <td>
                          {insp.violation_severity ? (
                            <span className={`badge badge-${insp.violation_severity}`}>
                              {insp.violation_severity.toUpperCase()}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{insp.review_status || '—'}</td>
                        <td>
                          <span className={`badge ${insp.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                            {insp.sync_status || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div>
            {incidents.length === 0 ? (
              <div className="empty-state-box">No incident records found for this mine.</div>
            ) : (
              <div className="table-wrapper">
                <table className="mine-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Date / Time</th>
                      <th>Incident Type</th>
                      <th>Severity</th>
                      <th>People Affected</th>
                      <th>Authority Alert</th>
                      <th>Review Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(inc => (
                      <tr key={inc.submission_id} style={{ cursor: 'pointer' }} onClick={() => onSelectIncident && onSelectIncident(inc.submission_id)}>
                        <td className="mine-id-code">{inc.submission_id}</td>
                        <td>{inc.date_time ? new Date(inc.date_time).toLocaleString() : '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{inc.incident_type ? inc.incident_type.replace('_', ' ') : '—'}</td>
                        <td>
                          <span className={`badge badge-${inc.severity || 'neutral'}`}>
                            {inc.severity ? inc.severity.toUpperCase() : '—'}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700', color: inc.people_affected > 0 ? '#dc2626' : '#0f172a' }}>
                          {inc.people_affected ?? '0'}
                        </td>
                        <td>
                          <span className={`badge ${String(inc.notify_authority_immediately).toLowerCase() === 'yes' ? 'badge-critical' : 'badge-neutral'}`}>
                            {inc.notify_authority_immediately ? String(inc.notify_authority_immediately).toUpperCase() : '—'}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{inc.review_status ? inc.review_status.replace('_', ' ') : '—'}</td>
                        <td>
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIncident && onSelectIncident(inc.submission_id);
                            }}
                          >
                            View Incident
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'violations' && (
          <div>
            {violations.length === 0 ? (
              <div className="empty-state-box">No violation records recorded for this mine.</div>
            ) : (
              <div className="table-wrapper">
                <table className="mine-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Date / Time</th>
                      <th>Severity</th>
                      <th>Violation Description</th>
                      <th>Corrective Action</th>
                      <th>Review Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map(v => (
                      <tr key={v.submission_id} style={{ cursor: 'pointer' }} onClick={() => onSelectInspection && onSelectInspection(v.submission_id)}>
                        <td className="mine-id-code">{v.submission_id}</td>
                        <td>{v.date_time ? new Date(v.date_time).toLocaleString() : '—'}</td>
                        <td>
                          <span className={`badge badge-${v.violation_severity}`}>
                            {(v.violation_severity || 'UNCATEGORIZED').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{v.violation_description || '—'}</td>
                        <td style={{ fontSize: '13px' }}>{v.corrective_action || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{v.review_status || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'corrective-actions' && (
          <div>
            {violations.length === 0 ? (
              <div className="empty-state-box">No corrective actions prescribed for this mine.</div>
            ) : (
              <div className="table-wrapper">
                <table className="mine-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Severity</th>
                      <th>Violation Description</th>
                      <th>Corrective Action Directive</th>
                      <th>Review Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map(v => (
                      <tr key={v.submission_id} style={{ cursor: 'pointer' }} onClick={() => onSelectInspection && onSelectInspection(v.submission_id)}>
                        <td className="mine-id-code">{v.submission_id}</td>
                        <td>
                          <span className={`badge badge-${v.violation_severity}`}>
                            {(v.violation_severity || 'UNCATEGORIZED').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{v.violation_description || '—'}</td>
                        <td style={{ fontSize: '13px', fontWeight: '500' }}>{v.corrective_action || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{v.review_status || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            {!attendanceRes || !attendanceRes.records || attendanceRes.records.length === 0 ? (
              <div className="empty-state-box">No attendance records found for this mine.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Single Latest Submission Headcount Banner */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Latest Attendance Snapshot ({attendanceRes.latestRecord?.date_time ? new Date(attendanceRes.latestRecord.date_time).toLocaleString() : '—'})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Expected Headcount</span>
                      <strong style={{ fontSize: '18px', color: '#0284c7' }}>{attendanceRes.metrics?.expectedHeadcount ?? '—'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Actual Headcount</span>
                      <strong style={{ fontSize: '18px', color: '#16a34a' }}>{attendanceRes.metrics?.actualHeadcount ?? '—'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Attendance Rate</span>
                      <strong style={{ fontSize: '18px', color: '#ca8a04' }}>{attendanceRes.metrics?.attendanceRate ?? 0}%</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Workforce Difference</span>
                      <strong style={{ fontSize: '18px', color: '#ea580c' }}>{attendanceRes.metrics?.workforceDifference ?? '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Mine Attendance Records Table */}
                <div className="table-wrapper">
                  <table className="mine-table">
                    <thead>
                      <tr>
                        <th>Submission ID</th>
                        <th>Shift</th>
                        <th>Recorded Personnel</th>
                        <th>Worker Type</th>
                        <th>Contractor ID</th>
                        <th>Expected Headcount</th>
                        <th>Actual Headcount</th>
                        <th>Date &amp; Time</th>
                        <th>Sync Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRes.records.map(att => (
                        <tr key={att.submission_id}>
                          <td className="mine-id-code">{att.submission_id}</td>
                          <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>{att.shift || '—'}</td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{att.worker_name || '—'}</div>
                            {att.worker_id && <div style={{ fontSize: '11px', color: '#64748b' }}>({att.worker_id})</div>}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{att.worker_type || '—'}</td>
                          <td style={{ fontSize: '13px' }}>{att.contractor_id || '—'}</td>
                          <td style={{ fontWeight: '600' }}>{att.expected_headcount ?? '—'}</td>
                          <td style={{ fontWeight: '700', color: '#16a34a' }}>{att.actual_headcount ?? '—'}</td>
                          <td>{att.date_time ? new Date(att.date_time).toLocaleString() : '—'}</td>
                          <td>
                            <span className={`badge ${att.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                              {att.sync_status || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grievances' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Grievances &amp; Observations for this Mine</h3>
              {onNavigateTab && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '5px 12px' }}
                  onClick={() => onNavigateTab('grievances', mineId)}
                >
                  View All Grievances
                </button>
              )}
            </div>

            {mineGrievances.length === 0 ? (
              <div className="empty-state-box">No grievance or observation records found for this mine.</div>
            ) : (
              <div className="table-wrapper">
                <table className="mine-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Entry Type</th>
                      <th>Category</th>
                      <th>Inspector</th>
                      <th>AI Priority</th>
                      <th>Date / Time</th>
                      <th>Review Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mineGrievances.map(g => {
                      const isGrievance = String(g.entry_type).toLowerCase() === 'grievance';
                      const isAiFlagged = String(g.priority_flagged_by_ai).toLowerCase() === 'yes';

                      return (
                        <tr key={g.submission_id} style={{ cursor: 'pointer' }} onClick={() => onSelectGrievance && onSelectGrievance(g.submission_id)}>
                          <td className="mine-id-code">{g.submission_id}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className={`badge ${isGrievance ? 'badge-high' : 'badge-neutral'}`}>
                              {g.entry_type || '—'}
                            </span>
                          </td>
                          <td style={{ textTransform: 'capitalize', fontWeight: '500' }}>{g.category || '—'}</td>
                          <td>{g.inspector_name || g.inspector_id || '—'}</td>
                          <td>
                            {isAiFlagged ? (
                              <span className="badge" style={{ background: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe', fontWeight: '800' }}>
                                AI PRIORITY
                              </span>
                            ) : (
                              <span className="badge badge-neutral">NORMAL</span>
                            )}
                          </td>
                          <td>{g.date_time ? new Date(g.date_time).toLocaleString() : '—'}</td>
                          <td style={{ textTransform: 'capitalize' }}>{g.review_status || '—'}</td>
                          <td>
                            <button
                              className="btn-primary"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectGrievance && onSelectGrievance(g.submission_id);
                              }}
                            >
                              View Entry
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contractors' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Contractors Recorded in Attendance Records</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Contractor organizations appearing in attendance logs for this mine</p>
            </div>

            {mineContractors.length === 0 ? (
              <div className="empty-state-box">No contractor attendance records found for this mine.</div>
            ) : (
              <div className="table-wrapper">
                <table className="mine-table">
                  <thead>
                    <tr>
                      <th>Contractor ID</th>
                      <th>Company Name</th>
                      <th>License Status</th>
                      <th>Insurance Status</th>
                      <th>Document Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mineContractors.map(c => {
                      const licBadge = c.license_status === 'Valid' ? 'badge-operating' : 'badge-critical';
                      const insBadge = c.insurance_status === 'active' ? 'badge-operating' : 'badge-warning';
                      const docBadge =
                        c.document_status === 'Valid' ? 'badge-operating' :
                        c.document_status === 'Expiring Soon' ? 'badge-warning' :
                        c.document_status === 'Expired' ? 'badge-critical' : 'badge-neutral';

                      return (
                        <tr key={c.contractor_id} style={{ cursor: 'pointer' }} onClick={() => onSelectContractor && onSelectContractor(c.contractor_id)}>
                          <td className="mine-id-code">{c.contractor_id}</td>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>{c.company_name}</td>
                          <td>
                            <span className={`badge ${licBadge}`}>
                              {c.license_status?.toUpperCase() || '—'}
                            </span>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className={`badge ${insBadge}`}>
                              {c.insurance_status ? c.insurance_status.replace('_', ' ') : '—'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${docBadge}`}>
                              {c.document_status || '—'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-primary"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectContractor && onSelectContractor(c.contractor_id);
                              }}
                            >
                              View Contractor
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {['documents'].includes(activeTab) && (
          <div className="coming-soon-box">
            Coming in a later phase
          </div>
        )}

        {activeTab === 'ai-analysis' && (
          <div>
            <div className="ai-analysis-trigger-card" style={{ marginTop: 0, marginBottom: '20px' }}>
              <div className="ai-trigger-info">
                <h3><Sparkles size={16} style={{ color: '#0284c7' }} /> AI Risk Intelligence</h3>
                <p>AI-assisted analysis of mine safety conditions, inspection findings, and incident history.</p>
              </div>
              <button
                className="btn-ai-analyze"
                disabled={isAnalyzing}
                onClick={handleRunAiAnalysis}
              >
                <Sparkles size={14} />
                <span>{isAnalyzing ? 'Analyzing mine data...' : 'Re-Run AI Analysis'}</span>
              </button>
            </div>

            {isAnalyzing && (
              <div className="ai-loading-box">
                <div className="ai-spinner"></div>
                <span className="ai-loading-text">Analyzing mine safety telemetry &amp; compliance records...</span>
              </div>
            )}

            {aiError && !isAnalyzing && (
              <div className="empty-state-box" style={{ borderColor: '#ef4444', color: '#dc2626', background: '#fef2f2' }}>
                <strong style={{ display: 'block', marginBottom: '6px' }}>AI Risk Analysis Error:</strong> {aiError}
                <div style={{ marginTop: '14px' }}>
                  <button className="btn-ai-analyze" onClick={handleRunAiAnalysis}>Retry AI Analysis</button>
                </div>
              </div>
            )}

            {aiAnalysis && !isAnalyzing && (
              <div className="ai-result-panel" style={{ marginTop: 0 }}>
                {/* Result Header */}
                <div className="ai-result-header">
                  <div className="ai-result-title">
                    <Sparkles size={24} style={{ color: '#0284c7' }} />
                    <div>
                      <h2>AI Mine Risk Assessment — {aiAnalysis.mine?.mine_name || mineId}</h2>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Mine ID: <strong className="mine-id-code">{aiAnalysis.mine?.mine_id}</strong> | State: <strong>{aiAnalysis.mine?.state}</strong> | Operator: <strong>{aiAnalysis.mine?.operator}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="ai-risk-score-badge">
                    <span className="ai-score-label">Deterministic Risk Score</span>
                    <span className="ai-score-val" style={{ color: (aiAnalysis.deterministic_signals?.attention_score || 0) >= 70 ? '#dc2626' : (aiAnalysis.deterministic_signals?.attention_score || 0) >= 40 ? '#ea580c' : '#16a34a' }}>
                      {aiAnalysis.deterministic_signals?.attention_score ?? '—'} / 100
                    </span>
                  </div>
                </div>

                {/* Overall Assessment & Risk Explanation */}
                <div className="ai-assessment-card">
                  <h4>Overall Risk Assessment</h4>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}>
                    {aiAnalysis.analysis?.overall_assessment}
                  </p>
                  <p>{aiAnalysis.analysis?.risk_explanation}</p>
                </div>

                {/* Grid: Key Risk Factors & Notable Patterns */}
                <div className="ai-section-grid">
                  <div className="ai-section-card">
                    <h4 style={{ color: '#dc2626' }}>
                      <AlertOctagon size={14} /> Key Evidence Risk Factors
                    </h4>
                    <ul className="ai-bullet-list">
                      {aiAnalysis.analysis?.key_risk_factors?.map((rf, idx) => (
                        <li key={idx}>{rf}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="ai-section-card">
                    <h4 style={{ color: '#0284c7' }}>
                      <Sparkles size={14} /> Notable Operational Patterns
                    </h4>
                    <ul className="ai-bullet-list">
                      {aiAnalysis.analysis?.notable_patterns?.map((np, idx) => (
                        <li key={idx}>{np}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Grid: Incident Analysis & Inspection Analysis */}
                <div className="ai-section-grid">
                  <div className="ai-section-card">
                    <h4 style={{ color: '#ea580c' }}>
                      <ShieldAlert size={14} /> Incident Telemetry Analysis
                    </h4>
                    <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                      {aiAnalysis.analysis?.incident_analysis}
                    </p>
                  </div>

                  <div className="ai-section-card">
                    <h4 style={{ color: '#0369a1' }}>
                      <ClipboardCheck size={14} /> Inspection &amp; Compliance Analysis
                    </h4>
                    <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                      {aiAnalysis.analysis?.inspection_analysis}
                    </p>
                  </div>
                </div>

                {/* Prioritized Recommendations */}
                <div className="ai-section-card" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                  <h4 style={{ color: '#0369a1', marginBottom: '12px' }}>
                    <CheckCircle size={14} /> Prioritized DGMS Regulatory Recommendations
                  </h4>
                  {aiAnalysis.analysis?.recommendations?.map((rec, idx) => (
                    <div key={idx} className="ai-recommendation-item">
                      <span className="ai-rec-num">{idx + 1}</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Evidence Scope & Data Limitations */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px', fontSize: '11px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#334155', display: 'block', marginBottom: '4px' }}>Data Considered &amp; Evidence Scope:</strong>
                  <span>Mine Profile + Inspection Records ({aiAnalysis.deterministic_signals?.total_inspections || 0}) + Incident Telemetry ({aiAnalysis.deterministic_signals?.total_incidents || 0}).</span>
                  {aiAnalysis.analysis?.data_limitations?.length > 0 && (
                    <div style={{ marginTop: '6px' }}>
                      <em>Data Limitations: {aiAnalysis.analysis.data_limitations.join(' • ')}</em>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { AlertOctagon, ShieldAlert, AlertTriangle, Skull, Filter, RotateCcw, ChevronLeft, ChevronRight, BellRing } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getIncidents } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';
import '../styles/incidents.css';

export default function IncidentDirectoryPage({ onSelectIncident }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incidentsData, setIncidentsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    mine_id: 'ALL',
    incident_type: 'ALL',
    severity: 'ALL',
    review_status: 'ALL',
    notify_authority_immediately: 'ALL',
    from_date: '',
    to_date: '',
    search: '',
    page: 1,
    pageSize: 15
  });

  const loadIncidents = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getIncidents(activeFilters);

      setIncidentsData(res.data || []);
      setSummaryData(res.summary || {
        totalIncidents: 0,
        criticalIncidents: 0,
        majorIncidents: 0,
        fatalIncidents: 0
      });
      setPagination(res.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error loading incidents directory:", err);
      setError(err.message || "Failed to load incident records");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadIncidents(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleApply = () => {
    loadIncidents({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      state: 'ALL',
      district: 'ALL',
      mine_id: 'ALL',
      incident_type: 'ALL',
      severity: 'ALL',
      review_status: 'ALL',
      notify_authority_immediately: 'ALL',
      from_date: '',
      to_date: '',
      search: '',
      page: 1,
      pageSize: 15
    };
    setFilters(resetFilters);
    loadIncidents(resetFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    loadIncidents(updated);
  };

  const handlePageSizeChange = (newSize) => {
    const updated = { ...filters, pageSize: newSize, page: 1 };
    setFilters(updated);
    loadIncidents(updated);
  };

  if (loading && incidentsData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && incidentsData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadIncidents(filters)} />;
  }

  return (
    <div className="monitoring-page">
      {/* Header */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Incidents</h1>
          <span className="monitoring-subtitle">Centralized regulatory incident register across monitored mines</span>
        </div>
      </div>

      {/* Summary KPI Cards (Calculated on Filtered Dataset) */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <AlertOctagon size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Total Incidents</span>
            <span className="monitoring-kpi-value" style={{ color: '#0284c7' }}>{summaryData?.totalIncidents ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Critical Incidents</span>
            <span className="monitoring-kpi-value" style={{ color: '#dc2626' }}>{summaryData?.criticalIncidents ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Major Incidents</span>
            <span className="monitoring-kpi-value" style={{ color: '#ea580c' }}>{summaryData?.majorIncidents ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#450a0a', color: '#ffffff' }}>
            <Skull size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Fatal Incidents</span>
            <span className="monitoring-kpi-value" style={{ color: '#7f1d1d' }}>{summaryData?.fatalIncidents ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="monitoring-filter-bar">
        <div className="filter-group">
          <label>State</label>
          <select
            className="filter-select"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          >
            <option value="ALL">All States</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Odisha">Odisha</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Assam">Assam</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity</label>
          <select
            className="filter-select"
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="fatal">Fatal</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Incident Type</label>
          <select
            className="filter-select"
            value={filters.incident_type}
            onChange={(e) => handleFilterChange('incident_type', e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="gas_leak">Gas Leak / Methane Influx</option>
            <option value="roof_fall">Roof Fall / Strata Collapse</option>
            <option value="equipment_failure">Equipment Failure</option>
            <option value="inundation">Inundation / Water Ingress</option>
            <option value="fire">Fire / Heating</option>
            <option value="injury">Injury</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Authority Alert</label>
          <select
            className="filter-select"
            value={filters.notify_authority_immediately}
            onChange={(e) => handleFilterChange('notify_authority_immediately', e.target.value)}
          >
            <option value="ALL">All Alerts</option>
            <option value="yes">Immediate Alert (Yes)</option>
            <option value="no">Standard (No)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Review Status</label>
          <select
            className="filter-select"
            value={filters.review_status}
            onChange={(e) => handleFilterChange('review_status', e.target.value)}
          >
            <option value="ALL">All Review Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="under_investigation">Under Investigation</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            className="filter-input"
            value={filters.from_date}
            onChange={(e) => handleFilterChange('from_date', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            className="filter-input"
            value={filters.to_date}
            onChange={(e) => handleFilterChange('to_date', e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ flex: 1.5 }}>
          <label>Search ID / Mine / Inspector</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search submission ID, mine, inspector..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>

        <div className="filter-actions">
          <button className="btn-primary" onClick={handleApply} disabled={loading}>
            <Filter size={14} />
            <span>{loading ? 'Filtering...' : 'Apply Filters'}</span>
          </button>
          <button className="btn-secondary" onClick={handleReset} title="Reset Filters" disabled={loading}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Incident Directory Table */}
      <div className="monitoring-table-section">
        <div className="section-title-bar" style={{ padding: '16px 16px 0 16px' }}>
          <span className="section-title">Incident Submission Records</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {incidentsData.length} of {pagination.total} records
          </span>
        </div>

        {incidentsData.length === 0 ? (
          <div className="empty-state-box">
            No incident records found for the selected filters.
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="mine-table">
                <thead>
                  <tr>
                    <th className="col-id">Submission ID</th>
                    <th className="col-id">Mine ID</th>
                    <th className="col-name">Mine Name</th>
                    <th className="col-state">State</th>
                    <th className="col-district">District</th>
                    <th style={{ minWidth: '150px' }}>Inspector</th>
                    <th style={{ minWidth: '140px' }}>Incident Type</th>
                    <th className="col-risk">Severity</th>
                    <th style={{ minWidth: '120px' }}>People Affected</th>
                    <th className="col-inspection">Date &amp; Time</th>
                    <th style={{ minWidth: '130px' }}>Authority Alert</th>
                    <th style={{ minWidth: '130px' }}>Review Status</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentsData.map(inc => {
                    const sev = String(inc.severity || '').toLowerCase();
                    const isFatal = sev === 'fatal';
                    const isCritical = sev === 'critical';
                    const isMajor = sev === 'major';
                    const isAuthAlert = String(inc.notify_authority_immediately).toLowerCase() === 'yes';

                    const severityBadgeClass =
                      isFatal ? 'badge-fatal-prominent' :
                      isCritical ? 'badge-critical' :
                      isMajor ? 'badge-high' : 'badge-warning';

                    return (
                      <tr key={inc.submission_id} onClick={() => onSelectIncident(inc.submission_id)}>
                        <td className="col-id">{inc.submission_id}</td>
                        <td className="col-id" style={{ color: '#0284c7' }}>{inc.mine_id}</td>
                        <td className="col-name">{inc.mine_name || '—'}</td>
                        <td className="col-state">{inc.state || '—'}</td>
                        <td className="col-district">{inc.district || '—'}</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{inc.inspector_name || inc.inspector_id || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {inc.incident_type ? inc.incident_type.replace('_', ' ') : '—'}
                        </td>
                        <td>
                          <span className={`badge ${severityBadgeClass}`}>
                            {(inc.severity || 'UNCATEGORIZED').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700', color: inc.people_affected > 0 ? '#dc2626' : '#0f172a' }}>
                          {inc.people_affected ?? '0'}
                        </td>
                        <td className="col-inspection">
                          {inc.date_time ? new Date(inc.date_time).toLocaleString() : '—'}
                        </td>
                        <td>
                          <span className={`badge ${isAuthAlert ? 'badge-critical' : 'badge-neutral'}`}>
                            {isAuthAlert ? <><BellRing size={11} /> YES</> : 'NO'}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`badge ${inc.review_status === 'resolved' ? 'badge-operating' : 'badge-warning'}`}>
                            {inc.review_status ? inc.review_status.replace('_', ' ') : '—'}
                          </span>
                        </td>
                        <td className="col-action">
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIncident(inc.submission_id);
                            }}
                          >
                            View Incident
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <div className="pagination-info">
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total records)
              </div>
              <div className="pagination-controls">
                <label style={{ fontSize: '12px', color: '#64748b' }}>Per page:</label>
                <select
                  className="filter-select"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  value={filters.pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

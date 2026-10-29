import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, ShieldAlert, AlertOctagon, Clock, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getInspections } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';

export default function InspectionDirectoryPage({ onSelectInspection }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectionsData, setInspectionsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 1 });

  // Filter Toolbar State
  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    mine_id: 'ALL',
    inspection_type: 'ALL',
    violation_found: 'ALL',
    violation_severity: 'ALL',
    review_status: 'ALL',
    sync_status: 'ALL',
    inspector_id: 'ALL',
    from_date: '',
    to_date: '',
    search: '',
    page: 1,
    pageSize: 15
  });

  const loadInspections = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getInspections(activeFilters);

      setInspectionsData(res.data || []);
      setSummaryData(res.summary || {
        totalInspections: 0,
        inspectionsWithViolations: 0,
        criticalViolations: 0,
        pendingReview: 0
      });
      setPagination(res.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error loading inspections telemetry:", err);
      setError(err.message || "Failed to load inspection records");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInspections(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleApply = () => {
    loadInspections({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      state: 'ALL',
      district: 'ALL',
      mine_id: 'ALL',
      inspection_type: 'ALL',
      violation_found: 'ALL',
      violation_severity: 'ALL',
      review_status: 'ALL',
      sync_status: 'ALL',
      inspector_id: 'ALL',
      from_date: '',
      to_date: '',
      search: '',
      page: 1,
      pageSize: 15
    };
    setFilters(resetFilters);
    loadInspections(resetFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    loadInspections(updated);
  };

  const handlePageSizeChange = (newSize) => {
    const updated = { ...filters, pageSize: newSize, page: 1 };
    setFilters(updated);
    loadInspections(updated);
  };

  if (loading && inspectionsData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && inspectionsData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadInspections(filters)} />;
  }

  return (
    <div className="monitoring-page">
      {/* Page Title */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Inspections</h1>
          <span className="monitoring-subtitle">Centralized inspection and compliance records across monitored mines</span>
        </div>
      </div>

      {/* Summary KPI Cards (Calculated on Filtered Dataset) */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon">
            <ClipboardCheck size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Total Inspections</span>
            <span className="monitoring-kpi-value">{summaryData?.totalInspections ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Inspections With Violations</span>
            <span className="monitoring-kpi-value" style={{ color: '#ea580c' }}>{summaryData?.inspectionsWithViolations ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertOctagon size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Critical Violations</span>
            <span className="monitoring-kpi-value" style={{ color: '#dc2626' }}>{summaryData?.criticalViolations ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fefce8', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Pending Review</span>
            <span className="monitoring-kpi-value" style={{ color: '#d97706' }}>{summaryData?.pendingReview ?? '—'}</span>
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
          <label>Inspection Type</label>
          <select
            className="filter-select"
            value={filters.inspection_type}
            onChange={(e) => handleFilterChange('inspection_type', e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="environmental">Environmental</option>
            <option value="labour">Labour &amp; Welfare</option>
            <option value="production">Production</option>
            <option value="structural">Structural</option>
            <option value="ventilation">Ventilation</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Violation Found</label>
          <select
            className="filter-select"
            value={filters.violation_found}
            onChange={(e) => handleFilterChange('violation_found', e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="yes">Yes (Violation Found)</option>
            <option value="no">No Violation</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity</label>
          <select
            className="filter-select"
            value={filters.violation_severity}
            onChange={(e) => handleFilterChange('violation_severity', e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
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
            <option value="reviewed">Reviewed</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
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
            placeholder="Search submission ID, mine or inspector..."
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

      {/* Inspection Table Section */}
      <div className="monitoring-table-section">
        <div className="section-title-bar" style={{ padding: '16px 16px 0 16px' }}>
          <span className="section-title">Inspection Submission Records</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {inspectionsData.length} of {pagination.total} records
          </span>
        </div>

        {inspectionsData.length === 0 ? (
          <div className="empty-state-box">
            No inspection records found for the selected filters.
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
                    <th style={{ minWidth: '150px' }}>Inspector</th>
                    <th style={{ minWidth: '130px' }}>Type</th>
                    <th className="col-inspection">Date &amp; Time</th>
                    <th className="col-status">Violation</th>
                    <th className="col-risk">Severity</th>
                    <th style={{ minWidth: '120px' }}>Review Status</th>
                    <th style={{ minWidth: '110px' }}>Sync Status</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionsData.map(insp => {
                    const isViolation = String(insp.violation_found).toLowerCase() === 'yes';
                    const severity = insp.violation_severity;
                    const severityBadge =
                      severity === 'critical' ? 'badge-critical' :
                      severity === 'major' ? 'badge-high' :
                      severity === 'minor' ? 'badge-warning' : 'badge-neutral';

                    return (
                      <tr key={insp.submission_id} onClick={() => onSelectInspection(insp.submission_id)}>
                        <td className="col-id">{insp.submission_id}</td>
                        <td className="col-id" style={{ color: '#0284c7' }}>{insp.mine_id}</td>
                        <td className="col-name">{insp.mine_name || '—'}</td>
                        <td className="col-state">{insp.state || '—'}</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{insp.inspector_name || insp.inspector_id || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{insp.inspection_type || '—'}</td>
                        <td className="col-inspection">
                          {insp.date_time ? new Date(insp.date_time).toLocaleString() : '—'}
                        </td>
                        <td>
                          <span className={`badge ${isViolation ? 'badge-critical' : 'badge-compliant'}`}>
                            {isViolation ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td>
                          {isViolation && severity ? (
                            <span className={`badge ${severityBadge}`}>
                              {severity.toUpperCase()}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`badge ${insp.review_status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                            {insp.review_status || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${insp.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                            {insp.sync_status || '—'}
                          </span>
                        </td>
                        <td className="col-action">
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectInspection(insp.submission_id);
                            }}
                          >
                            View Inspection
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

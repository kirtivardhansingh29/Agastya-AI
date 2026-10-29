import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, Calendar, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getCorrectiveActions } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';

export default function CorrectiveActionsPage({ onSelectInspection }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caData, setCaData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    mine_id: 'ALL',
    inspection_type: 'ALL',
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

  const loadCorrectiveActions = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCorrectiveActions(activeFilters);

      setCaData(res.data || []);
      setSummaryData(res.summary || {
        totalCorrectiveActions: 0,
        pendingReview: 0
      });
      setPagination(res.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error loading corrective actions telemetry:", err);
      setError(err.message || "Failed to load corrective actions records");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCorrectiveActions(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleApply = () => {
    loadCorrectiveActions({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      state: 'ALL',
      district: 'ALL',
      mine_id: 'ALL',
      inspection_type: 'ALL',
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
    loadCorrectiveActions(resetFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    loadCorrectiveActions(updated);
  };

  const handlePageSizeChange = (newSize) => {
    const updated = { ...filters, pageSize: newSize, page: 1 };
    setFilters(updated);
    loadCorrectiveActions(updated);
  };

  if (loading && caData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && caData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadCorrectiveActions(filters)} />;
  }

  return (
    <div className="monitoring-page">
      {/* Header */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Corrective Actions</h1>
          <span className="monitoring-subtitle">Directives and corrective action requirements issued for inspection violations</span>
        </div>
      </div>

      {/* Summary KPI Cards (Calculated on Filtered Dataset) */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FileText size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Total Corrective Actions</span>
            <span className="monitoring-kpi-value" style={{ color: '#0284c7' }}>{summaryData?.totalCorrectiveActions ?? '—'}</span>
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

        <div className="filter-group" style={{ flex: 1.5 }}>
          <label>Search Action / ID</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search submission ID, mine, directive..."
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

      {/* Table Section */}
      <div className="monitoring-table-section">
        <div className="section-title-bar" style={{ padding: '16px 16px 0 16px' }}>
          <span className="section-title">Verify Corrective Actions list</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {caData.length} of {pagination.total} records
          </span>
        </div>

        {caData.length === 0 ? (
          <div className="empty-state-box">
            No corrective action records found for the selected filters.
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
                    <th className="col-risk">Severity</th>
                    <th style={{ minWidth: '220px' }}>Violation Description</th>
                    <th style={{ minWidth: '280px' }}>Corrective Action Directive</th>
                    <th style={{ minWidth: '130px' }}>Deadline</th>
                    <th style={{ minWidth: '120px' }}>Review Status</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {caData.map(item => {
                    const severity = item.violation_severity;
                    const severityBadge =
                      severity === 'critical' ? 'badge-critical' :
                      severity === 'major' ? 'badge-high' : 'badge-warning';

                    return (
                      <tr key={item.submission_id} onClick={() => onSelectInspection(item.submission_id)}>
                        <td className="col-id">{item.submission_id}</td>
                        <td className="col-id" style={{ color: '#0284c7' }}>{item.mine_id}</td>
                        <td className="col-name">{item.mine_name || '—'}</td>
                        <td>
                          <span className={`badge ${severityBadge}`}>
                            {(severity || 'UNCATEGORIZED').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: '#334155', maxWidth: '240px' }}>
                          <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={item.violation_description}>
                            {item.violation_description || '—'}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500', maxWidth: '300px' }}>
                          <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={item.corrective_action}>
                            {item.corrective_action || '—'}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          {item.extracted_deadline ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: '600' }}>
                              <Calendar size={12} /> {item.extracted_deadline}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`badge ${item.review_status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                            {item.review_status || '—'}
                          </span>
                        </td>
                        <td className="col-action">
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectInspection(item.submission_id);
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

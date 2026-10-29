import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquareWarning, Sparkles, Clock, AlertTriangle, Filter, RotateCcw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getGrievances } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';

export default function GrievancesDirectoryPage({ onSelectGrievance }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grievancesData, setGrievancesData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    mine_id: 'ALL',
    entry_type: 'ALL',
    category: 'ALL',
    priority_flagged_by_ai: 'ALL',
    review_status: 'ALL',
    sync_status: 'ALL',
    from_date: '',
    to_date: '',
    search: '',
    page: 1,
    pageSize: 15
  });

  const loadGrievances = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getGrievances(activeFilters);

      setGrievancesData(res.data || []);
      setSummaryData(res.summary || {
        totalEntries: 0,
        totalGrievances: 0,
        totalObservations: 0,
        aiPriorityFlagged: 0,
        pendingReview: 0
      });
      setPagination(res.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error loading grievances directory:", err);
      setError(err.message || "Failed to load grievance records");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadGrievances(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleApply = () => {
    loadGrievances({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      state: 'ALL',
      district: 'ALL',
      mine_id: 'ALL',
      entry_type: 'ALL',
      category: 'ALL',
      priority_flagged_by_ai: 'ALL',
      review_status: 'ALL',
      sync_status: 'ALL',
      from_date: '',
      to_date: '',
      search: '',
      page: 1,
      pageSize: 15
    };
    setFilters(resetFilters);
    loadGrievances(resetFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    loadGrievances(updated);
  };

  const handlePageSizeChange = (newSize) => {
    const updated = { ...filters, pageSize: newSize, page: 1 };
    setFilters(updated);
    loadGrievances(updated);
  };

  if (loading && grievancesData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && grievancesData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadGrievances(filters)} />;
  }

  return (
    <div className="monitoring-page">
      {/* Header */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Grievances &amp; Observations</h1>
          <span className="monitoring-subtitle">Centralized register of field observations, inspector notes, and worker grievances</span>
        </div>
      </div>

      {/* Summary KPI Cards (Calculated on Filtered Dataset) */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <MessageSquareWarning size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Total Entries</span>
            <span className="monitoring-kpi-value" style={{ color: '#0284c7' }}>{summaryData?.totalEntries ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Grievances</span>
            <span className="monitoring-kpi-value" style={{ color: '#ea580c' }}>{summaryData?.totalGrievances ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
            <Eye size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Observations</span>
            <span className="monitoring-kpi-value" style={{ color: '#ca8a04' }}>{summaryData?.totalObservations ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <Sparkles size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">AI Priority Flagged</span>
            <span className="monitoring-kpi-value" style={{ color: '#9333ea' }}>{summaryData?.aiPriorityFlagged ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Clock size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Pending Review</span>
            <span className="monitoring-kpi-value" style={{ color: '#dc2626' }}>{summaryData?.pendingReview ?? '—'}</span>
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
          <label>Entry Type</label>
          <select
            className="filter-select"
            value={filters.entry_type}
            onChange={(e) => handleFilterChange('entry_type', e.target.value)}
          >
            <option value="ALL">All Entry Types</option>
            <option value="grievance">Grievance</option>
            <option value="observation">Observation</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="safety">Safety</option>
            <option value="labour">Labour &amp; Welfare</option>
            <option value="environmental">Environmental</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <div className="filter-group">
          <label>AI Priority</label>
          <select
            className="filter-select"
            value={filters.priority_flagged_by_ai}
            onChange={(e) => handleFilterChange('priority_flagged_by_ai', e.target.value)}
          >
            <option value="ALL">All Priority Flags</option>
            <option value="yes">AI Flagged (Yes)</option>
            <option value="no">Normal (No)</option>
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
            <option value="acknowledged">Acknowledged</option>
            <option value="reviewed">Reviewed</option>
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
          <label>Search ID / Content</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search submission ID, content, inspector..."
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

      {/* Directory Table */}
      <div className="monitoring-table-section">
        <div className="section-title-bar" style={{ padding: '16px 16px 0 16px' }}>
          <span className="section-title">Grievances &amp; Observations Log</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {grievancesData.length} of {pagination.total} records
          </span>
        </div>

        {grievancesData.length === 0 ? (
          <div className="empty-state-box">
            No grievance or observation records found for the selected filters.
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
                    <th style={{ minWidth: '120px' }}>Entry Type</th>
                    <th style={{ minWidth: '120px' }}>Category</th>
                    <th style={{ minWidth: '130px' }}>AI Priority</th>
                    <th className="col-inspection">Date &amp; Time</th>
                    <th style={{ minWidth: '120px' }}>Review Status</th>
                    <th style={{ minWidth: '110px' }}>Sync Status</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grievancesData.map(g => {
                    const isGrievance = String(g.entry_type).toLowerCase() === 'grievance';
                    const isAiFlagged = String(g.priority_flagged_by_ai).toLowerCase() === 'yes';

                    return (
                      <tr key={g.submission_id} onClick={() => onSelectGrievance(g.submission_id)}>
                        <td className="col-id">{g.submission_id}</td>
                        <td className="col-id" style={{ color: '#0284c7' }}>{g.mine_id}</td>
                        <td className="col-name">{g.mine_name || '—'}</td>
                        <td className="col-state">{g.state || '—'}</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{g.inspector_name || g.inspector_id || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`badge ${isGrievance ? 'badge-high' : 'badge-neutral'}`}>
                            {g.entry_type || '—'}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontWeight: '500' }}>{g.category || '—'}</td>
                        <td>
                          {isAiFlagged ? (
                            <span className="badge" style={{ background: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe', fontWeight: '800' }}>
                              <Sparkles size={11} /> AI PRIORITY
                            </span>
                          ) : (
                            <span className="badge badge-neutral">NORMAL</span>
                          )}
                        </td>
                        <td className="col-inspection">
                          {g.date_time ? new Date(g.date_time).toLocaleString() : '—'}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`badge ${g.review_status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                            {g.review_status || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${g.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                            {g.sync_status || '—'}
                          </span>
                        </td>
                        <td className="col-action">
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectGrievance(g.submission_id);
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

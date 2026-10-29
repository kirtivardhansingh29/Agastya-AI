import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, Percent, UserMinus, Sun, Sunset, Moon, Filter, RotateCcw, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getAttendance } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';
import '../styles/attendance.css';

export default function AttendanceWorkforcePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    mine_id: 'ALL',
    shift: 'ALL',
    worker_type: 'ALL',
    contractor_id: 'ALL',
    from_date: '',
    to_date: '',
    search: '',
    page: 1,
    pageSize: 15
  });

  const loadAttendance = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAttendance(activeFilters);

      setAttendanceData(res.data || []);
      setSummaryData(res.summary || {
        expectedHeadcount: 0,
        actualHeadcount: 0,
        attendanceRate: 0,
        workforceDifference: 0,
        submissionCount: 0,
        shiftBreakdown: {
          morning: { expectedHeadcount: 0, actualHeadcount: 0, attendanceRate: 0, workforceDifference: 0, submissionCount: 0 },
          afternoon: { expectedHeadcount: 0, actualHeadcount: 0, attendanceRate: 0, workforceDifference: 0, submissionCount: 0 },
          night: { expectedHeadcount: 0, actualHeadcount: 0, attendanceRate: 0, workforceDifference: 0, submissionCount: 0 }
        }
      });
      setPagination(res.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error loading attendance telemetry:", err);
      setError(err.message || "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAttendance(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleApply = () => {
    loadAttendance({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      state: 'ALL',
      district: 'ALL',
      mine_id: 'ALL',
      shift: 'ALL',
      worker_type: 'ALL',
      contractor_id: 'ALL',
      from_date: '',
      to_date: '',
      search: '',
      page: 1,
      pageSize: 15
    };
    setFilters(resetFilters);
    loadAttendance(resetFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    loadAttendance(updated);
  };

  const handlePageSizeChange = (newSize) => {
    const updated = { ...filters, pageSize: newSize, page: 1 };
    setFilters(updated);
    loadAttendance(updated);
  };

  if (loading && attendanceData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && attendanceData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadAttendance(filters)} />;
  }

  const shifts = summaryData?.shiftBreakdown || {};

  return (
    <div className="monitoring-page">
      {/* Title */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Attendance &amp; Workforce Monitoring</h1>
          <span className="monitoring-subtitle">Centralized shift attendance telemetry and headcount tracking across monitored mines</span>
        </div>
      </div>

      {/* Primary Headcount KPI Cards (Calculated on Filtered Dataset) */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Users size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Expected Headcount</span>
            <span className="monitoring-kpi-value" style={{ color: '#0284c7' }}>
              {summaryData?.expectedHeadcount?.toLocaleString() ?? '—'}
            </span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <UserCheck size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Actual Headcount</span>
            <span className="monitoring-kpi-value" style={{ color: '#16a34a' }}>
              {summaryData?.actualHeadcount?.toLocaleString() ?? '—'}
            </span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
            <Percent size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Attendance Rate</span>
            <span className="monitoring-kpi-value" style={{ color: '#ca8a04' }}>
              {summaryData?.attendanceRate !== undefined ? `${summaryData.attendanceRate}%` : '—'}
            </span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <UserMinus size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Workforce Difference</span>
            <span className="monitoring-kpi-value" style={{ color: '#ea580c' }}>
              {summaryData?.workforceDifference !== undefined ? summaryData.workforceDifference.toLocaleString() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Shift Breakdown Section */}
      <div className="shift-cards-grid">
        {/* Morning Shift */}
        <div className="shift-card">
          <div className="shift-card-header">
            <div className="shift-icon-box" style={{ background: '#fef9c3', color: '#ca8a04' }}>
              <Sun size={18} />
            </div>
            <div>
              <h3 className="shift-title">Morning Shift</h3>
              <span className="shift-sub">{shifts.morning?.submissionCount ?? 0} Submissions</span>
            </div>
          </div>
          <div className="shift-stats-row">
            <div>
              <span className="shift-stat-label">Expected</span>
              <span className="shift-stat-val">{shifts.morning?.expectedHeadcount?.toLocaleString() ?? '—'}</span>
            </div>
            <div>
              <span className="shift-stat-label">Actual</span>
              <span className="shift-stat-val" style={{ color: '#16a34a' }}>{shifts.morning?.actualHeadcount?.toLocaleString() ?? '—'}</span>
            </div>
            <div>
              <span className="shift-stat-label">Rate</span>
              <span className="shift-stat-val" style={{ color: '#ca8a04' }}>{shifts.morning?.attendanceRate ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* Afternoon Shift */}
        <div className="shift-card">
          <div className="shift-card-header">
            <div className="shift-icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <Sunset size={18} />
            </div>
            <div>
              <h3 className="shift-title">Afternoon Shift</h3>
              <span className="shift-sub">{shifts.afternoon?.submissionCount ?? 0} Submissions</span>
            </div>
          </div>
          <div className="shift-stats-row">
            <div>
              <span className="shift-stat-label">Expected</span>
              <span className="shift-stat-val">{shifts.afternoon?.expectedHeadcount?.toLocaleString() ?? '—'}</span>
            </div>
            <div>
              <span className="shift-stat-label">Actual</span>
              <span className="shift-stat-val" style={{ color: '#16a34a' }}>{shifts.afternoon?.actualHeadcount?.toLocaleString() ?? '—'}</span>
            </div>
            <div>
              <span className="shift-stat-label">Rate</span>
              <span className="shift-stat-val" style={{ color: '#ea580c' }}>{shifts.afternoon?.attendanceRate ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* Night Shift */}
        <div className="shift-card">
          <div className="shift-card-header">
            <div className="shift-icon-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <Moon size={18} />
            </div>
            <div>
              <h3 className="shift-title">Night Shift</h3>
              <span className="shift-sub">{shifts.night?.submissionCount ?? 0} Submissions</span>
            </div>
          </div>
          <div className="shift-stats-row">
            <div>
              <span className="shift-stat-label">Expected</span>
              <span className="shift-stat-val">{shifts.night?.expectedHeadcount?.toLocaleString() ?? '—'}</span>
            </div>
            <div>
              <span className="shift-stat-label">Actual</span>
              <span className="shift-stat-val" style={{ color: '#16a34a' }}>{shifts.night?.actualHeadcount?.toLocaleString() ?? '—'}</span>
            </div>
            <div>
              <span className="shift-stat-label">Rate</span>
              <span className="shift-stat-val" style={{ color: '#4338ca' }}>{shifts.night?.attendanceRate ?? 0}%</span>
            </div>
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
          <label>Shift</label>
          <select
            className="filter-select"
            value={filters.shift}
            onChange={(e) => handleFilterChange('shift', e.target.value)}
          >
            <option value="ALL">All Shifts</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Worker Type</label>
          <select
            className="filter-select"
            value={filters.worker_type}
            onChange={(e) => handleFilterChange('worker_type', e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="permanent">Permanent</option>
            <option value="contractor">Contractor</option>
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
          <label>Search Personnel / Mine / Contractor</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search worker name, ID, mine or contractor..."
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

      {/* Attendance Records Table */}
      <div className="monitoring-table-section">
        <div className="section-title-bar" style={{ padding: '16px 16px 0 16px' }}>
          <span className="section-title">Shift Attendance Records</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {attendanceData.length} of {pagination.total} attendance submissions
          </span>
        </div>

        {attendanceData.length === 0 ? (
          <div className="empty-state-box">
            No attendance records found for the selected filters.
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
                    <th style={{ minWidth: '110px' }}>Shift</th>
                    <th style={{ minWidth: '180px' }}>Recorded Personnel</th>
                    <th style={{ minWidth: '120px' }}>Worker Type</th>
                    <th style={{ minWidth: '120px' }}>Contractor</th>
                    <th style={{ minWidth: '130px' }}>Expected Headcount</th>
                    <th style={{ minWidth: '130px' }}>Actual Headcount</th>
                    <th style={{ minWidth: '180px' }}>Attendance Check-in</th>
                    <th style={{ minWidth: '180px' }}>Attendance Check-out</th>
                    <th className="col-inspection">Date &amp; Time</th>
                    <th style={{ minWidth: '110px' }}>Sync Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map(att => {
                    const hasCheckInLoc = att.check_in_location &&
                      typeof att.check_in_location.latitude === 'number' &&
                      !isNaN(att.check_in_location.latitude);
                    const hasCheckOutLoc = att.check_out_location &&
                      typeof att.check_out_location.latitude === 'number' &&
                      !isNaN(att.check_out_location.latitude);

                    return (
                      <tr key={att.submission_id}>
                        <td className="col-id">{att.submission_id}</td>
                        <td className="col-id" style={{ color: '#0284c7' }}>{att.mine_id}</td>
                        <td className="col-name">{att.mine_name || '—'}</td>
                        <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>{att.shift || '—'}</td>
                        <td>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{att.worker_name || '—'}</div>
                          {att.worker_id && <div style={{ fontSize: '11px', color: '#64748b' }}>({att.worker_id})</div>}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`badge ${att.worker_type === 'permanent' ? 'badge-neutral' : 'badge-warning'}`}>
                            {att.worker_type || '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{att.contractor_id || '—'}</td>
                        <td style={{ fontWeight: '600', color: '#475569' }}>{att.expected_headcount ?? '—'}</td>
                        <td style={{ fontWeight: '700', color: '#16a34a' }}>{att.actual_headcount ?? '—'}</td>
                        <td style={{ fontSize: '12px' }}>
                          <div>{att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString() : '—'}</div>
                          {hasCheckInLoc && (
                            <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <MapPin size={10} /> Check-in: {att.check_in_location.latitude.toFixed(4)}, {att.check_in_location.longitude.toFixed(4)}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          <div>{att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString() : '—'}</div>
                          {hasCheckOutLoc && (
                            <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <MapPin size={10} /> Check-out: {att.check_out_location.latitude.toFixed(4)}, {att.check_out_location.longitude.toFixed(4)}
                            </span>
                          )}
                        </td>
                        <td className="col-inspection">
                          {att.date_time ? new Date(att.date_time).toLocaleString() : '—'}
                        </td>
                        <td>
                          <span className={`badge ${att.sync_status === 'synced' ? 'badge-operating' : 'badge-warning'}`}>
                            {att.sync_status || '—'}
                          </span>
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
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total attendance submissions)
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

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, ShieldCheck, Clock, AlertTriangle, Filter, RotateCcw, ChevronLeft, ChevronRight, Building2, FileText } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getContractors } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';

export default function ContractorsDirectoryPage({ onSelectContractor }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractorsData, setContractorsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    insurance_status: 'ALL',
    license_status: 'ALL',
    document_status: 'ALL',
    search: '',
    page: 1,
    pageSize: 15
  });

  const loadContractors = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getContractors(activeFilters);

      setContractorsData(res.data || []);
      setSummaryData(res.summary || {
        totalContractors: 0,
        activeInsurance: 0,
        renewalDue: 0,
        expiredLicenses: 0,
        expiringDocumentsCount: 0
      });
      setPagination(res.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Error loading contractors telemetry:", err);
      setError(err.message || "Failed to load contractor records");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadContractors(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleApply = () => {
    loadContractors({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      insurance_status: 'ALL',
      license_status: 'ALL',
      document_status: 'ALL',
      search: '',
      page: 1,
      pageSize: 15
    };
    setFilters(resetFilters);
    loadContractors(resetFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    loadContractors(updated);
  };

  const handlePageSizeChange = (newSize) => {
    const updated = { ...filters, pageSize: newSize, page: 1 };
    setFilters(updated);
    loadContractors(updated);
  };

  if (loading && contractorsData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && contractorsData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadContractors(filters)} />;
  }

  return (
    <div className="monitoring-page">
      {/* Header */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Contractors &amp; Documents</h1>
          <span className="monitoring-subtitle">Centralized contractor compliance register, document expiry tracking, and mine attendance associations</span>
        </div>
      </div>

      {/* Summary KPI Cards (Calculated on Filtered Dataset) */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FileSpreadsheet size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Total Contractors</span>
            <span className="monitoring-kpi-value" style={{ color: '#0284c7' }}>{summaryData?.totalContractors ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Active Insurance</span>
            <span className="monitoring-kpi-value" style={{ color: '#16a34a' }}>{summaryData?.activeInsurance ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
            <Clock size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Renewal Due</span>
            <span className="monitoring-kpi-value" style={{ color: '#ca8a04' }}>{summaryData?.renewalDue ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <FileText size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Expiring Documents</span>
            <span className="monitoring-kpi-value" style={{ color: '#ea580c' }}>{summaryData?.expiringDocumentsCount ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="monitoring-filter-bar">
        <div className="filter-group">
          <label>Insurance Status</label>
          <select
            className="filter-select"
            value={filters.insurance_status}
            onChange={(e) => handleFilterChange('insurance_status', e.target.value)}
          >
            <option value="ALL">All Insurance Statuses</option>
            <option value="active">Active</option>
            <option value="renewal_due">Renewal Due</option>
          </select>
        </div>

        <div className="filter-group">
          <label>License Status</label>
          <select
            className="filter-select"
            value={filters.license_status}
            onChange={(e) => handleFilterChange('license_status', e.target.value)}
          >
            <option value="ALL">All License Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Document Status</label>
          <select
            className="filter-select"
            value={filters.document_status}
            onChange={(e) => handleFilterChange('document_status', e.target.value)}
          >
            <option value="ALL">All Document Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div className="filter-group" style={{ flex: 1.5 }}>
          <label>Search Contractor / Document</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search contractor ID, company name, document..."
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
          <span className="section-title">Registered Mining Contractors</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {contractorsData.length} of {pagination.total} records
          </span>
        </div>

        {contractorsData.length === 0 ? (
          <div className="empty-state-box">
            No contractor records found for the selected filters.
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="mine-table">
                <thead>
                  <tr>
                    <th className="col-id">Contractor ID</th>
                    <th className="col-name">Company Name</th>
                    <th style={{ minWidth: '130px' }}>License Validity</th>
                    <th style={{ minWidth: '120px' }}>License Status</th>
                    <th style={{ minWidth: '130px' }}>Insurance Status</th>
                    <th style={{ minWidth: '130px' }}>Document Status</th>
                    <th style={{ minWidth: '140px' }}>Compliance Documents</th>
                    <th style={{ minWidth: '140px' }}>Equipment Certificates</th>
                    <th style={{ minWidth: '180px' }}>Mines Recorded in Attendance</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorsData.map(c => {
                    const licBadge = c.license_status === 'Valid' ? 'badge-operating' : 'badge-critical';
                    const insBadge = c.insurance_status === 'active' ? 'badge-operating' : 'badge-warning';
                    const docBadge =
                      c.document_status === 'Valid' ? 'badge-operating' :
                      c.document_status === 'Expiring Soon' ? 'badge-warning' :
                      c.document_status === 'Expired' ? 'badge-critical' : 'badge-neutral';

                    return (
                      <tr key={c.contractor_id} onClick={() => onSelectContractor(c.contractor_id)}>
                        <td className="col-id" style={{ color: '#0284c7' }}>{c.contractor_id}</td>
                        <td className="col-name">{c.company_name || '—'}</td>
                        <td style={{ fontSize: '13px' }}>{c.license_validity || '—'}</td>
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
                        <td style={{ fontWeight: '600' }}>
                          {c.compliance_documents?.length ?? 0} Files
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {c.equipment_inspection_certificates?.length ?? 0} Files
                        </td>
                        <td style={{ fontSize: '13px', color: '#475569' }}>
                          {c.associated_mines?.length > 0 ? (
                            <span>{c.associated_mines.length} Monitored Mines</span>
                          ) : '—'}
                        </td>
                        <td className="col-action">
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectContractor(c.contractor_id);
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

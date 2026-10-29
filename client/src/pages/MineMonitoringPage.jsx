import React, { useState, useEffect, useCallback } from 'react';
import { Pickaxe, ShieldAlert, AlertTriangle, MapPin, Search, Filter, RotateCcw } from 'lucide-react';
import LeafletMineMap from '../components/map/LeafletMineMap';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getMines, getMineMapData } from '../services/api';
import '../styles/mine-monitoring.css';

export default function MineMonitoringPage({ onSelectMine, initialView }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minesData, setMinesData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [viewMode, setViewMode] = useState(initialView || 'directory');

  // Filter Toolbar state
  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    operator: 'ALL',
    status: 'ALL',
    risk_level: 'ALL',
    search: ''
  });

  const loadMonitoringData = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const [minesRes, mapRes] = await Promise.all([
        getMines(activeFilters),
        getMineMapData(activeFilters)
      ]);

      setMinesData(minesRes.data || []);
      setSummaryData(minesRes.summary || {
        totalMines: 0,
        operatingMines: 0,
        suspendedMines: 0,
        statesRepresented: 0
      });
      setMapMarkers(mapRes || []);
    } catch (err) {
      console.error("Error loading mine monitoring telemetry:", err);
      setError(err.message || "Failed to load mine monitoring data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMonitoringData(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    loadMonitoringData(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      state: 'ALL',
      district: 'ALL',
      operator: 'ALL',
      status: 'ALL',
      risk_level: 'ALL',
      search: ''
    };
    setFilters(resetFilters);
    loadMonitoringData(resetFilters);
  };

  if (loading && minesData.length === 0 && !summaryData) {
    return <LoadingSkeleton />;
  }

  if (error && minesData.length === 0 && !summaryData) {
    return <ErrorState message={error} onRetry={() => loadMonitoringData(filters)} />;
  }

  return (
    <div className="monitoring-page">
      {/* Title Header */}
      <div className="monitoring-header">
        <div className="monitoring-title-col">
          <h1 className="monitoring-title">Mine Monitoring</h1>
          <span className="monitoring-subtitle">Centralized monitoring of monitored mines across India</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="monitoring-kpi-grid">
        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon">
            <Pickaxe size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Total Mines</span>
            <span className="monitoring-kpi-value">{summaryData?.totalMines ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Operating Mines</span>
            <span className="monitoring-kpi-value" style={{ color: '#16a34a' }}>{summaryData?.operatingMines ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">Suspended Mines</span>
            <span className="monitoring-kpi-value" style={{ color: '#dc2626' }}>{summaryData?.suspendedMines ?? '—'}</span>
          </div>
        </div>

        <div className="monitoring-kpi-card">
          <div className="monitoring-kpi-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <MapPin size={22} />
          </div>
          <div className="monitoring-kpi-info">
            <span className="monitoring-kpi-label">States Represented</span>
            <span className="monitoring-kpi-value" style={{ color: '#7c3aed' }}>{summaryData?.statesRepresented ?? '—'}</span>
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
          <label>Operator</label>
          <select
            className="filter-select"
            value={filters.operator}
            onChange={(e) => handleFilterChange('operator', e.target.value)}
          >
            <option value="ALL">All Operators</option>
            <option value="BCCL">BCCL</option>
            <option value="ECL">ECL</option>
            <option value="SECL">SECL</option>
            <option value="MCL">MCL</option>
            <option value="SCCL">SCCL</option>
            <option value="NCL">NCL</option>
            <option value="WCL">WCL</option>
            <option value="NEC">NEC</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="operating">Operating</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Risk Level</label>
          <select
            className="filter-select"
            value={filters.risk_level}
            onChange={(e) => handleFilterChange('risk_level', e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="compliant">Compliant</option>
          </select>
        </div>

        <div className="filter-group" style={{ flex: 1.5 }}>
          <label>Search Mine / ID</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search mine name or ID..."
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

      {/* View Toggle Bar */}
      <div className="view-toggle-bar">
        <div className="view-toggle-group">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapPin size={14} />
            <span>Map View</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'directory' ? 'active' : ''}`}
            onClick={() => setViewMode('directory')}
          >
            <Pickaxe size={14} />
            <span>Directory View</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'both' ? 'active' : ''}`}
            onClick={() => setViewMode('both')}
          >
            <Filter size={14} />
            <span>Combined View</span>
          </button>
        </div>

        <div className="view-toggle-meta">
          Showing <strong>{minesData.length}</strong> matched mine records ({mapMarkers.length} mapped on geospatial canvas)
        </div>
      </div>

      {/* Interactive Leaflet Map Section (Map View & Combined View) */}
      {(viewMode === 'map' || viewMode === 'both') && (
        <div className="monitoring-map-section">
          <div className="section-title-bar">
            <span className="section-title">India Coal Mine Geospatial Map</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {mapMarkers.length} mapped locations
            </span>
          </div>
          <LeafletMineMap
            markers={mapMarkers}
            onSelectMine={onSelectMine}
            height={viewMode === 'map' ? '540px' : '450px'}
            showLegend={true}
          />
        </div>
      )}

      {/* Mine Directory Table Section (Directory View & Combined View) */}
      {(viewMode === 'directory' || viewMode === 'both') && (
        <div className="monitoring-table-section">
          <div className="section-title-bar" style={{ padding: '16px 16px 0 16px' }}>
            <span className="section-title">Monitored Mines Directory</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {minesData.length} mines matched
            </span>
          </div>

          {minesData.length === 0 ? (
            <div className="empty-state-box">
              No mines found for the selected filters.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="mine-table">
                <thead>
                  <tr>
                    <th className="col-id">Mine ID</th>
                    <th className="col-name">Mine Name</th>
                    <th className="col-state">State</th>
                    <th className="col-district">District</th>
                    <th className="col-operator">Operator</th>
                    <th className="col-status">Status</th>
                    <th className="col-risk">Risk Level</th>
                    <th className="col-inspection">Latest Inspection</th>
                    <th className="col-violations">Violations</th>
                    <th className="col-incidents">Incidents</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {minesData.map(mine => {
                    const riskLevel = mine.risk_level;
                    const riskBadgeClass =
                      riskLevel === 'critical' ? 'badge-critical' :
                      riskLevel === 'high' ? 'badge-high' :
                      riskLevel === 'warning' ? 'badge-warning' :
                      riskLevel === 'compliant' ? 'badge-compliant' : 'badge-neutral';

                    return (
                      <tr key={mine.mine_id} onClick={() => onSelectMine(mine.mine_id)}>
                        <td className="col-id">{mine.mine_id}</td>
                        <td className="col-name">{mine.mine_name || '—'}</td>
                        <td className="col-state">{mine.state || '—'}</td>
                        <td className="col-district">{mine.district || '—'}</td>
                        <td className="col-operator">{mine.operator || '—'}</td>
                        <td className="col-status">
                          <span className={`badge ${mine.status === 'operating' ? 'badge-operating' : 'badge-suspended'}`}>
                            {mine.status || '—'}
                          </span>
                        </td>
                        <td className="col-risk">
                          <span className={`badge ${riskBadgeClass}`}>
                            {riskLevel ? riskLevel.toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="col-inspection">
                          {mine.latest_inspection
                            ? new Date(mine.latest_inspection).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="col-violations">{mine.violation_count ?? '—'}</td>
                        <td className="col-incidents">{mine.incident_count ?? '0'}</td>
                        <td className="col-action">
                          <button
                            className="btn-primary"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMine(mine.mine_id);
                            }}
                          >
                            View Mine
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
    </div>
  );
}

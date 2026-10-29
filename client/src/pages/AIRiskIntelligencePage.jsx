import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Search, Filter, ShieldAlert, Mountain, AlertOctagon, RefreshCw, ChevronRight } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getMines } from '../services/api';
import '../styles/ai-risk.css';

export default function AIRiskIntelligencePage({ onSelectMine }) {
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchMinesList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMines();
      setMines(res.data || []);
    } catch (err) {
      console.error("Error fetching mines for AI Risk Intelligence:", err);
      setError(err.message || "Failed to load mine dataset");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMinesList();
  }, [fetchMinesList]);

  // Derived unique lists for dropdown filters
  const stateOptions = useMemo(() => {
    const states = new Set(mines.map(m => m.state).filter(Boolean));
    return ['ALL', ...Array.from(states).sort()];
  }, [mines]);

  const districtOptions = useMemo(() => {
    const districts = new Set(mines.map(m => m.district).filter(Boolean));
    return ['ALL', ...Array.from(districts).sort()];
  }, [mines]);

  // Filtered dataset
  const filteredMines = useMemo(() => {
    return mines.filter(m => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesId = m.mine_id && m.mine_id.toLowerCase().includes(q);
        const matchesName = m.mine_name && m.mine_name.toLowerCase().includes(q);
        const matchesOperator = m.operator && m.operator.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesOperator) return false;
      }

      if (riskLevel !== 'ALL') {
        if (String(m.risk_level).toLowerCase() !== riskLevel.toLowerCase()) return false;
      }

      if (stateFilter !== 'ALL') {
        if (m.state && m.state.toLowerCase() !== stateFilter.toLowerCase()) return false;
      }

      if (districtFilter !== 'ALL') {
        if (m.district && m.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
      }

      if (statusFilter !== 'ALL') {
        if (String(m.status).toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [mines, search, riskLevel, stateFilter, districtFilter, statusFilter]);

  // Summary KPI Metrics
  const totalMines = mines.length;
  const criticalCount = mines.filter(m => String(m.risk_level).toLowerCase() === 'critical').length;
  const highCount = mines.filter(m => String(m.risk_level).toLowerCase() === 'high').length;
  const gasBreachCount = mines.filter(m => m.gas_breach === true).length;
  const suspendedCount = mines.filter(m => m.status === 'suspended').length;

  if (loading && mines.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && mines.length === 0) {
    return <ErrorState message={error} onRetry={fetchMinesList} />;
  }

  return (
    <div className="ai-risk-page">
      {/* Top Header Card */}
      <div className="ai-header-banner">
        <div className="ai-header-info">
          <h1 className="ai-header-title">
            <Sparkles size={20} className="ai-header-icon" />
            AI Risk Intelligence
          </h1>
          <p className="ai-header-subtitle">
            AI-assisted assessment of mine safety conditions, inspection findings, and incident history.
          </p>
        </div>
        <div>
          <span className="ai-badge-tag">Regulatory AI Assessment</span>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="ai-kpi-grid">
        <div className="ai-kpi-card">
          <span className="ai-kpi-label">Total Monitored Mines</span>
          <span className="ai-kpi-value">{totalMines}</span>
          <span className="ai-kpi-sub">Registered state directorates</span>
        </div>
        <div className="ai-kpi-card">
          <span className="ai-kpi-label">Critical Risk Mines</span>
          <span className="ai-kpi-value" style={{ color: '#dc2626' }}>{criticalCount}</span>
          <span className="ai-kpi-sub">Priority attention required</span>
        </div>
        <div className="ai-kpi-card">
          <span className="ai-kpi-label">High Risk Class</span>
          <span className="ai-kpi-value" style={{ color: '#ea580c' }}>{highCount}</span>
          <span className="ai-kpi-sub">Elevated safety signals</span>
        </div>
        <div className="ai-kpi-card">
          <span className="ai-kpi-label">Gas Breach Alerts</span>
          <span className="ai-kpi-value" style={{ color: gasBreachCount > 0 ? '#dc2626' : '#16a34a' }}>
            {gasBreachCount}
          </span>
          <span className="ai-kpi-sub">Continuous methane threshold</span>
        </div>
        <div className="ai-kpi-card">
          <span className="ai-kpi-label">Suspended Mines</span>
          <span className="ai-kpi-value" style={{ color: '#ca8a04' }}>{suspendedCount}</span>
          <span className="ai-kpi-sub">Work order halted</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by Mine ID, Mine Name, Operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '13px' }}
          />
        </div>

        {/* Risk Level Filter */}
        <div style={{ flex: '0 0 160px' }}>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '13px' }}
          >
            <option value="ALL">Risk: All Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="warning">Warning</option>
            <option value="compliant">Compliant</option>
          </select>
        </div>

        {/* State Filter */}
        <div style={{ flex: '0 0 160px' }}>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '13px' }}
          >
            {stateOptions.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'State: All' : st}</option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div style={{ flex: '0 0 160px' }}>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '13px' }}
          >
            {districtOptions.map(dt => (
              <option key={dt} value={dt}>{dt === 'ALL' ? 'District: All' : dt}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: '0 0 150px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '13px' }}
          >
            <option value="ALL">Status: All</option>
            <option value="operating">Operating</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Reset Button */}
        {(search || riskLevel !== 'ALL' || stateFilter !== 'ALL' || districtFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setRiskLevel('ALL');
              setStateFilter('ALL');
              setDistrictFilter('ALL');
              setStatusFilter('ALL');
            }}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Mine List Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Monitored Mines ({filteredMines.length} of {mines.length})
          </h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Select any mine row to view dossier and perform AI safety risk assessment
          </span>
        </div>

        {filteredMines.length === 0 ? (
          <div className="empty-state-box" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No mines matched the selected search or filter criteria.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="mine-table">
              <thead>
                <tr>
                  <th>Mine ID</th>
                  <th>Mine Name</th>
                  <th>State &amp; District</th>
                  <th>Operator</th>
                  <th>Status</th>
                  <th>Risk Level</th>
                  <th>Gas Breach</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMines.map(mine => {
                  const rLevel = mine.risk_level?.toLowerCase();
                  const riskBadgeClass =
                    rLevel === 'critical' ? 'badge-critical' :
                    rLevel === 'high' ? 'badge-high' :
                    rLevel === 'warning' ? 'badge-warning' :
                    rLevel === 'compliant' ? 'badge-compliant' : 'badge-neutral';

                  const isBreach = mine.gas_breach === true;

                  return (
                    <tr
                      key={mine.mine_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectMine && onSelectMine(mine.mine_id)}
                    >
                      <td className="mine-id-code">{mine.mine_id}</td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{mine.mine_name}</td>
                      <td>{mine.state || '—'} • {mine.district || '—'}</td>
                      <td>{mine.operator || '—'}</td>
                      <td>
                        <span className={`badge ${mine.status === 'operating' ? 'badge-operating' : 'badge-suspended'}`}>
                          {mine.status || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${riskBadgeClass}`}>
                          {mine.risk_level ? mine.risk_level.toUpperCase() : 'UNKNOWN'}
                        </span>
                      </td>
                      <td>
                        {isBreach ? (
                          <span className="badge badge-critical">BREACH</span>
                        ) : (
                          <span className="badge badge-compliant">NORMAL</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-ai-analyze"
                          style={{ fontSize: '11px', padding: '6px 12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMine && onSelectMine(mine.mine_id);
                          }}
                        >
                          <Sparkles size={12} />
                          <span>AI Analysis</span>
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
    </div>
  );
}

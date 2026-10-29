import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Filter,
  RotateCcw,
  ClipboardCheck,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Mountain,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getReportsAnalytics } from '../services/api';
import '../styles/reports.css';

export default function ReportsPage({ onSelectMine }) {
  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    mineId: 'ALL',
    riskLevel: 'ALL'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportsData, setReportsData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getReportsAnalytics(filters)
      .then(res => {
        if (isMounted) {
          setReportsData(res);
          setError(null);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Error fetching reports data:", err);
          setError("Failed to load graphical report telemetry. Please verify backend connection.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'state' ? { district: 'ALL', mineId: 'ALL' } : {}),
      ...(key === 'district' ? { mineId: 'ALL' } : {})
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      state: 'ALL',
      district: 'ALL',
      mineId: 'ALL',
      riskLevel: 'ALL'
    });
  };

  const kpis = reportsData?.kpis || {};
  const charts = reportsData?.charts || {};
  const filterOptions = reportsData?.filterOptions || { states: [], districts: [], mines: [] };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-recharts-tooltip">
          <div className="tooltip-title">{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="tooltip-row">
              <span className="tooltip-dot" style={{ backgroundColor: entry.color || entry.fill }} />
              <span>{entry.name || entry.dataKey}: <strong>{entry.value}</strong></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reports-container">
      {/* Header Bar */}
      <div className="reports-header">
        <div className="reports-title-area">
          <div className="reports-badge">
            <BarChart3 size={14} />
            <span>EXECUTIVE REPORTING & ANALYTICS</span>
          </div>
          <h1>National Safety &amp; Compliance Analytics</h1>
          <p>Graphical trend analytics and comparative performance distribution based on verified Agastya AI telemetry</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="reports-filter-bar">
        <div className="filter-group">
          <Filter size={14} style={{ color: '#64748b' }} />
          <label>State:</label>
          <select
            className="filter-select"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          >
            <option value="ALL">All States</option>
            {filterOptions.states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>District:</label>
          <select
            className="filter-select"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
          >
            <option value="ALL">All Districts</option>
            {filterOptions.districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Mine Asset:</label>
          <select
            className="filter-select"
            value={filters.mineId}
            onChange={(e) => handleFilterChange('mineId', e.target.value)}
          >
            <option value="ALL">All Mine Assets</option>
            {filterOptions.mines.map(m => (
              <option key={m.mine_id} value={m.mine_id}>{m.mine_name} ({m.mine_id})</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Risk Level:</label>
          <select
            className="filter-select"
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning / Medium</option>
            <option value="compliant">Compliant / Low</option>
          </select>
        </div>

        {(filters.state !== 'ALL' || filters.district !== 'ALL' || filters.mineId !== 'ALL' || filters.riskLevel !== 'ALL') && (
          <button className="reset-filter-btn" onClick={handleResetFilters}>
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="reports-loading">
          <div className="loading-spinner" />
          <p>Compiling graphical analytics from Agastya AI telemetry...</p>
        </div>
      ) : error ? (
        <div className="reports-loading" style={{ color: '#ef4444' }}>
          <AlertTriangle size={32} style={{ marginBottom: '0.5rem' }} />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="reports-kpi-grid">
            <div className="reports-kpi-card">
              <div className="kpi-icon-wrapper kpi-blue">
                <ClipboardCheck size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Total Inspections</span>
                <span className="kpi-value">{kpis.totalInspections || 0}</span>
                <span className="kpi-subtext">Completed Audits</span>
              </div>
            </div>

            <div className="reports-kpi-card">
              <div className="kpi-icon-wrapper kpi-amber">
                <ShieldAlert size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Total Violations</span>
                <span className="kpi-value">{kpis.totalViolations || 0}</span>
                <span className="kpi-subtext">{kpis.criticalViolations || 0} Critical Violations</span>
              </div>
            </div>

            <div className="reports-kpi-card">
              <div className="kpi-icon-wrapper kpi-red">
                <AlertOctagon size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Total Incidents</span>
                <span className="kpi-value">{kpis.totalIncidents || 0}</span>
                <span className="kpi-subtext">{kpis.criticalIncidents || 0} Critical / Fatal</span>
              </div>
            </div>

            <div className="reports-kpi-card">
              <div className="kpi-icon-wrapper kpi-purple">
                <AlertTriangle size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Critical Risk Mines</span>
                <span className="kpi-value">{kpis.criticalRiskMines || 0}</span>
                <span className="kpi-subtext">Out of {kpis.totalMines || 0} Monitored</span>
              </div>
            </div>
          </div>

          {/* 6 Recharts Visualizations Grid */}
          <div className="reports-charts-grid">
            {/* Chart 1: Inspection Trend */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-title-area">
                  <h3>Inspection &amp; Audit Volume Trend</h3>
                  <p>Monthly distribution of total inspections vs statutory violations</p>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.inspectionTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="inspections" name="Total Inspections" stroke="#0284c7" fillOpacity={1} fill="url(#colorInspections)" />
                    <Area type="monotone" dataKey="violations" name="Violations Found" stroke="#ef4444" fillOpacity={1} fill="url(#colorViolations)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Inspection Outcome Distribution */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-title-area">
                  <h3>Inspection Outcome Distribution</h3>
                  <p>Breakdown of compliant findings vs statutory violations</p>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.inspectionOutcomeDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {(charts.inspectionOutcomeDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Violations by Severity */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-title-area">
                  <h3>Violations by Severity</h3>
                  <p>Distribution of identified non-compliance issues</p>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.violationsBySeverity || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="severity" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Violations Count" radius={[6, 6, 0, 0]}>
                      {(charts.violationsBySeverity || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Incident Trend */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-title-area">
                  <h3>Incident Frequency Trend</h3>
                  <p>Timeline of operational hazards and emergency alerts</p>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.incidentTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="totalIncidents" name="Total Incidents" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="criticalIncidents" name="Critical / Fatal" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Incidents by Severity */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-title-area">
                  <h3>Incidents by Severity</h3>
                  <p>Classification of mine safety incidents</p>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.incidentsBySeverity || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="severity" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Incidents Count" radius={[6, 6, 0, 0]}>
                      {(charts.incidentsBySeverity || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Mines by Risk Level */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-title-area">
                  <h3>Mines by Composite Risk Level</h3>
                  <p>Distribution of monitored assets across safety risk Tiers</p>
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.minesByRiskLevel || []} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="level" type="category" tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Mine Assets" radius={[0, 6, 6, 0]}>
                      {(charts.minesByRiskLevel || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

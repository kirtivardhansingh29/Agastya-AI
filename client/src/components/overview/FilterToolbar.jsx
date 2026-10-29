import React from 'react';
import { RefreshCw, RotateCcw, Download, Filter, Smartphone } from 'lucide-react';

export default function FilterToolbar({
  filters,
  onChangeFilter,
  onApplyFilters,
  onResetFilters,
  onTriggerSync,
  isSyncing,
  pendingSyncCount,
  lastSyncTime
}) {
  return (
    <div className="filter-toolbar-card">
      <div className="filter-inputs-grid">
        {/* 1. State Directorate */}
        <div className="filter-control-group">
          <label className="filter-control-label">State Directorate</label>
          <select
            className="filter-select"
            value={filters.state}
            onChange={(e) => onChangeFilter('state', e.target.value)}
          >
            <option value="ALL">All States (JH, OD, ...)</option>
            <option value="JH">Jharkhand (JH)</option>
            <option value="WB">West Bengal (WB)</option>
            <option value="CG">Chhattisgarh (CG)</option>
            <option value="OD">Odisha (OD)</option>
            <option value="TG">Telangana (TG)</option>
            <option value="MP">Madhya Pradesh (MP)</option>
            <option value="MH">Maharashtra (MH)</option>
            <option value="AS">Assam (AS)</option>
          </select>
        </div>

        {/* 2. Mining District */}
        <div className="filter-control-group">
          <label className="filter-control-label">Mining District</label>
          <select
            className="filter-select"
            value={filters.district}
            onChange={(e) => onChangeFilter('district', e.target.value)}
          >
            <option value="ALL">All Mining District</option>
            <option value="Dhanbad">Dhanbad</option>
            <option value="Korba">Korba</option>
            <option value="Angul">Angul</option>
            <option value="Paschim Bardhaman">Paschim Bardhaman</option>
            <option value="Peddapalli">Peddapalli</option>
            <option value="Singrauli">Singrauli</option>
          </select>
        </div>

        {/* 3. Monitored Mine Assets */}
        <div className="filter-control-group">
          <label className="filter-control-label">Monitored Mine Assets</label>
          <select
            className="filter-select"
            value={filters.asset}
            onChange={(e) => onChangeFilter('asset', e.target.value)}
          >
            <option value="ALL">All Monitored Mine</option>
            <option value="JH-DHA-BCCL-007">BCCL Pit-7 (Jharia)</option>
            <option value="WB-BUR-ECL-002">ECL Sripur (Raniganj)</option>
            <option value="CG-KOR-SECL-003">SECL Gevra Expansion</option>
            <option value="OD-ANG-MCL-004">MCL Talcher Colliery</option>
            <option value="TG-PED-SCCL-005">SCCL Ramagundam</option>
          </select>
        </div>

        {/* 4. Inspection Scope */}
        <div className="filter-control-group">
          <label className="filter-control-label">Inspection Scope</label>
          <select
            className="filter-select"
            value={filters.scope}
            onChange={(e) => onChangeFilter('scope', e.target.value)}
          >
            <option value="ALL">All Types (Safety, ...)</option>
            <option value="safety">Safety Inspections</option>
            <option value="environmental">Environmental Compliance</option>
            <option value="production">Production &amp; Machinery</option>
            <option value="labour">Labour &amp; Welfare</option>
          </select>
        </div>

        {/* 5. Severity Tier */}
        <div className="filter-control-group">
          <label className="filter-control-label">Severity Tier</label>
          <select
            className="filter-select"
            value={filters.severity}
            onChange={(e) => onChangeFilter('severity', e.target.value)}
          >
            <option value="ALL">All Severities (Tot...</option>
            <option value="critical">Critical Emergencies</option>
            <option value="major">Major Violations</option>
            <option value="warning">Warning / Rectification</option>
            <option value="compliant">Fully Compliant</option>
          </select>
        </div>

        {/* 6. Review Status */}
        <div className="filter-control-group">
          <label className="filter-control-label">Review Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => onChangeFilter('status', e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending Sign-off</option>
            <option value="reviewed">Reviewed by DGMS</option>
            <option value="escalated">Escalated / Inquest</option>
            <option value="resolved">Resolved &amp; Closed</option>
          </select>
        </div>

        {/* 7. Reporting Window */}
        <div className="filter-control-group">
          <label className="filter-control-label">Reporting Window</label>
          <select
            className="filter-select"
            value={filters.window}
            onChange={(e) => onChangeFilter('window', e.target.value)}
          >
            <option value="30d">Last 30 Days (01...</option>
            <option value="7d">Last 7 Days</option>
            <option value="current_shift">Current Active Shift</option>
            <option value="ytd">Year to Date (2024)</option>
          </select>
        </div>
      </div>

      {/* Action Controls & Sync Summary */}
      <div className="filter-actions-bar">
        <div className="filter-status-left">
          <div className="sync-pending-notice">
            <Smartphone size={12} />
            <span>{pendingSyncCount ?? '—'} Mobile inspection submissions pending field sync</span>
          </div>
          <span className="sync-timestamp-text">
            Last synchronized: {lastSyncTime ?? '—'}
          </span>
          <button
            className="btn-outline"
            onClick={onTriggerSync}
            disabled={isSyncing}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
            <span>Retry Sync</span>
          </button>
        </div>

        <div className="filter-buttons-right">
          <button
            className="btn-outline"
            onClick={onResetFilters}
            title="Clear all filters back to default"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>

          <button
            className="btn-outline"
            onClick={() => alert("Generating Official DGMS Compliance Dossier (PDF/CSV)...")}
            title="Download Regulatory Report"
          >
            <Download size={12} />
            <span>Export Dossier (PDF/CSV)</span>
          </button>

          <button
            className="btn-primary"
            onClick={onApplyFilters}
            title="Recalculate command center metrics"
          >
            <Filter size={12} />
            <span>Apply Regulatory Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}

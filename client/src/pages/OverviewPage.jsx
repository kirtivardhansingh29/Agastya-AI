import React, { useState, useEffect } from 'react';
import SubHeaderBar from '../components/overview/SubHeaderBar';
import FilterToolbar from '../components/overview/FilterToolbar';
import TelemetryKpiGrid from '../components/overview/TelemetryKpiGrid';
import CoalBasinMap from '../components/overview/CoalBasinMap';
import SeverityDistribution from '../components/overview/SeverityDistribution';
import HighestAttentionMines from '../components/overview/HighestAttentionMines';
import RecentIncidents from '../components/overview/RecentIncidents';
import AiRiskIntelligence from '../components/overview/AiRiskIntelligence';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getOverviewSummary, getRecentIncidents, triggerTelemetrySync } from '../services/api';

export default function OverviewPage({ onUpdateSyncStatus, isSyncing, onTriggerSync, onSelectMine }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [incidents, setIncidents] = useState([]);

  // Filter States
  const [filters, setFilters] = useState({
    state: 'ALL',
    district: 'ALL',
    asset: 'ALL',
    scope: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    window: '30d'
  });

  const loadData = async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, incidentsRes] = await Promise.all([
        getOverviewSummary(activeFilters),
        getRecentIncidents('all')
      ]);

      setOverviewData(overviewRes);
      setIncidents(incidentsRes);
      if (onUpdateSyncStatus && overviewRes.syncStatus) {
        onUpdateSyncStatus(overviewRes.syncStatus, overviewRes.priorityBanner);
      }
    } catch (err) {
      console.error("Overview data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadData(filters);
  };

  const handleResetFilters = () => {
    const reset = {
      state: 'ALL',
      district: 'ALL',
      asset: 'ALL',
      scope: 'ALL',
      severity: 'ALL',
      status: 'ALL',
      window: '30d'
    };
    setFilters(reset);
    loadData(reset);
  };

  if (loading && !overviewData) {
    return <LoadingSkeleton />;
  }

  if (error && !overviewData) {
    return <ErrorState message={error} onRetry={() => loadData(filters)} />;
  }

  return (
    <div className="overview-container">
      {/* 1. DGMS Mandate & Sub-Header */}
      <SubHeaderBar />

      {/* 2. Global Regulatory Filter Toolbar */}
      <FilterToolbar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        onTriggerSync={onTriggerSync}
        isSyncing={isSyncing}
        pendingSyncCount={overviewData?.syncStatus?.pendingHandheldLogs}
        lastSyncTime={overviewData?.syncStatus?.lastSynchronized}
      />

      {/* 3. Directorate Aggregate Telemetry (8 KPI Cards) */}
      <TelemetryKpiGrid telemetry={overviewData?.telemetry} />

      {/* 4. Geo-Spatial Basin Monitoring Map & Distribution (Split 66% / 34%) */}
      <div className="monitoring-split-grid">
        <CoalBasinMap onSelectMine={onSelectMine} />
        <div className="right-analytics-column">
          <SeverityDistribution distribution={overviewData?.issueSeverityDistribution} />
          <HighestAttentionMines attentionMines={overviewData?.highestAttentionMines} onSelectMine={onSelectMine} filters={filters} />
        </div>
      </div>

      {/* 5. Recent Incidents & Field Safety Submissions (Mobile Telemetry) */}
      <RecentIncidents incidents={incidents} />

      {/* 6. AI Risk Intelligence & Predictive Early Warning */}
      <AiRiskIntelligence insights={overviewData?.aiRiskIntelligence} />
    </div>
  );
}

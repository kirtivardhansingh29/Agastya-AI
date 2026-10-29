import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import OverviewPage from './pages/OverviewPage';
import MineMonitoringPage from './pages/MineMonitoringPage';
import MineDetailPage from './pages/MineDetailPage';
import InspectionDirectoryPage from './pages/InspectionDirectoryPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import ViolationsDirectoryPage from './pages/ViolationsDirectoryPage';
import CorrectiveActionsPage from './pages/CorrectiveActionsPage';
import IncidentDirectoryPage from './pages/IncidentDirectoryPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import AttendanceWorkforcePage from './pages/AttendanceWorkforcePage';
import ContractorsDirectoryPage from './pages/ContractorsDirectoryPage';
import ContractorDetailPage from './pages/ContractorDetailPage';
import GrievancesDirectoryPage from './pages/GrievancesDirectoryPage';
import GrievanceDetailPage from './pages/GrievanceDetailPage';
import AIRiskIntelligencePage from './pages/AIRiskIntelligencePage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import PlaceholderPage from './components/common/PlaceholderPage';
import SplashScreen from './components/intro/SplashScreen';
import LoginPopup from './components/auth/LoginPopup';
import { NAV_ITEMS } from './components/layout/Sidebar';
import { triggerTelemetrySync } from './services/api';


import './styles/global.css';
import './styles/shell.css';
import './styles/overview.css';
import './styles/map.css';
import './styles/mine-monitoring.css';
import './styles/mine-detail.css';
import './styles/inspections.css';
import './styles/incidents.css';
import './styles/attendance.css';
import './styles/arun-chat.css';
import './styles/splash.css';
import './styles/login.css';

function parseCurrentRoute() {
  const path = window.location.pathname.replace(/^\/+/, '');
  const hash = window.location.hash.replace(/^#\/?/, '');
  const routeStr = path || hash;

  if (routeStr.startsWith('contractors/')) {
    const contractorId = routeStr.replace('contractors/', '');
    return { tab: 'contractors', mineId: null, inspectionId: null, incidentId: null, contractorId, grievanceId: null };
  } else if (routeStr === 'contractors') {
    return { tab: 'contractors', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr.startsWith('grievances/')) {
    const submissionId = routeStr.replace('grievances/', '');
    return { tab: 'grievances', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: submissionId };
  } else if (routeStr === 'grievances') {
    return { tab: 'grievances', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr.startsWith('incidents/')) {
    const submissionId = routeStr.replace('incidents/', '');
    return { tab: 'incidents', mineId: null, inspectionId: null, incidentId: submissionId, contractorId: null, grievanceId: null };
  } else if (routeStr === 'incidents') {
    return { tab: 'incidents', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr.startsWith('inspections/')) {
    const submissionId = routeStr.replace('inspections/', '');
    return { tab: 'inspections', mineId: null, inspectionId: submissionId, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr === 'inspections') {
    return { tab: 'inspections', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr === 'attendance-workforce' || routeStr === 'workforce' || routeStr === 'attendance') {
    return { tab: 'attendance-workforce', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr === 'safety-violations' || routeStr === 'violations') {
    return { tab: 'violations', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr === 'corrective-actions') {
    return { tab: 'corrective-actions', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr.startsWith('mine/')) {
    const mineId = routeStr.replace('mine/', '');
    return { tab: 'monitoring', mineId, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr === 'live-map') {
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', '/mine-monitoring');
    }
    return { tab: 'monitoring', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null, initialView: 'map' };
  } else if (routeStr === 'mine-monitoring' || routeStr === 'monitoring') {
    return { tab: 'monitoring', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else if (routeStr === 'overview' || routeStr === '') {
    return { tab: 'overview', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  } else {
    return { tab: routeStr, mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null };
  }
}

const AUTH_SESSION_KEY = 'agastya_auth_user';

export default function App() {
  const [routeState, setRouteState] = useState(parseCurrentRoute());
  const [showSplash, setShowSplash] = useState(true);
  // Demo login session (client-side only — see components/auth/LoginPopup.jsx)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user) => {
    try { sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user)); } catch { /* noop */ }
    setAuthUser(user);
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch { /* noop */ }
    setAuthUser(null);
  };
  const [syncStatus, setSyncStatus] = useState(null);
  const [priorityBannerData, setPriorityBannerData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alertsCount, setAlertsCount] = useState(null);

  useEffect(() => {
    const handleRouteChange = () => {
      setRouteState(parseCurrentRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateToMine = (mineId) => {
    const newPath = `/mine/${mineId}`;
    window.history.pushState(null, '', newPath);
    setRouteState({ tab: 'monitoring', mineId, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null });
  };

  const navigateToInspection = (submissionId) => {
    const newPath = `/inspections/${submissionId}`;
    window.history.pushState(null, '', newPath);
    setRouteState({ tab: 'inspections', mineId: null, inspectionId: submissionId, incidentId: null, contractorId: null, grievanceId: null });
  };

  const navigateToIncident = (submissionId) => {
    const newPath = `/incidents/${submissionId}`;
    window.history.pushState(null, '', newPath);
    setRouteState({ tab: 'incidents', mineId: null, inspectionId: null, incidentId: submissionId, contractorId: null, grievanceId: null });
  };

  const navigateToContractor = (contractorId) => {
    const newPath = `/contractors/${contractorId}`;
    window.history.pushState(null, '', newPath);
    setRouteState({ tab: 'contractors', mineId: null, inspectionId: null, incidentId: null, contractorId, grievanceId: null });
  };

  const navigateToGrievance = (submissionId) => {
    const newPath = `/grievances/${submissionId}`;
    window.history.pushState(null, '', newPath);
    setRouteState({ tab: 'grievances', mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: submissionId });
  };

  const handleSelectTab = (tabId) => {
    let newPath = '/overview';
    if (tabId === 'monitoring' || tabId === 'live-map') {
      newPath = '/mine-monitoring';
    } else if (tabId === 'inspections') {
      newPath = '/inspections';
    } else if (tabId === 'incidents') {
      newPath = '/incidents';
    } else if (tabId === 'attendance-workforce' || tabId === 'workforce') {
      newPath = '/attendance-workforce';
    } else if (tabId === 'contractors') {
      newPath = '/contractors';
    } else if (tabId === 'grievances') {
      newPath = '/grievances';
    } else if (tabId === 'violations') {
      newPath = '/safety-violations';
    } else if (tabId === 'corrective-actions') {
      newPath = '/corrective-actions';
    } else if (tabId !== 'overview') {
      newPath = `/${tabId}`;
    }

    window.history.pushState(null, '', newPath);
    setRouteState({ tab: tabId, mineId: null, inspectionId: null, incidentId: null, contractorId: null, grievanceId: null });
  };

  const handleUpdateSync = (newSync, newBanner) => {
    setSyncStatus(newSync || null);
    setPriorityBannerData(newBanner || null);
  };

  const handleTriggerSync = async () => {
    try {
      setIsSyncing(true);
      const res = await triggerTelemetrySync();
      setSyncStatus(prev => ({
        ...prev,
        pendingHandheldLogs: res?.pendingCount ?? 0,
        lastSynchronized: 'Just now'
      }));
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentNavItem = NAV_ITEMS.find(i => i.id === routeState.tab);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {!showSplash && !authUser && <LoginPopup onLogin={handleLogin} />}
      {authUser && (
      <AppShell
      activeTab={routeState.mineId ? 'monitoring' : routeState.tab}
      onSelectTab={handleSelectTab}
      syncStatus={syncStatus}
      onTriggerSync={handleTriggerSync}
      isSyncing={isSyncing}
      priorityBannerData={priorityBannerData}
      onSelectIncident={navigateToIncident}
      alertsCount={alertsCount}
      authUser={authUser}
      onLogout={handleLogout}
    >
      {routeState.contractorId ? (
        <ContractorDetailPage
          contractorId={routeState.contractorId}
          onBack={() => handleSelectTab('contractors')}
          onSelectMine={navigateToMine}
        />
      ) : routeState.grievanceId ? (
        <GrievanceDetailPage
          submissionId={routeState.grievanceId}
          onBack={() => handleSelectTab('grievances')}
          onSelectMine={navigateToMine}
        />
      ) : routeState.incidentId ? (
        <IncidentDetailPage
          submissionId={routeState.incidentId}
          onBack={() => handleSelectTab('incidents')}
          onSelectMine={navigateToMine}
        />
      ) : routeState.inspectionId ? (
        <InspectionDetailPage
          submissionId={routeState.inspectionId}
          onBack={() => handleSelectTab('inspections')}
          onSelectMine={navigateToMine}
        />
      ) : routeState.mineId ? (
        <MineDetailPage
          mineId={routeState.mineId}
          onBack={() => handleSelectTab('monitoring')}
          onSelectInspection={navigateToInspection}
          onSelectIncident={navigateToIncident}
          onSelectContractor={navigateToContractor}
          onSelectGrievance={navigateToGrievance}
        />
      ) : routeState.tab === 'overview' ? (
        <OverviewPage
          onUpdateSyncStatus={handleUpdateSync}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
          onSelectMine={navigateToMine}
        />
      ) : routeState.tab === 'monitoring' || routeState.tab === 'live-map' ? (
        <MineMonitoringPage
          onSelectMine={navigateToMine}
        />
      ) : routeState.tab === 'inspections' ? (
        <InspectionDirectoryPage
          onSelectInspection={navigateToInspection}
        />
      ) : routeState.tab === 'incidents' ? (
        <IncidentDirectoryPage
          onSelectIncident={navigateToIncident}
        />
      ) : routeState.tab === 'attendance-workforce' || routeState.tab === 'workforce' ? (
        <AttendanceWorkforcePage />
      ) : routeState.tab === 'contractors' ? (
        <ContractorsDirectoryPage
          onSelectContractor={navigateToContractor}
        />
      ) : routeState.tab === 'grievances' ? (
        <GrievancesDirectoryPage
          onSelectGrievance={navigateToGrievance}
        />
      ) : routeState.tab === 'violations' ? (
        <ViolationsDirectoryPage
          onSelectInspection={navigateToInspection}
        />
      ) : routeState.tab === 'corrective-actions' ? (
        <CorrectiveActionsPage
          onSelectInspection={navigateToInspection}
        />
      ) : routeState.tab === 'ai-risk' ? (
        <AIRiskIntelligencePage
          onSelectMine={navigateToMine}
        />
      ) : routeState.tab === 'reports' ? (
        <ReportsPage
          onSelectMine={navigateToMine}
        />
      ) : routeState.tab === 'alerts' ? (
        <AlertsPage
          onSelectMine={navigateToMine}
          onSelectInspection={navigateToInspection}
          onSelectIncident={navigateToIncident}
          onUpdateAlertsCount={setAlertsCount}
        />
      ) : (
        <PlaceholderPage
          title={currentNavItem ? currentNavItem.label : 'Module'}
          onBackToOverview={() => handleSelectTab('overview')}
        />
      )}

    </AppShell>
      )}
    </>
  );
}


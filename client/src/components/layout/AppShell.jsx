import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import PriorityBanner from './PriorityBanner';
import ArunChat from '../chat/ArunChat';

export default function AppShell({
  children,
  activeTab,
  onSelectTab,
  syncStatus,
  onTriggerSync,
  isSyncing,
  priorityBannerData,
  onSelectIncident,
  alertsCount,
  authUser,
  onLogout
}) {
  return (
    <div className="app-shell">
      {/* Fixed Left Regulatory Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} alertsCount={alertsCount} />

      {/* Main App Container */}
      <div className="main-wrapper">
        {/* Top Header */}
        <TopHeader
          syncStatus={syncStatus}
          onTriggerSync={onTriggerSync}
          isSyncing={isSyncing}
          authUser={authUser}
          onLogout={onLogout}
        />

        {/* Priority Red Alert Banner */}
        <PriorityBanner onSelectIncident={onSelectIncident} />

        {/* Scrollable Dashboard View */}
        <main className="dashboard-content-scroll">
          {children}
        </main>
      </div>

      {/* Arun — Agastya AI chat assistant (floating, available on every page) */}
      <ArunChat />
    </div>
  );
}


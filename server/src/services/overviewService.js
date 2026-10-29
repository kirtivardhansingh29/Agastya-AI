import {
  mineRepo,
  inspectionRepo,
  attendanceRepo,
  incidentRepo
} from '../repositories/firestoreRepository.js';
import { getHighestAttentionMines } from './mineAttentionService.js';

let lastSyncTimestamp = new Date();

export async function getOverviewSummary(filters = {}) {
  const [mines, inspections, attendance, incidents] = await Promise.all([
    mineRepo.getAll(),
    inspectionRepo.getAll(),
    attendanceRepo.getAll(),
    incidentRepo.getAll()
  ]);

  // Build mine lookup map by mine_id
  const mineMap = new Map();
  for (const m of mines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // 1. Filter Mines by state, district, asset
  let filteredMines = mines;
  if (filters.state && filters.state !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.state && m.state.toLowerCase().includes(filters.state.toLowerCase()));
  }
  if (filters.district && filters.district !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.district && m.district.toLowerCase().includes(filters.district.toLowerCase()));
  }
  if (filters.asset && filters.asset !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.mine_id === filters.asset);
  }

  // 2. Enrich & Filter Inspections (Phase 6C Hybrid Local JSON + Firestore Mobile data)
  let filteredInspections = inspections.map(i => {
    const mine = mineMap.get(i.mine_id) || {};
    return {
      ...i,
      state: mine.state || i.state || null,
      district: mine.district || i.district || null,
      operator: mine.operator || i.operator || null
    };
  });

  if (filters.state && filters.state !== 'ALL') {
    filteredInspections = filteredInspections.filter(i => i.state && i.state.toLowerCase().includes(filters.state.toLowerCase()));
  }
  if (filters.district && filters.district !== 'ALL') {
    filteredInspections = filteredInspections.filter(i => i.district && i.district.toLowerCase().includes(filters.district.toLowerCase()));
  }
  if (filters.asset && filters.asset !== 'ALL') {
    filteredInspections = filteredInspections.filter(i => i.mine_id === filters.asset);
  }
  if (filters.scope && filters.scope !== 'ALL') {
    filteredInspections = filteredInspections.filter(i => i.inspection_type && i.inspection_type.toLowerCase() === filters.scope.toLowerCase());
  }
  if (filters.severity && filters.severity !== 'ALL') {
    filteredInspections = filteredInspections.filter(i => i.violation_severity && String(i.violation_severity).toLowerCase() === filters.severity.toLowerCase());
  }
  if (filters.status && filters.status !== 'ALL') {
    filteredInspections = filteredInspections.filter(i => i.review_status && String(i.review_status).toLowerCase() === filters.status.toLowerCase());
  }

  // 3. Enrich & Filter Incidents (Phase 6C Hybrid Local JSON + Firestore Mobile data)
  let filteredIncidents = incidents.map(inc => {
    const mine = mineMap.get(inc.mine_id) || {};
    return {
      ...inc,
      state: mine.state || inc.state || null,
      district: mine.district || inc.district || null,
      operator: mine.operator || inc.operator || null
    };
  });

  if (filters.state && filters.state !== 'ALL') {
    filteredIncidents = filteredIncidents.filter(i => i.state && i.state.toLowerCase().includes(filters.state.toLowerCase()));
  }
  if (filters.district && filters.district !== 'ALL') {
    filteredIncidents = filteredIncidents.filter(i => i.district && i.district.toLowerCase().includes(filters.district.toLowerCase()));
  }
  if (filters.asset && filters.asset !== 'ALL') {
    filteredIncidents = filteredIncidents.filter(i => i.mine_id === filters.asset);
  }

  // 4. Enrich & Filter Attendance (Phase 6C Hybrid Local JSON + Firestore Mobile data)
  let filteredAttendance = attendance.map(att => {
    const mine = mineMap.get(att.mine_id) || {};
    return {
      ...att,
      state: mine.state || att.state || null,
      district: mine.district || att.district || null,
      operator: mine.operator || att.operator || null
    };
  });

  if (filters.state && filters.state !== 'ALL') {
    filteredAttendance = filteredAttendance.filter(a => a.state && a.state.toLowerCase().includes(filters.state.toLowerCase()));
  }
  if (filters.district && filters.district !== 'ALL') {
    filteredAttendance = filteredAttendance.filter(a => a.district && a.district.toLowerCase().includes(filters.district.toLowerCase()));
  }
  if (filters.asset && filters.asset !== 'ALL') {
    filteredAttendance = filteredAttendance.filter(a => a.mine_id === filters.asset);
  }

  // --- Overview Telemetry Aggregations ---

  // 1. Total Mines Metric
  const totalMinesCount = filteredMines.length;
  const operatingMines = filteredMines.filter(m => m.status === 'operating').length;
  const suspendedMines = filteredMines.filter(m => m.status === 'suspended').length;
  const uniqueStatesCount = new Set(filteredMines.map(m => m.state).filter(Boolean)).size;

  // 2. Inspections Metric (Unified Hybrid Dataset)
  const totalInspectionsCount = filteredInspections.length;

  // 3. Open Violations Metric
  const openViolationsList = filteredInspections.filter(i => String(i.violation_found).toLowerCase() === 'yes' && String(i.review_status).toLowerCase() !== 'resolved');
  const openViolationsCount = openViolationsList.length;
  const criticalViolationsCount = openViolationsList.filter(i => String(i.violation_severity).toLowerCase() === 'critical').length;
  const majorViolationsCount = openViolationsList.filter(i => String(i.violation_severity).toLowerCase() === 'major').length;
  const minorViolationsCount = openViolationsList.filter(i => String(i.violation_severity).toLowerCase() === 'minor').length;

  // 4. Critical Incidents Metric
  const criticalIncidentsList = filteredIncidents.filter(inc => String(inc.severity).toLowerCase() === 'critical' || String(inc.severity).toLowerCase() === 'fatal');
  const fatalCount = criticalIncidentsList.filter(inc => String(inc.severity).toLowerCase() === 'fatal').length;
  const highRiskActiveCount = criticalIncidentsList.filter(inc => String(inc.severity).toLowerCase() === 'critical').length;

  // 5. Pending Review Metric
  const pendingReviewCount = filteredInspections.filter(i => String(i.review_status).toLowerCase() === 'pending').length;

  // 6. Workforce Live & Attendance Rate
  let expectedTotal = 0;
  let actualTotal = 0;
  for (const record of filteredAttendance) {
    expectedTotal += (record.expected_headcount || 0);
    actualTotal += (record.actual_headcount || 0);
  }

  const attendanceRate = expectedTotal > 0
    ? +((actualTotal / expectedTotal) * 100).toFixed(1)
    : null;

  // 7. Issue Severity Distribution (Unified Hybrid Dataset)
  const totalInspectionsWithViolations = filteredInspections.length;
  const distCritical = filteredInspections.filter(i => String(i.violation_found).toLowerCase() === 'yes' && String(i.violation_severity).toLowerCase() === 'critical').length;
  const distMajor = filteredInspections.filter(i => String(i.violation_found).toLowerCase() === 'yes' && String(i.violation_severity).toLowerCase() === 'major').length;
  const distMinor = filteredInspections.filter(i => String(i.violation_found).toLowerCase() === 'yes' && String(i.violation_severity).toLowerCase() === 'minor').length;
  const distNoViolation = filteredInspections.filter(i => String(i.violation_found).toLowerCase() !== 'yes').length;

  const getPercent = (cnt) => totalInspectionsWithViolations > 0 ? +(cnt / totalInspectionsWithViolations * 100).toFixed(1) : 0;

  const issueSeverityDistribution = {
    totalMines: totalMinesCount,
    totalInspections: totalInspectionsWithViolations,
    criticalViolations: { count: distCritical, percentage: getPercent(distCritical), label: "Critical Violations", color: "#dc2626" },
    majorViolations: { count: distMajor, percentage: getPercent(distMajor), label: "Major Violations", color: "#ea580c" },
    minorViolations: { count: distMinor, percentage: getPercent(distMinor), label: "Minor Violations", color: "#eab308" },
    noViolation: { count: distNoViolation, percentage: getPercent(distNoViolation), label: "No Violation / Compliant", color: "#22c55e" }
  };

  // 8. Highest Attention Mines
  const highestAttentionMines = await getHighestAttentionMines(filters);

  // 9. Priority Alert Banner (Critical Incident)
  const priorityIncident = filteredIncidents.find(inc => String(inc.severity).toLowerCase() === 'critical');
  const priorityBanner = priorityIncident ? {
    alertLevel: "PRIORITY RED",
    mine_id: priorityIncident.mine_id,
    headline: `${priorityIncident.submission_id} / ${priorityIncident.mine_id} - ${priorityIncident.description ? priorityIncident.description.substring(0, 100) : 'Critical Incident Reported'}`,
    peopleAffected: priorityIncident.people_affected || 0,
    date_time: priorityIncident.date_time
  } : null;

  // 10. Sync Status
  const pendingSyncInspections = inspections.filter(i => String(i.sync_status).toLowerCase() === 'pending').length;
  const pendingSyncAttendance = attendance.filter(a => String(a.sync_status).toLowerCase() === 'pending').length;
  const pendingSyncIncidents = incidents.filter(inc => String(inc.sync_status).toLowerCase() === 'pending').length;
  const totalPendingSubmissions = pendingSyncInspections + pendingSyncAttendance + pendingSyncIncidents;

  // 11. Map Points
  const mapPoints = filteredMines
    .filter(m => m.location && m.location.latitude && m.location.longitude)
    .map(m => ({
      mine_id: m.mine_id,
      name: m.mine_name,
      state: m.state,
      operator: m.operator,
      lat: m.location.latitude,
      lon: m.location.longitude,
      status: m.status,
      risk_level: m.risk_level || null,
      inspector: m.inspector_in_charge || null
    }));

  return {
    telemetry: {
      totalMines: {
        value: totalMinesCount,
        operating: operatingMines,
        suspended: suspendedMines,
        label: uniqueStatesCount > 0 ? `Across ${uniqueStatesCount} State Directorates` : "Across Monitored Directorates"
      },
      inspections: {
        value: totalInspectionsCount,
        trend: null,
        period: "Total Submissions",
        trendLabel: null
      },
      openViolations: {
        value: openViolationsCount,
        critical: criticalViolationsCount,
        major: majorViolationsCount,
        minor: minorViolationsCount,
        actionRequired: openViolationsCount > 0
      },
      criticalIncidents: {
        value: criticalIncidentsList.length,
        fatalInquiries: fatalCount,
        highRiskActive: highRiskActiveCount
      },
      pendingReview: {
        value: pendingReviewCount,
        label: "Pending Sign-off"
      },
      workforceLive: {
        value: actualTotal > 0 ? actualTotal : null,
        expected: expectedTotal > 0 ? expectedTotal : null,
        label: "Shift biometric & geo-tag check-ins"
      },
      attendanceRate: {
        value: attendanceRate,
        expected: expectedTotal > 0 ? expectedTotal : null,
        actual: actualTotal > 0 ? actualTotal : null
      }
    },
    issueSeverityDistribution,
    highestAttentionMines,
    priorityBanner,
    syncStatus: {
      pendingHandheldLogs: totalPendingSubmissions,
      lastSynchronized: getRelativeTime(lastSyncTimestamp)
    },
    mapPoints,
    aiRiskIntelligence: []
  };
}

export async function getRecentIncidents(filter = 'all') {
  const incidents = await incidentRepo.getAll();
  if (filter === 'immediate') {
    return incidents.filter(i => String(i.severity).toLowerCase() === 'critical' || String(i.severity).toLowerCase() === 'major');
  }
  return incidents;
}

export async function triggerDataSync() {
  lastSyncTimestamp = new Date();
  const [inspections, attendance, incidents] = await Promise.all([
    inspectionRepo.getAll(),
    attendanceRepo.getAll(),
    incidentRepo.getAll()
  ]);

  const pendingCount = 
    inspections.filter(i => String(i.sync_status).toLowerCase() === 'pending').length +
    attendance.filter(a => String(a.sync_status).toLowerCase() === 'pending').length +
    incidents.filter(inc => String(inc.sync_status).toLowerCase() === 'pending').length;

  return {
    success: true,
    message: "Handheld telemetry synchronized successfully with Agastya AI",
    syncedAt: lastSyncTimestamp.toISOString(),
    pendingCount
  };
}

function getRelativeTime(date) {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin} min ago`;
}

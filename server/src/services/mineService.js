import {
  mineRepo,
  inspectionRepo,
  incidentRepo,
  attendanceRepo,
  grievanceRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service logic for Mine Monitoring & Mine Detail endpoints
 */

export async function getFilteredMines(query = {}) {
  const [allMines, allInspections, allIncidents] = await Promise.all([
    mineRepo.getAll(),
    inspectionRepo.getAll(),
    incidentRepo.getAll()
  ]);

  // Build lookup map for latest inspection per mine
  const latestInspectionMap = new Map();
  const violationCountMap = new Map();
  for (const insp of allInspections) {
    if (!insp.mine_id) continue;
    const isViolation = String(insp.violation_found).toLowerCase() === 'yes';
    if (isViolation) {
      violationCountMap.set(insp.mine_id, (violationCountMap.get(insp.mine_id) || 0) + 1);
    }
    const existingDate = latestInspectionMap.get(insp.mine_id);
    if (!existingDate || new Date(insp.date_time) > new Date(existingDate)) {
      latestInspectionMap.set(insp.mine_id, insp.date_time);
    }
  }

  // Build lookup map for incident count per mine
  const incidentCountMap = new Map();
  for (const inc of allIncidents) {
    if (!inc.mine_id) continue;
    incidentCountMap.set(inc.mine_id, (incidentCountMap.get(inc.mine_id) || 0) + 1);
  }

  // Apply search and field filters to mines FIRST
  let filtered = allMines;

  if (query.state && query.state !== 'ALL') {
    filtered = filtered.filter(m => String(m.state).toLowerCase() === query.state.toLowerCase());
  }

  if (query.district && query.district !== 'ALL') {
    filtered = filtered.filter(m => String(m.district).toLowerCase() === query.district.toLowerCase());
  }

  if (query.operator && query.operator !== 'ALL') {
    filtered = filtered.filter(m => String(m.operator).toLowerCase() === query.operator.toLowerCase());
  }

  if (query.status && query.status !== 'ALL') {
    filtered = filtered.filter(m => String(m.status).toLowerCase() === query.status.toLowerCase());
  }

  if (query.risk_level && query.risk_level !== 'ALL') {
    filtered = filtered.filter(m => String(m.risk_level).toLowerCase() === query.risk_level.toLowerCase());
  }

  if (query.search) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(m =>
      (m.mine_name && m.mine_name.toLowerCase().includes(q)) ||
      (m.mine_id && m.mine_id.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q)) ||
      (m.state && m.state.toLowerCase().includes(q))
    );
  }

  // Calculate summary stats ON THE FILTERED DATASET
  const totalMinesCount = filtered.length;
  const operatingMinesCount = filtered.filter(m => m.status === 'operating').length;
  const suspendedMinesCount = filtered.filter(m => m.status === 'suspended').length;
  const uniqueStates = new Set(filtered.map(m => m.state).filter(Boolean));

  // Attach derived fields and top-level coordinates to each mine object
  const data = filtered.map(mine => {
    const latestInspection = latestInspectionMap.get(mine.mine_id) || null;
    const violationCount = violationCountMap.get(mine.mine_id) ?? 0;
    const incidentCount = incidentCountMap.get(mine.mine_id) ?? 0;
    const lat = mine.location?.latitude;
    const lon = mine.location?.longitude;

    return {
      ...mine,
      latitude: typeof lat === 'number' && !isNaN(lat) ? lat : null,
      longitude: typeof lon === 'number' && !isNaN(lon) ? lon : null,
      latest_inspection: latestInspection,
      violation_count: violationCount,
      incident_count: incidentCount
    };
  });

  return {
    summary: {
      totalMines: totalMinesCount,
      operatingMines: operatingMinesCount,
      suspendedMines: suspendedMinesCount,
      statesRepresented: uniqueStates.size
    },
    count: data.length,
    data
  };
}

export async function getMineMapLocations(query = {}) {
  const result = await getFilteredMines(query);
  return result.data.filter(m => typeof m.latitude === 'number' && typeof m.longitude === 'number');
}

export async function getMineById(mineId) {
  const mine = await mineRepo.getById('mine_id', mineId);
  return mine;
}

export async function getMineSummaryMetrics(mineId) {
  const mine = await mineRepo.getById('mine_id', mineId);
  if (!mine) return null;

  const [inspections, incidents, attendance, grievances] = await Promise.all([
    inspectionRepo.filter(i => i.mine_id === mineId),
    incidentRepo.filter(i => i.mine_id === mineId),
    attendanceRepo.filter(a => a.mine_id === mineId),
    grievanceRepo.filter(g => g.mine_id === mineId)
  ]);

  const totalInspections = inspections.length;
  const violationRecords = inspections.filter(i => String(i.violation_found).toLowerCase() === 'yes');
  const totalViolations = violationRecords.length;
  const criticalViolations = violationRecords.filter(i => String(i.violation_severity).toLowerCase() === 'critical').length;
  const totalIncidents = incidents.length;

  // Pending Sync Metric: count across all datasets matching mine_id where sync_status === "pending"
  let pendingSyncCount = 0;
  [...inspections, ...incidents, ...attendance, ...grievances].forEach(record => {
    if (record.sync_status === 'pending') {
      pendingSyncCount++;
    }
  });

  // Latest Attendance Headcount: most recent attendance record sorted by date_time descending
  let latestAttendanceHeadcount = null;
  if (attendance.length > 0) {
    const sortedAttendance = [...attendance].sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    const mostRecent = sortedAttendance[0];
    if (mostRecent && typeof mostRecent.actual_headcount === 'number') {
      latestAttendanceHeadcount = mostRecent.actual_headcount;
    }
  }

  return {
    mine_id: mine.mine_id,
    mine_name: mine.mine_name,
    totalInspections,
    totalViolations,
    criticalViolations,
    totalIncidents,
    pendingSyncCount,
    latestAttendanceHeadcount
  };
}

export async function getMineInspections(mineId) {
  const inspections = await inspectionRepo.filter(i => i.mine_id === mineId);
  return inspections.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
}

export async function getMineIncidents(mineId) {
  const incidents = await incidentRepo.filter(i => i.mine_id === mineId);
  return incidents.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
}

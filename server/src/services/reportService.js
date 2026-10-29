import {
  mineRepo,
  inspectionRepo,
  attendanceRepo,
  incidentRepo
} from '../repositories/firestoreRepository.js';

export async function getReportsAnalytics(filters = {}) {
  const [mines, inspections, attendance, incidents] = await Promise.all([
    mineRepo.getAll(),
    inspectionRepo.getAll(),
    attendanceRepo.getAll(),
    incidentRepo.getAll()
  ]);

  // Extract filter options
  const stateOptions = Array.from(new Set(mines.map(m => m.state).filter(Boolean))).sort();
  const districtOptions = Array.from(new Set(mines.map(m => m.district).filter(Boolean))).sort();
  const mineOptions = mines.map(m => ({ mine_id: m.mine_id, mine_name: m.mine_name })).sort((a, b) => a.mine_name.localeCompare(b.mine_name));

  // 1. Filter Mines
  let filteredMines = mines;
  if (filters.state && filters.state !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.state && m.state.toLowerCase() === filters.state.toLowerCase());
  }
  if (filters.district && filters.district !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.district && m.district.toLowerCase() === filters.district.toLowerCase());
  }
  if (filters.mineId && filters.mineId !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.mine_id === filters.mineId);
  }
  if (filters.riskLevel && filters.riskLevel !== 'ALL') {
    filteredMines = filteredMines.filter(m => m.risk_level && m.risk_level.toLowerCase() === filters.riskLevel.toLowerCase());
  }

  const filteredMineIds = new Set(filteredMines.map(m => m.mine_id));

  // 2. Filter Inspections
  let filteredInspections = inspections.filter(i => filteredMineIds.has(i.mine_id));
  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    filteredInspections = filteredInspections.filter(i => new Date(i.date_time).getTime() >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    filteredInspections = filteredInspections.filter(i => new Date(i.date_time).getTime() <= end);
  }

  // 3. Filter Incidents
  let filteredIncidents = incidents.filter(i => filteredMineIds.has(i.mine_id));
  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    filteredIncidents = filteredIncidents.filter(i => new Date(i.date_time).getTime() >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    filteredIncidents = filteredIncidents.filter(i => new Date(i.date_time).getTime() <= end);
  }

  // 4. Filter Attendance
  const filteredAttendance = attendance.filter(a => filteredMineIds.has(a.mine_id));

  // --- KPI Calculation ---
  const totalInspections = filteredInspections.length;
  const violationsList = filteredInspections.filter(i => i.violation_found === 'yes');
  const totalViolations = violationsList.length;
  const criticalViolations = violationsList.filter(i => i.violation_severity === 'critical').length;
  const majorViolations = violationsList.filter(i => i.violation_severity === 'major').length;
  const minorViolations = violationsList.filter(i => i.violation_severity === 'minor').length;

  const totalIncidents = filteredIncidents.length;
  const criticalIncidents = filteredIncidents.filter(inc => inc.severity === 'critical' || inc.severity === 'fatal').length;
  const fatalIncidents = filteredIncidents.filter(inc => inc.severity === 'fatal').length;

  const criticalRiskMines = filteredMines.filter(m => m.risk_level === 'critical').length;
  const totalMines = filteredMines.length;

  const kpis = {
    totalInspections,
    totalViolations,
    criticalViolations,
    majorViolations,
    minorViolations,
    totalIncidents,
    criticalIncidents,
    fatalIncidents,
    criticalRiskMines,
    totalMines
  };

  // --- CHART 1: Inspection Trend (By Month) ---
  const monthMapInspections = {};
  filteredInspections.forEach(insp => {
    if (!insp.date_time) return;
    const d = new Date(insp.date_time);
    if (isNaN(d.getTime())) return;
    const yearMonth = d.toISOString().substring(0, 7); // e.g. "2024-10"
    if (!monthMapInspections[yearMonth]) {
      monthMapInspections[yearMonth] = { total: 0, violations: 0 };
    }
    monthMapInspections[yearMonth].total += 1;
    if (insp.violation_found === 'yes') {
      monthMapInspections[yearMonth].violations += 1;
    }
  });

  const inspectionTrend = Object.keys(monthMapInspections)
    .sort()
    .map(ym => {
      const [year, month] = ym.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
      return {
        monthKey: ym,
        month: label,
        inspections: monthMapInspections[ym].total,
        violations: monthMapInspections[ym].violations
      };
    });

  // --- CHART 2: Inspection Outcome Distribution ---
  const compliantCount = filteredInspections.filter(i => i.violation_found !== 'yes').length;
  const inspectionOutcomeDistribution = [
    { name: 'Compliant / Pass', value: compliantCount, color: '#10b981' },
    { name: 'Critical Violation', value: criticalViolations, color: '#ef4444' },
    { name: 'Major Violation', value: majorViolations, color: '#f97316' },
    { name: 'Minor Violation', value: minorViolations, color: '#eab308' }
  ].filter(item => item.value >= 0);

  // --- CHART 3: Violations by Severity ---
  const violationsBySeverity = [
    { severity: 'Critical', count: criticalViolations, color: '#ef4444' },
    { severity: 'Major', count: majorViolations, color: '#f97316' },
    { severity: 'Minor', count: minorViolations, color: '#eab308' }
  ];

  // --- CHART 4: Incident Trend (By Month) ---
  const monthMapIncidents = {};
  filteredIncidents.forEach(inc => {
    if (!inc.date_time) return;
    const d = new Date(inc.date_time);
    if (isNaN(d.getTime())) return;
    const yearMonth = d.toISOString().substring(0, 7);
    if (!monthMapIncidents[yearMonth]) {
      monthMapIncidents[yearMonth] = { total: 0, critical: 0 };
    }
    monthMapIncidents[yearMonth].total += 1;
    if (inc.severity === 'critical' || inc.severity === 'fatal') {
      monthMapIncidents[yearMonth].critical += 1;
    }
  });

  const incidentTrend = Object.keys(monthMapIncidents)
    .sort()
    .map(ym => {
      const [year, month] = ym.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
      return {
        monthKey: ym,
        month: label,
        totalIncidents: monthMapIncidents[ym].total,
        criticalIncidents: monthMapIncidents[ym].critical
      };
    });

  // --- CHART 5: Incidents by Severity ---
  const incSeverityCounts = {
    fatal: 0,
    critical: 0,
    major: 0,
    medium: 0,
    minor: 0,
    low: 0
  };

  filteredIncidents.forEach(inc => {
    const sev = (inc.severity || 'low').toLowerCase();
    if (incSeverityCounts[sev] !== undefined) {
      incSeverityCounts[sev] += 1;
    } else {
      incSeverityCounts.minor += 1;
    }
  });

  const incidentsBySeverity = [
    { severity: 'Fatal', count: incSeverityCounts.fatal, color: '#991b1b' },
    { severity: 'Critical', count: incSeverityCounts.critical, color: '#ef4444' },
    { severity: 'Major', count: incSeverityCounts.major, color: '#f97316' },
    { severity: 'Medium', count: incSeverityCounts.medium, color: '#eab308' },
    { severity: 'Minor / Low', count: incSeverityCounts.minor + incSeverityCounts.low, color: '#0284c7' }
  ];

  // --- CHART 6: Mines by Risk Level ---
  const mineRiskCounts = {
    critical: 0,
    high: 0,
    warning: 0,
    medium: 0,
    compliant: 0,
    low: 0
  };

  filteredMines.forEach(m => {
    const risk = (m.risk_level || 'compliant').toLowerCase();
    if (mineRiskCounts[risk] !== undefined) {
      mineRiskCounts[risk] += 1;
    } else {
      mineRiskCounts.compliant += 1;
    }
  });

  const minesByRiskLevel = [
    { level: 'Critical', count: mineRiskCounts.critical, color: '#ef4444' },
    { level: 'High', count: mineRiskCounts.high, color: '#f97316' },
    { level: 'Warning / Medium', count: mineRiskCounts.warning + mineRiskCounts.medium, color: '#eab308' },
    { level: 'Compliant / Low', count: mineRiskCounts.compliant + mineRiskCounts.low, color: '#10b981' }
  ];

  return {
    kpis,
    charts: {
      inspectionTrend,
      inspectionOutcomeDistribution,
      violationsBySeverity,
      incidentTrend,
      incidentsBySeverity,
      minesByRiskLevel
    },
    filterOptions: {
      states: stateOptions,
      districts: districtOptions,
      mines: mineOptions
    }
  };
}

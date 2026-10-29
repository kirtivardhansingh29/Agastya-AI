import {
  attendanceRepo,
  mineRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service logic for Phase 4 Attendance & Workforce Monitoring
 */

export async function getFilteredAttendance(query = {}) {
  const [allAttendance, allMines] = await Promise.all([
    attendanceRepo.getAll(),
    mineRepo.getAll()
  ]);

  // Mine lookup map by mine_id
  const mineMap = new Map();
  for (const m of allMines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // Join mine metadata
  let enriched = allAttendance.map(att => {
    const mine = mineMap.get(att.mine_id) || {};
    return {
      ...att,
      mine_name: mine.mine_name || null,
      state: mine.state || null,
      district: mine.district || null,
      operator: mine.operator || null
    };
  });

  // Sort descending by date_time
  enriched.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

  // Apply filters
  let filtered = enriched;

  if (query.state && query.state !== 'ALL') {
    filtered = filtered.filter(a => a.state && a.state.toLowerCase() === query.state.toLowerCase());
  }

  if (query.district && query.district !== 'ALL') {
    filtered = filtered.filter(a => a.district && a.district.toLowerCase() === query.district.toLowerCase());
  }

  if (query.mine_id && query.mine_id !== 'ALL') {
    filtered = filtered.filter(a => a.mine_id && a.mine_id.toLowerCase() === query.mine_id.toLowerCase());
  }

  if (query.shift && query.shift !== 'ALL') {
    filtered = filtered.filter(a => a.shift && a.shift.toLowerCase() === query.shift.toLowerCase());
  }

  if (query.worker_type && query.worker_type !== 'ALL') {
    filtered = filtered.filter(a => a.worker_type && a.worker_type.toLowerCase() === query.worker_type.toLowerCase());
  }

  if (query.contractor_id && query.contractor_id !== 'ALL') {
    filtered = filtered.filter(a => a.contractor_id && a.contractor_id.toLowerCase() === query.contractor_id.toLowerCase());
  }

  if (query.from_date) {
    const fromTime = new Date(query.from_date).getTime();
    if (!isNaN(fromTime)) {
      filtered = filtered.filter(a => new Date(a.date_time).getTime() >= fromTime);
    }
  }

  if (query.to_date) {
    const toDateObj = new Date(query.to_date);
    if (query.to_date.length <= 10) {
      toDateObj.setHours(23, 59, 59, 999);
    }
    const toTime = toDateObj.getTime();
    if (!isNaN(toTime)) {
      filtered = filtered.filter(a => new Date(a.date_time).getTime() <= toTime);
    }
  }

  if (query.search) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(a =>
      (a.submission_id && a.submission_id.toLowerCase().includes(q)) ||
      (a.worker_id && a.worker_id.toLowerCase().includes(q)) ||
      (a.worker_name && a.worker_name.toLowerCase().includes(q)) ||
      (a.mine_id && a.mine_id.toLowerCase().includes(q)) ||
      (a.mine_name && a.mine_name.toLowerCase().includes(q)) ||
      (a.contractor_id && a.contractor_id.toLowerCase().includes(q))
    );
  }

  // Calculate Summary Metrics on Filtered Submissions
  const submissionCount = filtered.length;
  let totalExpected = 0;
  let totalActual = 0;

  for (const item of filtered) {
    totalExpected += (typeof item.expected_headcount === 'number' ? item.expected_headcount : 0);
    totalActual += (typeof item.actual_headcount === 'number' ? item.actual_headcount : 0);
  }

  const workforceDifference = totalExpected - totalActual;
  const attendanceRate = totalExpected > 0
    ? parseFloat(((totalActual / totalExpected) * 100).toFixed(1))
    : 0;

  // Calculate Shift Breakdown (Morning, Afternoon, Night)
  const calculateShiftMetrics = (shiftName) => {
    const shiftSubmissions = filtered.filter(a => a.shift && a.shift.toLowerCase() === shiftName);
    const count = shiftSubmissions.length;
    if (count === 0) {
      return {
        expectedHeadcount: 0,
        actualHeadcount: 0,
        attendanceRate: 0,
        workforceDifference: 0,
        submissionCount: 0
      };
    }

    let sExpected = 0;
    let sActual = 0;
    for (const item of shiftSubmissions) {
      sExpected += (typeof item.expected_headcount === 'number' ? item.expected_headcount : 0);
      sActual += (typeof item.actual_headcount === 'number' ? item.actual_headcount : 0);
    }

    return {
      expectedHeadcount: sExpected,
      actualHeadcount: sActual,
      attendanceRate: sExpected > 0 ? parseFloat(((sActual / sExpected) * 100).toFixed(1)) : 0,
      workforceDifference: sExpected - sActual,
      submissionCount: count
    };
  };

  const shiftBreakdown = {
    morning: calculateShiftMetrics('morning'),
    afternoon: calculateShiftMetrics('afternoon'),
    night: calculateShiftMetrics('night')
  };

  // Server-side Pagination
  const page = parseInt(query.page, 10) || 1;
  const pageSize = parseInt(query.pageSize, 10) || 15;
  const totalPages = Math.ceil(submissionCount / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const pagedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    summary: {
      expectedHeadcount: totalExpected,
      actualHeadcount: totalActual,
      attendanceRate,
      workforceDifference,
      submissionCount,
      shiftBreakdown
    },
    pagination: {
      page,
      pageSize,
      total: submissionCount,
      totalPages
    },
    data: pagedData
  };
}

export async function getLatestMineAttendance(mineId) {
  const [allAttendance, mine] = await Promise.all([
    attendanceRepo.filter(a => a.mine_id === mineId),
    mineRepo.getById('mine_id', mineId)
  ]);

  if (!allAttendance || allAttendance.length === 0) {
    return {
      latestRecord: null,
      metrics: {
        expectedHeadcount: 0,
        actualHeadcount: 0,
        attendanceRate: 0,
        workforceDifference: 0
      },
      records: []
    };
  }

  // Sort descending by date_time
  const sorted = [...allAttendance].sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  const latestRecord = sorted[0];

  const enrichedRecords = sorted.map(a => ({
    ...a,
    mine_name: mine?.mine_name || null,
    state: mine?.state || null,
    district: mine?.district || null,
    operator: mine?.operator || null
  }));

  const exp = typeof latestRecord.expected_headcount === 'number' ? latestRecord.expected_headcount : 0;
  const act = typeof latestRecord.actual_headcount === 'number' ? latestRecord.actual_headcount : 0;

  return {
    latestRecord: {
      ...latestRecord,
      mine_name: mine?.mine_name || null,
      state: mine?.state || null,
      district: mine?.district || null,
      operator: mine?.operator || null
    },
    metrics: {
      expectedHeadcount: exp,
      actualHeadcount: act,
      attendanceRate: exp > 0 ? parseFloat(((act / exp) * 100).toFixed(1)) : 0,
      workforceDifference: exp - act
    },
    records: enrichedRecords
  };
}

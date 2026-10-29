import {
  inspectionRepo,
  mineRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service logic for Phase 3 Inspection & Compliance Management
 */

// Helper to extract deadline date string from corrective action text if present
function extractDeadline(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/Deadline:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  return match ? match[1] : null;
}

export async function getFilteredInspections(query = {}) {
  const [allInspections, allMines] = await Promise.all([
    inspectionRepo.getAll(),
    mineRepo.getAll()
  ]);

  // Build mine lookup map by mine_id
  const mineMap = new Map();
  for (const m of allMines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // Join mine metadata with inspection records
  let enriched = allInspections.map(insp => {
    const mine = mineMap.get(insp.mine_id) || {};
    return {
      ...insp,
      mine_name: mine.mine_name || null,
      state: mine.state || null,
      district: mine.district || null,
      operator: mine.operator || null
    };
  });

  // Sort descending by date_time as default baseline
  enriched.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

  // Apply filters
  let filtered = enriched;

  if (query.state && query.state !== 'ALL') {
    filtered = filtered.filter(i => i.state && i.state.toLowerCase() === query.state.toLowerCase());
  }

  if (query.district && query.district !== 'ALL') {
    filtered = filtered.filter(i => i.district && i.district.toLowerCase() === query.district.toLowerCase());
  }

  if (query.mine_id && query.mine_id !== 'ALL') {
    filtered = filtered.filter(i => i.mine_id && i.mine_id.toLowerCase() === query.mine_id.toLowerCase());
  }

  if (query.inspection_type && query.inspection_type !== 'ALL') {
    filtered = filtered.filter(i => i.inspection_type && i.inspection_type.toLowerCase() === query.inspection_type.toLowerCase());
  }

  if (query.violation_found && query.violation_found !== 'ALL') {
    filtered = filtered.filter(i => String(i.violation_found).toLowerCase() === query.violation_found.toLowerCase());
  }

  if (query.violation_severity && query.violation_severity !== 'ALL') {
    filtered = filtered.filter(i => String(i.violation_severity).toLowerCase() === query.violation_severity.toLowerCase());
  }

  if (query.review_status && query.review_status !== 'ALL') {
    filtered = filtered.filter(i => String(i.review_status).toLowerCase() === query.review_status.toLowerCase());
  }

  if (query.sync_status && query.sync_status !== 'ALL') {
    filtered = filtered.filter(i => String(i.sync_status).toLowerCase() === query.sync_status.toLowerCase());
  }

  if (query.inspector_id && query.inspector_id !== 'ALL') {
    filtered = filtered.filter(i =>
      (i.inspector_id && i.inspector_id.toLowerCase() === query.inspector_id.toLowerCase()) ||
      (i.inspector_name && i.inspector_name.toLowerCase().includes(query.inspector_id.toLowerCase()))
    );
  }

  if (query.from_date) {
    const fromTime = new Date(query.from_date).getTime();
    if (!isNaN(fromTime)) {
      filtered = filtered.filter(i => new Date(i.date_time).getTime() >= fromTime);
    }
  }

  if (query.to_date) {
    const toDateObj = new Date(query.to_date);
    // Set to end of the day if date string without time
    if (query.to_date.length <= 10) {
      toDateObj.setHours(23, 59, 59, 999);
    }
    const toTime = toDateObj.getTime();
    if (!isNaN(toTime)) {
      filtered = filtered.filter(i => new Date(i.date_time).getTime() <= toTime);
    }
  }

  if (query.search) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(i =>
      (i.submission_id && i.submission_id.toLowerCase().includes(q)) ||
      (i.mine_id && i.mine_id.toLowerCase().includes(q)) ||
      (i.mine_name && i.mine_name.toLowerCase().includes(q)) ||
      (i.inspector_name && i.inspector_name.toLowerCase().includes(q)) ||
      (i.inspector_id && i.inspector_id.toLowerCase().includes(q))
    );
  }

  // Summary Metrics calculated ON FILTERED DATASET
  const totalInspections = filtered.length;
  const inspectionsWithViolations = filtered.filter(i => String(i.violation_found).toLowerCase() === 'yes').length;
  const criticalViolations = filtered.filter(i => String(i.violation_found).toLowerCase() === 'yes' && String(i.violation_severity).toLowerCase() === 'critical').length;
  const pendingReview = filtered.filter(i => String(i.review_status).toLowerCase() === 'pending').length;

  // Pagination
  const page = parseInt(query.page, 10) || 1;
  const pageSize = parseInt(query.pageSize, 10) || 15;
  const totalPages = Math.ceil(totalInspections / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const pagedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    summary: {
      totalInspections,
      inspectionsWithViolations,
      criticalViolations,
      pendingReview
    },
    pagination: {
      page,
      pageSize,
      total: totalInspections,
      totalPages
    },
    data: pagedData
  };
}

export async function getInspectionBySubmissionId(submissionId) {
  const inspection = await inspectionRepo.getById('submission_id', submissionId);
  if (!inspection) return null;

  const mine = inspection.mine_id ? await mineRepo.getById('mine_id', inspection.mine_id) : null;

  const deadline = extractDeadline(inspection.corrective_action);

  return {
    ...inspection,
    mine_name: mine?.mine_name || null,
    state: mine?.state || null,
    district: mine?.district || null,
    operator: mine?.operator || null,
    coalfield: mine?.coalfield || null,
    extracted_deadline: deadline
  };
}

export async function getFilteredViolations(query = {}) {
  // Override query to strictly select records where violation_found === 'yes'
  const filterQuery = { ...query, violation_found: 'yes' };
  const res = await getFilteredInspections(filterQuery);

  // Compute violation severity summary breakdown on filtered dataset
  const filteredRecords = res.data;
  const criticalViolations = res.summary.criticalViolations;
  const majorViolations = res.pagination.total ? res.pagination.total : 0;

  // Compute severity summary counts over entire filtered dataset (before pagination)
  const allViolationsRes = await getFilteredInspections({ ...filterQuery, page: 1, pageSize: 99999 });
  const allViolations = allViolationsRes.data || [];

  const totalViolations = allViolations.length;
  const criticalCount = allViolations.filter(i => String(i.violation_severity).toLowerCase() === 'critical').length;
  const majorCount = allViolations.filter(i => String(i.violation_severity).toLowerCase() === 'major').length;
  const minorCount = allViolations.filter(i => String(i.violation_severity).toLowerCase() === 'minor').length;

  return {
    summary: {
      totalViolations,
      criticalViolations: criticalCount,
      majorViolations: majorCount,
      minorViolations: minorCount
    },
    pagination: res.pagination,
    data: res.data
  };
}

export async function getFilteredCorrectiveActions(query = {}) {
  // Select violation records where corrective action exists or violation_found === 'yes'
  const filterQuery = { ...query, violation_found: 'yes' };
  const res = await getFilteredInspections(filterQuery);

  // Attach extracted deadline to each item
  const enrichedData = res.data.map(item => ({
    ...item,
    extracted_deadline: extractDeadline(item.corrective_action)
  }));

  return {
    summary: {
      totalCorrectiveActions: res.pagination.total,
      pendingReview: res.summary.pendingReview
    },
    pagination: res.pagination,
    data: enrichedData
  };
}

export async function getMineViolations(mineId) {
  const inspections = await inspectionRepo.filter(i => i.mine_id === mineId && String(i.violation_found).toLowerCase() === 'yes');
  return inspections.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
}

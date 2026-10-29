import {
  grievanceRepo,
  mineRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service logic for Phase 5 Grievances & Observations
 */

export async function getFilteredGrievances(query = {}) {
  const [allGrievances, allMines] = await Promise.all([
    grievanceRepo.getAll(),
    mineRepo.getAll()
  ]);

  // Mine lookup map by mine_id
  const mineMap = new Map();
  for (const m of allMines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // Join mine metadata
  let enriched = allGrievances.map(g => {
    const mine = mineMap.get(g.mine_id) || {};
    return {
      ...g,
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
    filtered = filtered.filter(g => g.state && g.state.toLowerCase() === query.state.toLowerCase());
  }

  if (query.district && query.district !== 'ALL') {
    filtered = filtered.filter(g => g.district && g.district.toLowerCase() === query.district.toLowerCase());
  }

  if (query.mine_id && query.mine_id !== 'ALL') {
    filtered = filtered.filter(g => g.mine_id && g.mine_id.toLowerCase() === query.mine_id.toLowerCase());
  }

  if (query.entry_type && query.entry_type !== 'ALL') {
    filtered = filtered.filter(g => g.entry_type && g.entry_type.toLowerCase() === query.entry_type.toLowerCase());
  }

  if (query.category && query.category !== 'ALL') {
    filtered = filtered.filter(g => g.category && g.category.toLowerCase() === query.category.toLowerCase());
  }

  if (query.priority_flagged_by_ai && query.priority_flagged_by_ai !== 'ALL') {
    filtered = filtered.filter(g => String(g.priority_flagged_by_ai).toLowerCase() === query.priority_flagged_by_ai.toLowerCase());
  }

  if (query.review_status && query.review_status !== 'ALL') {
    filtered = filtered.filter(g => String(g.review_status).toLowerCase() === query.review_status.toLowerCase());
  }

  if (query.sync_status && query.sync_status !== 'ALL') {
    filtered = filtered.filter(g => String(g.sync_status).toLowerCase() === query.sync_status.toLowerCase());
  }

  if (query.from_date) {
    const fromTime = new Date(query.from_date).getTime();
    if (!isNaN(fromTime)) {
      filtered = filtered.filter(g => new Date(g.date_time).getTime() >= fromTime);
    }
  }

  if (query.to_date) {
    const toDateObj = new Date(query.to_date);
    if (query.to_date.length <= 10) {
      toDateObj.setHours(23, 59, 59, 999);
    }
    const toTime = toDateObj.getTime();
    if (!isNaN(toTime)) {
      filtered = filtered.filter(g => new Date(g.date_time).getTime() <= toTime);
    }
  }

  if (query.search) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(g =>
      (g.submission_id && g.submission_id.toLowerCase().includes(q)) ||
      (g.mine_id && g.mine_id.toLowerCase().includes(q)) ||
      (g.mine_name && g.mine_name.toLowerCase().includes(q)) ||
      (g.inspector_name && g.inspector_name.toLowerCase().includes(q)) ||
      (g.inspector_id && g.inspector_id.toLowerCase().includes(q)) ||
      (g.entry_type && g.entry_type.toLowerCase().includes(q)) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      (g.text_content && g.text_content.toLowerCase().includes(q))
    );
  }

  // Summary Metrics calculated ON FILTERED GRIEVANCES DATASET
  const totalEntries = filtered.length;
  const totalGrievances = filtered.filter(g => String(g.entry_type).toLowerCase() === 'grievance').length;
  const totalObservations = filtered.filter(g => String(g.entry_type).toLowerCase() === 'observation').length;
  const aiPriorityFlagged = filtered.filter(g => String(g.priority_flagged_by_ai).toLowerCase() === 'yes').length;
  const pendingReview = filtered.filter(g => String(g.review_status).toLowerCase() === 'pending').length;

  // Server-side Pagination
  const page = parseInt(query.page, 10) || 1;
  const pageSize = parseInt(query.pageSize, 10) || 15;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const pagedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    summary: {
      totalEntries,
      totalGrievances,
      totalObservations,
      aiPriorityFlagged,
      pendingReview
    },
    pagination: {
      page,
      pageSize,
      total: totalEntries,
      totalPages
    },
    data: pagedData
  };
}

export async function getGrievanceBySubmissionId(submissionId) {
  const grievance = await grievanceRepo.getById('submission_id', submissionId);
  if (!grievance) return null;

  const mine = grievance.mine_id ? await mineRepo.getById('mine_id', grievance.mine_id) : null;

  return {
    ...grievance,
    mine_name: mine?.mine_name || null,
    state: mine?.state || null,
    district: mine?.district || null,
    operator: mine?.operator || null,
    coalfield: mine?.coalfield || null
  };
}

export async function getMineGrievances(mineId) {
  const grievances = await grievanceRepo.filter(g => g.mine_id === mineId);
  return grievances.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
}

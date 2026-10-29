import {
  incidentRepo,
  mineRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service logic for Phase 4 Incident Management
 */

export async function getFilteredIncidents(query = {}) {
  const [allIncidents, allMines] = await Promise.all([
    incidentRepo.getAll(),
    mineRepo.getAll()
  ]);

  // Mine lookup map by mine_id
  const mineMap = new Map();
  for (const m of allMines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // Join mine metadata
  let enriched = allIncidents.map(inc => {
    const mine = mineMap.get(inc.mine_id) || {};
    return {
      ...inc,
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
    filtered = filtered.filter(i => i.state && i.state.toLowerCase() === query.state.toLowerCase());
  }

  if (query.district && query.district !== 'ALL') {
    filtered = filtered.filter(i => i.district && i.district.toLowerCase() === query.district.toLowerCase());
  }

  if (query.mine_id && query.mine_id !== 'ALL') {
    filtered = filtered.filter(i => i.mine_id && i.mine_id.toLowerCase() === query.mine_id.toLowerCase());
  }

  if (query.incident_type && query.incident_type !== 'ALL') {
    filtered = filtered.filter(i => i.incident_type && i.incident_type.toLowerCase() === query.incident_type.toLowerCase());
  }

  if (query.severity && query.severity !== 'ALL') {
    filtered = filtered.filter(i => String(i.severity).toLowerCase() === query.severity.toLowerCase());
  }

  if (query.review_status && query.review_status !== 'ALL') {
    filtered = filtered.filter(i => String(i.review_status).toLowerCase() === query.review_status.toLowerCase());
  }

  if (query.notify_authority_immediately && query.notify_authority_immediately !== 'ALL') {
    filtered = filtered.filter(i => String(i.notify_authority_immediately).toLowerCase() === query.notify_authority_immediately.toLowerCase());
  }

  if (query.from_date) {
    const fromTime = new Date(query.from_date).getTime();
    if (!isNaN(fromTime)) {
      filtered = filtered.filter(i => new Date(i.date_time).getTime() >= fromTime);
    }
  }

  if (query.to_date) {
    const toDateObj = new Date(query.to_date);
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
      (i.inspector_id && i.inspector_id.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  }

  // Summary Metrics calculated ON FILTERED DATASET
  const totalIncidents = filtered.length;
  const criticalIncidents = filtered.filter(i => String(i.severity).toLowerCase() === 'critical').length;
  const majorIncidents = filtered.filter(i => String(i.severity).toLowerCase() === 'major').length;
  const fatalIncidents = filtered.filter(i => String(i.severity).toLowerCase() === 'fatal').length;

  // Server-side Pagination — only apply when explicitly requested (e.g. directory page)
  let pagedData = filtered;
  let page = 1;
  let pageSize = totalIncidents;
  let totalPages = 1;

  if (query.page || query.pageSize || query.limit) {
    page = parseInt(query.page, 10) || 1;
    pageSize = parseInt(query.pageSize || query.limit, 10) || 15;
    totalPages = Math.ceil(totalIncidents / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    pagedData = filtered.slice(startIndex, startIndex + pageSize);
  }

  return {
    summary: {
      totalIncidents,
      criticalIncidents,
      majorIncidents,
      fatalIncidents
    },
    pagination: {
      page,
      pageSize,
      total: totalIncidents,
      totalPages
    },
    data: pagedData
  };
}

export async function getIncidentBySubmissionId(submissionId) {
  const incident = await incidentRepo.getById('submission_id', submissionId);
  if (!incident) return null;

  const mine = incident.mine_id ? await mineRepo.getById('mine_id', incident.mine_id) : null;

  return {
    ...incident,
    mine_name: mine?.mine_name || null,
    state: mine?.state || null,
    district: mine?.district || null,
    operator: mine?.operator || null,
    coalfield: mine?.coalfield || null
  };
}

export async function getMineIncidents(mineId) {
  const incidents = await incidentRepo.filter(i => i.mine_id === mineId);
  return incidents.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
}

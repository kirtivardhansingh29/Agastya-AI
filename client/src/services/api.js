const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Overview and National Telemetry API client
 */
export async function getOverviewSummary(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'ALL') params.append('state', filters.state);
  if (filters.district && filters.district !== 'ALL') params.append('district', filters.district);
  if (filters.scope && filters.scope !== 'ALL') params.append('scope', filters.scope);
  if (filters.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);

  const query = params.toString() ? `?${params.toString()}` : '';
  const url = `${API_BASE_URL}/overview/summary${query}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Regulatory API Error (${res.status}): ${res.statusText}`);
  }
  const result = await res.json();
  return result.data;
}

export async function getRecentIncidents(filter = 'all') {
  const url = `${API_BASE_URL}/overview/incidents?filter=${encodeURIComponent(filter)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Incident Service Error (${res.status}): ${res.statusText}`);
  }
  const result = await res.json();
  return result.data;
}

export async function triggerTelemetrySync() {
  const res = await fetch(`${API_BASE_URL}/overview/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Sync trigger failed (${res.status})`);
  }
  const result = await res.json();
  return result.data || result;
}

/**
 * Phase 2 - Mine Monitoring & Mine Detail API Client Functions
 */
export async function getMines(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'ALL') params.append('state', filters.state);
  if (filters.district && filters.district !== 'ALL') params.append('district', filters.district);
  if (filters.operator && filters.operator !== 'ALL') params.append('operator', filters.operator);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.risk_level && filters.risk_level !== 'ALL') params.append('risk_level', filters.risk_level);
  if (filters.search) params.append('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/mines${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mines (${res.status})`);
  }
  return await res.json();
}

export async function getMineMapData(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'ALL') params.append('state', filters.state);
  if (filters.district && filters.district !== 'ALL') params.append('district', filters.district);
  if (filters.operator && filters.operator !== 'ALL') params.append('operator', filters.operator);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.risk_level && filters.risk_level !== 'ALL') params.append('risk_level', filters.risk_level);
  if (filters.search) params.append('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/mines/map${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine map markers (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getHighestAttentionMines(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'ALL') params.append('state', filters.state);
  if (filters.district && filters.district !== 'ALL') params.append('district', filters.district);
  if (filters.asset && filters.asset !== 'ALL') params.append('asset', filters.asset);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/mines/highest-attention${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch highest attention mines (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getMine(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Mine not found (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getMineSummary(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/summary`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine summary (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getMineInspections(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/inspections`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine inspections (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getMineIncidents(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/incidents`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine incidents (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

/**
 * Phase 3 - Inspection & Compliance Management API Client Functions
 */
export async function getInspections(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/inspections${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch inspections (${res.status})`);
  }
  return await res.json();
}

export async function getInspectionDetail(submissionId) {
  const res = await fetch(`${API_BASE_URL}/inspections/${encodeURIComponent(submissionId)}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Inspection not found (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getViolations(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/violations${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch safety violations (${res.status})`);
  }
  return await res.json();
}

export async function getCorrectiveActions(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/corrective-actions${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch corrective actions (${res.status})`);
  }
  return await res.json();
}

export async function getMineViolations(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/violations`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine violations (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

/**
 * Phase 4 - Incident Management & Attendance Monitoring API Functions
 */
export async function getIncidents(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/incidents${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch incident records (${res.status})`);
  }
  return await res.json();
}

export async function getIncidentDetail(submissionId) {
  const res = await fetch(`${API_BASE_URL}/incidents/${encodeURIComponent(submissionId)}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Incident record not found (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getAttendance(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/attendance${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch attendance records (${res.status})`);
  }
  return await res.json();
}

export async function getMineAttendance(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/attendance`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine attendance (${res.status})`);
  }
  return await res.json();
}

/**
 * Phase 5 - Contractors & Documents + Grievances & Observations API Functions
 */
export async function getContractors(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/contractors${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch contractor records (${res.status})`);
  }
  return await res.json();
}

export async function getContractorDetail(contractorId) {
  const res = await fetch(`${API_BASE_URL}/contractors/${encodeURIComponent(contractorId)}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Contractor record not found (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getMineContractors(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/contractors`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine contractors (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getGrievances(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/grievances${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch grievance records (${res.status})`);
  }
  return await res.json();
}

export async function getGrievanceDetail(submissionId) {
  const res = await fetch(`${API_BASE_URL}/grievances/${encodeURIComponent(submissionId)}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Grievance record not found (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getMineGrievances(mineId) {
  const res = await fetch(`${API_BASE_URL}/mines/${encodeURIComponent(mineId)}/grievances`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch mine grievances (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

/**
 * Phase 7 - AI Risk Intelligence API Client Functions
 */
export async function getAIMineAnalysis(mineId) {
  const res = await fetch(`${API_BASE_URL}/ai/mine-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mineId })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `AI Mine Analysis failed (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

/**
 * Phase 8 - Reports & Alerts API Client Functions
 */

/**
 * Arun — Agastya AI conversational assistant.
 * Sends conversation history; server prepends Arun's system prompt and calls Groq.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>} Arun's reply text
 */
export async function chatWithArun(messages) {
  const res = await fetch(`${API_BASE_URL}/arun/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Arun chat failed (${res.status})`);
  }
  const result = await res.json();
  return result.data.reply;
}
export async function getReportsAnalytics(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/reports/analytics${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch report analytics (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function getAlerts(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'ALL' && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/alerts${query}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to fetch operational alerts (${res.status})`);
  }
  const result = await res.json();
  return result.data;
}





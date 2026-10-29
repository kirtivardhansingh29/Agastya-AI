import {
  mineRepo,
  incidentRepo
} from '../repositories/firestoreRepository.js';

export async function getAlerts(filters = {}) {
  const [mines, incidents] = await Promise.all([
    mineRepo.getAll(),
    incidentRepo.getAll()
  ]);

  const mineMap = new Map(mines.map(m => [m.mine_id, m]));

  // 1. Filter ONLY incidents where severity === "critical" (case-insensitive)
  // Excludes "fatal" and all non-incident alert types.
  const criticalIncidents = incidents.filter(inc =>
    inc && inc.severity && String(inc.severity).toLowerCase() === 'critical'
  );

  // 2. Sort descending chronologically by date_time (newest incident first)
  criticalIncidents.sort((a, b) => {
    const timeA = new Date(a.date_time).getTime() || 0;
    const timeB = new Date(b.date_time).getTime() || 0;
    return timeB - timeA;
  });

  // 3. Map to alert objects
  let alerts = criticalIncidents.map(inc => {
    const parentMine = mineMap.get(inc.mine_id);
    const mineName = parentMine ? parentMine.mine_name : inc.mine_id;

    return {
      id: `ALERT-INC-${inc.submission_id}`,
      submission_id: inc.submission_id,
      mine_id: inc.mine_id,
      mine_name: mineName,
      incident_type: inc.incident_type,
      severity: 'critical',
      badge: 'CRITICAL INCIDENT',
      title: 'CRITICAL INCIDENT',
      subtitle: `${inc.submission_id} — ${inc.incident_type ? inc.incident_type.replace(/_/g, ' ').toUpperCase() : 'INCIDENT'}`,
      description: inc.description || 'Critical operational incident reported requiring immediate regulatory review.',
      people_affected: inc.people_affected || 0,
      notify_authority_immediately: inc.notify_authority_immediately || 'no',
      timestamp: inc.date_time,
      entityId: inc.submission_id,
      actionText: 'View Incident',
      linkType: 'incident'
    };
  });

  // 4. Apply optional search filter within qualifying critical incidents
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    alerts = alerts.filter(a =>
      a.submission_id.toLowerCase().includes(q) ||
      a.mine_id.toLowerCase().includes(q) ||
      a.mine_name.toLowerCase().includes(q) ||
      (a.incident_type && a.incident_type.toLowerCase().includes(q)) ||
      a.description.toLowerCase().includes(q)
    );
  }

  return {
    alerts,
    totalCount: alerts.length
  };
}

import {
  mineRepo,
  incidentRepo,
  inspectionRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service to calculate deterministic mine attention ranking
 * Based on supported risk signals from mines.json, incidents.json, inspections.json
 */
export async function getHighestAttentionMines(filters = {}) {
  const [mines, incidents, inspections] = await Promise.all([
    mineRepo.getAll(),
    incidentRepo.getAll(),
    inspectionRepo.getAll()
  ]);

  // Apply filters (State, District, Asset) if supplied
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

  const mineMap = {};
  filteredMines.forEach(m => {
    let score = 0;
    const rLevel = String(m.risk_level || '').toLowerCase();
    if (rLevel === 'critical') score += 40;
    else if (rLevel === 'high') score += 20;
    else if (rLevel === 'warning') score += 10;

    if (m.status === 'suspended') score += 10;
    if (m.gas_breach === true) score += 25;

    mineMap[m.mine_id] = {
      mine_id: m.mine_id,
      mine_name: m.mine_name || m.name || '—',
      state: m.state || '—',
      risk_level: m.risk_level || 'unknown',
      score,
      critical_incidents: 0,
      fatal_incidents: 0,
      major_incidents: 0,
      violations: 0,
      latest_event_date: null,
      headline: null,
      status: null,
      hasEscalatedIncident: false
    };
  });

  // Calculate incident signals
  incidents.forEach(inc => {
    const item = mineMap[inc.mine_id];
    if (!item) return;

    const sev = String(inc.severity || '').toLowerCase();
    const incDate = inc.date_time ? new Date(inc.date_time) : null;
    const affected = Number(inc.people_affected || 0);

    if (sev === 'fatal') {
      item.score += 50;
      item.fatal_incidents += 1;
      if (!item.headline && inc.description) {
        item.headline = inc.description.split('.')[0].trim();
      }
      item.hasEscalatedIncident = true;
      item.status = 'ESCALATED';
    } else if (sev === 'critical') {
      item.score += 30;
      item.critical_incidents += 1;
      if (!item.headline && inc.description) {
        item.headline = inc.description.split('.')[0].trim();
      }
      if (inc.notify_authority_immediately === 'yes') {
        item.hasEscalatedIncident = true;
        item.status = 'ESCALATED';
      } else if (!item.status) {
        item.status = 'UNDER INVESTIGATION';
      }
    } else if (sev === 'major') {
      item.score += 15;
      item.major_incidents += 1;
      if (!item.headline && inc.description) {
        item.headline = inc.description.split('.')[0].trim();
      }
      if (!item.status) {
        item.status = 'UNDER INVESTIGATION';
      }
    }

    if (affected > 0) {
      item.score += (affected * 2);
    }

    if (incDate && (!item.latest_event_date || incDate > new Date(item.latest_event_date))) {
      item.latest_event_date = inc.date_time;
    }
  });

  // Calculate inspection & violation signals
  inspections.forEach(insp => {
    const item = mineMap[insp.mine_id];
    if (!item) return;

    const inspDate = insp.date_time ? new Date(insp.date_time) : null;

    if (insp.violation_found === 'yes') {
      item.violations += 1;
      const vSev = String(insp.violation_severity || '').toLowerCase();
      if (vSev === 'critical') item.score += 25;
      else if (vSev === 'major') item.score += 12;
      else item.score += 5;

      if (!item.headline && insp.violation_description) {
        item.headline = insp.violation_description.split('.')[0].trim();
      }

      if (!item.status && !item.hasEscalatedIncident) {
        item.status = insp.review_status === 'pending' ? 'PENDING REVIEW' : 'REVIEW REQUIRED';
      }
    }

    if (inspDate && (!item.latest_event_date || inspDate > new Date(item.latest_event_date))) {
      item.latest_event_date = insp.date_time;
    }
  });

  // Filter only mines with actual risk/incident/violation signals or non-zero attention score
  const candidateMines = Object.values(mineMap).filter(m =>
    m.score > 0 || m.critical_incidents > 0 || m.fatal_incidents > 0 || m.violations > 0
  );

  // Deterministic sorting: higher attention score first, then newest event date, then mine_id asc
  candidateMines.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const dateA = a.latest_event_date ? new Date(a.latest_event_date).getTime() : 0;
    const dateB = b.latest_event_date ? new Date(b.latest_event_date).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return a.mine_id.localeCompare(b.mine_id);
  });

  const top4 = candidateMines.slice(0, 4).map((m, idx) => {
    const badgeStatus = m.status || (
      m.risk_level === 'critical' ? 'CRITICAL RISK' :
      m.risk_level === 'high' ? 'HIGH RISK' : 'REVIEW REQUIRED'
    );

    return {
      rank: `#0${idx + 1}`,
      mine_id: m.mine_id,
      mine_name: m.mine_name,
      name: m.mine_name, // Backward compatibility
      state: m.state,
      attention_score: m.score,
      risk_level: m.risk_level,
      critical_incidents: m.critical_incidents,
      criticalIssues: m.critical_incidents, // Backward compatibility
      fatal_incidents: m.fatal_incidents,
      violations: m.violations,
      status: badgeStatus,
      badge: badgeStatus, // Backward compatibility
      headline: m.headline || (m.gas_breach ? 'Gas Breach Notice' : 'Attention required'),
      recentHighlight: m.headline || (m.gas_breach ? 'Gas Breach Notice' : 'Attention required'), // Backward compatibility
      latest_event_date: m.latest_event_date,
      badgeType: (m.hasEscalatedIncident || m.risk_level === 'critical' || m.fatal_incidents > 0) ? 'critical' : (m.risk_level === 'high' || m.violations > 0) ? 'warning' : 'neutral'
    };
  });

  return top4;
}

import { mineRepo, inspectionRepo, incidentRepo } from '../repositories/firestoreRepository.js';

/**
 * Service logic for Phase 7 AI Mine Risk Intelligence using an OpenAI-compatible LLM
 */

function calculateDeterministicRiskSignals(mine, inspections, incidents) {
  let score = 0;
  const rLevel = String(mine.risk_level || '').toLowerCase();
  if (rLevel === 'critical') score += 40;
  else if (rLevel === 'high') score += 20;
  else if (rLevel === 'warning') score += 10;

  if (mine.status === 'suspended') score += 10;
  if (mine.gas_breach === true) score += 25;

  let fatalIncidents = 0;
  let criticalIncidents = 0;
  let majorIncidents = 0;
  let totalPeopleAffected = 0;

  incidents.forEach(inc => {
    const sev = String(inc.severity || '').toLowerCase();
    const affected = Number(inc.people_affected || 0);
    totalPeopleAffected += affected;

    if (sev === 'fatal') {
      score += 50;
      fatalIncidents += 1;
    } else if (sev === 'critical') {
      score += 30;
      criticalIncidents += 1;
    } else if (sev === 'major') {
      score += 15;
      majorIncidents += 1;
    }

    if (affected > 0) {
      score += (affected * 2);
    }
  });

  let violationsCount = 0;
  let criticalViolations = 0;
  let majorViolations = 0;
  let minorViolations = 0;
  let pendingReviews = 0;

  inspections.forEach(insp => {
    if (String(insp.review_status).toLowerCase() === 'pending') {
      pendingReviews += 1;
    }

    if (String(insp.violation_found).toLowerCase() === 'yes') {
      violationsCount += 1;
      const vSev = String(insp.violation_severity || '').toLowerCase();
      if (vSev === 'critical') {
        score += 25;
        criticalViolations += 1;
      } else if (vSev === 'major') {
        score += 12;
        majorViolations += 1;
      } else {
        score += 5;
        minorViolations += 1;
      }
    }
  });

  const normalizedScore = Math.min(100, score);

  return {
    mine_id: mine.mine_id,
    mine_name: mine.mine_name,
    state: mine.state,
    district: mine.district,
    operator: mine.operator,
    status: mine.status,
    risk_level: mine.risk_level,
    gas_breach: mine.gas_breach === true,
    methane_level: mine.methane_level || null,
    inspector_in_charge: mine.inspector_in_charge || null,
    attention_score: normalizedScore,
    raw_attention_score: score,
    total_inspections: inspections.length,
    total_violations: violationsCount,
    critical_violations: criticalViolations,
    major_violations: majorViolations,
    minor_violations: minorViolations,
    pending_reviews: pendingReviews,
    total_incidents: incidents.length,
    fatal_incidents: fatalIncidents,
    critical_incidents: criticalIncidents,
    major_incidents: majorIncidents,
    people_affected: totalPeopleAffected
  };
}

export async function analyzeMineRisk(mineId) {
  if (!mineId) {
    throw new Error("mineId parameter is required for AI risk analysis");
  }

  // 1. Fetch target mine details
  const mine = await mineRepo.getById('mine_id', mineId);
  if (!mine) {
    throw new Error(`Mine with ID '${mineId}' not found in Agastya AI registry`);
  }

  // 2. Perform mine-scoped retrieval for inspections & incidents via Phase 6C Hybrid Repositories
  const [inspections, incidents] = await Promise.all([
    inspectionRepo.getByMineId(mineId),
    incidentRepo.getByMineId(mineId)
  ]);

  // 3. Compute deterministic risk signals (ground truth numbers)
  const signals = calculateDeterministicRiskSignals(mine, inspections, incidents);

  // 4. Construct compact structured context for the LLM
  const contextPayload = {
    mine_profile: {
      mine_id: mine.mine_id,
      mine_name: mine.mine_name,
      state: mine.state,
      district: mine.district,
      operator: mine.operator,
      status: mine.status,
      risk_level_classification: mine.risk_level,
      gas_breach_detected: mine.gas_breach === true,
      methane_level: mine.methane_level || 'N/A',
      inspector_in_charge: mine.inspector_in_charge || 'N/A'
    },
    deterministic_risk_signals: signals,
    recent_incidents_sample: incidents.slice(0, 10).map(inc => ({
      submission_id: inc.submission_id,
      date_time: inc.date_time,
      incident_type: inc.incident_type,
      severity: inc.severity,
      people_affected: inc.people_affected || 0,
      description: inc.description || 'No description',
      immediate_action: inc.immediate_action_taken || 'N/A',
      notify_authority_immediately: inc.notify_authority_immediately || 'no'
    })),
    inspections_sample: inspections.slice(0, 10).map(insp => ({
      submission_id: insp.submission_id,
      date_time: insp.date_time,
      inspection_type: insp.inspection_type,
      violation_found: insp.violation_found,
      violation_severity: insp.violation_severity || 'none',
      violation_description: insp.violation_description || 'N/A',
      corrective_action: insp.corrective_action || 'N/A',
      review_status: insp.review_status
    }))
  };

  // 5. Verify SARVAM_API_KEY environment variable
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured on the server environment (.env)");
  }

  // 6. Call the Sarvam API via server-side fetch.
  const chatUrl = process.env.LLM_CHAT_URL || 'https://api.sarvam.ai/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'sarvam-105b';
  const requestBody = {
    model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
        {
          role: 'system',
          content: `You are the Agastya AI Safety Intelligence Engine for Agastya AI, an intelligent mine compliance and evidence tracking platform. Your objective is to provide a rigorous, evidence-based safety and risk analysis for a specific mine based strictly on the provided structured Agastya AI dataset.

CRITICAL INSTRUCTIONS & CONSTRAINTS:
1. Base your analysis STRICTLY on the supplied Agastya AI dataset. NEVER invent incidents, inspections, violations, personnel, dates, or mine specifications.
2. Distinguish empirical evidence from AI interpretation. State clearly when available data is limited or inconclusive.
3. Use the deterministic risk signals provided as ground truth numbers for scores and counts.
4. Frame all recommendations as AI-assisted advisory suggestions for DGMS authority review, not legally binding regulatory orders.
5. You MUST return a strictly valid JSON object matching this schema exactly:
{
  "overall_assessment": "Short 2-3 sentence executive assessment summarizing current risk level and immediate regulatory focus.",
  "risk_explanation": "Detailed paragraph explaining the risk drivers based on the deterministic score and empirical data.",
  "key_risk_factors": ["Bullet point list of primary evidence-backed risk drivers"],
  "incident_analysis": "Summary of incident patterns, severe occurrences, or affected workforce details.",
  "inspection_analysis": "Summary of compliance violations, severity breakdown, and outstanding corrective actions.",
  "notable_patterns": ["List of operational or environmental patterns identified from evidence"],
  "recommendations": ["Prioritized advisory actions recommended for DGMS inspectorate review"],
  "data_limitations": ["Honest notes on data coverage, sampling, or missing telemetry fields"]
}`
        },
        {
          role: 'user',
          content: `Analyze mine safety telemetry and compliance records for mine ID '${mineId}':\n\n${JSON.stringify(contextPayload, null, 2)}`
        }
      ]
  };
  let llmResponse = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!llmResponse.ok) {
    const errorText = await llmResponse.text();
    const responseFormatRejected = llmResponse.status === 400 &&
      /response[_ ]?format|json[_ ]?object/i.test(errorText);
    if (!responseFormatRejected) {
      console.error(`[Sarvam API Error] HTTP ${llmResponse.status}: ${errorText}`);
      throw new Error(`Sarvam AI service error (HTTP ${llmResponse.status}): ${errorText}`);
    }

    const { response_format, ...fallbackBody } = requestBody;
    llmResponse = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(fallbackBody)
    });
  }

  if (!llmResponse.ok) {
    const errorText = await llmResponse.text();
    console.error(`[Sarvam API Error] HTTP ${llmResponse.status}: ${errorText}`);
    throw new Error(`Sarvam AI service error (HTTP ${llmResponse.status}): ${errorText}`);
  }

  const rawJson = await llmResponse.json();
  const contentString = rawJson?.choices?.[0]?.message?.content;

  if (!contentString) {
    throw new Error("Sarvam AI service returned an empty completion response");
  }

  let parsedAnalysis;
  try {
    parsedAnalysis = JSON.parse(contentString);
  } catch (parseErr) {
    console.error("Failed to parse Sarvam response JSON:", contentString);
    throw new Error("Sarvam AI service returned malformed JSON output");
  }

  // 7. Validate & sanitize required AI response fields
  const sanitizedAnalysis = {
    overall_assessment: parsedAnalysis.overall_assessment || "Overall risk assessment generated based on Agastya AI telemetry.",
    risk_explanation: parsedAnalysis.risk_explanation || "Detailed analysis derived from empirical mine records.",
    key_risk_factors: Array.isArray(parsedAnalysis.key_risk_factors) ? parsedAnalysis.key_risk_factors : [],
    incident_analysis: parsedAnalysis.incident_analysis || "No specific incident analysis reported.",
    inspection_analysis: parsedAnalysis.inspection_analysis || "No specific inspection analysis reported.",
    notable_patterns: Array.isArray(parsedAnalysis.notable_patterns) ? parsedAnalysis.notable_patterns : [],
    recommendations: Array.isArray(parsedAnalysis.recommendations) ? parsedAnalysis.recommendations : [],
    data_limitations: Array.isArray(parsedAnalysis.data_limitations) ? parsedAnalysis.data_limitations : []
  };

  return {
    mine: {
      mine_id: mine.mine_id,
      mine_name: mine.mine_name,
      state: mine.state,
      district: mine.district,
      operator: mine.operator,
      status: mine.status,
      risk_level: mine.risk_level,
      gas_breach: mine.gas_breach === true,
      methane_level: mine.methane_level || null,
      inspector_in_charge: mine.inspector_in_charge || null
    },
    deterministic_signals: signals,
    analysis: sanitizedAnalysis
  };
}

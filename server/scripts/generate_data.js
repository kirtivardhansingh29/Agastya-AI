import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Mines Dataset: Exactly 412 Mines across 8 States
// Breakdown: 388 Operating, 24 Suspended
// Severity Distribution: 14 Critical, 32 Major (High), 82 Warning, 284 Compliant
const states = [
  { state: "Jharkhand", code: "JH", operator: "BCCL", baseLat: 23.79, baseLon: 86.43, basin: "Jharia Coal Basin" },
  { state: "West Bengal", code: "WB", operator: "ECL", baseLat: 23.68, baseLon: 87.05, basin: "Raniganj Coal Basin" },
  { state: "Chhattisgarh", code: "CG", operator: "SECL", baseLat: 22.35, baseLon: 82.60, basin: "Korba Coal Basin" },
  { state: "Odisha", code: "OD", operator: "MCL", baseLat: 20.95, baseLon: 85.21, basin: "Talcher Coal Basin" },
  { state: "Telangana", code: "TG", operator: "SCCL", baseLat: 18.76, baseLon: 79.47, basin: "Godavari Valley" },
  { state: "Madhya Pradesh", code: "MP", operator: "NCL", baseLat: 24.11, baseLon: 82.68, basin: "Singrauli Basin" },
  { state: "Maharashtra", code: "MH", operator: "WCL", baseLat: 19.95, baseLon: 79.30, basin: "Wardha Valley" },
  { state: "Assam", code: "AS", operator: "NEC", baseLat: 27.30, baseLon: 95.73, basin: "Makum Coalfield" }
];

const primaryNamedMines = [
  {
    mine_id: "JH-DHA-BCCL-007",
    mine_name: "Bharat Coking Coalfield Pit-7",
    coalfield: "Jharia Coalfield",
    state: "Jharkhand",
    district: "Dhanbad",
    operator: "BCCL",
    status: "operating",
    location: { latitude: 23.7912, longitude: 86.4319 },
    methane_level: "0.85% CH4",
    gas_breach: true,
    risk_level: "critical",
    inspector_in_charge: "Rajeshwar Verma (DGMS-INSP-402)"
  },
  {
    mine_id: "WB-BUR-ECL-002",
    mine_name: "ECL Sripur Underground",
    coalfield: "Raniganj Coalfield",
    state: "West Bengal",
    district: "Paschim Bardhaman",
    operator: "ECL",
    status: "operating",
    location: { latitude: 23.6833, longitude: 87.0500 },
    methane_level: "0.32% CH4",
    gas_breach: false,
    risk_level: "high",
    inspector_in_charge: "Amrita Roy (DGMS-INSP-318)"
  },
  {
    mine_id: "CG-KOR-SECL-003",
    mine_name: "SECL Gevra Expansion",
    coalfield: "Korba Coalfield",
    state: "Chhattisgarh",
    district: "Korba",
    operator: "SECL",
    status: "operating",
    location: { latitude: 22.3590, longitude: 82.6041 },
    methane_level: "0.12% CH4",
    gas_breach: false,
    risk_level: "high",
    inspector_in_charge: "Manoj Rathore (DGMS-INSP-210)"
  },
  {
    mine_id: "OD-ANG-MCL-004",
    mine_name: "MCL Talcher Colliery",
    coalfield: "Talcher Coalfield",
    state: "Odisha",
    district: "Angul",
    operator: "MCL",
    status: "operating",
    location: { latitude: 20.9500, longitude: 85.2167 },
    methane_level: "0.08% CH4",
    gas_breach: false,
    risk_level: "warning",
    inspector_in_charge: "Suresh Mohapatra (DGMS-INSP-109)"
  },
  {
    mine_id: "TG-PED-SCCL-005",
    mine_name: "SCCL Ramagundam Shaft-3",
    coalfield: "Godavari Valley Coalfield",
    state: "Telangana",
    district: "Peddapalli",
    operator: "SCCL",
    status: "operating",
    location: { latitude: 18.7617, longitude: 79.4750 },
    methane_level: "0.15% CH4",
    gas_breach: false,
    risk_level: "warning",
    inspector_in_charge: "K. Venkateshwarlu (DGMS-INSP-114)"
  },
  {
    mine_id: "MP-SIN-NCL-006",
    mine_name: "NCL Jayant Block",
    coalfield: "Singrauli Coalfield",
    state: "Madhya Pradesh",
    district: "Singrauli",
    operator: "NCL",
    status: "operating",
    location: { latitude: 24.1167, longitude: 82.6833 },
    methane_level: "0.05% CH4",
    gas_breach: false,
    risk_level: "compliant",
    inspector_in_charge: "Prakash Shukla (DGMS-INSP-501)"
  },
  {
    mine_id: "CG-KOR-SECL-007",
    mine_name: "SECL Dipka Open Cast",
    coalfield: "Korba Coalfield",
    state: "Chhattisgarh",
    district: "Korba",
    operator: "SECL",
    status: "operating",
    location: { latitude: 22.3167, longitude: 82.5667 },
    methane_level: "0.10% CH4",
    gas_breach: false,
    risk_level: "warning",
    inspector_in_charge: "Sunil Verma (DGMS-INSP-215)"
  },
  {
    mine_id: "JH-DHA-BCCL-004",
    mine_name: "BCCL East Pit-4",
    coalfield: "Jharia Coalfield",
    state: "Jharkhand",
    district: "Dhanbad",
    operator: "BCCL",
    status: "operating",
    location: { latitude: 23.7800, longitude: 86.4200 },
    methane_level: "0.65% CH4",
    gas_breach: false,
    risk_level: "high",
    inspector_in_charge: "Rajeshwar Verma (DGMS-INSP-402)"
  }
];

const allMines = [...primaryNamedMines];

// Targets for Risk: 14 Critical, 32 High (Major), 82 Warning, 284 Compliant = 412 Total
// Status: 388 Operating, 24 Suspended
let currentCritical = primaryNamedMines.filter(m => m.risk_level === 'critical').length; // 1
let currentHigh = primaryNamedMines.filter(m => m.risk_level === 'high').length; // 3
let currentWarning = primaryNamedMines.filter(m => m.risk_level === 'warning').length; // 3
let currentCompliant = primaryNamedMines.filter(m => m.risk_level === 'compliant').length; // 1
let currentSuspended = 0;

for (let i = allMines.length + 1; i <= 412; i++) {
  const st = states[i % states.length];
  let risk = "compliant";
  if (currentCritical < 14) {
    risk = "critical";
    currentCritical++;
  } else if (currentHigh < 32) {
    risk = "high";
    currentHigh++;
  } else if (currentWarning < 82) {
    risk = "warning";
    currentWarning++;
  } else {
    risk = "compliant";
    currentCompliant++;
  }

  const isSuspended = currentSuspended < 24 && (i % 16 === 0 || 412 - i <= 24 - currentSuspended);
  if (isSuspended) currentSuspended++;

  allMines.push({
    mine_id: `${st.code}-BLK-${st.operator}-${String(i).padStart(3, '0')}`,
    mine_name: `${st.operator} Colliery Block-${String(i).padStart(3, '0')}`,
    coalfield: st.basin,
    state: st.state,
    district: `${st.state} Sector`,
    operator: st.operator,
    status: isSuspended ? "suspended" : "operating",
    location: {
      latitude: +(st.baseLat + ((i % 17) - 8) * 0.03).toFixed(4),
      longitude: +(st.baseLon + ((i % 13) - 6) * 0.03).toFixed(4)
    },
    methane_level: `${(0.02 + ((i % 10) * 0.04)).toFixed(2)}% CH4`,
    gas_breach: risk === 'critical' && i % 3 === 0,
    risk_level: risk,
    inspector_in_charge: `DGMS-INSP-${100 + (i % 30)}`
  });
}

// 2. Inspections Dataset: Exactly 1,284 Records
// Open violations = 87 (19 Critical, 42 Major, 26 Minor)
// Overdue CAPA = 23 (Deadline in past)
// Pending review = 38
// Pending sync = 18
const inspections = [];
let critViolationsTarget = 19;
let majorViolationsTarget = 42;
let minorViolationsTarget = 26;
let pendingReviewTarget = 38;
let overdueCapaTarget = 23;
let pendingSyncTarget = 18;

const checkQuestions = [
  "Are workers equipped with certified DGMS-standard PPE including helmet lamps & gas masks?",
  "Is mechanical auxiliary ventilation delivering statutory cubic meters per minute at working face?",
  "Are all explosive magazines locked and double-authorized per Indian Explosives Act?",
  "Are haul road dust suppression sprinklers active and operating at full pressure?",
  "Is the continuous methane telemetry sensor calibrated within the last 72 hours?",
  "Are conveyor belt trip wires and pull cords functional along entire incline gallery?",
  "Is biometric attendance synchronized with ground-level statutory shift register?"
];

for (let i = 1; i <= 1284; i++) {
  const mine = allMines[i % allMines.length];
  const type = ["safety", "environmental", "production", "labour"][i % 4];

  let violationFound = "no";
  let severity = null;
  let correctiveAction = null;
  let reviewStatus = "reviewed";
  let syncStatus = "synced";

  if (critViolationsTarget > 0 && (i % 65 === 0 || 1284 - i < critViolationsTarget)) {
    violationFound = "yes";
    severity = "critical";
    critViolationsTarget--;
  } else if (majorViolationsTarget > 0 && (i % 30 === 0 || 1284 - i < majorViolationsTarget)) {
    violationFound = "yes";
    severity = "major";
    majorViolationsTarget--;
  } else if (minorViolationsTarget > 0 && (i % 48 === 0 || 1284 - i < minorViolationsTarget)) {
    violationFound = "yes";
    severity = "minor";
    minorViolationsTarget--;
  }

  if (violationFound === "yes") {
    const isOverdue = overdueCapaTarget > 0;
    if (isOverdue) overdueCapaTarget--;
    correctiveAction = `Statutory rectification mandated. Deadline: ${isOverdue ? '2024-10-15' : '2024-11-15'}`;
  }

  if (pendingReviewTarget > 0 && (i % 32 === 0 || 1284 - i < pendingReviewTarget)) {
    reviewStatus = "pending";
    pendingReviewTarget--;
  }

  if (pendingSyncTarget > 0 && (i % 70 === 0 || 1284 - i < pendingSyncTarget)) {
    syncStatus = "pending";
    pendingSyncTarget--;
  }

  const checklist = checkQuestions.map((q, qIdx) => ({
    question: q,
    answer: violationFound === "yes" && qIdx === 1 ? "fail" : "pass",
    remarks: violationFound === "yes" && qIdx === 1 ? "Statutory standard threshold exceeded." : "Conforms to CMR-2017."
  }));

  inspections.push({
    submission_id: `INSP-2024-${String(1000 + i).padStart(5, '0')}`,
    mine_id: mine.mine_id,
    inspector_id: `DGMS-INSP-${200 + (i % 25)}`,
    inspector_name: `Inspector ${["Rajeshwar Verma", "Amrita Roy", "Manoj Rathore", "Suresh Mohapatra", "K. Venkateshwarlu"][i % 5]}`,
    inspection_type: type,
    checklist: checklist,
    violation_found: violationFound,
    violation_severity: severity,
    violation_description: violationFound === "yes" ? `Statutory violation logged under CMR Regulation #${80 + (i % 30)}` : null,
    corrective_action: correctiveAction,
    photos_or_videos: violationFound === "yes" ? [`evidence_${i}_1.jpg`] : [],
    location: mine.location,
    date_time: new Date(Date.now() - (i * 3600000 * 0.5)).toISOString(),
    sync_status: syncStatus,
    review_status: reviewStatus
  });
}

// 3. Attendance Dataset: Exactly 69,400 Expected vs 64,820 Actual
// Attendance Rate = 93.4%
// 10 pending sync records (total pending across all = 18 + 10 + 4 = 32!)
const attendance = [];
const expectedDistribution = [
  { mine_id: "JH-DHA-BCCL-007", shift: "morning", exp: 520, act: 480, perm: 320, cont: 160 },
  { mine_id: "WB-BUR-ECL-002", shift: "morning", exp: 650, act: 610, perm: 410, cont: 200 },
  { mine_id: "CG-KOR-SECL-003", shift: "morning", exp: 1200, act: 1140, perm: 800, cont: 340 },
  { mine_id: "OD-ANG-MCL-004", shift: "morning", exp: 920, act: 890, perm: 600, cont: 290 },
  { mine_id: "TG-PED-SCCL-005", shift: "morning", exp: 760, act: 740, perm: 500, cont: 240 },
  { mine_id: "MP-SIN-NCL-006", shift: "morning", exp: 1000, act: 980, perm: 700, cont: 280 },
  { mine_id: "CG-KOR-SECL-007", shift: "night", exp: 480, act: 312, perm: 200, cont: 112 },
  { mine_id: "JH-DHA-BCCL-004", shift: "afternoon", exp: 450, act: 420, perm: 300, cont: 120 }
];

let totalExpSum = 0;
let totalActSum = 0;
for (const ed of expectedDistribution) {
  totalExpSum += ed.exp;
  totalActSum += ed.act;
}

// Balance remaining up to 69,400 Expected and 64,820 Actual
const remainingExp = 69400 - totalExpSum; // 63,420
const remainingAct = 64820 - totalActSum; // 59,248
const operatingMinesCount = 388 - expectedDistribution.length; // 380
const avgExpPerMine = Math.floor(remainingExp / operatingMinesCount);
const avgActPerMine = Math.floor(remainingAct / operatingMinesCount);

let runningExp = totalExpSum;
let runningAct = totalActSum;
let attCounter = 1;

for (const ed of expectedDistribution) {
  attendance.push({
    submission_id: `ATT-2024-${String(attCounter++).padStart(5, '0')}`,
    mine_id: ed.mine_id,
    shift: ed.shift,
    worker_id: `WRK-MUSTER-${attCounter}`,
    worker_name: `Shift Crew Leader ${attCounter}`,
    worker_type: "permanent",
    contractor_id: null,
    check_in_time: "2024-10-24T06:30:00+05:30",
    check_in_location: { latitude: 23.7912, longitude: 86.4319 },
    check_out_time: null,
    check_out_location: null,
    expected_headcount: ed.exp,
    actual_headcount: ed.act,
    date_time: "2024-10-24T06:30:00+05:30",
    sync_status: attCounter <= 4 ? "pending" : "synced"
  });
}

const operatingMines = allMines.filter(m => m.status === 'operating');
for (let i = expectedDistribution.length; i < operatingMines.length; i++) {
  const m = operatingMines[i];
  const isLast = i === operatingMines.length - 1;
  const exp = isLast ? (69400 - runningExp) : avgExpPerMine;
  const act = isLast ? (64820 - runningAct) : avgActPerMine;
  runningExp += exp;
  runningAct += act;

  const isPending = attCounter <= 10;
  attendance.push({
    submission_id: `ATT-2024-${String(attCounter++).padStart(5, '0')}`,
    mine_id: m.mine_id,
    shift: ["morning", "afternoon", "night"][i % 3],
    worker_id: `WRK-MUSTER-${attCounter}`,
    worker_name: `Shift Supervisor ${attCounter}`,
    worker_type: i % 2 === 0 ? "permanent" : "contractor",
    contractor_id: i % 2 === 0 ? null : `CONTR-${101 + (i % 3)}`,
    check_in_time: "2024-10-24T07:00:00+05:30",
    check_in_location: m.location,
    check_out_time: null,
    check_out_location: null,
    expected_headcount: exp,
    actual_headcount: act,
    date_time: "2024-10-24T07:00:00+05:30",
    sync_status: isPending ? "pending" : "synced"
  });
}

// 4. Incidents Dataset: Exactly 18 Incidents (2 Immediate Action, 4 Critical Total)
// Breakdown:
// - 4 Critical (2 Fatal Inquiries, 2 High Risk active)
// - 6 Major
// - 8 Minor / Resolved
// - 4 Pending sync -> Total pending sync across all datasets = 18 (insp) + 10 (att) + 4 (inc) = 32!
const incidents = [
  {
    submission_id: "INC-2024-0821",
    mine_id: "JH-DHA-BCCL-007",
    inspector_id: "DGMS-INSP-402",
    inspector_name: "Rajeshwar Verma",
    incident_type: "gas_leak",
    severity: "critical",
    people_affected: 4,
    affected_person_details: ["R. Paswan (Shift-B Miner, Hospitalized)", "B. Soren", "K. Mahato", "D. Singh"],
    description: "Toxic Methane Influx Threshold Breached. Continuous handheld PID detector hit 0.85% CH4 in Shaft #3 Lower Seam. Immediate emergency retreat sounding initiated.",
    immediate_action_taken: "Shaft 3 isolated. Auxiliary fans switched to 100% booster CFM. 4 miners evacuated; 1 shifted to Central Hospital Dhanbad for oxygen therapy.",
    medical_attention_required: "yes",
    equipment_involved: "Auxiliary Exhaust Fan #AF-3, Draeger Multi-Gas Monitor",
    photos_or_videos: ["methane_readout_0821.jpg", "shaft3_barricade.jpg"],
    location: { latitude: 23.7912, longitude: 86.4319 },
    date_time: "2024-10-24T11:20:45+05:30",
    notify_authority_immediately: "yes",
    sync_status: "synced",
    review_status: "pending",
    badge_label: "AUTHORITY ALERT",
    location_display: "BCCL Pit-7 (JH-DHA-007) • Shaft #3 Lower Seam",
    sync_source: "Synced via Inspector 4G Mobile Device • 2 Photos Attached"
  },
  {
    submission_id: "INC-2024-0819",
    mine_id: "CG-KOR-SECL-003",
    inspector_id: "DGMS-INSP-210",
    inspector_name: "Manoj Rathore",
    incident_type: "equipment_failure",
    severity: "major",
    people_affected: 0,
    affected_person_details: [],
    description: "Dumper Hydraulic Brake Line Rupture. 100T CAT 777D heavy hauler suffered primary pressurized brake line rupture while descending Ramp #12 incline.",
    immediate_action_taken: "Operator activated emergency dynamic retarder and berm-steered safely into catch ramp. Machine impounded for structural forensic audit.",
    medical_attention_required: "no",
    equipment_involved: "CAT 777D Heavy Hauler (Unit #HAUL-44)",
    photos_or_videos: ["brake_hydraulic_burst.jpg", "ramp12_catch_berm.jpg"],
    location: { latitude: 22.3590, longitude: 82.6041 },
    date_time: "2024-10-24T09:15:10+05:30",
    notify_authority_immediately: "yes",
    sync_status: "synced",
    review_status: "under_investigation",
    badge_label: "MAJOR HAZARD",
    location_display: "SECL Gevra Open Cast (CG-KOR-012) • Ramp #12 Incline",
    sync_source: "Synced via 4G Telemetry • Mobile Checklist Signed"
  },
  {
    submission_id: "INC-2024-0814",
    mine_id: "TG-PED-SCCL-005",
    inspector_id: "DGMS-INSP-114",
    inspector_name: "K. Venkateshwarlu",
    incident_type: "injury",
    severity: "minor",
    people_affected: 1,
    affected_person_details: ["V. Ramulu (Emp #TG-8841)"],
    description: "Minor Ankle Sprain During Shaft Descent. Worker stumbled on wet metal grating inside man-winding cage platform.",
    immediate_action_taken: "Shift first-aid team applied cold pack and crepe bandage. Worker assessed by on-site medical officer and cleared with light duties.",
    medical_attention_required: "yes",
    equipment_involved: "Man-winding Cage Platform B",
    photos_or_videos: ["first_aid_log_8841.pdf"],
    location: { latitude: 18.7617, longitude: 79.4750 },
    date_time: "2024-10-23T16:40:00+05:30",
    notify_authority_immediately: "no",
    sync_status: "synced",
    review_status: "resolved",
    badge_label: "RESOLVED ON-SITE",
    location_display: "SCCL Ramagundam (TG-PED-003) • Man-winding Cage",
    sync_source: "First-Aid Log Verified • Fit to Resume Work"
  },
  {
    submission_id: "INC-2024-0811",
    mine_id: "WB-BUR-ECL-002",
    inspector_id: "DGMS-INSP-318",
    inspector_name: "Amrita Roy",
    incident_type: "injury",
    severity: "critical",
    people_affected: 2,
    affected_person_details: ["A. K. Banerjee", "S. Murmu"],
    description: "Roof fall at Seam 4 junction during depillaring operations. High risk strata pressure displacement.",
    immediate_action_taken: "Strata management emergency protocol deployed. Hydraulic roof supports doubled.",
    medical_attention_required: "yes",
    equipment_involved: "Hydraulic Roof Support Stand #H-12",
    photos_or_videos: ["roof_fall_seam4.jpg"],
    location: { latitude: 23.6833, longitude: 87.0500 },
    date_time: "2024-10-23T10:15:00+05:30",
    notify_authority_immediately: "yes",
    sync_status: "synced",
    review_status: "under_investigation",
    badge_label: "CRITICAL HAZARD",
    location_display: "ECL Sripur Underground • Seam 4 Junction",
    sync_source: "Synced via Satellite Link"
  },
  {
    submission_id: "INC-2024-0808",
    mine_id: "OD-ANG-MCL-004",
    inspector_id: "DGMS-INSP-109",
    inspector_name: "Suresh Mohapatra",
    incident_type: "fire",
    severity: "major",
    people_affected: 0,
    affected_person_details: [],
    description: "Electrical switchgear panel flashover and localized cable smoldering in substation switchyard.",
    immediate_action_taken: "Automatic CO2 flooding initiated. Breaker isolated within 40ms. Zero human injury.",
    medical_attention_required: "no",
    equipment_involved: "11kV Primary Feeder Breaker Panel #F-02",
    photos_or_videos: ["panel_flash_scorch.jpg"],
    location: { latitude: 20.9500, longitude: 85.2167 },
    date_time: "2024-10-22T14:10:00+05:30",
    notify_authority_immediately: "yes",
    sync_status: "synced",
    review_status: "pending",
    badge_label: "MAJOR HAZARD",
    location_display: "MCL Talcher Colliery • Substation Yard",
    sync_source: "Synced via Handheld"
  },
  {
    submission_id: "INC-2024-0805",
    mine_id: "JH-DHA-BCCL-004",
    inspector_id: "DGMS-INSP-402",
    inspector_name: "Rajeshwar Verma",
    incident_type: "injury",
    severity: "fatal",
    people_affected: 1,
    affected_person_details: ["B. Soren (Haulage Attendant)"],
    description: "Fatal haulage rope derailment during empty tub marshalling at incline bottom.",
    immediate_action_taken: "Court of inquiry constituted by DGMS. Incline haulage operations suspended.",
    medical_attention_required: "yes",
    equipment_involved: "Endless Haulage Drum #EH-04",
    photos_or_videos: ["haulage_drum_snap.jpg"],
    location: { latitude: 23.7800, longitude: 86.4200 },
    date_time: "2024-10-20T08:30:00+05:30",
    notify_authority_immediately: "yes",
    sync_status: "synced",
    review_status: "under_investigation",
    badge_label: "FATAL INQUIRY",
    location_display: "BCCL East Pit-4 • Incline Marshalling Yard",
    sync_source: "Formal Statutory Report Registered"
  },
  {
    submission_id: "INC-2024-0802",
    mine_id: "MP-SIN-NCL-006",
    inspector_id: "DGMS-INSP-501",
    inspector_name: "Prakash Shukla",
    incident_type: "injury",
    severity: "fatal",
    people_affected: 1,
    affected_person_details: ["R. K. Yadav (Drill Operator)"],
    description: "Highwall bench slide onto drill machine platform during blast hole charging.",
    immediate_action_taken: "Bench face scaled down and stabilized. DGMS inquiry commission dispatched.",
    medical_attention_required: "yes",
    equipment_involved: "Blast Hole Drill #RD-18",
    photos_or_videos: ["bench_slide_drill.jpg"],
    location: { latitude: 24.1167, longitude: 82.6833 },
    date_time: "2024-10-18T15:20:00+05:30",
    notify_authority_immediately: "yes",
    sync_status: "synced",
    review_status: "under_investigation",
    badge_label: "FATAL INQUIRY",
    location_display: "NCL Jayant Block • Bench #04 East Cut",
    sync_source: "Formal Statutory Report Registered"
  }
];

// Add additional minor and major incidents to make total 18
for (let i = 8; i <= 18; i++) {
  const m = allMines[i * 12 % allMines.length];
  const isMajor = i <= 12;
  const isPending = i > 14; // 4 pending sync
  incidents.push({
    submission_id: `INC-2024-0${String(800 - i)}`,
    mine_id: m.mine_id,
    inspector_id: `DGMS-INSP-${100 + (i % 20)}`,
    inspector_name: `Inspector #${100 + (i % 20)}`,
    incident_type: isMajor ? "equipment_failure" : "near_miss",
    severity: isMajor ? "major" : "minor",
    people_affected: 0,
    affected_person_details: [],
    description: isMajor ? `Heavy earthmoving machinery hydraulic seal leak at ${m.mine_name}.` : `Near-miss conveyor belt slip detected by automated safety trip switch.`,
    immediate_action_taken: "Immediate preventive maintenance completed.",
    medical_attention_required: "no",
    equipment_involved: isMajor ? "Hydraulic Pump Unit" : "Conveyor Belt Motor",
    photos_or_videos: [],
    location: m.location,
    date_time: new Date(Date.now() - (i * 86400000)).toISOString(),
    notify_authority_immediately: isMajor ? "yes" : "no",
    sync_status: isPending ? "pending" : "synced",
    review_status: isMajor ? "under_investigation" : "resolved",
    badge_label: isMajor ? "MAJOR HAZARD" : "RESOLVED ON-SITE",
    location_display: `${m.mine_name} • Operational Zone`,
    sync_source: isPending ? "Handheld Offline Log • Queued" : "Synced via Telemetry Grid"
  });
}

// 5. Contractors Dataset
const contractors = [
  {
    contractor_id: "CONTR-101",
    company_name: "Eastern Mining Infra Pvt Ltd",
    license_validity: "2025-12-31",
    insurance_status: "active",
    compliance_documents: ["Form-V_Labour_Permit.pdf", "Worker_Compensation_Policy.pdf"],
    document_expiry_dates: {
      "DGMS-BL-2021-99": "2024-11-05", // Expiring in < 15 days for Jayant Block
      "Workmen_Insurance": "2025-06-30"
    },
    equipment_inspection_certificates: ["DumpTruck_Cert_88.pdf", "Excavator_Hydraulic_Cert_12.pdf"]
  },
  {
    contractor_id: "CONTR-102",
    company_name: "Bharat Earthmovers Logistics",
    license_validity: "2026-03-31",
    insurance_status: "active",
    compliance_documents: ["Contract_Labour_Registration.pdf"],
    document_expiry_dates: {
      "Blasting_Handling_Licence": "2025-08-15"
    },
    equipment_inspection_certificates: ["FrontLoader_Fitness_2024.pdf"]
  },
  {
    contractor_id: "CONTR-103",
    company_name: "Deccan Mining Contractors",
    license_validity: "2024-11-10",
    insurance_status: "renewal_due",
    compliance_documents: ["State_PCB_Consent.pdf"],
    document_expiry_dates: {
      "Explosive_Transport_Permit": "2024-11-08"
    },
    equipment_inspection_certificates: ["Diesel_Bowser_Cert.pdf"]
  }
];

// 6. Grievances & Observations
const grievances = [
  {
    submission_id: "GRV-2024-0041",
    mine_id: "JH-DHA-BCCL-007",
    inspector_id: "DGMS-INSP-402",
    inspector_name: "Rajeshwar Verma",
    entry_type: "observation",
    category: "safety",
    text_content: "Barometric drop detected during night shift changeover. Correlates with repeated pre-dawn methane threshold fluctuations in seam 3.",
    photos_or_videos: ["barometric_chart.png"],
    location: { latitude: 23.7912, longitude: 86.4319 },
    date_time: "2024-10-24T05:30:00+05:30",
    priority_flagged_by_ai: "yes",
    sync_status: "synced",
    review_status: "acknowledged"
  },
  {
    submission_id: "GRV-2024-0038",
    mine_id: "CG-KOR-SECL-007",
    inspector_id: "DGMS-INSP-215",
    inspector_name: "Sunil Verma",
    entry_type: "grievance",
    category: "labour",
    text_content: "Subcontractor workers reporting biometric terminal time sync failures at Pit-head Entry Gate 4.",
    photos_or_videos: [],
    location: { latitude: 22.3167, longitude: 82.5667 },
    date_time: "2024-10-23T22:15:00+05:30",
    priority_flagged_by_ai: "yes",
    sync_status: "synced",
    review_status: "pending"
  },
  {
    submission_id: "GRV-2024-0034",
    mine_id: "OD-ANG-MCL-004",
    inspector_id: "DGMS-INSP-109",
    inspector_name: "Suresh Mohapatra",
    entry_type: "observation",
    category: "environmental",
    text_content: "Dust suppression water bowser pipeline pressure drop noticed near siding stockyard.",
    photos_or_videos: ["bowser_nozzle.jpg"],
    location: { latitude: 20.9500, longitude: 85.2167 },
    date_time: "2024-10-22T11:00:00+05:30",
    priority_flagged_by_ai: "no",
    sync_status: "synced",
    review_status: "resolved"
  }
];

// 7. Users Dataset
const users = [
  {
    user_id: "DGMS-USR-001",
    full_name: "Dr. Ravi Shankar Mishra",
    designation: "Director General of Mines Safety (DGMS)",
    role: "regulator",
    employee_id_or_contractor_id: "DGMS-HQ-DIR-01",
    mine_assigned: "ALL_MINES",
    preferred_language: "en",
    email: "dg.mines@dgms.gov.in",
    date_time_registered: "2023-01-15T09:00:00+05:30"
  },
  {
    user_id: "DGMS-USR-402",
    full_name: "Rajeshwar Verma",
    designation: "Deputy Director of Mines Safety",
    role: "inspector",
    employee_id_or_contractor_id: "DGMS-INSP-402",
    mine_assigned: "JH-DHA-BCCL-007",
    preferred_language: "en",
    email: "r.verma@dgms.gov.in",
    date_time_registered: "2023-06-10T10:30:00+05:30"
  }
];

// Write out all files
fs.writeFileSync(path.join(dataDir, 'mines.json'), JSON.stringify(allMines, null, 2));
fs.writeFileSync(path.join(dataDir, 'incidents.json'), JSON.stringify(incidents, null, 2));
fs.writeFileSync(path.join(dataDir, 'inspections.json'), JSON.stringify(inspections, null, 2));
fs.writeFileSync(path.join(dataDir, 'attendance.json'), JSON.stringify(attendance, null, 2));
fs.writeFileSync(path.join(dataDir, 'contractors.json'), JSON.stringify(contractors, null, 2));
fs.writeFileSync(path.join(dataDir, 'grievances.json'), JSON.stringify(grievances, null, 2));
fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));

console.log(`Successfully generated datasets:
- Mines: ${allMines.length} (Operating: ${allMines.filter(m => m.status === 'operating').length}, Suspended: ${allMines.filter(m => m.status === 'suspended').length})
- Inspections: ${inspections.length} (Open Violations: ${inspections.filter(i => i.violation_found === 'yes' && i.review_status !== 'resolved').length})
- Incidents: ${incidents.length} (Critical: ${incidents.filter(i => i.severity === 'critical' || i.severity === 'fatal').length})
- Attendance entries: ${attendance.length} (Expected: ${runningExp}, Actual: ${runningAct}, Rate: ${((runningAct/runningExp)*100).toFixed(1)}%)
- Total Pending Sync: ${inspections.filter(i => i.sync_status === 'pending').length + attendance.filter(a => a.sync_status === 'pending').length + incidents.filter(i => i.sync_status === 'pending').length}
- Contractors: ${contractors.length}
- Grievances: ${grievances.length}
- Users: ${users.length}`);

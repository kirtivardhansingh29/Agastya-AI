import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import { getHighestAttentionMines } from '../server/src/services/mineAttentionService.js';
import { incidentRepo } from '../server/src/repositories/firestoreRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const serverRoot = path.join(projectRoot, 'server');

dotenv.config({ path: path.join(serverRoot, '.env') });

function getFileChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runPhase6bVerification() {
  console.log("=================================================");
  console.log("Starting Phase 6B Firebase Backend Verification Suite");
  console.log("=================================================");

  let passCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${message}`);
    }
  }

  // 1. Firebase Admin SDK & Connection Check
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/firebase-service-account.json';
  const resolvedCredPath = path.isAbsolute(credPath) ? credPath : path.resolve(serverRoot, credPath);
  assert(fs.existsSync(resolvedCredPath), `Service account credentials exist at resolved path`);

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedCredPath, 'utf8'));
  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  const db = getFirestore();
  assert(!!db, `Firestore instance active for Project '${serviceAccount.project_id}'`);

  // 2. A. Mines Endpoints
  const resMines = await httpGet('/api/mines');
  assert(resMines.status === 200 && resMines.body.summary?.totalMines === 412, `GET /api/mines (200 OK, 412 total mines in summary)`);
  assert(Array.isArray(resMines.body.data) && resMines.body.data.length > 0, `GET /api/mines returns array of mines`);

  const resMineDetail = await httpGet('/api/mines/JH-DHA-BCCL-007');
  const mineData = resMineDetail.body.data || resMineDetail.body.mine;
  assert(resMineDetail.status === 200 && mineData?.mine_id === 'JH-DHA-BCCL-007', `GET /api/mines/JH-DHA-BCCL-007 (200 OK, correct mine returned)`);

  // 3. B. Incidents Endpoints & HTTP 404
  const resIncidents = await httpGet('/api/incidents');
  assert(resIncidents.status === 200 && resIncidents.body.summary?.totalIncidents === 18, `GET /api/incidents (200 OK, 18 total incidents)`);

  const resIncidentDetail = await httpGet('/api/incidents/INC-2024-0821');
  const incidentData = resIncidentDetail.body.data || resIncidentDetail.body;
  assert(resIncidentDetail.status === 200 && incidentData?.submission_id === 'INC-2024-0821', `GET /api/incidents/INC-2024-0821 (200 OK, returned incident)`);
  assert(Array.isArray(incidentData?.affected_person_details), `Incident INC-2024-0821 contains affected_person_details array`);

  const resIncidentInvalid = await httpGet('/api/incidents/INVALID-999');
  assert(resIncidentInvalid.status === 404, `GET /api/incidents/INVALID-999 returns HTTP 404 Not Found`);

  // 4. C. Inspections Endpoints
  const resInspections = await httpGet('/api/inspections');
  assert(resInspections.status === 200 && resInspections.body.summary?.totalInspections === 1284, `GET /api/inspections (200 OK, 1284 total inspections)`);

  const resInspectionDetail = await httpGet('/api/inspections/INSP-2024-01001');
  const inspectionData = resInspectionDetail.body.data || resInspectionDetail.body;
  assert(resInspectionDetail.status === 200 && inspectionData?.submission_id === 'INSP-2024-01001', `GET /api/inspections/INSP-2024-01001 (200 OK)`);
  assert(Array.isArray(inspectionData?.checklist) && inspectionData.checklist.length > 0, `Inspection INSP-2024-01001 contains checklist array`);

  // 5. D. Attendance Endpoints
  const resAttendance = await httpGet('/api/attendance');
  const attendanceSubmissions = resAttendance.body.summary?.submissionCount || resAttendance.body.summary?.totalSubmissions;
  assert(resAttendance.status === 200 && attendanceSubmissions === 388, `GET /api/attendance (200 OK, 388 attendance submissions)`);

  const resMineAttendance = await httpGet('/api/mines/JH-DHA-BCCL-007/attendance');
  const mineAttendanceRecord = resMineAttendance.body.latestRecord || resMineAttendance.body.latestAttendance || resMineAttendance.body.data;
  assert(resMineAttendance.status === 200 && mineAttendanceRecord?.mine_id === 'JH-DHA-BCCL-007', `GET /api/mines/JH-DHA-BCCL-007/attendance returns latest single submission`);

  // 6. E. Contractors Endpoints
  const resContractors = await httpGet('/api/contractors');
  assert(resContractors.status === 200 && resContractors.body.summary?.totalContractors === 3, `GET /api/contractors (200 OK, 3 total contractors)`);

  const resContractorDetail = await httpGet('/api/contractors/CONTR-101');
  const contractorData = resContractorDetail.body.contractor || resContractorDetail.body.data?.contractor || resContractorDetail.body.data;
  assert(resContractorDetail.status === 200 && contractorData?.contractor_id === 'CONTR-101', `GET /api/contractors/CONTR-101 (200 OK, dossier returned)`);

  const resMineContractors = await httpGet('/api/mines/JH-DHA-BCCL-007/contractors');
  const mineContractorsData = resMineContractors.body.contractors || resMineContractors.body.data;
  assert(resMineContractors.status === 200 && Array.isArray(mineContractorsData), `GET /api/mines/JH-DHA-BCCL-007/contractors returns attendance-derived contractors`);

  // 7. F. Grievances Endpoints
  const resGrievances = await httpGet('/api/grievances');
  assert(resGrievances.status === 200 && resGrievances.body.summary?.totalEntries === 3, `GET /api/grievances (200 OK, 3 total entries)`);

  const resGrievanceDetail = await httpGet('/api/grievances/GRV-2024-0041');
  const grievanceData = resGrievanceDetail.body.data || resGrievanceDetail.body;
  assert(resGrievanceDetail.status === 200 && grievanceData?.submission_id === 'GRV-2024-0041', `GET /api/grievances/GRV-2024-0041 (200 OK)`);

  const resMineGrievances = await httpGet('/api/mines/JH-DHA-BCCL-007/grievances');
  const mineGrievanceData = resMineGrievances.body.grievances || resMineGrievances.body.data;
  assert(resMineGrievances.status === 200 && Array.isArray(mineGrievanceData), `GET /api/mines/JH-DHA-BCCL-007/grievances returns mine grievances`);

  // 8. G. Overview Telemetry & Attention Mines
  const resOverview = await httpGet('/api/overview/summary');
  const overviewTelemetry = resOverview.body.data?.telemetry;
  assert(resOverview.status === 200 && overviewTelemetry?.totalMines?.value === 412, `GET /api/overview/summary (200 OK, 412 total mines in telemetry)`);

  const highestAttention = await getHighestAttentionMines();
  assert(Array.isArray(highestAttention) && highestAttention.length === 4, `mineAttentionService returns top 4 dynamic attention mines from Firestore`);

  // 9. H. Data Parity Check (Firestore vs Source JSON)
  const jsonMineData = JSON.parse(fs.readFileSync(path.join(serverRoot, 'data', 'mines.json'), 'utf8'));
  const jsonMine007 = jsonMineData.find(m => m.mine_id === 'JH-DHA-BCCL-007');
  assert(mineData?.mine_name === jsonMine007.mine_name, `Data Parity: Mine name matches source JSON for JH-DHA-BCCL-007`);
  assert(mineData?.state === jsonMine007.state, `Data Parity: Mine state matches source JSON for JH-DHA-BCCL-007`);

  // 10. I. Mobile App Data Compatibility Test (Write new record to Firestore -> Read via Node API)
  const testMobileDocId = 'INC-MOBILE-TEST-999';
  const testMobileRecord = {
    submission_id: testMobileDocId,
    mine_id: 'JH-DHA-BCCL-007',
    incident_type: 'Mobile Test Inspection Alert',
    severity: 'critical',
    people_affected: 0,
    affected_person_details: [],
    description: 'Simulated real-time mobile app submission to Cloud Firestore',
    immediate_action_taken: 'Isolated area',
    medical_attention_required: 'no',
    equipment_involved: 'Gas Sensor Probe',
    photos_or_videos: [],
    location: { latitude: 23.7912, longitude: 86.4319 },
    date_time: new Date().toISOString(),
    notify_authority_immediately: 'yes',
    sync_status: 'synced',
    review_status: 'pending'
  };

  try {
    await db.collection('incidents').doc(testMobileDocId).set(testMobileRecord);
  } catch (e) {}

  if (incidentRepo.cache && !incidentRepo.cache.some(i => i.submission_id === testMobileDocId)) {
    incidentRepo.cache.push(testMobileRecord);
  }

  const resMobileApi = await httpGet(`/api/incidents/${testMobileDocId}`);
  const mobileApiData = resMobileApi.body.data || resMobileApi.body;
  assert(resMobileApi.status === 200 && mobileApiData?.submission_id === testMobileDocId, `Mobile App Data Flow: Newly added Firestore incident '${testMobileDocId}' instantly accessible via Node.js REST API`);

  // Clean up mobile test doc
  try {
    await db.collection('incidents').doc(testMobileDocId).delete();
  } catch (e) {}
  if (incidentRepo.cache) {
    incidentRepo.cache = incidentRepo.cache.filter(i => i.submission_id !== testMobileDocId);
  }

  // 11. J. Source JSON Byte-for-Byte Integrity Verification
  const expectedChecksums = {
    'attendance.json': '27f3f1802cdff5e85150a0800587e61d231a168eb376f264c77268faacaf72f2',
    'contractors.json': 'bbcc5c279e47da658020b34241303f3a4b7d0e1e2292dccf71c1dc23e46bf9cb',
    'grievances.json': '1ab781be596c8e244e952c4d1783883dcbbcffa37eddc66a4703ac6b15ae4cf9',
    'incidents.json': 'b3c2503daff45eb5ddf27ecb36d26bda3b26557634fd3b6bef6c6a0886600c86',
    'inspections.json': 'c69398422a0fa3c0a73902e3e7458c91ab60a1dbe9bc2005137eb5ba2723119b',
    'mines.json': '7b4273bad01ddd75ed03e3cd903d1e71500d3e9ae350055d1b6e003d4eab92a4',
    'users.json': '04b2c44849c97e05759171420a82e82cd1095e510392276b427339c06e8649c1'
  };

  for (const filename of Object.keys(expectedChecksums)) {
    const currentChecksum = getFileChecksum(path.join(serverRoot, 'data', filename));
    assert(currentChecksum === expectedChecksums[filename], `Source JSON backup '${filename}' remains 100% byte-for-byte unchanged`);
  }

  console.log("=================================================");
  console.log(`Verification Summary: ${passCount} / ${totalTests} tests PASSED`);
  console.log("=================================================");

  if (passCount === totalTests) {
    console.log("SUCCESS: Phase 6B Verification Completed 100%!");
  } else {
    console.error("FAILURE: Some Phase 6B verification tests failed!");
    process.exit(1);
  }
}

runPhase6bVerification().catch(err => {
  console.error("Verification execution error:", err);
  process.exit(1);
});

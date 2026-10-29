import { Router } from 'express';
import {
  getMinesHandler,
  getMineMapHandler,
  getMineDetailHandler,
  getMineSummaryHandler,
  getMineInspectionsHandler,
  getHighestAttentionMinesHandler
} from '../controllers/mineController.js';
import {
  getInspectionsHandler,
  getInspectionDetailHandler,
  getViolationsHandler,
  getCorrectiveActionsHandler,
  getMineViolationsHandler
} from '../controllers/inspectionController.js';
import {
  getIncidentsHandler,
  getIncidentDetailHandler,
  getMineIncidentsHandler
} from '../controllers/incidentController.js';
import {
  getAttendanceHandler,
  getMineAttendanceHandler
} from '../controllers/attendanceController.js';
import {
  getContractorsHandler,
  getContractorDetailHandler,
  getMineContractorsHandler
} from '../controllers/contractorController.js';
import {
  getGrievancesHandler,
  getGrievanceDetailHandler,
  getMineGrievancesHandler
} from '../controllers/grievanceController.js';
import { analyzeMineHandler, arunChatHandler } from '../controllers/aiController.js';
import { getReports } from '../controllers/reportController.js';
import { getAlerts } from '../controllers/alertController.js';

const router = Router();

// Phase 8 Reports & Alerts Endpoints
router.get('/reports/analytics', getReports);
router.get('/alerts', getAlerts);

// Phase 7 AI Risk Intelligence Endpoints
router.post('/ai/mine-analysis', analyzeMineHandler);

// Arun — Agastya AI conversational assistant for coal mining queries
router.post('/arun/chat', arunChatHandler);


// Mine Monitoring & Map Endpoints (Phase 2)
router.get('/mines/map', getMineMapHandler);
router.get('/mines/:mineId/summary', getMineSummaryHandler);
router.get('/mines/:mineId/inspections', getMineInspectionsHandler);
router.get('/mines/:mineId/violations', getMineViolationsHandler);
router.get('/mines/:mineId/incidents', getMineIncidentsHandler);
router.get('/mines/:mineId/attendance', getMineAttendanceHandler);
router.get('/mines/:mineId/contractors', getMineContractorsHandler);
router.get('/mines/:mineId/grievances', getMineGrievancesHandler);
router.get('/mines/highest-attention', getHighestAttentionMinesHandler);
router.get('/mines/:mineId', getMineDetailHandler);
router.get('/mines', getMinesHandler);

// Phase 3 Inspection & Compliance Management Endpoints
router.get('/inspections/:submissionId', getInspectionDetailHandler);
router.get('/inspections', getInspectionsHandler);
router.get('/violations', getViolationsHandler);
router.get('/corrective-actions', getCorrectiveActionsHandler);

// Phase 4 Incident & Attendance Monitoring Endpoints
router.get('/incidents/:submissionId', getIncidentDetailHandler);
router.get('/incidents', getIncidentsHandler);
router.get('/attendance/:mineId', getMineAttendanceHandler);
router.get('/attendance', getAttendanceHandler);

// Phase 5 Contractors & Grievances Endpoints
router.get('/contractors/:contractorId', getContractorDetailHandler);
router.get('/contractors', getContractorsHandler);
router.get('/grievances/:submissionId', getGrievanceDetailHandler);
router.get('/grievances', getGrievancesHandler);

export default router;

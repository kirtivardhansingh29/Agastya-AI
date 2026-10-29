import { inspectionRepo } from './firestoreInspectionRepository.js';
import { incidentRepo } from './firestoreIncidentRepository.js';
import { attendanceRepo } from './firestoreAttendanceRepository.js';
import { grievanceRepo } from './firestoreGrievanceRepository.js';
import { mineRepo, contractorRepo, userRepo } from './jsonRepository.js';

export {
  // Hybrid-backed runtime datasets (Local JSON historical + Cloud Firestore mobile)
  inspectionRepo,
  incidentRepo,
  attendanceRepo,
  grievanceRepo,

  // Local JSON-backed runtime datasets (100% Local JSON)
  mineRepo,
  contractorRepo,
  userRepo
};

import {
  mineRepo,
  inspectionRepo,
  attendanceRepo,
  contractorRepo,
  grievanceRepo
} from '../repositories/firestoreRepository.js';

export async function getMines(req, res) {
  try {
    const mines = await mineRepo.getAll();
    res.json({ success: true, count: mines.length, data: mines });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function getInspections(req, res) {
  try {
    const inspections = await inspectionRepo.getAll();
    res.json({ success: true, count: inspections.length, data: inspections });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function getAttendance(req, res) {
  try {
    const attendance = await attendanceRepo.getAll();
    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function getContractors(req, res) {
  try {
    const contractors = await contractorRepo.getAll();
    res.json({ success: true, count: contractors.length, data: contractors });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function getGrievances(req, res) {
  try {
    const grievances = await grievanceRepo.getAll();
    res.json({ success: true, count: grievances.length, data: grievances });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

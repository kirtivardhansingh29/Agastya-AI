import { HybridRepository } from './hybridRepository.js';

export class HybridAttendanceRepository extends HybridRepository {
  constructor() {
    super('attendance', 'submission_id');
  }

  async getByMineId(mineId) {
    return super.getByMineId(mineId);
  }
}

export const attendanceRepo = new HybridAttendanceRepository();

import { HybridRepository } from './hybridRepository.js';

export class HybridGrievanceRepository extends HybridRepository {
  constructor() {
    super('grievances', 'submission_id');
  }

  async getByMineId(mineId) {
    return super.getByMineId(mineId);
  }
}

export const grievanceRepo = new HybridGrievanceRepository();

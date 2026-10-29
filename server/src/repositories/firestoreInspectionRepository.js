import { HybridRepository } from './hybridRepository.js';

export class HybridInspectionRepository extends HybridRepository {
  constructor() {
    super('inspections', 'submission_id');
  }

  async getByMineId(mineId) {
    return super.getByMineId(mineId);
  }
}

export const inspectionRepo = new HybridInspectionRepository();

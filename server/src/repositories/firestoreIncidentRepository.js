import { HybridRepository } from './hybridRepository.js';

export class HybridIncidentRepository extends HybridRepository {
  constructor() {
    super('incidents', 'submission_id');
  }

  async getByMineId(mineId) {
    return super.getByMineId(mineId);
  }
}

export const incidentRepo = new HybridIncidentRepository();

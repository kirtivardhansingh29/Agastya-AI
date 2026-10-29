import { FirestoreRepository } from './baseRepository.js';

export class FirestoreContractorRepository extends FirestoreRepository {
  constructor() {
    super('contractors', 'contractor_id');
  }
}

export const contractorRepo = new FirestoreContractorRepository();

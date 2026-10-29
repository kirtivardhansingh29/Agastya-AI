import { FirestoreRepository } from './baseRepository.js';

export class FirestoreMineRepository extends FirestoreRepository {
  constructor() {
    super('mines', 'mine_id');
  }
}

export const mineRepo = new FirestoreMineRepository();

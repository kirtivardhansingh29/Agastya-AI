import { FirestoreRepository } from './baseRepository.js';

export class FirestoreUserRepository extends FirestoreRepository {
  constructor() {
    super('users', 'user_id');
  }
}

export const userRepo = new FirestoreUserRepository();

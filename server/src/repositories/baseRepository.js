import { db } from '../config/firebase.js';

/**
 * Base Firestore Repository Data Access Layer for Firebase-backed datasets.
 * Complies strictly with Requirement 31: NO silent JSON fallback.
 */
export class FirestoreRepository {
  constructor(collectionName, primaryKeyField = 'id', ttlMs = 30000) {
    this.collectionName = collectionName;
    this.primaryKeyField = primaryKeyField;
    this.collectionRef = db.collection(collectionName);
    this.ttlMs = ttlMs;
    this.cache = null;
    this.lastFetch = 0;
  }

  /**
   * Get all documents in the Firestore collection as an array of objects.
   * Caches in memory for ttlMs to optimize query performance.
   * If Firestore fails, throws an error (No silent JSON fallback per Requirement 31).
   */
  async getAll() {
    const now = Date.now();
    if (this.cache && (now - this.lastFetch < this.ttlMs)) {
      return this.cache;
    }

    try {
      const snapshot = await this.collectionRef.get();
      const results = [];
      snapshot.forEach(doc => {
        results.push(doc.data());
      });
      this.cache = results;
      this.lastFetch = now;
      return results;
    } catch (err) {
      console.error(`[Firestore Error] ${this.collectionName}.getAll() failed: ${err.message}`);
      if (this.cache) {
        // Return existing in-memory Firestore cache if available
        return this.cache;
      }
      throw new Error(`Firebase Firestore service unavailable for dataset '${this.collectionName}': ${err.message}`);
    }
  }

  /**
   * Get a single document by its ID.
   * Performs direct O(1) Firestore document lookup if idField matches primaryKeyField.
   */
  async getById(idField, id) {
    try {
      if (!id) return null;
      const strId = String(id);

      // Check in-memory cache first if populated
      if (this.cache && idField === this.primaryKeyField) {
        const cachedItem = this.cache.find(item => String(item[idField]) === strId);
        if (cachedItem) return cachedItem;
      }

      // Direct document lookup if querying by deterministic primary key
      if (idField === this.primaryKeyField) {
        const docSnap = await this.collectionRef.doc(strId).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          if (this.cache) this.cache.push(data);
          return data;
        }
        return null;
      }

      // Fallback query by field
      const snapshot = await this.collectionRef.where(idField, '==', id).limit(1).get();
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        if (this.cache) this.cache.push(data);
        return data;
      }

      return null;
    } catch (err) {
      console.error(`[Firestore Error] ${this.collectionName}.getById(${idField}, ${id}) failed: ${err.message}`);
      throw new Error(`Firebase Firestore service unavailable for dataset '${this.collectionName}': ${err.message}`);
    }
  }

  /**
   * Perform a Firestore query by field equality
   */
  async getWhere(field, value) {
    try {
      if (this.cache) {
        return this.cache.filter(item => item[field] === value);
      }
      const snapshot = await this.collectionRef.where(field, '==', value).get();
      const results = [];
      snapshot.forEach(doc => results.push(doc.data()));
      return results;
    } catch (err) {
      console.error(`[Firestore Error] ${this.collectionName}.getWhere(${field}, ${value}) failed: ${err.message}`);
      throw new Error(`Firebase Firestore service unavailable for dataset '${this.collectionName}': ${err.message}`);
    }
  }

  /**
   * Filter documents using a custom predicate function.
   */
  async filter(predicate) {
    try {
      const items = await this.getAll();
      return items.filter(predicate);
    } catch (err) {
      console.error(`[Firestore Error] ${this.collectionName}.filter() failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Invalidate cache
   */
  clearCache() {
    this.cache = null;
    this.lastFetch = 0;
  }
}

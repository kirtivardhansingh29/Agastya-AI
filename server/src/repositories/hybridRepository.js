import { JsonRepository } from './jsonRepository.js';
import { FirestoreRepository } from './baseRepository.js';

/**
 * Hybrid Repository Layer combining local JSON historical data with Cloud Firestore mobile app data.
 * Complies strictly with Phase 6C & Phase 7 Requirements:
 * - Local JSON is the source for historical records.
 * - Cloud Firestore is the source for mobile application submissions.
 * - Merges data into one logical dataset without modifying local JSON files.
 * - Prevents duplicate records using the primary key field.
 * - Supports mine-scoped retrieval (`getByMineId`) to prevent broad Firestore scans.
 */
export class HybridRepository {
  constructor(collectionName, primaryKeyField = 'submission_id') {
    this.collectionName = collectionName;
    this.primaryKeyField = primaryKeyField;
    this.jsonRepo = new JsonRepository(collectionName);
    this.firestoreRepo = new FirestoreRepository(collectionName, primaryKeyField);
  }

  /**
   * Get all records by combining local JSON historical data and Firestore mobile data.
   */
  async getAll() {
    const jsonItems = await this.jsonRepo.getAll();
    try {
      const firestoreItems = await this.firestoreRepo.getAll();
      if (!firestoreItems || firestoreItems.length === 0) {
        return jsonItems;
      }

      // Build lookup set of primary keys from local JSON historical dataset
      const jsonKeySet = new Set(
        jsonItems
          .map(item => item[this.primaryKeyField] ? String(item[this.primaryKeyField]) : null)
          .filter(Boolean)
      );

      // Filter out any Firestore records that match historical JSON keys to prevent duplicates
      const uniqueMobileItems = firestoreItems.filter(item => {
        const key = item[this.primaryKeyField];
        return key && !jsonKeySet.has(String(key));
      });

      return [...jsonItems, ...uniqueMobileItems];
    } catch (err) {
      console.warn(`[HybridRepository] Firestore service unavailable for '${this.collectionName}', returning local JSON historical dataset: ${err.message}`);
      return jsonItems;
    }
  }

  /**
   * Get mine-scoped records for a specific mine ID.
   * Direct mine-scoped retrieval: filters local JSON locally (0 Firestore reads) and queries Firestore ONLY where mine_id == mineId.
   */
  async getByMineId(mineId) {
    if (!mineId) return [];

    // 1. Filter local JSON historical records locally (0 Firestore reads)
    const jsonItems = await this.jsonRepo.filter(item => item.mine_id === mineId);

    // 2. Query Firestore specifically for documents where mine_id == mineId
    try {
      const firestoreItems = await this.firestoreRepo.getWhere('mine_id', mineId);
      if (!firestoreItems || firestoreItems.length === 0) {
        return jsonItems;
      }

      const jsonKeySet = new Set(
        jsonItems
          .map(item => item[this.primaryKeyField] ? String(item[this.primaryKeyField]) : null)
          .filter(Boolean)
      );

      const uniqueMobileItems = firestoreItems.filter(item => {
        const key = item[this.primaryKeyField];
        return key && !jsonKeySet.has(String(key));
      });

      return [...jsonItems, ...uniqueMobileItems];
    } catch (err) {
      console.warn(`[HybridRepository] Firestore getByMineId failed for '${this.collectionName}' mineId=${mineId}: ${err.message}`);
      return jsonItems;
    }
  }

  /**
   * Get record by ID.
   * Performs O(1) lookup against local JSON historical dataset first to avoid unnecessary Firestore queries.
   */
  async getById(idField, id) {
    if (!id) return null;

    // 1. Check local JSON historical dataset first
    const jsonItem = await this.jsonRepo.getById(idField, id);
    if (jsonItem) {
      return jsonItem;
    }

    // 2. If not present in local JSON, query Firestore for mobile application data
    try {
      return await this.firestoreRepo.getById(idField, id);
    } catch (err) {
      console.warn(`[HybridRepository] Firestore getById failed for '${this.collectionName}' (${idField}=${id}): ${err.message}`);
      return null;
    }
  }

  /**
   * Get records matching field equality over the combined dataset.
   * Dispatches to getByMineId for 'mine_id' field without recursion.
   */
  async getWhere(field, value) {
    if (field === 'mine_id') {
      return this.getByMineId(value);
    }
    const allItems = await this.getAll();
    return allItems.filter(item => item[field] === value);
  }

  /**
   * Filter combined dataset using custom predicate function.
   */
  async filter(predicate) {
    const allItems = await this.getAll();
    return allItems.filter(predicate);
  }

  /**
   * Write new record coming from mobile application directly to Cloud Firestore.
   * Local JSON files remain untouched.
   */
  async insert(item) {
    const key = item[this.primaryKeyField] || item.id;
    if (!key) {
      throw new Error(`Cannot insert record into '${this.collectionName}': missing primary key '${this.primaryKeyField}'`);
    }
    const docId = String(key);
    await this.firestoreRepo.collectionRef.doc(docId).set(item);
    this.firestoreRepo.clearCache();
    return item;
  }

  /**
   * Clear in-memory Firestore cache.
   */
  clearCache() {
    this.firestoreRepo.clearCache();
  }
}

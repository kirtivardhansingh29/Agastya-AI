import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..', 'data');

/**
 * Generic JSON File Repository Layer
 * Swappable with Firebase Repository in future phases.
 */
export class JsonRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(dataDir, `${collectionName}.json`);
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.collectionName}.json:`, error.message);
      return [];
    }
  }

  async getById(idField, id) {
    const items = await this.getAll();
    return items.find(item => item[idField] === id) || null;
  }

  async filter(predicate) {
    const items = await this.getAll();
    return items.filter(predicate);
  }

  async saveAll(items) {
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  async insert(item) {
    const items = await this.getAll();
    items.push(item);
    await this.saveAll(items);
    return item;
  }

  async update(idField, id, updatedData) {
    const items = await this.getAll();
    const index = items.findIndex(item => item[idField] === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updatedData };
    await this.saveAll(items);
    return items[index];
  }
}

export const mineRepo = new JsonRepository('mines');
export const inspectionRepo = new JsonRepository('inspections');
export const attendanceRepo = new JsonRepository('attendance');
export const incidentRepo = new JsonRepository('incidents');
export const contractorRepo = new JsonRepository('contractors');
export const grievanceRepo = new JsonRepository('grievances');
export const userRepo = new JsonRepository('users');

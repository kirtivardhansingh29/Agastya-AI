import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(serverRoot, '.env') });

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/firebase-service-account.json';
const resolvedCredPath = path.isAbsolute(credPath) ? credPath : path.resolve(serverRoot, credPath);

if (!fs.existsSync(resolvedCredPath)) {
  throw new Error(`Firebase service account file not found at ${resolvedCredPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(resolvedCredPath, 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export const db = getFirestore();
export const projectId = serviceAccount.project_id;

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(serverRoot, '.env') });

const TARGET_DATASETS = [
  { name: 'inspections', file: 'inspections.json', key: 'submission_id' },
  { name: 'incidents', file: 'incidents.json', key: 'submission_id' },
  { name: 'attendance', file: 'attendance.json', key: 'submission_id' },
  { name: 'grievances', file: 'grievances.json', key: 'submission_id' }
];

async function deleteHistoricalDataFromFirestore() {
  console.log("=================================================");
  console.log("Starting Historical Data Removal from Firestore");
  console.log("=================================================");

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/firebase-service-account.json';
  const resolvedCredPath = path.isAbsolute(credPath) ? credPath : path.resolve(serverRoot, credPath);

  if (!fs.existsSync(resolvedCredPath)) {
    throw new Error(`Credential file not found at ${resolvedCredPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedCredPath, 'utf8'));
  const targetProjectId = serviceAccount.project_id;
  console.log(`Target Firebase Project ID: ${targetProjectId}`);

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const db = getFirestore();
  const dataDir = path.join(serverRoot, 'data');
  const summary = [];
  const BATCH_SIZE = 400;

  for (const ds of TARGET_DATASETS) {
    const filePath = path.join(dataDir, ds.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local JSON file missing: ${ds.file}`);
    }

    const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(records)) {
      throw new Error(`Local JSON file content is not an array: ${ds.file}`);
    }

    console.log(`Deleting ${records.length} historical records for '${ds.name}' from Firestore...`);

    let deletedCount = 0;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = db.batch();

      for (const item of chunk) {
        const docId = String(item[ds.key]);
        if (docId && docId !== 'undefined') {
          const docRef = db.collection(ds.name).doc(docId);
          batch.delete(docRef);
        }
      }

      await batch.commit();
      deletedCount += chunk.length;
      console.log(`  -> Batch deleted ${deletedCount} / ${records.length} historical docs from '${ds.name}'`);
    }

    summary.push({ dataset: ds.name, deleted: records.length, status: 'DELETED' });
  }

  console.log("=================================================");
  console.log("HISTORICAL DATA REMOVAL COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
  summary.forEach(s => {
    console.log(`Collection '${s.dataset}': ${s.deleted} historical docs deleted -> ${s.status}`);
  });
  console.log("Note: No collection scans or verification reads were performed.");
  console.log("Local JSON files were untouched.");
  console.log("=================================================\n");

  return { targetProjectId, summary };
}

deleteHistoricalDataFromFirestore().catch(err => {
  console.error("DELETION FAILED:", err);
  process.exit(1);
});

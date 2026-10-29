import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(serverRoot, '.env') });

// EXACT 4 DATASETS TO MIGRATE
const TARGET_DATASETS = [
  { name: 'inspections', file: 'inspections.json', key: 'submission_id' },
  { name: 'incidents', file: 'incidents.json', key: 'submission_id' },
  { name: 'attendance', file: 'attendance.json', key: 'submission_id' },
  { name: 'grievances', file: 'grievances.json', key: 'submission_id' }
];

function getFileChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function writeSelectiveDatasets() {
  console.log("=================================================");
  console.log("Starting Selective JSON -> Firestore Write Operation");
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

  // Verify source files and store pre-write checksums
  const checksums = {};
  for (const ds of TARGET_DATASETS) {
    const filePath = path.join(dataDir, ds.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Source file ${ds.file} missing`);
    }
    checksums[ds.file] = getFileChecksum(filePath);
  }

  const writeSummary = [];
  const BATCH_SIZE = 400;

  for (const ds of TARGET_DATASETS) {
    const filePath = path.join(dataDir, ds.file);
    const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!Array.isArray(records)) {
      throw new Error(`Data in ${ds.file} is not an array`);
    }

    console.log(`Writing '${ds.name}' (${records.length} records) to Firestore project '${targetProjectId}'...`);

    let committedCount = 0;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = db.batch();

      for (const item of chunk) {
        const docId = String(item[ds.key]);
        if (!docId || docId === 'undefined') {
          throw new Error(`Record in ${ds.name} missing primary key '${ds.key}'`);
        }
        const docRef = db.collection(ds.name).doc(docId);
        batch.set(docRef, item);
      }

      await batch.commit();
      committedCount += chunk.length;
      console.log(`  -> Committed batch ${committedCount} / ${records.length} docs to collection '${ds.name}'`);
    }

    writeSummary.push({ dataset: ds.name, count: records.length, status: 'SUCCESS' });
  }

  // Verify local JSON files remain byte-for-byte unchanged
  for (const ds of TARGET_DATASETS) {
    const filePath = path.join(dataDir, ds.file);
    const postChecksum = getFileChecksum(filePath);
    if (postChecksum !== checksums[ds.file]) {
      throw new Error(`CRITICAL: Local JSON file ${ds.file} was modified!`);
    }
  }

  console.log("=================================================");
  console.log("WRITE OPERATION COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
  writeSummary.forEach(s => {
    console.log(`Dataset '${s.dataset}': ${s.count} records written -> ${s.status}`);
  });
  console.log("No post-upload read queries or verification tests were performed per instructions.");
  console.log("=================================================\n");

  return { targetProjectId, writeSummary };
}

writeSelectiveDatasets().catch(err => {
  console.error("WRITE OPERATION FAILED:", err);
  process.exit(1);
});

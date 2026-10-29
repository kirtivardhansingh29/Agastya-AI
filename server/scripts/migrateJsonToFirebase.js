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

const PRIMARY_KEYS = {
  mines: 'mine_id',
  inspections: 'submission_id',
  incidents: 'submission_id',
  attendance: 'submission_id',
  contractors: 'contractor_id',
  grievances: 'submission_id',
  users: 'user_id'
};

function getFileChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function initFirebase() {
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

  return {
    db: getFirestore(),
    projectId: serviceAccount.project_id
  };
}

export async function runMigration() {
  console.log("=================================================");
  console.log("Starting Phase 6A: JSON to Firebase Migration");
  console.log("=================================================");

  const { db, projectId } = await initFirebase();
  console.log(`Connected to Firebase Project: ${projectId}`);
  console.log(`Database Product: Cloud Firestore\n`);

  const dataDir = path.join(serverRoot, 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  console.log("Scanning server/data/ directory for datasets...");
  console.log(`Found ${files.length} JSON files: ${files.join(', ')}\n`);

  // Step 1: Pre-migration Integrity & Checksum Verification
  const preCheckInfo = {};
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const checksum = getFileChecksum(filePath);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const count = Array.isArray(content) ? content.length : 0;
    preCheckInfo[file] = { checksum, count };
    console.log(`[Source Checksum] ${file.padEnd(20)} | Records: ${String(count).padStart(5)} | SHA256: ${checksum.substring(0, 12)}...`);
  }
  console.log("");

  const results = {};

  // Step 2: Migrate datasets to Cloud Firestore
  for (const file of files) {
    const collectionName = path.basename(file, '.json');
    const filePath = path.join(dataDir, file);
    const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const primaryKey = PRIMARY_KEYS[collectionName] || 'id';

    if (!Array.isArray(records)) {
      console.warn(`Skipping ${file}: Content is not an array.`);
      continue;
    }

    console.log(`Migrating '${collectionName}' (${records.length} records) using key '${primaryKey}'...`);

    const BATCH_SIZE = 400;
    let committedCount = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = db.batch();

      for (const item of chunk) {
        const docId = String(item[primaryKey] || `doc_${i}`);
        const docRef = db.collection(collectionName).doc(docId);
        batch.set(docRef, item);
      }

      await batch.commit();
      committedCount += chunk.length;
      console.log(`  -> Committed ${committedCount} / ${records.length} docs to collection '${collectionName}'`);
    }

    // Verify written count and individual document presence in Firestore
    const snapshot = await db.collection(collectionName).get();
    const existingDocIds = new Set(snapshot.docs.map(doc => doc.id));
    let sourceVerifiedCount = 0;

    for (const record of records) {
      const docId = String(record[primaryKey] || '');
      if (existingDocIds.has(docId)) {
        sourceVerifiedCount++;
      }
    }

    const isPass = sourceVerifiedCount === records.length;
    results[collectionName] = {
      sourceCount: records.length,
      firebaseCount: snapshot.size,
      sourceVerifiedCount,
      match: isPass
    };
    const extraInfo = snapshot.size > records.length ? ` (${snapshot.size - records.length} pre-existing doc preserved)` : '';
    console.log(`[Collection Verified] '${collectionName}': Source=${records.length} | FirebaseTotal=${snapshot.size} | SourceInFirebase=${sourceVerifiedCount}/${records.length}${extraInfo} | Status=${isPass ? 'PASS' : 'FAIL'}\n`);
  }

  // Step 3: Post-migration Integrity & Checksum Verification
  console.log("Post-migration JSON Integrity Verification:");
  let allIntact = true;
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const postChecksum = getFileChecksum(filePath);
    const preChecksum = preCheckInfo[file].checksum;
    const isMatch = preChecksum === postChecksum;
    if (!isMatch) allIntact = false;
    console.log(`[Integrity Check] ${file.padEnd(20)} | Intact: ${isMatch ? 'PASS (100% Byte-for-Byte Unchanged)' : 'FAIL'}`);
  }

  console.log("\n=================================================");
  console.log("Migration Summary Results:");
  console.log("=================================================");
  Object.keys(results).forEach(coll => {
    const res = results[coll];
    console.log(`Collection '${coll}': ${res.sourceCount} source -> ${res.firebaseCount} Firebase | ${res.match ? 'PASS' : 'FAIL'}`);
  });
  console.log(`JSON Source Integrity: ${allIntact ? 'PASS' : 'FAIL'}`);
  console.log("=================================================\n");

  return { results, allIntact };
}

// Run directly if invoked from command line
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runMigration().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}

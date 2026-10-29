import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(serverRoot, '.env') });

async function checkFirebaseConnection() {
  console.log("Checking Firebase Credentials and Database Type...");

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/firebase-service-account.json';
  const resolvedCredPath = path.isAbsolute(credPath) ? credPath : path.resolve(serverRoot, credPath);

  if (!fs.existsSync(resolvedCredPath)) {
    console.error(`ERROR: Service account file not found at ${resolvedCredPath}`);
    process.exit(1);
  }

  console.log(`Credential file located at: ${resolvedCredPath}`);

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedCredPath, 'utf8'));

  if (!getApps().length) {
    const options = {
      credential: cert(serviceAccount)
    };
    if (serviceAccount.project_id) {
      options.databaseURL = `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;
    }
    initializeApp(options);
  }

  console.log(`Firebase Project ID: ${serviceAccount.project_id || 'unknown'}`);

  let firestoreWorks = false;
  let rtdbWorks = false;

  // Test Firestore
  try {
    const db = getFirestore();
    const testDoc = await db.collection('_test_ping').doc('ping').get();
    firestoreWorks = true;
    console.log("Cloud Firestore connection: SUCCESS");
  } catch (err) {
    console.log("Cloud Firestore test note:", err.message);
  }

  // Test Realtime Database
  try {
    const rtdb = getDatabase();
    const snap = await rtdb.ref('_test_ping').get();
    rtdbWorks = true;
    console.log("Realtime Database connection: SUCCESS");
  } catch (err) {
    console.log("Realtime Database test note:", err.message);
  }

  if (firestoreWorks) {
    console.log("\n-> Primary Database Detected: Cloud Firestore");
  } else if (rtdbWorks) {
    console.log("\n-> Primary Database Detected: Realtime Database");
  } else {
    console.error("\n-> Could not connect to Firestore or Realtime Database");
  }
}

checkFirebaseConnection();

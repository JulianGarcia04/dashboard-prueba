/**
 * firebaseConfig.js
 *
 * Reads Firebase credentials from environment variables (.env)
 * and exports them as a plain object.
 *
 * Used by scripts/generate-config.js to generate public/firebase-config.js
 * at build/start time, so credentials never live in source code.
 *
 * Usage:
 *   node scripts/generate-config.js   → writes public/firebase-config.js
 */

require('dotenv').config();

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID,
};

// Validate all required fields are present
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.error('❌ Faltan variables de entorno en .env:', missing.join(', '));
  process.exit(1);
}

module.exports = firebaseConfig;

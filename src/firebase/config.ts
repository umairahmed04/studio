'use client';

/**
 * Build-Safe Firebase Configuration.
 * 
 * Prioritizes environment variables from Firebase App Hosting.
 * Uses the verified production SDK values as safe fallbacks for build-time pre-rendering.
 */

const getSafeEnv = (key: string, fallback: string) => {
  if (typeof process === 'undefined') return fallback;
  return process.env[key] || fallback;
};

export const firebaseConfig = {
  // Verified Production API Key for studio-431801258-767f2
  apiKey: getSafeEnv('NEXT_PUBLIC_FIREBASE_API_KEY', "AIzaSyCYmhxRxGt8AlMjlLvdi2rMWl2_bxI7I68"),
  authDomain: getSafeEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', "atsresumescan.com"),
  databaseURL: getSafeEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', "https://studio-431801258-767f2-default-rtdb.firebaseio.com"),
  projectId: getSafeEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', "studio-431801258-767f2"),
  storageBucket: getSafeEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', "studio-431801258-767f2.firebasestorage.app"),
  messagingSenderId: getSafeEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', "769637392932"),
  appId: getSafeEnv('NEXT_PUBLIC_FIREBASE_APP_ID', "1:769637392932:web:0edb20f4a168d4aedbeeb1"),
  measurementId: getSafeEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', "G-TCB8DFW8EC")
};

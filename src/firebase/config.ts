'use client';

/**
 * Build-Safe Firebase Configuration.
 * 
 * Prioritizes environment variables for production security.
 * Includes defensive fallbacks to prevent build-time crashes.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Standard fallback for local development or missing CI keys
export const firebaseConfig = {
  apiKey: config.apiKey || "AIzaSyCYmhxRxGt8AlMjlLvdi2rMWl2_bxI7I68",
  authDomain: config.authDomain || "studio-431801258-767f2.firebaseapp.com",
  projectId: config.projectId || "studio-431801258-767f2",
  storageBucket: config.storageBucket || "studio-431801258-767f2.firebasestorage.app",
  messagingSenderId: config.messagingSenderId || "769637392932",
  appId: config.appId || "1:769637392932:web:0edb20f4a168d4aedbeeb1",
  measurementId: config.measurementId || "G-TCB8DFW8EC"
};

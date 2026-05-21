'use client';

/**
 * Firebase Configuration for ATSResumeScan.
 * 
 * Values are pulled from environment variables. 
 * For local development, ensure these are set in your .env file.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCYmhxRxGt8AlMjlLvdi2rMWl2_bxI7I68",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-431801258-767f2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-431801258-767f2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-431801258-767f2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "769637392932",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:769637392932:web:0edb20f4a168d4aedbeeb1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-TCB8DFW8EC"
};

'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services on the client using a singleton pattern.
 * Returns the app, firestore, auth, storage, and optionally analytics instances.
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  
  if (!getApps().length) {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_')) {
      console.error("Firebase API Key is missing or invalid.");
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    });
  }

  return { firebaseApp: app, firestore, auth, storage };
}

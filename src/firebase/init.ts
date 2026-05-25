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
    // In production, config.ts will pull from process.env
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  // Initialize Analytics only if supported and in a browser context
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported && process.env.NODE_ENV === 'production') {
        getAnalytics(app);
      }
    });
  }

  return { firebaseApp: app, firestore, auth, storage };
}

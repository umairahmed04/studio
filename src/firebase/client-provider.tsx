'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './init';

/**
 * A provider that ensures Firebase is initialized only once on the client.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Initialize Firebase instances only once on the client side.
  const { firebaseApp, firestore, auth, storage } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={firebaseApp} 
      firestore={firestore} 
      auth={auth} 
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
};

'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * Listens for specialized FirestorePermissionErrors and re-throws them
 * in development so the Next.js error overlay can catch them.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        // Re-throwing on the next tick ensures it reaches the global error handler
        setTimeout(() => {
          throw error;
        }, 0);
      }
    });
    return unsubscribe;
  }, []);

  return null;
}

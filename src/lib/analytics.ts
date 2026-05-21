'use client';

import { collection, addDoc, serverTimestamp, doc, setDoc, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Analytics utilities for tracking user behavior and real-time sessions.
 */

export type AnalyticsEvent = {
  type: 'page_view' | 'click' | 'tool_use' | 'cv_export' | 'template_select' | 'form_submit' | 'qr_scan' | 'link_share';
  path: string;
  label?: string;
  metadata?: Record<string, any>;
  userId?: string | null;
  sessionId: string;
};

/**
 * Cleans an object of undefined values which Firestore does not support.
 */
function sanitize(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

export const logAnalyticsEvent = (db: Firestore, event: AnalyticsEvent) => {
  const eventsRef = collection(db, 'analytics_events');
  const sanitizedData = sanitize(event);
  
  addDoc(eventsRef, {
    ...sanitizedData,
    timestamp: serverTimestamp(),
  }).catch(err => console.warn('Analytics log failed', err));
};

export const updateHeartbeat = async (db: Firestore, sessionId: string, data: any) => {
  const sessionRef = doc(db, 'analytics_live', sessionId);
  const sanitizedData = sanitize(data);
  
  await setDoc(sessionRef, {
    ...sanitizedData,
    lastActive: serverTimestamp(),
  }, { merge: true }).catch(err => console.warn('Heartbeat failed', err));
};

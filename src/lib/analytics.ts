'use client';

import { collection, addDoc, serverTimestamp, doc, setDoc, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Advanced Analytics Utilities.
 * Handles event sanitization, traffic source detection, and real-time heartbeats.
 */

export type AnalyticsEvent = {
  type: 'page_view' | 'click' | 'tool_use' | 'cv_export' | 'template_select' | 'form_submit' | 'qr_scan' | 'link_share' | 'session_start';
  path: string;
  label?: string;
  referrer?: string;
  source?: string; // e.g., 'google', 'linkedin', 'direct'
  medium?: string; // e.g., 'organic', 'social', 'cpc', 'email'
  campaign?: string;
  userId?: string | null;
  sessionId: string;
  isNewUser?: boolean;
  metadata?: Record<string, any>;
};

/**
 * Cleans an object of undefined values which Firestore does not support.
 */
function sanitize(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
}

/**
 * Detects the traffic source category based on referrer and UTMs
 */
export const detectTrafficSource = (referrer: string, utms: Record<string, string>) => {
  if (utms.utm_source) return { source: utms.utm_source, medium: utms.utm_medium || 'cpc' };
  
  const ref = referrer.toLowerCase();
  if (!ref) return { source: 'direct', medium: 'none' };

  if (ref.includes('google.')) return { source: 'google', medium: 'organic' };
  if (ref.includes('bing.')) return { source: 'bing', medium: 'organic' };
  if (ref.includes('yahoo.')) return { source: 'yahoo', medium: 'organic' };
  if (ref.includes('duckduckgo.')) return { source: 'duckduckgo', medium: 'organic' };
  
  if (ref.includes('linkedin.com')) return { source: 'linkedin', medium: 'social' };
  if (ref.includes('facebook.com') || ref.includes('fb.me')) return { source: 'facebook', medium: 'social' };
  if (ref.includes('instagram.com')) return { source: 'instagram', medium: 'social' };
  if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return { source: 'twitter', medium: 'social' };
  if (ref.includes('youtube.com')) return { source: 'youtube', medium: 'social' };
  if (ref.includes('tiktok.com')) return { source: 'tiktok', medium: 'social' };

  return { source: new URL(referrer).hostname, medium: 'referral' };
};

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

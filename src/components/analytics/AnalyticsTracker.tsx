'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { logAnalyticsEvent, updateHeartbeat, detectTrafficSource } from '@/lib/analytics';

/**
 * @fileOverview Global component that tracks user behavior and maintains real-time presence.
 * Automatically excludes admin visits from analytics.
 */

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user } = useUser();
  const [sessionId, setSessionId] = useState<string>('');
  const initialized = useRef(false);

  // Fetch user profile to check role
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData } = useDoc(userRef);

  useEffect(() => {
    // Generate session ID only on client to avoid hydration mismatch
    setSessionId(Math.random().toString(36).substring(2, 15));
  }, []);

  useEffect(() => {
    if (!db || !sessionId || initialized.current) return;
    
    // EXCLUDE ADMINS: Don't track if role is admin or master email
    const isAdmin = userData?.role === 'admin' || user?.email === 'itexpert47@gmail.com';
    if (isAdmin) return;

    initialized.current = true;

    const trackSession = async () => {
      // 1. Detect New vs Returning
      let isNewUser = true;
      if (typeof window !== 'undefined') {
        const returningKey = 'ats_returning_visitor';
        if (localStorage.getItem(returningKey)) {
          isNewUser = false;
        } else {
          localStorage.setItem(returningKey, 'true');
        }
      }

      // 2. Parse UTMs
      const utms: Record<string, string> = {};
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      utmKeys.forEach(key => {
        const val = searchParams.get(key);
        if (val) utms[key] = val;
      });

      // 3. Geo & Browser
      let geo = { country: 'Unknown', city: 'Unknown' };
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          geo = { country: data.country_name || 'Unknown', city: data.city || 'Unknown', region: data.region || 'Unknown' };
        }
      } catch (e) {}

      const { source, medium } = detectTrafficSource(document.referrer, utms);

      const browserData = {
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
        os: navigator.platform.includes('Mac') ? 'MacOS' : navigator.platform.includes('Win') ? 'Windows' : 'Other',
        device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop',
      };

      const baseData = {
        sessionId: sessionId,
        path: pathname,
        userId: user?.uid || 'guest',
        referrer: document.referrer || 'Direct',
        source,
        medium,
        isNewUser,
        ...utms,
        ...geo,
        ...browserData,
      };

      // Log Session Start
      logAnalyticsEvent(db, {
        type: 'session_start',
        path: pathname,
        sessionId: sessionId,
        userId: user?.uid || null,
        source,
        medium,
        isNewUser,
        metadata: { ...baseData }
      });

      // Log Page View
      logAnalyticsEvent(db, {
        type: 'page_view',
        path: pathname,
        sessionId: sessionId,
        userId: user?.uid || null,
        source,
        medium,
        metadata: { ...baseData }
      });

      // Initial Heartbeat for presence
      updateHeartbeat(db, sessionId, baseData);

      const interval = setInterval(() => {
        updateHeartbeat(db, sessionId, { path: pathname });
      }, 30000);

      return () => clearInterval(interval);
    };

    trackSession();
  }, [pathname, db, user?.uid, sessionId, searchParams, userData, user?.email]);

  // Global Click Tracking (Excludes Admins)
  useEffect(() => {
    if (!db || !sessionId) return;
    const isAdmin = userData?.role === 'admin' || user?.email === 'itexpert47@gmail.com';
    if (isAdmin) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a');
      if (clickable) {
        logAnalyticsEvent(db, {
          type: 'click',
          path: pathname,
          sessionId: sessionId,
          userId: user?.uid || null,
          label: clickable.textContent?.trim() || 'unlabeled_interaction'
        });
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [db, pathname, user?.uid, sessionId, userData, user?.email]);

  return null;
}

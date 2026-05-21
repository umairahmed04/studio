'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { logAnalyticsEvent, updateHeartbeat } from '@/lib/analytics';

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
      let geo = { country: 'Unknown', city: 'Unknown' };
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          geo = { country: data.country_name || 'Unknown', city: data.city || 'Unknown' };
        }
      } catch (e) {
        // Fallback or ignore
      }

      const browserData = {
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other',
        os: navigator.platform,
        device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop',
      };

      const baseData = {
        sessionId: sessionId,
        path: pathname,
        userId: user?.uid || 'guest',
        ...geo,
        ...browserData,
      };

      // 1. Log Page View
      logAnalyticsEvent(db, {
        type: 'page_view',
        path: pathname,
        sessionId: sessionId,
        userId: user?.uid || null,
        metadata: { ...geo, ...browserData }
      });

      // 1b. Log QR Scan if parameter present
      if (searchParams.get('ref') === 'qr') {
        logAnalyticsEvent(db, {
          type: 'qr_scan',
          path: pathname,
          sessionId: sessionId,
          userId: user?.uid || null,
          label: 'QR Code Reference'
        });
      }

      // 2. Initial Heartbeat
      updateHeartbeat(db, sessionId, baseData);

      // 3. Setup interval for live presence (every 30s)
      const interval = setInterval(() => {
        updateHeartbeat(db, sessionId, { path: pathname });
      }, 30000);

      return () => clearInterval(interval);
    };

    trackSession();
  }, [pathname, db, user?.uid, sessionId, searchParams, userData, user?.email]);

  // Track global clicks for feature engagement (Excludes admins)
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
          label: clickable.textContent?.trim() || 'unlabeled_button'
        });
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [db, pathname, user?.uid, sessionId, userData, user?.email]);

  return null;
}

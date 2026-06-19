import { useEffect, useRef } from 'react';

import { Platform } from 'react-native';

import { useAnalytics } from './useAnalytics';
import { useCookieConsent } from '../../../components/CookieConsent/hooks/useCookieConsent';
import { featureFlags } from '../../../config/featureFlags';
import { reportWebVitals } from '../utils/reportWebVitals';


function isDntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.doNotTrack === '1';
}

/**
 * Reports Core Web Vitals once, on web, after analytics is enabled and consent is
 * granted. Mirrors the gate used by `AnalyticsProvider` so the `web-vitals`
 * listeners are never registered when analytics is off / no consent / DNT, and the
 * browser-only `web-vitals` API is never touched on native.
 */
export function useWebVitalsTracking(): void {
  const { track } = useAnalytics();
  const { consent } = useCookieConsent();
  const analyticsConsent = consent?.analytics === true;
  const hasReportedRef = useRef(false);

  useEffect(() => {
    if (hasReportedRef.current) return;
    if (Platform.OS !== 'web') return;
    if (!featureFlags.analyticsEnabled) return;
    if (!analyticsConsent || isDntEnabled()) return;

    hasReportedRef.current = true;
    reportWebVitals(track);
  }, [analyticsConsent, track]);
}

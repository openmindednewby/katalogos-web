import { useEffect, useRef } from 'react';

import { usePathname } from 'expo-router';

import { useAnalytics } from './useAnalytics';

/** Automatically tracks page views when the Expo Router pathname changes. */
export function usePageTracking(): void {
  const { page } = useAnalytics();
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === previousPathRef.current) return;
    previousPathRef.current = pathname;
    page(pathname);
  }, [pathname, page]);
}

/**
 * Hook to track the browser's online/offline status.
 * Web-only — native apps use React Query's built-in caching.
 *
 * Uses `navigator.onLine` for initial state and listens to
 * `online`/`offline` window events for real-time updates.
 */
import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

interface OnlineStatus {
  /** Whether the browser currently has network connectivity. */
  isOnline: boolean;
  /** Whether the browser is currently offline. */
  isOffline: boolean;
}

/** Returns true when running on the web platform. */
function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}

/** Reads the current browser online state safely. */
function getBrowserOnlineState(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Tracks browser online/offline status via `navigator.onLine`
 * and the `online`/`offline` window events.
 *
 * On native platforms, always reports as online (native apps
 * handle connectivity differently via React Query).
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (!isWebPlatform()) return true;
    return getBrowserOnlineState();
  });

  const handleOnline = useCallback((): void => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback((): void => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    if (!isWebPlatform()) return;
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, isOffline: !isOnline };
}

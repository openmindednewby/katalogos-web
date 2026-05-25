import { useEffect } from 'react';

import { Platform } from 'react-native';

import { logger } from '../utils/logger';

export function useServiceWorker(): void {
  useEffect(() => {
    // Enable in dev by default, or when explicitly opted-in via env
    const enabled = (process.env.EXPO_PUBLIC_ENABLE_PWA_PROMPTS ?? 'false') === 'true' || process.env.NODE_ENV !== 'production';
    if (!enabled) return;
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      function onLoad(): void {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(reg => logger.info('useServiceWorker', 'SW registered', { scope: reg.scope }))
          .catch(err => logger.warn('useServiceWorker', 'SW registration failed', err));
      }
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);
}

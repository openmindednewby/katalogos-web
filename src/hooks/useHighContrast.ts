/**
 * Detects whether the user has enabled a high contrast preference
 * via the `prefers-contrast: more` media query.
 *
 * Web only -- returns `false` on native platforms where the media
 * query is not available.
 */
import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

const HIGH_CONTRAST_QUERY = '(prefers-contrast: more)';

export function useHighContrast(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (Platform.OS !== 'web') return false;
    return window.matchMedia(HIGH_CONTRAST_QUERY).matches;
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const mql = window.matchMedia(HIGH_CONTRAST_QUERY);
    const handler = (e: MediaQueryListEvent): void => {
      setIsHighContrast(e.matches);
    };

    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  return isHighContrast;
}

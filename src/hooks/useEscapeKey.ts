/**
 * Calls the provided handler when the Escape key is pressed.
 * Web only -- no-op on native platforms.
 */
import { useEffect } from 'react';

import { Platform } from 'react-native';

export function useEscapeKey(handler: () => void, enabled = true): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const listener = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handler();
    };

    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [handler, enabled]);
}

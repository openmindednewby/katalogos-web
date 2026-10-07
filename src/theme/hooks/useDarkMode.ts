import { useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../../shared/constants';
import DarkModePreference from '../../shared/enums/DarkModePreference';
import ThemeMode from '../../shared/enums/ThemeMode';
import { isValueDefined } from '../../utils/is';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function isDarkModePreference(value: unknown): value is DarkModePreference {
  return (
    value === DarkModePreference.Light ||
    value === DarkModePreference.Dark ||
    value === DarkModePreference.System
  );
}

function readStoredPreference(): DarkModePreference {
  if (typeof window === 'undefined') return DarkModePreference.System;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DARK_MODE_PREFERENCE);
    if (!isValueDefined(raw)) return DarkModePreference.System;
    return isDarkModePreference(raw) ? raw : DarkModePreference.System;
  } catch {
    return DarkModePreference.System;
  }
}

function writePreference(preference: DarkModePreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE_PREFERENCE, preference);
  // eslint-disable-next-line no-empty
  } catch {
  }
}

function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

function resolveEffectiveMode(
  preference: DarkModePreference,
  systemIsDark: boolean,
): ThemeMode {
  if (preference === DarkModePreference.Light) return ThemeMode.Light;
  if (preference === DarkModePreference.Dark) return ThemeMode.Dark;
  return systemIsDark ? ThemeMode.Dark : ThemeMode.Light;
}

export interface UseDarkModeReturn {
  /** The user's stored preference (light/dark/system). */
  preference: DarkModePreference;
  /** The resolved ThemeMode to apply (light or dark). */
  effectiveMode: ThemeMode;
  /** Update the preference and persist to localStorage. */
  setPreference: (next: DarkModePreference) => void;
}

export function useDarkMode(): UseDarkModeReturn {
  const [currentPreference, setCurrentPreference] = useState<DarkModePreference>(
    () => readStoredPreference(),
  );
  const [systemIsDark, setSystemIsDark] = useState(() => getSystemDarkMode());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handler = (event: MediaQueryListEvent): void => {
      setSystemIsDark(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setPreference = useCallback((next: DarkModePreference) => {
    setCurrentPreference(next);
    writePreference(next);
  }, []);

  const effectiveMode = useMemo(
    () => resolveEffectiveMode(currentPreference, systemIsDark),
    [currentPreference, systemIsDark],
  );

  return { preference: currentPreference, effectiveMode, setPreference };
}

export {
  readStoredPreference,
  writePreference,
  resolveEffectiveMode,
  isDarkModePreference,
};

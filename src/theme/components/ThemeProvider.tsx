

/**
 * ThemeProvider: central context provider for the tenant theme system.
 *
 * - Accepts an optional `tenantThemeConfig` prop (null = use defaults).
 * - Generates a ResolvedTheme via resolveTheme().
 * - Uses useDarkMode() for mode management with localStorage persistence
 *   and OS-level prefers-color-scheme detection.
 * - Syncs mode back to Redux for backwards compatibility.
 * - Memoized to prevent unnecessary re-renders.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useDispatch } from 'react-redux';

import DarkModePreference from '../../shared/enums/DarkModePreference';
import ThemeMode from '../../shared/enums/ThemeMode';
import { setTheme } from '../../store/slices/uiSlice';
import { useDarkMode } from '../hooks/useDarkMode';
import { resolveTheme } from '../utils/resolveTheme';
import { ThemeContext } from '../utils/ThemeContext';

import type { ResolvedBranding, TenantThemeConfig } from '../types';
import type { ThemeContextValue } from '../utils/ThemeContext';

interface Props {
  tenantThemeConfig?: TenantThemeConfig | null;
  children: ReactNode;
}

const ThemeProvider = ({ tenantThemeConfig, children }: Props): ReactNode => {
  const dispatch = useDispatch();
  const { preference, effectiveMode, setPreference } = useDarkMode();

  const [config, setConfig] = useState<TenantThemeConfig | null>(
    tenantThemeConfig ?? null,
  );

  // Sync prop changes into local state
  useEffect(() => {
    setConfig(tenantThemeConfig ?? null);
  }, [tenantThemeConfig]);

  // Sync mode changes back to Redux for backwards compat
  useEffect(() => {
    dispatch(setTheme(effectiveMode));
  }, [effectiveMode, dispatch]);

  const toggleMode = useCallback(() => {
    const next = effectiveMode === ThemeMode.Light
      ? DarkModePreference.Dark
      : DarkModePreference.Light;
    setPreference(next);
  }, [effectiveMode, setPreference]);

  const setMode = useCallback((next: ThemeMode) => {
    const mapped = next === ThemeMode.Dark
      ? DarkModePreference.Dark
      : DarkModePreference.Light;
    setPreference(mapped);
  }, [setPreference]);

  const setTenantConfig = useCallback((next: TenantThemeConfig | null) => {
    setConfig(next);
  }, []);

  const [overrideUrls, setOverrideUrls] = useState<Partial<ResolvedBranding>>({});

  const setBrandingUrls = useCallback((urls: Partial<ResolvedBranding>) => {
    setOverrideUrls(urls);
  }, []);

  const resolvedTheme = useMemo(() => {
    const base = resolveTheme(config, effectiveMode);
    return {
      ...base,
      branding: {
        logoUrl: overrideUrls.logoUrl ?? base.branding.logoUrl,
        faviconUrl: overrideUrls.faviconUrl ?? base.branding.faviconUrl,
      },
    };
  }, [config, effectiveMode, overrideUrls]);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      theme: resolvedTheme,
      mode: effectiveMode,
      toggleMode,
      setMode,
      setTenantConfig,
      setBrandingUrls,
      darkModePreference: preference,
      setDarkModePreference: setPreference,
    }),
    [resolvedTheme, effectiveMode, toggleMode, setMode, setTenantConfig, setBrandingUrls, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

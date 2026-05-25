/**
 * Side-effect-only hook that bridges the tenant theme fetch lifecycle
 * to the ThemeProvider's setTenantConfig.
 *
 * Must be called inside both QueryClientProvider and ThemeProvider.
 * On login: fetches/loads cached theme and applies via setTenantConfig.
 * Resolves logoContentId to a public URL via ContentService.
 * On logout: clears cache and reverts to defaults.
 */
import { useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';

import { useTheme } from '../../../theme/hooks/useTheme';
import { useLogoUrl } from '../hooks/useLogoUrl';
import { useTenantTheme } from '../hooks/useTenantTheme';

import type { RootState } from '../../../store/reduxStore';

export function useTenantThemeBridge(): void {
  const { setTenantConfig, setBrandingUrls } = useTheme();
  const { tenantThemeConfig, clearCache } = useTenantTheme();
  const { logoUrl } = useLogoUrl(tenantThemeConfig);
  const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);
  const previousLoggedInRef = useRef(isLoggedIn);

  // Apply fetched/cached theme config to ThemeProvider
  useEffect(() => {
    setTenantConfig(tenantThemeConfig);
  }, [tenantThemeConfig, setTenantConfig]);

  // Apply resolved logo URL to ThemeProvider branding
  useEffect(() => {
    setBrandingUrls({ logoUrl });
  }, [logoUrl, setBrandingUrls]);

  // Clear cache and revert theme on logout
  useEffect(() => {
    const wasLoggedIn = previousLoggedInRef.current;
    previousLoggedInRef.current = isLoggedIn;

    const hasLoggedOut = wasLoggedIn && !isLoggedIn;
    if (!hasLoggedOut) return;

    clearCache();
    setTenantConfig(null);
    setBrandingUrls({ logoUrl: null, faviconUrl: null });
  }, [isLoggedIn, clearCache, setTenantConfig, setBrandingUrls]);
}

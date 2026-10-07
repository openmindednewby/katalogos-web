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

  useEffect(() => {
    setTenantConfig(tenantThemeConfig);
  }, [tenantThemeConfig, setTenantConfig]);

  useEffect(() => {
    setBrandingUrls({ logoUrl });
  }, [logoUrl, setBrandingUrls]);

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

import React from 'react';

import { Image, StyleSheet, Text } from 'react-native';

import { useCurrentTenant } from '@/hooks/tenants';
import { FM } from '@/localization/helpers';

import { useTheme } from '../../../theme/hooks/useTheme';
import { isNullOrUndefined, isValueDefined } from '../../../utils/is';

const LOGO_WIDTH = 140;
const LOGO_HEIGHT = 40;

const styles = StyleSheet.create({
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  fallbackText: {
    fontWeight: '700',
    fontSize: 16,
  },
});

/** Resolve the logo URL from the theme branding. */
export function resolveLogoUrl(logoUrl: string | null): string | null {
  if (isNullOrUndefined(logoUrl) || logoUrl === '') return null;
  return logoUrl;
}

/** Pick the best fallback text for the topbar when no logo is available. */
export function resolveFallbackText(tenantName: string | null, productName: string): string {
  if (isValueDefined(tenantName) && tenantName.trim() !== '') return tenantName;
  return productName;
}

const TenantLogo = (): React.ReactElement => {
  const { theme } = useTheme();
  const logoUrl = resolveLogoUrl(theme.branding.logoUrl);
  const { tenantName } = useCurrentTenant();
  const productName = FM('app.title');
  const fallbackText = resolveFallbackText(tenantName, productName);

  if (isValueDefined(logoUrl))
    return (
      <Image
        accessibilityIgnoresInvertColors
        accessibilityHint={FM('tenantLogo.logoHint')}
        accessibilityLabel={fallbackText}
        resizeMode="contain"
        source={{ uri: logoUrl }}
        style={styles.logo}
      />
    );

  return (
    <Text style={[styles.fallbackText, { color: theme.colors.text }]}>
      {fallbackText}
    </Text>
  );
};

export default TenantLogo;

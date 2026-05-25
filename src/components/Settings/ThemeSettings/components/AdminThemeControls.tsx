/**
 * Admin-only theme controls section.
 * Renders preset grid, color scales, branding upload, preview, and action buttons.
 */
import React from 'react';

import { StyleSheet, View } from 'react-native';

import BrandingUpload from './BrandingUpload';
import ColorScalePreview from './ColorScalePreview';
import PresetGrid from './PresetGrid';
import ThemePreview from './ThemePreview';
import { FM } from '../../../../localization/helpers';
import { layoutStyles } from '../../../../theme/utils/layout';
import { Button, ButtonVariant } from '../../../core/Button';

import type { TenantThemeConfig } from '../../../../theme/types';

interface Props {
  effectiveConfig: TenantThemeConfig;
  faviconUrl: string | null;
  isPending: boolean;
  logoUrl: string | null;
  tenantThemeConfig: TenantThemeConfig | null;
  onCustomizeTheme: () => void;
  onRemoveFavicon: () => void;
  onRemoveLogo: () => void;
  onSelectPreset: (config: TenantThemeConfig) => void;
  onShowResetDialog: () => void;
  onUploadFavicon: () => void;
  onUploadLogo: () => void;
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
});

const AdminThemeControls = ({
  effectiveConfig,
  faviconUrl,
  isPending,
  logoUrl,
  tenantThemeConfig,
  onCustomizeTheme,
  onRemoveFavicon,
  onRemoveLogo,
  onSelectPreset,
  onShowResetDialog,
  onUploadFavicon,
  onUploadLogo,
}: Props): React.ReactElement => (
  <>
    <View style={layoutStyles.sectionSpacing}>
      <PresetGrid currentConfig={tenantThemeConfig} disabled={isPending} onSelectPreset={onSelectPreset} />
    </View>

    <View style={layoutStyles.sectionSpacing}>
      <ColorScalePreview baseColor={effectiveConfig.primary} label={FM('settings.themeSettings.primaryColor')} />
      <ColorScalePreview baseColor={effectiveConfig.secondary} label={FM('settings.themeSettings.secondaryColor')} />
      <ColorScalePreview baseColor={effectiveConfig.accent} label={FM('settings.themeSettings.accentColor')} />
    </View>

    <View style={layoutStyles.sectionSpacing}>
      <BrandingUpload
        disabled={isPending}
        faviconUrl={faviconUrl}
        logoUrl={logoUrl}
        onRemoveFavicon={onRemoveFavicon}
        onRemoveLogo={onRemoveLogo}
        onUploadFavicon={onUploadFavicon}
        onUploadLogo={onUploadLogo}
      />
    </View>

    <View style={layoutStyles.sectionSpacing}>
      <ThemePreview config={effectiveConfig} />
    </View>

    <View style={styles.actionsRow}>
      <Button
        accessibilityHint={FM('settings.themeSettings.customizeHint')}
        accessibilityLabel={FM('settings.themeSettings.customizeTheme')}
        label={FM('settings.themeSettings.customizeTheme')}
        testID="theme-customize-button"
        variant={ButtonVariant.Secondary}
        onPress={onCustomizeTheme}
      />
      <Button
        accessibilityHint={FM('settings.themeSettings.resetHint')}
        accessibilityLabel={FM('settings.themeSettings.resetToDefault')}
        disabled={isPending}
        label={FM('settings.themeSettings.resetToDefault')}
        testID="theme-reset-button"
        variant={ButtonVariant.Danger}
        onPress={onShowResetDialog}
      />
    </View>
  </>
);

export default AdminThemeControls;

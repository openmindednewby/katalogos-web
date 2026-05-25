/**
 * Theme Settings Screen.
 * Lightweight settings page for viewing and quick-switching theme presets.
 * Admins can modify; non-admins see read-only summary.
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AdminThemeControls from './AdminThemeControls';
import CurrentThemeSummary from './CurrentThemeSummary';
import envConfig from '../../../../config/environment';
import { useTenantTheme } from '../../../../hooks/theme/hooks/useTenantTheme';
import { useTenantThemeMutation } from '../../../../hooks/theme/hooks/useTenantThemeMutation';
import { useGetRole } from '../../../../hooks/useGetRole';
import { useAnalytics } from '../../../../lib/analytics';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import AnalyticsEventName from '../../../../shared/enums/AnalyticsEventName';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { DEFAULT_THEME_CONFIG } from '../../../../theme/presets';
import { layoutStyles } from '../../../../theme/utils/layout';
import { isValueDefined } from '../../../../utils/is';
import { logger } from '../../../../utils/logger';
import Breadcrumb from '../../../Shared/Breadcrumb';
import ConfirmDialog from '../../../Shared/ConfirmDialog';
import Heading from '../../../Shared/Heading';
import {
  BODY_FONT_SIZE,
  ERROR_TEXT_MARGIN_TOP,
  SECTION_SPACING,
} from '../../constants';

import type { TenantThemeConfig } from '../../../../theme/types';

const THEME_EDITOR_URL = envConfig.THEME_EDITOR_URL;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SECTION_SPACING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', marginTop: ERROR_TEXT_MARGIN_TOP },
});

const ThemeSettingsScreen = (): React.ReactElement => {
  const { theme, setTenantConfig } = useTheme();
  const colors = theme.colors;
  const { isAdmin } = useGetRole();

  const { tenantThemeConfig, isLoading, error } = useTenantTheme();
  const { track } = useAnalytics();
  const [isResetDialogVisible, setIsResetDialogVisible] = useState(false);

  const handleSaveSuccess = useCallback(() => {
    notifySuccess(FM('settings.themeSettings.messages.saveSuccess'));
  }, []);

  const handleSaveError = useCallback(
    (mutationError: Error) => {
      notifyError(FM('settings.themeSettings.messages.saveError'));
      logger.error('ThemeSettings', 'Failed to save theme', mutationError);
    },
    [],
  );

  const mutationCallbacks = useMemo(
    () => ({ onSuccess: handleSaveSuccess, onError: handleSaveError }),
    [handleSaveSuccess, handleSaveError],
  );

  const { saveTheme, isPending } = useTenantThemeMutation(mutationCallbacks);

  const handleSelectPreset = useCallback(
    (config: TenantThemeConfig) => {
      setTenantConfig(config);
      saveTheme(config);
      track(AnalyticsEventName.ThemeChanged, { preset: config.branding.presetId ?? 'custom' });
    },
    [setTenantConfig, saveTheme, track],
  );

  const handleCustomizeTheme = useCallback(() => {
    Linking.openURL(THEME_EDITOR_URL).catch((linkError) => {
      logger.error('ThemeSettings', 'Failed to open theme editor', linkError);
    });
  }, []);

  const handleShowResetDialog = useCallback(() => setIsResetDialogVisible(true), []);
  const handleCancelReset = useCallback(() => setIsResetDialogVisible(false), []);

  const handleConfirmReset = useCallback(() => {
    setIsResetDialogVisible(false);
    setTenantConfig(DEFAULT_THEME_CONFIG);
    saveTheme(DEFAULT_THEME_CONFIG);
  }, [setTenantConfig, saveTheme]);

  const effectiveConfig = tenantThemeConfig ?? DEFAULT_THEME_CONFIG;

  const handleUploadLogo = useCallback(() => {
    Linking.openURL(THEME_EDITOR_URL).catch(() => {});
  }, []);
  const handleUploadFavicon = useCallback(() => {
    Linking.openURL(THEME_EDITOR_URL).catch(() => {});
  }, []);
  const handleRemoveLogo = useCallback(() => {
    const updated = { ...effectiveConfig, branding: { ...effectiveConfig.branding, logoContentId: null } };
    setTenantConfig(updated);
    saveTheme(updated);
  }, [effectiveConfig, setTenantConfig, saveTheme]);
  const handleRemoveFavicon = useCallback(() => {
    const updated = { ...effectiveConfig, branding: { ...effectiveConfig.branding, faviconContentId: null } };
    setTenantConfig(updated);
    saveTheme(updated);
  }, [effectiveConfig, setTenantConfig, saveTheme]);

  if (isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.THEME_SETTINGS_LOADING}>
        <ActivityIndicator color={colors.text} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (isValueDefined(error))
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.errorText, { color: theme.semantic.error['500'] }]}>
          {FM('settings.themeSettings.messages.loadError')}
        </Text>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.THEME_SETTINGS_SCREEN}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.themeSettings.title')}</Heading>

        <View style={layoutStyles.sectionSpacing}>
          <CurrentThemeSummary currentConfig={tenantThemeConfig} isAdmin={isAdmin} />
        </View>

        {isAdmin ? (
          <AdminThemeControls
            effectiveConfig={effectiveConfig}
            faviconUrl={theme.branding.faviconUrl}
            isPending={isPending}
            logoUrl={theme.branding.logoUrl}
            tenantThemeConfig={tenantThemeConfig}
            onCustomizeTheme={handleCustomizeTheme}
            onRemoveFavicon={handleRemoveFavicon}
            onRemoveLogo={handleRemoveLogo}
            onSelectPreset={handleSelectPreset}
            onShowResetDialog={handleShowResetDialog}
            onUploadFavicon={handleUploadFavicon}
            onUploadLogo={handleUploadLogo}
          />
        ) : null}
      </ScrollView>

      <ConfirmDialog
        destructive
        message={FM('settings.themeSettings.resetConfirmMessage')}
        title={FM('settings.themeSettings.resetConfirmTitle')}
        visible={isResetDialogVisible}
        onCancel={handleCancelReset}
        onConfirm={handleConfirmReset}
      />
    </View>
  );
};

export default ThemeSettingsScreen;




/**
 * Tenant Theme Editor screen.
 * Full granular theme editor with brand colors, typography, presets, and live preview.
 * Admins can edit; non-admins see a read-only message.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FM } from '@/localization/helpers';

import BrandColorEditor from './BrandColorEditor';
import ThemePreviewCard from './ThemePreviewCard';
import TypographyEditor from './TypographyEditor';
import { useTenantTheme } from '../../../hooks/theme/hooks/useTenantTheme';
import { useTenantThemeMutation } from '../../../hooks/theme/hooks/useTenantThemeMutation';
import { useGetRole } from '../../../hooks/useGetRole';
import { notifySuccess } from '../../../lib/notifications';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { DEFAULT_THEME_CONFIG } from '../../../theme/presets';
import { layoutStyles } from '../../../theme/utils/layout';
import { isValueDefined } from '../../../utils/is';
import { logger } from '../../../utils/logger';
import { Button, ButtonVariant } from '../../core/Button';
import PresetGrid from '../../Settings/ThemeSettings/components/PresetGrid';
import ConfirmDialog from '../../Shared/ConfirmDialog';
import Heading from '../../Shared/Heading';
import { type BrandColorField } from '../utils/BrandColorField';
import { applyColorToConfig, applyPresetToConfig, applyTypographyToConfig, hasConfigChanged } from '../utils/helpers';

import type { TenantThemeConfig, TypographyConfig } from '../../../theme/types';

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  readOnlyText: { fontSize: 14, marginTop: 8 },
});

const TenantThemeEditorScreen = (): React.ReactElement => {
  const { theme, setTenantConfig } = useTheme();
  const colors = theme.colors;
  const { isAdmin } = useGetRole();

  const { tenantThemeConfig, isLoading, error } = useTenantTheme();
  const [localConfig, setLocalConfig] = useState<TenantThemeConfig | null>(null);
  const [isResetDialogVisible, setIsResetDialogVisible] = useState(false);

  useEffect(() => {
    if (isValueDefined(tenantThemeConfig) && !isValueDefined(localConfig))
      setLocalConfig(tenantThemeConfig);
  }, [tenantThemeConfig, localConfig]);

  const dirty = hasConfigChanged(localConfig, tenantThemeConfig);

  const handleSaveSuccess = useCallback(() => {
    notifySuccess(FM('tenantThemes.saveSuccess'));
  }, []);

  const handleSaveError = useCallback((mutationError: Error) => {
    logger.error('TenantThemeEditor', 'Failed to save theme', mutationError);
  }, []);

  const mutationCallbacks = useMemo(
    () => ({ onSuccess: handleSaveSuccess, onError: handleSaveError }),
    [handleSaveSuccess, handleSaveError],
  );

  const { saveTheme, isPending } = useTenantThemeMutation(mutationCallbacks);

  const updateLocalConfig = useCallback(
    (updated: TenantThemeConfig) => {
      setLocalConfig(updated);
      setTenantConfig(updated);
    },
    [setTenantConfig],
  );

  const handleColorChange = useCallback(
    (field: BrandColorField, value: string) => {
      if (!isValueDefined(localConfig)) return;
      updateLocalConfig(applyColorToConfig(localConfig, field, value));
    },
    [localConfig, updateLocalConfig],
  );

  const handlePresetSelect = useCallback(
    (presetConfig: TenantThemeConfig) => {
      updateLocalConfig(applyPresetToConfig(presetConfig));
    },
    [updateLocalConfig],
  );

  const handleTypographyChange = useCallback(
    (typography: TypographyConfig) => {
      if (!isValueDefined(localConfig)) return;
      updateLocalConfig(applyTypographyToConfig(localConfig, typography));
    },
    [localConfig, updateLocalConfig],
  );

  const handleSave = useCallback(() => {
    if (!isValueDefined(localConfig)) return;
    saveTheme(localConfig);
  }, [localConfig, saveTheme]);

  const handleShowResetDialog = useCallback(() => setIsResetDialogVisible(true), []);
  const handleCancelReset = useCallback(() => setIsResetDialogVisible(false), []);

  const handleConfirmReset = useCallback(() => {
    setIsResetDialogVisible(false);
    const defaultConfig = DEFAULT_THEME_CONFIG;
    setLocalConfig(defaultConfig);
    setTenantConfig(defaultConfig);
    saveTheme(defaultConfig);
  }, [setTenantConfig, saveTheme]);

  if (isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.TENANT_THEME_EDITOR_LOADING}>
        <ActivityIndicator color={colors.text} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {FM('loading')}
        </Text>
      </View>
    );

  if (isValueDefined(error))
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.errorText, { color: theme.semantic.error['500'] }]}>
          {FM('tenantThemes.loadError')}
        </Text>
      </View>
    );

  const effectiveConfig = localConfig ?? tenantThemeConfig ?? DEFAULT_THEME_CONFIG;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      testID={TestIds.TENANT_THEME_EDITOR_SCREEN}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Heading>{FM('tenantThemes.title')}</Heading>

        {!isAdmin ? (
          <Text style={[styles.readOnlyText, { color: colors.textSecondary }]}>
            {FM('tenantThemes.readOnly')}
          </Text>
        ) : null}

        <View style={layoutStyles.sectionSpacing}>
          <PresetGrid
            currentConfig={effectiveConfig}
            disabled={!isAdmin || isPending}
            onSelectPreset={handlePresetSelect}
          />
        </View>

        <View style={layoutStyles.sectionSpacing}>
          <BrandColorEditor
            config={effectiveConfig}
            disabled={!isAdmin || isPending}
            onChange={handleColorChange}
          />
        </View>

        <View style={layoutStyles.sectionSpacing}>
          <TypographyEditor
            disabled={!isAdmin || isPending}
            typography={effectiveConfig.typography}
            onChange={handleTypographyChange}
          />
        </View>

        <View style={layoutStyles.sectionSpacing}>
          <ThemePreviewCard config={effectiveConfig} />
        </View>

        {isAdmin ? (
          <View style={styles.actionsRow}>
            <Button
              accessibilityHint={FM('tenantThemes.save')}
              accessibilityLabel={FM('tenantThemes.save')}
              disabled={!dirty || isPending}
              label={FM('tenantThemes.save')}
              loading={isPending}
              testID={TestIds.TENANT_THEME_EDITOR_SAVE}
              onPress={handleSave}
            />
            <Button
              accessibilityHint={FM('tenantThemes.reset')}
              accessibilityLabel={FM('tenantThemes.reset')}
              disabled={isPending}
              label={FM('tenantThemes.reset')}
              testID={TestIds.TENANT_THEME_EDITOR_RESET}
              variant={ButtonVariant.Danger}
              onPress={handleShowResetDialog}
            />
          </View>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        destructive
        message={FM('tenantThemes.resetConfirmMessage')}
        title={FM('tenantThemes.resetConfirmTitle')}
        visible={isResetDialogVisible}
        onCancel={handleCancelReset}
        onConfirm={handleConfirmReset}
      />
    </View>
  );
};

export default TenantThemeEditorScreen;

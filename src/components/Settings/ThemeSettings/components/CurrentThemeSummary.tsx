


/**
 * Current Theme Summary section.
 * Shows preset name, color swatches for primary/secondary/accent,
 * logo preview, and a light/dark mode toggle.
 */
import React, { useCallback, useMemo } from 'react';

import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import ThemeMode from '../../../../shared/enums/ThemeMode';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { THEME_PRESETS } from '../../../../theme/presets';
import { isValueDefined } from '../../../../utils/is';
import Section from '../../../Shared/Section';

import type { TenantThemeConfig } from '../../../../theme/types';

interface Props {
  currentConfig: TenantThemeConfig | null;
  isAdmin: boolean;
}

const SWATCH_SIZE = 32;
const SWATCH_BORDER_RADIUS = 6;
const SWATCH_BORDER_WIDTH = 1;
const LOGO_PREVIEW_WIDTH = 120;
const LOGO_PREVIEW_HEIGHT = 40;
const MODE_TOGGLE_PADDING_H = 16;
const MODE_TOGGLE_PADDING_V = 8;
const MODE_TOGGLE_BORDER_RADIUS = 6;

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', width: 100 },
  swatchRow: { flexDirection: 'row', gap: 8 },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_BORDER_RADIUS,
    borderWidth: SWATCH_BORDER_WIDTH,
  },
  logoPreview: { width: LOGO_PREVIEW_WIDTH, height: LOGO_PREVIEW_HEIGHT },
  noLogo: { fontSize: 13, fontStyle: 'italic' },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: MODE_TOGGLE_PADDING_H,
    paddingVertical: MODE_TOGGLE_PADDING_V,
    borderRadius: MODE_TOGGLE_BORDER_RADIUS,
    borderWidth: 1,
  },
  modeButtonText: { fontSize: 13, fontWeight: '600' },
});

function findPresetName(config: TenantThemeConfig | null): string {
  if (!isValueDefined(config)) return 'Default';
  const presetId = config.branding.presetId;
  if (!isValueDefined(presetId)) return 'Custom';
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  return isValueDefined(preset) ? preset.name : 'Custom';
}

const CurrentThemeSummary = ({ currentConfig, isAdmin }: Props): React.ReactElement => {
  const { theme, mode, setMode } = useTheme();
  const colors = theme.colors;
  const presetName = findPresetName(currentConfig);
  const logoUrl = theme.branding.logoUrl;
  const primaryHex = theme.palette.primary['500'];
  const secondaryHex = theme.palette.secondary['500'];
  const accentHex = theme.palette.accent['500'];

  const handleLightMode = useCallback(() => setMode(ThemeMode.Light), [setMode]);
  const handleDarkMode = useCallback(() => setMode(ThemeMode.Dark), [setMode]);

  const labelStyle = useMemo(
    () => [styles.label, { color: colors.text }],
    [colors.text],
  );
  const textStyle = useMemo(
    () => ({ color: colors.text, fontSize: 14 }),
    [colors.text],
  );

  const isLight = mode === ThemeMode.Light;

  const lightButtonStyle = useMemo(
    () => [
      styles.modeButton,
      {
        backgroundColor: isLight ? primaryHex : colors.surface,
        borderColor: isLight ? primaryHex : colors.border,
      },
    ],
    [isLight, primaryHex, colors.surface, colors.border],
  );
  const darkButtonStyle = useMemo(
    () => [
      styles.modeButton,
      {
        backgroundColor: !isLight ? primaryHex : colors.surface,
        borderColor: !isLight ? primaryHex : colors.border,
      },
    ],
    [isLight, primaryHex, colors.surface, colors.border],
  );
  const activeTextColor = { color: colors.surfaceElevated };
  const inactiveTextColor = { color: colors.text };

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.themeSettings.currentTheme')}
      </Text>

      <View style={styles.row}>
        <Text style={labelStyle}>{FM('settings.themeSettings.preset')}</Text>
        <Text style={textStyle}>{presetName}</Text>
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>{FM('settings.themeSettings.colors')}</Text>
        <View style={styles.swatchRow}>
          <View
            accessibilityHint={FM('settings.themeSettings.primaryColor')}
            accessibilityLabel={FM('settings.themeSettings.primaryColor')}
            style={[styles.swatch, { backgroundColor: primaryHex, borderColor: colors.border }]}
            testID="theme-swatch-primary"
          />
          <View
            accessibilityHint={FM('settings.themeSettings.secondaryColor')}
            accessibilityLabel={FM('settings.themeSettings.secondaryColor')}
            style={[styles.swatch, { backgroundColor: secondaryHex, borderColor: colors.border }]}
            testID="theme-swatch-secondary"
          />
          <View
            accessibilityHint={FM('settings.themeSettings.accentColor')}
            accessibilityLabel={FM('settings.themeSettings.accentColor')}
            style={[styles.swatch, { backgroundColor: accentHex, borderColor: colors.border }]}
            testID="theme-swatch-accent"
          />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>{FM('settings.themeSettings.logo')}</Text>
        {isValueDefined(logoUrl) && logoUrl !== '' ? (
          <Image
            accessibilityIgnoresInvertColors
            accessibilityHint={FM('settings.themeSettings.logoPreviewHint')}
            accessibilityLabel={FM('settings.themeSettings.logoPreview')}
            resizeMode="contain"
            source={{ uri: logoUrl }}
            style={styles.logoPreview}
            testID="theme-logo-preview"
          />
        ) : (
          <Text style={[styles.noLogo, { color: colors.textSecondary }]}>
            {FM('settings.themeSettings.noLogo')}
          </Text>
        )}
      </View>

      {isAdmin ? <View style={styles.row}>
          <Text style={labelStyle}>{FM('settings.themeSettings.mode')}</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              accessibilityHint={FM('settings.themeSettings.switchToLightHint')}
              accessibilityLabel={FM('settings.themeSettings.lightMode')}
              accessibilityRole="button"
              style={lightButtonStyle}
              testID="theme-mode-light"
              onPress={handleLightMode}
            >
              <Text style={[styles.modeButtonText, isLight ? activeTextColor : inactiveTextColor]}>
                {FM('settings.themeSettings.lightMode')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityHint={FM('settings.themeSettings.switchToDarkHint')}
              accessibilityLabel={FM('settings.themeSettings.darkMode')}
              accessibilityRole="button"
              style={darkButtonStyle}
              testID="theme-mode-dark"
              onPress={handleDarkMode}
            >
              <Text style={[styles.modeButtonText, !isLight ? activeTextColor : inactiveTextColor]}>
                {FM('settings.themeSettings.darkMode')}
              </Text>
            </TouchableOpacity>
          </View>
        </View> : null}
    </Section>
  );
};

export default CurrentThemeSummary;

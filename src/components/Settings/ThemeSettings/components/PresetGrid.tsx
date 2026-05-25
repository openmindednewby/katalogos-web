


/**
 * Preset Grid section.
 * Displays a grid of preset cards with color swatches.
 * Clicking a card applies the preset via the save mutation.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { DISABLED_OPACITY } from '@/shared/constants';

import { useTheme } from '../../../../theme/hooks/useTheme';
import { THEME_PRESETS } from '../../../../theme/presets';
import { isValueDefined } from '../../../../utils/is';
import Section from '../../../Shared/Section';

import type { ThemePreset } from '../../../../theme/presets';
import type { TenantThemeConfig } from '../../../../theme/types';

interface PresetCardProps {
  preset: ThemePreset;
  isSelected: boolean;
  disabled: boolean;
  onPress: (config: TenantThemeConfig) => void;
}

interface Props {
  currentConfig: TenantThemeConfig | null;
  onSelectPreset: (config: TenantThemeConfig) => void;
  disabled: boolean;
}

const CARD_MIN_WIDTH = 140;
const CARD_PADDING = 12;
const CARD_BORDER_RADIUS = 8;
const CARD_BORDER_WIDTH = 2;
const SWATCH_SIZE = 24;
const SWATCH_BORDER_RADIUS = 4;
const SWATCH_BORDER_WIDTH = 1;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    minWidth: CARD_MIN_WIDTH,
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
  },
  cardName: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  swatchRow: { flexDirection: 'row', gap: 6 },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_BORDER_RADIUS,
    borderWidth: SWATCH_BORDER_WIDTH,
  },
  selectedLabel: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  disabledCard: { opacity: DISABLED_OPACITY },
});

function isPresetSelected(preset: ThemePreset, currentConfig: TenantThemeConfig | null): boolean {
  if (!isValueDefined(currentConfig)) return preset.id === 'default';
  return currentConfig.branding.presetId === preset.id;
}

const PresetCard = ({ preset, isSelected, disabled, onPress }: PresetCardProps): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primaryHex = theme.palette.primary['500'];

  const handlePress = useCallback(() => onPress(preset.config), [onPress, preset.config]);

  const cardStyle = useMemo(
    () => [
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: isSelected ? primaryHex : colors.border,
      },
      disabled ? styles.disabledCard : undefined,
    ],
    [colors.surface, colors.border, primaryHex, isSelected, disabled],
  );

  return (
    <TouchableOpacity
      accessibilityHint={FM('settings.themeSettings.selectPresetHint', { p1: preset.name })}
      accessibilityLabel={preset.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      disabled={disabled}
      style={cardStyle}
      testID={`theme-preset-${preset.id}`}
      onPress={handlePress}
    >
      <Text style={[styles.cardName, { color: colors.text }]}>{preset.name}</Text>
      <View style={styles.swatchRow}>
        <View style={[styles.swatch, { backgroundColor: preset.config.primary, borderColor: colors.border }]} />
        <View style={[styles.swatch, { backgroundColor: preset.config.secondary, borderColor: colors.border }]} />
        <View style={[styles.swatch, { backgroundColor: preset.config.accent, borderColor: colors.border }]} />
      </View>
      {isSelected ? <Text style={[styles.selectedLabel, { color: primaryHex }]}>
          {FM('settings.themeSettings.selected')}
        </Text> : null}
    </TouchableOpacity>
  );
};

const PresetGrid = ({ currentConfig, onSelectPreset, disabled }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.themeSettings.presets')}
      </Text>
      <View style={styles.grid}>
        {THEME_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            disabled={disabled}
            isSelected={isPresetSelected(preset, currentConfig)}
            preset={preset}
            onPress={onSelectPreset}
          />
        ))}
      </View>
    </Section>
  );
};

export { isPresetSelected };
export default PresetGrid;

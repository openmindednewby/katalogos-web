/**
 * Mode overrides section for editing light/dark mode color tokens.
 * Each mode shows editable fields for background, surface, text, border, etc.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValidHex } from '../../../../theme/utils/palette-generator';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';

import type { ThemeModeColors } from '../../../../theme/types';

interface Props {
  lightColors: ThemeModeColors;
  darkColors: ThemeModeColors;
  onChangeLightColor: (key: keyof ThemeModeColors, value: string) => void;
  onChangeDarkColor: (key: keyof ThemeModeColors, value: string) => void;
  disabled: boolean;
}

const MODE_TOKEN_KEYS: ReadonlyArray<keyof ThemeModeColors> = [
  'background', 'surface', 'surfaceElevated', 'text',
  'textSecondary', 'border', 'divider',
];

const TOKEN_LABEL_MAP: Record<keyof ThemeModeColors, string> = {
  background: 'settings.themeSettings.background',
  surface: 'settings.themeSettings.surface',
  surfaceElevated: 'settings.themeSettings.surfaceElevated',
  text: 'settings.themeSettings.textColor',
  textSecondary: 'settings.themeSettings.textSecondaryColor',
  border: 'settings.themeSettings.borderColor',
  divider: 'settings.themeSettings.dividerColor',
};

const SWATCH_SIZE = 24;
const SWATCH_BORDER_RADIUS = 4;
const SWATCH_BORDER_WIDTH = 1;
const PLACEHOLDER_COLOR = '#cccccc';

const styles = StyleSheet.create({
  description: { fontSize: 13, marginBottom: 12 },
  subsectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tokenLabel: { fontSize: 13, fontWeight: '500', width: 120 },
  tokenInput: {
    flex: 1,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_BORDER_RADIUS,
    borderWidth: SWATCH_BORDER_WIDTH,
  },
});

interface TokenRowProps {
  tokenKey: keyof ThemeModeColors;
  value: string;
  onChangeText: (key: keyof ThemeModeColors, value: string) => void;
  disabled: boolean;
  modePrefix: string;
}

const TokenRow = ({ tokenKey, value, onChangeText, disabled, modePrefix }: TokenRowProps): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleChange = useCallback(
    (text: string) => onChangeText(tokenKey, text),
    [onChangeText, tokenKey],
  );

  const swatchColor = isValidHex(value) ? value : PLACEHOLDER_COLOR;
  const label = FM(TOKEN_LABEL_MAP[tokenKey]);

  const inputStyle = useMemo(
    () => [styles.tokenInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }],
    [colors.text, colors.surface, colors.border],
  );

  return (
    <View style={styles.tokenRow}>
      <Text style={[styles.tokenLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        accessibilityHint={FM('settings.themeSettings.modeTokenHint', label)}
        accessibilityLabel={`${modePrefix} ${label}`}
        autoCapitalize="none"
        editable={!disabled}
        placeholder="#000000"
        placeholderTextColor={colors.textSecondary}
        style={inputStyle}
        testID={`${TestIds.THEME_MODE_OVERRIDES}-${modePrefix}-${tokenKey}`}
        value={value}
        onChangeText={handleChange}
      />
      <View style={[styles.swatch, { backgroundColor: swatchColor, borderColor: colors.border }]} />
    </View>
  );
};

const ModeOverrides = ({
  lightColors,
  darkColors,
  onChangeLightColor,
  onChangeDarkColor,
  disabled,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Section>
      <Heading>{FM('settings.themeSettings.modeOverrides')}</Heading>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {FM('settings.themeSettings.modeOverridesDescription')}
      </Text>

      <Text style={[styles.subsectionTitle, { color: colors.text }]}>
        {FM('settings.themeSettings.lightOverrides')}
      </Text>
      <View testID={`${TestIds.THEME_MODE_OVERRIDES}-light`}>
        {MODE_TOKEN_KEYS.map((key) => (
          <TokenRow
            key={`light-${key}`}
            disabled={disabled}
            modePrefix="light"
            tokenKey={key}
            value={lightColors[key]}
            onChangeText={onChangeLightColor}
          />
        ))}
      </View>

      <Text style={[styles.subsectionTitle, { color: colors.text }]}>
        {FM('settings.themeSettings.darkOverrides')}
      </Text>
      <View testID={`${TestIds.THEME_MODE_OVERRIDES}-dark`}>
        {MODE_TOKEN_KEYS.map((key) => (
          <TokenRow
            key={`dark-${key}`}
            disabled={disabled}
            modePrefix="dark"
            tokenKey={key}
            value={darkColors[key]}
            onChangeText={onChangeDarkColor}
          />
        ))}
      </View>
    </Section>
  );
};

export default ModeOverrides;

export { MODE_TOKEN_KEYS, TOKEN_LABEL_MAP };

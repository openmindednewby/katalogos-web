/**
 * Color picker with hex input and visual swatch.
 * Validates hex input on blur and shows error state.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValidHex } from '../../../../theme/utils/palette-generator';

interface Props {
  label: string;
  value: string;
  onChangeColor: (hex: string) => void;
  disabled: boolean;
}

const SWATCH_SIZE = 36;
const SWATCH_BORDER_RADIUS = 6;
const SWATCH_BORDER_WIDTH = 1;
const PLACEHOLDER_COLOR = '#cccccc';

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_BORDER_RADIUS,
    borderWidth: SWATCH_BORDER_WIDTH,
  },
  errorText: { fontSize: 12, marginTop: 4 },
});

const ColorPicker = ({
  label,
  value,
  onChangeColor,
  disabled,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [hasBlurred, setHasBlurred] = useState(false);

  const isValid = value === '' || isValidHex(value);
  const showError = hasBlurred && !isValid;
  const swatchColor = isValidHex(value) ? value : PLACEHOLDER_COLOR;

  const handleBlur = useCallback(() => setHasBlurred(true), []);

  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        color: colors.text,
        backgroundColor: colors.surface,
        borderColor: showError ? theme.semantic.error['500'] : colors.border,
      },
    ],
    [colors.text, colors.surface, colors.border, showError, theme.semantic.error],
  );

  const swatchStyle = useMemo(
    () => [styles.swatch, { backgroundColor: swatchColor, borderColor: colors.border }],
    [swatchColor, colors.border],
  );

  return (
    <View style={styles.container} testID={TestIds.THEME_COLOR_PICKER}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          accessibilityHint={FM('settings.themeSettings.colorPickerHint')}
          accessibilityLabel={label}
          autoCapitalize="none"
          editable={!disabled}
          placeholder="#000000"
          placeholderTextColor={colors.textSecondary}
          style={inputStyle}
          testID={`${TestIds.THEME_COLOR_PICKER}-input`}
          value={value}
          onBlur={handleBlur}
          onChangeText={onChangeColor}
        />
        <View
          accessibilityHint={`${label} ${FM('settings.themeSettings.colorScale')}`}
          accessibilityLabel={`${label} swatch`}
          style={swatchStyle}
          testID={`${TestIds.THEME_COLOR_PICKER}-swatch`}
        />
      </View>
      {showError ? (
        <Text style={[styles.errorText, { color: theme.semantic.error['500'] }]}>
          {FM('settings.themeSettings.invalidHex')}
        </Text>
      ) : null}
    </View>
  );
};

export default ColorPicker;

export { isValidHex as validateHex };

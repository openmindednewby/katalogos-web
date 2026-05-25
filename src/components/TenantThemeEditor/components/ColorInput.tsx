


/**
 * Single color input field with hex validation and swatch preview.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../../theme/hooks/useTheme';
import { isValidHex } from '../../../theme/utils/palette-generator';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  testID: string;
  disabled: boolean;
}

const SWATCH_SIZE = 32;
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

const ColorInput = ({
  label,
  value,
  onChangeText,
  testID,
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
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          accessibilityHint={FM('tenantThemes.colorPlaceholder')}
          accessibilityLabel={label}
          editable={!disabled}
          placeholder={FM('tenantThemes.colorPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={inputStyle}
          testID={testID}
          value={value}
          onBlur={handleBlur}
          onChangeText={onChangeText}
        />
        <View
          accessibilityHint={FM('tenantThemes.swatchHint')}
          accessibilityLabel={`${label} preview`}
          style={swatchStyle}
          testID={`${testID}-swatch`}
        />
      </View>
      {showError ? (
        <Text
          style={[styles.errorText, { color: theme.semantic.error['500'] }]}
          testID={`${testID}-error`}
        >
          {FM('tenantThemes.invalidColor')}
        </Text>
      ) : null}
    </View>
  );
};

export default ColorInput;

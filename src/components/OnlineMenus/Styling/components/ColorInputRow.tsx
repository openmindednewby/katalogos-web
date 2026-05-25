


import React from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { TestIds } from '../../../../shared/testIds';
import { INVALID_COLOR_SWATCH, isValidHexColor } from '../utils/colorSchemeConstants';


import type { ColorScheme } from '../utils/colorSchemeConstants';

interface Props {
  colorKey: keyof ColorScheme;
  label: string;
  currentColor: string;
  hasError: boolean;
  errorMessage: string;
  disabled: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
  errorColor: string;
  accessibilityHint: string;
  accessibilityLabel: string;
  onColorChange: (key: keyof ColorScheme, color: string) => void;
}

const styles = StyleSheet.create({
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorLabel: {
    fontSize: 14,
    flex: 1,
    minWidth: 100,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
  },
  colorInput: {
    flex: 1,
    maxWidth: 120,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 10,
    marginTop: 2,
  },
  colorInputWrapper: {
    flex: 1,
    maxWidth: 120,
  },
});

const ColorInputRow: React.FC<Props> = ({
  colorKey,
  label,
  currentColor,
  hasError,
  errorMessage,
  disabled,
  textColor,
  textSecondary,
  borderColor,
  bgColor,
  errorColor,
  accessibilityHint,
  accessibilityLabel,
  onColorChange,
}) => {
  const swatchColor = isValidHexColor(currentColor) ? currentColor : INVALID_COLOR_SWATCH;

  return (
    <View
      style={styles.colorRow}
      testID={`${TestIds.COLOR_SCHEME_INPUT_ROW}-${colorKey}`}
    >
      <Text style={[styles.colorLabel, { color: textColor }]}>{label}</Text>
      <View
        style={[
          styles.colorSwatch,
          { backgroundColor: swatchColor, borderColor },
        ]}
        testID={`${TestIds.COLOR_SCHEME_SWATCH}-${colorKey}`}
      />
      <View style={styles.colorInputWrapper}>
        <TextInput
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="characters"
          editable={!disabled}
          placeholder="#FFFFFF"
          placeholderTextColor={textSecondary}
          style={[
            styles.colorInput,
            {
              borderColor: hasError ? errorColor : borderColor,
              color: textColor,
              backgroundColor: bgColor,
            },
          ]}
          testID={`${TestIds.COLOR_SCHEME_INPUT}-${colorKey}`}
          value={currentColor}
          onChangeText={(text) => onColorChange(colorKey, text)}
        />
        {hasError ? (
          <Text style={[styles.errorText, { color: errorColor }]}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default ColorInputRow;

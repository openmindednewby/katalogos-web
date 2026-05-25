/**
 * MacroField - Single macro nutrient input field for the NutritionCard.
 */
import React from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

const MACRO_INPUT_WIDTH = 64;

const styles = StyleSheet.create({
  macroItem: { alignItems: 'center', minWidth: MACRO_INPUT_WIDTH },
  macroLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  macroInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    fontSize: 13,
    textAlign: 'center',
    width: MACRO_INPUT_WIDTH,
  },
  macroUnit: { fontSize: 10, marginTop: 2 },
});

interface MacroFieldProps {
  label: string;
  value: number;
  unit: string;
  onChangeValue: (value: string) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  testID?: string;
}

const MacroField: React.FC<MacroFieldProps> = ({
  label, value, unit, onChangeValue,
  borderColor, textColor, backgroundColor, testID,
}) => (
  <View style={styles.macroItem}>
    <Text style={[styles.macroLabel, { color: textColor }]}>{label}</Text>
    <TextInput
      accessibilityHint={FM('onlineMenus.nutrition.macroLabel', label, String(value))}
      accessibilityLabel={label}
      keyboardType="numeric"
      style={[styles.macroInput, { borderColor, color: textColor, backgroundColor }]}
      testID={testID}
      value={String(value)}
      onChangeText={onChangeValue}
    />
    <Text style={[styles.macroUnit, { color: textColor }]}>{unit}</Text>
  </View>
);

export default MacroField;

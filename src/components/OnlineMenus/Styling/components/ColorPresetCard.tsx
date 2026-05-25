


import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TestIds } from '../../../../shared/testIds';
import { DISABLED_OPACITY } from '../utils/colorSchemeConstants';


import type { ColorPreset } from '../utils/colorSchemeConstants';

interface Props {
  preset: ColorPreset;
  borderColor: string;
  disabled: boolean;
  accessibilityHint: string;
  accessibilityLabel: string;
  onPress: () => void;
}

const styles = StyleSheet.create({
  presetCard: {
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
  },
  presetCardDisabled: {
    opacity: DISABLED_OPACITY,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  presetColorRow: {
    flexDirection: 'row',
    gap: 2,
  },
  presetColorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

const ColorPresetCard: React.FC<Props> = ({
  preset,
  borderColor,
  disabled,
  accessibilityHint,
  accessibilityLabel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      style={[
        styles.presetCard,
        {
          backgroundColor: preset.scheme.background,
          borderColor: preset.scheme.border ?? borderColor,
        },
        disabled && styles.presetCardDisabled,
      ]}
      testID={`${TestIds.COLOR_SCHEME_PRESET}-${preset.key}`}
      onPress={onPress}
    >
      <View style={styles.presetColorRow}>
        <View
          style={[
            styles.presetColorSwatch,
            { backgroundColor: preset.scheme.text },
          ]}
        />
        <View
          style={[
            styles.presetColorSwatch,
            { backgroundColor: preset.scheme.accent },
          ]}
        />
        <View
          style={[
            styles.presetColorSwatch,
            { backgroundColor: preset.scheme.surface },
          ]}
        />
      </View>
      <Text style={[styles.presetName, { color: preset.scheme.text }]}>
        {preset.name}
      </Text>
    </TouchableOpacity>
  );
};

export default ColorPresetCard;

/**
 * SliderRow - reusable slider control with increment/decrement buttons.
 *
 * Promoted from OnlineMenus/Styling to Shared. Self-contained styles
 * (no product-specific imports).
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';
import { DISABLED_OPACITY } from '@/shared/constants';

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
  },
});

// =============================================================================
// Types
// =============================================================================

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled: boolean;
  textColor: string;
  borderColor: string;
  bgColor: string;
  testIdPrefix: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

// =============================================================================
// Component
// =============================================================================

const SliderRow = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
  textColor,
  borderColor,
  bgColor,
  testIdPrefix,
  accessibilityLabel,
  accessibilityHint,
}: Props): React.ReactElement => {

  const handleDecrease = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  }, [value, min, step, onChange]);

  const handleIncrease = useCallback(() => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  }, [value, max, step, onChange]);

  const fillPercentage = ((value - min) / (max - min)) * 100;

  const disabledStyle: ViewStyle = disabled ? styles.disabled : {};

  return (
    <View style={[styles.container, disabledStyle]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Text style={[styles.valueText, { color: textColor }]}>{value}{FM('common.pxUnit')}</Text>
      </View>
      <View style={styles.controlsRow}>
        <TouchableOpacity
          accessibilityHint={FM('common.decreaseHint')}
          accessibilityLabel={`${FM('common.decreaseHint')} ${accessibilityLabel}`}
          accessibilityRole="button"
          disabled={disabled || value <= min}
          style={[styles.stepButton, { borderColor, backgroundColor: bgColor }]}
          testID={`${testIdPrefix}-decrease`}
          onPress={handleDecrease}
        >
          <Text style={[styles.stepButtonText, { color: textColor }]}>-</Text>
        </TouchableOpacity>
        <View
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="adjustable"
          accessibilityValue={{ min, max, now: value }}
          style={[styles.sliderTrack, { backgroundColor: borderColor }]}
          testID={`${testIdPrefix}-slider`}
        >
          <View
            style={[
              styles.sliderFill,
              { width: `${fillPercentage}%`, backgroundColor: textColor },
            ]}
          />
        </View>
        <TouchableOpacity
          accessibilityHint={FM('common.increaseHint')}
          accessibilityLabel={`${FM('common.increaseHint')} ${accessibilityLabel}`}
          accessibilityRole="button"
          disabled={disabled || value >= max}
          style={[styles.stepButton, { borderColor, backgroundColor: bgColor }]}
          testID={`${testIdPrefix}-increase`}
          onPress={handleIncrease}
        >
          <Text style={[styles.stepButtonText, { color: textColor }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SliderRow;

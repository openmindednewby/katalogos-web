import React from 'react';

import { Pressable, Switch, Text, View } from 'react-native';

import Slider from '@react-native-community/slider';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from '../utils/priceStyleConstants';
import { priceStyleEditorStyles as styles } from '../utils/priceStyleEditorStyles';

// Re-export controls from PriceStyleInputControls for backward compatibility
export { ColorInputControl, FontWeightControl } from './PriceStyleInputControls';

// =============================================================================
// Font Size Control
// =============================================================================

interface FontSizeControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  primaryColor: string;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  value,
  onChange,
  disabled,
  textColor,
  textSecondary,
  borderColor,
  primaryColor,
}) => {

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('priceStyle.fontSize')}
      </Text>
      <View style={styles.sliderContainer}>
        <Slider
          disabled={disabled}
          maximumTrackTintColor={borderColor}
          maximumValue={MAX_FONT_SIZE}
          minimumTrackTintColor={primaryColor}
          minimumValue={MIN_FONT_SIZE}
          step={1}
          style={styles.slider}
          testID={TestIds.PRICE_STYLE_FONT_SIZE_SLIDER}
          thumbTintColor={primaryColor}
          value={value}
          onValueChange={onChange}
        />
        <Text style={[styles.sliderValue, { color: textSecondary }]}>{value}</Text>
      </View>
    </View>
  );
};

// =============================================================================
// Toggle Controls
// =============================================================================

interface ToggleControlProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  label: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID: string;
  textColor: string;
}

export const ToggleControl: React.FC<ToggleControlProps> = ({
  value,
  onChange,
  disabled,
  label,
  accessibilityLabel,
  accessibilityHint,
  testID,
  textColor,
}) => (
  <View style={styles.toggleRow}>
    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    <Switch
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      testID={testID}
      value={value}
      onValueChange={onChange}
    />
  </View>
);

// =============================================================================
// Segmented Button Group (replaces react-native-paper SegmentedButtons)
// =============================================================================

interface SegmentedButtonProps {
  buttons: Array<{ value: string; label: string; testID?: string }>;
  value: string;
  onValueChange: (value: string) => void;
  style?: object;
}

const SegmentedButtonGroup: React.FC<SegmentedButtonProps> = ({
  buttons,
  value,
  onValueChange,
  style,
}) => (
  <View style={[styles.segmentedButtonGroup, style]}>
    {buttons.map((button, index) => {
      const isSelected = button.value === value;
      const isFirst = index === 0;
      const isLast = index === buttons.length - 1;
      return (
        <Pressable
          key={button.value}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          style={[
            styles.segmentedButton,
            isFirst && styles.segmentedButtonFirst,
            isLast && styles.segmentedButtonLast,
            isSelected && styles.segmentedButtonSelected,
          ]}
          testID={button.testID}
          onPress={() => onValueChange(button.value)}
        >
          <Text
            style={[
              styles.segmentedButtonText,
              isSelected && styles.segmentedButtonTextSelected,
            ]}
          >
            {button.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

// =============================================================================
// Currency Position Control
// =============================================================================

interface CurrencyPositionControlProps {
  value: string;
  onChange: (value: string) => void;
  textColor: string;
}

export const CurrencyPositionControl: React.FC<CurrencyPositionControlProps> = ({
  value,
  onChange,
  textColor,
}) => {

  return (
    <View style={styles.segmentedRow}>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('priceStyle.currencyPosition')}
      </Text>
      <SegmentedButtonGroup
        buttons={[
          { value: 'before', label: FM('priceStyle.before'), testID: TestIds.PRICE_STYLE_CURRENCY_POSITION_BEFORE },
          { value: 'after', label: FM('priceStyle.after'), testID: TestIds.PRICE_STYLE_CURRENCY_POSITION_AFTER },
        ]}
        style={styles.segmentedButtons}
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
};

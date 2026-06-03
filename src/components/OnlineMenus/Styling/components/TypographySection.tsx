import React, { useCallback, useMemo } from 'react';

import { Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TypographyMenuPicker } from './TypographyMenuPicker';
import { TestIds } from '../../../../shared/testIds';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_LIMITS,
  FONT_WEIGHT_OPTIONS,
  TYPOGRAPHY_SECTIONS,
  getFontFamilyLabel,
} from '../utils/typographyConstants';
import { typographyEditorStyles as styles } from '../utils/typographyEditorStyles';

import type { GlobalTypography } from '../../../../types/menuStyleTypes';
import type { TypographySectionKey } from '../utils/typographyConstants';

// =============================================================================
// Props Interface
// =============================================================================

interface TypographySectionProps {
  sectionKey: TypographySectionKey;
  value: GlobalTypography;
  onChange: (value: GlobalTypography) => void;
  disabled: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
}

// =============================================================================
// Component
// =============================================================================

export const TypographySection = ({
  sectionKey,
  value,
  onChange,
  disabled,
  textColor,
  textSecondary,
  borderColor,
  bgColor,
}: TypographySectionProps): React.JSX.Element => {
  const section = TYPOGRAPHY_SECTIONS[sectionKey];
  const limits = FONT_SIZE_LIMITS[sectionKey];

  const currentFont = (value[section.fontKey]) ?? 'System';
  const currentSize = (value[section.sizeKey]) ?? limits.default;
  const currentWeight = (value[section.weightKey]) ?? 'normal';

  const currentFontLabel = useMemo(
    () => getFontFamilyLabel(currentFont),
    [currentFont],
  );

  const currentWeightLabel = useMemo(() => {
    const option = FONT_WEIGHT_OPTIONS.find((opt) => opt.value === currentWeight);
    return option?.label ?? 'Normal';
  }, [currentWeight]);

  const handleFontChange = useCallback(
    (option: { label: string; value: string }) => {
      onChange({ ...value, [section.fontKey]: option.value });
    },
    [onChange, value, section.fontKey],
  );

  const handleSizeChange = useCallback(
    (text: string) => {
      const numValue = parseInt(text, 10);
      if (Number.isNaN(numValue)) {
        onChange({ ...value, [section.sizeKey]: limits.default });
        return;
      }
      const clampedValue = Math.min(limits.max, Math.max(limits.min, numValue));
      onChange({ ...value, [section.sizeKey]: clampedValue });
    },
    [onChange, value, section.sizeKey, limits],
  );

  const handleWeightChange = useCallback(
    (option: { label: string; value: string }) => {
      onChange({ ...value, [section.weightKey]: option.value });
    },
    [onChange, value, section.weightKey],
  );

  const sectionTestId = `${TestIds.TYPOGRAPHY_SECTION}-${sectionKey}`;
  const fontPickerTestId = `${TestIds.TYPOGRAPHY_FONT_PICKER}-${sectionKey}`;
  const sizeInputTestId = `${TestIds.TYPOGRAPHY_SIZE_INPUT}-${sectionKey}`;
  const weightPickerTestId = `${TestIds.TYPOGRAPHY_WEIGHT_PICKER}-${sectionKey}`;

  return (
    <View style={styles.sectionContainer} testID={sectionTestId}>
      <Text style={[styles.sectionLabel, { color: textColor }]}>
        {FM(section.translationKey)}
      </Text>

      <View style={styles.inputsRow}>
        {/* Font Family Picker */}
        <TypographyMenuPicker
          allowCustom
          accessibilityHint={FM('typography.fontHint')}
          accessibilityLabel={FM('typography.fontLabel', section.label, currentFontLabel)}
          bgColor={bgColor}
          borderColor={borderColor}
          currentLabel={currentFontLabel}
          disabled={disabled}
          label={FM('typography.font')}
          options={FONT_FAMILY_OPTIONS}
          testID={fontPickerTestId}
          textColor={textColor}
          textSecondary={textSecondary}
          onSelect={handleFontChange}
        />

        {/* Font Size Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: textSecondary }]}>
            {FM('typography.size')}
          </Text>
          <View
            style={[
              styles.numberInputContainer,
              { borderColor, backgroundColor: bgColor },
              disabled && styles.disabledInput,
            ]}
          >
            <TextInput
              accessibilityHint={FM('typography.sizeHint', String(limits.min), String(limits.max))}
              accessibilityLabel={FM('typography.sizeLabel', section.label)}
              editable={!disabled}
              keyboardType="numeric"
              maxLength={2}
              style={[styles.numberInput, { color: textColor }]}
              testID={sizeInputTestId}
              value={String(currentSize)}
              onChangeText={handleSizeChange}
            />
            <Text style={[styles.unitLabel, { color: textSecondary }]}>{FM('common.pxUnit')}</Text>
          </View>
        </View>

        {/* Font Weight Picker */}
        <TypographyMenuPicker
          accessibilityHint={FM('typography.weightHint')}
          accessibilityLabel={FM('typography.weightLabel', section.label, currentWeightLabel)}
          bgColor={bgColor}
          borderColor={borderColor}
          currentLabel={currentWeightLabel}
          disabled={disabled}
          label={FM('typography.weight')}
          options={FONT_WEIGHT_OPTIONS}
          testID={weightPickerTestId}
          textColor={textColor}
          textSecondary={textSecondary}
          onSelect={handleWeightChange}
        />
      </View>
    </View>
  );
};

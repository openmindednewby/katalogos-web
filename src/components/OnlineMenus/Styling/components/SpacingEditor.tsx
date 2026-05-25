


/**
 * SpacingEditor - Editor for menu spacing settings (padding and margins).
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import Slider from '@react-native-community/slider';
import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';

import type { RootState } from '../../../../store/reduxStore';
import type { SpacingSettings } from '../../../../types/menuStyleTypes';

// =============================================================================
// Props Interface
// =============================================================================

interface Props {
  value: SpacingSettings;
  onChange: (value: SpacingSettings) => void;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const MIN_SPACING = 0;
const MAX_SPACING = 48;
const SPACING_STEP = 4;
const DEFAULT_SPACING = 16;

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sliderRow: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
  },
  slider: {
    height: 40,
  },
});

// =============================================================================
// Component
// =============================================================================

const SpacingEditor: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const primaryColor = String(colors.primary);
  const borderColor = String(colors.border);

  const handleSpacingChange = useCallback(
    (key: keyof SpacingSettings, newValue: number) => {
      if (disabled) return;
      onChange({ ...value, [key]: Math.round(newValue) });
    },
    [disabled, onChange, value],
  );

  function renderSlider(
    key: keyof SpacingSettings,
    labelKey: string,
    testId: string,
  ): React.ReactElement {
    const currentValue = value[key] ?? DEFAULT_SPACING;

    return (
      <View style={styles.sliderRow}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: textColor }]}>
            {FM(labelKey)}
          </Text>
          <Text style={[styles.value, { color: textSecondary }]}>
            {currentValue}{FM('common.pxUnit')}
          </Text>
        </View>
        <Slider
          accessibilityHint={FM('spacing.sliderHint', key)}
          accessibilityLabel={FM(labelKey)}
          disabled={disabled}
          maximumTrackTintColor={borderColor}
          maximumValue={MAX_SPACING}
          minimumTrackTintColor={primaryColor}
          minimumValue={MIN_SPACING}
          step={SPACING_STEP}
          style={styles.slider}
          testID={testId}
          thumbTintColor={primaryColor}
          value={currentValue}
          onValueChange={(v) => handleSpacingChange(key, v)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container} testID={TestIds.SPACING_EDITOR}>
      {renderSlider('pagePadding', 'spacing.pagePadding', TestIds.SPACING_PAGE_PADDING_SLIDER)}
      {renderSlider('categorySpacing', 'spacing.categorySpacing', TestIds.SPACING_CATEGORY_SPACING_SLIDER)}
      {renderSlider('itemSpacing', 'spacing.itemSpacing', TestIds.SPACING_ITEM_SPACING_SLIDER)}
      {renderSlider('contentPadding', 'spacing.contentPadding', TestIds.SPACING_CONTENT_PADDING_SLIDER)}
    </View>
  );
};

export default SpacingEditor;

export { MIN_SPACING, MAX_SPACING, SPACING_STEP, DEFAULT_SPACING };

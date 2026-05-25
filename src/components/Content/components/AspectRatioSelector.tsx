/**
 * AspectRatioSelector - row of preset buttons for choosing crop aspect ratio.
 *
 * Renders four TouchableOpacity buttons: Square, Landscape, Classic, Free.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import { TestIds } from '../../../shared/testIds';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SELECTED_OPACITY = 1;
const UNSELECTED_OPACITY = 0.5;
const SELECTED_TEXT_COLOR = '#ffffff';
const UNSELECTED_BG_COLOR = 'transparent';

const BUTTON_ITEMS: readonly ButtonItem[] = [
  { preset: AspectRatioPreset.Square, labelKey: 'imageCrop.aspectSquare', hintKey: 'imageCrop.aspectSquareHint', testId: TestIds.CROP_ASPECT_SQUARE },
  { preset: AspectRatioPreset.Landscape, labelKey: 'imageCrop.aspectLandscape', hintKey: 'imageCrop.aspectLandscapeHint', testId: TestIds.CROP_ASPECT_LANDSCAPE },
  { preset: AspectRatioPreset.Classic, labelKey: 'imageCrop.aspectClassic', hintKey: 'imageCrop.aspectClassicHint', testId: TestIds.CROP_ASPECT_CLASSIC },
  { preset: AspectRatioPreset.Free, labelKey: 'imageCrop.aspectFree', hintKey: 'imageCrop.aspectFreeHint', testId: TestIds.CROP_ASPECT_FREE },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: UNSELECTED_BG_COLOR,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ButtonItem {
  preset: AspectRatioPreset;
  labelKey: string;
  hintKey: string;
  testId: string;
}

interface Props {
  selected: AspectRatioPreset;
  onSelect: (preset: AspectRatioPreset) => void;
  primaryColor: string;
  textColor: string;
  borderColor: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AspectRatioSelector = ({
  selected,
  onSelect,
  primaryColor,
  textColor,
  borderColor,
}: Props): React.ReactElement => (
  <View style={styles.container}>
    {BUTTON_ITEMS.map((item) => {
      const isSelected = item.preset === selected;
      return (
        <TouchableOpacity
          key={item.preset}
          accessibilityHint={FM(item.hintKey)}
          accessibilityLabel={FM(item.labelKey)}
          accessibilityRole="button"
          style={[
            styles.button,
            {
              borderColor: isSelected ? primaryColor : borderColor,
              opacity: isSelected ? SELECTED_OPACITY : UNSELECTED_OPACITY,
            },
            isSelected ? { backgroundColor: primaryColor } : undefined,
          ]}
          testID={item.testId}
          onPress={() => onSelect(item.preset)}
        >
          <Text style={[styles.label, { color: isSelected ? SELECTED_TEXT_COLOR : textColor }]}>
            {FM(item.labelKey)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default AspectRatioSelector;

/**
 * DietaryTagFilters - Renders filter chips for dietary tags.
 * Each chip toggles a dietary tag filter on/off.
 */
import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

// =============================================================================
// Constants
// =============================================================================

const CHIP_PADDING_HORIZONTAL = 14;
const CHIP_PADDING_VERTICAL = 8;
const CHIP_MARGIN_RIGHT = 8;
const CHIP_BORDER_WIDTH = 1;
const CHIP_FONT_SIZE = 14;
const ACTIVE_OPACITY = 0.15;
const SCROLL_PADDING_VERTICAL = 4;
const HEX_RADIX = 16;
const HEX_R_START = 1;
const HEX_R_END = 3;
const HEX_G_START = 3;
const HEX_G_END = 5;
const HEX_B_START = 5;
const HEX_B_END = 7;

// =============================================================================
// Props
// =============================================================================

interface DietaryTagFiltersProps {
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  theme: PublicMenuTheme;
}

// =============================================================================
// Helpers
// =============================================================================

/** Builds an RGBA background with the accent color at low opacity. */
function buildActiveBackground(accentHex: string): string {
  const r = parseInt(accentHex.slice(HEX_R_START, HEX_R_END), HEX_RADIX);
  const g = parseInt(accentHex.slice(HEX_G_START, HEX_G_END), HEX_RADIX);
  const b = parseInt(accentHex.slice(HEX_B_START, HEX_B_END), HEX_RADIX);
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(ACTIVE_OPACITY)})`;
}

// =============================================================================
// Component
// =============================================================================

export const DietaryTagFilters: React.FC<DietaryTagFiltersProps> = ({
  availableTags,
  selectedTags,
  onToggleTag,
  theme,
}) => {
  if (availableTags.length === 0) return null;

  const scrollStyle: ViewStyle = {
    paddingVertical: SCROLL_PADDING_VERTICAL,
  };

  const activeBackground = buildActiveBackground(theme.colors.accent);

  return (
    <View
      accessibilityHint={FM('publicMenu.filter.dietaryTagsHint')}
      accessibilityLabel={FM('publicMenu.filter.dietaryTagsLabel')}
      testID={TestIds.PUBLIC_MENU_DIETARY_FILTERS}
    >
      <ScrollView
        horizontal
        contentContainerStyle={scrollStyle}
        showsHorizontalScrollIndicator={false}
      >
        {availableTags.map((tag) => {
          const isActive = selectedTags.includes(tag);

          const chipStyle: ViewStyle = {
            paddingHorizontal: CHIP_PADDING_HORIZONTAL,
            paddingVertical: CHIP_PADDING_VERTICAL,
            borderRadius: theme.borders.cardRadius,
            borderWidth: CHIP_BORDER_WIDTH,
            borderColor: isActive ? theme.colors.accent : theme.colors.border,
            backgroundColor: isActive ? activeBackground : theme.colors.surface,
            marginRight: CHIP_MARGIN_RIGHT,
          };

          const chipTextStyle: TextStyle = {
            fontFamily: theme.typography.bodyFont,
            fontSize: CHIP_FONT_SIZE,
            color: isActive ? theme.colors.accent : theme.colors.textSecondary,
            fontWeight: isActive ? '600' : '400',
          };

          const label = isActive
            ? FM('publicMenu.filter.tagChipActiveLabel', tag)
            : FM('publicMenu.filter.tagChipInactiveLabel', tag);

          return (
            <TouchableOpacity
              key={tag}
              accessibilityHint={FM('publicMenu.filter.tagChipHint', tag)}
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
              style={chipStyle}
              testID={`${TestIds.DIETARY_TAG_FILTER_CHIP}-${tag}`}
              onPress={() => { onToggleTag(tag); }}
            >
              <Text style={chipTextStyle}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

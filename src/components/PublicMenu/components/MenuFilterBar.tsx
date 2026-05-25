/**
 * MenuFilterBar - Combined search bar, dietary tag filters, and clear button.
 * Wraps MenuSearchBar and DietaryTagFilters into a unified filter section.
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { DietaryTagFilters } from './DietaryTagFilters';
import { MenuSearchBar } from './MenuSearchBar';
import { TestIds } from '../../../shared/testIds';

import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

// =============================================================================
// Constants
// =============================================================================

const SECTION_GAP = 12;
const CLEAR_BUTTON_PADDING_HORIZONTAL = 14;
const CLEAR_BUTTON_PADDING_VERTICAL = 8;
const CLEAR_BUTTON_BORDER_WIDTH = 1;
const CLEAR_BUTTON_FONT_SIZE = 14;
const CLEAR_BUTTON_MARGIN_TOP = 8;

// =============================================================================
// Props
// =============================================================================

interface MenuFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  theme: PublicMenuTheme;
}

// =============================================================================
// Component
// =============================================================================

export const MenuFilterBar: React.FC<MenuFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  availableTags,
  selectedTags,
  onToggleTag,
  hasActiveFilters,
  onClearAll,
  theme,
}) => {
  const containerStyle: ViewStyle = {
    marginBottom: SECTION_GAP,
  };

  const tagSectionStyle: ViewStyle = {
    marginTop: SECTION_GAP,
  };

  const clearRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: CLEAR_BUTTON_MARGIN_TOP,
  };

  const clearButtonStyle: ViewStyle = {
    paddingHorizontal: CLEAR_BUTTON_PADDING_HORIZONTAL,
    paddingVertical: CLEAR_BUTTON_PADDING_VERTICAL,
    borderRadius: theme.borders.cardRadius,
    borderWidth: CLEAR_BUTTON_BORDER_WIDTH,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  };

  const clearTextStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: CLEAR_BUTTON_FONT_SIZE,
    color: theme.colors.textSecondary,
  };

  return (
    <View style={containerStyle} testID={TestIds.PUBLIC_MENU_FILTER_BAR}>
      <MenuSearchBar
        theme={theme}
        value={searchQuery}
        onChangeText={onSearchChange}
      />

      {availableTags.length > 0 ? (
        <View style={tagSectionStyle}>
          <DietaryTagFilters
            availableTags={availableTags}
            selectedTags={selectedTags}
            theme={theme}
            onToggleTag={onToggleTag}
          />
        </View>
      ) : null}

      {hasActiveFilters ? (
        <View style={clearRowStyle}>
          <TouchableOpacity
            accessibilityHint={FM('publicMenu.filter.clearAllHint')}
            accessibilityLabel={FM('publicMenu.filter.clearAllLabel')}
            style={clearButtonStyle}
            testID={TestIds.PUBLIC_MENU_CLEAR_ALL_FILTERS}
            onPress={onClearAll}
          >
            <Text style={clearTextStyle}>
              {FM('publicMenu.filter.clearAll')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

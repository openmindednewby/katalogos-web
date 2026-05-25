/**
 * MenuSearchBar - Search input for filtering public menu items by name.
 * Renders a themed text input with a search icon and a clear button.
 */
import React from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

// =============================================================================
// Constants
// =============================================================================

const INPUT_HEIGHT = 44;
const INPUT_PADDING_LEFT = 40;
const INPUT_PADDING_RIGHT = 16;
const INPUT_BORDER_WIDTH = 1;
const CLEAR_BUTTON_SIZE = 32;
const CLEAR_BUTTON_RADIUS = CLEAR_BUTTON_SIZE / 2;
const CLEAR_BUTTON_FONT_SIZE = 18;
const CLEAR_BUTTON_MARGIN_LEFT = 8;
const INPUT_FONT_SIZE = 16;
const SEARCH_ICON_FONT_SIZE = 18;
const SEARCH_ICON_LEFT = 12;
const UNICODE_MULTIPLY = '\u00D7';
const UNICODE_SEARCH = '\uD83D\uDD0D';

// =============================================================================
// Props
// =============================================================================

interface MenuSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  theme: PublicMenuTheme;
}

// =============================================================================
// Component
// =============================================================================

export const MenuSearchBar: React.FC<MenuSearchBarProps> = ({
  value,
  onChangeText,
  theme,
}) => {
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  };

  const searchIconStyle: TextStyle = {
    position: 'absolute',
    left: SEARCH_ICON_LEFT,
    fontSize: SEARCH_ICON_FONT_SIZE,
    color: theme.colors.textSecondary,
    zIndex: 1,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    height: INPUT_HEIGHT,
    paddingLeft: INPUT_PADDING_LEFT,
    paddingRight: INPUT_PADDING_RIGHT,
    borderWidth: INPUT_BORDER_WIDTH,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.cardRadius,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontFamily: theme.typography.bodyFont,
    fontSize: INPUT_FONT_SIZE,
  };

  const clearButtonStyle: ViewStyle = {
    width: CLEAR_BUTTON_SIZE,
    height: CLEAR_BUTTON_SIZE,
    borderRadius: CLEAR_BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: CLEAR_BUTTON_MARGIN_LEFT,
  };

  const clearTextStyle: TextStyle = {
    fontSize: CLEAR_BUTTON_FONT_SIZE,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  };

  const handleClear = (): void => {
    onChangeText('');
  };

  return (
    <View style={containerStyle}>
      <Text
        accessibilityHint={FM('publicMenu.search.searchIconHint')}
        accessibilityLabel={FM('publicMenu.search.searchIcon')}
        style={searchIconStyle}
        testID={TestIds.PUBLIC_MENU_SEARCH_ICON}
      >
        {UNICODE_SEARCH}
      </Text>
      <TextInput
        accessibilityHint={FM('publicMenu.filter.searchHint')}
        accessibilityLabel={FM('publicMenu.filter.searchLabel')}
        placeholder={FM('publicMenu.filter.searchPlaceholder')}
        placeholderTextColor={theme.colors.textSecondary}
        style={inputStyle}
        testID={TestIds.PUBLIC_MENU_SEARCH_INPUT}
        value={value}
        onChangeText={onChangeText}
      />
      {value !== '' ? (
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.filter.clearSearchHint')}
          accessibilityLabel={FM('publicMenu.filter.clearSearch')}
          style={clearButtonStyle}
          testID={TestIds.PUBLIC_MENU_SEARCH_CLEAR}
          onPress={handleClear}
        >
          <Text style={clearTextStyle}>{UNICODE_MULTIPLY}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

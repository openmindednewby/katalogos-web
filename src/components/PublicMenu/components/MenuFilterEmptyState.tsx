/**
 * MenuFilterEmptyState - Shown when no menu items match the active filters.
 * Displays a message and a hint to adjust filters.
 */
import React from 'react';

import { Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

// =============================================================================
// Constants
// =============================================================================

const CONTAINER_PADDING = 40;
const HINT_MARGIN_TOP = 8;

// =============================================================================
// Props
// =============================================================================

interface MenuFilterEmptyStateProps {
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
}

// =============================================================================
// Component
// =============================================================================

export const MenuFilterEmptyState: React.FC<MenuFilterEmptyStateProps> = ({
  theme,
  responsive,
}) => {
  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  };

  const messageStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  };

  const hintStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: HINT_MARGIN_TOP,
  };

  return (
    <View style={containerStyle} testID={TestIds.PUBLIC_MENU_FILTER_EMPTY_STATE}>
      <Text style={messageStyle}>
        {FM('publicMenu.filter.noResults')}
      </Text>
      <Text style={hintStyle}>
        {FM('publicMenu.filter.noResultsHint')}
      </Text>
    </View>
  );
};

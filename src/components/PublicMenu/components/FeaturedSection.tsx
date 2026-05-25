/**
 * FeaturedSection - Public display section for Staff Pick / Featured items.
 *
 * Renders a prominent section above regular categories showing
 * featured items with badges and optional staff notes.
 */
import React from 'react';

import { Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { FeaturedItemCard } from './FeaturedItemCard';
import { TestIds } from '../../../shared/testIds';

import type { MenuItem } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

// =============================================================================
// Constants
// =============================================================================

const TITLE_MARGIN_BOTTOM = 16;
const SECTION_MARGIN_BOTTOM = 24;
const SECTION_PADDING_VERTICAL = 16;
const ACCENT_BAR_WIDTH = 4;
const ACCENT_BAR_MARGIN_RIGHT = 12;

// =============================================================================
// Props
// =============================================================================

interface FeaturedSectionProps {
  items: MenuItem[];
  sectionTitle?: string | null;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
  onItemPress?: (item: MenuItem) => void;
}

// =============================================================================
// Component
// =============================================================================

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  items,
  sectionTitle,
  theme,
  responsive,
  onItemPress,
}) => {
  if (items.length === 0) return null;

  const title = sectionTitle ?? FM('featuredSection.defaultTitle');

  const sectionStyle: ViewStyle = {
    marginBottom: SECTION_MARGIN_BOTTOM,
    paddingVertical: SECTION_PADDING_VERTICAL,
    borderBottomWidth: theme.borders.showCategoryDividers ? theme.borders.dividerWidth : 0,
    borderBottomColor: theme.colors.divider,
  };

  const titleRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TITLE_MARGIN_BOTTOM,
  };

  const accentBarStyle: ViewStyle = {
    width: ACCENT_BAR_WIDTH,
    height: responsive.fontSizes.category,
    backgroundColor: theme.colors.accent,
    borderRadius: ACCENT_BAR_WIDTH / 2,
    marginRight: ACCENT_BAR_MARGIN_RIGHT,
  };

  const titleStyle: TextStyle = {
    fontFamily: theme.typography.headingFont,
    fontSize: responsive.fontSizes.category,
    fontWeight: theme.typography.categoryWeight,
    letterSpacing: theme.typography.headingLetterSpacing,
    color: theme.colors.text,
  };

  return (
    <View style={sectionStyle} testID={TestIds.FEATURED_SECTION}>
      <View style={titleRowStyle}>
        <View style={accentBarStyle} />
        <Text accessibilityRole="header" style={titleStyle} testID={TestIds.FEATURED_SECTION_TITLE}>
          {title}
        </Text>
      </View>

      {items.map((item, index) => {
        const itemKey = item.id ?? `featured-${index}`;
        return (
          <FeaturedItemCard
            key={itemKey}
            item={item}
            responsive={responsive}
            testIdSuffix={`${TestIds.FEATURED_ITEM_CARD}-${itemKey}`}
            theme={theme}
            onItemPress={onItemPress}
          />
        );
      })}
    </View>
  );
};

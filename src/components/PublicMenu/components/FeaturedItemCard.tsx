/**
 * FeaturedItemCard - Public display card for a featured / Staff Pick item.
 *
 * Shows a visually distinct card with accent border, Staff Pick badge,
 * item image, name, price, and optional staff note.
 * Tappable to open the item detail modal.
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import SeasonalBadge from './SeasonalBadge';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { ContentImage } from '../../Content';

import type { MenuItem } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

// =============================================================================
// Constants
// =============================================================================

const ACCENT_BORDER_WIDTH = 2;
const BADGE_PADDING_HORIZONTAL = 10;
const BADGE_PADDING_VERTICAL = 4;
const BADGE_BORDER_RADIUS = 12;
const BADGE_FONT_SIZE = 11;
const HEADER_MARGIN_BOTTOM = 8;
const NAME_MARGIN_RIGHT = 12;
const NOTE_MARGIN_TOP = 6;
const IMAGE_HEIGHT = 100;
const IMAGE_MARGIN_BOTTOM = 10;
const PRICE_DECIMALS = 2;
const BADGE_TEXT_COLOR = '#ffffff';
const BADGE_LETTER_SPACING = 0.5;

// =============================================================================
// Props
// =============================================================================

interface FeaturedItemCardProps {
  item: MenuItem;
  testIdSuffix: string;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
  onItemPress?: (item: MenuItem) => void;
}

// =============================================================================
// Component
// =============================================================================

export const FeaturedItemCard: React.FC<FeaturedItemCardProps> = ({
  item,
  testIdSuffix,
  theme,
  responsive,
  onItemPress,
}) => {
  const itemName = item.name ?? '';
  const itemPrice = item.price ?? 0;
  const staffNote = item.staffNote;
  const priceFormatted = `$${itemPrice.toFixed(PRICE_DECIMALS)}`;

  const itemBackgroundColor =
    isValueDefined(item.backgroundColor) && item.backgroundColor !== ''
      ? String(item.backgroundColor)
      : theme.colors.surface;

  const cardStyle: ViewStyle = {
    backgroundColor: itemBackgroundColor,
    borderColor: theme.colors.accent,
    borderWidth: ACCENT_BORDER_WIDTH,
    borderRadius: theme.borders.cardRadius,
    padding: responsive.spacing.cardPadding,
    marginBottom: responsive.spacing.itemGap,
  };

  const badgeStyle: ViewStyle = {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
    alignSelf: 'flex-start',
    marginBottom: HEADER_MARGIN_BOTTOM,
  };

  const badgeTextStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '700',
    color: BADGE_TEXT_COLOR,
    textTransform: 'uppercase',
    letterSpacing: BADGE_LETTER_SPACING,
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: HEADER_MARGIN_BOTTOM,
  };

  const nameStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.itemName,
    fontWeight: theme.typography.itemNameWeight,
    color: theme.colors.text,
    flex: 1,
    marginRight: NAME_MARGIN_RIGHT,
  };

  const priceStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.itemPrice,
    fontWeight: theme.typography.priceWeight,
    color: theme.colors.accent,
  };

  const noteStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginTop: NOTE_MARGIN_TOP,
  };

  const imageStyle: ViewStyle = {
    marginBottom: IMAGE_MARGIN_BOTTOM,
    borderRadius: theme.borders.cardRadius,
  };

  const cardContent = (
    <>
      <View style={badgeStyle} testID={TestIds.FEATURED_ITEM_BADGE}>
        <Text style={badgeTextStyle}>
          {FM('featuredSection.staffPickBadge')}
        </Text>
      </View>

      <ContentImage
        isPublic
        accessibilityHint={FM('publicMenu.itemDetail.imageHint', itemName)}
        accessibilityLabel={FM('publicMenu.itemDetail.imageAlt', itemName)}
        contentId={item.imageContentId}
        height={IMAGE_HEIGHT}
        style={imageStyle}
        testID={`${testIdSuffix}-image`}
      />

      <View style={headerRowStyle}>
        <Text style={nameStyle}>{itemName}</Text>
        <Text style={priceStyle}>{priceFormatted}</Text>
      </View>

      {isValueDefined(staffNote) && staffNote !== '' ? (
        <Text style={noteStyle} testID={TestIds.FEATURED_ITEM_STAFF_NOTE}>
          {String(staffNote)}
        </Text>
      ) : null}
      <SeasonalBadge
        availableFrom={item.availableFrom}
        availableTo={item.availableTo}
        primaryColor={theme.colors.accent}
        textOnPrimary={BADGE_TEXT_COLOR}
      />
    </>
  );

  if (isValueDefined(onItemPress)) 
    return (
      <TouchableOpacity
        accessibilityHint={FM('publicMenu.itemDetail.itemPressHint', itemName)}
        accessibilityLabel={FM('publicMenu.itemDetail.itemPressLabel', itemName, priceFormatted)}
        accessibilityRole="button"
        activeOpacity={0.7}
        style={cardStyle}
        testID={testIdSuffix}
        onPress={() => onItemPress(item)}
      >
        {cardContent}
      </TouchableOpacity>
    );
  

  return (
    <View style={cardStyle} testID={testIdSuffix}>
      {cardContent}
    </View>
  );
};

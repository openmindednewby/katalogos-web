import React, { useCallback } from 'react';

import { Platform, Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import SeasonalBadge from './SeasonalBadge';
import { isValueDefined } from '../../../utils/is';
import { ContentImage, ContentVideo } from '../../Content';

import type { MenuItem } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

interface ItemMeta {
  itemId: string;
  menuId: string;
  categoryName: string;
}

interface MenuItemDisplayProps {
  item: MenuItem;
  testIdSuffix: string;
  defaultItemLabel: string;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
  categoryName?: string;
  menuId?: string;
  observeItem?: (element: HTMLElement | null, meta: ItemMeta) => void;
  onItemPress?: (item: MenuItem) => void;
}

const ITEM_IMAGE_HEIGHT = 120;
const ITEM_VIDEO_HEIGHT = 150;
const HEADER_MARGIN_BOTTOM = 8;
const NAME_MARGIN_RIGHT = 12;
const MEDIA_MARGIN_BOTTOM = 10;
const PRICE_DECIMALS = 2;
const SEASONAL_BADGE_TEXT_COLOR = '#ffffff';

function applyTrackingDataset(element: HTMLElement, itemId: string): void {
  Object.assign(element.dataset, { trackItemId: itemId });
}

/**
 * Renders a single themed menu item card with image, video,
 * name, price, and description. Tappable to open item detail modal.
 */
export const MenuItemDisplay: React.FC<MenuItemDisplayProps> = ({
  item,
  testIdSuffix,
  defaultItemLabel,
  theme,
  responsive,
  categoryName,
  menuId,
  observeItem,
  onItemPress,
}) => {
  const itemName = item.name ?? defaultItemLabel;
  const itemDescription = item.description;
  const itemPrice = item.price ?? 0;
  const itemId = String(item.id ?? '');

  const hasTrackingProps = isValueDefined(observeItem) && isValueDefined(menuId);
  const canTrack = hasTrackingProps && itemId !== '';
  const refCallback = useCallback(
    (element: unknown): void => {
      if (!canTrack || !isValueDefined(element)) return;
      if (Platform.OS !== 'web') return;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- React Native Web refs are HTMLElements
      const htmlEl = element as HTMLElement;
      applyTrackingDataset(htmlEl, itemId);
      observeItem(htmlEl, { itemId, menuId: String(menuId), categoryName: String(categoryName) });
    },
    [canTrack, observeItem, menuId, itemId, categoryName],
  );

  // Item-level styling overrides
  const itemBackgroundColor =
    isValueDefined(item.backgroundColor) && item.backgroundColor !== ''
      ? String(item.backgroundColor)
      : theme.colors.surface;
  const itemTextColor =
    isValueDefined(item.textColor) && item.textColor !== ''
      ? String(item.textColor)
      : theme.colors.text;

  const cardStyle: ViewStyle = {
    backgroundColor: itemBackgroundColor,
    borderColor: theme.colors.border,
    borderWidth: theme.borders.cardBorderWidth,
    borderRadius: theme.borders.cardRadius,
    padding: responsive.spacing.cardPadding,
    marginBottom: responsive.spacing.itemGap,
  };

  const nameStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.itemName,
    fontWeight: theme.typography.itemNameWeight,
    color: itemTextColor,
    flex: 1,
    marginRight: NAME_MARGIN_RIGHT,
  };

  const priceStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.itemPrice,
    fontWeight: theme.typography.priceWeight,
    color: theme.colors.accent,
  };

  const descriptionStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    letterSpacing: theme.typography.bodyLetterSpacing,
    lineHeight: responsive.fontSizes.description * theme.typography.bodyLineHeight,
    color: theme.colors.textSecondary,
  };

  const mediaStyle: ViewStyle = { marginBottom: MEDIA_MARGIN_BOTTOM, borderRadius: theme.borders.cardRadius };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: HEADER_MARGIN_BOTTOM,
  };

  const priceFormatted = `$${itemPrice.toFixed(PRICE_DECIMALS)}`;

  const content = (
    <>
      <ContentImage
        isPublic
        accessibilityHint={FM('publicMenu.itemDetail.imageHint', itemName)}
        accessibilityLabel={FM('publicMenu.itemDetail.imageAlt', itemName)}
        contentId={item.imageContentId}
        height={ITEM_IMAGE_HEIGHT}
        style={mediaStyle}
        testID={`${testIdSuffix}-image`}
      />
      <ContentVideo
        isPublic
        accessibilityHint={FM('publicMenu.itemDetail.imageHint', itemName)}
        accessibilityLabel={itemName}
        contentId={item.videoContentId}
        height={ITEM_VIDEO_HEIGHT}
        style={mediaStyle}
        testID={`${testIdSuffix}-video`}
      />
      <View style={headerRowStyle}>
        <Text style={nameStyle}>{itemName}</Text>
        <Text style={priceStyle}>{priceFormatted}</Text>
      </View>
      {isValueDefined(itemDescription) && itemDescription !== '' ? (
        <Text style={descriptionStyle}>
          {String(itemDescription)}
        </Text>
      ) : null}
      <SeasonalBadge
        availableFrom={item.availableFrom}
        availableTo={item.availableTo}
        primaryColor={theme.colors.accent}
        textOnPrimary={SEASONAL_BADGE_TEXT_COLOR}
      />
    </>
  );

  if (isValueDefined(onItemPress))
    return (
      <TouchableOpacity
        ref={refCallback}
        accessibilityHint={FM('publicMenu.itemDetail.itemPressHint', itemName)}
        accessibilityLabel={FM('publicMenu.itemDetail.itemPressLabel', itemName, priceFormatted)}
        accessibilityRole="button"
        activeOpacity={0.7}
        style={cardStyle}
        testID={testIdSuffix}
        onPress={() => onItemPress(item)}
      >
        {content}
      </TouchableOpacity>
    );


  return (
    <View ref={refCallback} style={cardStyle} testID={testIdSuffix}>
      {content}
    </View>
  );
};

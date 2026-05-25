/**
 * MenuItemDisplay - Renders a single menu item with applied styling.
 */
import React, { useMemo } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import AvailabilityBadge from './AvailabilityBadge';
import ItemImage from './ItemImage';
import ItemPrice from './ItemPrice';
import VariantModifierDisplay from './VariantModifierDisplay';
import MediaPosition from '../../../../types/enums/MediaPosition';
import PricePosition from '../../../../types/enums/PricePosition';
import { isValueDefined } from '../../../../utils/is';
import { DEFAULT_COLOR_SCHEME } from '../../../../utils/menuDefaults';
import { ContentImage } from '../../../Content';
import { hasVariants, getMinVariantPrice } from '../../utils/variantModifierHelpers';
import {
  getMediaPosition, isHorizontalLayout,
  getTextColor, getBackgroundColor, resolveItemDisplayProps,
} from '../utils/menuItemDisplayHelpers';
import {
  styles, DEFAULT_BORDER_RADIUS, DEFAULT_PADDING,
  DEFAULT_NAME_FONT_SIZE, DEFAULT_DESCRIPTION_FONT_SIZE,
} from '../utils/menuItemDisplayStyles';

import type { MenuItem, MenuContents } from '../../../../types/menuTypes';

export interface MenuItemDisplayProps {
  item: MenuItem;
  globalStyles?: MenuContents;
  onPress?: () => void;
  testID?: string;
  isPublic?: boolean;
}

export const MenuItemDisplay: React.FC<MenuItemDisplayProps> = ({
  item,
  globalStyles,
  onPress,
  testID = 'menu-item-display',
  isPublic = false,
}) => {
  const { itemName, itemDescription, itemPrice, isAvailable, hasImage, hasDescription } =
    resolveItemDisplayProps(item);

  const itemHasVariants = hasVariants(item);
  const minVariantPrice = getMinVariantPrice(item);
  const displayPrice = minVariantPrice ?? itemPrice;
  const showFromPrefix = itemHasVariants && isValueDefined(minVariantPrice);

  const mediaPosition = getMediaPosition(item);
  const textColor = getTextColor(item, globalStyles);
  const backgroundColor = getBackgroundColor(item, globalStyles);
  const isBackground = mediaPosition === MediaPosition.Background;
  const isHorizontal = isHorizontalLayout(mediaPosition);

  const containerStyle = useMemo<StyleProp<ViewStyle>>(() => {
    const borderWidth = item.styling?.borderWidth ?? 1;
    const borderColor = item.styling?.borderColor ?? globalStyles?.colorScheme?.border ?? DEFAULT_COLOR_SCHEME.border;
    const borderRadius = item.styling?.borderRadius ?? DEFAULT_BORDER_RADIUS;
    const padding = item.styling?.padding ?? DEFAULT_PADDING;

    return [
      styles.container,
      { backgroundColor, borderWidth, borderColor, borderRadius, padding },
      isBackground && styles.containerBackground,
    ];
  }, [item.styling, globalStyles, backgroundColor, isBackground]);

  const nameStyle = useMemo<StyleProp<TextStyle>>(() => {
    const fontSize = item.typography?.nameFontSize ?? DEFAULT_NAME_FONT_SIZE;
    const fontWeight = item.typography?.nameFontWeight ?? '600';
    const color = item.typography?.nameColor ?? textColor;
    return [styles.itemName, { fontSize, fontWeight, color }];
  }, [item.typography, textColor]);

  const descriptionStyle = useMemo<StyleProp<TextStyle>>(() => {
    const fontSize = item.typography?.descriptionFontSize ?? DEFAULT_DESCRIPTION_FONT_SIZE;
    const fontWeight = item.typography?.descriptionFontWeight ?? 'normal';
    const color = item.typography?.descriptionColor ?? textColor;
    return [styles.itemDescription, { fontSize, fontWeight, color }];
  }, [item.typography, textColor]);

  const pricePosition = item.priceStyle?.position ?? PricePosition.Right;
  const showPriceInHeader = pricePosition === PricePosition.Right;
  const showPriceBelowName = pricePosition === PricePosition.BelowName;
  const showPriceBelowDesc = pricePosition === PricePosition.BelowDescription;
  const layoutStyle = isHorizontal && !isBackground ? styles.horizontalLayout : styles.verticalLayout;

  const renderContent = (): React.ReactElement => (
    <View style={[styles.contentWrapper, layoutStyle]}>
      {hasImage && !isBackground ? <ItemImage
          contentId={item.imageContentId}
          isPublic={isPublic}
          itemName={itemName}
          position={mediaPosition}
          settings={item.imageSettings}
          testID={`${testID}-image`}
        /> : null}
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text
            accessibilityHint={FM('onlineMenus.menuItemNameHint', itemName)}
            accessibilityLabel={itemName}
            style={nameStyle}
            testID={`${testID}-name`}
          >
            {itemName}
          </Text>
          {showPriceInHeader ? <ItemPrice
              isAvailable={isAvailable}
              price={displayPrice}
              priceStyle={item.priceStyle}
              showFromPrefix={showFromPrefix}
              testID={`${testID}-price`}
              textColor={textColor}
            /> : null}
        </View>
        {showPriceBelowName ? <ItemPrice
            isAvailable={isAvailable}
            price={displayPrice}
            priceStyle={item.priceStyle}
            showFromPrefix={showFromPrefix}
            testID={`${testID}-price`}
            textColor={textColor}
          /> : null}
        {hasDescription ? <Text
            accessibilityHint={FM('onlineMenus.menuItemDescHint', String(itemDescription))}
            accessibilityLabel={String(itemDescription)}
            numberOfLines={item.typography?.descriptionMaxLines}
            style={descriptionStyle}
            testID={`${testID}-description`}
          >
            {String(itemDescription)}
          </Text> : null}
        {showPriceBelowDesc ? <ItemPrice
            isAvailable={isAvailable}
            price={displayPrice}
            priceStyle={item.priceStyle}
            showFromPrefix={showFromPrefix}
            testID={`${testID}-price`}
            textColor={textColor}
          /> : null}
        <VariantModifierDisplay item={item} testID={testID} textColor={textColor} />
      </View>
    </View>
  );

  const WrapperComponent = isValueDefined(onPress) ? TouchableOpacity : View;

  return (
    <WrapperComponent
      accessibilityHint={onPress ? FM('onlineMenus.menuItemTapHint', itemName) : undefined}
      accessibilityLabel={itemName}
      accessibilityRole={onPress ? 'button' : undefined}
      style={containerStyle}
      testID={testID}
      onPress={onPress}
    >
      {isBackground && hasImage ? <View style={styles.backgroundImage}>
          <ContentImage
            accessibilityHint={FM('onlineMenus.menuItemBgImageHint', itemName)}
            accessibilityLabel={FM('onlineMenus.menuItemBgImageLabel', itemName)}
            contentId={item.imageContentId}
            height="100%"
            isPublic={isPublic}
            testID={`${testID}-bg-image`}
          />
        </View> : null}
      {renderContent()}
      <AvailabilityBadge
        badgeStyle={item.availabilityBadge}
        isAvailable={isAvailable}
        testID={`${testID}-badge`}
      />
    </WrapperComponent>
  );
};

export default MenuItemDisplay;

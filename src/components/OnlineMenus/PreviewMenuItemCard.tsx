/**
 * MenuItemCard - Renders a single menu item in the preview.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { getMinVariantPrice, hasVariants } from './utils/variantModifierHelpers';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import { ContentImage, ContentVideo } from '../Content';

import type { MenuItem } from '../../types/menuTypes';

const styles = StyleSheet.create({
  menuItemCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemImage: {
    marginBottom: 8,
  },
  itemVideo: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 13,
  },
});

interface MenuItemCardProps {
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
  categoryTextColor: string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categoryIndex,
  itemIndex,
  categoryTextColor,
}) => {
  const itemName = item.name ?? FM('onlineMenus.item');
  const itemDescription = item.description;
  const basePrice = item.price ?? 0;
  const minVariantPrice = getMinVariantPrice(item);
  const itemHasVariants = hasVariants(item);
  const displayPrice = minVariantPrice ?? basePrice;

  // Item-level styling (overrides category-level)
  const hasCustomBackground = isValueDefined(item.backgroundColor);
  const itemBackgroundColor = hasCustomBackground ? String(item.backgroundColor) : 'transparent';
  const hasCustomTextColor = isValueDefined(item.textColor);
  const itemTextColor = hasCustomTextColor ? String(item.textColor) : categoryTextColor;

  const hasDescription = isValueDefined(itemDescription);

  return (
    <View style={[styles.menuItemCard, { backgroundColor: itemBackgroundColor, borderColor: itemTextColor }]}>
      <ContentImage
        accessibilityHint={FM('onlineMenus.previewCard.itemImageHint', itemName)}
        accessibilityLabel={FM('onlineMenus.previewCard.itemImageLabel', itemName)}
        contentId={item.imageContentId}
        height={100}
        style={styles.itemImage}
        testID={`${TestIds.CONTENT_IMAGE_MENU_ITEM}-${categoryIndex}-${itemIndex}`}
      />
      <ContentVideo
        accessibilityHint={FM('onlineMenus.previewCard.itemVideoHint', itemName)}
        accessibilityLabel={FM('onlineMenus.previewCard.itemVideoLabel', itemName)}
        contentId={item.videoContentId}
        height={120}
        style={styles.itemVideo}
        testID={`${TestIds.CONTENT_VIDEO_MENU_ITEM}-${categoryIndex}-${itemIndex}`}
      />
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: itemTextColor }]}>{itemName}</Text>
        <Text style={[styles.itemPrice, { color: itemTextColor }]}>
          {itemHasVariants
            ? FM('onlineMenus.variants.fromPrice', `$${displayPrice.toFixed(2)}`)
            : `$${displayPrice.toFixed(2)}`}
        </Text>
      </View>
      {hasDescription ? (
        <Text style={[styles.itemDescription, { color: itemTextColor }]}>{String(itemDescription)}</Text>
      ) : null}
    </View>
  );
};

export default MenuItemCard;

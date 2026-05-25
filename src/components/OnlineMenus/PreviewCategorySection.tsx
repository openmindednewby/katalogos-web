/**
 * CategorySection - Renders a menu category with its items in the preview.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import { ContentImage, ContentVideo } from '../Content';
import MenuItemCard from './PreviewMenuItemCard';

import type { Category } from '../../types/menuTypes';

const styles = StyleSheet.create({
  categorySection: {
    marginBottom: 24,
  },
  categoryImage: {
    marginBottom: 12,
  },
  categoryVideo: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 40,
  },
});

interface CategorySectionProps {
  category: Category;
  categoryIndex: number;
  menuTextColor: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  categoryIndex,
  menuTextColor,
}) => {
  const categoryName = category.name ?? FM('onlineMenus.category');
  const categoryDescription = category.description;

  // Category-level styling (overrides menu-level)
  const hasCustomTextColor = isValueDefined(category.textColor);
  const categoryTextColor = hasCustomTextColor ? String(category.textColor) : menuTextColor;

  const items = category.items ?? [];
  const availableItems = items.filter((item) => item.isAvailable !== false);

  const hasDescription = isValueDefined(categoryDescription);

  return (
    <View style={styles.categorySection}>
      <ContentImage
        accessibilityHint={FM('accessibility.categoryImageHint', categoryName)}
        accessibilityLabel={FM('accessibility.categoryImageAlt', categoryName)}
        contentId={category.imageContentId}
        height={120}
        style={styles.categoryImage}
        testID={`${TestIds.CONTENT_IMAGE_CATEGORY}-${categoryIndex}`}
      />
      <ContentVideo
        accessibilityHint={FM('accessibility.categoryVideoHint', categoryName)}
        accessibilityLabel={FM('accessibility.categoryVideoAlt', categoryName)}
        contentId={category.videoContentId}
        height={150}
        style={styles.categoryVideo}
        testID={`${TestIds.CONTENT_VIDEO_CATEGORY}-${categoryIndex}`}
      />
      <Text style={[styles.categoryTitle, { color: categoryTextColor }]}>{categoryName}</Text>
      {hasDescription ? (
        <Text style={[styles.categoryDescription, { color: categoryTextColor }]}>{String(categoryDescription)}</Text>
      ) : null}

      {availableItems.length === 0 ? (
        <Text style={[styles.emptyText, { color: categoryTextColor }]}>
          {FM('onlineMenus.messages.noItems')}
        </Text>
      ) : (
        availableItems.map((item, itemIndex) => (
          <MenuItemCard
            key={item.name ?? itemIndex}
            categoryIndex={categoryIndex}
            categoryTextColor={categoryTextColor}
            item={item}
            itemIndex={itemIndex}
          />
        ))
      )}
    </View>
  );
};

export default CategorySection;

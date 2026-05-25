import React from 'react';

import { Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { MenuItemDisplay } from './MenuItemDisplay';
import { isValueDefined } from '../../../utils/is';
import { ContentImage, ContentVideo } from '../../Content';

import type { Category, MenuItem } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

interface ItemMeta {
  itemId: string;
  menuId: string;
  categoryName: string;
}

interface CategorySectionProps {
  category: Category;
  testIdSuffix: string;
  defaultCategoryLabel: string;
  defaultItemLabel: string;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
  isLast: boolean;
  menuId?: string;
  observeItem?: (element: HTMLElement | null, meta: ItemMeta) => void;
  onItemPress?: (item: MenuItem) => void;
  /** @deprecated Use theme prop instead */
  menuTextColor?: string;
  /** @deprecated Use theme prop instead */
  borderColor?: string;
}

const CATEGORY_IMAGE_HEIGHT = 150;
const CATEGORY_VIDEO_HEIGHT = 180;
const TITLE_MARGIN_BOTTOM = 8;
const DESCRIPTION_MARGIN_BOTTOM = 16;

/**
 * Renders a themed category section with image, video, title,
 * description, and menu items.
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  testIdSuffix,
  defaultCategoryLabel,
  defaultItemLabel,
  theme,
  responsive,
  isLast,
  menuId,
  observeItem,
  onItemPress,
}) => {
  const categoryName = category.name ?? defaultCategoryLabel;
  const categoryDescription = category.description;

  // Category-level text color override
  const categoryTextColor =
    isValueDefined(category.textColor) && category.textColor !== ''
      ? String(category.textColor)
      : theme.colors.text;

  const items = category.items ?? [];
  const availableItems = items.filter((item) => item.isAvailable !== false);

  if (availableItems.length === 0)
    return null;

  const sectionStyle: ViewStyle = {
    marginBottom: isLast ? 0 : responsive.spacing.sectionGap,
    ...(theme.borders.showCategoryDividers && !isLast
      ? {
        borderBottomWidth: theme.borders.dividerWidth,
        borderBottomColor: theme.colors.divider,
        paddingBottom: responsive.spacing.sectionGap,
      }
      : {}),
  };

  const titleStyle: TextStyle = {
    fontFamily: theme.typography.headingFont,
    fontSize: responsive.fontSizes.category,
    fontWeight: theme.typography.categoryWeight,
    letterSpacing: theme.typography.headingLetterSpacing,
    color: categoryTextColor,
    marginBottom: TITLE_MARGIN_BOTTOM,
  };

  const descriptionStyle: TextStyle = {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    letterSpacing: theme.typography.bodyLetterSpacing,
    lineHeight: responsive.fontSizes.description * theme.typography.bodyLineHeight,
    color: theme.colors.textSecondary,
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
  };

  const hasIcon = isValueDefined(category.icon) && category.icon !== '';
  const mediaStyle: ViewStyle = { marginBottom: 12, borderRadius: theme.borders.cardRadius };

  return (
    <View style={sectionStyle} testID={testIdSuffix}>
      <ContentImage
        isPublic
        accessibilityHint={FM('accessibility.categoryImageHint', categoryName)}
        accessibilityLabel={FM('accessibility.categoryImageAlt', categoryName)}
        contentId={category.imageContentId}
        height={CATEGORY_IMAGE_HEIGHT}
        style={mediaStyle}
        testID={`${testIdSuffix}-image`}
      />
      <ContentVideo
        isPublic
        accessibilityHint={FM('accessibility.categoryVideoHint', categoryName)}
        accessibilityLabel={FM('accessibility.categoryVideoAlt', categoryName)}
        contentId={category.videoContentId}
        height={CATEGORY_VIDEO_HEIGHT}
        style={mediaStyle}
        testID={`${testIdSuffix}-video`}
      />
      <Text accessibilityRole="header" style={titleStyle}>
        {hasIcon ? `${category.icon} ${categoryName}` : categoryName}
      </Text>
      {isValueDefined(categoryDescription) && categoryDescription !== '' ? (
        <Text style={descriptionStyle}>
          {String(categoryDescription)}
        </Text>
      ) : null}

      {availableItems.map((item, index) => {
        const itemKey = item.id ?? `item-${index}`;
        return (
          <MenuItemDisplay
            key={itemKey}
            categoryName={categoryName}
            defaultItemLabel={defaultItemLabel}
            item={item}
            menuId={menuId}
            observeItem={observeItem}
            responsive={responsive}
            testIdSuffix={`${testIdSuffix}-${itemKey}`}
            theme={theme}
            onItemPress={onItemPress}
          />
        );
      })}
    </View>
  );
};




// =============================================================================
// Types & Helpers
// =============================================================================

/**
 * CategoryRenderer - Sub-components for rendering categories and their items
 * within MenuContentView.
 *
 * Extracted from MenuContentView.tsx to keep file sizes under 200 lines.
 */
import React from 'react';

import { Platform, Text, View } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { MenuItemDisplay } from './MenuItemDisplay';
import { TestIds } from '../../../../shared/testIds';
import ItemLayoutType from '../../../../types/enums/ItemLayoutType';
import { isValueDefined } from '../../../../utils/is';
import {
  DEFAULT_COLOR_SCHEME,
  DEFAULT_HEADER,
  DEFAULT_LAYOUT,
  DEFAULT_SPACING,
  DEFAULT_TYPOGRAPHY,
} from '../../../../utils/menuDefaults';
import { menuContentViewStyles } from '../utils/menuContentViewStyles';


import type { Category, MenuContents, MenuItem } from '../../../../types/menuTypes';

interface MergedStyles {
  colorScheme: Required<typeof DEFAULT_COLOR_SCHEME>;
  typography: Required<typeof DEFAULT_TYPOGRAPHY>;
  layout: Required<typeof DEFAULT_LAYOUT>;
  header: Required<typeof DEFAULT_HEADER>;
  spacing: Required<typeof DEFAULT_SPACING>;
}

interface CategoryRendererProps {
  category: Category;
  categoryIndex: number;
  isLast: boolean;
  contents: MenuContents;
  onItemPress?: (category: Category, item: MenuItem) => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_FONT_SIZE_TITLE = 24;
const DEFAULT_FONT_SIZE_BODY = 14;
const DEFAULT_SHADOW_RADIUS = 4;
const DEFAULT_SHADOW_COLOR = '#000000';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Gets merged styling with defaults.
 */
export function getMergedStyles(contents: MenuContents): MergedStyles {
  return {
    colorScheme: { ...DEFAULT_COLOR_SCHEME, ...contents.colorScheme },
    typography: { ...DEFAULT_TYPOGRAPHY, ...contents.typography },
    layout: { ...DEFAULT_LAYOUT, ...contents.layout },
    header: { ...DEFAULT_HEADER, ...contents.header },
    spacing: { ...DEFAULT_SPACING, ...contents.spacing },
  };
}

/**
 * Filters categories to only include those with available items.
 */
export function getVisibleCategories(categories: Category[] | undefined): Category[] {
  if (!categories) return [];

  return categories.filter((category) => {
    const items = category.items ?? [];
    return items.some((item) => item.isAvailable !== false);
  });
}

function buildCategoryTitleStyle(category: Category, styles: MergedStyles, textColor: string): TextStyle {
  const titleFontSize = category.typography?.titleFontSize ?? styles.typography.titleFontSize;
  const titleFontWeight = category.typography?.titleFontWeight ?? styles.typography.titleFontWeight;
  return {
    fontSize: isValueDefined(titleFontSize) ? titleFontSize : DEFAULT_FONT_SIZE_TITLE,
    fontWeight: isValueDefined(titleFontWeight) ? titleFontWeight : 'bold',
    color: category.typography?.titleColor ?? textColor,
  };
}

function buildCategoryDescriptionStyle(category: Category, styles: MergedStyles): TextStyle {
  const descriptionFontSize = category.typography?.descriptionFontSize ?? styles.typography.bodyFontSize;
  return {
    fontSize: isValueDefined(descriptionFontSize) ? descriptionFontSize : DEFAULT_FONT_SIZE_BODY,
    fontWeight: category.typography?.descriptionFontWeight ?? 'normal',
    color: category.typography?.descriptionColor ?? styles.colorScheme.textSecondary,
  };
}

function buildCategorySectionStyle(category: Category, styles: MergedStyles): ViewStyle {
  const boxStyle = category.styling ?? {};
  const sectionStyle: ViewStyle = {
    padding: boxStyle.padding ?? styles.spacing.contentPadding,
    marginBottom: styles.spacing.categorySpacing,
    borderRadius: boxStyle.borderRadius ?? 0,
    borderWidth: boxStyle.borderWidth ?? 0,
    borderColor: boxStyle.borderColor ?? styles.colorScheme.border,
  };

  const hasShadow = boxStyle.shadowEnabled === true;
  if (hasShadow) {
    const shadowBlur = boxStyle.shadowBlur ?? DEFAULT_SHADOW_RADIUS;
    if (Platform.OS === 'web') 
      sectionStyle.boxShadow = `0px 2px ${shadowBlur}px rgba(0, 0, 0, 0.1)`;
     else {
      sectionStyle.shadowColor = boxStyle.shadowColor ?? DEFAULT_SHADOW_COLOR;
      sectionStyle.shadowOffset = { width: 0, height: 2 };
      sectionStyle.shadowOpacity = 0.1;
      sectionStyle.shadowRadius = shadowBlur;
    }
    sectionStyle.elevation = 2;
  }

  return sectionStyle;
}

// =============================================================================
// Sub-Component: Category Items List
// =============================================================================

interface CategoryItemsProps {
  category: Category;
  categoryIndex: number;
  contents: MenuContents;
  onItemPress?: (category: Category, item: MenuItem) => void;
}

const CategoryItems: React.FC<CategoryItemsProps> = ({
  category,
  categoryIndex,
  contents,
  onItemPress,
}) => {
  const styles = getMergedStyles(contents);
  const items = category.items ?? [];
  const availableItems = items.filter((item) => item.isAvailable !== false);
  const isGridLayout = styles.layout.itemLayout === ItemLayoutType.Grid || styles.layout.itemLayout === ItemLayoutType.Cards;

  const containerStyle = isGridLayout
    ? menuContentViewStyles.itemsRow
    : menuContentViewStyles.itemsContainer;

  function createItemPressHandler(item: MenuItem): () => void {
    return () => {
      if (onItemPress) onItemPress(category, item);
    };
  }

  return (
    <View style={containerStyle}>
      {availableItems.map((item, itemIndex) => (
        <MenuItemDisplay
          key={item.id ?? `item-${categoryIndex}-${itemIndex}`}
          isPublic
          globalStyles={contents}
          item={item}
          testID={`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-${categoryIndex}-${itemIndex}`}
          onPress={isValueDefined(onItemPress) ? createItemPressHandler(item) : undefined}
        />
      ))}
    </View>
  );
};

// =============================================================================
// Sub-Component: Category Section Renderer
// =============================================================================

export const CategoryRenderer: React.FC<CategoryRendererProps> = ({
  category,
  categoryIndex,
  isLast,
  contents,
  onItemPress,
}) => {
  const styles = getMergedStyles(contents);
  const categoryName = category.name ?? FM('onlineMenus.unnamedCategory');
  const categoryDescription = category.description;

  const textColor = isValueDefined(category.textColor)
    ? String(category.textColor)
    : styles.colorScheme.text;

  const titleStyle = buildCategoryTitleStyle(category, styles, textColor);
  const descriptionStyle = buildCategoryDescriptionStyle(category, styles);
  const sectionStyle = buildCategorySectionStyle(category, styles);

  const showDescription = category.typography?.descriptionVisible !== false && isValueDefined(categoryDescription);
  const showDivider = styles.layout.showCategoryDividers === true && !isLast;
  const testIdBase = `${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-${categoryIndex}`;

  const dividerStyle: ViewStyle = {
    backgroundColor: styles.colorScheme.divider,
  };

  return (
    <View style={[menuContentViewStyles.categorySection, sectionStyle]} testID={testIdBase}>
      <View style={menuContentViewStyles.categoryHeader}>
        <Text style={[menuContentViewStyles.categoryTitle, titleStyle]}>{categoryName}</Text>
        {showDescription ? (
          <Text style={[menuContentViewStyles.categoryDescription, descriptionStyle]}>
            {String(categoryDescription)}
          </Text>
        ) : null}
      </View>

      <CategoryItems
        category={category}
        categoryIndex={categoryIndex}
        contents={contents}
        onItemPress={onItemPress}
      />

      {showDivider ? <View style={[menuContentViewStyles.categoryDivider, dividerStyle]} /> : null}
    </View>
  );
};

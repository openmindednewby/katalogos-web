



import React, { useMemo } from 'react';

import { ScrollView, Text, View } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import { CategoryRenderer, getMergedStyles, getVisibleCategories } from './CategoryRenderer';
import { MenuHeader } from './MenuHeader';
import { TestIds } from '../../../../shared/testIds';
import { sortCategoriesByDisplayOrder } from '../../../../types/menuTypes';
import { isValueDefined } from '../../../../utils/is';
import { menuContentViewStyles } from '../utils/menuContentViewStyles';

import type { Category, MenuContents, MenuItem } from '../../../../types/menuTypes';


interface MenuContentViewProps {
  contents: MenuContents;
  menuName?: string;
  menuDescription?: string | null;
  onItemPress?: (category: Category, item: MenuItem) => void;
  t?: (key: string, defaultValue?: string) => string;
}


const DEFAULT_MENU_NAME = 'Menu';
const DEFAULT_EMPTY_MESSAGE = 'No menu items available';
const DEFAULT_FONT_SIZE_SMALL = 16;
const DEFAULT_PAGE_PADDING = 16;


export const MenuContentView: React.FC<MenuContentViewProps> = ({
  contents,
  menuName,
  menuDescription,
  onItemPress,
  t,
}) => {
  const resolvedMenuName = menuName ?? DEFAULT_MENU_NAME;
  const emptyMessage = t?.('onlineMenus.messages.emptyMenu', DEFAULT_EMPTY_MESSAGE) ?? DEFAULT_EMPTY_MESSAGE;

  const styles = useMemo(() => getMergedStyles(contents), [contents]);

  const sortedCategories = useMemo(() => {
    const categories = contents.categories ?? [];
    return sortCategoriesByDisplayOrder(categories);
  }, [contents.categories]);

  const visibleCategories = useMemo(
    () => getVisibleCategories(sortedCategories),
    [sortedCategories]
  );

  const containerStyle: ViewStyle = {
    backgroundColor: styles.colorScheme.background,
  };

  const contentStyle: ViewStyle = {
    padding: styles.spacing.pagePadding,
  };

  const emptyFontSize = isValueDefined(styles.typography.bodyFontSize)
    ? styles.typography.bodyFontSize
    : DEFAULT_FONT_SIZE_SMALL;
  const emptyTextStyle: TextStyle = {
    color: styles.colorScheme.textSecondary,
    fontSize: emptyFontSize,
  };

  const isEmpty = visibleCategories.length === 0;

  return (
    <ScrollView
      contentContainerStyle={menuContentViewStyles.scrollContent}
      style={[menuContentViewStyles.container, containerStyle]}
      testID={TestIds.MENU_CONTENT_VIEW}
    >
      <MenuHeader
        colorScheme={styles.colorScheme}
        header={styles.header}
        menuDescription={menuDescription}
        menuName={resolvedMenuName}
        pagePadding={isValueDefined(styles.spacing.pagePadding) ? styles.spacing.pagePadding : DEFAULT_PAGE_PADDING}
        typography={styles.typography}
      />

      <View style={[menuContentViewStyles.categoriesContainer, contentStyle]} testID={TestIds.MENU_CONTENT_VIEW_CATEGORIES}>
        {isEmpty ? (
          <View style={menuContentViewStyles.emptyContainer} testID={TestIds.MENU_CONTENT_VIEW_EMPTY}>
            <Text style={[menuContentViewStyles.emptyText, emptyTextStyle]}>{emptyMessage}</Text>
          </View>
        ) : (
          visibleCategories.map((category, index) => (
            <CategoryRenderer
              key={category.id ?? `category-${index}`}
              category={category}
              categoryIndex={index}
              contents={contents}
              isLast={index === visibleCategories.length - 1}
              onItemPress={onItemPress}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

/** Content body of the public menu: filter bar, featured section, categories, and empty states. */
import React, { useMemo } from 'react';

import { Text, View } from 'react-native';

import { CategorySection } from './CategorySection';
import { FeaturedSection } from './FeaturedSection';
import { MenuFilterBar } from './MenuFilterBar';
import { MenuFilterEmptyState } from './MenuFilterEmptyState';
import { TestIds } from '../../../shared/testIds';
import { getFeaturedItems } from '../../../types/menuTypes';
import AriaLiveRegion from '../../Shared/AriaLiveRegion';
import { buildContentStyle, buildEmptyTextStyle, EMPTY_CONTAINER_STYLE } from '../utils/menuContentViewStyles';
import { type buildResponsiveLayout } from '../utils/responsiveStyles';

import type { Category, MenuItem, MenuContents } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

interface ItemMeta {
  itemId: string;
  menuId: string;
  categoryName: string;
}

interface MenuContentBodyProps {
  categories: Category[];
  filteredCategories: Category[];
  hasActiveFilters: boolean;
  emptyMenuMessage: string;
  defaultCategoryLabel: string;
  defaultItemLabel: string;
  menuContents?: MenuContents;
  menuId?: string;
  observeItem?: (element: HTMLElement | null, meta: ItemMeta) => void;
  theme: PublicMenuTheme;
  responsive: ReturnType<typeof buildResponsiveLayout>;
  filterAnnouncement: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  availableTags: string[];
  clearAllFilters: () => void;
  openModal: (item: MenuItem) => void;
}

export const MenuContentBody = ({
  categories, filteredCategories, hasActiveFilters, emptyMenuMessage,
  defaultCategoryLabel, defaultItemLabel, menuContents, menuId, observeItem,
  theme, responsive, filterAnnouncement, searchQuery, setSearchQuery,
  selectedTags, toggleTag, availableTags, clearAllFilters, openModal,
}: MenuContentBodyProps): React.ReactElement => {
  const featuredItems = useMemo(() => getFeaturedItems(menuContents), [menuContents]);
  const showEmpty = categories.length === 0;
  const showFilterEmpty = categories.length > 0 && filteredCategories.length === 0;

  return (
    <View style={buildContentStyle(responsive)}>
      <MenuFilterBar
        availableTags={availableTags}
        hasActiveFilters={hasActiveFilters}
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        theme={theme}
        onClearAll={clearAllFilters}
        onSearchChange={setSearchQuery}
        onToggleTag={toggleTag}
      />

      <AriaLiveRegion message={filterAnnouncement} />

      {!hasActiveFilters ? (
        <FeaturedSection
          items={featuredItems}
          responsive={responsive}
          sectionTitle={menuContents?.featuredSectionTitle}
          theme={theme}
          onItemPress={openModal}
        />
      ) : null}

      {showEmpty ? (
        <View style={EMPTY_CONTAINER_STYLE}>
          <Text style={buildEmptyTextStyle(theme, responsive)}>{emptyMenuMessage}</Text>
        </View>
      ) : null}

      {showFilterEmpty ? (
        <MenuFilterEmptyState responsive={responsive} theme={theme} />
      ) : null}

      {filteredCategories.map((category, index) => {
        const categoryKey = category.id ?? `category-${index}`;
        return (
          <CategorySection
            key={categoryKey}
            category={category}
            defaultCategoryLabel={defaultCategoryLabel}
            defaultItemLabel={defaultItemLabel}
            isLast={index === filteredCategories.length - 1}
            menuId={menuId}
            observeItem={observeItem}
            responsive={responsive}
            testIdSuffix={`${TestIds.PUBLIC_MENU_CATEGORY}-${categoryKey}`}
            theme={theme}
            onItemPress={openModal}
          />
        );
      })}
    </View>
  );
};

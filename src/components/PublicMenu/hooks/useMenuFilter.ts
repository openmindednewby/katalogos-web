/**
 * useMenuFilter - Client-side filtering logic for public menu items.
 * Filters categories and items by search query and/or dietary tags.
 */
import { useCallback, useMemo, useState } from 'react';

import type { Category, MenuItem } from '../../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

const EMPTY_TAGS: string[] = [];

// =============================================================================
// Pure Filter Helpers
// =============================================================================

/** Checks whether an item name matches a search query (case-insensitive). */
export function matchesSearch(item: MenuItem, query: string): boolean {
  if (query === '') return true;
  const name = (item.name ?? '').toLowerCase();
  return name.includes(query.toLowerCase());
}

/** Checks whether an item has all of the selected dietary tags. */
export function matchesDietaryTags(item: MenuItem, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true;
  const itemTags = item.tags ?? EMPTY_TAGS;
  return selectedTags.every((tag) => itemTags.includes(tag));
}

/** Filters a single category's available items by search query and tags. */
export function filterCategoryItems(
  category: Category,
  searchQuery: string,
  selectedTags: string[],
): MenuItem[] {
  const items = category.items ?? [];
  const availableItems = items.filter((item) => item.isAvailable !== false);
  return availableItems.filter(
    (item) => matchesSearch(item, searchQuery) && matchesDietaryTags(item, selectedTags),
  );
}

/** Filters all categories, removing those with zero matching items. */
export function filterCategories(
  categories: Category[],
  searchQuery: string,
  selectedTags: string[],
): Category[] {
  return categories
    .map((category) => ({
      ...category,
      items: filterCategoryItems(category, searchQuery, selectedTags),
    }))
    .filter((category) => category.items.length > 0);
}

/** Extracts unique dietary tags from all items across all categories. */
export function extractUniqueTags(categories: Category[]): string[] {
  const tagSet = new Set<string>();
  for (const category of categories) 
    for (const item of category.items ?? []) {
      if (item.isAvailable === false) continue;
      for (const tag of item.tags ?? EMPTY_TAGS) 
        tagSet.add(tag);
      
    }
  
  return Array.from(tagSet).sort();
}

// =============================================================================
// Hook
// =============================================================================

interface UseMenuFilterReturn {
  /** Current search query string. */
  searchQuery: string;
  /** Update the search query. */
  setSearchQuery: (query: string) => void;
  /** Currently selected dietary tag strings. */
  selectedTags: string[];
  /** Toggle a dietary tag on/off. */
  toggleTag: (tag: string) => void;
  /** Whether any filter is active. */
  hasActiveFilters: boolean;
  /** Clear all filters (search and tags). */
  clearAllFilters: () => void;
  /** Categories with items filtered by current criteria. */
  filteredCategories: Category[];
  /** All unique dietary tags present in the menu data. */
  availableTags: string[];
  /** Total number of items after filtering. */
  filteredItemCount: number;
}

/** Counts the total items across filtered categories. */
function countFilteredItems(cats: Category[]): number {
  return cats.reduce((sum, cat) => sum + (cat.items?.length ?? 0), 0);
}

/** Toggles a tag in the selected tags array (add if absent, remove if present). */
function toggleInArray(prev: string[], tag: string): string[] {
  if (prev.includes(tag)) return prev.filter((t) => t !== tag);
  return [...prev, tag];
}

export function useMenuFilter(categories: Category[]): UseMenuFilterReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const availableTags = useMemo(() => extractUniqueTags(categories), [categories]);
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => toggleInArray(prev, tag));
  }, []);
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
  }, []);
  const hasActiveFilters = searchQuery !== '' || selectedTags.length > 0;
  const filteredCategories = useMemo(
    () => filterCategories(categories, searchQuery, selectedTags),
    [categories, searchQuery, selectedTags],
  );
  const filteredItemCount = useMemo(() => countFilteredItems(filteredCategories), [filteredCategories]);

  return {
    searchQuery, setSearchQuery, selectedTags, toggleTag,
    hasActiveFilters, clearAllFilters, filteredCategories, availableTags, filteredItemCount,
  };
}

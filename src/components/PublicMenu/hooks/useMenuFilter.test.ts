/**
 * Tests for useMenuFilter hook and pure filter utility functions.
 * Focuses on logic: search matching, tag filtering, category filtering,
 * tag extraction, and hook state management.
 */
import { renderHook, act } from '@testing-library/react-native';

import {
  matchesSearch,
  matchesDietaryTags,
  filterCategoryItems,
  filterCategories,
  extractUniqueTags,
  useMenuFilter,
} from './useMenuFilter';

import type { Category, MenuItem } from '../../../types/menuTypes';

// =============================================================================
// Test Data Factories
// =============================================================================

function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    name: 'Test Item',
    price: 10,
    isAvailable: true,
    tags: [],
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-1',
    name: 'Test Category',
    items: [makeItem()],
    ...overrides,
  };
}

// =============================================================================
// matchesSearch
// =============================================================================

describe('matchesSearch', () => {
  it('returns true when query is empty', () => {
    expect(matchesSearch(makeItem({ name: 'Burger' }), '')).toBe(true);
  });

  it('matches case-insensitively', () => {
    const item = makeItem({ name: 'Grilled Chicken' });
    expect(matchesSearch(item, 'grilled')).toBe(true);
    expect(matchesSearch(item, 'CHICKEN')).toBe(true);
  });

  it('matches partial strings', () => {
    expect(matchesSearch(makeItem({ name: 'Margherita Pizza' }), 'pizza')).toBe(true);
    expect(matchesSearch(makeItem({ name: 'Margherita Pizza' }), 'mar')).toBe(true);
  });

  it('returns false when no match', () => {
    expect(matchesSearch(makeItem({ name: 'Burger' }), 'pasta')).toBe(false);
  });

  it('handles items with undefined name', () => {
    expect(matchesSearch(makeItem({ name: undefined }), 'test')).toBe(false);
  });

  it('handles items with null name', () => {
    // The API type says name is never null; verify matchesSearch stays defensive anyway.
    expect(matchesSearch(makeItem({ name: null as unknown as undefined }), 'test')).toBe(false);
  });
});

// =============================================================================
// matchesDietaryTags
// =============================================================================

describe('matchesDietaryTags', () => {
  it('returns true when no tags are selected', () => {
    expect(matchesDietaryTags(makeItem({ tags: [] }), [])).toBe(true);
  });

  it('returns true when item has all selected tags', () => {
    const item = makeItem({ tags: ['vegan', 'gluten-free', 'organic'] });
    expect(matchesDietaryTags(item, ['vegan', 'gluten-free'])).toBe(true);
  });

  it('returns false when item is missing a selected tag', () => {
    const item = makeItem({ tags: ['vegan'] });
    expect(matchesDietaryTags(item, ['vegan', 'gluten-free'])).toBe(false);
  });

  it('handles items with undefined tags', () => {
    expect(matchesDietaryTags(makeItem({ tags: undefined }), ['vegan'])).toBe(false);
  });

  it('handles items with no tags property', () => {
    const item = makeItem();
    delete item.tags;
    expect(matchesDietaryTags(item, ['vegan'])).toBe(false);
  });
});

// =============================================================================
// filterCategoryItems
// =============================================================================

describe('filterCategoryItems', () => {
  it('returns empty array when no items match search', () => {
    const category = makeCategory({
      items: [makeItem({ name: 'Burger' }), makeItem({ name: 'Fries' })],
    });
    expect(filterCategoryItems(category, 'pasta', [])).toHaveLength(0);
  });

  it('returns empty array when no items match tags', () => {
    const category = makeCategory({
      items: [makeItem({ name: 'Burger', tags: ['halal'] })],
    });
    expect(filterCategoryItems(category, '', ['vegan'])).toHaveLength(0);
  });

  it('filters out unavailable items', () => {
    const category = makeCategory({
      items: [
        makeItem({ name: 'Burger', isAvailable: true }),
        makeItem({ name: 'Burger Deluxe', isAvailable: false }),
      ],
    });
    const result = filterCategoryItems(category, 'burger', []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Burger');
  });

  it('treats items with undefined isAvailable as available', () => {
    const itemWithoutFlag = makeItem({ name: 'Mystery Burger' });
    delete itemWithoutFlag.isAvailable;
    const category = makeCategory({
      items: [
        itemWithoutFlag,
        makeItem({ name: 'Hidden Burger', isAvailable: false }),
      ],
    });
    const result = filterCategoryItems(category, 'burger', []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Mystery Burger');
  });

  it('returns only matching items', () => {
    const category = makeCategory({
      items: [
        makeItem({ name: 'Vegan Burger', tags: ['vegan'] }),
        makeItem({ name: 'Cheese Burger', tags: [] }),
      ],
    });
    const result = filterCategoryItems(category, '', ['vegan']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Vegan Burger');
  });

  it('applies both search and tag filters together', () => {
    const category = makeCategory({
      items: [
        makeItem({ name: 'Vegan Burger', tags: ['vegan'] }),
        makeItem({ name: 'Vegan Salad', tags: ['vegan'] }),
        makeItem({ name: 'Cheese Burger', tags: [] }),
      ],
    });
    const result = filterCategoryItems(category, 'burger', ['vegan']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Vegan Burger');
  });

  it('handles category with undefined items', () => {
    const category = makeCategory({ items: undefined });
    expect(filterCategoryItems(category, '', [])).toHaveLength(0);
  });
});

// =============================================================================
// filterCategories
// =============================================================================

describe('filterCategories', () => {
  it('removes categories with no matching items', () => {
    const categories = [
      makeCategory({ id: 'c1', items: [makeItem({ name: 'Burger' })] }),
      makeCategory({ id: 'c2', items: [makeItem({ name: 'Pasta' })] }),
    ];
    const result = filterCategories(categories, 'burger', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('returns empty array when nothing matches', () => {
    const categories = [
      makeCategory({ items: [makeItem({ name: 'Burger' })] }),
    ];
    expect(filterCategories(categories, 'sushi', [])).toHaveLength(0);
  });

  it('returns all categories when no filters active', () => {
    const categories = [
      makeCategory({ id: 'c1' }),
      makeCategory({ id: 'c2' }),
    ];
    const result = filterCategories(categories, '', []);
    expect(result).toHaveLength(2);
  });
});

// =============================================================================
// extractUniqueTags
// =============================================================================

describe('extractUniqueTags', () => {
  it('extracts unique tags across all categories', () => {
    const categories = [
      makeCategory({
        items: [
          makeItem({ tags: ['vegan', 'organic'] }),
          makeItem({ tags: ['vegan', 'gluten-free'] }),
        ],
      }),
      makeCategory({
        items: [makeItem({ tags: ['organic', 'halal'] })],
      }),
    ];
    const tags = extractUniqueTags(categories);
    expect(tags).toEqual(['gluten-free', 'halal', 'organic', 'vegan']);
  });

  it('returns empty array when no tags exist', () => {
    const categories = [makeCategory({ items: [makeItem({ tags: [] })] })];
    expect(extractUniqueTags(categories)).toEqual([]);
  });

  it('skips unavailable items', () => {
    const categories = [
      makeCategory({
        items: [
          makeItem({ tags: ['vegan'], isAvailable: true }),
          makeItem({ tags: ['halal'], isAvailable: false }),
        ],
      }),
    ];
    expect(extractUniqueTags(categories)).toEqual(['vegan']);
  });

  it('includes items with undefined isAvailable in tags', () => {
    const itemWithoutFlag = makeItem({ tags: ['organic'] });
    delete itemWithoutFlag.isAvailable;
    const categories = [
      makeCategory({
        items: [
          itemWithoutFlag,
          makeItem({ tags: ['halal'], isAvailable: false }),
        ],
      }),
    ];
    expect(extractUniqueTags(categories)).toEqual(['organic']);
  });

  it('handles categories with undefined items', () => {
    const categories = [makeCategory({ items: undefined })];
    expect(extractUniqueTags(categories)).toEqual([]);
  });

  it('sorts tags alphabetically', () => {
    const categories = [
      makeCategory({
        items: [makeItem({ tags: ['zesty', 'organic', 'bio'] })],
      }),
    ];
    expect(extractUniqueTags(categories)).toEqual(['bio', 'organic', 'zesty']);
  });
});

// =============================================================================
// useMenuFilter hook
// =============================================================================

describe('useMenuFilter', () => {
  const categories: Category[] = [
    makeCategory({
      id: 'mains',
      name: 'Mains',
      items: [
        makeItem({ name: 'Vegan Burger', tags: ['vegan', 'organic'] }),
        makeItem({ name: 'Chicken Wrap', tags: ['halal'] }),
        makeItem({ name: 'Pasta Carbonara', tags: [] }),
      ],
    }),
    makeCategory({
      id: 'desserts',
      name: 'Desserts',
      items: [
        makeItem({ name: 'Vegan Brownie', tags: ['vegan', 'gluten-free'] }),
        makeItem({ name: 'Cheesecake', tags: [] }),
      ],
    }),
  ];

  it('returns all categories when no filters active', () => {
    const { result } = renderHook(() => useMenuFilter(categories));
    expect(result.current.filteredCategories).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedTags).toEqual([]);
  });

  it('extracts available tags from menu data', () => {
    const { result } = renderHook(() => useMenuFilter(categories));
    expect(result.current.availableTags).toEqual(['gluten-free', 'halal', 'organic', 'vegan']);
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    act(() => { result.current.setSearchQuery('burger'); });

    expect(result.current.filteredCategories).toHaveLength(1);
    expect(result.current.filteredCategories[0].items).toHaveLength(1);
    expect(result.current.filteredCategories[0].items?.[0].name).toBe('Vegan Burger');
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('filters by dietary tags', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    act(() => { result.current.toggleTag('vegan'); });

    expect(result.current.filteredCategories).toHaveLength(2);
    expect(result.current.selectedTags).toEqual(['vegan']);
  });

  it('combines search and tag filters', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    act(() => {
      result.current.setSearchQuery('brownie');
      result.current.toggleTag('vegan');
    });

    expect(result.current.filteredCategories).toHaveLength(1);
    expect(result.current.filteredCategories[0].items?.[0].name).toBe('Vegan Brownie');
  });

  it('toggles tag off when already selected', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    act(() => { result.current.toggleTag('vegan'); });
    expect(result.current.selectedTags).toEqual(['vegan']);

    act(() => { result.current.toggleTag('vegan'); });
    expect(result.current.selectedTags).toEqual([]);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    act(() => {
      result.current.setSearchQuery('burger');
      result.current.toggleTag('vegan');
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => { result.current.clearAllFilters(); });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedTags).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredCategories).toHaveLength(2);
  });

  it('computes correct filtered item count', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    // All items: 3 + 2 = 5
    expect(result.current.filteredItemCount).toBe(5);

    act(() => { result.current.toggleTag('vegan'); });

    // Vegan items: Vegan Burger + Vegan Brownie = 2
    expect(result.current.filteredItemCount).toBe(2);
  });

  it('returns empty categories when nothing matches', () => {
    const { result } = renderHook(() => useMenuFilter(categories));

    act(() => { result.current.setSearchQuery('sushi'); });

    expect(result.current.filteredCategories).toHaveLength(0);
    expect(result.current.filteredItemCount).toBe(0);
  });
});

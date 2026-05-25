import {
  isActiveMenu,
  sortCategoriesByDisplayOrder,
  sortMenuItemsByDisplayOrder,
  updateCategoryDisplayOrder,
  updateMenuItemDisplayOrder,
  generateUniqueId,
  ensureMenuContentsHaveIds,
  getFeaturedItems,
} from './menuTypes';

import type { TenantMenusDto, Category, MenuItem, MenuContents } from './menuTypes';

describe('menuTypes helpers', () => {
  describe('isActiveMenu', () => {
    it('returns true for menu with isActive field', () => {
      const menu: TenantMenusDto = {
        externalId: 'test-id',
        name: 'Test Menu',
        isActive: true,
      };
      // Cast to TenantMenusDto to test type guard
      const typedMenu = menu as unknown as TenantMenusDto;

      expect(isActiveMenu(typedMenu)).toBe(true);
    });

    it('returns false for menu without isActive field', () => {
      const menu = {
        externalId: 'test-id',
        name: 'Test Menu',
      };
      // Cast to TenantMenusDto to test type guard
      const typedMenu = menu as unknown as TenantMenusDto;

      expect(isActiveMenu(typedMenu)).toBe(false);
    });

    it('returns false for menu with isActive as non-boolean', () => {
      const menu: TenantMenusDto = {
        externalId: 'test-id',
        name: 'Test Menu',
        isActive: 'true' as unknown as boolean,
      };
      // Cast to TenantMenusDto to test type guard
      const typedMenu = menu as unknown as TenantMenusDto;

      expect(isActiveMenu(typedMenu)).toBe(false);
    });
  });

  describe('sortCategoriesByDisplayOrder', () => {
    it('sorts categories by displayOrder ascending', () => {
      const categories: Category[] = [
        { name: 'Category C', displayOrder: 2 },
        { name: 'Category A', displayOrder: 0 },
        { name: 'Category B', displayOrder: 1 },
      ];

      const sorted = sortCategoriesByDisplayOrder(categories);

      expect(sorted[0].name).toBe('Category A');
      expect(sorted[1].name).toBe('Category B');
      expect(sorted[2].name).toBe('Category C');
    });

    it('returns empty array for undefined input', () => {
      const sorted = sortCategoriesByDisplayOrder(undefined);
      expect(sorted).toEqual([]);
    });

    it('sorts categories with same displayOrder', () => {
      const categories: Category[] = [
        { name: 'Category B', displayOrder: 0 },
        { name: 'Category A', displayOrder: 0 },
      ];

      const sorted = sortCategoriesByDisplayOrder(categories);

      expect(sorted).toHaveLength(2);
    });

    it('does not mutate original array', () => {
      const categories: Category[] = [
        { name: 'Category B', displayOrder: 1 },
        { name: 'Category A', displayOrder: 0 },
      ];

      sortCategoriesByDisplayOrder(categories);

      expect(categories[0].name).toBe('Category B');
    });
  });

  describe('sortMenuItemsByDisplayOrder', () => {
    it('sorts menu items by displayOrder ascending', () => {
      const items: MenuItem[] = [
        { name: 'Item C', displayOrder: 2, price: 10 },
        { name: 'Item A', displayOrder: 0, price: 5 },
        { name: 'Item B', displayOrder: 1, price: 7 },
      ];

      const sorted = sortMenuItemsByDisplayOrder(items);

      expect(sorted[0].name).toBe('Item A');
      expect(sorted[1].name).toBe('Item B');
      expect(sorted[2].name).toBe('Item C');
    });

    it('returns empty array for undefined input', () => {
      const sorted = sortMenuItemsByDisplayOrder(undefined);
      expect(sorted).toEqual([]);
    });

    it('sorts items with same displayOrder', () => {
      const items: MenuItem[] = [
        { name: 'Item B', displayOrder: 0, price: 7 },
        { name: 'Item A', displayOrder: 0, price: 5 },
      ];

      const sorted = sortMenuItemsByDisplayOrder(items);

      expect(sorted).toHaveLength(2);
    });

    it('does not mutate original array', () => {
      const items: MenuItem[] = [
        { name: 'Item B', displayOrder: 1, price: 7 },
        { name: 'Item A', displayOrder: 0, price: 5 },
      ];

      sortMenuItemsByDisplayOrder(items);

      expect(items[0].name).toBe('Item B');
    });
  });

  describe('updateCategoryDisplayOrder', () => {
    it('updates displayOrder based on array position', () => {
      const categories: Category[] = [
        { name: 'Category A', displayOrder: 5 },
        { name: 'Category B', displayOrder: 3 },
        { name: 'Category C', displayOrder: 1 },
      ];

      const updated = updateCategoryDisplayOrder(categories);

      expect(updated[0].displayOrder).toBe(0);
      expect(updated[1].displayOrder).toBe(1);
      expect(updated[2].displayOrder).toBe(2);
    });

    it('preserves all other category properties', () => {
      const categories: Category[] = [
        {
          name: 'Category A',
          description: 'Test description',
          backgroundColor: '#ffffff',
          displayOrder: 5,
        },
      ];

      const updated = updateCategoryDisplayOrder(categories);

      expect(updated[0].name).toBe('Category A');
      expect(updated[0].description).toBe('Test description');
      expect(updated[0].backgroundColor).toBe('#ffffff');
    });
  });

  describe('updateMenuItemDisplayOrder', () => {
    it('updates displayOrder based on array position', () => {
      const items: MenuItem[] = [
        { name: 'Item A', displayOrder: 5, price: 10 },
        { name: 'Item B', displayOrder: 3, price: 7 },
        { name: 'Item C', displayOrder: 1, price: 5 },
      ];

      const updated = updateMenuItemDisplayOrder(items);

      expect(updated[0].displayOrder).toBe(0);
      expect(updated[1].displayOrder).toBe(1);
      expect(updated[2].displayOrder).toBe(2);
    });

    it('preserves all other menu item properties', () => {
      const items: MenuItem[] = [
        {
          name: 'Item A',
          description: 'Test description',
          price: 10,
          isAvailable: true,
          displayOrder: 5,
        },
      ];

      const updated = updateMenuItemDisplayOrder(items);

      expect(updated[0].name).toBe('Item A');
      expect(updated[0].description).toBe('Test description');
      expect(updated[0].price).toBe(10);
      expect(updated[0].isAvailable).toBe(true);
    });
  });

  describe('generateUniqueId', () => {
    it('generates an ID with the given prefix', () => {
      const id = generateUniqueId('cat');
      expect(id.startsWith('cat_')).toBe(true);
    });

    it('generates unique IDs on consecutive calls', () => {
      const id1 = generateUniqueId('item');
      const id2 = generateUniqueId('item');
      const id3 = generateUniqueId('item');

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('generates different IDs for different prefixes', () => {
      const catId = generateUniqueId('cat');
      const itemId = generateUniqueId('item');

      expect(catId.startsWith('cat_')).toBe(true);
      expect(itemId.startsWith('item_')).toBe(true);
      expect(catId).not.toBe(itemId);
    });
  });

  describe('ensureMenuContentsHaveIds', () => {
    it('returns empty categories array for null input', () => {
      const result = ensureMenuContentsHaveIds(null);
      expect(result).toEqual({ categories: [] });
    });

    it('returns empty categories array for undefined input', () => {
      const result = ensureMenuContentsHaveIds(undefined);
      expect(result).toEqual({ categories: [] });
    });

    it('adds IDs to categories without IDs', () => {
      const contents: MenuContents = {
        categories: [
          { name: 'Category A', displayOrder: 0 },
          { name: 'Category B', displayOrder: 1 },
        ],
      };

      const result = ensureMenuContentsHaveIds(contents);

      expect(result.categories?.[0].id).toBeDefined();
      expect(result.categories?.[0].id?.startsWith('cat_')).toBe(true);
      expect(result.categories?.[1].id).toBeDefined();
      expect(result.categories?.[1].id?.startsWith('cat_')).toBe(true);
    });

    it('preserves existing IDs on categories', () => {
      const contents: MenuContents = {
        categories: [
          { id: 'existing-cat-id', name: 'Category A', displayOrder: 0 },
        ],
      };

      const result = ensureMenuContentsHaveIds(contents);

      expect(result.categories?.[0].id).toBe('existing-cat-id');
    });

    it('adds IDs to items without IDs', () => {
      const contents: MenuContents = {
        categories: [
          {
            name: 'Category A',
            displayOrder: 0,
            items: [
              { name: 'Item 1', price: 10, displayOrder: 0 },
              { name: 'Item 2', price: 20, displayOrder: 1 },
            ],
          },
        ],
      };

      const result = ensureMenuContentsHaveIds(contents);

      expect(result.categories?.[0].items?.[0].id).toBeDefined();
      expect(result.categories?.[0].items?.[0].id?.startsWith('item_')).toBe(true);
      expect(result.categories?.[0].items?.[1].id).toBeDefined();
      expect(result.categories?.[0].items?.[1].id?.startsWith('item_')).toBe(true);
    });

    it('preserves existing IDs on items', () => {
      const contents: MenuContents = {
        categories: [
          {
            name: 'Category A',
            displayOrder: 0,
            items: [
              { id: 'existing-item-id', name: 'Item 1', price: 10, displayOrder: 0 },
            ],
          },
        ],
      };

      const result = ensureMenuContentsHaveIds(contents);

      expect(result.categories?.[0].items?.[0].id).toBe('existing-item-id');
    });

    it('preserves other properties on categories and items', () => {
      const contents: MenuContents = {
        titleFont: 'Arial',
        backgroundColor: '#ffffff',
        categories: [
          {
            name: 'Category A',
            description: 'Test description',
            displayOrder: 0,
            imageContentId: 'img-123',
            items: [
              {
                name: 'Item 1',
                description: 'Item desc',
                price: 10,
                isAvailable: true,
                displayOrder: 0,
              },
            ],
          },
        ],
      };

      const result = ensureMenuContentsHaveIds(contents);

      expect(result.titleFont).toBe('Arial');
      expect(result.backgroundColor).toBe('#ffffff');
      expect(result.categories?.[0].name).toBe('Category A');
      expect(result.categories?.[0].description).toBe('Test description');
      expect(result.categories?.[0].imageContentId).toBe('img-123');
      expect(result.categories?.[0].items?.[0].name).toBe('Item 1');
      expect(result.categories?.[0].items?.[0].price).toBe(10);
    });

    it('handles categories with no items', () => {
      const contents: MenuContents = {
        categories: [
          { name: 'Empty Category', displayOrder: 0 },
        ],
      };

      const result = ensureMenuContentsHaveIds(contents);

      expect(result.categories?.[0].id).toBeDefined();
      expect(result.categories?.[0].items).toEqual([]);
    });
  });

  describe('getFeaturedItems', () => {
    const createItem = (overrides: Partial<MenuItem>): MenuItem => ({
      name: 'Item',
      price: 10,
      isAvailable: true,
      ...overrides,
    });

    const createContents = (
      items: MenuItem[],
      overrides?: Partial<MenuContents>,
    ): MenuContents => {
      const category: Category = { name: 'Category', items };
      return { categories: [category], ...overrides };
    };

    it('returns empty array for null contents', () => {
      expect(getFeaturedItems(null)).toEqual([]);
    });

    it('returns empty array for undefined contents', () => {
      expect(getFeaturedItems(undefined)).toEqual([]);
    });

    it('returns empty array when no items are featured', () => {
      const contents = createContents([
        createItem({ name: 'A', isFeatured: false }),
        createItem({ name: 'B' }),
      ]);

      expect(getFeaturedItems(contents)).toEqual([]);
    });

    it('returns featured and available items', () => {
      const contents = createContents([
        createItem({ name: 'A', isFeatured: true }),
        createItem({ name: 'B', isFeatured: false }),
        createItem({ name: 'C', isFeatured: true }),
      ]);

      const result = getFeaturedItems(contents);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('C');
    });

    it('filters out unavailable featured items', () => {
      const contents = createContents([
        createItem({ name: 'A', isFeatured: true, isAvailable: true }),
        createItem({ name: 'B', isFeatured: true, isAvailable: false }),
      ]);

      const result = getFeaturedItems(contents);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('A');
    });

    it('sorts by featuredOrder ascending', () => {
      const contents = createContents([
        createItem({ name: 'Third', isFeatured: true, featuredOrder: 3 }),
        createItem({ name: 'First', isFeatured: true, featuredOrder: 1 }),
        createItem({ name: 'Second', isFeatured: true, featuredOrder: 2 }),
      ]);

      const result = getFeaturedItems(contents);
      expect(result.map((i) => i.name)).toEqual(['First', 'Second', 'Third']);
    });

    it('uses default order 0 when featuredOrder is undefined', () => {
      const contents = createContents([
        createItem({ name: 'WithOrder', isFeatured: true, featuredOrder: 1 }),
        createItem({ name: 'NoOrder', isFeatured: true }),
      ]);

      const result = getFeaturedItems(contents);
      expect(result[0].name).toBe('NoOrder');
      expect(result[1].name).toBe('WithOrder');
    });

    it('returns empty array when featuredSectionEnabled is false', () => {
      const contents = createContents(
        [createItem({ name: 'A', isFeatured: true })],
        { featuredSectionEnabled: false },
      );

      expect(getFeaturedItems(contents)).toEqual([]);
    });

    it('returns featured items when featuredSectionEnabled is true', () => {
      const contents = createContents(
        [createItem({ name: 'A', isFeatured: true })],
        { featuredSectionEnabled: true },
      );

      expect(getFeaturedItems(contents)).toHaveLength(1);
    });

    it('returns featured items when featuredSectionEnabled is undefined', () => {
      const contents = createContents(
        [createItem({ name: 'A', isFeatured: true })],
        { featuredSectionEnabled: undefined },
      );

      expect(getFeaturedItems(contents)).toHaveLength(1);
    });

    it('collects featured items from multiple categories', () => {
      const contents: MenuContents = {
        categories: [
          { name: 'Cat1', items: [createItem({ name: 'A', isFeatured: true })] },
          { name: 'Cat2', items: [createItem({ name: 'B', isFeatured: true })] },
        ],
      };

      expect(getFeaturedItems(contents)).toHaveLength(2);
    });

    it('handles contents with no categories', () => {
      const contents: MenuContents = {};
      expect(getFeaturedItems(contents)).toEqual([]);
    });
  });
});

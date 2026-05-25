/**
 * Tests for AI import data transformation utilities.
 */
import {
  countTotalItems,
  mergeMenuContents,
  transformImportedCategory,
  transformImportedDataToContents,
  transformImportedItem,
} from './aiImportTransformers';

import type { ImportedMenuData } from '../../../../types/aiImportTypes';
import type { MenuContents } from '../../../../types/menuTypes';

describe('transformImportedItem', () => {
  it('converts an imported item with all fields', () => {
    const result = transformImportedItem(
      { name: 'Burger', description: 'Juicy beef', price: 12.99, confidence: 0.95 },
      0,
    );

    expect(result.name).toBe('Burger');
    expect(result.description).toBe('Juicy beef');
    expect(result.price).toBe(12.99);
    expect(result.displayOrder).toBe(0);
    expect(result.isAvailable).toBe(true);
  });

  it('defaults description to empty string when null', () => {
    const result = transformImportedItem(
      { name: 'Fries', description: null, price: 5 },
      1,
    );
    expect(result.description).toBe('');
  });

  it('defaults price to 0 when null', () => {
    const result = transformImportedItem(
      { name: 'Water', price: null },
      2,
    );
    expect(result.price).toBe(0);
  });
});

describe('transformImportedCategory', () => {
  it('converts a category with items', () => {
    const result = transformImportedCategory(
      { name: 'Mains', items: [{ name: 'Steak', price: 25 }] },
      0,
    );

    expect(result.name).toBe('Mains');
    expect(result.displayOrder).toBe(0);
    expect(result.items).toHaveLength(1);
    expect(result.items?.[0].name).toBe('Steak');
  });

  it('handles empty items array', () => {
    const result = transformImportedCategory({ name: 'Empty', items: [] }, 1);
    expect(result.items).toHaveLength(0);
  });
});

describe('transformImportedDataToContents', () => {
  it('converts full import data to MenuContents', () => {
    const data: ImportedMenuData = {
      categories: [
        { name: 'Starters', items: [{ name: 'Soup', price: 8 }] },
        { name: 'Mains', items: [{ name: 'Fish', price: 18 }] },
      ],
    };

    const result = transformImportedDataToContents(data);

    expect(result.categories).toHaveLength(2);
    expect(result.categories?.[0].name).toBe('Starters');
    expect(result.categories?.[1].name).toBe('Mains');
  });

  it('handles empty categories', () => {
    const result = transformImportedDataToContents({ categories: [] });
    expect(result.categories).toHaveLength(0);
  });
});

describe('mergeMenuContents', () => {
  it('appends imported categories after existing ones', () => {
    const existing: MenuContents = {
      categories: [{ name: 'Existing', items: [], displayOrder: 0 }],
    };
    const imported: MenuContents = {
      categories: [{ name: 'New', items: [], displayOrder: 0 }],
    };

    const result = mergeMenuContents(existing, imported);

    expect(result.categories).toHaveLength(2);
    expect(result.categories?.[0].name).toBe('Existing');
    expect(result.categories?.[1].name).toBe('New');
    expect(result.categories?.[1].displayOrder).toBe(1);
  });

  it('preserves existing styling fields', () => {
    const existing: MenuContents = {
      categories: [],
      backgroundColor: '#FFF',
    };
    const imported: MenuContents = { categories: [{ name: 'A', items: [] }] };

    const result = mergeMenuContents(existing, imported);
    expect(result.backgroundColor).toBe('#FFF');
  });
});

describe('countTotalItems', () => {
  it('counts items across multiple categories', () => {
    const data: ImportedMenuData = {
      categories: [
        { name: 'A', items: [{ name: '1', price: 1 }, { name: '2', price: 2 }] },
        { name: 'B', items: [{ name: '3', price: 3 }] },
      ],
    };
    expect(countTotalItems(data)).toBe(3);
  });

  it('returns 0 for empty categories', () => {
    expect(countTotalItems({ categories: [] })).toBe(0);
  });
});

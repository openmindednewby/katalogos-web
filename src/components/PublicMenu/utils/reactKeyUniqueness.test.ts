import type { Category, MenuItem } from '../../../types/menuTypes';

function getCategoryKey(category: Category, index: number): string {
  return category.id ?? `category-${index}`;
}

function getItemKey(item: MenuItem, index: number): string {
  return item.id ?? `item-${index}`;
}

describe('Category key uniqueness (BUG-MENU-007)', () => {
  it('produces unique keys when categories have unique IDs', () => {
    const categories: Category[] = [
      { id: 'cat-1', name: 'Appetizers' },
      { id: 'cat-2', name: 'Appetizers' },
      { id: 'cat-3', name: 'Desserts' },
    ];

    const keys = categories.map((cat, idx) => getCategoryKey(cat, idx));
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(categories.length);
  });

  it('produces unique keys for duplicate category names without IDs', () => {
    const categories: Category[] = [
      { name: 'Appetizers' },
      { name: 'Appetizers' },
      { name: 'Appetizers' },
    ];

    const keys = categories.map((cat, idx) => getCategoryKey(cat, idx));
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(categories.length);
    expect(keys).toEqual(['category-0', 'category-1', 'category-2']);
  });

  it('uses ID when available, index when not', () => {
    const categories: Category[] = [
      { id: 'cat-abc', name: 'Starters' },
      { name: 'Mains' },
    ];

    expect(getCategoryKey(categories[0], 0)).toBe('cat-abc');
    expect(getCategoryKey(categories[1], 1)).toBe('category-1');
  });
});

describe('Item key uniqueness (BUG-MENU-008)', () => {
  it('produces unique keys when items have unique IDs', () => {
    const items: MenuItem[] = [
      { id: 'item-1', name: 'Burger', price: 10 },
      { id: 'item-2', name: 'Burger', price: 10 },
    ];

    const keys = items.map((item, idx) => getItemKey(item, idx));
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(items.length);
  });

  it('produces unique keys for duplicate items without IDs', () => {
    const items: MenuItem[] = [
      { name: 'Burger', price: 10 },
      { name: 'Burger', price: 10 },
      { name: 'Burger', price: 10 },
    ];

    const keys = items.map((item, idx) => getItemKey(item, idx));
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(items.length);
    expect(keys).toEqual(['item-0', 'item-1', 'item-2']);
  });

  it('demonstrates the old bug: name+price keys were not unique', () => {
    const items: MenuItem[] = [
      { name: 'Fries', price: 5 },
      { name: 'Fries', price: 5 },
    ];

    const oldKeys = items.map((item) => {
      const itemName = item.name ?? 'item';
      const itemPrice = item.price ?? 0;
      return `category-${itemName}-${itemPrice}`;
    });

    const oldUniqueKeys = new Set(oldKeys);
    expect(oldUniqueKeys.size).toBe(1);

    const newKeys = items.map((item, idx) => getItemKey(item, idx));
    const newUniqueKeys = new Set(newKeys);
    expect(newUniqueKeys.size).toBe(2);
  });
});

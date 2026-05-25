import { formatMenuJson } from './formatMenuJson';

import type { MenuJsonExport } from './formatMenuJson';
import type { MenuContents } from '../../../../types/menuTypes';

describe('formatMenuJson', () => {
  it('returns empty string for null contents', () => {
    expect(formatMenuJson(null)).toBe('');
  });

  it('returns empty string for undefined contents', () => {
    expect(formatMenuJson(undefined)).toBe('');
  });

  it('returns empty string for contents with no categories', () => {
    expect(formatMenuJson({ categories: [] })).toBe('');
  });

  it('returns empty string for categories with no items', () => {
    const contents: MenuContents = {
      categories: [{ name: 'Empty', items: [] }],
    };
    expect(formatMenuJson(contents)).toBe('');
  });

  it('produces valid JSON for a single category', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Mains',
        description: 'Main courses',
        displayOrder: 0,
        items: [{
          name: 'Burger',
          description: 'Beef patty',
          price: 12.5,
          isAvailable: true,
          tags: ['gluten-free'],
          displayOrder: 0,
        }],
      }],
    };

    const result = formatMenuJson(contents);
    const parsed: MenuJsonExport = JSON.parse(result);

    expect(parsed.categoryCount).toBe(1);
    expect(parsed.itemCount).toBe(1);
    expect(parsed.categories).toHaveLength(1);
    expect(parsed.categories[0].name).toBe('Mains');
    expect(parsed.categories[0].items[0].name).toBe('Burger');
    expect(parsed.categories[0].items[0].dietaryTags).toEqual(['gluten-free']);
  });

  it('includes exportDate in ISO format', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Drinks',
        displayOrder: 0,
        items: [{ name: 'Water', price: 2, displayOrder: 0 }],
      }],
    };

    const result = formatMenuJson(contents);
    const parsed: MenuJsonExport = JSON.parse(result);

    expect(parsed.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('sorts categories by displayOrder', () => {
    const contents: MenuContents = {
      categories: [
        { name: 'Desserts', displayOrder: 2, items: [{ name: 'Cake', price: 8, displayOrder: 0 }] },
        { name: 'Starters', displayOrder: 0, items: [{ name: 'Soup', price: 5, displayOrder: 0 }] },
      ],
    };

    const result = formatMenuJson(contents);
    const parsed: MenuJsonExport = JSON.parse(result);

    expect(parsed.categories[0].name).toBe('Starters');
    expect(parsed.categories[1].name).toBe('Desserts');
  });

  it('defaults missing optional fields', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Drinks',
        displayOrder: 0,
        items: [{ name: 'Water', displayOrder: 0 }],
      }],
    };

    const result = formatMenuJson(contents);
    const parsed: MenuJsonExport = JSON.parse(result);

    const item = parsed.categories[0].items[0];
    expect(item.description).toBe('');
    expect(item.price).toBe(0);
    expect(item.isAvailable).toBe(true);
    expect(item.dietaryTags).toEqual([]);
  });

  it('counts items across multiple categories', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Starters',
          displayOrder: 0,
          items: [
            { name: 'Soup', price: 5, displayOrder: 0 },
            { name: 'Salad', price: 7, displayOrder: 1 },
          ],
        },
        {
          name: 'Mains',
          displayOrder: 1,
          items: [{ name: 'Steak', price: 30, displayOrder: 0 }],
        },
      ],
    };

    const result = formatMenuJson(contents);
    const parsed: MenuJsonExport = JSON.parse(result);

    const EXPECTED_ITEMS = 3;
    expect(parsed.itemCount).toBe(EXPECTED_ITEMS);
    expect(parsed.categoryCount).toBe(2);
  });
});

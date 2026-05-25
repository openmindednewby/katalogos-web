import { escapeCsvField, formatMenuCsv } from './formatMenuCsv';

import type { MenuContents } from '../../../../types/menuTypes';

describe('escapeCsvField', () => {
  it('returns plain values unchanged', () => {
    expect(escapeCsvField('Starters')).toBe('Starters');
  });

  it('wraps values with commas in double quotes', () => {
    expect(escapeCsvField('Salt, Pepper')).toBe('"Salt, Pepper"');
  });

  it('escapes double quotes inside the value', () => {
    expect(escapeCsvField('8" Pizza')).toBe('"8"" Pizza"');
  });

  it('wraps values with newlines in double quotes', () => {
    expect(escapeCsvField('Line1\nLine2')).toBe('"Line1\nLine2"');
  });

  it('handles empty string', () => {
    expect(escapeCsvField('')).toBe('');
  });
});

describe('formatMenuCsv', () => {
  it('returns empty string for null contents', () => {
    expect(formatMenuCsv(null)).toBe('');
  });

  it('returns empty string for undefined contents', () => {
    expect(formatMenuCsv(undefined)).toBe('');
  });

  it('returns empty string for contents with no categories', () => {
    expect(formatMenuCsv({ categories: [] })).toBe('');
  });

  it('returns empty string for categories with no items', () => {
    const contents: MenuContents = {
      categories: [{ name: 'Empty', items: [] }],
    };
    expect(formatMenuCsv(contents)).toBe('');
  });

  it('formats a single category with one item', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Mains',
        displayOrder: 0,
        items: [{
          name: 'Burger',
          description: 'Beef patty',
          price: 12.5,
          isAvailable: true,
          displayOrder: 0,
        }],
      }],
    };

    const result = formatMenuCsv(contents);
    const lines = result.split('\n');

    expect(lines[0]).toBe('Category,Item Name,Description,Price');
    expect(lines[1]).toBe('Mains,Burger,Beef patty,12.50');
  });

  it('sorts categories by displayOrder', () => {
    const contents: MenuContents = {
      categories: [
        { name: 'Desserts', displayOrder: 2, items: [{ name: 'Cake', price: 8, displayOrder: 0 }] },
        { name: 'Starters', displayOrder: 0, items: [{ name: 'Soup', price: 5, displayOrder: 0 }] },
        { name: 'Mains', displayOrder: 1, items: [{ name: 'Steak', price: 25, displayOrder: 0 }] },
      ],
    };

    const result = formatMenuCsv(contents);
    const lines = result.split('\n');

    expect(lines[1]).toContain('Starters');
    expect(lines[2]).toContain('Mains');
    expect(lines[3]).toContain('Desserts');
  });

  it('sorts items within a category by displayOrder', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Mains',
        displayOrder: 0,
        items: [
          { name: 'Pasta', price: 14, displayOrder: 2 },
          { name: 'Burger', price: 12, displayOrder: 0 },
          { name: 'Steak', price: 25, displayOrder: 1 },
        ],
      }],
    };

    const result = formatMenuCsv(contents);
    const lines = result.split('\n');

    expect(lines[1]).toContain('Burger');
    expect(lines[2]).toContain('Steak');
    expect(lines[3]).toContain('Pasta');
  });

  it('handles items with missing optional fields', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Drinks',
        displayOrder: 0,
        items: [{ name: 'Water', displayOrder: 0 }],
      }],
    };

    const result = formatMenuCsv(contents);
    const lines = result.split('\n');

    expect(lines[1]).toBe('Drinks,Water,,0.00');
  });

  it('escapes CSV special characters in fields', () => {
    const contents: MenuContents = {
      categories: [{
        name: 'Specials, "Best"',
        displayOrder: 0,
        items: [{
          name: 'Fish & Chips',
          description: 'Fresh cod, crispy batter',
          price: 15.99,
          displayOrder: 0,
        }],
      }],
    };

    const result = formatMenuCsv(contents);
    const lines = result.split('\n');

    expect(lines[1]).toContain('"Specials, ""Best"""');
    expect(lines[1]).toContain('"Fresh cod, crispy batter"');
  });

  it('handles multiple categories with multiple items', () => {
    const contents: MenuContents = {
      categories: [
        {
          name: 'Starters',
          displayOrder: 0,
          items: [
            { name: 'Soup', description: 'Tomato', price: 5, displayOrder: 0 },
            { name: 'Salad', description: 'Garden', price: 7, displayOrder: 1 },
          ],
        },
        {
          name: 'Mains',
          displayOrder: 1,
          items: [
            { name: 'Steak', description: 'Ribeye', price: 30, displayOrder: 0 },
          ],
        },
      ],
    };

    const result = formatMenuCsv(contents);
    const lines = result.split('\n');

    // Header + 3 data rows
    const EXPECTED_LINE_COUNT = 4;
    expect(lines).toHaveLength(EXPECTED_LINE_COUNT);
  });
});

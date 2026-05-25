import {
  formatPdfPrice,
  sanitizePdfFilename,
  extractVariantRows,
  buildItemRow,
  buildCategorySection,
  buildPdfMenuData,
} from './menuPdfHelpers';

import type { Category, MenuItem, MenuContents } from '../../../../types/menuTypes';


describe('menuPdfHelpers', () => {
  describe('formatPdfPrice', () => {
    it('formats a normal price with two decimals', () => {
      expect(formatPdfPrice(12.5)).toBe('$12.50');
    });

    it('formats zero as $0.00', () => {
      expect(formatPdfPrice(0)).toBe('$0.00');
    });

    it('returns empty string for undefined', () => {
      expect(formatPdfPrice(undefined)).toBe('');
    });
  });

  describe('sanitizePdfFilename', () => {
    it('replaces special characters with underscores', () => {
      expect(sanitizePdfFilename('My Menu! @2024')).toBe('My_Menu___2024');
    });

    it('truncates long names', () => {
      const longName = 'a'.repeat(100);
      expect(sanitizePdfFilename(longName)).toHaveLength(50);
    });

    it('preserves alphanumeric and hyphens', () => {
      expect(sanitizePdfFilename('lunch-specials_v2')).toBe('lunch-specials_v2');
    });
  });

  describe('extractVariantRows', () => {
    it('returns empty array when no variant groups', () => {
      const item: MenuItem = { name: 'Test' };
      expect(extractVariantRows(item)).toEqual([]);
    });

    it('extracts available variants with prices', () => {
      const item: MenuItem = {
        name: 'Coffee',
        variantGroups: [{
          name: 'Size',
          variants: [
            { name: 'Small', price: 3, isAvailable: true },
            { name: 'Large', price: 5, isAvailable: true },
          ],
        }],
      };
      const rows = extractVariantRows(item);
      expect(rows).toHaveLength(1);
      expect(rows[0].groupName).toBe('Size');
      expect(rows[0].options).toBe('Small ($3.00), Large ($5.00)');
    });

    it('filters out unavailable variants', () => {
      const item: MenuItem = {
        name: 'Coffee',
        variantGroups: [{
          name: 'Size',
          variants: [
            { name: 'Small', price: 3, isAvailable: true },
            { name: 'XL', price: 7, isAvailable: false },
          ],
        }],
      };
      const rows = extractVariantRows(item);
      expect(rows[0].options).toBe('Small ($3.00)');
    });
  });

  describe('buildItemRow', () => {
    it('builds a complete item row', () => {
      const item: MenuItem = {
        name: 'Burger',
        description: 'Juicy beef burger',
        price: 15.99,
        tags: ['Gluten-Free'],
        isFeatured: true,
        isAvailable: true,
      };
      const row = buildItemRow(item);
      expect(row.name).toBe('Burger');
      expect(row.description).toBe('Juicy beef burger');
      expect(row.price).toBe('$15.99');
      expect(row.tags).toEqual(['Gluten-Free']);
      expect(row.isFeatured).toBe(true);
      expect(row.isUnavailable).toBe(false);
    });

    it('handles missing optional fields', () => {
      const item: MenuItem = {};
      const row = buildItemRow(item);
      expect(row.name).toBe('');
      expect(row.description).toBe('');
      expect(row.price).toBe('');
      expect(row.tags).toEqual([]);
      expect(row.isFeatured).toBe(false);
      expect(row.isUnavailable).toBe(false);
    });

    it('marks unavailable items', () => {
      const item: MenuItem = { name: 'Soup', isAvailable: false };
      const row = buildItemRow(item);
      expect(row.isUnavailable).toBe(true);
    });
  });

  describe('buildCategorySection', () => {
    it('builds a category with filtered available items', () => {
      const category: Category = {
        name: 'Appetizers',
        description: 'Start your meal',
        items: [
          { name: 'Fries', price: 5, isAvailable: true },
          { name: 'Salad', price: 8, isAvailable: false },
        ],
      };
      const section = buildCategorySection(category);
      expect(section.title).toBe('Appetizers');
      expect(section.description).toBe('Start your meal');
      expect(section.items).toHaveLength(1);
      expect(section.items[0].name).toBe('Fries');
    });

    it('handles empty category', () => {
      const category: Category = { name: 'Empty' };
      const section = buildCategorySection(category);
      expect(section.items).toHaveLength(0);
    });
  });

  describe('buildPdfMenuData', () => {
    it('builds full PDF data and filters empty categories', () => {
      const contents: MenuContents = {
        categories: [
          {
            name: 'Mains',
            items: [{ name: 'Steak', price: 30, isAvailable: true }],
          },
          {
            name: 'Empty Section',
            items: [{ name: 'Hidden', isAvailable: false }],
          },
        ],
      };
      const data = buildPdfMenuData('Dinner Menu', 'Joe\'s Diner', contents);
      expect(data.menuName).toBe('Dinner Menu');
      expect(data.restaurantName).toBe('Joe\'s Diner');
      expect(data.categories).toHaveLength(1);
      expect(data.categories[0].title).toBe('Mains');
    });

    it('handles null contents', () => {
      const data = buildPdfMenuData('Menu', 'Restaurant', null);
      expect(data.categories).toHaveLength(0);
    });

    it('handles undefined contents', () => {
      const data = buildPdfMenuData('Menu', 'Restaurant', undefined);
      expect(data.categories).toHaveLength(0);
    });
  });
});

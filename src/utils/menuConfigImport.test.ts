/**
 * Unit tests for menuConfigImport utility.
 *
 * Tests focus on logic:
 * - JSON parsing and validation
 * - Type guard behavior
 * - Version migration
 * - Error handling for invalid inputs
 * - File reading (mocked)
 */

import { isValueDefined } from '@dloizides/utils';

import { exportMenuConfig } from './menuConfigExport';
import {
  parseMenuConfig,
  validateMenuConfig,
  migrateMenuConfig,
  importMenuConfigFromFile,
  getValidationErrors,
  CURRENT_FORMAT_VERSION,
  MAX_FILE_SIZE_BYTES,
} from './menuConfigImport';
import LayoutTemplate from '../types/enums/LayoutTemplate';

import type { MenuContents } from '../types/menuTypes';

describe('menuConfigImport', () => {
  describe('validateMenuConfig', () => {
    it('returns true for valid empty MenuContents', () => {
      const config: MenuContents = {};
      expect(validateMenuConfig(config)).toBe(true);
    });

    it('returns true for MenuContents with categories', () => {
      const config: MenuContents = {
        categories: [
          { name: 'Appetizers', displayOrder: 0 },
          { name: 'Main Dishes', displayOrder: 1 },
        ],
      };
      expect(validateMenuConfig(config)).toBe(true);
    });

    it('returns true for complete MenuContents', () => {
      const config: MenuContents = {
        schemaVersion: 2,
        titleFont: 'Arial',
        titleFontSize: 24,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        typography: { titleFont: 'Roboto' },
        colorScheme: { background: '#FAFAFA' },
        layout: { template: LayoutTemplate.ModernGrid },
        header: { showLogo: true },
        spacing: { pagePadding: 16 },
        categories: [
          { name: 'Test', displayOrder: 0, items: [{ name: 'Item 1', displayOrder: 0, price: 9.99 }] },
        ],
      };
      expect(validateMenuConfig(config)).toBe(true);
    });

    it('returns false for null', () => {
      expect(validateMenuConfig(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(validateMenuConfig(undefined)).toBe(false);
    });

    it('returns false for array', () => {
      expect(validateMenuConfig([])).toBe(false);
    });

    it('returns false for primitive', () => {
      expect(validateMenuConfig('string')).toBe(false);
      expect(validateMenuConfig(123)).toBe(false);
      expect(validateMenuConfig(true)).toBe(false);
    });

    it('returns false for invalid schemaVersion type', () => {
      const config = { schemaVersion: 'two' };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid titleFont type', () => {
      const config = { titleFont: 123 };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid titleFontSize type', () => {
      const config = { titleFontSize: 'large' };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for non-array categories', () => {
      const config = { categories: 'not an array' };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid category structure', () => {
      const config = { categories: [{ displayOrder: 0 }] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for category with invalid name', () => {
      const config = { categories: [{ name: 123, displayOrder: 0 }] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for category with invalid displayOrder', () => {
      const config = { categories: [{ name: 'Test', displayOrder: 'first' }] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid item structure', () => {
      const config = { categories: [{ name: 'Test', displayOrder: 0, items: [{ displayOrder: 0 }] }] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for item with invalid name', () => {
      const config = { categories: [{ name: 'Test', displayOrder: 0, items: [{ name: null, displayOrder: 0 }] }] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for item with invalid price', () => {
      const config = { categories: [{ name: 'Test', displayOrder: 0, items: [{ name: 'Item', displayOrder: 0, price: 'free' }] }] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid typography type', () => {
      const config = { typography: 'Arial' };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid colorScheme type', () => {
      const config = { colorScheme: ['#FFF', '#000'] };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid layout type', () => {
      const config = { layout: 'grid' };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid header type', () => {
      const config = { header: true };
      expect(validateMenuConfig(config)).toBe(false);
    });

    it('returns false for invalid spacing type', () => {
      const config = { spacing: 16 };
      expect(validateMenuConfig(config)).toBe(false);
    });
  });

  describe('parseMenuConfig', () => {
    it('returns error for empty string', () => {
      const result = parseMenuConfig('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty configuration file');
      expect(result.contents).toBeNull();
    });

    it('returns error for whitespace-only string', () => {
      const result = parseMenuConfig('   \n\t  ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty configuration file');
    });

    it('returns error for invalid JSON', () => {
      const result = parseMenuConfig('{ invalid json }');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('returns error for truncated JSON', () => {
      const result = parseMenuConfig('{ "categories": [');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('parses valid raw MenuContents', () => {
      const contents: MenuContents = { categories: [{ name: 'Test', displayOrder: 0 }] };
      const json = JSON.stringify(contents);
      const result = parseMenuConfig(json);
      expect(result.success).toBe(true);
      expect(result.contents?.categories?.[0]?.name).toBe('Test');
      expect(result.metadata).toBeNull();
    });

    it('parses valid exported format with metadata', () => {
      const contents: MenuContents = { categories: [{ name: 'Exported', displayOrder: 0 }] };
      const exported = exportMenuConfig(contents);
      const result = parseMenuConfig(exported);
      expect(result.success).toBe(true);
      expect(result.contents?.categories?.[0]?.name).toBe('Exported');
      expect(result.metadata).not.toBeNull();
      expect(result.metadata?.appVersion).toBeDefined();
    });

    it('applies normalization to imported contents', () => {
      const contents: MenuContents = { schemaVersion: 1, categories: [{ name: 'Legacy', displayOrder: 0 }] };
      const json = JSON.stringify(contents);
      const result = parseMenuConfig(json);
      expect(result.success).toBe(true);
      expect(result.contents?.typography).toBeDefined();
      expect(result.contents?.colorScheme).toBeDefined();
    });

    it('accepts any plain object as MenuContents since all fields are optional', () => {
      // MenuContents has all optional fields, so any plain object is technically valid
      const json = JSON.stringify({ notAMenu: true });
      const result = parseMenuConfig(json);
      expect(result.success).toBe(true);
      expect(result.contents).toBeDefined();
    });

    it('returns error for array input', () => {
      const json = JSON.stringify([{ name: 'Test' }]);
      const result = parseMenuConfig(json);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid menu configuration structure');
    });

    it('handles null values in JSON', () => {
      const json = JSON.stringify({
        titleFont: null,
        backgroundColor: null,
        categories: [{ name: 'Test', displayOrder: 0, imageContentId: null }],
      });
      const result = parseMenuConfig(json);
      expect(result.success).toBe(true);
    });

    it('handles complete complex structure', () => {
      const contents: MenuContents = {
        schemaVersion: 2,
        typography: { titleFont: 'Custom', titleFontSize: 32 },
        colorScheme: { background: '#123456', accent: '#ABCDEF' },
        categories: [
          {
            name: 'Category 1',
            displayOrder: 0,
            description: 'First category',
            items: [
              {
                name: 'Item 1',
                displayOrder: 0,
                price: 12.99,
                isAvailable: true,
                badges: [{ text: 'New', backgroundColor: '#FF0', textColor: '#000' }],
              },
            ],
          },
        ],
      };
      const json = JSON.stringify(contents);
      const result = parseMenuConfig(json);
      expect(result.success).toBe(true);
      expect(result.contents?.categories?.[0]?.items?.[0]?.badges?.[0]?.text).toBe('New');
    });
  });

  describe('migrateMenuConfig', () => {
    it('returns contents unchanged for current version', () => {
      const contents: MenuContents = { schemaVersion: 2, categories: [{ name: 'Test', displayOrder: 0 }] };
      const result = migrateMenuConfig(contents, CURRENT_FORMAT_VERSION);
      expect(result.categories?.[0]?.name).toBe('Test');
    });

    it('adds schemaVersion when missing', () => {
      const contents: MenuContents = { categories: [{ name: 'Test', displayOrder: 0 }] };
      const result = migrateMenuConfig(contents, 1);
      expect(result.schemaVersion).toBe(2);
    });

    it('preserves existing schemaVersion', () => {
      const contents: MenuContents = { schemaVersion: 2, categories: [] };
      const result = migrateMenuConfig(contents, 1);
      expect(result.schemaVersion).toBe(2);
    });

    it('does not mutate original contents', () => {
      const original: MenuContents = { categories: [{ name: 'Original', displayOrder: 0 }] };
      const originalCopy = JSON.parse(JSON.stringify(original)) as MenuContents;
      migrateMenuConfig(original, 1);
      expect(original).toEqual(originalCopy);
    });
  });

  describe('importMenuConfigFromFile', () => {
    function createMockFile(content: string, name: string, type: string, size?: number): File {
      const blob = new Blob([content], { type });
      const file = new File([blob], name, { type });
      if (isValueDefined(size)) Object.defineProperty(file, 'size', { value: size, writable: false });
      return file;
    }

    it('returns error for file too large', async () => {
      const largeFile = createMockFile('{}', 'large.json', 'application/json', MAX_FILE_SIZE_BYTES + 1);
      const result = await importMenuConfigFromFile(largeFile);
      expect(result.success).toBe(false);
      expect(result.error).toContain('File too large');
    });

    it('returns error for invalid file type', async () => {
      const textFile = createMockFile('test', 'config.txt', 'text/plain');
      const result = await importMenuConfigFromFile(textFile);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('accepts .json file extension', async () => {
      const contents: MenuContents = { categories: [] };
      const jsonFile = createMockFile(JSON.stringify(contents), 'config.json', '');
      const result = await importMenuConfigFromFile(jsonFile);
      expect(result.success).toBe(true);
    });

    it('accepts application/json MIME type', async () => {
      const contents: MenuContents = { categories: [] };
      const jsonFile = createMockFile(JSON.stringify(contents), 'config', 'application/json');
      const result = await importMenuConfigFromFile(jsonFile);
      expect(result.success).toBe(true);
    });

    it('parses valid JSON file successfully', async () => {
      const contents: MenuContents = { categories: [{ name: 'Test Category', displayOrder: 0 }] };
      const jsonFile = createMockFile(JSON.stringify(contents), 'config.json', 'application/json');
      const result = await importMenuConfigFromFile(jsonFile);
      expect(result.success).toBe(true);
      expect(result.contents?.categories?.[0]?.name).toBe('Test Category');
    });

    it('returns error for invalid JSON in file', async () => {
      const jsonFile = createMockFile('{ invalid }', 'config.json', 'application/json');
      const result = await importMenuConfigFromFile(jsonFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('accepts any plain object in file since MenuContents has all optional fields', async () => {
      const jsonFile = createMockFile('{ "notValid": true }', 'config.json', 'application/json');
      const result = await importMenuConfigFromFile(jsonFile);
      // MenuContents has all optional fields, so any plain object is valid
      expect(result.success).toBe(true);
      expect(result.contents).toBeDefined();
    });

    it('extracts metadata from exported format', async () => {
      const contents: MenuContents = { categories: [] };
      const exported = exportMenuConfig(contents);
      const jsonFile = createMockFile(exported, 'config.json', 'application/json');
      const result = await importMenuConfigFromFile(jsonFile);
      expect(result.success).toBe(true);
      expect(result.metadata).not.toBeNull();
      expect(result.metadata?.exportFormatVersion).toBeDefined();
    });
  });

  describe('getValidationErrors', () => {
    it('returns empty array for valid config', () => {
      const config: MenuContents = { categories: [{ name: 'Test', displayOrder: 0 }] };
      const errors = getValidationErrors(config);
      expect(errors).toEqual([]);
    });

    it('returns error for non-object config', () => {
      const errors = getValidationErrors('not an object');
      expect(errors).toHaveLength(1);
      expect(errors[0]?.field).toBe('root');
    });

    it('returns error for null', () => {
      const errors = getValidationErrors(null);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.message).toContain('object');
    });

    it('returns error for non-array categories', () => {
      const config = { categories: 'not array' };
      const errors = getValidationErrors(config);
      expect(errors.some((e) => e.field === 'categories')).toBe(true);
    });

    it('returns error for category without name', () => {
      const config = { categories: [{ displayOrder: 0 }] };
      const errors = getValidationErrors(config);
      expect(errors.some((e) => e.field.includes('categories[0]'))).toBe(true);
    });

    it('returns error for non-object category', () => {
      const config = { categories: ['not an object'] };
      const errors = getValidationErrors(config);
      expect(errors.some((e) => e.field === 'categories[0]')).toBe(true);
    });

    it('returns multiple errors for multiple issues', () => {
      const config = { categories: [{ displayOrder: 0 }, { name: 123 }] };
      const errors = getValidationErrors(config);
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('constants', () => {
    it('CURRENT_FORMAT_VERSION is a positive integer', () => {
      expect(Number.isInteger(CURRENT_FORMAT_VERSION)).toBe(true);
      expect(CURRENT_FORMAT_VERSION).toBeGreaterThan(0);
    });

    it('MAX_FILE_SIZE_BYTES is reasonable', () => {
      const ONE_KB = 1024;
      const HUNDRED_MB = 100 * 1024 * 1024;
      expect(MAX_FILE_SIZE_BYTES).toBeGreaterThan(ONE_KB);
      expect(MAX_FILE_SIZE_BYTES).toBeLessThan(HUNDRED_MB);
    });
  });
});

/**
 * Unit tests for menuConfigExport utility.
 *
 * Tests focus on logic:
 * - Correct JSON serialization with metadata
 * - Filename generation
 * - Blob creation
 * - Download trigger mechanism (mocked)
 */

import {
  exportMenuConfig,
  createExportMetadata,
  generateExportFilename,
  downloadMenuConfig,
  createMenuConfigBlob,
  EXPORT_FORMAT_VERSION,
  APP_VERSION,
} from './menuConfigExport';
import FontWeight from '../types/enums/FontWeight';
import HorizontalPosition from '../types/enums/HorizontalPosition';

import type { ExportedMenuConfig } from './menuConfigExport';
import type { MenuContents } from '../types/menuTypes';

describe('menuConfigExport', () => {
  const mockDate = new Date('2024-06-15T10:30:00.000Z');
  const originalDate = global.Date;
  const mockISOString = '2024-06-15T10:30:00.000Z';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
    global.Date = originalDate;
  });

  describe('createExportMetadata', () => {
    it('returns metadata with correct format version', () => {
      const metadata = createExportMetadata();
      expect(metadata.exportFormatVersion).toBe(EXPORT_FORMAT_VERSION);
    });

    it('returns metadata with correct app version', () => {
      const metadata = createExportMetadata();
      expect(metadata.appVersion).toBe(APP_VERSION);
    });

    it('returns metadata with ISO date string', () => {
      const metadata = createExportMetadata();
      expect(metadata.exportDate).toBe(mockISOString);
    });

    it('returns all required fields', () => {
      const metadata = createExportMetadata();
      expect(metadata).toHaveProperty('exportFormatVersion');
      expect(metadata).toHaveProperty('exportDate');
      expect(metadata).toHaveProperty('appVersion');
    });
  });

  describe('exportMenuConfig', () => {
    it('returns valid JSON string', () => {
      const contents: MenuContents = { categories: [] };
      const result = exportMenuConfig(contents);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('includes metadata wrapper', () => {
      const contents: MenuContents = { categories: [] };
      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('contents');
    });

    it('preserves menu contents exactly', () => {
      const contents: MenuContents = {
        schemaVersion: 2,
        categories: [
          {
            name: 'Appetizers',
            displayOrder: 0,
            items: [
              { name: 'Spring Rolls', displayOrder: 0, price: 8.99 },
              { name: 'Soup', displayOrder: 1, price: 5.99 },
            ],
          },
        ],
        typography: { titleFont: 'Arial', titleFontSize: 24 },
        colorScheme: { background: '#FFFFFF', text: '#000000' },
      };

      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed.contents).toEqual(contents);
    });

    it('includes correct metadata in output', () => {
      const contents: MenuContents = {};
      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;

      expect(parsed.metadata.exportFormatVersion).toBe(EXPORT_FORMAT_VERSION);
      expect(parsed.metadata.appVersion).toBe(APP_VERSION);
      expect(parsed.metadata.exportDate).toBe(mockISOString);
    });

    it('formats JSON with proper indentation', () => {
      const contents: MenuContents = { categories: [] };
      const result = exportMenuConfig(contents);
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('handles empty categories array', () => {
      const contents: MenuContents = { categories: [] };
      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed.contents.categories).toEqual([]);
    });

    it('handles undefined categories', () => {
      const contents: MenuContents = {};
      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed.contents.categories).toBeUndefined();
    });

    it('handles complex nested structure', () => {
      const contents: MenuContents = {
        schemaVersion: 2,
        categories: [
          {
            name: 'Main Dishes',
            displayOrder: 0,
            description: 'Our signature dishes',
            typography: { titleFontSize: 28, titleFontWeight: FontWeight.Bold },
            items: [
              {
                name: 'Steak',
                displayOrder: 0,
                price: 25.99,
                description: 'Grilled to perfection',
                isAvailable: true,
                badges: [{ text: 'Popular', backgroundColor: '#FF0000', textColor: '#FFFFFF' }],
              },
            ],
          },
        ],
        header: { showLogo: true, logoPosition: HorizontalPosition.Center },
        spacing: { pagePadding: 16, categorySpacing: 24 },
      };

      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed.contents.categories?.[0]?.items?.[0]?.badges?.[0]?.text).toBe('Popular');
    });

    it('handles special characters in content', () => {
      const contents: MenuContents = {
        categories: [
          {
            name: 'Special "Quotes" & <Tags>',
            displayOrder: 0,
            description: 'Price: $10',
          },
        ],
      };

      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed.contents.categories?.[0]?.name).toBe('Special "Quotes" & <Tags>');
    });

    it('handles null values in content', () => {
      const contents: MenuContents = {
        titleFont: null,
        backgroundColor: null,
        categories: [{ name: 'Test', displayOrder: 0, imageContentId: null }],
      };

      const result = exportMenuConfig(contents);
      const parsed = JSON.parse(result) as ExportedMenuConfig;
      expect(parsed.contents.titleFont).toBeNull();
      expect(parsed.contents.backgroundColor).toBeNull();
    });
  });

  describe('generateExportFilename', () => {
    it('uses default name when no custom name provided', () => {
      const filename = generateExportFilename();
      expect(filename).toContain('menu-config');
    });

    it('uses custom name when provided', () => {
      const filename = generateExportFilename('my-custom-menu');
      expect(filename).toContain('my-custom-menu');
    });

    it('includes date in filename', () => {
      const filename = generateExportFilename();
      expect(filename).toContain('2024-06-15');
    });

    it('ends with .json extension', () => {
      const filename = generateExportFilename();
      expect(filename.endsWith('.json')).toBe(true);
    });

    it('formats filename correctly', () => {
      const filename = generateExportFilename('test-menu');
      expect(filename).toBe('test-menu-2024-06-15.json');
    });
  });

  describe('downloadMenuConfig', () => {
    let mockCreateObjectURL: jest.SpyInstance;
    let mockRevokeObjectURL: jest.SpyInstance;
    let mockAppendChild: jest.SpyInstance;
    let mockRemoveChild: jest.SpyInstance;
    let mockClick: jest.Mock;
    let mockAnchor: Partial<HTMLAnchorElement>;

    beforeEach(() => {
      mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      mockRevokeObjectURL = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();

      mockClick = jest.fn();
      mockAnchor = { href: '', download: '', click: mockClick };

      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as HTMLAnchorElement);
      mockAppendChild = jest.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor as Node);
      mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor as Node);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates blob with correct content', () => {
      const contents: MenuContents = { categories: [] };
      downloadMenuConfig(contents);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });

    it('sets correct href on anchor element', () => {
      const contents: MenuContents = { categories: [] };
      downloadMenuConfig(contents);
      expect(mockAnchor.href).toBe('blob:test-url');
    });

    it('sets correct download filename', () => {
      const contents: MenuContents = { categories: [] };
      downloadMenuConfig(contents, 'custom-name');
      expect(mockAnchor.download).toContain('custom-name');
      expect((mockAnchor.download ?? '').endsWith('.json')).toBe(true);
    });

    it('triggers click on anchor', () => {
      const contents: MenuContents = { categories: [] };
      downloadMenuConfig(contents);
      expect(mockClick).toHaveBeenCalled();
    });

    it('cleans up anchor element after download', () => {
      const contents: MenuContents = { categories: [] };
      downloadMenuConfig(contents);
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('revokes blob URL after download', () => {
      const contents: MenuContents = { categories: [] };
      downloadMenuConfig(contents);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  describe('createMenuConfigBlob', () => {
    it('returns a Blob instance', () => {
      const contents: MenuContents = { categories: [] };
      const blob = createMenuConfigBlob(contents);
      expect(blob).toBeInstanceOf(Blob);
    });

    it('creates blob with correct MIME type', () => {
      const contents: MenuContents = { categories: [] };
      const blob = createMenuConfigBlob(contents);
      expect(blob.type).toBe('application/json');
    });

    it('creates blob with correct content size', () => {
      const contents: MenuContents = { categories: [] };
      const blob = createMenuConfigBlob(contents);
      const expectedJson = exportMenuConfig(contents);
      expect(blob.size).toBe(new Blob([expectedJson]).size);
    });

    it('blob content matches exported JSON', async () => {
      const contents: MenuContents = { categories: [{ name: 'Test', displayOrder: 0 }] };
      const blob = createMenuConfigBlob(contents);
      const expectedJson = exportMenuConfig(contents);
      // Read blob content using FileReader
      const reader = new FileReader();
      const blobText = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });
      expect(blobText).toBe(expectedJson);
    });
  });

  describe('constants', () => {
    it('EXPORT_FORMAT_VERSION is a positive integer', () => {
      expect(Number.isInteger(EXPORT_FORMAT_VERSION)).toBe(true);
      expect(EXPORT_FORMAT_VERSION).toBeGreaterThan(0);
    });

    it('APP_VERSION is a valid semver string', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});

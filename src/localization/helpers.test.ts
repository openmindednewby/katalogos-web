import { FM, FD } from './helpers';
import i18n from './i18n';

import type { TranslationKey } from '../@types/i18next';

/** Cast test-only keys to TranslationKey for type compatibility. */
const testKey = (k: string): TranslationKey => k as TranslationKey;

// Mock i18n before importing helpers
jest.mock('./i18n', () => ({
  t: jest.fn((key: string, options?: Record<string, unknown>) => {
    // Simple mock implementation that replaces {{p1}}, {{p2}}, {{p3}} with values
    const translations: Record<string, string> = {
      'test.simple': 'Simple message',
      'test.oneParam': 'Deleted {{p1}} templates',
      'test.twoParams': 'Moved {{p1}} items to {{p2}}',
      'test.threeParams': 'Showing {{p1}}-{{p2}} of {{p3}}',
      'test.missing': undefined as unknown as string,
    };
    let result = translations[key] ?? key;

    if (options?.p1 !== null && options?.p1 !== undefined)
      result = result.replace('{{p1}}', String(options.p1));


    if (options?.p2 !== null && options?.p2 !== undefined)
      result = result.replace('{{p2}}', String(options.p2));

    if (options?.p3 !== null && options?.p3 !== undefined)
      result = result.replace('{{p3}}', String(options.p3));

    return result;
  }),
  language: 'en',
}));

describe('Localization Helpers', () => {
  describe('FM (Format Message)', () => {
    it('returns formatted message with no parameters', () => {
      const result = FM(testKey('test.simple'));
      expect(result).toBe('Simple message');
      expect(i18n.t).toHaveBeenCalledWith('test.simple', {});
    });

    it('returns formatted message with one parameter', () => {
      const result = FM(testKey('test.oneParam'), '5');
      expect(result).toBe('Deleted 5 templates');
      expect(i18n.t).toHaveBeenCalledWith('test.oneParam', { p1: '5' });
    });

    it('returns formatted message with two parameters', () => {
      const result = FM(testKey('test.twoParams'), '10', 'archive');
      expect(result).toBe('Moved 10 items to archive');
      expect(i18n.t).toHaveBeenCalledWith('test.twoParams', { p1: '10', p2: 'archive' });
    });

    it('returns key when translation is missing', () => {
      const result = FM(testKey('test.missing'));
      expect(result).toBe('test.missing');
    });

    it('handles numeric parameters by converting to string', () => {
      const result = FM(testKey('test.oneParam'), '42');
      expect(result).toBe('Deleted 42 templates');
    });

    it('returns formatted message with three parameters', () => {
      const result = FM(testKey('test.threeParams'), '1', '10', '100');
      expect(result).toBe('Showing 1-10 of 100');
      expect(i18n.t).toHaveBeenCalledWith('test.threeParams', { p1: '1', p2: '10', p3: '100' });
    });

    it('handles undefined parameters gracefully', () => {
      FM(testKey('test.oneParam'), undefined);
      expect(i18n.t).toHaveBeenCalledWith('test.oneParam', {});
    });
  });

  describe('FD (Format Date)', () => {
    const mockDate = new Date('2024-06-15T10:30:00Z');

    it('formats date with default options', () => {
      const result = FD(mockDate);
      // Result depends on locale, just verify it's not empty
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('formats date with custom options', () => {
      const result = FD(mockDate, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('returns empty string for null date', () => {
      const result = FD(null);
      expect(result).toBe('');
    });

    it('returns empty string for undefined date', () => {
      const result = FD(undefined);
      expect(result).toBe('');
    });

    it('formats date string when passed as Date object', () => {
      const dateFromString = new Date('2024-01-01');
      const result = FD(dateFromString);
      expect(result).toBeTruthy();
    });
  });
});

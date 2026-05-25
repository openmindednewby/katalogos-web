/**
 * Tests for supportedLanguages utility functions.
 */
import { getLanguageName, SUPPORTED_LANGUAGES } from './supportedLanguages';

describe('getLanguageName', () => {
  it('returns the correct name for a known language code', () => {
    expect(getLanguageName('es')).toBe('Spanish');
    expect(getLanguageName('fr')).toBe('French');
    expect(getLanguageName('zh')).toBe('Chinese');
  });

  it('returns the code itself for an unknown language', () => {
    expect(getLanguageName('xx')).toBe('xx');
    expect(getLanguageName('tlh')).toBe('tlh');
  });

  it('returns the code for an empty string', () => {
    expect(getLanguageName('')).toBe('');
  });
});

describe('SUPPORTED_LANGUAGES', () => {
  it('contains English as the first entry', () => {
    expect(SUPPORTED_LANGUAGES[0].code).toBe('en');
    expect(SUPPORTED_LANGUAGES[0].name).toBe('English');
  });

  it('has unique codes', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('has at least 10 languages', () => {
    const MIN_LANGUAGES = 10;
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(MIN_LANGUAGES);
  });
});

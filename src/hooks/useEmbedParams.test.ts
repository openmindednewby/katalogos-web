/**
 * Tests for embed param parsing logic.
 * Tests the pure functions, not the hook (which depends on expo-router).
 */
import { parseTheme, parseSections, parseAccentColor } from './useEmbedParams';

describe('parseTheme', () => {
  it('returns "light" for "light" input', () => {
    expect(parseTheme('light')).toBe('light');
  });

  it('returns "dark" for "dark" input', () => {
    expect(parseTheme('dark')).toBe('dark');
  });

  it('is case-insensitive', () => {
    expect(parseTheme('Light')).toBe('light');
    expect(parseTheme('DARK')).toBe('dark');
  });

  it('returns null for invalid theme', () => {
    expect(parseTheme('blue')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseTheme(undefined)).toBeNull();
  });
});

describe('parseSections', () => {
  it('parses comma-separated sections', () => {
    expect(parseSections('appetizers,mains,desserts')).toEqual(['appetizers', 'mains', 'desserts']);
  });

  it('trims whitespace from section names', () => {
    expect(parseSections(' appetizers , mains ')).toEqual(['appetizers', 'mains']);
  });

  it('returns null for undefined', () => {
    expect(parseSections(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseSections('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseSections('   ')).toBeNull();
  });

  it('filters out empty segments from trailing commas', () => {
    expect(parseSections('appetizers,,mains,')).toEqual(['appetizers', 'mains']);
  });
});

describe('parseAccentColor', () => {
  it('returns trimmed color string', () => {
    expect(parseAccentColor(' #ff0000 ')).toBe('#ff0000');
  });

  it('returns null for undefined', () => {
    expect(parseAccentColor(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseAccentColor('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseAccentColor('   ')).toBeNull();
  });
});

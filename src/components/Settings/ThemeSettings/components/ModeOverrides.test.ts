/**
 * Unit tests for ModeOverrides logic.
 * Tests exported constants and token key structure.
 */
import { MODE_TOKEN_KEYS, TOKEN_LABEL_MAP } from './ModeOverrides';

const EXPECTED_TOKEN_COUNT = 7;

describe('MODE_TOKEN_KEYS', () => {
  it('should contain all 7 theme mode color tokens', () => {
    expect(MODE_TOKEN_KEYS).toHaveLength(EXPECTED_TOKEN_COUNT);
  });

  it('should include background', () => {
    expect(MODE_TOKEN_KEYS).toContain('background');
  });

  it('should include surface', () => {
    expect(MODE_TOKEN_KEYS).toContain('surface');
  });

  it('should include surfaceElevated', () => {
    expect(MODE_TOKEN_KEYS).toContain('surfaceElevated');
  });

  it('should include text', () => {
    expect(MODE_TOKEN_KEYS).toContain('text');
  });

  it('should include textSecondary', () => {
    expect(MODE_TOKEN_KEYS).toContain('textSecondary');
  });

  it('should include border', () => {
    expect(MODE_TOKEN_KEYS).toContain('border');
  });

  it('should include divider', () => {
    expect(MODE_TOKEN_KEYS).toContain('divider');
  });
});

describe('TOKEN_LABEL_MAP', () => {
  it('should have a translation key for each token', () => {
    for (const key of MODE_TOKEN_KEYS) {
      expect(TOKEN_LABEL_MAP[key]).toBeDefined();
      expect(typeof TOKEN_LABEL_MAP[key]).toBe('string');
    }
  });

  it('should use settings.themeSettings namespace for all keys', () => {
    for (const key of MODE_TOKEN_KEYS)
      expect(TOKEN_LABEL_MAP[key]).toMatch(/^settings\.themeSettings\./);
  });

  it('should have unique translation keys', () => {
    const values = Object.values(TOKEN_LABEL_MAP);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

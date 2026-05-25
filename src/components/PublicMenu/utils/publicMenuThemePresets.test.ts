/**
 * Unit tests for public menu theme presets.
 * Ensures all presets are complete, valid, and consistent.
 */
import {
  DEFAULT_PUBLIC_MENU_THEME,
  DEFAULT_PUBLIC_MENU_THEME_ID,
  PUBLIC_MENU_THEME_COUNT,
  PUBLIC_MENU_THEME_PRESETS,
} from './publicMenuThemePresets';

const MINIMUM_PRESET_COUNT = 10;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

describe('PUBLIC_MENU_THEME_PRESETS', () => {
  it('has at least 10 presets', () => {
    expect(PUBLIC_MENU_THEME_PRESETS.length).toBeGreaterThanOrEqual(MINIMUM_PRESET_COUNT);
  });

  it('matches the exported count constant', () => {
    expect(PUBLIC_MENU_THEME_PRESETS.length).toBe(PUBLIC_MENU_THEME_COUNT);
  });

  it('has unique IDs', () => {
    const ids = PUBLIC_MENU_THEME_PRESETS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has unique name keys', () => {
    const keys = PUBLIC_MENU_THEME_PRESETS.map((p) => p.nameKey);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it.each(PUBLIC_MENU_THEME_PRESETS.map((p) => [p.id, p]))(
    '%s has valid hex colors',
    (_id, preset) => {
      const { colors } = preset;
      expect(colors.background).toMatch(HEX_COLOR_REGEX);
      expect(colors.surface).toMatch(HEX_COLOR_REGEX);
      expect(colors.text).toMatch(HEX_COLOR_REGEX);
      expect(colors.textSecondary).toMatch(HEX_COLOR_REGEX);
      expect(colors.accent).toMatch(HEX_COLOR_REGEX);
      expect(colors.border).toMatch(HEX_COLOR_REGEX);
      expect(colors.divider).toMatch(HEX_COLOR_REGEX);
    },
  );

  it.each(PUBLIC_MENU_THEME_PRESETS.map((p) => [p.id, p]))(
    '%s has non-empty font families',
    (_id, preset) => {
      const { typography } = preset;
      expect(typography.headingFont).not.toBe('');
      expect(typography.bodyFont).not.toBe('');
    },
  );

  it.each(PUBLIC_MENU_THEME_PRESETS.map((p) => [p.id, p]))(
    '%s has valid border radius',
    (_id, preset) => {
      expect(preset.borders.cardRadius).toBeGreaterThanOrEqual(0);
      expect(preset.borders.cardBorderWidth).toBeGreaterThanOrEqual(0);
    },
  );

  it.each(PUBLIC_MENU_THEME_PRESETS.map((p) => [p.id, p]))(
    '%s has a nameKey starting with publicMenu.themes.',
    (_id, preset) => {
      expect(preset.nameKey).toMatch(/^publicMenu\.themes\./);
      expect(preset.descriptionKey).toMatch(/^publicMenu\.themes\./);
    },
  );
});

describe('DEFAULT_PUBLIC_MENU_THEME', () => {
  it('is included in the presets array', () => {
    const found = PUBLIC_MENU_THEME_PRESETS.find((p) => p.id === DEFAULT_PUBLIC_MENU_THEME.id);
    expect(found).toBeDefined();
  });

  it('matches the default ID constant', () => {
    expect(DEFAULT_PUBLIC_MENU_THEME.id).toBe(DEFAULT_PUBLIC_MENU_THEME_ID);
  });
});

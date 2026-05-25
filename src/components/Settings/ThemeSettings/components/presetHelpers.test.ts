/**
 * Unit tests for preset selection logic.
 * Tests helper functions, not rendering.
 */
import { isPresetSelected } from './PresetGrid';
import { THEME_PRESETS, DEFAULT_THEME_CONFIG } from '../../../../theme/presets';

import type { ThemePreset } from '../../../../theme/presets';
import type { TenantThemeConfig } from '../../../../theme/types';

describe('isPresetSelected', () => {
  const defaultPreset = THEME_PRESETS.find((p) => p.id === 'default') as ThemePreset;
  const oceanPreset = THEME_PRESETS.find((p) => p.id === 'ocean') as ThemePreset;

  it('should return true for default preset when config is null', () => {
    expect(isPresetSelected(defaultPreset, null)).toBe(true);
  });

  it('should return false for non-default preset when config is null', () => {
    expect(isPresetSelected(oceanPreset, null)).toBe(false);
  });

  it('should return true when config presetId matches preset id', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: 'ocean' },
    };
    expect(isPresetSelected(oceanPreset, config)).toBe(true);
  });

  it('should return false when config presetId does not match', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: 'forest' },
    };
    expect(isPresetSelected(oceanPreset, config)).toBe(false);
  });

  it('should return false when config presetId is null (custom theme)', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: null },
    };
    expect(isPresetSelected(defaultPreset, config)).toBe(false);
  });

  it('should match default preset correctly', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: 'default' },
    };
    expect(isPresetSelected(defaultPreset, config)).toBe(true);
  });
});

describe('THEME_PRESETS structure', () => {
  it('should contain at least 5 presets', () => {
    const MINIMUM_PRESET_COUNT = 5;
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(MINIMUM_PRESET_COUNT);
  });

  it('should have a default preset', () => {
    const defaultPreset = THEME_PRESETS.find((p) => p.id === 'default');
    expect(defaultPreset).toBeDefined();
  });

  it('each preset should have required fields', () => {
    for (const preset of THEME_PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.config).toBeDefined();
      expect(preset.config.primary).toBeDefined();
      expect(preset.config.secondary).toBeDefined();
      expect(preset.config.accent).toBeDefined();
      expect(preset.config.branding).toBeDefined();
    }
  });

  it('each preset config should have light and dark mode colors', () => {
    for (const preset of THEME_PRESETS) {
      expect(preset.config.light.background).toBeDefined();
      expect(preset.config.light.text).toBeDefined();
      expect(preset.config.dark.background).toBeDefined();
      expect(preset.config.dark.text).toBeDefined();
    }
  });
});

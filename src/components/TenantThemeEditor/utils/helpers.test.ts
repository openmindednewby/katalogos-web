/**
 * Unit tests for TenantThemeEditor helper functions.
 * Tests pure logic only, no rendering.
 */
import { BrandColorField } from './BrandColorField';
import {
  applyColorToConfig,
  applyPresetToConfig,
  applyTypographyToConfig,
  hasConfigChanged,
} from './helpers';
import { DEFAULT_THEME_CONFIG } from '../../../theme/presets';

import type { TenantThemeConfig } from '../../../theme/types';

describe('applyColorToConfig', () => {
  it('should update primary color with valid hex', () => {
    const result = applyColorToConfig(DEFAULT_THEME_CONFIG, BrandColorField.Primary, '#ff0000');
    expect(result.primary).toBe('#ff0000');
  });

  it('should set presetId to null when color is changed', () => {
    const result = applyColorToConfig(DEFAULT_THEME_CONFIG, BrandColorField.Primary, '#ff0000');
    expect(result.branding.presetId).toBeNull();
  });

  it('should return original config for invalid hex', () => {
    const result = applyColorToConfig(DEFAULT_THEME_CONFIG, BrandColorField.Primary, 'invalid');
    expect(result).toBe(DEFAULT_THEME_CONFIG);
  });

  it('should update secondary color', () => {
    const result = applyColorToConfig(DEFAULT_THEME_CONFIG, BrandColorField.Secondary, '#00ff00');
    expect(result.secondary).toBe('#00ff00');
  });

  it('should update accent color', () => {
    const result = applyColorToConfig(DEFAULT_THEME_CONFIG, BrandColorField.Accent, '#0000ff');
    expect(result.accent).toBe('#0000ff');
  });

  it('should accept shorthand hex', () => {
    const result = applyColorToConfig(DEFAULT_THEME_CONFIG, BrandColorField.Primary, '#f00');
    expect(result.primary).toBe('#f00');
    expect(result.branding.presetId).toBeNull();
  });
});

describe('applyTypographyToConfig', () => {
  it('should set typography on config', () => {
    const typography = { fontFamily: 'Roboto', headingScale: 1.5 };
    const result = applyTypographyToConfig(DEFAULT_THEME_CONFIG, typography);
    expect(result.typography).toEqual(typography);
  });

  it('should preserve other config fields', () => {
    const typography = { fontFamily: 'Inter' };
    const result = applyTypographyToConfig(DEFAULT_THEME_CONFIG, typography);
    expect(result.primary).toBe(DEFAULT_THEME_CONFIG.primary);
    expect(result.branding).toEqual(DEFAULT_THEME_CONFIG.branding);
  });
});

describe('applyPresetToConfig', () => {
  it('should return a copy of the preset config', () => {
    const result = applyPresetToConfig(DEFAULT_THEME_CONFIG);
    expect(result).toEqual(DEFAULT_THEME_CONFIG);
    expect(result).not.toBe(DEFAULT_THEME_CONFIG);
  });
});

describe('hasConfigChanged', () => {
  it('should return false for identical configs', () => {
    expect(hasConfigChanged(DEFAULT_THEME_CONFIG, DEFAULT_THEME_CONFIG)).toBe(false);
  });

  it('should return true when one config is null', () => {
    expect(hasConfigChanged(DEFAULT_THEME_CONFIG, null)).toBe(true);
    expect(hasConfigChanged(null, DEFAULT_THEME_CONFIG)).toBe(true);
  });

  it('should return false for both null', () => {
    expect(hasConfigChanged(null, null)).toBe(false);
  });

  it('should detect primary color change', () => {
    const modified: TenantThemeConfig = { ...DEFAULT_THEME_CONFIG, primary: '#ff0000' };
    expect(hasConfigChanged(DEFAULT_THEME_CONFIG, modified)).toBe(true);
  });

  it('should detect presetId change', () => {
    const modified: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      branding: { ...DEFAULT_THEME_CONFIG.branding, presetId: null },
    };
    expect(hasConfigChanged(DEFAULT_THEME_CONFIG, modified)).toBe(true);
  });

  it('should detect typography fontFamily change', () => {
    const modified: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      typography: { fontFamily: 'Roboto' },
    };
    expect(hasConfigChanged(DEFAULT_THEME_CONFIG, modified)).toBe(true);
  });
});

/**
 * Pure helper functions for TenantThemeEditor.
 * Handles config transformations and change detection.
 */
import { type BrandColorField } from './BrandColorField';
import { isValidHex } from '../../../theme/utils/palette-generator';
import { isValueDefined } from '../../../utils/is';


import type { TenantThemeConfig, TypographyConfig } from '../../../theme/types';

/**
 * Return a new config with the specified brand color updated.
 * Sets presetId to null (marks as custom) when a valid hex is applied.
 */
export function applyColorToConfig(
  config: TenantThemeConfig,
  field: BrandColorField,
  hex: string,
): TenantThemeConfig {
  if (!isValidHex(hex)) return config;

  return {
    ...config,
    [field]: hex,
    branding: { ...config.branding, presetId: null },
  };
}

/** Return a new config with updated typography settings. */
export function applyTypographyToConfig(
  config: TenantThemeConfig,
  typography: TypographyConfig,
): TenantThemeConfig {
  return { ...config, typography };
}

/** Return a preset config with branding.presetId set from the preset. */
export function applyPresetToConfig(
  presetConfig: TenantThemeConfig,
): TenantThemeConfig {
  return { ...presetConfig };
}

/** Shallow compare key fields to detect unsaved changes. */
export function hasConfigChanged(
  a: TenantThemeConfig | null,
  b: TenantThemeConfig | null,
): boolean {
  if (a === b) return false;
  if (!isValueDefined(a) || !isValueDefined(b)) return true;

  return (
    a.primary !== b.primary ||
    a.secondary !== b.secondary ||
    a.accent !== b.accent ||
    a.branding.presetId !== b.branding.presetId ||
    a.typography?.fontFamily !== b.typography?.fontFamily ||
    a.typography?.headingScale !== b.typography?.headingScale
  );
}

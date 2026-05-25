/**
 * Per-tenant theme configuration stored as a JSON blob in the database.
 * Kept flat and small (~2-5KB) since it is fetched on every app load.
 * All color values are hex strings (e.g. '#005f73').
 */
import type { ThemeModeColors } from './themeModeColors';

/** Optional semantic/status color overrides. Omitted values fall back to defaults. */
export interface SemanticColorOverrides {
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

/** Optional typography overrides. */
export interface TypographyConfig {
  /** System font family name */
  fontFamily?: string;
  /** Heading size multiplier (default 1.0) */
  headingScale?: number;
}

/** Branding assets stored as ContentService references. */
export interface BrandingConfig {
  /** GUID referencing a ContentService item for the logo */
  logoContentId: string | null;
  /** GUID referencing a ContentService item for the favicon */
  faviconContentId: string | null;
  /** Which built-in preset was used as the base */
  presetId: string | null;
}

export interface TenantThemeConfig {
  /** Brand primary color (hex) */
  primary: string;
  /** Brand secondary color (hex) */
  secondary: string;
  /** Accent/highlight color (hex) */
  accent: string;

  /** Optional semantic/status color overrides */
  semantic?: SemanticColorOverrides;

  /** Light mode tokens */
  light: ThemeModeColors;
  /** Dark mode tokens */
  dark: ThemeModeColors;

  /** Optional typography overrides */
  typography?: TypographyConfig;

  /** Branding assets */
  branding: BrandingConfig;
}

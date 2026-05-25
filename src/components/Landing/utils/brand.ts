/**
 * Per-app marketing brand constants.
 *
 * Katalogos — full Terracotta Warm + Manrope identity (greenfield, no tenant continuity).
 * Marketing landing AND in-app default theme both use this brand.
 *
 * Sourced from apps/katalogos-web/brand/brand.config.json (locked 2026-05-03).
 */

/** Wordmark + body font family used across all marketing surfaces. */
export const MARKETING_WORDMARK_FONT_FAMILY =
  '"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/**
 * Locked preferred wordmark weight from brand.config.json (KW-02 Manrope).
 * `as const` narrows the literal so it threads into RN Text fontWeight without assertions.
 */
export const MARKETING_WORDMARK_WEIGHT = '500' as const;

/** Locked letter-spacing for the wordmark (-0.02em). */
export const MARKETING_WORDMARK_LETTER_SPACING = -1.92;

/** Marketing landing canonical URL (production). */
export const MARKETING_CANONICAL_URL = 'https://katalogos.dloizides.com';

/** OpenGraph site name. */
export const MARKETING_SITE_NAME = 'Katalogos';

/** Default social-share image. Existing logo asset (placeholder until brand image is exported). */
export const MARKETING_OG_IMAGE = '/icons/logo-512.png';

/**
 * P-01 Terracotta Warm palette tokens.
 * These overlay the BaseClient theme on marketing surfaces only — NOT in-app screens.
 */
export const MARKETING_PALETTE = {
  primary: '#b04632',
  accent: '#dca85a',
  gray900: '#1c1410',
  gray700: '#4d3e34',
  gray300: '#d3c5b6',
  gray100: '#f4ede2',
  success: '#5a8a3d',
  error: '#a83232',
} as const;

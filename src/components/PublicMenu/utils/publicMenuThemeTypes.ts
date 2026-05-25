/**
 * Type definitions for public menu theme presets.
 * These types define the comprehensive styling tokens
 * applied to the public-facing menu viewer.
 */

/** Typography tokens for a public menu theme. */
export interface PublicMenuTypography {
  /** Font family for headings (menu name, category titles) */
  readonly headingFont: string;
  /** Font family for body text (descriptions, prices) */
  readonly bodyFont: string;
  /** Font weight for the menu title */
  readonly titleWeight: string;
  /** Font weight for category headings */
  readonly categoryWeight: string;
  /** Font weight for item names */
  readonly itemNameWeight: string;
  /** Font weight for prices */
  readonly priceWeight: string;
  /** Letter spacing for headings (pixels) */
  readonly headingLetterSpacing: number;
  /** Letter spacing for body text (pixels) */
  readonly bodyLetterSpacing: number;
  /** Line height multiplier for body text */
  readonly bodyLineHeight: number;
}

/** Color tokens for a public menu theme. */
export interface PublicMenuColors {
  /** Page background */
  readonly background: string;
  /** Card/surface background */
  readonly surface: string;
  /** Primary text color */
  readonly text: string;
  /** Secondary/muted text */
  readonly textSecondary: string;
  /** Accent/highlight color (used for prices, links) */
  readonly accent: string;
  /** Border color for cards and dividers */
  readonly border: string;
  /** Divider color between sections */
  readonly divider: string;
}

/** Spacing tokens (in pixels) for a public menu theme. */
export interface PublicMenuSpacing {
  /** Horizontal page padding */
  readonly pagePadding: number;
  /** Gap between category sections */
  readonly sectionGap: number;
  /** Gap between menu items */
  readonly itemGap: number;
  /** Internal padding for item cards */
  readonly cardPadding: number;
  /** Padding inside the header section */
  readonly headerPadding: number;
}

/** Border and shape tokens for a public menu theme. */
export interface PublicMenuBorders {
  /** Card border radius */
  readonly cardRadius: number;
  /** Card border width (0 for no border) */
  readonly cardBorderWidth: number;
  /** Whether to show dividers between categories */
  readonly showCategoryDividers: boolean;
  /** Divider thickness */
  readonly dividerWidth: number;
}

/** A complete public menu theme preset. */
export interface PublicMenuTheme {
  /** Unique identifier */
  readonly id: string;
  /** Translation key for the theme name */
  readonly nameKey: string;
  /** Translation key for the theme description */
  readonly descriptionKey: string;
  /** Color tokens */
  readonly colors: PublicMenuColors;
  /** Typography tokens */
  readonly typography: PublicMenuTypography;
  /** Spacing tokens */
  readonly spacing: PublicMenuSpacing;
  /** Border and shape tokens */
  readonly borders: PublicMenuBorders;
}

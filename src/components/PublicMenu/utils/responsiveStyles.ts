/**
 * Responsive style utilities for the public menu viewer.
 * Provides breakpoint detection and responsive font/spacing scaling
 * for phone (primary QR code scan use case), tablet, and desktop.
 */
import { Dimensions, Platform } from 'react-native';

import type { PublicMenuSpacing } from './publicMenuThemeTypes';

// ---------------------------------------------------------------------------
// Breakpoints (matches common device widths)
// ---------------------------------------------------------------------------

const PHONE_MAX_WIDTH = 480;
const TABLET_MAX_WIDTH = 768;
const DESKTOP_MAX_WIDTH = 1024;

// ---------------------------------------------------------------------------
// Responsive scaling factors
// ---------------------------------------------------------------------------

const PHONE_FONT_SCALE = 1.0;
const TABLET_FONT_SCALE = 1.05;
const DESKTOP_FONT_SCALE = 1.1;
const LARGE_DESKTOP_FONT_SCALE = 1.15;

const PHONE_SPACING_SCALE = 1.0;
const TABLET_SPACING_SCALE = 1.15;
const DESKTOP_SPACING_SCALE = 1.3;

// ---------------------------------------------------------------------------
// Font sizes (in pixels) - base sizes for phone
// ---------------------------------------------------------------------------

const TITLE_FONT_SIZE = 28;
const CATEGORY_FONT_SIZE = 22;
const ITEM_NAME_FONT_SIZE = 17;
const ITEM_PRICE_FONT_SIZE = 17;
const BODY_FONT_SIZE = 14;
const DESCRIPTION_FONT_SIZE = 14;

// ---------------------------------------------------------------------------
// Desktop max-width constraint
// ---------------------------------------------------------------------------

const MENU_MAX_WIDTH = 720;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Responsive font sizes for the menu. */
export interface ResponsiveFontSizes {
  readonly title: number;
  readonly category: number;
  readonly itemName: number;
  readonly itemPrice: number;
  readonly body: number;
  readonly description: number;
}

/** Resolved responsive values for layout. */
export interface ResponsiveLayout {
  readonly fontSizes: ResponsiveFontSizes;
  readonly spacing: PublicMenuSpacing;
  /** Max width for menu content (0 = no constraint) */
  readonly maxWidth: number;
  /** Whether the device is phone-sized */
  readonly isPhone: boolean;
  /** Whether the device is tablet-sized */
  readonly isTablet: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the current window width, safely handling SSR. */
export function getWindowWidth(): number {
  if (Platform.OS === 'web' && typeof window !== 'undefined')
    return window.innerWidth;

  return Dimensions.get('window').width;
}

/** Determines the font scale factor for a given width. */
export function getFontScale(width: number): number {
  if (width <= PHONE_MAX_WIDTH) return PHONE_FONT_SCALE;
  if (width <= TABLET_MAX_WIDTH) return TABLET_FONT_SCALE;
  if (width <= DESKTOP_MAX_WIDTH) return DESKTOP_FONT_SCALE;
  return LARGE_DESKTOP_FONT_SCALE;
}

/** Determines the spacing scale factor for a given width. */
export function getSpacingScale(width: number): number {
  if (width <= PHONE_MAX_WIDTH) return PHONE_SPACING_SCALE;
  if (width <= TABLET_MAX_WIDTH) return TABLET_SPACING_SCALE;
  return DESKTOP_SPACING_SCALE;
}

/** Scales font sizes based on the current viewport width. */
export function getResponsiveFontSizes(width: number): ResponsiveFontSizes {
  const scale = getFontScale(width);
  return {
    title: Math.round(TITLE_FONT_SIZE * scale),
    category: Math.round(CATEGORY_FONT_SIZE * scale),
    itemName: Math.round(ITEM_NAME_FONT_SIZE * scale),
    itemPrice: Math.round(ITEM_PRICE_FONT_SIZE * scale),
    body: Math.round(BODY_FONT_SIZE * scale),
    description: Math.round(DESCRIPTION_FONT_SIZE * scale),
  };
}

/** Scales spacing values based on the current viewport width. */
export function getResponsiveSpacing(
  base: PublicMenuSpacing,
  width: number,
): PublicMenuSpacing {
  const scale = getSpacingScale(width);
  return {
    pagePadding: Math.round(base.pagePadding * scale),
    sectionGap: Math.round(base.sectionGap * scale),
    itemGap: Math.round(base.itemGap * scale),
    cardPadding: Math.round(base.cardPadding * scale),
    headerPadding: Math.round(base.headerPadding * scale),
  };
}

/** Builds a complete responsive layout from a given width. */
export function buildResponsiveLayout(
  baseSpacing: PublicMenuSpacing,
  width: number,
): ResponsiveLayout {
  const isPhone = width <= PHONE_MAX_WIDTH;
  const isTablet = width > PHONE_MAX_WIDTH && width <= TABLET_MAX_WIDTH;

  return {
    fontSizes: getResponsiveFontSizes(width),
    spacing: getResponsiveSpacing(baseSpacing, width),
    maxWidth: isPhone ? 0 : MENU_MAX_WIDTH,
    isPhone,
    isTablet,
  };
}

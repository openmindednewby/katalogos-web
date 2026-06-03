


/**
 * Palette Generator Utility
 *
 * Generates full color palettes (50-900 shades) from single base hex colors.
 * Uses HSL color space for natural-looking shade progression.
 * Pure functions, no side effects, no external dependencies.
 */
import type { ColorScale, TenantThemeConfig } from '../types';

// -- Constants ----------------------------------------------------------------

const HEX_BASE = 16;
const RGB_MAX = 255;
const HUE_DEGREES = 360;
const HUE_SEGMENT = 6;
const HUE_OFFSET_BLUE = 4;
const HUE_THIRD_DIVISOR = 3;
const ONE_THIRD = 1 / HUE_THIRD_DIVISOR;
const TWO_THIRDS = 2 / HUE_THIRD_DIVISOR;
const LIGHTNESS_MID = 0.5;

/** Hex string slice positions for #RRGGBB parsing. */
const HEX_R_START = 1;
const HEX_R_END = 3;
const HEX_G_START = 3;
const HEX_G_END = 5;
const HEX_B_START = 5;
const HEX_B_END = 7;
const SHORTHAND_LENGTH = 3;

/** Valid hex patterns: #RGB or #RRGGBB (case-insensitive). */
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Default semantic base colors when config omits overrides. */
const DEFAULT_SUCCESS = '#0a9396';
const DEFAULT_WARNING = '#ee9b00';
const DEFAULT_ERROR = '#ae2012';
const DEFAULT_INFO = '#005f73';

// -- Types --------------------------------------------------------------------

interface Hsl {
  h: number;
  s: number;
  l: number;
}

interface RgbChannels {
  r: number;
  g: number;
  b: number;
  max: number;
  d: number;
}

interface ShadeConfig {
  lightness: number;
  saturationMult: number;
}

/**
 * Target lightness (0-1) and saturation multiplier for each shade level.
 * Shade 500 is special-cased to use the base color as-is.
 */
const SHADE_CONFIG: Record<string, ShadeConfig> = {
  '50':  { lightness: 0.95, saturationMult: 0.30 },
  '100': { lightness: 0.90, saturationMult: 0.50 },
  '200': { lightness: 0.80, saturationMult: 0.70 },
  '300': { lightness: 0.70, saturationMult: 0.85 },
  '400': { lightness: 0.60, saturationMult: 0.95 },
  '500': { lightness: 0.50, saturationMult: 1.00 },
  '600': { lightness: 0.40, saturationMult: 1.00 },
  '700': { lightness: 0.30, saturationMult: 0.95 },
  '800': { lightness: 0.20, saturationMult: 0.90 },
  '900': { lightness: 0.12, saturationMult: 0.85 },
};

const ANCHOR_LIGHTNESS = SHADE_CONFIG['500'].lightness;

// -- Result type --------------------------------------------------------------

interface ThemePaletteResult {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  semantic: {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
}

// -- Private helpers ----------------------------------------------------------

/** Expand shorthand #RGB to full #RRGGBB. */
function expandHex(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === SHORTHAND_LENGTH)
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  return `#${clean}`;
}

/** Compute normalized hue (0-1) from RGB channel values. */
function computeHue(channels: RgbChannels): number {
  const { r, g, b, max, d } = channels;
  if (max === r) return ((g - b) / d + (g < b ? HUE_SEGMENT : 0)) / HUE_SEGMENT;
  if (max === g) return ((b - r) / d + 2) / HUE_SEGMENT;
  return ((r - g) / d + HUE_OFFSET_BLUE) / HUE_SEGMENT;
}

/** HUE to RGB channel conversion helper. */
function hueToRgb(p: number, q: number, rawT: number): number {
  let t = rawT;
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / HUE_SEGMENT) return p + (q - p) * HUE_SEGMENT * t;
  if (t < LIGHTNESS_MID) return q;
  if (t < TWO_THIRDS) return p + (q - p) * (TWO_THIRDS - t) * HUE_SEGMENT;
  return p;
}

/** Format three 0-255 integers as a lowercase hex string. */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string =>
    Math.max(0, Math.min(RGB_MAX, n)).toString(HEX_BASE).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Normalize any valid hex to lowercase #rrggbb. */
function normalizeHex(hex: string): string {
  const full = expandHex(hex);
  return full.toLowerCase();
}

/**
 * Generate a single shade hex from a base HSL and a shade config.
 * Lightness is interpolated so that:
 *   - Shade 500 = base lightness (anchor)
 *   - Lighter shades interpolate between base lightness and 1.0 (white)
 *   - Darker shades interpolate between base lightness and 0.0 (black)
 */
function generateShade(baseHsl: Hsl, config: ShadeConfig): string {
  const baseL = baseHsl.l;
  const targetL = config.lightness;

  let newL: number;
  if (targetL >= ANCHOR_LIGHTNESS) {
    const ratio = (targetL - ANCHOR_LIGHTNESS) / (1 - ANCHOR_LIGHTNESS);
    newL = baseL + ratio * (1 - baseL);
  } else {
    const ratio = (ANCHOR_LIGHTNESS - targetL) / ANCHOR_LIGHTNESS;
    newL = baseL - ratio * baseL;
  }

  const clampedL = Math.max(0, Math.min(1, newL));
  const newS = Math.min(1, baseHsl.s * config.saturationMult);

  return hslToHex(baseHsl.h, newS, clampedL);
}

// -- Public: validation -------------------------------------------------------

/** Validate a hex color string (#RGB or #RRGGBB). */
export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

// -- Public: hex <-> HSL conversions ------------------------------------------

/** Convert a hex color (#RGB or #RRGGBB) to HSL. */
export function hexToHsl(hex: string): Hsl {
  const full = expandHex(hex);
  const r = parseInt(full.slice(HEX_R_START, HEX_R_END), HEX_BASE) / RGB_MAX;
  const g = parseInt(full.slice(HEX_G_START, HEX_G_END), HEX_BASE) / RGB_MAX;
  const b = parseInt(full.slice(HEX_B_START, HEX_B_END), HEX_BASE) / RGB_MAX;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > LIGHTNESS_MID ? d / (2 - max - min) : d / (max + min);
  const h = computeHue({ r, g, b, max, d });

  return { h: h * HUE_DEGREES, s, l };
}

/** Convert HSL values to a hex color string (#rrggbb). */
export function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / HUE_DEGREES;

  if (s === 0) {
    const gray = Math.round(l * RGB_MAX);
    return rgbToHex(gray, gray, gray);
  }

  const q = l < LIGHTNESS_MID ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRgb(p, q, hNorm + ONE_THIRD) * RGB_MAX);
  const g = Math.round(hueToRgb(p, q, hNorm) * RGB_MAX);
  const b = Math.round(hueToRgb(p, q, hNorm - ONE_THIRD) * RGB_MAX);

  return rgbToHex(r, g, b);
}

// -- Public: lighten / darken -------------------------------------------------

/** Lighten a hex color by the given amount (0-1 range, where 1 = white). */
export function lighten(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.min(1, l + amount * (1 - l));
  return hslToHex(h, s, newL);
}

/** Darken a hex color by the given amount (0-1 range, where 1 = black). */
export function darken(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.max(0, l - amount * l);
  return hslToHex(h, s, newL);
}

// -- Public: palette generation -----------------------------------------------

/** Generate a full 50-900 shade scale from a single hex base color. */
export function generateColorScale(baseColor: string): ColorScale {
  const baseHsl = hexToHsl(baseColor);
  const normalized = normalizeHex(baseColor);

  return {
    '50':  generateShade(baseHsl, SHADE_CONFIG['50']),
    '100': generateShade(baseHsl, SHADE_CONFIG['100']),
    '200': generateShade(baseHsl, SHADE_CONFIG['200']),
    '300': generateShade(baseHsl, SHADE_CONFIG['300']),
    '400': generateShade(baseHsl, SHADE_CONFIG['400']),
    '500': normalized,
    '600': generateShade(baseHsl, SHADE_CONFIG['600']),
    '700': generateShade(baseHsl, SHADE_CONFIG['700']),
    '800': generateShade(baseHsl, SHADE_CONFIG['800']),
    '900': generateShade(baseHsl, SHADE_CONFIG['900']),
  };
}

/** Generate all palette scales from a TenantThemeConfig. */
export function generateThemePalette(config: TenantThemeConfig): ThemePaletteResult {
  return {
    primary: generateColorScale(config.primary),
    secondary: generateColorScale(config.secondary),
    accent: generateColorScale(config.accent),
    semantic: {
      success: generateColorScale(config.semantic?.success ?? DEFAULT_SUCCESS),
      warning: generateColorScale(config.semantic?.warning ?? DEFAULT_WARNING),
      error: generateColorScale(config.semantic?.error ?? DEFAULT_ERROR),
      info: generateColorScale(config.semantic?.info ?? DEFAULT_INFO),
    },
  };
}

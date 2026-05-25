/**
 * Type guards for menu style type validation.
 * Split from menuStyleTypes.ts to keep file sizes under 200 lines.
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */

import { isValueDefined } from '@dloizides/utils';

import type {
  ColorScheme,
  MediaSettings,
  GlobalTypography,
  FontWeight,
  OverlaySettings,
  Badge,
} from './menuStyleTypes';

// =============================================================================
// Validation Sets
// =============================================================================

/**
 * Set of valid font weight values for validation.
 * Using a Set for O(1) lookup without type assertions.
 */
const VALID_FONT_WEIGHTS_SET = new Set<string>([
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  'normal',
  'bold',
]);

/**
 * Valid keys for ColorScheme validation.
 */
const VALID_COLOR_SCHEME_KEYS = new Set([
  'background',
  'surface',
  'text',
  'textSecondary',
  'accent',
  'price',
  'border',
  'divider',
  'unavailable',
]);

/**
 * Valid media positions for validation.
 */
const VALID_MEDIA_POSITIONS = new Set([
  'left',
  'right',
  'top',
  'bottom',
  'background',
  'none',
]);

// =============================================================================
// Helpers
// =============================================================================

/**
 * Helper to check if an unknown value is a plain object (not null, not array).
 */
function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && isValueDefined(obj) && !Array.isArray(obj);
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to validate a ColorScheme object.
 * Checks that all properties are either undefined or valid strings.
 */
export function isValidColorScheme(obj: unknown): obj is ColorScheme {
  if (!isPlainObject(obj)) return false;

  // Check that all keys are valid and values are strings or undefined
  return Object.entries(obj).every(([key, value]) => {
    if (!VALID_COLOR_SCHEME_KEYS.has(key)) return false;
    return typeof value === 'string' || !isValueDefined(value);
  });
}

/**
 * Type guard to validate a MediaSettings object.
 * Validates that position is a valid MediaPosition value.
 */
export function isValidMediaSettings(obj: unknown): obj is MediaSettings {
  if (!isPlainObject(obj)) return false;

  const position = obj.position;
  if (isValueDefined(position)) {
    if (typeof position !== 'string') return false;
    if (!VALID_MEDIA_POSITIONS.has(position)) return false;
  }

  return true;
}

/**
 * Type guard to validate a GlobalTypography object.
 * Performs basic structure validation.
 */
export function isValidTypography(obj: unknown): obj is GlobalTypography {
  if (!isPlainObject(obj)) return false;

  // Validate font weight values if present
  const fontWeightKeys = ['titleFontWeight', 'bodyFontWeight', 'priceFontWeight'];
  for (const key of fontWeightKeys) {
    const value = obj[key];
    if (isValueDefined(value)) {
      if (typeof value !== 'string') return false;
      if (!VALID_FONT_WEIGHTS_SET.has(value)) return false;
    }
  }

  // Validate font size values if present
  const fontSizeKeys = ['titleFontSize', 'bodyFontSize', 'priceFontSize'];
  for (const key of fontSizeKeys) {
    const value = obj[key];
    if (isValueDefined(value)) {
      if (typeof value !== 'number') return false;
      if (value < 0) return false;
    }
  }

  return true;
}

/**
 * Type guard to validate a FontWeight value.
 */
export function isValidFontWeight(value: unknown): value is FontWeight {
  if (typeof value !== 'string') return false;
  return VALID_FONT_WEIGHTS_SET.has(value);
}

/**
 * Type guard to validate an OverlaySettings object.
 */
export function isValidOverlaySettings(obj: unknown): obj is OverlaySettings {
  if (!isPlainObject(obj)) return false;

  if (typeof obj.enabled !== 'boolean') return false;
  if (typeof obj.color !== 'string') return false;
  if (typeof obj.opacity !== 'number') return false;
  const isValidOpacity = obj.opacity >= 0 && obj.opacity <= 1;
  if (!isValidOpacity) return false;

  return true;
}

/**
 * Type guard to validate a Badge object.
 */
export function isValidBadge(obj: unknown): obj is Badge {
  if (!isPlainObject(obj)) return false;

  if (typeof obj.text !== 'string') return false;
  if (typeof obj.backgroundColor !== 'string') return false;
  if (typeof obj.textColor !== 'string') return false;
  const iconValue = obj.icon;
  if (isValueDefined(iconValue) && typeof iconValue !== 'string') return false;

  return true;
}

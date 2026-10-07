
import { isValueDefined } from '@dloizides/utils';

import type {
  ColorScheme,
  MediaSettings,
  GlobalTypography,
  FontWeight,
  OverlaySettings,
  Badge,
} from './menuStyleTypes';


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

const VALID_MEDIA_POSITIONS = new Set([
  'left',
  'right',
  'top',
  'bottom',
  'background',
  'none',
]);


function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && isValueDefined(obj) && !Array.isArray(obj);
}


/** Type guard to validate a ColorScheme object. */
export function isValidColorScheme(obj: unknown): obj is ColorScheme {
  if (!isPlainObject(obj)) return false;

  return Object.entries(obj).every(([key, value]) => {
    if (!VALID_COLOR_SCHEME_KEYS.has(key)) return false;
    return typeof value === 'string' || !isValueDefined(value);
  });
}

/** Type guard to validate a MediaSettings object. */
export function isValidMediaSettings(obj: unknown): obj is MediaSettings {
  if (!isPlainObject(obj)) return false;

  const position = obj.position;
  if (isValueDefined(position)) {
    if (typeof position !== 'string') return false;
    if (!VALID_MEDIA_POSITIONS.has(position)) return false;
  }

  return true;
}

/** Type guard to validate a GlobalTypography object. */
export function isValidTypography(obj: unknown): obj is GlobalTypography {
  if (!isPlainObject(obj)) return false;

  const fontWeightKeys = ['titleFontWeight', 'bodyFontWeight', 'priceFontWeight'];
  for (const key of fontWeightKeys) {
    const value = obj[key];
    if (isValueDefined(value)) {
      if (typeof value !== 'string') return false;
      if (!VALID_FONT_WEIGHTS_SET.has(value)) return false;
    }
  }

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

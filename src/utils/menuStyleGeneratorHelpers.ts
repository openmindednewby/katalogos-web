/**
 * Helper functions and constants for menu style generation.
 * Split from menuStyleGenerator.ts to keep file sizes under 200 lines.
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */

import { Platform } from 'react-native';
import type { TextStyle, ViewStyle, ImageStyle } from 'react-native';

import { isValueDefined } from '@dloizides/utils';

import {
  DEFAULT_COLOR_SCHEME,
} from './menuDefaults';
import { DEFAULT_ITEM_IMAGE_SETTINGS } from './menuDefaultsEntityLevel';
import MediaFit from '../types/enums/MediaFit';
import MediaSize from '../types/enums/MediaSize';

import type {
  BoxStyling,
  MediaSettings,
  ColorScheme,
  ContentAlignment,
  FontWeight,
  ItemLayout,
} from '../types/menuStyleTypes';

// =============================================================================
// Constants
// =============================================================================

/** Map content alignment to React Native flexbox alignment */
const ALIGNMENT_MAP: Record<ContentAlignment, TextStyle['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

/** Map media fit to React Native resizeMode */
const RESIZE_MODE_MAP: Record<MediaFit, ImageStyle['resizeMode']> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'stretch',
  none: 'center',
};

/** Map media size to pixel dimensions */
const SIZE_DIMENSION_MAP: Record<Exclude<MediaSize, 'custom' | 'full'>, number> = {
  thumbnail: 48,
  small: 80,
  medium: 120,
  large: 200,
};

/** Default shadow values for iOS and Android */
const DEFAULT_SHADOW_OFFSET = { width: 0, height: 2 };
const DEFAULT_SHADOW_OPACITY = 0.25;
const DEFAULT_SHADOW_RADIUS = 4;
const DEFAULT_ELEVATION = 4;
const DEFAULT_SHADOW_COLOR = 'rgba(0, 0, 0, 0.25)';

// =============================================================================
// Type Definitions for Generated Styles
// =============================================================================

/** Styles generated for a category */
export interface CategoryStyles {
  container: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  image: ImageStyle;
}

/** Styles generated for a menu item */
export interface ItemStyles {
  container: ViewStyle;
  name: TextStyle;
  description: TextStyle;
  price: TextStyle;
  image: ImageStyle;
}

/** Styles generated for global typography */
export interface TypographyStyles {
  title: TextStyle;
  body: TextStyle;
  price: TextStyle;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Safely get a value or its default */
function getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  if (isValueDefined(value)) return value;
  return defaultValue;
}

/** Get color with fallback */
export function getColorWithFallback(color: string | undefined, fallback: string): string {
  if (isValueDefined(color)) return color;
  return fallback;
}

/** Build shadow styles for ViewStyle (cross-platform) */
function buildShadowStyles(
  shadowEnabled: boolean | undefined,
  shadowColor: string | undefined,
  shadowBlur: number | undefined
): ViewStyle {
  if (shadowEnabled !== true) return {};

  const radius = getValueOrDefault(shadowBlur, DEFAULT_SHADOW_RADIUS);

  if (Platform.OS === 'web') {
    const color = getValueOrDefault(shadowColor, DEFAULT_SHADOW_COLOR);
    return {
      boxShadow: `${DEFAULT_SHADOW_OFFSET.width}px ${DEFAULT_SHADOW_OFFSET.height}px ${radius}px ${color}`,
      elevation: DEFAULT_ELEVATION,
    };
  }

  return {
    shadowColor: getValueOrDefault(shadowColor, DEFAULT_SHADOW_COLOR),
    shadowOffset: DEFAULT_SHADOW_OFFSET,
    shadowOpacity: DEFAULT_SHADOW_OPACITY,
    shadowRadius: radius,
    elevation: DEFAULT_ELEVATION,
  };
}

/** Calculate image dimensions based on size preset */
function calculateImageDimensions(
  size: MediaSize | undefined,
  customWidth: number | undefined,
  customHeight: number | undefined
): { width?: number; height?: number } {
  const resolvedSize = getValueOrDefault(size, MediaSize.Medium);

  if (resolvedSize === MediaSize.Custom) return { width: customWidth, height: customHeight };
  if (resolvedSize === MediaSize.Full) return {};

  const dimension = SIZE_DIMENSION_MAP[resolvedSize];
  return { width: dimension, height: dimension };
}

/** Merge settings with defaults and get alignment */
export function getAlignmentFromLayout(
  layout: { contentAlignment?: ContentAlignment } | undefined,
  defaultAlignment: ContentAlignment
): TextStyle['textAlign'] {
  const alignment = getValueOrDefault(layout?.contentAlignment, defaultAlignment);
  return ALIGNMENT_MAP[alignment];
}

// =============================================================================
// Style Builder Helpers
// =============================================================================

export function buildContainerStyle(styling: BoxStyling, colors: ColorScheme): ViewStyle {
  const borderColor = getColorWithFallback(styling.borderColor, colors.border ?? DEFAULT_COLOR_SCHEME.border);

  return {
    padding: styling.padding,
    margin: styling.margin,
    borderWidth: styling.borderWidth,
    borderColor,
    borderRadius: styling.borderRadius,
    ...buildShadowStyles(styling.shadowEnabled, styling.shadowColor, styling.shadowBlur),
  };
}

export function buildItemContainerStyle(styling: BoxStyling, layout: ItemLayout, colors: ColorScheme): ViewStyle {
  return {
    ...buildContainerStyle(styling, colors),
    minHeight: layout.minHeight,
    maxWidth: layout.maxWidth,
  };
}

export function buildTextStyle(
  fontSize: number | undefined,
  fontWeight: FontWeight | undefined,
  color: string,
  textAlign: TextStyle['textAlign']
): TextStyle {
  return { fontSize, fontWeight, color, textAlign };
}

export function buildGlobalTextStyle(
  font: string | undefined,
  fontSize: number | undefined,
  fontWeight: FontWeight | undefined,
  color: string
): TextStyle {
  const fontFamily = font !== 'System' ? font : undefined;
  return { fontFamily, fontSize, fontWeight, color };
}

/**
 * Generates image styles from media settings.
 */
export function generateMediaStyles(media: MediaSettings | undefined): ImageStyle {
  const settings = { ...DEFAULT_ITEM_IMAGE_SETTINGS, ...media };
  const dimensions = calculateImageDimensions(settings.size, settings.customWidth, settings.customHeight);
  const fit = getValueOrDefault(settings.fit, MediaFit.Cover);

  return {
    ...dimensions,
    borderRadius: settings.borderRadius,
    opacity: settings.opacity,
    resizeMode: RESIZE_MODE_MAP[fit],
  };
}

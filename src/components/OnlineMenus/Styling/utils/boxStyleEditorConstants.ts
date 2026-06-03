/**
 * Constants for the BoxStyleEditor component.
 */

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// =============================================================================
// Slider Range Constants
// =============================================================================

/** Minimum border width in pixels */
export const MIN_BORDER_WIDTH = 0;
/** Maximum border width in pixels */
export const MAX_BORDER_WIDTH = 4;

/** Minimum border radius in pixels */
export const MIN_BORDER_RADIUS = 0;
/** Maximum border radius in pixels */
export const MAX_BORDER_RADIUS = 24;

/** Minimum padding in pixels */
export const MIN_PADDING = 0;
/** Maximum padding in pixels */
export const MAX_PADDING = 32;

// =============================================================================
// UI Constants
// =============================================================================

/** Opacity for disabled elements */
export { DISABLED_OPACITY } from '../../../../shared/constants';

/** Default preview box size in pixels */
export const PREVIEW_BOX_SIZE = 80;

/** Default shadow configuration */
export const DEFAULT_SHADOW_OPACITY = 0.2;
export const DEFAULT_SHADOW_RADIUS = 4;
export const DEFAULT_SHADOW_OFFSET_X = 0;
export const DEFAULT_SHADOW_OFFSET_Y = 2;

// =============================================================================
// Color Constants
// =============================================================================

/** Default background color for preview when none specified */
export const DEFAULT_PREVIEW_BACKGROUND = '#FFFFFF';

/** Default border color for preview when none specified */
export const DEFAULT_PREVIEW_BORDER = '#E0E0E0';

/** Invalid color swatch placeholder */
export const INVALID_COLOR_SWATCH = '#CCCCCC';

// =============================================================================
// Validation
// =============================================================================

/**
 * Validates if a string is a valid hex color.
 */
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

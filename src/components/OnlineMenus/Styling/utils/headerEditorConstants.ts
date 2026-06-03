/**
 * Constants for the HeaderEditor component.
 */
import { HorizontalPosition, LogoSize } from '../../../../types/menuStyleTypes';

// =============================================================================
// Position Options
// =============================================================================

interface PositionOption {
  value: HorizontalPosition;
  labelKey: string;
  fallback: string;
}

export const POSITION_OPTIONS: PositionOption[] = [
  { value: HorizontalPosition.Left, labelKey: 'headerEditor.position.left', fallback: 'Left' },
  { value: HorizontalPosition.Center, labelKey: 'headerEditor.position.center', fallback: 'Center' },
  { value: HorizontalPosition.Right, labelKey: 'headerEditor.position.right', fallback: 'Right' },
];

// =============================================================================
// Logo Size Options
// =============================================================================

interface LogoSizeOption {
  value: LogoSize;
  labelKey: string;
  fallback: string;
}

export const LOGO_SIZE_OPTIONS: LogoSizeOption[] = [
  { value: LogoSize.Small, labelKey: 'headerEditor.logoSizeOption.small', fallback: 'S' },
  { value: LogoSize.Medium, labelKey: 'headerEditor.logoSizeOption.medium', fallback: 'M' },
  { value: LogoSize.Large, labelKey: 'headerEditor.logoSizeOption.large', fallback: 'L' },
];

// =============================================================================
// Preview Settings
// =============================================================================

export const PREVIEW_WIDTH = 280;
export const PREVIEW_MIN_HEIGHT = 60;

export const LOGO_SIZE_DIMENSIONS: Record<LogoSize, number> = {
  [LogoSize.Small]: 32,
  [LogoSize.Medium]: 48,
  [LogoSize.Large]: 64,
};

// =============================================================================
// Styling Constants
// =============================================================================

export { DISABLED_OPACITY } from '../../../../shared/constants';
export const BUTTON_BORDER_RADIUS = 4;
export const ACTIVE_BUTTON_BACKGROUND = 'rgba(0, 122, 255, 0.1)';
export const PREVIEW_BACKGROUND = '#F5F5F5';
export const PREVIEW_LOGO_PLACEHOLDER = '#E0E0E0';

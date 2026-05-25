/**
 * Fully resolved theme consumed by components via useTheme().
 * Built at runtime from TenantThemeConfig after palette generation.
 */
import type { ColorScale } from './colorScale';
import type { ThemeModeColors } from './themeModeColors';
import type ThemeMode from '../../shared/enums/ThemeMode';

/** Full shade palettes for brand colors. */
export interface ResolvedPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
}

/** Full shade palettes for semantic/status colors. */
export interface ResolvedSemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

/** Resolved typography configuration. */
export interface ResolvedTypography {
  fontFamily: string;
  headingScale: number;
}

/** Resolved branding with URLs instead of content IDs. */
export interface ResolvedBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
}

export interface ResolvedTheme {
  /** Current mode's resolved color tokens */
  colors: ThemeModeColors;
  /** Generated shade scales for brand colors */
  palette: ResolvedPalette;
  /** Generated shade scales for semantic/status colors */
  semantic: ResolvedSemanticColors;
  /** Resolved typography settings */
  typography: ResolvedTypography;
  /** Current theme mode */
  mode: ThemeMode;
  /** Resolved branding URLs */
  branding: ResolvedBranding;
}

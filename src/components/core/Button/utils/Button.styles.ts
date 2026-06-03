

/**
 * Theme-aware style generator for the core Button component.
 * Returns a StyleSheet keyed by variant, with size-specific overrides.
 */
import { StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import ButtonSize from './ButtonSize';
import ButtonVariant from './ButtonVariant';
import { DISABLED_OPACITY } from '../../../../shared/constants';

import type { ResolvedTheme } from '../../../../theme/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BORDER_WIDTH = 1;
const BORDER_RADIUS = 6;
const MIN_TOUCH_WIDTH = 100;

const ICON_GAP = 8;

const SIZE_HEIGHT_MAP: Record<string, number> = {
  [ButtonSize.Small]: 32,
  [ButtonSize.Medium]: 44,
  [ButtonSize.Large]: 52,
};

const SIZE_HORIZONTAL_PADDING_MAP: Record<string, number> = {
  [ButtonSize.Small]: 10,
  [ButtonSize.Medium]: 16,
  [ButtonSize.Large]: 20,
};

const SIZE_FONT_MAP: Record<string, number> = {
  [ButtonSize.Small]: 13,
  [ButtonSize.Medium]: 15,
  [ButtonSize.Large]: 17,
};

const TEXT_ON_FILLED = '#ffffff';
const TRANSPARENT = 'transparent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ButtonStyleSet {
  container: ViewStyle;
  text: TextStyle;
  iconColor: string;
}

// ---------------------------------------------------------------------------
// Per-variant style helpers
// ---------------------------------------------------------------------------

interface VariantResult { container: ViewStyle; text: TextStyle; iconColor: string }

function primaryStyles(theme: ResolvedTheme): VariantResult {
  return {
    container: { backgroundColor: theme.palette.primary['500'] },
    text: { color: TEXT_ON_FILLED },
    iconColor: TEXT_ON_FILLED,
  };
}

function secondaryStyles(theme: ResolvedTheme): VariantResult {
  return {
    container: {
      backgroundColor: theme.colors.surface,
      borderWidth: BORDER_WIDTH,
      borderColor: theme.colors.border,
    },
    text: { color: theme.colors.text },
    iconColor: theme.colors.text,
  };
}

function outlineStyles(theme: ResolvedTheme): VariantResult {
  return {
    container: {
      backgroundColor: TRANSPARENT,
      borderWidth: BORDER_WIDTH,
      borderColor: theme.palette.primary['500'],
    },
    text: { color: theme.palette.primary['500'] },
    iconColor: theme.palette.primary['500'],
  };
}

function ghostStyles(theme: ResolvedTheme): VariantResult {
  return {
    container: { backgroundColor: TRANSPARENT },
    text: { color: theme.palette.primary['500'] },
    iconColor: theme.palette.primary['500'],
  };
}

function dangerStyles(theme: ResolvedTheme): VariantResult {
  return {
    container: { backgroundColor: theme.semantic.error['500'] },
    text: { color: TEXT_ON_FILLED },
    iconColor: TEXT_ON_FILLED,
  };
}

// ---------------------------------------------------------------------------
// Style builder
// ---------------------------------------------------------------------------

function buildVariantStyles(theme: ResolvedTheme, variant: ButtonVariant): VariantResult {
  switch (variant) {
    case ButtonVariant.Primary: return primaryStyles(theme);
    case ButtonVariant.Secondary: return secondaryStyles(theme);
    case ButtonVariant.Outline: return outlineStyles(theme);
    case ButtonVariant.Ghost: return ghostStyles(theme);
    case ButtonVariant.Danger: return dangerStyles(theme);
    default: throw new Error(`Unhandled button variant: ${String(variant)}`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildButtonStyles(
  theme: ResolvedTheme,
  variant: ButtonVariant,
  size: ButtonSize,
): ButtonStyleSet {
  const variantResult = buildVariantStyles(theme, variant);

  const base = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BORDER_RADIUS,
      minWidth: MIN_TOUCH_WIDTH,
      minHeight: SIZE_HEIGHT_MAP[size],
      paddingHorizontal: SIZE_HORIZONTAL_PADDING_MAP[size],
      gap: ICON_GAP,
      ...variantResult.container,
    },
    text: {
      fontWeight: '600',
      fontSize: SIZE_FONT_MAP[size],
      ...variantResult.text,
    },
  });

  return {
    container: base.container,
    text: base.text,
    iconColor: variantResult.iconColor,
  };
}

export { DISABLED_OPACITY };

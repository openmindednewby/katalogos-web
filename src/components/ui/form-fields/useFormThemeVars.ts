/**
 * Hook that maps useTheme() colors to CSS custom properties
 * for native HTML form field components.
 *
 * Returns a CSSProperties object to be spread on a wrapper element,
 * ensuring form fields use per-tenant theme colors without relying
 * on externally-injected :root CSS variables.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { useTheme } from '../../../theme/hooks/useTheme';

const WHITE_COLOR = '#ffffff';

/** CSS custom properties style record compatible with React's style prop. */
type CssVarStyle = CSSProperties & Record<`--${string}`, string>;

export interface FormThemeVars {
  /** CSS custom properties to spread on the wrapper element */
  style: CssVarStyle;
}

export function useFormThemeVars(): FormThemeVars {
  const { theme } = useTheme();
  const { colors, palette, semantic } = theme;

  const style = useMemo<CssVarStyle>(
    () => ({
      '--form-background': colors.background,
      '--form-surface': colors.surface,
      '--form-border': colors.border,
      '--form-border-focus': palette.primary['500'],
      '--form-text': colors.text,
      '--form-text-secondary': colors.textSecondary,
      '--form-error': semantic.error['500'],
      '--form-primary': palette.primary['500'],
      '--form-primary-hover': palette.primary['700'],
      '--form-text-on-primary': WHITE_COLOR,
    }),
    [
      colors.background,
      colors.surface,
      colors.border,
      colors.text,
      colors.textSecondary,
      palette.primary,
      semantic.error,
    ],
  );

  return { style };
}

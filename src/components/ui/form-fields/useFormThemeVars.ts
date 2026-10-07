import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { useTheme } from '../../../theme/hooks/useTheme';

const WHITE_COLOR = '#ffffff';

type CssVarStyle = CSSProperties & Record<`--${string}`, string>;

interface FormThemeVars {
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

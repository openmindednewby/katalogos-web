import { defaultAuthTheme, type AuthTheme } from '@dloizides/auth-web';

import type { ResolvedTheme } from '../theme/types/resolvedTheme';

const ON_PRIMARY_COLOR = '#ffffff';

/** Build an `AuthTheme` from the app's resolved tenant theme. */
export function mapAppThemeToAuthTheme(theme: ResolvedTheme): AuthTheme {
  return {
    colors: {
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: theme.colors.text,
      textSecondary: theme.colors.textSecondary,
      border: theme.colors.border,
      primary: theme.palette.primary['500'],
      onPrimary: ON_PRIMARY_COLOR,
      danger: theme.semantic.error['500'],
      success: theme.semantic.success['500'],
    },
    radii: defaultAuthTheme.radii,
    spacing: defaultAuthTheme.spacing,
    typography: defaultAuthTheme.typography,
  };
}

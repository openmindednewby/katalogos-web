


/**
 * Main theme styles export file.
 * Re-exports all theme modules for backward compatibility.
 *
 * For new code, prefer importing directly from the specific module:
 * - palette.ts - Color palette definitions
 * - layout.ts - Layout styles (sidebar, topbar, etc.)
 * - buttons.ts - Button styles
 * - typography.ts - Typography styles
 * - forms.ts - Form-related styles
 * - hooks.ts - Theme hooks (useThemeColors — deprecated, use useTheme instead)
 */
import { StyleSheet } from 'react-native';

const APP_BACKGROUND_COLOR = '#fff';

// Base styles
const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLarge: {
    fontSize: 20,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default styles;

// Re-export all theme modules for backward compatibility
export { themePalette } from './palette';
export { layoutStyles } from './layout';
export { buttonStyles } from './buttons';
export { typography } from './typography';
export { useDynamicFormStyles, type FormStyles } from './forms';

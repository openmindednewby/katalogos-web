

import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { DISABLED_OPACITY } from '../../../shared/constants';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  uploadButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  uploadText: {
    fontSize: 14,
  },
  uploadHint: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeStyles {
  label: TextStyle;
  uploadButton: ViewStyle;
  uploadText: TextStyle;
  uploadHint: TextStyle;
  errorText: TextStyle;
}

// ---------------------------------------------------------------------------
// Theme style builder
// ---------------------------------------------------------------------------

/**
 * Creates theme styles for the uploader.
 */
export function createUploaderThemeStyles(
  colors: { text: string; surface: string; border: string; primary: string; textSecondary: string; error: string },
  disabled: boolean,
): ThemeStyles {
  return {
    label: { color: colors.text },
    uploadButton: {
      backgroundColor: colors.surface,
      borderColor: disabled ? colors.border : colors.primary,
      opacity: disabled ? DISABLED_OPACITY : 1,
    },
    uploadText: { color: colors.primary },
    uploadHint: { color: colors.textSecondary },
    errorText: { color: colors.error },
  };
}

import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { DISABLED_OPACITY } from '../../../shared/constants';

export { DISABLED_OPACITY };
const DELETE_TEXT_COLOR = '#ffffff';

export const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  documentIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  documentIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  fileName: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export interface ThemeStyles {
  container: ViewStyle;
  previewContainer: ViewStyle;
  documentIcon: TextStyle;
  documentName: TextStyle;
  footer: ViewStyle;
  fileName: TextStyle;
  deleteButton: ViewStyle;
  deleteText: TextStyle;
  errorText: TextStyle;
}

export interface ThemeColors {
  surface: string;
  border: string;
  primary: string;
  text: string;
  error: string;
}

export function createContainerStyles(colors: ThemeColors): { container: ViewStyle; previewContainer: ViewStyle } {
  return {
    container: { backgroundColor: colors.surface, borderColor: colors.border },
    previewContainer: { backgroundColor: colors.surface },
  };
}

export function createTextStyles(colors: ThemeColors): { documentIcon: TextStyle; documentName: TextStyle; fileName: TextStyle } {
  return {
    documentIcon: { color: colors.primary },
    documentName: { color: colors.text },
    fileName: { color: colors.text },
  };
}

export function createFooterStyles(colors: ThemeColors): ViewStyle {
  return { backgroundColor: colors.surface, borderTopColor: colors.border };
}

export function createDeleteStyles(colors: ThemeColors, disabled: boolean): { button: ViewStyle; text: TextStyle } {
  return {
    button: { backgroundColor: colors.error, opacity: disabled ? DISABLED_OPACITY : 1 },
    text: { color: DELETE_TEXT_COLOR },
  };
}

export function getDocumentIcon(contentType: string): string {
  if (contentType.includes('pdf')) return 'PDF';
  if (contentType.includes('word') || contentType.includes('document')) return 'DOC';
  return 'FILE';
}

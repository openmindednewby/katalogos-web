/**
 * Styles for the HeaderEditor component.
 */
import { StyleSheet } from 'react-native';

import {
  BUTTON_BORDER_RADIUS,
  DISABLED_OPACITY,
  PREVIEW_MIN_HEIGHT,
  PREVIEW_WIDTH,
} from './headerEditorConstants';

export const headerEditorStyles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewBox: {
    width: PREVIEW_WIDTH,
    minHeight: PREVIEW_MIN_HEIGHT,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  previewLogoContainer: {
    marginBottom: 8,
  },
  previewLogo: {
    borderRadius: 4,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: 11,
    marginTop: 2,
  },
  controlsContainer: {
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
  },
  selectorRow: {
    gap: 8,
  },
  selectorLabel: {
    fontSize: 14,
  },
  selectorButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectorButtonActive: {
    borderWidth: 2,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});



/**
 * Styles for ImportExportButtons component.
 */

import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '@/shared/constants';

const BUTTON_GAP = 8;
const MODAL_PADDING = 24;
const MODAL_BORDER_RADIUS = 12;
const PREVIEW_BORDER_RADIUS = 8;
const PREVIEW_PADDING = 16;
const PREVIEW_MAX_HEIGHT = 300;
const ERROR_BORDER_RADIUS = 8;
const ERROR_PADDING_VERTICAL = 12;
const ERROR_PADDING_HORIZONTAL = 16;
const METADATA_BORDER_RADIUS = 8;
const METADATA_PADDING = 12;
const METADATA_MARGIN_BOTTOM = 16;
const BUTTON_MIN_WIDTH = 100;
const TRANSPARENT = 'transparent';

export const importExportButtonsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: BUTTON_GAP,
    alignItems: 'center',
  },
  button: {
    minWidth: BUTTON_MIN_WIDTH,
  },
  hiddenInput: {
    display: 'none',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    padding: MODAL_PADDING,
    borderRadius: MODAL_BORDER_RADIUS,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewContainer: {
    borderRadius: PREVIEW_BORDER_RADIUS,
    padding: PREVIEW_PADDING,
    maxHeight: PREVIEW_MAX_HEIGHT,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  errorContainer: {
    borderRadius: ERROR_BORDER_RADIUS,
    paddingVertical: ERROR_PADDING_VERTICAL,
    paddingHorizontal: ERROR_PADDING_HORIZONTAL,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  metadataContainer: {
    borderRadius: METADATA_BORDER_RADIUS,
    padding: METADATA_PADDING,
    marginBottom: METADATA_MARGIN_BOTTOM,
  },
  metadataLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: BUTTON_GAP,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: BUTTON_MIN_WIDTH,
    gap: 6,
  },
  actionButtonOutlined: {
    backgroundColor: TRANSPARENT,
  },
  actionButtonContained: {
    borderColor: TRANSPARENT,
  },
  actionButtonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonIcon: {
    fontSize: 16,
  },
});

/**
 * Styles for the menu import modal and sub-components.
 */
import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '@/shared/constants';

const BORDER_RADIUS = 12;
const MODAL_MAX_WIDTH = 640;
const MODAL_MAX_HEIGHT_RATIO = 0.85;
const BUTTON_PADDING_H = 20;
const BUTTON_PADDING_V = 10;
const BUTTON_BORDER_RADIUS = 6;

export const menuImportStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: BORDER_RADIUS,
    padding: 24,
    width: '90%',
    maxWidth: MODAL_MAX_WIDTH,
    maxHeight: `${MODAL_MAX_HEIGHT_RATIO * 100}%`,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
  stepDotActive: {
    opacity: 1,
  },
  body: {
    flex: 1,
    minHeight: 200,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  buttonOutlined: {
    paddingHorizontal: BUTTON_PADDING_H,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: 1,
  },
  buttonContained: {
    paddingHorizontal: BUTTON_PADDING_H,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 13,
    opacity: 0.6,
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
  },
  summaryCard: {
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewScrollView: {
    maxHeight: 300,
    marginTop: 12,
  },
  columnMapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  columnMapLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  columnMapSample: {
    flex: 1,
    fontSize: 12,
    opacity: 0.6,
  },
  columnMapPicker: {
    flex: 1,
  },
  importButton: {
    padding: 10,
    borderRadius: BUTTON_BORDER_RADIUS,
    marginTop: 8,
  },
  importButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});


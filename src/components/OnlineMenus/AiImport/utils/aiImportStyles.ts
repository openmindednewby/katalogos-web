/**
 * Styles for the AI menu import modal and sub-components.
 */
import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '@/shared/constants';

const BORDER_RADIUS = 12;
const MODAL_MAX_WIDTH = 680;
const MODAL_MAX_HEIGHT_PERCENT = 85;
const BUTTON_PADDING_H = 20;
const BUTTON_PADDING_V = 10;
const BUTTON_BORDER_RADIUS = 6;
const UPLOAD_AREA_MIN_HEIGHT = 160;
const UPLOAD_AREA_PADDING = 32;
const BODY_MIN_HEIGHT = 200;

export const aiImportStyles = StyleSheet.create({
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
    maxHeight: `${MODAL_MAX_HEIGHT_PERCENT}%`,
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
    minHeight: BODY_MIN_HEIGHT,
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
    padding: UPLOAD_AREA_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UPLOAD_AREA_MIN_HEIGHT,
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
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
});

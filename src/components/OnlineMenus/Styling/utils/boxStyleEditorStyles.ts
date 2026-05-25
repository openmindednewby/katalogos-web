/**
 * Styles for the BoxStyleEditor component.
 */
import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY, PREVIEW_BOX_SIZE } from './boxStyleEditorConstants';

export const boxStyleEditorStyles = StyleSheet.create({
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
    width: PREVIEW_BOX_SIZE,
    height: PREVIEW_BOX_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 12,
  },
  controlsContainer: {
    gap: 16,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorLabel: {
    fontSize: 14,
    flex: 1,
    minWidth: 100,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
  },
  colorInputWrapper: {
    flex: 1,
    maxWidth: 120,
  },
  colorInput: {
    flex: 1,
    maxWidth: 120,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 10,
    marginTop: 2,
  },
  sliderRow: {
    gap: 8,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 14,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderInputWrapper: {
    flex: 1,
    paddingVertical: 8,
  },
  sliderStepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sliderStepButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});

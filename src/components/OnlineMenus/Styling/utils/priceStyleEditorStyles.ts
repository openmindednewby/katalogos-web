

import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '../../../../shared/constants';

const MENU_OVERLAY_BG = 'rgba(0, 0, 0, 0.3)';
const SEGMENT_BG_DEFAULT = '#f0f0f0';
const SEGMENT_BORDER_DEFAULT = '#ccc';
const SEGMENT_BG_SELECTED = '#6200ee';
const SEGMENT_TEXT_DEFAULT = '#333';
const SEGMENT_TEXT_SELECTED = '#fff';

export const priceStyleEditorStyles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  controlsContainer: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    flex: 1,
    minWidth: 100,
  },
  sliderContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'right',
  },
  dropdownContainer: {
    flex: 1,
    maxWidth: 150,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
  dropdownButtonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  dropdownText: {
    fontSize: 14,
  },
  menuContent: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
    minWidth: 150,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MENU_OVERLAY_BG,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
  },
  colorInputWrapper: {
    flex: 1,
    maxWidth: 120,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
  },
  colorInput: {
    flex: 1,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segmentedButtons: {
    flex: 1,
    maxWidth: 200,
  },
  segmentedButtonGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: SEGMENT_BG_DEFAULT,
    borderWidth: 1,
    borderColor: SEGMENT_BORDER_DEFAULT,
    borderLeftWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedButtonFirst: {
    borderLeftWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentedButtonLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentedButtonSelected: {
    backgroundColor: SEGMENT_BG_SELECTED,
    borderColor: SEGMENT_BG_SELECTED,
  },
  segmentedButtonText: {
    fontSize: 14,
    color: SEGMENT_TEXT_DEFAULT,
  },
  segmentedButtonTextSelected: {
    color: SEGMENT_TEXT_SELECTED,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewPrice: {
    textAlign: 'center',
  },
  previewStrikethrough: {
    textDecorationLine: 'line-through',
  },
});

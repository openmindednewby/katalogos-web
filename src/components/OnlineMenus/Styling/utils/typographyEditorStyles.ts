
import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from './typographyConstants';

const MENU_OVERLAY_BG = 'rgba(0, 0, 0, 0.3)';

export const typographyEditorStyles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  inputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    minWidth: 120,
    maxWidth: 200,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dropdown: {
    minWidth: 120,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 40,
  },
  numberInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  unitLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  previewTitle: {
    marginBottom: 8,
  },
  previewBody: {
    marginBottom: 8,
  },
  previewPrice: {
    // Price preview styling handled inline
  },
  resetContainer: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  resetButtonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 40,
  },
  picker: {
    flex: 1,
  },
  pickerText: {
    fontSize: 14,
  },
  disabledInput: {
    opacity: DISABLED_OPACITY,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MENU_OVERLAY_BG,
  },
  menuContent: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
    minWidth: 150,
    maxHeight: 300,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
  },
  menuItemHighlight: {
    fontWeight: '700',
  },
  menuSearchInput: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  menuScrollView: {
    maxHeight: 250,
  },
  menuNoResults: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontStyle: 'italic',
    fontSize: 14,
  },
  menuCustomOptionText: {
    fontStyle: 'italic',
  },
});

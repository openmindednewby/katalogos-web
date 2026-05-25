import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from './colorSchemeConstants';

export const colorSchemeEditorStyles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetsContainer: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  presetsScrollView: {
    flexGrow: 0,
  },
  presetsScrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  colorsContainer: {
    gap: 12,
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
});

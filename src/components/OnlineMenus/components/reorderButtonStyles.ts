/**
 * Styles for ReorderButtons component.
 */
import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '../../../shared/constants';

const BUTTON_SIZE = 28;

export const reorderButtonStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: DISABLED_OPACITY },
  buttonText: { fontSize: 14, fontWeight: '600', lineHeight: BUTTON_SIZE },
});




/**
 * Button styles used across the application.
 */
import { StyleSheet } from 'react-native';

/** WCAG 2.5.5 minimum touch target size */
const MIN_TOUCH_TARGET_HEIGHT = 44;

export const buttonStyles = StyleSheet.create({
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: MIN_TOUCH_TARGET_HEIGHT,
  },
  text: {
    fontWeight: '600',
  },
  outline: {
    borderWidth: 1,
  },
});

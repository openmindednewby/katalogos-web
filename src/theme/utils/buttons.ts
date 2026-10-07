


import { StyleSheet } from 'react-native';

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




import { StyleSheet } from 'react-native';

const APP_BACKGROUND_COLOR = '#fff';

const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLarge: {
    fontSize: 20,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default styles;

export { themePalette } from './palette';
export { layoutStyles } from './layout';
export { typography } from './typography';
export { useDynamicFormStyles, type FormStyles } from './forms';

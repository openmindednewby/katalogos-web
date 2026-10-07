/* global require */

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      env: 'test',
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockModal = ({ children, visible, testID }) => {
    if (!visible) return null;
    return React.createElement(View, { testID }, children);
  };

  return { default: MockModal, __esModule: true };
});

jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const React = require('react');
  const ReactNative = require('react-native');

  class MockSwitch extends React.Component {
    handlePress = () => {
      const { value, onValueChange, disabled } = this.props;
      if (!disabled && onValueChange) onValueChange(!value);
    };

    render() {
      const { value, testID, disabled, accessibilityLabel, accessibilityHint } = this.props;

      return React.createElement(
        ReactNative.View,
        {
          accessibilityRole: 'switch',
          accessibilityLabel,
          accessibilityHint,
          disabled,
          testID,
          value,
          accessible: true,
          onPress: this.handlePress,
          onTouchEnd: this.handlePress,
        },
        React.createElement(ReactNative.Text, null, value ? 'ON' : 'OFF')
      );
    }
  }

  return { default: MockSwitch, __esModule: true };
});

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
  I18nextProvider: ({ children }) => children,
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

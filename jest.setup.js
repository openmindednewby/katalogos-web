/* global require */
/**
 * Jest setup file for React Native testing.
 * Simplified setup for utility function testing.
 */

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      env: 'test',
    },
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Modal to render synchronously in tests
// This prevents flaky tests caused by Modal's async portal behavior
jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockModal = ({ children, visible, testID }) => {
    if (!visible) return null;
    return React.createElement(View, { testID }, children);
  };

  return { default: MockModal, __esModule: true };
});

// Mock React Native Switch to respond to press events in tests
// Creates a custom component that preserves props for testing and responds to fireEvent.press
jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const React = require('react');
  const ReactNative = require('react-native');

  // Class component to properly expose props for testing
  class MockSwitch extends React.Component {
    handlePress = () => {
      const { value, onValueChange, disabled } = this.props;
      if (!disabled && onValueChange) onValueChange(!value);
    };

    render() {
      const { value, testID, disabled, accessibilityLabel, accessibilityHint } = this.props;

      // Use View as base to preserve props, but add onPress for fireEvent.press compatibility
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
          // onPress is needed for fireEvent.press to work
          onPress: this.handlePress,
          // Also add touch handlers as backup
          onTouchEnd: this.handlePress,
        },
        React.createElement(ReactNative.Text, null, value ? 'ON' : 'OFF')
      );
    }
  }

  return { default: MockSwitch, __esModule: true };
});

// Mock react-i18next so i18n.ts can initialize in test environment
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

// Mock expo-localization for i18n.ts
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Global test utilities - suppress noisy console output during tests
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

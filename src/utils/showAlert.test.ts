/**
 * Tests for showAlert utility function.
 */
import { Alert, Platform } from 'react-native';

import { showAlert } from './showAlert';

// Mock react-native
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'web',
  },
}));

/**
 * Helper to set Platform.OS value for testing.
 * Uses Object.defineProperty to avoid ESLint naming-convention errors.
 */
const setPlatformOS = (os: string): void => {
  Object.defineProperty(Platform, 'OS', {
    value: os,
    writable: true,
    configurable: true,
  });
};

describe('showAlert', () => {
  const mockAlert = Alert.alert as jest.Mock;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    jest.clearAllMocks();
    originalWindow = global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('on web platform', () => {
    beforeEach(() => {
      setPlatformOS('web');
    });

    it('uses window.alert when available', () => {
      const mockWindowAlert = jest.fn();
      global.window = { alert: mockWindowAlert } as unknown as typeof globalThis.window;

      showAlert('Test message');

      expect(mockWindowAlert).toHaveBeenCalledWith('Test message');
      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('falls back to Alert.alert when window.alert is not available', () => {
      global.window = {} as unknown as typeof globalThis.window;

      showAlert('Test message', 'Custom Title');

      expect(mockAlert).toHaveBeenCalledWith('Custom Title', 'Test message');
    });

    it('falls back to Alert.alert when window is undefined', () => {
      // @ts-expect-error - testing undefined window
      global.window = undefined;

      showAlert('Test message');

      expect(mockAlert).toHaveBeenCalledWith('Error', 'Test message');
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      setPlatformOS('ios');
    });

    it('uses Alert.alert on iOS', () => {
      const mockWindowAlert = jest.fn();
      global.window = { alert: mockWindowAlert } as unknown as typeof globalThis.window;

      showAlert('Test message');

      expect(mockAlert).toHaveBeenCalledWith('Error', 'Test message');
      expect(mockWindowAlert).not.toHaveBeenCalled();
    });

    it('uses Alert.alert on Android', () => {
      setPlatformOS('android');
      const mockWindowAlert = jest.fn();
      global.window = { alert: mockWindowAlert } as unknown as typeof globalThis.window;

      showAlert('Test message', 'Warning');

      expect(mockAlert).toHaveBeenCalledWith('Warning', 'Test message');
      expect(mockWindowAlert).not.toHaveBeenCalled();
    });
  });

  describe('default title', () => {
    it('uses "Error" as default title', () => {
      setPlatformOS('ios');

      showAlert('Something went wrong');

      expect(mockAlert).toHaveBeenCalledWith('Error', 'Something went wrong');
    });
  });
});

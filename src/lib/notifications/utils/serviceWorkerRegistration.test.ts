/**
 * Tests for serviceWorkerRegistration utilities.
 *
 * Unit tests focus on the service worker registration logic.
 */
import {
  isNotificationApiSupported,
  isNotificationClickedMessage,
  isNotificationClosedMessage,
  isServiceWorkerSupported,
  ServiceWorkerMessageType,
} from './serviceWorkerRegistration';

import type {
  NotificationClickedMessage,
  NotificationClosedMessage,
} from './serviceWorkerRegistration';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('serviceWorkerRegistration', () => {
  describe('isServiceWorkerSupported', () => {
    const originalWindow = global.window;
    const originalNavigator = global.navigator;

    afterEach(() => {
      global.window = originalWindow;
      global.navigator = originalNavigator;
    });

    it('returns false when window is undefined', () => {
      // Simulate non-browser environment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test override
      (global as any).window = undefined;

      expect(isServiceWorkerSupported()).toBe(false);
    });

    it('returns true when serviceWorker is in navigator', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(isServiceWorkerSupported()).toBe(true);
    });
  });

  describe('isNotificationApiSupported', () => {
    const originalWindow = global.window;

    afterEach(() => {
      global.window = originalWindow;
    });

    it('returns false when window is undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test override
      (global as any).window = undefined;

      expect(isNotificationApiSupported()).toBe(false);
    });

    it('returns true when Notification is in window', () => {
      Object.defineProperty(window, 'Notification', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(isNotificationApiSupported()).toBe(true);
    });
  });

  describe('isNotificationClickedMessage', () => {
    it('returns true for notification clicked message', () => {
      const message: NotificationClickedMessage = {
        type: ServiceWorkerMessageType.NotificationClicked,
        notificationId: 'test-id',
        actionUrl: '/test',
        notificationType: 'test',
      };

      expect(isNotificationClickedMessage(message)).toBe(true);
    });

    it('returns false for notification closed message', () => {
      const message: NotificationClosedMessage = {
        type: ServiceWorkerMessageType.NotificationClosed,
        notificationId: 'test-id',
        notificationType: 'test',
      };

      expect(isNotificationClickedMessage(message)).toBe(false);
    });
  });

  describe('isNotificationClosedMessage', () => {
    it('returns true for notification closed message', () => {
      const message: NotificationClosedMessage = {
        type: ServiceWorkerMessageType.NotificationClosed,
        notificationId: 'test-id',
        notificationType: 'test',
      };

      expect(isNotificationClosedMessage(message)).toBe(true);
    });

    it('returns false for notification clicked message', () => {
      const message: NotificationClickedMessage = {
        type: ServiceWorkerMessageType.NotificationClicked,
        notificationId: 'test-id',
        actionUrl: '/test',
        notificationType: 'test',
      };

      expect(isNotificationClosedMessage(message)).toBe(false);
    });
  });

  describe('ServiceWorkerMessageType', () => {
    it('has correct values', () => {
      expect(ServiceWorkerMessageType.NotificationClicked).toBe('NOTIFICATION_CLICKED');
      expect(ServiceWorkerMessageType.NotificationClosed).toBe('NOTIFICATION_CLOSED');
    });
  });
});

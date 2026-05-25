/**
 * Unit tests for testNotificationApi
 *
 * Tests the E2E test notification API functions.
 */

import {
  createFullNotification,
  setupTestNotificationApi,
  cleanupTestNotificationApi,
  registerNotificationStore,
  unregisterNotificationStore,
} from './testNotificationApi';
import { createMockStore } from './testNotificationApi.helpers';

// Mock the process.env
const originalEnv = process.env.NODE_ENV;

describe('testNotificationApi', () => {
  beforeEach(() => {
    // Reset environment
    process.env.NODE_ENV = 'test';
    // Clean up any existing test API
    cleanupTestNotificationApi();
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    cleanupTestNotificationApi();
  });

  describe('createFullNotification', () => {
    it('creates a notification with default values when given empty partial', () => {
      const notification = createFullNotification({});

      expect(notification.id).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(notification.type).toBe('test');
      expect(notification.title).toBe('Test Notification');
      expect(notification.priority).toBe('normal');
      expect(notification.displayPreference).toBe('in_app');
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeDefined();
    });

    it('uses provided values when given a partial notification', () => {
      const partial = {
        id: 'custom-id',
        type: 'custom-type',
        title: 'Custom Title',
        body: 'Custom body text',
        priority: 'high' as const,
        displayPreference: 'both' as const,
        isRead: true,
      };

      const notification = createFullNotification(partial);

      expect(notification.id).toBe('custom-id');
      expect(notification.type).toBe('custom-type');
      expect(notification.title).toBe('Custom Title');
      expect(notification.body).toBe('Custom body text');
      expect(notification.priority).toBe('high');
      expect(notification.displayPreference).toBe('both');
      expect(notification.isRead).toBe(true);
    });

    it('generates unique IDs for each call', () => {
      const notification1 = createFullNotification({});
      const notification2 = createFullNotification({});

      expect(notification1.id).not.toBe(notification2.id);
    });

    it('includes optional fields when provided', () => {
      const partial = {
        actionUrl: '/some/path',
        icon: 'icon-name',
        category: 'alerts',
        metadata: { key: 'value' },
      };

      const notification = createFullNotification(partial);

      expect(notification.actionUrl).toBe('/some/path');
      expect(notification.icon).toBe('icon-name');
      expect(notification.category).toBe('alerts');
      expect(notification.metadata).toEqual({ key: 'value' });
    });
  });

  describe('setupTestNotificationApi', () => {
    it('exposes the test API on window in non-production', () => {
      process.env.NODE_ENV = 'development';
      setupTestNotificationApi();

      expect(window.__NOTIFICATION_TEST_API__).toBeDefined();
      expect(typeof window.__NOTIFICATION_TEST_API__?.injectNotification).toBe('function');
      expect(typeof window.__NOTIFICATION_TEST_API__?.clearNotifications).toBe('function');
      expect(typeof window.__NOTIFICATION_TEST_API__?.getNotifications).toBe('function');
      expect(typeof window.__NOTIFICATION_TEST_API__?.getUnreadCount).toBe('function');
    });

    it('does not expose the API in production', () => {
      process.env.NODE_ENV = 'production';
      setupTestNotificationApi();

      expect(window.__NOTIFICATION_TEST_API__).toBeUndefined();
    });
  });

  describe('cleanupTestNotificationApi', () => {
    it('removes the test API from window', () => {
      process.env.NODE_ENV = 'development';
      setupTestNotificationApi();
      expect(window.__NOTIFICATION_TEST_API__).toBeDefined();

      cleanupTestNotificationApi();
      expect(window.__NOTIFICATION_TEST_API__).toBeUndefined();
    });
  });

  describe('registerNotificationStore', () => {
    it('does not register store in production', () => {
      process.env.NODE_ENV = 'production';
      const mockStore = createMockStore();
      registerNotificationStore(mockStore);
      setupTestNotificationApi();

      expect(window.__NOTIFICATION_TEST_API__).toBeUndefined();
    });

    it('allows API operations when store is registered', () => {
      process.env.NODE_ENV = 'development';
      const mockStore = createMockStore();
      setupTestNotificationApi();
      registerNotificationStore(mockStore);

      expect(() => {
        window.__NOTIFICATION_TEST_API__?.injectNotification({ title: 'Test' });
      }).not.toThrow();

      expect(mockStore.getState().addNotification).toHaveBeenCalled();
    });

    it('throws error when calling API without registered store', () => {
      process.env.NODE_ENV = 'development';
      setupTestNotificationApi();

      expect(() => {
        window.__NOTIFICATION_TEST_API__?.injectNotification({ title: 'Test' });
      }).toThrow('Notification store not registered');
    });
  });

  describe('unregisterNotificationStore', () => {
    it('clears the registered store', () => {
      process.env.NODE_ENV = 'development';
      const mockStore = createMockStore();
      setupTestNotificationApi();
      registerNotificationStore(mockStore);
      unregisterNotificationStore();

      const notifications = window.__NOTIFICATION_TEST_API__?.getNotifications();
      expect(notifications).toEqual([]);
    });
  });
});

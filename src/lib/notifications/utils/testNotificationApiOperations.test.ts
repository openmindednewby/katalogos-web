/**
 * Unit tests for testNotificationApi store operations
 *
 * Tests the API operations when a store is registered.
 */

import {
  setupTestNotificationApi,
  cleanupTestNotificationApi,
  registerNotificationStore,
} from './testNotificationApi';
import { createMockStore } from './testNotificationApi.helpers';

// Mock the process.env
const originalEnv = process.env.NODE_ENV;

describe('testNotificationApi operations', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    mockStore = createMockStore();
    cleanupTestNotificationApi();
    setupTestNotificationApi();
    registerNotificationStore(mockStore);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    cleanupTestNotificationApi();
  });

  it('injectNotification adds notification to store', () => {
    const result = window.__NOTIFICATION_TEST_API__?.injectNotification({
      title: 'Test Title',
      body: 'Test Body',
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe('Test Title');
    expect(result?.body).toBe('Test Body');
    expect(mockStore.getState().addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Title',
        body: 'Test Body',
      })
    );
  });

  it('clearNotifications calls store clearNotifications', () => {
    window.__NOTIFICATION_TEST_API__?.clearNotifications();

    expect(mockStore.getState().clearNotifications).toHaveBeenCalled();
  });

  it('getNotifications returns store notifications', () => {
    const notifications = window.__NOTIFICATION_TEST_API__?.getNotifications();

    expect(notifications).toEqual([]);
  });

  it('getUnreadCount returns store unreadCount', () => {
    const count = window.__NOTIFICATION_TEST_API__?.getUnreadCount();

    expect(count).toBe(0);
  });

  it('addToast adds toast to store', () => {
    const result = window.__NOTIFICATION_TEST_API__?.addToast({
      title: 'Toast Title',
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe('Toast Title');
    expect(mockStore.getState().addToast).toHaveBeenCalled();
  });

  it('removeToast calls store removeToast', () => {
    window.__NOTIFICATION_TEST_API__?.removeToast('toast-id');

    expect(mockStore.getState().removeToast).toHaveBeenCalledWith('toast-id');
  });

  it('getToasts returns store toasts', () => {
    const toasts = window.__NOTIFICATION_TEST_API__?.getToasts();

    expect(toasts).toEqual([]);
  });

  it('markAsRead calls store markAsRead', () => {
    window.__NOTIFICATION_TEST_API__?.markAsRead('notification-id');

    expect(mockStore.getState().markAsRead).toHaveBeenCalledWith('notification-id');
  });

  it('markAllAsRead calls store markAllAsRead', () => {
    window.__NOTIFICATION_TEST_API__?.markAllAsRead();

    expect(mockStore.getState().markAllAsRead).toHaveBeenCalled();
  });
});

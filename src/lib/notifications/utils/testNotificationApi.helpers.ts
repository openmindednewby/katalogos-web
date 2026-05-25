/**
 * Test helpers for testNotificationApi tests
 */

import type { Notification } from '@dloizides/notification-client';

/**
 * Mock store state interface
 */
interface MockStoreState {
  notifications: Notification[];
  unreadCount: number;
  toasts: Notification[];
  addNotification: jest.Mock;
  clearNotifications: jest.Mock;
  addToast: jest.Mock;
  removeToast: jest.Mock;
  markAsRead: jest.Mock;
  markAllAsRead: jest.Mock;
}

/**
 * Mock store interface
 */
interface MockStore {
  getState: () => MockStoreState;
  subscribe: jest.Mock;
}

/**
 * Create a mock notification store for testing
 */
export function createMockStore(): MockStore {
  const notifications: Notification[] = [];
  const toasts: Notification[] = [];

  const storeState: MockStoreState = {
    notifications,
    unreadCount: 0,
    toasts,
    addNotification: jest.fn(),
    clearNotifications: jest.fn(),
    addToast: jest.fn(),
    removeToast: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  return {
    getState: () => storeState,
    subscribe: jest.fn(),
  };
}

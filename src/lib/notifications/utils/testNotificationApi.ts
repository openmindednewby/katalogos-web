

/**
 * Create a full notification from partial data
 */
/**
 * Test Notification API for E2E Testing
 *
 * This module exposes a test API on the window object that allows Playwright E2E tests
 * to inject mock notifications without needing the real backend/SignalR connection.
 *
 * SECURITY: This API is only exposed in non-production environments.
 */

import { isValueDefined } from '@dloizides/utils';

import type { Notification, NotificationPriority, DisplayPreference } from '@dloizides/notification-client';

/** Default priority for test notifications */
const DEFAULT_PRIORITY: NotificationPriority = 'normal';

/** Default display preference for test notifications */
const DEFAULT_DISPLAY_PREFERENCE: DisplayPreference = 'in_app';

/** Radix for generating random ID string */
const RANDOM_ID_RADIX = 36;

/** Start index for random ID substring */
const RANDOM_ID_START = 2;

/** End index for random ID substring */
const RANDOM_ID_END = 9;

/**
 * Store actions interface that matches the notification store
 */
interface NotificationStoreActions {
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  addToast: (notification: Notification) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

/**
 * Store state interface that matches the notification store
 */
interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  toasts: Notification[];
}

/**
 * Store hook interface that matches the Zustand store
 */
interface NotificationStoreHook {
  getState: () => NotificationStoreState & NotificationStoreActions;
}

/** Reference to the notification store hook */
let registeredStore: NotificationStoreHook | null = null;

export function createFullNotification(partial: Partial<Notification>): Notification {
  const now = new Date().toISOString();
  const randomPart = Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_START, RANDOM_ID_END);
  const id = partial.id ?? `test-${Date.now()}-${randomPart}`;

  return {
    id,
    type: partial.type ?? 'test',
    title: partial.title ?? 'Test Notification',
    body: partial.body,
    actionUrl: partial.actionUrl,
    icon: partial.icon,
    priority: partial.priority ?? DEFAULT_PRIORITY,
    category: partial.category,
    displayPreference: partial.displayPreference ?? DEFAULT_DISPLAY_PREFERENCE,
    isRead: partial.isRead ?? false,
    createdAt: partial.createdAt ?? now,
    metadata: partial.metadata,
  };
}

/**
 * Register the notification store for the test API.
 * This should be called by the NotificationProvider when it mounts.
 *
 * @param store - The Zustand notification store hook
 */
export function registerNotificationStore(store: NotificationStoreHook): void {
  if (isProduction()) return;
  registeredStore = store;
}

/** Unregister the notification store (called on unmount) */
export function unregisterNotificationStore(): void {
  if (isProduction()) return;
  registeredStore = null;
}

/** Setup the test notification API on the window object (non-production only) */
export function setupTestNotificationApi(): void {
  if (isProduction()) return;
  if (typeof window === 'undefined') return;

  // Create the test API object
  const testApi: NotificationTestApi = {
    isStoreReady,
    injectNotification,
    clearNotifications,
    getNotifications,
    getUnreadCount,
    addToast,
    removeToast,
    getToasts,
    markAsRead,
    markAllAsRead,
  };

  // Expose on window
  window.__NOTIFICATION_TEST_API__ = testApi;
}

/** Cleanup the test notification API (removes from window) */
export function cleanupTestNotificationApi(): void {
  if (typeof window === 'undefined') return;
  delete window.__NOTIFICATION_TEST_API__;
  registeredStore = null;
}

/**
 * Check if we are in a production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the notification store has been registered
 */
function isStoreReady(): boolean {
  return isValueDefined(registeredStore);
}

/**
 * Inject a notification into the store
 */
function injectNotification(partial: Partial<Notification>): Notification {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  const notification = createFullNotification(partial);
  const storeState = registeredStore.getState();
  storeState.addNotification(notification);

  return notification;
}

/**
 * Clear all notifications from the store
 */
function clearNotifications(): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().clearNotifications();
}

/**
 * Get all notifications from the store
 */
function getNotifications(): Notification[] {
  if (!isValueDefined(registeredStore))
    return [];

  return registeredStore.getState().notifications;
}

/**
 * Get the unread count from the store
 */
function getUnreadCount(): number {
  if (!isValueDefined(registeredStore))
    return 0;

  return registeredStore.getState().unreadCount;
}

/**
 * Add a toast notification
 */
function addToast(partial: Partial<Notification>): Notification {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  const notification = createFullNotification(partial);
  const storeState = registeredStore.getState();
  storeState.addToast(notification);

  return notification;
}

/**
 * Remove a toast notification
 */
function removeToast(id: string): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().removeToast(id);
}

/**
 * Get all toast notifications
 */
function getToasts(): Notification[] {
  if (!isValueDefined(registeredStore))
    return [];

  return registeredStore.getState().toasts;
}

/**
 * Mark a notification as read
 */
function markAsRead(id: string): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().markAsRead(id);
}

/**
 * Mark all notifications as read
 */
function markAllAsRead(): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().markAllAsRead();
}

/**
 * Interface for the test API exposed on window
 */
export interface NotificationTestApi {
  /** Whether the notification store has been registered (provider mounted) */
  isStoreReady: () => boolean;
  /** Inject a notification into the store */
  injectNotification: (notification: Partial<Notification>) => Notification;
  /** Clear all notifications from the store */
  clearNotifications: () => void;
  /** Get all notifications from the store */
  getNotifications: () => Notification[];
  /** Get the unread count from the store */
  getUnreadCount: () => number;
  /** Add a toast notification */
  addToast: (notification: Partial<Notification>) => Notification;
  /** Remove a toast notification */
  removeToast: (id: string) => void;
  /** Get all toast notifications */
  getToasts: () => Notification[];
  /** Mark a notification as read */
  markAsRead: (id: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => void;
}

/** Type-safe window extension for test API */
declare global {
  interface Window {
    __NOTIFICATION_TEST_API__?: NotificationTestApi;
  }
}

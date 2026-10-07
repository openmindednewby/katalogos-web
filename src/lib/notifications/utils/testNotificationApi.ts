


import { isValueDefined } from '@dloizides/utils';

import type { Notification, NotificationPriority, DisplayPreference } from '@dloizides/notification-client';

const DEFAULT_PRIORITY: NotificationPriority = 'normal';

const DEFAULT_DISPLAY_PREFERENCE: DisplayPreference = 'in_app';

const RANDOM_ID_RADIX = 36;

const RANDOM_ID_START = 2;

const RANDOM_ID_END = 9;

interface NotificationStoreActions {
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  addToast: (notification: Notification) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  toasts: Notification[];
}

interface NotificationStoreHook {
  getState: () => NotificationStoreState & NotificationStoreActions;
}

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

/** Register the notification store for the test API. */
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

  window.__NOTIFICATION_TEST_API__ = testApi;
}

/** Cleanup the test notification API (removes from window) */
export function cleanupTestNotificationApi(): void {
  if (typeof window === 'undefined') return;
  delete window.__NOTIFICATION_TEST_API__;
  registeredStore = null;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function isStoreReady(): boolean {
  return isValueDefined(registeredStore);
}

function injectNotification(partial: Partial<Notification>): Notification {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  const notification = createFullNotification(partial);
  const storeState = registeredStore.getState();
  storeState.addNotification(notification);

  return notification;
}

function clearNotifications(): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().clearNotifications();
}

function getNotifications(): Notification[] {
  if (!isValueDefined(registeredStore))
    return [];

  return registeredStore.getState().notifications;
}

function getUnreadCount(): number {
  if (!isValueDefined(registeredStore))
    return 0;

  return registeredStore.getState().unreadCount;
}

function addToast(partial: Partial<Notification>): Notification {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  const notification = createFullNotification(partial);
  const storeState = registeredStore.getState();
  storeState.addToast(notification);

  return notification;
}

function removeToast(id: string): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().removeToast(id);
}

function getToasts(): Notification[] {
  if (!isValueDefined(registeredStore))
    return [];

  return registeredStore.getState().toasts;
}

function markAsRead(id: string): void {
  if (!isValueDefined(registeredStore))
    throw new Error('Notification store not registered. Is NotificationProvider mounted?');

  registeredStore.getState().markAsRead(id);
}

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

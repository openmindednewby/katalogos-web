/**
 * Notification utilities for OS notifications and service worker management
 */

// Event bus (in-app notification dispatching)
export { addListener, notify, notifyError, notifySignOut, notifySuccess } from './utils/eventBus';

export {
  isServiceWorkerSupported,
  isNotificationApiSupported,
  registerNotificationServiceWorker,
  unregisterNotificationServiceWorker,
  getServiceWorkerRegistration,
  onServiceWorkerMessage,
  isNotificationClickedMessage,
  isNotificationClosedMessage,
  ServiceWorkerMessageType,
} from './utils/serviceWorkerRegistration';

export type {
  NotificationClickedMessage,
  NotificationClosedMessage,
  ServiceWorkerMessage,
} from './utils/serviceWorkerRegistration';

// Test API exports (for E2E testing)
export {
  setupTestNotificationApi,
  cleanupTestNotificationApi,
  registerNotificationStore,
  unregisterNotificationStore,
  createFullNotification,
} from './utils/testNotificationApi';

export type { NotificationTestApi } from './utils/testNotificationApi';

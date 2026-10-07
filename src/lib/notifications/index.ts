/**
 * Notification utilities for OS notifications and service worker management
 */

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

export {
  setupTestNotificationApi,
  cleanupTestNotificationApi,
  registerNotificationStore,
  unregisterNotificationStore,
  createFullNotification,
} from './utils/testNotificationApi';

export type { NotificationTestApi } from './utils/testNotificationApi';

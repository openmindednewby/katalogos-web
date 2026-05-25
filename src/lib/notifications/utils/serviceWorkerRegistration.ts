


/**
 * Check if service workers are supported in the current environment
 */
/**
 * Service Worker registration utilities for OS notifications.
 *
 * IMPORTANT: The service worker only DISPLAYS notifications.
 * All notification delivery comes through SignalR WebSocket.
 */

import { isValueDefined } from '@dloizides/utils';

import { logger } from '../../../utils/logger';

const SERVICE_WORKER_PATH = '/sw-notifications.js';

/**
 * Message type values for service worker communication
 */
const SW_MSG_CLICKED = 'NOTIFICATION_CLICKED' as const;
const SW_MSG_CLOSED = 'NOTIFICATION_CLOSED' as const;

export function isServiceWorkerSupported(): boolean {
  if (typeof window === 'undefined')
    return false;

  return 'serviceWorker' in navigator;
}

/**
 * Check if the Notification API is supported
 */
export function isNotificationApiSupported(): boolean {
  if (typeof window === 'undefined')
    return false;

  return 'Notification' in window;
}

/**
 * Register the notification service worker.
 * @returns The service worker registration, or null if registration failed
 */
export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    logger.warn('ServiceWorkerRegistration', 'Service Workers not supported in this environment');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: '/',
    });

    logger.info('ServiceWorkerRegistration', 'Service worker registered successfully', {
      scope: registration.scope,
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    logger.error('ServiceWorkerRegistration', 'Failed to register service worker', { error });
    return null;
  }
}

/**
 * Unregister the notification service worker.
 * @returns true if unregistration succeeded, false otherwise
 */
export async function unregisterNotificationServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported())
    return false;


  try {
    const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);

    if (isValueDefined(registration)) {
      const result = await registration.unregister();
      logger.info('ServiceWorkerRegistration', 'Service worker unregistered', { success: result });
      return result;
    }

    return false;
  } catch (error) {
    logger.error('ServiceWorkerRegistration', 'Failed to unregister service worker', { error });
    return false;
  }
}

/**
 * Get the current service worker registration if available
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported())
    return null;


  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration ?? null;
  } catch (error) {
    logger.error('ServiceWorkerRegistration', 'Failed to get service worker registration', { error });
    return null;
  }
}

/**
 * Message types from the service worker - exported for use in type comparisons
 */
export const ServiceWorkerMessageType = {
  NotificationClicked: SW_MSG_CLICKED,
  NotificationClosed: SW_MSG_CLOSED,
} as const;

/**
 * Message sent when a notification is clicked
 */
export interface NotificationClickedMessage {
  type: typeof SW_MSG_CLICKED;
  notificationId: string | null;
  actionUrl: string | null;
  notificationType: string | null;
}

/**
 * Message sent when a notification is closed
 */
export interface NotificationClosedMessage {
  type: typeof SW_MSG_CLOSED;
  notificationId: string | null;
  notificationType: string | null;
}

/**
 * Union type for all service worker messages
 */
export type ServiceWorkerMessage = NotificationClickedMessage | NotificationClosedMessage;

/**
 * Type guard for notification clicked message
 */
export function isNotificationClickedMessage(
  message: ServiceWorkerMessage
): message is NotificationClickedMessage {
  return message.type === SW_MSG_CLICKED;
}

/**
 * Type guard for notification closed message
 */
export function isNotificationClosedMessage(
  message: ServiceWorkerMessage
): message is NotificationClosedMessage {
  return message.type === SW_MSG_CLOSED;
}

/**
 * Set up a listener for messages from the service worker
 * @param callback Function to call when a message is received
 * @returns Cleanup function to remove the listener
 */
export function onServiceWorkerMessage(
  callback: (message: ServiceWorkerMessage) => void
): () => void {
  if (!isServiceWorkerSupported())
    return () => {};


  function handleMessage(event: MessageEvent<unknown>): void {
    const data = event.data;

    if (isValidServiceWorkerMessage(data))
      callback(data);

  }

  navigator.serviceWorker.addEventListener('message', handleMessage);

  return () => {
    navigator.serviceWorker.removeEventListener('message', handleMessage);
  };
}

/**
 * Check if the message data is a valid service worker message
 */
function isValidServiceWorkerMessage(data: unknown): data is ServiceWorkerMessage {
  // Check if data is an object and defined
  if (typeof data !== 'object' || !isValueDefined(data))
    return false;


  // Check if data has a type property
  const hasTypeProperty = 'type' in data;
  if (!hasTypeProperty)
    return false;


  // Access the type property safely
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- necessary for type narrowing from unknown
  const dataObj = data as Record<string, unknown>;
  const messageType = dataObj.type;

  // Check if the type matches one of our known message types
  if (messageType === SW_MSG_CLICKED)
    return true;

  if (messageType === SW_MSG_CLOSED)
    return true;


  return false;
}

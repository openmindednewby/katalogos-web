/**
 * Web Push (VAPID) opt-in for the web app — thin glue over @dloizides/notification-client's
 * shared helper. Fetches the server's VAPID public key, subscribes the browser, and registers
 * the subscription with NotificationService (POST/DELETE /api/v1/web-push/subscriptions).
 *
 * Web-only + permission-gated: no-ops where the Push API is unavailable; subscribing prompts the
 * user for notification permission. Call enableWebPush() from an opt-in control.
 */
import { subscribeToWebPush, unsubscribeFromWebPush } from '@dloizides/notification-client';

import { notificationInstance } from '../../server/mutators/notificationMutator';
import { logger } from '../../utils/logger';

interface VapidPublicKeyResponse {
  publicKey: string;
}

/** Requests permission, subscribes, and registers the browser for web push. Returns true on success. */
export async function enableWebPush(): Promise<boolean> {
  try {
    const keyResponse = await notificationInstance<VapidPublicKeyResponse>({
      url: '/api/v1/web-push/vapid-public-key',
      method: 'GET',
    });

    const result = await subscribeToWebPush({
      vapidPublicKey: keyResponse.publicKey,
      registerSubscription: async (subscription) => {
        await notificationInstance({
          url: '/api/v1/web-push/subscriptions',
          method: 'POST',
          data: subscription,
        });
      },
      onError: (error) => logger.warn('webPush', 'subscribe failed', error),
    });

    logger.info('webPush', `enableWebPush: ${result.status}`);
    return result.status === 'subscribed';
  } catch (error) {
    logger.warn('webPush', 'enableWebPush failed', error);
    return false;
  }
}

/** Unsubscribes the browser and unregisters the endpoint server-side. Returns true on success. */
// ts-prune-ignore-next -- public web-push opt-in API; wired from the notifications opt-in control.
export async function disableWebPush(): Promise<boolean> {
  return unsubscribeFromWebPush({
    unregisterSubscription: async (endpoint) => {
      await notificationInstance({
        url: '/api/v1/web-push/subscriptions',
        method: 'DELETE',
        data: { endpoint },
      });
    },
    onError: (error) => logger.warn('webPush', 'unsubscribe failed', error),
  });
}

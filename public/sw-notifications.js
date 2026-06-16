/**
 * Service Worker for handling OS notifications.
 *
 * Two delivery paths:
 *  1. In-app (SignalR): the main app posts a SHOW_NOTIFICATION message → showNotification.
 *  2. Web Push (VAPID): the server pushes while the app/tab is closed → the 'push' handler below
 *     (payload from NotificationService's Push.WebPush provider: { title, body, icon?, url?, data? }).
 * Both share the notificationclick navigation (via data.actionUrl).
 */

const DEFAULT_NOTIFICATION_ICON = '/icons/logo-192.png';
const DEFAULT_NOTIFICATION_BADGE = '/icons/logo-50-no-background.png';

/**
 * Handle Web Push messages from the server (Push.WebPush / VAPID).
 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = { title: 'Notification', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Notification';
  const data = Object.assign({}, payload.data || {}, payload.url ? { actionUrl: payload.url } : {});

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: payload.icon || DEFAULT_NOTIFICATION_ICON,
      badge: DEFAULT_NOTIFICATION_BADGE,
      data,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

/**
 * Handle messages from the main thread to show notifications
 */
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'SHOW_NOTIFICATION') {
    return;
  }

  const { title, options } = event.data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: options.body || '',
      icon: options.icon || DEFAULT_NOTIFICATION_ICON,
      badge: options.badge || DEFAULT_NOTIFICATION_BADGE,
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

/**
 * Handle notification click events
 * - 'view' action or clicking the notification body: open actionUrl or focus app
 * - 'dismiss' action: just close the notification
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  // If user clicked dismiss, do nothing further
  if (action === 'dismiss') {
    return;
  }

  // For 'view' action or clicking the notification body
  const shouldNavigate = action === 'view' || !action;

  if (!shouldNavigate) {
    return;
  }

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // If there's an existing window, focus it and navigate if needed
      if (allClients.length > 0) {
        const client = allClients[0];

        // If there's an actionUrl, post a message to navigate
        if (data && data.actionUrl) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationId: data.id,
            actionUrl: data.actionUrl,
            notificationType: data.type,
          });
        }

        return client.focus();
      }

      // No existing window - open a new one
      const urlToOpen = data && data.actionUrl ? data.actionUrl : '/';
      return self.clients.openWindow(urlToOpen);
    })()
  );
});

/**
 * Handle notification close events (for analytics or cleanup)
 */
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data;

  // Post message back to app for analytics tracking
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        notificationId: data ? data.id : null,
        notificationType: data ? data.type : null,
      });
    });
  });
});

/**
 * Service worker install event
 */
self.addEventListener('install', () => {
  // Take control immediately
  self.skipWaiting();
});

/**
 * Service worker activate event
 */
self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

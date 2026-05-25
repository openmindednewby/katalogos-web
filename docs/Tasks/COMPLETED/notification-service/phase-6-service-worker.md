# Phase 6: Service Worker & OS Notifications

> **Agent**: `frontend-dev`
> **Status**: TODO
> **Priority**: Medium
> **Depends On**: Phase 4
> **Estimated Effort**: 1-2 days

---

## Objective

Implement Service Worker for displaying OS-level notifications when the user has configured this preference.

**Important**: This is NOT Web Push. The Service Worker only displays notifications - all message delivery comes through SignalR WebSocket (requires tab to be open).

---

## Prerequisites

- Phase 4 completed (Integration working)
- Understanding of [architecture.md](./architecture.md) - especially the "SignalR Only" architecture decision
- Browser Notification API permissions understanding

---

## Architecture Reminder

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         OUR NOTIFICATION ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ❌ NOT using Web Push API (no external services)                              │
│   ✅ SignalR delivers the message to the browser                                │
│   ✅ Service Worker ONLY displays the OS notification                           │
│                                                                                 │
│   Trade-off: Notifications only work when browser tab is open                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tasks

### Task 6.1: Create Service Worker File

**File**: `BaseClient/public/sw-notifications.js`

```javascript
// Service Worker for OS Notification Display
// This does NOT receive push messages - all messages come via SignalR

const NOTIFICATION_ICON = '/icons/notification-icon-192.png';
const NOTIFICATION_BADGE = '/icons/notification-badge-72.png';

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;

    event.waitUntil(
      self.registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || NOTIFICATION_ICON,
        badge: options.badge || NOTIFICATION_BADGE,
        tag: options.tag, // Prevents duplicate notifications with same tag
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        actions: options.actions || [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      })
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;

  if (event.action === 'view' || !event.action) {
    // Default click or "View" action
    if (data?.actionUrl) {
      event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList) => {
            // Try to focus an existing window
            for (const client of clientList) {
              if (client.url.includes(self.location.origin) && 'focus' in client) {
                client.focus();
                client.postMessage({
                  type: 'NOTIFICATION_CLICKED',
                  notificationId: data.id,
                  actionUrl: data.actionUrl,
                });
                return;
              }
            }
            // Open new window if none exists
            if (self.clients.openWindow) {
              return self.clients.openWindow(data.actionUrl);
            }
          })
      );
    }
  }
  // "Dismiss" action just closes the notification (already done above)
});

// Handle notification close (without click)
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data;

  // Optional: Track dismissal analytics
  console.log('Notification dismissed:', data?.id);
});

// Service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
```

---

### Task 6.2: Create Notification Icons

Create the following icons in `BaseClient/public/icons/`:

- [ ] `notification-icon-192.png` - 192x192 px (main icon)
- [ ] `notification-icon-512.png` - 512x512 px (high DPI)
- [ ] `notification-badge-72.png` - 72x72 px (badge/monochrome)

**Icon Guidelines**:
- Use your app logo or a bell icon
- Badge should be monochrome (will be tinted by OS)
- PNG format with transparency

---

### Task 6.3: Register Service Worker

**File**: `BaseClient/src/lib/notifications/serviceWorkerRegistration.ts`

```typescript
export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
      scope: '/',
    });

    console.log('Notification Service Worker registered:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Failed to register Notification Service Worker:', error);
    return null;
  }
}

export function unregisterNotificationServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        if (registration.active?.scriptURL.includes('sw-notifications.js')) {
          registration.unregister();
        }
      }
    });
  }
}
```

---

### Task 6.4: Update OSNotificationService

**File**: Update `NPMPackages/notifications/src/workers/osNotificationService.ts`

```typescript
import type { Notification } from '../core/types';

export class OSNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.swRegistration !== null;
    }

    if (!this.isSupported()) {
      console.warn('OS Notifications not supported');
      return false;
    }

    try {
      // Wait for service worker to be ready
      this.swRegistration = await navigator.serviceWorker.ready;
      this.isInitialized = true;

      // Listen for notification click messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

      return true;
    } catch (error) {
      console.error('Failed to initialize OS Notification Service:', error);
      return false;
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  async showNotification(notification: Notification): Promise<boolean> {
    if (!this.isInitialized || !this.swRegistration?.active) {
      console.warn('OS Notification Service not initialized');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Map priority to options
    const isUrgent = notification.priority === 'urgent' || notification.priority === 'high';

    this.swRegistration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title: notification.title,
      options: {
        body: notification.body || '',
        icon: notification.icon || '/icons/notification-icon-192.png',
        badge: '/icons/notification-badge-72.png',
        tag: `notification-${notification.id}`,
        data: {
          id: notification.id,
          actionUrl: notification.actionUrl,
          type: notification.type,
          category: notification.category,
        },
        requireInteraction: isUrgent,
        silent: false,
        actions: this.getActions(notification),
      },
    });

    return true;
  }

  private getActions(notification: Notification): NotificationAction[] {
    const actions: NotificationAction[] = [
      { action: 'view', title: 'View' },
    ];

    // Add custom actions based on notification type
    if (notification.type === 'questionnaire.submitted') {
      actions.unshift({ action: 'view', title: 'View Response' });
    }

    return actions;
  }

  private handleServiceWorkerMessage = (event: MessageEvent): void => {
    if (event.data?.type === 'NOTIFICATION_CLICKED') {
      // Dispatch custom event for the app to handle navigation
      window.dispatchEvent(new CustomEvent('notificationClick', {
        detail: {
          notificationId: event.data.notificationId,
          actionUrl: event.data.actionUrl,
        },
      }));
    }
  };

  destroy(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage);
    }
    this.isInitialized = false;
    this.swRegistration = null;
  }
}

export const osNotificationService = new OSNotificationService();
```

---

### Task 6.5: Integrate with NotificationProvider

**File**: Update `BaseClient/src/App.tsx` or wherever NotificationProvider is

```typescript
import { useEffect } from 'react';
import { NotificationProvider } from '@dloizides/notification-client/react';
import { osNotificationService } from '@dloizides/notification-client/workers';
import { registerNotificationServiceWorker } from './lib/notifications/serviceWorkerRegistration';

function App() {
  const { accessToken, isAuthenticated } = useAuth();

  // Initialize Service Worker on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      registerNotificationServiceWorker().then(() => {
        osNotificationService.initialize();
      });
    }

    return () => {
      osNotificationService.destroy();
    };
  }, []);

  // Handle notification clicks from Service Worker
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { actionUrl } = event.detail;
      if (actionUrl) {
        // Navigate to the action URL
        // This depends on your navigation setup
        window.location.href = actionUrl;
        // Or use your router: navigation.navigate(actionUrl);
      }
    };

    window.addEventListener('notificationClick', handleNotificationClick as EventListener);

    return () => {
      window.removeEventListener('notificationClick', handleNotificationClick as EventListener);
    };
  }, []);

  return (
    <NotificationProvider
      hubUrl={process.env.EXPO_PUBLIC_NOTIFICATION_HUB_URL!}
      accessToken={accessToken}
      onNotification={async (notification) => {
        // Show OS notification if preference is os_notification or both
        if (
          notification.displayPreference === 'os_notification' ||
          notification.displayPreference === 'both'
        ) {
          await osNotificationService.showNotification(notification);
        }
      }}
    >
      <AppContent />
    </NotificationProvider>
  );
}
```

---

### Task 6.6: Create Permission Request UI

**File**: `BaseClient/src/components/NotificationPermissionBanner.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { osNotificationService } from '@dloizides/notification-client/workers';

export function NotificationPermissionBanner() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (osNotificationService.isSupported()) {
      setPermission(osNotificationService.getPermissionStatus());
    }
  }, []);

  const handleRequestPermission = async () => {
    const result = await osNotificationService.requestPermission();
    setPermission(result);
  };

  // Don't show if already granted, denied, or dismissed
  if (permission !== 'default' || dismissed) {
    return null;
  }

  return (
    <View style={styles.banner} testID="notification-permission-banner">
      <View style={styles.content}>
        <Text style={styles.title}>Enable Desktop Notifications</Text>
        <Text style={styles.description}>
          Get notified about new responses and updates even when this tab is in the background.
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => setDismissed(true)}
          testID="dismiss-permission-banner"
        >
          <Text style={styles.dismissText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleRequestPermission}
          testID="enable-notifications-button"
        >
          <Text style={styles.enableText}>Enable</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F0F7FF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D0E4FF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissButton: {
    padding: 8,
  },
  dismissText: {
    color: '#666',
  },
  enableButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enableText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
```

Add to your layout:
```typescript
function AppContent() {
  return (
    <>
      <NotificationPermissionBanner />
      <Navigation />
      <NotificationToastContainer />
    </>
  );
}
```

---

### Task 6.7: Write Unit Tests

**File**: `BaseClient/src/lib/notifications/__tests__/osNotificationService.test.ts`

```typescript
import { OSNotificationService } from '../osNotificationService';

describe('OSNotificationService', () => {
  let service: OSNotificationService;

  beforeEach(() => {
    service = new OSNotificationService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('isSupported', () => {
    it('returns true when serviceWorker and Notification are available', () => {
      // Mock navigator.serviceWorker and window.Notification
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { ready: Promise.resolve({}) },
        writable: true,
      });
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'default' },
        writable: true,
      });

      expect(service.isSupported()).toBe(true);
    });
  });

  describe('getPermissionStatus', () => {
    it('returns current permission status', () => {
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'granted' },
        writable: true,
      });

      expect(service.getPermissionStatus()).toBe('granted');
    });
  });

  describe('showNotification', () => {
    it('returns false if not initialized', async () => {
      const result = await service.showNotification({
        id: '1',
        type: 'test',
        title: 'Test',
        priority: 'normal',
        displayPreference: 'os_notification',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      expect(result).toBe(false);
    });
  });
});
```

---

### Task 6.8: Test Cross-Browser Compatibility

Manual testing checklist:

- [ ] **Chrome**: Notifications appear in system tray
- [ ] **Firefox**: Notifications appear correctly
- [ ] **Safari**: Notifications work (may have different UI)
- [ ] **Edge**: Notifications appear in Windows notification center
- [ ] **Mobile Chrome (Android)**: Notifications appear when tab is focused
- [ ] **Mobile Safari (iOS)**: Limited support - verify behavior

---

## Quality Gates

Before marking Phase 6 complete:

- [ ] `npm run lint:fix` - No errors
- [ ] `npm run test:coverage` - All tests pass
- [ ] `npx expo export --platform web` - Build succeeds
- [ ] Service Worker registers successfully
- [ ] Permission request flow works
- [ ] OS notifications appear when permitted
- [ ] Clicking notification focuses tab and navigates
- [ ] Cross-browser testing completed

---

## Outputs

Upon completion:
- Service Worker registered and active
- OS notifications display when configured
- Permission request UI/banner
- Notification click handling (focus + navigate)
- Cross-browser compatibility verified

---

## Limitations

Document these limitations for users:

1. **Tab Must Be Open**: Unlike Web Push, notifications only work when a browser tab with the app is open (can be in background)
2. **Permission Required**: User must grant notification permission
3. **Browser Support**: Safari on iOS has limited notification support
4. **Focus Behavior**: Some browsers may not allow focusing existing tabs

---

## Next Phase

After completing Phase 6, proceed to:
- **[Phase 7: E2E & Monitoring](./phase-7-e2e-monitoring.md)** - Final testing and monitoring

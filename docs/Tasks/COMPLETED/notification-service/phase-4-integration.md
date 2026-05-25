# Phase 4: Integration

> **Agent**: `frontend-dev` + `backend-dev`
> **Status**: COMPLETED
> **Priority**: High
> **Depends On**: Phase 1, 2, 3
> **Estimated Effort**: 2-3 days
> **Completed**: 2026-01-31

---

## Objective

Integrate the `@dloizides/notification-client` npm package into the shell application and verify it works across micro frontends.

---

## Prerequisites

- Phase 1 completed (Notification Service running)
- Phase 2 completed (Services publishing events)
- Phase 3 completed (npm package built)
- Understanding of micro frontend architecture

---

## Tasks

### Task 4.1: Install npm Package

**Frontend Agent**

```bash
cd BaseClient
npm install @dloizides/notification-client
```

Or if using npm link during development:
```bash
cd NPMPackages/notifications
npm link

cd ../../BaseClient
npm link @dloizides/notification-client
```

---

### Task 4.2: Add NotificationProvider to Shell App

**Frontend Agent**

**File**: `BaseClient/src/App.tsx` or root layout

```typescript
import { NotificationProvider } from '@dloizides/notification-client/react';
import { useAuth } from './hooks/useAuth'; // Your auth hook

function App() {
  const { accessToken, isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      {isAuthenticated && accessToken && (
        <NotificationProvider
          hubUrl={process.env.EXPO_PUBLIC_NOTIFICATION_HUB_URL || 'http://localhost:5010/notificationhub'}
          accessToken={accessToken}
          onNotification={(notification) => {
            console.log('New notification:', notification);
            // Optional: Analytics tracking
          }}
          onConnectionChange={(status) => {
            console.log('Connection status:', status);
          }}
        >
          <AppContent />
        </NotificationProvider>
      )}
      {!isAuthenticated && <LoginScreen />}
    </AuthProvider>
  );
}
```

**Important**: The `NotificationProvider` must be inside the auth provider but wrapping all other content that needs notifications.

---

### Task 4.3: Add Environment Variable

**Frontend Agent**

**File**: `.env` / `.env.development`
```env
EXPO_PUBLIC_NOTIFICATION_HUB_URL=http://localhost:5010/notificationhub
```

**File**: `.env.production`
```env
EXPO_PUBLIC_NOTIFICATION_HUB_URL=https://notifications.dloizides.com/notificationhub
```

---

### Task 4.4: Add NotificationBell to Header

**Frontend Agent**

**File**: `BaseClient/src/components/Header.tsx` (or wherever your header is)

```typescript
import { NotificationBell } from '@dloizides/notification-client/components';
import { useNavigation } from '@react-navigation/native';

export function Header() {
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    navigation.navigate('Notifications'); // Navigate to notifications screen
  };

  return (
    <View style={styles.header}>
      <Logo />
      <View style={styles.rightSection}>
        <NotificationBell
          onPress={handleNotificationPress}
          testID="header-notification-bell"
          size={24}
          color={theme.colors.text}
          badgeColor={theme.colors.error}
        />
        <UserMenu />
      </View>
    </View>
  );
}
```

---

### Task 4.5: Create Notifications Screen

**Frontend Agent**

**File**: `BaseClient/src/screens/NotificationsScreen.tsx`

```typescript
import React from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useNotifications } from '@dloizides/notification-client/react';
import { NotificationItem } from '@dloizides/notification-client/components';

export function NotificationsScreen() {
  const { notifications, markAsRead, markAllAsRead, connectionStatus } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Optionally fetch notifications from REST API for history
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      // Navigate to the action URL
      navigation.navigate(notification.actionUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {connectionStatus !== 'connected' && (
        <View style={styles.connectionBanner}>
          <Text>Connection: {connectionStatus}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            testID={`notification-${item.id}`}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  markAllRead: { color: '#007AFF' },
  connectionBanner: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
```

---

### Task 4.6: Add Toast Display

**Frontend Agent**

**File**: `BaseClient/src/components/NotificationToastContainer.tsx`

```typescript
import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useNotifications } from '@dloizides/notification-client/react';
import { NotificationToast } from '@dloizides/notification-client/components';
import { osNotificationService } from '@dloizides/notification-client/workers';

const TOAST_DURATION_MS = 5000;

export function NotificationToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  // Auto-dismiss toasts after duration
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dismissToast(toast.id);
      }, TOAST_DURATION_MS);

      return () => clearTimeout(timer);
    });
  }, [toasts, dismissToast]);

  // Show OS notification if preference is os_notification or both
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.displayPreference === 'os_notification' || toast.displayPreference === 'both') {
        osNotificationService.showNotification(toast);
      }
    });
  }, [toasts]);

  // Only show in-app toasts for in_app or both preference
  const inAppToasts = toasts.filter(
    (t) => t.displayPreference === 'in_app' || t.displayPreference === 'both'
  );

  if (inAppToasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {inAppToasts.map((toast, index) => (
        <NotificationToast
          key={toast.id}
          notification={toast}
          onDismiss={() => dismissToast(toast.id)}
          style={{ marginTop: index * 80 }}
          testID={`toast-${toast.id}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
});
```

Add to App:
```typescript
function AppContent() {
  return (
    <>
      <Navigation />
      <NotificationToastContainer />
    </>
  );
}
```

---

### Task 4.7: Configure Module Federation (if using)

**Frontend Agent**

If your micro frontends use Module Federation:

**File**: `webpack.config.js`

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      shared: {
        // CRITICAL: Ensure only ONE SignalR connection
        '@dloizides/notification-client': {
          singleton: true,
          requiredVersion: '^1.0.0',
        },
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
      },
    }),
  ],
};
```

---

### Task 4.8: Verify Micro Frontend Hook Usage

**Frontend Agent**

In any micro frontend, verify hooks work:

**File**: `OrdersMFE/src/components/OrdersHeader.tsx`

```typescript
import { useUnreadCount, useNotifications } from '@dloizides/notification-client/react';

export function OrdersHeader() {
  const unreadCount = useUnreadCount();
  const { notifications, filterByCategory } = useNotifications();

  // Filter notifications relevant to this MFE
  const orderNotifications = filterByCategory('orders');

  return (
    <View>
      <Text>Orders ({orderNotifications.length} notifications)</Text>
    </View>
  );
}
```

---

### Task 4.9: Backend Integration Verification

**Backend Agent**

Ensure the Notification Service is properly configured:

1. **Verify CORS settings** in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:8081",  // Expo dev
            "http://localhost:3000",  // Web dev
            "https://app.dloizides.com" // Production
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials(); // Required for SignalR
    });
});
```

2. **Verify JWT authentication** accepts tokens from your identity provider

3. **Test SignalR connection** with a simple client test

---

### Task 4.10: Write Integration Tests

**Frontend Agent**

**File**: `BaseClient/src/__tests__/integration/notifications.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { NotificationProvider } from '@dloizides/notification-client/react';
import { NotificationBell } from '@dloizides/notification-client/components';

// Mock the SignalR connection
jest.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: jest.fn(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    configureLogging: jest.fn().mockReturnThis(),
    build: jest.fn(() => ({
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      invoke: jest.fn(),
      state: 1, // Connected
      onreconnecting: jest.fn(),
      onreconnected: jest.fn(),
      onclose: jest.fn(),
    })),
  })),
  HubConnectionState: { Connected: 1 },
  HttpTransportType: { WebSockets: 1 },
  LogLevel: { Warning: 3 },
}));

describe('Notification Integration', () => {
  it('renders NotificationBell with zero count initially', async () => {
    render(
      <NotificationProvider
        hubUrl="http://localhost:5010/notificationhub"
        accessToken="test-token"
      >
        <NotificationBell testID="test-bell" />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-bell')).toBeTruthy();
    });

    // Badge should not be visible with 0 unread
    expect(screen.queryByTestId('test-bell-badge')).toBeNull();
  });
});
```

---

## Quality Gates

Before marking Phase 4 complete:

### Frontend
- [ ] `npm run lint:fix` - No errors
- [ ] `npm run test:coverage` - All tests pass
- [ ] `npx expo export --platform web` - Build succeeds
- [ ] NotificationProvider wraps app correctly
- [ ] NotificationBell displays in header
- [ ] Toast notifications appear
- [ ] Notifications screen works

### Backend
- [ ] CORS configured correctly
- [ ] SignalR hub accepts connections
- [ ] JWT validation works
- [ ] Events flow end-to-end

### Integration
- [ ] Submit questionnaire → notification appears
- [ ] Real-time updates work
- [ ] Multiple tabs share same connection (Module Federation singleton)

---

## Outputs

Upon completion:
- Shell app displays notifications
- NotificationBell in header with unread count
- Toast notifications on new events
- Notifications screen with list
- OS notifications (when permitted)
- End-to-end flow functional

---

## Next Phase

After completing Phase 4, proceed to:
- **[Phase 5: User Preferences](./phase-5-user-preferences.md)** - Settings UI
- **[Phase 6: Service Worker](./phase-6-service-worker.md)** - OS notifications

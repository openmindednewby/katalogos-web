# Phase 3: Frontend - NPM Package

> **Agent**: `frontend-dev`
> **Status**: TODO
> **Priority**: High
> **Depends On**: None (can run parallel with Phases 0-2)
> **Estimated Effort**: 4-5 days

---

## Objective

Create the `@dloizides/notification-client` npm package for micro frontend integration. This package provides:
- SignalR client wrapper with automatic reconnection
- React hooks and context provider
- Pre-built UI components
- Service Worker utilities for OS notifications

---

## Prerequisites

- Understanding of [architecture.md](./architecture.md)
- Familiarity with [frontend-react.md](../../code-standards/frontend-react.md)
- Knowledge of SignalR client library
- Understanding of micro frontend architecture

---

## Tasks

### Task 3.1: Create Package Structure

**Directory**: `NPMPackages/notifications/`

```bash
mkdir -p NPMPackages/notifications/src/{core,react,components,workers}
cd NPMPackages/notifications
npm init -y
```

**Final Structure**:
```
NPMPackages/
└── notifications/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.build.json
    ├── rollup.config.js
    ├── jest.config.js
    ├── README.md
    │
    ├── src/
    │   ├── index.ts
    │   │
    │   ├── core/
    │   │   ├── index.ts
    │   │   ├── NotificationClient.ts
    │   │   ├── NotificationStore.ts
    │   │   ├── types.ts
    │   │   └── constants.ts
    │   │
    │   ├── react/
    │   │   ├── index.ts
    │   │   ├── NotificationProvider.tsx
    │   │   ├── useNotifications.ts
    │   │   ├── useUnreadCount.ts
    │   │   ├── useNotificationActions.ts
    │   │   └── useNotificationPreferences.ts
    │   │
    │   ├── components/
    │   │   ├── index.ts
    │   │   ├── NotificationBell.tsx
    │   │   ├── NotificationList.tsx
    │   │   ├── NotificationItem.tsx
    │   │   └── NotificationToast.tsx
    │   │
    │   └── workers/
    │       ├── index.ts
    │       ├── osNotificationService.ts
    │       └── sw-notifications.ts
    │
    └── __tests__/
        ├── core/
        │   ├── NotificationClient.test.ts
        │   └── NotificationStore.test.ts
        ├── react/
        │   ├── NotificationProvider.test.tsx
        │   └── useNotifications.test.ts
        └── components/
            └── NotificationBell.test.tsx
```

---

### Task 3.2: Configure Package

**File**: `package.json`
```json
{
  "name": "@dloizides/notification-client",
  "version": "1.0.0",
  "description": "Real-time notification client for micro frontend architecture",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react.esm.js",
      "require": "./dist/react.cjs.js",
      "types": "./dist/react.d.ts"
    },
    "./components": {
      "import": "./dist/components.esm.js",
      "require": "./dist/components.cjs.js",
      "types": "./dist/components.d.ts"
    },
    "./workers": {
      "import": "./dist/workers.esm.js",
      "require": "./dist/workers.cjs.js",
      "types": "./dist/workers.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run lint && npm run test && npm run build"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-native": ">=0.70.0"
  },
  "peerDependenciesMeta": {
    "react-native": {
      "optional": true
    }
  },
  "dependencies": {
    "@microsoft/signalr": "^8.0.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "@testing-library/react": "^14.0.0",
    "@types/jest": "^29.0.0",
    "@types/react": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "react": "^18.2.0",
    "rollup": "^4.0.0",
    "rollup-plugin-dts": "^6.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.3.0"
  },
  "keywords": [
    "notifications",
    "signalr",
    "websocket",
    "react",
    "micro-frontend",
    "real-time"
  ],
  "author": "DLoizides",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dloizides/notifications.git"
  }
}
```

**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

**File**: `rollup.config.js`
```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = ['react', 'react-native', '@microsoft/signalr', 'zustand'];

const plugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: './tsconfig.build.json' }),
];

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true },
      { file: 'dist/index.esm.js', format: 'esm', sourcemap: true },
    ],
    plugins,
    external,
  },
  // React bundle
  {
    input: 'src/react/index.ts',
    output: [
      { file: 'dist/react.cjs.js', format: 'cjs', sourcemap: true },
      { file: 'dist/react.esm.js', format: 'esm', sourcemap: true },
    ],
    plugins,
    external,
  },
  // Components bundle
  {
    input: 'src/components/index.ts',
    output: [
      { file: 'dist/components.cjs.js', format: 'cjs', sourcemap: true },
      { file: 'dist/components.esm.js', format: 'esm', sourcemap: true },
    ],
    plugins,
    external,
  },
  // Workers bundle
  {
    input: 'src/workers/index.ts',
    output: [
      { file: 'dist/workers.cjs.js', format: 'cjs', sourcemap: true },
      { file: 'dist/workers.esm.js', format: 'esm', sourcemap: true },
    ],
    plugins,
    external,
  },
  // Type declarations
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
  },
  {
    input: 'src/react/index.ts',
    output: { file: 'dist/react.d.ts', format: 'esm' },
    plugins: [dts()],
  },
  {
    input: 'src/components/index.ts',
    output: { file: 'dist/components.d.ts', format: 'esm' },
    plugins: [dts()],
  },
  {
    input: 'src/workers/index.ts',
    output: { file: 'dist/workers.d.ts', format: 'esm' },
    plugins: [dts()],
  },
];
```

---

### Task 3.3: Implement Core Module

**File**: `src/core/types.ts`
```typescript
export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
  icon?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  displayPreference: 'in_app' | 'os_notification' | 'both';
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  notificationsEnabled: boolean;
  questionnaireSubmittedDisplay: DisplayPreference;
  templateUpdatedDisplay: DisplayPreference;
  userInvitedDisplay: DisplayPreference;
  menuUpdatedDisplay: DisplayPreference;
  paymentDueDisplay: DisplayPreference;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
}

export type DisplayPreference = 'none' | 'in_app' | 'os_notification' | 'both';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface NotificationClientConfig {
  hubUrl: string;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  toasts: Notification[];
  preferences: NotificationPreferences | null;
}

export interface NotificationActions {
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addToast: (notification: Notification) => void;
  removeToast: (id: string) => void;
  setPreferences: (preferences: NotificationPreferences) => void;
  clearNotifications: () => void;
}
```

**File**: `src/core/constants.ts`
```typescript
export const SIGNALR_EVENTS = {
  RECEIVE_NOTIFICATION: 'ReceiveNotification',
  NOTIFICATION_READ: 'NotificationRead',
  ALL_NOTIFICATIONS_READ: 'AllNotificationsRead',
  PREFERENCES_UPDATED: 'PreferencesUpdated',
} as const;

export const SIGNALR_METHODS = {
  MARK_AS_READ: 'MarkAsRead',
  MARK_ALL_AS_READ: 'MarkAllAsRead',
  GET_UNREAD_COUNT: 'GetUnreadCount',
} as const;

export const DEFAULT_CONFIG = {
  maxReconnectAttempts: 5,
  reconnectDelayMs: 2000,
  maxToasts: 3,
  toastDurationMs: 5000,
} as const;
```

**File**: `src/core/NotificationClient.ts`
```typescript
import * as signalR from '@microsoft/signalr';
import type { Notification, NotificationClientConfig, ConnectionStatus } from './types';
import { SIGNALR_EVENTS, SIGNALR_METHODS, DEFAULT_CONFIG } from './constants';

type EventCallback<T = unknown> = (data: T) => void;

export class NotificationClient {
  private connection: signalR.HubConnection | null = null;
  private config: Required<NotificationClientConfig>;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;

  constructor(config: NotificationClientConfig) {
    this.config = {
      ...config,
      maxReconnectAttempts: config.maxReconnectAttempts ?? DEFAULT_CONFIG.maxReconnectAttempts,
      reconnectDelayMs: config.reconnectDelayMs ?? DEFAULT_CONFIG.reconnectDelayMs,
    };
  }

  async connect(accessToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.config.hubUrl, {
        accessTokenFactory: () => accessToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (context) => {
          if (context.previousRetryCount >= this.config.maxReconnectAttempts) {
            return null;
          }
          return Math.min(
            this.config.reconnectDelayMs * Math.pow(2, context.previousRetryCount),
            30000
          );
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.setupEventHandlers();

    this.emit('connectionChange', 'connecting' as ConnectionStatus);

    try {
      await this.connection.start();
      this.reconnectAttempts = 0;
      this.emit('connectionChange', 'connected' as ConnectionStatus);
    } catch (error) {
      this.emit('connectionChange', 'disconnected' as ConnectionStatus);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on(SIGNALR_EVENTS.RECEIVE_NOTIFICATION, (notification: Notification) => {
      this.emit('notification', notification);
    });

    this.connection.on(SIGNALR_EVENTS.NOTIFICATION_READ, (notificationId: string) => {
      this.emit('read', notificationId);
    });

    this.connection.on(SIGNALR_EVENTS.ALL_NOTIFICATIONS_READ, () => {
      this.emit('allRead', undefined);
    });

    this.connection.on(SIGNALR_EVENTS.PREFERENCES_UPDATED, (preferences: unknown) => {
      this.emit('preferencesUpdated', preferences);
    });

    this.connection.onreconnecting(() => {
      this.emit('connectionChange', 'reconnecting' as ConnectionStatus);
    });

    this.connection.onreconnected(() => {
      this.reconnectAttempts = 0;
      this.emit('connectionChange', 'connected' as ConnectionStatus);
    });

    this.connection.onclose(() => {
      this.emit('connectionChange', 'disconnected' as ConnectionStatus);
    });
  }

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback);
    };
  }

  private emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.connection?.invoke(SIGNALR_METHODS.MARK_AS_READ, notificationId);
  }

  async markAllAsRead(): Promise<void> {
    await this.connection?.invoke(SIGNALR_METHODS.MARK_ALL_AS_READ);
  }

  getConnectionState(): ConnectionStatus {
    if (!this.connection) return 'disconnected';

    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'connected';
      case signalR.HubConnectionState.Connecting:
        return 'connecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'reconnecting';
      default:
        return 'disconnected';
    }
  }
}
```

**File**: `src/core/NotificationStore.ts`
```typescript
import { create } from 'zustand';
import type { Notification, NotificationState, NotificationActions, NotificationPreferences, ConnectionStatus } from './types';
import { DEFAULT_CONFIG } from './constants';

type NotificationStore = NotificationState & NotificationActions;

export const createNotificationStore = () =>
  create<NotificationStore>((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    connectionStatus: 'disconnected',
    toasts: [],
    preferences: null,

    // Actions
    addNotification: (notification: Notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
      }));
    },

    markAsRead: (id: string) => {
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.isRead;

        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    },

    removeNotification: (id: string) => {
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.isRead;

        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    },

    setConnectionStatus: (status: ConnectionStatus) => {
      set({ connectionStatus: status });
    },

    addToast: (notification: Notification) => {
      set((state) => ({
        toasts: [...state.toasts, notification].slice(-DEFAULT_CONFIG.maxToasts),
      }));
    },

    removeToast: (id: string) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    setPreferences: (preferences: NotificationPreferences) => {
      set({ preferences });
    },

    clearNotifications: () => {
      set({ notifications: [], unreadCount: 0 });
    },
  }));

export type { NotificationStore };
```

**File**: `src/core/index.ts`
```typescript
export { NotificationClient } from './NotificationClient';
export { createNotificationStore } from './NotificationStore';
export type { NotificationStore } from './NotificationStore';
export * from './types';
export * from './constants';
```

---

### Task 3.4: Implement React Module

**File**: `src/react/NotificationProvider.tsx`
```typescript
import React, { createContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { NotificationClient } from '../core/NotificationClient';
import { createNotificationStore, type NotificationStore } from '../core/NotificationStore';
import type { Notification, ConnectionStatus } from '../core/types';

interface NotificationContextValue {
  store: NotificationStore;
  client: NotificationClient | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissToast: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  hubUrl: string;
  accessToken: string;
  children: React.ReactNode;
  onNotification?: (notification: Notification) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  maxToasts?: number;
}

export function NotificationProvider({
  hubUrl,
  accessToken,
  children,
  onNotification,
  onConnectionChange,
}: NotificationProviderProps) {
  const clientRef = useRef<NotificationClient | null>(null);
  const storeRef = useRef<NotificationStore | null>(null);

  // Create store once
  if (!storeRef.current) {
    storeRef.current = createNotificationStore();
  }

  const store = storeRef.current;

  useEffect(() => {
    const client = new NotificationClient({ hubUrl });
    clientRef.current = client;

    // Subscribe to events
    const unsubNotification = client.on<Notification>('notification', (notification) => {
      store.getState().addNotification(notification);

      // Show toast based on display preference
      const shouldShowToast = notification.displayPreference !== 'none';
      if (shouldShowToast) {
        store.getState().addToast(notification);
      }

      onNotification?.(notification);
    });

    const unsubRead = client.on<string>('read', (id) => {
      store.getState().markAsRead(id);
    });

    const unsubAllRead = client.on('allRead', () => {
      store.getState().markAllAsRead();
    });

    const unsubConnection = client.on<ConnectionStatus>('connectionChange', (status) => {
      store.getState().setConnectionStatus(status);
      onConnectionChange?.(status);
    });

    // Connect
    client.connect(accessToken).catch(console.error);

    return () => {
      unsubNotification();
      unsubRead();
      unsubAllRead();
      unsubConnection();
      client.disconnect();
    };
  }, [hubUrl, accessToken, onNotification, onConnectionChange, store]);

  const markAsRead = useCallback(async (id: string) => {
    store.getState().markAsRead(id);
    await clientRef.current?.markAsRead(id);
  }, [store]);

  const markAllAsRead = useCallback(async () => {
    store.getState().markAllAsRead();
    await clientRef.current?.markAllAsRead();
  }, [store]);

  const dismissToast = useCallback((id: string) => {
    store.getState().removeToast(id);
  }, [store]);

  const value = useMemo<NotificationContextValue>(() => ({
    store,
    client: clientRef.current,
    markAsRead,
    markAllAsRead,
    dismissToast,
  }), [store, markAsRead, markAllAsRead, dismissToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
```

**File**: `src/react/useNotifications.ts`
```typescript
import { useContext, useSyncExternalStore, useCallback } from 'react';
import { NotificationContext } from './NotificationProvider';
import type { Notification } from '../core/types';

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  const { store, markAsRead, markAllAsRead, dismissToast } = context;

  const notifications = useSyncExternalStore(
    store.subscribe,
    () => store.getState().notifications,
    () => store.getState().notifications
  );

  const connectionStatus = useSyncExternalStore(
    store.subscribe,
    () => store.getState().connectionStatus,
    () => store.getState().connectionStatus
  );

  const toasts = useSyncExternalStore(
    store.subscribe,
    () => store.getState().toasts,
    () => store.getState().toasts
  );

  const filterByCategory = useCallback(
    (category: string): Notification[] =>
      notifications.filter((n) => n.category === category),
    [notifications]
  );

  return {
    notifications,
    connectionStatus,
    toasts,
    markAsRead,
    markAllAsRead,
    dismissToast,
    filterByCategory,
  };
}
```

**File**: `src/react/useUnreadCount.ts`
```typescript
import { useContext, useSyncExternalStore } from 'react';
import { NotificationContext } from './NotificationProvider';

export function useUnreadCount(): number {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useUnreadCount must be used within NotificationProvider');
  }

  return useSyncExternalStore(
    context.store.subscribe,
    () => context.store.getState().unreadCount,
    () => context.store.getState().unreadCount
  );
}
```

**File**: `src/react/useNotificationActions.ts`
```typescript
import { useContext } from 'react';
import { NotificationContext } from './NotificationProvider';

export function useNotificationActions() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotificationActions must be used within NotificationProvider');
  }

  return {
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    dismissToast: context.dismissToast,
  };
}
```

**File**: `src/react/useNotificationPreferences.ts`
```typescript
import { useContext, useSyncExternalStore } from 'react';
import { NotificationContext } from './NotificationProvider';
import type { NotificationPreferences } from '../core/types';

export function useNotificationPreferences(): NotificationPreferences | null {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotificationPreferences must be used within NotificationProvider');
  }

  return useSyncExternalStore(
    context.store.subscribe,
    () => context.store.getState().preferences,
    () => context.store.getState().preferences
  );
}
```

**File**: `src/react/index.ts`
```typescript
export { NotificationProvider, NotificationContext } from './NotificationProvider';
export { useNotifications } from './useNotifications';
export { useUnreadCount } from './useUnreadCount';
export { useNotificationActions } from './useNotificationActions';
export { useNotificationPreferences } from './useNotificationPreferences';
```

---

### Task 3.5: Implement Components

**File**: `src/components/NotificationBell.tsx`
```typescript
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useUnreadCount } from '../react/useUnreadCount';

interface NotificationBellProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  badgeColor?: string;
  testID?: string;
}

export function NotificationBell({
  onPress,
  size = 24,
  color = '#333',
  badgeColor = '#ff4444',
  testID = 'notification-bell',
}: NotificationBellProps) {
  const unreadCount = useUnreadCount();

  return (
    <TouchableOpacity
      onPress={onPress}
      testID={testID}
      accessibilityLabel="Notifications"
      accessibilityHint={`You have ${unreadCount} unread notifications`}
      style={styles.container}
    >
      {/* Bell Icon - replace with your icon library */}
      <View style={[styles.bellIcon, { width: size, height: size }]}>
        <Text style={{ color, fontSize: size * 0.8 }}>🔔</Text>
      </View>

      {unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor, minWidth: size * 0.6, height: size * 0.6 },
          ]}
          testID={`${testID}-badge`}
        >
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  bellIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
```

**Implement additional components**:
- [ ] `NotificationList.tsx` - List of notifications
- [ ] `NotificationItem.tsx` - Single notification item
- [ ] `NotificationToast.tsx` - Toast popup

**File**: `src/components/index.ts`
```typescript
export { NotificationBell } from './NotificationBell';
export { NotificationList } from './NotificationList';
export { NotificationItem } from './NotificationItem';
export { NotificationToast } from './NotificationToast';
```

---

### Task 3.6: Implement Service Worker Utilities

**File**: `src/workers/osNotificationService.ts`
```typescript
import type { Notification } from '../core/types';

export class OSNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Notifications API not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Failed to initialize Service Worker:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    return Notification.requestPermission();
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  async showNotification(notification: Notification): Promise<boolean> {
    if (Notification.permission !== 'granted') {
      return false;
    }

    if (!this.swRegistration?.active) {
      console.warn('Service Worker not active');
      return false;
    }

    this.swRegistration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title: notification.title,
      options: {
        body: notification.body || '',
        icon: notification.icon || '/icons/notification-icon-192.png',
        badge: '/icons/notification-badge-72.png',
        tag: notification.id,
        data: {
          id: notification.id,
          actionUrl: notification.actionUrl,
          type: notification.type,
        },
        requireInteraction: notification.priority === 'urgent',
      },
    });

    return true;
  }
}

export const osNotificationService = new OSNotificationService();
```

**File**: `src/workers/sw-notifications.ts`
```typescript
// Service Worker code - to be copied to public/sw.js

declare const self: ServiceWorkerGlobalScope;

interface NotificationData {
  id: string;
  actionUrl?: string;
  type: string;
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;

    event.waitUntil(
      self.registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || '/icons/notification-icon-192.png',
        badge: options.badge || '/icons/notification-badge-72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data as NotificationData | undefined;

  if (event.action === 'view' && data?.actionUrl) {
    event.waitUntil(self.clients.openWindow(data.actionUrl));
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else if (data?.actionUrl) {
    // Default click behavior - open the action URL
    event.waitUntil(self.clients.openWindow(data.actionUrl));
  }
});

export {};
```

**File**: `src/workers/index.ts`
```typescript
export { OSNotificationService, osNotificationService } from './osNotificationService';
```

---

### Task 3.7: Create Main Index

**File**: `src/index.ts`
```typescript
// Core exports
export * from './core';

// React exports
export * from './react';

// Component exports
export * from './components';

// Worker exports
export * from './workers';
```

---

### Task 3.8: Write Unit Tests

**Tests to Create**:
- [ ] `__tests__/core/NotificationClient.test.ts`
- [ ] `__tests__/core/NotificationStore.test.ts`
- [ ] `__tests__/react/NotificationProvider.test.tsx`
- [ ] `__tests__/react/useNotifications.test.ts`
- [ ] `__tests__/react/useUnreadCount.test.ts`
- [ ] `__tests__/components/NotificationBell.test.tsx`

**Example Test**:
```typescript
// __tests__/core/NotificationStore.test.ts
import { createNotificationStore } from '../../src/core/NotificationStore';

describe('NotificationStore', () => {
  it('should add notification and increment unread count', () => {
    const store = createNotificationStore();

    store.getState().addNotification({
      id: '1',
      type: 'test',
      title: 'Test',
      priority: 'normal',
      displayPreference: 'in_app',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    expect(store.getState().notifications).toHaveLength(1);
    expect(store.getState().unreadCount).toBe(1);
  });

  it('should mark notification as read and decrement unread count', () => {
    const store = createNotificationStore();

    store.getState().addNotification({
      id: '1',
      type: 'test',
      title: 'Test',
      priority: 'normal',
      displayPreference: 'in_app',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    store.getState().markAsRead('1');

    expect(store.getState().notifications[0].isRead).toBe(true);
    expect(store.getState().unreadCount).toBe(0);
  });
});
```

---

### Task 3.9: Build and Test

**Commands**:
```bash
cd NPMPackages/notifications

# Install dependencies
npm install

# Run linter
npm run lint:fix

# Run tests
npm run test:coverage

# Build package
npm run build

# Verify build output
ls dist/
```

**Verification**:
- [ ] No lint errors
- [ ] All tests pass
- [ ] `dist/` contains all expected files
- [ ] TypeScript declarations generated

---

## Quality Gates

Before marking Phase 3 complete:

- [ ] `npm run lint` - No errors
- [ ] `npm run test:coverage` - All tests pass, >80% coverage
- [ ] `npm run build` - Builds successfully
- [ ] Package exports work correctly (test with `npm link`)
- [ ] Code follows [frontend-react.md](../../code-standards/frontend-react.md) standards

---

## Outputs

Upon completion:
- `@dloizides/notification-client` npm package ready for publishing
- All exports (core, react, components, workers) functional
- Unit test coverage >80%
- TypeScript declarations included

---

## Next Phase

After completing Phase 3, proceed to:
- **[Phase 4: Integration](./phase-4-integration.md)** - Integrate with shell app and micro frontends

**Note**: Ensure Phase 1 and 2 (Backend) are complete before Phase 4.

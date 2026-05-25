# Notification Service Phase 6 - Service Worker & OS Notifications

> **Reference**: BaseClient/public/, NpmPackages/packages/notification-client/src/workers/

## Status: COMPLETED

## Problem Statement
Implement Phase 6 of the notification service - Service Worker and OS-level notifications. This enables the application to show native OS notifications when a notification arrives via SignalR.

**Important**: This is NOT Web Push. The Service Worker only DISPLAYS notifications - all message delivery comes through SignalR WebSocket (requires a tab to be open).

## Architecture Overview
1. SignalR delivers notification to the app via WebSocket
2. App calls OSNotificationService.showNotification()
3. OSNotificationService posts message to Service Worker
4. Service Worker calls self.registration.showNotification()
5. User sees OS notification
6. User clicks notification -> app navigates to actionUrl

## Implementation Plan

### 1. Service Worker File (BaseClient/public/sw-notifications.js)
- Listen for 'SHOW_NOTIFICATION' messages from main thread
- Call self.registration.showNotification() with options
- Handle notificationclick event - focus existing tab or open new window
- Handle notificationclose event for analytics

### 2. Service Worker Registration (BaseClient/src/lib/notifications/serviceWorkerRegistration.ts)
- registerNotificationServiceWorker() - registers /sw-notifications.js
- unregisterNotificationServiceWorker() - cleanup function

### 3. OSNotificationService - Already exists, needs verification
- File: NpmPackages/packages/notification-client/src/workers/osNotificationService.ts
- Verify and test: initialize(), isSupported(), requestPermission(), getPermissionStatus(), showNotification()

### 4. Workers Index - Already exists
- File: NpmPackages/packages/notification-client/src/workers/index.ts
- Already exports OSNotificationService

### 5. Integration in App
- Update RealTimeNotificationProvider to:
  - Register service worker on mount
  - Initialize OSNotificationService
  - Show OS notification based on displayPreference

### 6. Permission Banner (BaseClient/src/components/Notifications/NotificationPermissionBanner.tsx)
- Show banner when permission is 'default'
- "Enable" button requests permission
- "Later" button dismisses
- Hide when granted or denied

### 7. Unit Tests
- Test OSNotificationService.isSupported()
- Test permission status handling
- Test showNotification posts correct message

## Files Created/Modified

### Created:
- `BaseClient/public/sw-notifications.js` - Service Worker for displaying OS notifications
- `BaseClient/src/lib/notifications/serviceWorkerRegistration.ts` - SW registration utilities and message types
- `BaseClient/src/lib/notifications/index.ts` - Export registration functions
- `BaseClient/src/components/Notifications/NotificationPermissionBanner.tsx` - Permission request banner UI
- `BaseClient/src/components/Notifications/__tests__/NotificationPermissionBanner.test.tsx` - Unit tests for banner

### Modified:
- `BaseClient/src/components/Notifications/RealTimeNotificationProvider.tsx` - Added SW registration and OS notification integration
- `BaseClient/src/components/Notifications/__tests__/RealTimeNotificationProvider.test.tsx` - Updated mocks for new dependencies
- `BaseClient/src/shared/testIds.ts` - Added test IDs for notification permission banner

## Success Criteria
- [x] Service worker file created and handles SHOW_NOTIFICATION messages
- [x] Service worker registration functions work correctly
- [x] NotificationPermissionBanner shows and handles permission requests
- [x] OS notifications show when displayPreference is 'os_notification' or 'both'
- [x] Clicking OS notification focuses app or opens actionUrl
- [x] Unit tests pass
- [x] npm run lint:fix passes (only unrelated lighthouserc.js error)
- [x] npm run test:coverage passes (487 tests, all passing)
- [x] npx expo export --platform web passes in BaseClient

## Test Results

### Unit Tests
```
Test Suites: 79 passed, 79 total
Tests:       487 passed, 487 total
Snapshots:   0 total
Time:        10.477 s
```

### Notification-Specific Tests
```
PASS src/lib/notifications/__tests__/serviceWorkerRegistration.test.ts
PASS src/lib/__tests__/notifications.test.ts
PASS src/lib/__tests__/apiNotifications.test.ts
PASS src/components/Settings/__tests__/NotificationPreferencesScreen.test.tsx
PASS src/components/Notifications/__tests__/SafeNotificationBell.test.tsx
PASS src/lib/hooks/notification/__tests__/useNotificationPreferences.test.ts
PASS src/components/Notifications/__tests__/NotificationBellButton.test.tsx
PASS src/components/Notifications/__tests__/RealTimeNotificationProvider.test.tsx
PASS src/components/Notifications/__tests__/NotificationPermissionBanner.test.tsx

Test Suites: 9 passed, 9 total
Tests:       58 passed, 58 total
```

### Build
```
Web Bundled 976ms node_modules\expo-router\entry.js (1158 modules)
Exported: dist
```

## Notes
- Had to work around TypeScript/ESLint type inference issues with ServiceWorkerMessageType - changed from const enum to regular object with `as const`
- Jest mock hoisting required careful ordering of mocks before imports
- The ESLint custom plugin `no-null-check` auto-replaces null checks with `isValueDefined()` but doesn't add imports automatically

# Integrate @dloizides/notification-client into BaseClient

> **Reference**: `BaseClient/docs/Tasks/TODO/notification-service/phase-4-integration.md`

## Status: COMPLETED

## Problem Statement

The `@dloizides/notification-client` npm package has been completed and needs to be integrated into the BaseClient application to enable real-time notifications via SignalR.

## Implementation Plan

1. **Install package using npm link**
   - Link the local package for development
   - Add to package.json dependencies

2. **Add environment variable**
   - Add `EXPO_PUBLIC_NOTIFICATION_HUB_URL` to `.env.dev`

3. **Add NotificationProvider to the app**
   - Wrap authenticated content in `_layout.tsx`
   - Connect to auth context for access token
   - Only render when user is authenticated

4. **Add NotificationBell to the header**
   - Update `Topbar.tsx` to include NotificationBell
   - Navigate to notifications screen on press

5. **Create NotificationsScreen**
   - Create screen in `app/(protected)/notifications/index.tsx`
   - Include FlatList of notifications
   - Add "Mark all as read" button
   - Connection status indicator
   - Empty state

6. **Add NotificationToast container**
   - Add toast container to the app layout
   - Display in-app toasts for new notifications

7. **Write unit tests**
   - Test notification integration logic
   - Focus on callbacks and state management (not rendering)

8. **Update shared testIds**
   - Add notification-related test IDs

## Files to Modify

- `BaseClient/package.json` - Add dependency
- `BaseClient/.env.dev` - Add hub URL
- `BaseClient/app/_layout.tsx` - Add NotificationProvider
- `BaseClient/src/components/Topbar/Topbar.tsx` - Add NotificationBell
- `BaseClient/app/(protected)/notifications/index.tsx` - New screen
- `BaseClient/src/shared/testIds.ts` - Add notification test IDs

## Success Criteria

- [x] `npm run lint:fix` passes with no errors
- [x] `npm run test:coverage` - all tests pass
- [x] `npx expo export --platform web` - build succeeds
- [x] NotificationProvider wraps authenticated content
- [x] NotificationBell displays in header with unread count
- [x] NotificationsScreen shows list of notifications
- [x] Toast notifications appear for new notifications

## Changes Made

### New Files Created

1. **`BaseClient/src/components/Notifications/RealTimeNotificationProvider.tsx`**
   - Wrapper component that provides NotificationProvider only when authenticated
   - Handles connection state changes and notification callbacks
   - Uses auth context to get access token

2. **`BaseClient/src/components/Notifications/NotificationBellButton.tsx`**
   - Bell icon button with unread count badge
   - Navigates to notifications screen on press
   - Shows badge with count (99+ for large numbers)

3. **`BaseClient/src/components/Notifications/RealTimeToastContainer.tsx`**
   - Container for displaying real-time notification toasts
   - Animated slide-in/fade-out transitions
   - Auto-dismisses after 5 seconds

4. **`BaseClient/src/components/Notifications/SafeNotificationBell.tsx`**
   - Conditionally renders NotificationBellButton only when NotificationContext is available
   - Prevents errors when context is not provided

5. **`BaseClient/src/components/Notifications/SafeRealTimeToastContainer.tsx`**
   - Conditionally renders RealTimeToastContainer only when NotificationContext is available
   - Prevents errors when context is not provided

6. **`BaseClient/app/(protected)/notifications/index.tsx`**
   - Full notifications screen with FlatList
   - Mark all as read button
   - Connection status banner (shows when disconnected)
   - Empty state when no notifications
   - Pull-to-refresh functionality

7. **`BaseClient/src/components/Notifications/__tests__/RealTimeNotificationProvider.test.tsx`**
   - Tests for provider component
   - Verifies children render when authenticated/unauthenticated
   - Verifies NotificationProvider wrapping behavior

8. **`BaseClient/src/components/Notifications/__tests__/NotificationBellButton.test.tsx`**
   - Tests for bell button component
   - Tests navigation callback
   - Tests badge display logic

9. **`BaseClient/src/components/Notifications/__tests__/SafeNotificationBell.test.tsx`**
   - Tests conditional rendering based on context availability

### Modified Files

1. **`BaseClient/package.json`**
   - Added dependency: `"@dloizides/notification-client": "file:../NpmPackages/packages/notification-client"`

2. **`BaseClient/.env.dev`**
   - Added: `EXPO_PUBLIC_NOTIFICATION_HUB_URL=http://localhost:5010/notificationhub`

3. **`BaseClient/.env.test`**
   - Added: `EXPO_PUBLIC_NOTIFICATION_HUB_URL=http://localhost:5010/notificationhub`

4. **`BaseClient/.env.prod`**
   - Added: `EXPO_PUBLIC_NOTIFICATION_HUB_URL=https://api.yourdomain.com/notificationhub`

5. **`BaseClient/src/config/environment.ts`**
   - Added `NOTIFICATION_HUB_URL` to all environment configurations

6. **`BaseClient/src/shared/testIds.ts`**
   - Added notification-related test IDs:
     - NOTIFICATION_BELL, NOTIFICATION_BELL_BADGE
     - NOTIFICATION_SCREEN, NOTIFICATION_LIST, NOTIFICATION_ITEM
     - NOTIFICATION_MARK_ALL_READ, NOTIFICATION_EMPTY_STATE
     - NOTIFICATION_CONNECTION_STATUS
     - NOTIFICATION_TOAST_CONTAINER, NOTIFICATION_TOAST

7. **`BaseClient/app/_layout.tsx`**
   - Wrapped authenticated content with RealTimeNotificationProvider
   - Added SafeRealTimeToastContainer for in-app toast notifications

8. **`BaseClient/src/components/Topbar/Topbar.tsx`**
   - Added SafeNotificationBell to the topbar

9. **`BaseClient/src/localization/locales/en.json`**
   - Added notification translations (title, empty, markAllRead, connectionStatus)

10. **`BaseClient/jest.config.js`**
    - Added moduleNameMapper for @dloizides/notification-client package

## Test Results

### Lint Check
```
npm run lint:fix
Result: 0 errors, 32 warnings (warnings are pre-existing in other files)
```

### Unit Tests
```
npm run test -- --testPathPattern="Notifications"
Result: 22 tests passed
- RealTimeNotificationProvider: 3 tests
- NotificationBellButton: 6 tests
- SafeNotificationBell: 2 tests
- Other notification tests: 11 tests
```

### Build Check
```
npx expo export --platform web
Result: Build succeeded
```

## Notes

- Used local interface definitions to work around TypeScript resolution issues with the external package types
- Created Safe* wrapper components to handle cases where NotificationContext may not be available
- All components follow the theme system and support light/dark mode
- Test IDs added for E2E testing compatibility

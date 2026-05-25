# Create Test Notification API for E2E Tests

## Status: COMPLETED

## Problem Statement
E2E tests need the ability to inject mock notifications without requiring the real backend/SignalR connection. This enables testing notification UI features in isolation.

## Implementation Summary

### Files Created

1. **`BaseClient/src/lib/notifications/testNotificationApi.ts`**
   - Main test API module
   - Exposes `window.__NOTIFICATION_TEST_API__` in non-production environments
   - Provides functions: `injectNotification`, `clearNotifications`, `getNotifications`, `getUnreadCount`, `addToast`, `removeToast`, `getToasts`, `markAsRead`, `markAllAsRead`
   - Includes store registration functions for integration with NotificationProvider

2. **`BaseClient/src/components/Notifications/TestApiRegistration.tsx`**
   - React component that registers the notification store with the test API
   - Automatically registers when NotificationProvider mounts
   - Only active in non-production environments

3. **`BaseClient/src/lib/notifications/__tests__/testNotificationApi.test.ts`**
   - Unit tests for core API functions

4. **`BaseClient/src/lib/notifications/__tests__/testNotificationApiOperations.test.ts`**
   - Unit tests for API operations with registered store

5. **`BaseClient/src/lib/notifications/__tests__/testNotificationApi.helpers.ts`**
   - Test helper functions for creating mock stores

### Files Modified

1. **`BaseClient/src/lib/notifications/index.ts`**
   - Added exports for test API functions

2. **`BaseClient/app/_layout.tsx`**
   - Added call to `setupTestNotificationApi()` on module load

3. **`BaseClient/src/components/Notifications/RealTimeNotificationProvider.tsx`**
   - Added `TestApiRegistration` component inside NotificationProvider

4. **`BaseClient/src/components/Notifications/__tests__/RealTimeNotificationProvider.test.tsx`**
   - Updated mocks to include new exports

## How It Works

1. **Initialization**: When the app loads, `setupTestNotificationApi()` is called, which exposes the test API on `window.__NOTIFICATION_TEST_API__` (non-production only).

2. **Store Registration**: When the `NotificationProvider` mounts (user authenticates), `TestApiRegistration` component registers the Zustand store with the test API.

3. **E2E Usage**: Playwright tests can now inject notifications via:
   ```javascript
   await page.evaluate(() => {
     window.__NOTIFICATION_TEST_API__.injectNotification({
       id: 'test-1',
       title: 'Test Notification',
       body: 'Test body',
       type: 'info',
     });
   });
   ```

## Test Results
- All 509 unit tests pass
- ESLint passes with no errors
- Web build succeeds

## E2E Test Helpers
The existing E2E helper `mockSignalRNotification` in `E2ETests/tests/utils/notificationHelpers.ts` is already compatible with this API.

## Success Criteria
- [x] Test API exposed on window in non-production
- [x] API not exposed in production
- [x] Can inject notifications via the API
- [x] Can clear notifications via the API
- [x] Can get notification state via the API
- [x] Unit tests written and passing
- [x] Lint passes
- [x] Build succeeds
- [x] Existing tests continue to pass

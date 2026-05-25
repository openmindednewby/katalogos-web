# Task: Expand E2E Tests + Add Stress Tests for Notification Service (Phase 7)

## Status: COMPLETE

## Objective
Expand the existing notification E2E test suite with new test files covering real-time delivery, connection resilience, cross-tab sync, enhanced health checks, and comprehensive stress tests.

## Files Created

### New Test Files (5 files, ~30 new tests)
1. `E2ETests/tests/notifications/realtime.spec.ts` (209 lines, 6 tests)
   - Notification display via test API
   - Badge count updates for multiple notifications
   - Mark as read when clicked
   - Mark all as read
   - High priority notification styling
   - Toast auto-dismiss behavior

2. `E2ETests/tests/notifications/connection.spec.ts` (228 lines, 5 tests)
   - Connection establishment on page load
   - Reconnection after network loss (context.setOffline)
   - Disconnection on logout
   - Multiple rapid reconnections
   - Connection status display when offline

3. `E2ETests/tests/notifications/cross-tab.spec.ts` (179 lines, 3 tests)
   - Notification sync across two browser contexts
   - Mark as read reflected across tabs
   - Independent page state across tabs

4. `E2ETests/tests/notifications/health.spec.ts` (190 lines, 8 tests)
   - Readiness/startup/liveness probes
   - SignalR hub endpoint availability
   - CORS configuration verification
   - API endpoint availability (notifications + preferences)
   - Cross-probe consistency

5. `E2ETests/tests/notifications/stress-volume.spec.ts` (257 lines, 5 tests)
   - 100 rapid notifications without dropping any
   - 50 concurrent mark-as-read operations
   - Correct unread count under load
   - 200 notification list rendering performance
   - 1000 notification flood without UI freeze

6. `E2ETests/tests/notifications/stress-resilience.spec.ts` (224 lines, 3 tests)
   - Rapid bell open/close with notifications arriving
   - Rapid preference toggles during notification delivery
   - Connection drop during notification burst and recovery

### New Helper Files (2 files)
1. `E2ETests/helpers/notification.helpers.ts` (240 lines)
   - triggerNotification(), triggerBulkNotifications()
   - getNotifications(), clearNotifications()
   - checkHealth(), isNotificationServiceHealthy()
   - getSignalRHubUrl(), getNotificationServiceUrl()

2. `E2ETests/tests/utils/notificationStressHelpers.ts` (136 lines)
   - injectBulkNotifications() - in-page JS evaluation for speed
   - injectBulkToasts() - bulk toast injection
   - measureNotificationListRenderTime() - performance measurement

### Modified Files (4 files)
1. `E2ETests/pages/NotificationsPage.ts` - Added preferences locators and methods:
   - preferencesScreen, preferencesSaveButton, preferenceDropdown, settingsButton
   - navigateToPreferences(), isPreferencesAvailable(), savePreferences()
   - expectPreferencesScreen(), hasTestApi()

2. `E2ETests/helpers/index.ts` - Added notification helper exports

3. `E2ETests/playwright.config.ts` - Added notification-stress project:
   - Chromium-only, workers: 1, 120s timeout, 30s action/navigation timeouts
   - Separated stress tests from regular notification tests via regex

4. `E2ETests/package.json` - Added stress test scripts:
   - test:notification:stress, test:notification:stress:headed
   - test:notification:all (runs all notification tests including stress)

5. `E2ETests/.env.local` - Added NOTIFICATION_SERVICE_URL=http://localhost:5015

## Quality Verification
- TypeScript: All new files compile cleanly (zero errors)
- ESLint: Zero errors, 1 warning (page object 528 lines, pre-existing growth)
- All new test files under 300 lines
- No waitForTimeout() calls anywhere
- Proper cleanup in afterEach hooks
- Web-first assertions throughout
- Test independence (no ordering dependencies)
- Stress tests use generous timeouts (60-120s)

## Test Counts
- **Existing tests**: 4 files
- **New tests**: 6 files with ~30 tests
- **Total notification tests**: 10 files

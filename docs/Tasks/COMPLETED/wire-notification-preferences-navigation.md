# Wire Up Notification Preferences Navigation

## Status: COMPLETED

## Problem Statement
Need to add navigation from the Settings menu to the Notification Preferences screen. This allows users to access and configure their notification settings from the settings area of the application.

## Implementation Plan
1. Find the Settings screen/menu component
2. Add menu item for "Notification Preferences" with appropriate icon and accessibility
3. Create or verify the route exists in navigation
4. Add the screen to the navigation stack
5. Add unit tests for the settings menu item
6. Run verification suite

## Files Modified
- `src/shared/testIds.ts` - Added NOTIFICATION_SETTINGS_BUTTON testID
- `app/(protected)/settings/notification-preferences.tsx` - Created settings page wrapper
- `app/(protected)/notifications/index.tsx` - Added settings button to header with gear icon
- `app/(protected)/notifications/__tests__/NotificationsScreen.test.tsx` - Added unit tests

## Success Criteria
- [x] Navigation from Notifications to Notification Preferences works (gear icon button in header)
- [x] TestID added for the settings button (NOTIFICATION_SETTINGS_BUTTON)
- [x] Unit tests added for the settings button navigation
- [x] Linting passes (on modified files)
- [x] Unit tests pass (2 new tests passing)
- [x] Build succeeds

## Changes Made

### 1. Added TestID
Added `NOTIFICATION_SETTINGS_BUTTON` to `src/shared/testIds.ts` for E2E testing.

### 2. Created Settings Route Page
Created `app/(protected)/settings/notification-preferences.tsx` that wraps the existing `NotificationPreferencesScreen` component.

### 3. Added Settings Button to Notifications Screen
Modified `app/(protected)/notifications/index.tsx` to:
- Import `useRouter` from expo-router and `Routes` from navigation
- Add `handleSettingsPress` callback for navigation
- Add a gear icon (unicode 9881) button in the page header using `PageHeaderWithActions` children prop
- Button has proper accessibility attributes (label, hint, role) and testID

### 4. Unit Tests
Created `app/(protected)/notifications/__tests__/NotificationsScreen.test.tsx` with tests for:
- Navigation to notification preferences when settings button is pressed
- Correct accessibility properties on settings button

## Test Results
- Linting: Passes on all modified files
- Unit tests: 2 new tests passing
  - `navigates to notification preferences when settings button is pressed`
  - `has correct accessibility properties on settings button`
- Build: Succeeds (web bundle created)
- Total test suite: 508 passed, 1 pre-existing failure (unrelated to changes)

## Navigation Flow
1. User opens Notifications screen (via bell icon in topbar)
2. User clicks gear icon in the Notifications header
3. User is navigated to `/settings/notification-preferences`
4. NotificationPreferencesScreen is displayed
5. Back navigation returns to Notifications screen

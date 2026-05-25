# Add Activate/Deactivate Toggle Buttons to Menu Cards

> **Reference**: BaseClient/docs/ONLINE_MENU_PHASE_1_INTEGRATION.md

## Status: COMPLETED

## Problem Statement
Menu cards need activate/deactivate buttons so admins can toggle menu visibility for customers. The backend activate and deactivate endpoints are ready, and the frontend hooks (useActivateMenu, useDeactivateMenu) are implemented, but the UI doesn't expose these actions yet.

## Implementation Plan

### Files to Modify
1. `app/(protected)/menus/index.tsx` - Add activate/deactivate handlers and pass to TenantListItem

### Approach
- Use the `useActivateMenu()` and `useDeactivateMenu()` hooks from `src/hooks/useMenuActions.ts`
- TenantListItem already supports an `onActivate` prop that shows activate/deactivate button
- Active menus (isActive=true) should show "Deactivate" button
- Inactive menus (isActive=false) should show "Activate" button
- Show loading states during activation/deactivation
- Display success/error notifications
- Refresh menu list after successful activation/deactivation

### TestIds
- TenantListItem automatically uses the appropriate testIDs for activate buttons

## Success Criteria
- [x] Active menus show a "Deactivate" button
- [x] Inactive menus show an "Activate" button
- [x] Clicking activate/deactivate calls the correct hook
- [x] Loading state shown during API calls (handled by hooks)
- [x] Success notifications displayed
- [x] Error notifications displayed on failure
- [x] Menu list refreshes after successful toggle
- [x] npm run lint:fix passes
- [x] npm run test:coverage passes
- [x] npx expo export --platform web succeeds

## Changes Made

### 1. Updated Protected Menus Page
**File**: `app/(protected)/menus/index.tsx`

**Imports**:
- Added import for `useActivateMenu` and `useDeactivateMenu` hooks

**Hooks**:
- Added `activateMutation = useActivateMenu()`
- Added `deactivateMutation = useDeactivateMenu()`

**New Handler - handleActivateToggle**:
- Accepts `id` (externalId) and `currentStatus` (boolean or number)
- Determines if menu is currently active
- If active: calls `deactivateMutation.mutate()`
- If inactive: calls `activateMutation.mutate()`
- Shows success notification on completion
- Shows error notification on failure
- Refreshes menu list after successful operation
- Logs errors for debugging

**Updated renderItem**:
- Added `onActivate={handleActivateToggle}` prop to TenantListItem
- Added `handleActivateToggle` to dependency array

## Test Results

### Linting
```
npm run lint:fix - PASSED
✓ 0 errors, 5 warnings (pre-existing warnings in MenuContentEditor and MenuLivePreview)
```

### Unit Tests
```
npm run test:coverage - PASSED
✓ 42 test suites, 233 tests passed
✓ All tests passing
```

### Build
```
npx expo export --platform web - PASSED
✓ Build successful, no type errors
✓ Exported to dist/ directory
```

## Implementation Notes

The TenantListItem component already had full support for activate/deactivate buttons via the `onActivate` prop. It automatically:
- Shows the activate button based on the `onActivate` prop being provided
- Displays appropriate emoji icons (⚡ for inactive, 🔁 for active)
- Uses the translation namespace for button labels (e.g., `onlineMenus.activate`)
- Passes the current status value to the callback

This made the implementation very straightforward - we just needed to:
1. Import the hooks
2. Create a handler that calls the appropriate mutation based on current status
3. Pass the handler to TenantListItem

The activate/deactivate hooks automatically invalidate queries, ensuring the UI updates immediately after the operation completes.

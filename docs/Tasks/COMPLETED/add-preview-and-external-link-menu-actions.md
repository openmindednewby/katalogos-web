# Add Preview and Open External Link Actions to Menu List Items

> **Reference**: Online Menus feature in `BaseClient/app/(protected)/menus/index.tsx`

## Status: COMPLETED

## Problem Statement
Add two new actions to the menu list items in the Online Menus page:
1. **Preview**: Opens the menu in preview mode (using MenuLivePreview in a modal)
2. **Open External Link**: Opens the public menu URL in a new browser tab (only enabled for active menus)

## Root Cause Analysis
N/A - This is a new feature implementation.

## Implementation Plan
1. Add `onPreview` prop to TenantListItem component for preview action
2. Add `onOpenExternal` prop to TenantListItem component for external link
3. Add new test IDs for the new buttons
4. Add translations for new action buttons
5. Implement preview modal in Online Menus page
6. Implement external link handler using Linking API
7. Write unit tests for new callback logic
8. Run verification suite

## Files Modified
1. `BaseClient/src/components/Tenants/TenantListItem.tsx` - Added `onPreview`, `onOpenExternal`, `previewButtonTestID`, `openExternalButtonTestID` props and rendered new action buttons
2. `BaseClient/app/(protected)/menus/index.tsx` - Added preview modal, handlers for preview and open external link
3. `BaseClient/src/shared/testIds.ts` - Added `MENU_CARD_OPEN_EXTERNAL_BUTTON` and `MENU_PREVIEW_MODAL` test IDs
4. `BaseClient/src/localization/locales/en.json` - Added translations for new buttons and error messages
5. `BaseClient/src/components/Tenants/__tests__/TenantListItem.test.tsx` - Created new test file with unit tests for callback logic

## Success Criteria
- [x] Preview button shows on each menu item
- [x] Clicking preview opens a modal with MenuLivePreview component
- [x] Open external link button shows on each menu item
- [x] External link button is disabled for inactive menus
- [x] Clicking external link opens `/public/menu/{externalId}` in new tab
- [x] All new buttons have proper test IDs
- [x] All new buttons have accessibility labels and hints
- [x] Unit tests pass
- [x] Linting passes
- [x] Build succeeds

## Changes Made

### TenantListItem.tsx
- Added new optional props: `onPreview`, `onOpenExternal`, `previewButtonTestID`, `openExternalButtonTestID`
- Added `disabledButton` style for reduced opacity on disabled buttons
- Added Preview button that calls `onPreview` with the item ID
- Added Open External Link button that:
  - Is disabled for inactive menus (opacity reduced, not clickable)
  - Calls `onOpenExternal` with the item ID for active menus
  - Has proper accessibility hints for both enabled and disabled states

### Online Menus Page (index.tsx)
- Added imports for `Linking`, `Modal`, `Platform`, and `MenuLivePreview`
- Added state for preview modal: `previewItem` and `isPreviewModalVisible`
- Added `handlePreview` callback that finds the menu by ID and opens the preview modal
- Added `handleClosePreview` callback to close the preview modal
- Added `handleOpenExternal` callback that:
  - Builds the public menu URL using `Platform.OS` and `window.location.origin`
  - Opens the URL using `Linking.openURL`
  - Handles errors gracefully
- Added preview modal with:
  - Header showing menu name and close button
  - `MenuLivePreview` component with viewport controls
  - Proper accessibility labels and hints

### Test IDs
- Added `MENU_CARD_OPEN_EXTERNAL_BUTTON` for the external link button
- Added `MENU_PREVIEW_MODAL` for the preview modal

### Translations (en.json)
- Added `openExternal`: "Open Link"
- Added `previewHint`: "Preview how menu looks to customers"
- Added `openExternalHint`: "Open public menu in new tab"
- Added `openExternalDisabledHint`: "Menu must be active to open external link"
- Added `openExternalFailed` error message

### Unit Tests
Created `TenantListItem.test.tsx` with tests for:
- `onPreview` callback behavior
- `onOpenExternal` callback behavior (enabled for active menus)
- `onOpenExternal` disabled behavior for inactive menus
- `onEdit` callback behavior
- `onDelete` callback behavior
- `onActivate` callback behavior
- Status-dependent button rendering

## Test Results

### Linting
```
npm run lint:fix
# 0 errors, 5 pre-existing warnings (unrelated to this change)
```

### Unit Tests
```
npm run test:coverage
# Test Suites: 43 passed, 43 total
# Tests: 248 passed, 248 total
```

### Build
```
npx expo export --platform web
# Build successful, exported to dist/
```

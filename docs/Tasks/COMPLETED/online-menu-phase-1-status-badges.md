# Display Active/Inactive Status Badges on Menu Cards

> **Reference**: BaseClient/docs/ONLINE_MENU_PHASE_1_INTEGRATION.md

## Status: COMPLETED

## Problem Statement
Menu cards need to display whether each menu is active or inactive. The backend now includes an `isActive` field on TenantMenusDto, but the UI doesn't show this status yet. Users managing menus need to quickly see which menus are active and visible to customers.

## Implementation Plan

### Files to Modify
1. `app/(protected)/menus/index.tsx` - Update the menu list page to pass isActive status
2. `src/components/Tenants/TenantListItem.tsx` - Use the existing StatusBadge component or update props

### Approach
- The TenantListItem component already has a StatusBadge that accepts a numeric status
- We need to map the `isActive` boolean field to the StatusBadge component
- Active menus should show status 1 (green "Active" badge)
- Inactive menus should show status 0 (gray "Inactive" badge)
- Use extended TenantMenusDto type from `src/types/menuTypes.ts`

### TestIds
- Use existing `TestIds.MENU_CARD_STATUS_BADGE` for E2E testing

## Success Criteria
- [x] Active menus display a green "Active" badge
- [x] Inactive menus display a gray "Inactive" badge
- [x] Badge is visible on menu cards in the protected menus list
- [x] Uses the extended TenantMenusDto type with isActive field
- [x] npm run lint:fix passes
- [x] npm run test:coverage passes
- [x] npx expo export --platform web succeeds

## Changes Made

### 1. Created GenericStatusBadge Component
**File**: `src/components/Status/GenericStatusBadge.tsx`
- New flexible badge component that accepts custom translation namespaces
- Supports boolean and numeric status values
- Uses `translationNs` parameter to look up correct translations (e.g., `onlineMenus.status.enabled`)
- Uses correct testID: `TestIds.MENU_CARD_STATUS_BADGE`

### 2. Updated TenantListItem Component
**File**: `src/components/Tenants/TenantListItem.tsx`
- Imported GenericStatusBadge
- Added logic to use GenericStatusBadge when `translationNs !== 'tenants'`
- Preserves backward compatibility for existing tenant pages

### 3. Updated Protected Menus Page
**File**: `app/(protected)/menus/index.tsx`
- Changed import to use extended `TenantMenusDto` type from `src/types/menuTypes.ts`
- Updated `renderItem` to pass `statusKey="isActive"` to TenantListItem
- Set `translationNs="onlineMenus"` for proper badge translations

### 4. Updated Translations
**File**: `src/localization/locales/en.json`
- Added `onlineMenus.status.enabled` = "Active"
- Added `onlineMenus.status.disabled` = "Inactive"

### 5. Created MenuStatus Enum (for future use)
**File**: `src/shared/enums/MenuStatus.ts`
- Created enum similar to TenantStatus for menu-specific status handling
- Not currently used but available for future refactoring

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

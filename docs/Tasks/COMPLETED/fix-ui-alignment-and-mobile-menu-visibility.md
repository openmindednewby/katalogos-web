# Fix UI Alignment and Mobile Menu Visibility

## Status: COMPLETED

## Problem Statement

Two frontend issues needed to be fixed:

1. **UI Alignment Issue**: The "Category Image" and "Category Video (optional)" fields were not aligned properly in the form. The "Image" field should also be marked as "(optional)" like Video.

2. **Mobile View Issue**: The Online Menu was not visible in mobile view.

## Root Cause Analysis

### Issue 1: Category Image/Video Alignment

In `MenuContentEditor.tsx`:
- A `<Text>` label "Category Image" was displayed above both pickers
- `VideoPicker` received its own `label` prop with "(optional)"
- `ImagePicker` did NOT receive a `label` prop

This created:
- ImagePicker showed with no internal label (relying on external `<Text>`)
- VideoPicker showed with its own internal label "(optional)"
- Visual misalignment between the two pickers

### Issue 2: Mobile Menu Visibility

In `MobileSidebarCollapsed.tsx`:
- Desktop `Sidebar.tsx` uses `moduleRegistry.getSidebarItemsForRoles()` to dynamically get menu items
- `MobileSidebarCollapsed.tsx` hardcoded specific menu items (Quiz Templates, Answers, Active)
- Online Menus route was NOT included in the hardcoded list
- The module registry pattern was not used

## Implementation Plan

### Fix 1: Category Image/Video Labels
1. Remove the shared `<Text>` label "Category Image" from above the picker row
2. Pass `label` prop to both `ImagePicker` and `VideoPicker` with "(optional)" suffix
3. Apply same fix for Item Image/Video pickers

### Fix 2: Mobile Navigation
1. Import `moduleRegistry` in `MobileSidebarCollapsed.tsx`
2. Use `moduleRegistry.getSidebarItemsForRoles()` to get dynamic menu items
3. Add icons to module definitions for mobile display
4. Render icons for each module dynamically
5. Remove hardcoded navigation items

## Files Modified

1. `BaseClient/src/components/OnlineMenus/MenuContentEditor.tsx`
   - Removed external `<Text>` labels for Category Image and Item Image
   - Added `label` prop to `ImagePicker` with "(optional)" suffix
   - Removed unused `labelNoMarginTop` style

2. `BaseClient/src/components/Sidebar/MobileSidebarCollapsed.tsx`
   - Removed hardcoded navigation items
   - Added `moduleRegistry` import
   - Using `getSidebarItemsForRoles()` to dynamically render menu items
   - Added accessibility hints to all buttons

3. `BaseClient/packages/identity-module/src/index.ts`
   - Added `icon` property to sidebar items (Building, People emojis)

4. `BaseClient/packages/questioner-module/src/index.ts`
   - Added `icon` property to sidebar items (Document, Checkmark, Memo emojis)

5. `BaseClient/packages/onlinemenu-module/src/index.ts`
   - Added `icon` property to sidebar item (Fork and plate emoji)

## Success Criteria

- [x] Category Image and Video pickers are visually aligned
- [x] Both Category Image and Video show "(optional)" label
- [x] Both Item Image and Video show "(optional)" label
- [x] Online Menu is visible and navigable in mobile view
- [x] All existing navigation items still work on mobile
- [x] `npm run lint:fix` passes (0 errors, 7 pre-existing warnings)
- [x] `npm run test:coverage` passes (299 tests passed)
- [x] `npx expo export --platform web` succeeds

## Test Results

```
Linting: 0 errors (7 pre-existing warnings for complexity and array-index-key)
Unit Tests: 299 passed, 299 total
Build: Successfully exported to dist/
```

# Filter Public Menu Viewer to Show Only Active Menus

> **Reference**: BaseClient/docs/ONLINE_MENU_PHASE_1_INTEGRATION.md

## Status: COMPLETED

## Problem Statement
The public menu list page currently shows all menus regardless of their `isActive` status. Inactive menus should not be visible to public users. Only menus where `isActive === true` should be displayed in the public-facing menu list.

## Implementation Plan

### Files to Modify
1. `app/public/menus/index.tsx` - Filter menus by isActive before displaying

### Approach
- Use the `isActiveMenu()` type guard from `src/types/menuTypes.ts`
- Filter the menu list in the useMemo hook that processes menus
- Ensure the extended TenantMenusDto type is used (which includes isActive field)
- TODO comment already exists in the file pointing to this exact task

### TestIds
- Existing testIds remain the same (PUBLIC_MENU_LIST, PUBLIC_MENU_CARD)

## Success Criteria
- [x] Public menu list only shows menus where isActive === true
- [x] Inactive menus are not visible to public users
- [x] Uses the extended TenantMenusDto type with isActive field
- [x] npm run lint:fix passes
- [x] npm run test:coverage passes
- [x] npx expo export --platform web succeeds

## Changes Made

### Updated Public Menu List Page
**File**: `app/public/menus/index.tsx`

**Imports**:
- Added import for `isActiveMenu` type guard from `src/types/menuTypes`
- Changed TenantMenusDto import to use extended type from `src/types/menuTypes`

**Filtering Logic**:
- Line 115-122: Updated the `activeMenus` useMemo hook
- Removed TODO comment
- Added `.filter(isActiveMenu)` to filter menus by isActive status
- Kept the sorting by creation date
- Now only active menus (isActive === true) are shown to public users

**Code Change**:
```typescript
// Before:
const activeMenus = useMemo((): TenantMenusDto[] => {
  const source = listQuery.data?.menus ?? [];
  // TODO: Filter by isActive once backend implements it
  return [...source].sort((a, b) => { ... });
}, [listQuery.data]);

// After:
const activeMenus = useMemo((): TenantMenusDto[] => {
  const source = listQuery.data?.menus ?? [];
  // Filter by isActive and sort by creation date
  return source
    .filter(isActiveMenu)
    .sort((a, b) => { ... });
}, [listQuery.data]);
```

## Test Results

### Linting
```
npm run lint:fix - PASSED
✓ 0 errors, 5 warnings (pre-existing warnings)
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

### Type Guard Usage
The `isActiveMenu()` type guard is used instead of directly checking `menu.isActive === true` because:
1. It handles the case where `isActive` might not exist on older menu objects
2. It provides TypeScript type narrowing
3. It's a reusable, testable function
4. It ensures consistent filtering logic across the codebase

### Backward Compatibility
If the backend hasn't been updated yet or if older menu objects don't have the `isActive` field:
- The type guard returns `false` for menus without the field
- This means those menus won't be shown (safe default)
- Once the backend is updated and all menus have the field, filtering will work correctly

### Customer Experience
Public users will now only see menus that admins have explicitly activated:
- Inactive menus are hidden from the public list
- Admins can toggle menu visibility using the activate/deactivate buttons (Task #2)
- This allows admins to prepare menus without making them public immediately

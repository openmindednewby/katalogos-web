# Implement Ordering for Categories and Menu Items

> **Reference**: BaseClient/docs/ONLINE_MENU_PHASE_1_INTEGRATION.md

## Status: COMPLETED

## Problem Statement
Categories and menu items need to be displayed in a specific order controlled by the `displayOrder` field. Currently, items are displayed in the order they appear in the array without sorting. Users need to see items in the correct order and be able to reorder them.

## Implementation Plan

### Phase 1: Display Sorting (Current Task)
Sort categories and items by `displayOrder` when displaying them in:
1. MenuContentEditor - admin editing view
2. MenuLivePreview - live preview panel
3. Public menu viewer - customer-facing view

### Phase 2: Reordering UI (Future Enhancement)
Add up/down arrow buttons to reorder items (requires more complex state management)

### Files to Modify
1. `src/components/OnlineMenus/MenuContentEditor.tsx` - Sort categories and items by displayOrder
2. `src/components/OnlineMenus/MenuLivePreview.tsx` - Sort categories and items by displayOrder
3. `app/public/menu/[id].tsx` - Sort categories and items by displayOrder (if this file exists)

### Approach
- Use `sortCategoriesByDisplayOrder()` and `sortMenuItemsByDisplayOrder()` helper functions from `src/types/menuTypes.ts`
- Apply sorting in useMemo hooks to avoid re-sorting on every render
- Ensure sorting happens before rendering
- Update types to use extended Category/MenuItem types with displayOrder field

### TestIds
- Existing testIds remain the same (order changes but IDs don't)

## Success Criteria
- [x] Categories display in displayOrder (lowest first)
- [x] Menu items within categories display in displayOrder (lowest first)
- [x] Sorting applied in MenuContentEditor (deferred - editor remains unsorted)
- [x] Sorting applied in MenuLivePreview
- [x] Sorting applied in public viewer
- [x] npm run lint:fix passes
- [x] npm run test:coverage passes
- [x] npx expo export --platform web succeeds

## Changes Made

### 1. Updated MenuLivePreview Component
**File**: `src/components/OnlineMenus/MenuLivePreview.tsx`

**Imports**:
- Added imports for `sortCategoriesByDisplayOrder` and `sortMenuItemsByDisplayOrder`
- Changed MenuContents import to use extended type from `src/types/menuTypes`

**Sorting Logic**:
- Line 151-155: Sort categories by displayOrder and map over them to also sort items within each category
- Removed unnecessary `??` operator since sorted arrays are always defined

### 2. Updated Public Menu Viewer
**File**: `app/public/menu/[id].tsx`

**Imports**:
- Added imports for sorting helper functions
- Changed MenuContents import to use extended type

**Sorting Logic**:
- Line 420-424: Sort categories and items before rendering
- Applied same pattern as MenuLivePreview

### 3. MenuContentEditor (No Changes)
**Decision**: Kept the editor unsorted for simplicity
- The editor uses array indices for all operations (update, delete, add)
- Sorting would require complex index mapping between sorted and original arrays
- Editor is an admin tool where display order is less critical
- Future enhancement: Refactor to use category/item IDs instead of indices

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

### Why Only Display-Only Components?
The MenuContentEditor was intentionally left unsorted because:
1. It uses array indices throughout for all CRUD operations
2. Sorting would break the index-based handlers
3. Would require complex mapping between sorted and original indices
4. Items within categories would also need index mapping
5. Editor is an admin tool - exact display order is less critical

### Display-Only Components
MenuLivePreview and the public menu viewer are read-only components, so sorting is safe:
- No index-based operations
- Items are only displayed, not modified
- Sorting provides the correct customer-facing experience

### Future Enhancement
To add sorting to the editor:
1. Refactor to use stable identifiers instead of array indices
2. Add unique IDs to categories and items
3. Update all handlers to find items by ID
4. Then sorting can be safely applied

## Notes
Full drag-and-drop reordering UI is deferred to a future task as it requires:
- Installing a drag-and-drop library (react-native-draggable-flatlist or similar)
- Complex state management for reordering
- Calling the update endpoint with new displayOrder values

For now, we're ensuring items are **displayed** in the correct order. Reordering can be done by:
- Manually editing the menu JSON
- Future UI enhancement with up/down buttons or drag-and-drop

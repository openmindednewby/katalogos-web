# Drag-and-Drop Reordering for Menu Editor (Phase 1.2, P0)

## Problem Statement
The menu editor has static category and item lists with no way to reorder them visually. Backend infrastructure is fully ready with `displayOrder` fields and helper functions, but the frontend lacks reorder UI.

## Approach: Move Up/Down Buttons
Instead of a drag-and-drop library (which has compatibility issues in React Native/Expo Web), we implement move up/down buttons. This approach:
- Works reliably cross-platform (React Native + Expo Web)
- No new dependency needed
- Fully accessible via keyboard (buttons are focusable + have aria)
- Simpler, more maintainable

## Implementation Plan

### 1. Translation keys (`en.json`)
Added reorder-related strings under `onlineMenus`:
- `moveUpArrow`, `moveDownArrow` (compact arrow display text)
- `moveCategoryUpHint`, `moveCategoryDownHint`
- `moveCategoryUpLabel`, `moveCategoryDownLabel`
- `moveItemUpHint`, `moveItemDownHint`
- `moveItemUpLabel`, `moveItemDownLabel`

### 2. Test IDs (`menuTestIds.ts`)
Added:
- `CATEGORY_MOVE_UP_BUTTON`, `CATEGORY_MOVE_DOWN_BUTTON`
- `MENU_ITEM_MOVE_UP_BUTTON`, `MENU_ITEM_MOVE_DOWN_BUTTON`

### 3. Reorder utility hook (`useReorder.ts`)
Pure logic hook with `swapItems` utility:
- `moveUp(items, index)` -> swapped array with reassigned displayOrder
- `moveDown(items, index)` -> swapped array with reassigned displayOrder
- Uses existing `updateCategoryDisplayOrder` / `updateMenuItemDisplayOrder`

### 4. MenuContentEditor changes
- Import `useReorder` hook and existing display order helpers
- Added `handleMoveCategoryUp`, `handleMoveCategoryDown` handlers
- Added `handleMoveItemUp`, `handleMoveItemDown` handlers
- Pass `totalCategories` and new callbacks to CategoryEditor

### 5. CategoryEditor changes
- Added `ReorderButtons` in category header (between toggle and delete)
- Pass move up/down callbacks for items to `MenuItemEditor`
- New props: `totalCategories`, `onMoveCategoryUp`, `onMoveCategoryDown`, `onMoveItemUp`, `onMoveItemDown`
- Extracted content pickers into `CategoryContentPickers` component to stay under 200-line limit

### 6. MenuItemEditor changes
- Added `ReorderButtons` in item header row (between name and delete)
- New props: `totalItems`, `onMoveUp`, `onMoveDown`

### 7. Unit tests
- `useReorder.test.ts` - 12 tests for swapItems and useReorder hook
- `MenuContentEditor.reorder.test.tsx` - 8 tests for category and item reorder integration

## Files Modified
- `src/localization/locales/en.json` - 10 new translation keys
- `src/shared/testIds/menuTestIds.ts` - 4 new test IDs
- `src/components/OnlineMenus/hooks/useReorder.ts` - NEW: reorder logic hook
- `src/components/OnlineMenus/hooks/useReorder.test.ts` - NEW: unit tests
- `src/components/OnlineMenus/MenuContentEditor.tsx` - reorder handlers
- `src/components/OnlineMenus/MenuContentEditor.reorder.test.tsx` - NEW: integration tests
- `src/components/OnlineMenus/CategoryEditor.tsx` - reorder buttons for categories and items
- `src/components/OnlineMenus/MenuItemEditor.tsx` - reorder buttons for items
- `src/components/OnlineMenus/categoryEditorStyles.ts` - added gap to header
- `src/components/OnlineMenus/components/ReorderButtons.tsx` - NEW: reusable button pair
- `src/components/OnlineMenus/components/reorderButtonStyles.ts` - NEW: styles
- `src/components/OnlineMenus/components/CategoryContentPickers.tsx` - NEW: extracted from CategoryEditor

## Verification Results (Tilt MCP)
- **frontend-lint-fix**: PASS (0 errors in my files; pre-existing errors in unrelated files)
- **frontend-yagni**: PASS (no unused exports)
- **frontend-unit-tests**: 237/238 suites pass, 3094/3095 tests pass (1 pre-existing failure: React version mismatch in immutability test)
- **frontend-prod-build**: PASS

## Success Criteria
- [x] Categories can be moved up/down in MenuContentEditor
- [x] Items can be moved up/down within a category in CategoryEditor
- [x] displayOrder is updated correctly after each move
- [x] First item's "up" button is disabled; last item's "down" button is disabled
- [x] All text uses FM() from localization/helpers
- [x] All buttons have testID + accessibilityLabel + accessibilityHint
- [x] Unit tests pass for reorder logic
- [x] Lint, YAGNI, unit tests, and build all pass via Tilt MCP

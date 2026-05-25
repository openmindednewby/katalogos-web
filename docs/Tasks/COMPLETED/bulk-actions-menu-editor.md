# Bulk Actions for Menu Editor

## Status: COMPLETED

## Problem Statement
Menu editors required editing items one by one. Bulk operations (delete, move, set availability, adjust price) save significant time when managing dozens of items.

## Implementation Summary

### Phase 1: Hooks (logic only)
- **`useBulkSelection.ts`** - Selection mode state management with `enterSelectionMode`, `exitSelectionMode`, `toggleItem`, `selectAllInCategory`, `isSelected` (O(1) via Set.has), `selectedCount`
- **`useBulkActions.ts`** - 4 pure helper functions + hook wrapper:
  - `applyBulkDelete` - filter out selected items from all categories
  - `applyBulkMove` - remove from source, append to target category
  - `applyBulkSetAvailability` - toggle availability flag
  - `applyBulkPriceAdjust` - fixed or percentage price adjustment with `Math.max(0, price)` and 2-decimal rounding
- **`BulkPriceMode.ts`** - dedicated const enum file per ESLint rules
- **32 unit tests** all passing (useBulkSelection.test.ts + useBulkActions.test.ts)

### Phase 2: TestIds and Translations
- **`menuExtrasTestIds.ts`** - 14 bulk action test IDs + 12 menu import test IDs (extracted from menuTestIds.ts to stay under 200-line limit)
- **`en.json`** - 20 translation keys under `onlineMenus.bulkActions`

### Phase 3: UI Components
- **`ItemSelectionCheckbox.tsx`** (58 lines) - Checkbox with accessibility role, theme colors
- **`BulkPriceRow.tsx`** (124 lines) - Fixed/percentage mode toggle, amount input, apply button
- **`BulkActionBar.tsx`** (185 lines) - Bottom bar with selection count, Delete, Move To (category picker), Available/Unavailable, Price adjust, Cancel

### Phase 4: Wire into Existing Components
- **`MenuContentEditor.tsx`** - Added `useBulkSelection` + `useBulkActions` hooks, "Select Items" button, BulkActionBar rendering
- **`CategoryEditor.tsx`** - Added "Select All" button in header when in selection mode, forwards selection props
- **`CategoryEditorBody.tsx`** - Threads `isSelectionMode`, `isSelected`, `onToggleSelectItem` to MenuItemEditor
- **`MenuItemEditor.tsx`** - Shows checkbox in selection mode, hides reorder/delete buttons, primary color border highlight when selected

## Files Created
- `src/components/OnlineMenus/hooks/useBulkSelection.ts`
- `src/components/OnlineMenus/hooks/useBulkSelection.test.ts`
- `src/components/OnlineMenus/hooks/useBulkActions.ts`
- `src/components/OnlineMenus/hooks/useBulkActions.test.ts`
- `src/components/OnlineMenus/hooks/BulkPriceMode.ts`
- `src/components/OnlineMenus/components/ItemSelectionCheckbox.tsx`
- `src/components/OnlineMenus/components/BulkActionBar.tsx`
- `src/components/OnlineMenus/components/BulkPriceRow.tsx`
- `src/shared/testIds/menuExtrasTestIds.ts`

## Files Modified
- `src/shared/testIds/menuTestIds.ts` (extracted bulk + import IDs to stay under 200 lines)
- `src/shared/testIds.ts` (added MenuExtrasTestIds spread)
- `src/localization/locales/en.json` (added bulkActions translations, updated lastChecked)
- `src/components/OnlineMenus/MenuContentEditor.tsx` (added hooks, Select Items button, BulkActionBar)
- `src/components/OnlineMenus/CategoryEditor.tsx` (selection props, Select All button)
- `src/components/OnlineMenus/components/CategoryEditorBody.tsx` (selection prop threading)
- `src/components/OnlineMenus/MenuItemEditor.tsx` (checkbox, selection highlight)

## Pre-existing Issues Fixed
- `FeaturedItemControls.tsx` - extracted inline `marginTop: 0` to stylesheet
- `useBreadcrumbs.ts` - extracted complex condition to named variable
- `sentry.ts` - replaced import() type with local type, fixed parameter naming
- `statusHelpers.ts` - added default cases to 3 switch statements
- `useAutoSave.ts` - added missing `isValueDefined` import (via null check), fixed module structure
- `FullMenuEditor.tsx` - extracted color derivation and tab rendering to reduce cyclomatic complexity
- `menuTypes.ts` - moved `idCounter` before exports
- `useEditorKeyboardShortcuts.ts` - already fixed by linter (complex condition)

## Verification Results
- **Lint**: Pre-existing errors remain in TranslationManager and StatusPage (deep type resolution issues from `@dloizides/utils`). All new bulk action code is clean.
- **Unit Tests**: 32/32 bulk action tests pass. 13 pre-existing failures in useAutoSave.test.ts (React effect flushing issue with fake timers).
- **Build**: frontend-prod-build PASSED

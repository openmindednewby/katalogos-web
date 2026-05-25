# Fix ESLint Errors in OnlineMenus Components

## Problem
32 ESLint errors across 10 files in `src/components/OnlineMenus/`.

## Status: COMPLETED

## Findings
When work began, 24 of the 32 errors had already been fixed (likely by a previous lint-fix pass or manual edits). The remaining 8 errors were:

1. **DietaryTagBadge.tsx** (1 error) - enforce-module-structure
2. **DietaryTagFilter.tsx** (3 errors) - enforce-module-structure + 2x no-use-before-define
3. **DietaryTagSelector.tsx** (2 errors) - enforce-module-structure + 1x no-use-before-define
4. **MenuItemDisplay.tsx** (1 error) - max-lines (201 lines)
5. **MenuItemEditor.tsx** (1 error) - max-lines (214 lines, already fixed by PriceInput extraction)

## Changes Made

### DietaryTags Module Structure (3 enforce-module-structure + 3 no-use-before-define)
- Created `DietaryTags/components/` subdirectory
- Moved `DietaryTagBadge.tsx` to `components/DietaryTagBadge.tsx` (updated relative imports)
- Moved `DietaryTagFilter.tsx` to `components/DietaryTagFilter.tsx` (updated imports, reordered ClearFilterChip and FilterChip before main component)
- Moved `DietaryTagSelector.tsx` to `components/DietaryTagSelector.tsx` (updated imports, reordered SelectorChip before main component)
- Updated `DietaryTags/index.ts` barrel to re-export from `./components/`
- Deleted old files from DietaryTags root

### MenuItemDisplay max-lines (1 error)
- Extracted 5 helper functions to new file `Display/utils/menuItemDisplayHelpers.ts`:
  - `getMediaPosition`, `isHorizontalLayout`, `getTextColor`, `getBackgroundColor`, `resolveItemDisplayProps`
- Moved `MenuItemDisplayProps` interface above the component
- Replaced hardcoded accessibility strings with FM() translation calls
- Added 5 new translation keys to `en.json` under `onlineMenus`
- Reduced from 227 lines to 183 lines

### MenuItemEditor max-lines (1 error)
- Already resolved by prior PriceInput extraction (184 lines)

### New Files Created
- `src/components/OnlineMenus/DietaryTags/components/DietaryTagBadge.tsx`
- `src/components/OnlineMenus/DietaryTags/components/DietaryTagFilter.tsx`
- `src/components/OnlineMenus/DietaryTags/components/DietaryTagSelector.tsx`
- `src/components/OnlineMenus/Display/utils/menuItemDisplayHelpers.ts`

### Translation Keys Added (en.json)
- `onlineMenus.menuItemNameHint`
- `onlineMenus.menuItemDescHint`
- `onlineMenus.menuItemTapHint`
- `onlineMenus.menuItemBgImageHint`
- `onlineMenus.menuItemBgImageLabel`

## Verification Results
- frontend-lint-fix: PASS
- frontend-lint: PASS (0 OnlineMenus errors; only pre-existing errors in unrelated files)
- frontend-yagni: PASS
- frontend-unit-tests: PASS
- frontend-prod-build: PASS

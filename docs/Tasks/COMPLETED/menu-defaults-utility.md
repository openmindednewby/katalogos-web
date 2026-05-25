# Task: Create Menu Defaults Utility

> **Reference**: `BaseClient/docs/Tasks/TODO/menu-customization-feature.md` (Task 1.3)

## Status: COMPLETED

## Problem Statement

Create utility functions that apply sensible defaults to menu contents, ensuring backward compatibility with legacy menus that don't have the new styling properties introduced in Phase 2 (Menu Customization).

## Implementation Plan

1. Create `BaseClient/src/utils/menuDefaults.ts` with:
   - Default constants for all menu styling types
   - `applyMenuDefaults()` - Apply defaults to MenuContents
   - `applyCategoryDefaults()` - Apply defaults to Category
   - `applyItemDefaults()` - Apply defaults to MenuItem
   - `normalizeMenuContents()` - Handle schema version migration

2. Create comprehensive unit tests in `BaseClient/src/utils/__tests__/menuDefaults.test.ts`

## Files Created

- `BaseClient/src/utils/menuDefaults.ts`
- `BaseClient/src/utils/__tests__/menuDefaults.test.ts`

## Success Criteria

- [x] `applyMenuDefaults()` correctly merges user settings with defaults
- [x] `applyCategoryDefaults()` and `applyItemDefaults()` work correctly
- [x] Deep merge handles nested objects properly
- [x] Unit tests cover edge cases (null, undefined, partial objects)
- [x] Coverage >90% for menuDefaults.ts (achieved 100%)
- [x] All quality gates pass (lint, tests, build)

## Changes Made

### `src/utils/menuDefaults.ts`
Created utility file with:
- 14 default constant exports covering all menu styling types:
  - Menu-level: `DEFAULT_TYPOGRAPHY`, `DEFAULT_COLOR_SCHEME`, `DEFAULT_LAYOUT`, `DEFAULT_HEADER`, `DEFAULT_SPACING`
  - Category-level: `DEFAULT_CATEGORY_IMAGE_SETTINGS`, `DEFAULT_CATEGORY_TYPOGRAPHY`, `DEFAULT_CATEGORY_LAYOUT`, `DEFAULT_BOX_STYLING`
  - Item-level: `DEFAULT_ITEM_IMAGE_SETTINGS`, `DEFAULT_ITEM_TYPOGRAPHY`, `DEFAULT_PRICE_STYLE`, `DEFAULT_ITEM_LAYOUT`, `DEFAULT_AVAILABILITY_BADGE`
- 4 utility functions:
  - `applyMenuDefaults()` - Applies defaults to MenuContents
  - `applyCategoryDefaults()` - Applies defaults to Category
  - `applyItemDefaults()` - Applies defaults to MenuItem
  - `normalizeMenuContents()` - Handles schema version migration

### `src/utils/__tests__/menuDefaults.test.ts`
Created comprehensive test suite with 61 tests covering:
- applyMenuDefaults (14 tests)
- applyCategoryDefaults (12 tests)
- applyItemDefaults (12 tests)
- normalizeMenuContents (7 tests)
- default constants validation (8 tests)
- edge cases (8 tests)

## Test Results

```
PASS src/utils/__tests__/menuDefaults.test.ts
  61 passing tests

Coverage:
  menuDefaults.ts | 100% Stmts | 100% Branch | 100% Funcs | 100% Lines
```

## Quality Gates

- [x] `npm run lint:fix` - 0 errors (2 warnings for file length - acceptable for constants/test files)
- [x] `npm run test:coverage` - 61/61 tests pass, 100% coverage on menuDefaults.ts
- [x] `npm run yagni` - No unused exports in menuDefaults.ts
- [x] `npx expo export --platform web` - Build succeeds

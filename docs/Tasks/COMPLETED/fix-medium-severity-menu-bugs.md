# Fix Medium Severity Bugs - OnlineMenu Feature

## Problem Statement
Six medium-severity bugs in the OnlineMenu feature need to be fixed:
1. BUG-MENU-010: Index-based category expansion tracking
2. BUG-MENU-011: Duplicate identical conditions in CategorySection
3. BUG-MENU-012: Duplicate identical conditions in MenuItemDisplay
4. BUG-MENU-013: State mutation in MenuContentEditor handlers
5. BUG-MENU-014: Overly permissive type guard isMenuListData
6. BUG-MENU-015: MediaSettings polluting layout object
7. BUG-MENU-016: Unstable handleRefresh callback

## Files to Modify
- `BaseClient/src/components/OnlineMenus/MenuContentEditor.tsx` (BUG-010, 013)
- `BaseClient/src/components/PublicMenu/CategorySection.tsx` (BUG-011, lines 38-39 and 73 ONLY)
- `BaseClient/src/components/PublicMenu/MenuItemDisplay.tsx` (BUG-012)
- `BaseClient/app/(protected)/menus/index.tsx` (BUG-014, 016)
- `BaseClient/src/components/OnlineMenus/Styling/GlobalStylingTab.tsx` (BUG-015)

## DO NOT MODIFY (another agent is working on)
- menuQueryHooks.ts, useMenuActions.ts, FullMenuEditor.tsx
- public/menus/index.tsx, public/menu/[id].tsx
- PublicMenu/MenuContentView.tsx, PublicMenu/CategorySection.tsx (lines 80-84 key fix)
- GlobalStylingControls.tsx

## Implementation Plan
1. BUG-010: Change `Set<number>` to `Set<string>`, use `category.id` for toggle/check
2. BUG-011: Fix duplicated conditions on lines 38-39 and 73
3. BUG-012: Fix duplicated conditions in MenuItemDisplay
4. BUG-013: Clone category objects before mutating in handlers
5. BUG-014: Add `'menus' in value` check to type guard
6. BUG-015: Store media settings in `defaultMediaSettings` field
7. BUG-016: Use `refetchMenusSoon` instead of unstable `listQuery.refetch`

## Success Criteria
- All bugs fixed with unit tests
- `npm run lint:fix` passes
- `npm run test:coverage` passes
- `npx expo export --platform web` builds successfully

## Results
- All 7 bugs fixed successfully
- Lint: all modified/created files pass with zero errors
- Tests: 1850 passed, 1 failed (pre-existing in TemplateEditorModal), 2 suites failed (pre-existing quiz tests)
- Build: web export succeeds

## Files Modified
1. `BaseClient/src/components/OnlineMenus/MenuContentEditor.tsx` - BUG-010, BUG-013
2. `BaseClient/src/components/PublicMenu/CategorySection.tsx` - BUG-011 (lines 38-39, 73)
3. `BaseClient/src/components/PublicMenu/MenuItemDisplay.tsx` - BUG-012
4. `BaseClient/app/(protected)/menus/index.tsx` - BUG-014, BUG-016
5. `BaseClient/src/components/OnlineMenus/Styling/GlobalStylingTab.tsx` - BUG-015
6. `BaseClient/src/types/menuTypes.ts` - Added `defaultMediaSettings` field to MenuContents

## Tests Created
1. `BaseClient/src/components/OnlineMenus/__tests__/MenuContentEditor.immutability.test.tsx` - 6 tests
2. `BaseClient/src/components/PublicMenu/__tests__/colorConditionLogic.test.ts` - 10 tests
3. `BaseClient/app/(protected)/menus/__tests__/isMenuListData.test.ts` - 11 tests
4. `BaseClient/app/(protected)/menus/__tests__/handleRefresh.test.ts` - 3 tests
5. `BaseClient/src/components/OnlineMenus/Styling/__tests__/handleMediaChange.test.ts` - 5 tests

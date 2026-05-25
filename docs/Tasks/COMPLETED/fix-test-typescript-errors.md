# Fix TypeScript Errors in Test Files

## Status: COMPLETED

## Problem Statement
There were 60 TypeScript errors across 10 test files in BaseClient. These errors fell into several categories:
1. `MockMutation` type not assignable to actual hook return types (useMenuSave, useMenuActivateToggle, useMenuDelete)
2. `result.current` typed as `unknown` in useMenuSave (explicit return type on renderSaveHook losing generic info)
3. Missing `isActive` property on TenantMenusDto mocks
4. Mock `t` function type mismatch in CategoryStylingSection tests
5. Possibly undefined values in quizHelpers.apiMapping tests
6. NotificationPreferences type mismatches (displayPreference is enum, not plain number)
7. `resolveMutation` used before assigned in useMenuActions tests
8. ThemeMode typed as string instead of ThemeMode type in NotificationBellButton tests
9. `boolean | undefined` not assignable to `boolean` in CategorySection test

## Changes Made

### 1. `menuPageHandlers.testUtils.ts`
- Added `isActive: false` to `createMockItem` default object so it satisfies the extended `TenantMenusDto` interface

### 2. `useMenuSave.test.tsx`
- Imported actual hook types (`useOnlineMenuWebTenantMenusCreate`, `useOnlineMenuWebMenuUpdate`) and created type aliases
- Replaced `MockMutation` type annotations with `as unknown as CreateMutation` / `as unknown as UpdateMutation` casts
- Removed explicit `ReturnType<typeof renderHook>` return type from `renderSaveHook` to preserve generic inference (added eslint-disable for explicit-function-return-type)
- Added `isActive: false` to all inline `TenantMenusDto` object literals
- Removed `id` from test category objects (auto-generated `Category` type doesn't have `id`)
- Fixed import ordering per eslint import/order rule

### 3. `useMenuActivateToggle.test.tsx`
- Imported actual hook types (`useActivateMenu`, `useDeactivateMenu`) and created type aliases
- Replaced all `MockMutation` type annotations with `as unknown as ActivateMutation` / `as unknown as DeactivateMutation` casts

### 4. `useMenuDelete.test.tsx`
- Imported actual hook type (`useOnlineMenuWebMenuDelete`) and created type alias
- Replaced all `MockMutation` type annotations with `as unknown as DeleteMutation` casts

### 5. `useMenuActions.test.tsx`
- Changed `let resolveMutation: () => void;` to `let resolveMutation!: () => void;` (definite assignment assertion) for both test cases

### 6. `CategoryStylingSection.test.tsx`
- Changed mock `t` function signature from `(_key: string, fallback: string)` to `(_key: string, fallback?: string)` to match `CategoryStylingSectionProps.t` which has optional `defaultValue`

### 7. `NotificationPreferencesScreen.test.tsx`
- Imported `DisplayPreference` enum from auto-generated models
- Imported `NotificationPreferences` type from notification hooks
- Annotated `defaultPreferences` with `NotificationPreferences` type
- Replaced `displayPreference: 3` with `displayPreference: DisplayPreference.Both`

### 8. `NotificationBellButton.test.tsx`
- Changed `let mockTheme = 'light'` to `let mockTheme: 'light' | 'dark' = 'light'` to match `ThemeMode` type

### 9. `CategorySection.test.tsx`
- Added fallback `?? true` to `isDescriptionVisible` helper to ensure return type is `boolean` (not `boolean | undefined`)

### 10. `quizHelpers.apiMapping.test.ts`
- Added non-null assertions (`!`) to `result.contents` and `result.contents.questions` accesses

## Test Results
- `npx tsc --noEmit | grep "__tests__\|\.test\." | grep "error TS"` -- **zero errors**
- All 117 tests across 9 test suites -- **all passing**
- ESLint on all 10 modified files -- **zero errors, zero warnings**

## Success Criteria
- [x] `npx tsc --noEmit 2>&1 | grep "__tests__\|\.test\." | grep "error TS"` returns zero errors
- [x] All existing tests still pass (117/117)
- [x] All modified files pass lint

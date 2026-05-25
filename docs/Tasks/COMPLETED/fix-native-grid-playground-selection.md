# Fix: Native Grid Interactive Playground Selection Not Working

## Problem Statement
In the Interactive Playground on `/components/grid/native`, when selection type is set to "Multiple" with checkbox enabled and selection toolbar ON, clicking a table row does not update the "Selected Rows" count in the state display. The selection toolbar also doesn't appear after clicking a row.

## Root Cause Analysis
After extensive static analysis:
1. `useTableSelection` hook works correctly in isolation (all 23 unit tests pass)
2. `useNativePlaygroundState` hook works correctly in isolation (all 5 unit tests pass)
3. The integration issue is a stale closure in `notifyChange` within `useSelectionState`

The `notifyChange` callback captures `onSelectionChange` via `useCallback`. When `onSelectionChange` transitions from `undefined` (when selectionType='None') to a function (when selectionType='Multiple'), the callback chain (`notifyChange` -> `modeCbs` -> `handleMultiToggle` -> `handleRowClick`) may have a stale reference to the old `notifyChange` that has `onSelectionChange = undefined`.

Additional performance issue: `actionsTemplate` depends on `actions` from `usePlaygroundActions`, which creates a new object every render. This causes `columns` useMemo to recalculate every render, causing `TableNative` (wrapped in memo) to re-render unnecessarily.

## Changes Made

### Fix 1: Use refs for notifyChange dependencies in useSelectionState
**File**: `SyncfusionThemeStudio/src/components/ui/native/TableNative/hooks/useSelectionState.ts`

Introduced a `useLatestRefs` helper that stores `data`, `getKey`, and `onSelectionChange` in refs. The `notifyChange` callback reads from these refs instead of closure-captured values, ensuring it always has access to the latest `onSelectionChange` callback even after it transitions from `undefined` to a real function.

Key changes:
- Added `LatestRefs` interface and `useLatestRefs` helper function
- `notifyChange` now depends on stable ref objects `[callbackRef, dataRef, getKeyRef]` instead of values that change on every render

### Fix 2: Stabilize actionsTemplate memoization in InteractivePlaygroundSection
**File**: `SyncfusionThemeStudio/src/features/components/pages/NativeGridShowcase/sections/InteractivePlaygroundSection.tsx`

Destructured individual callback functions (`handleArchive`, `handleDelete`, `handleEdit`, `handleExport`, `handleView`) from the `actions` object. The `actionsTemplate` useCallback now depends on these individual stable functions instead of the entire `actions` object (which creates a new reference every render).

### New Tests
- **`useNativePlaygroundState.test.ts`** (5 tests): Selection state updates, stateEntries updates, clearing selection, removing single items, selectionConfig for Multiple+checkbox
- **`useTableSelection.test.ts`** (3 new tests): onSelectionChange with checkbox mode, paginated data subset, accumulated multiple selections

## Quality Verification Results
- TypeScript: 0 errors
- ESLint: 0 errors on all modified files
- Tests: 1213 passed across 76 test files (0 failures)
- Production build: Successful

## Success Criteria
- [x] All existing tests pass (1213 tests, 76 files)
- [x] New tests for the specific scenario pass (8 new tests)
- [x] TypeScript compiles clean
- [x] ESLint passes with no errors
- [x] Production build succeeds
- [ ] Visual verification: clicking a row updates "Selected Rows" count (requires browser testing)
- [ ] Visual verification: selection toolbar appears when rows are selected (requires browser testing)

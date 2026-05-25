# Fix 3 Remaining ESLint Issues

## Status: COMPLETED

## Problem Statement
Three ESLint issues remained in BaseClient that needed fixing:

1. **ERROR** `src/lib/notifications.ts` - `no-barrel-companion-file` - File shadows `notifications/index.ts`
2. **WARNING** `src/lib/http/methods.ts:184` - `complexity` 16 (max 15) in `get` function
3. **WARNING** `src/components/Users/useUserFormState.ts:77` - `react-compiler` skipped optimization due to disabled ESLint rules

## Changes Made

### Fix 1: notifications.ts barrel companion conflict
- Created `src/lib/notifications/eventBus.ts` with the 4 local functions (`addListener`, `notify`, `notifySignOut`, `notifySuccess`)
- Updated `src/lib/notifications/index.ts` to re-export from `./eventBus`
- Deleted `src/lib/notifications.ts` (the shadowing companion file)
- All 20+ existing imports from `../../lib/notifications` now resolve to `notifications/index.ts`

### Fix 2: methods.ts complexity (16 -> 15)
- Extracted `resolveQueryParams<Q>()` helper function that encapsulates the ternary `isValueDefined(queryParameters) ? buildQueryParams(...) : undefined`
- Moved the `@typescript-eslint/consistent-type-assertions` disable to the correct line in the helper
- `get` function now calls `resolveQueryParams(queryParameters)` instead of inline ternary

### Fix 3: useUserFormState.ts react-compiler
- Removed `// eslint-disable-next-line react-hooks/exhaustive-deps` comment
- Destructured `setters` and `initialValues` into individual variables at the top of `useUserFormState`
- Inlined the sync logic directly in the `useEffect` using primitive deps and stable `useState` setters
- Used `initialRolesString` (already a string) to derive roles inside the effect, avoiding unstable array references
- Removed unused `syncFormState` function and `SyncSetters` type

## Test Results
- ESLint: All 3 specific issues resolved (grep returns empty)
- TypeScript: No new errors in changed files (pre-existing const enum issues unrelated)
- Unit tests: 132 suites, 1746 tests all passing
- eventBus.ts: 100% coverage

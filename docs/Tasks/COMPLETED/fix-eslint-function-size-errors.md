# Fix ESLint Function Size Errors

## Status: COMPLETED

## Problem Statement
Several files have ESLint errors related to oversized functions that exceed the configured line limits. These need to be refactored to comply with code standards.

## Files Fixed

### Priority 1 - Unused Variable (FIXED)
- `src/components/DynamicForm/formStyles.ts` - DELETED (dead code, not imported anywhere)

### Priority 2 - httpClient Files (FIXED)
Created `src/server/createHttpClient.ts` with shared factory function:
- `src/server/httpClient.ts` - Refactored to use factory (110 lines -> 14 lines)
- `src/server/httpClientContent.ts` - Refactored to use factory (105 lines -> 20 lines)
- `src/server/httpClientIdentity.ts` - Refactored to use factory (105 lines -> 20 lines)
- `src/server/httpClientQuestioner.ts` - Refactored to use factory (105 lines -> 20 lines)

### Priority 3 - httpInterceptor.ts (FIXED)
- `src/lib/httpInterceptor.ts` - Refactored from 213 lines monolithic to modular:
  - Extracted `refreshAuthToken()` as standalone function
  - Extracted `performTokenRefresh()` for token refresh logic
  - Extracted `processTokenRefreshResponse()` for response handling
  - Extracted `handleSuccessResponse()` for success interceptor
  - Extracted `handleErrorResponse()` for error interceptor
  - `setupResponseInterceptor()` now just wires up the interceptors

### Priority 4 - forms.ts (FIXED)
- `src/theme/forms.ts` - Split into logical style groups:
  - `createContainerStyles()` - container, card, questionBlock styles
  - `createInputStyles()` - input, dropdown, picker styles
  - `createTextStyles()` - title, subtitle, help text styles
  - `createButtonStyles()` - nav button styles
  - `createCheckboxStyles()` - checkbox styles
  - `createRadioStyles()` - radio button styles
  - `createOptionStyles()` - option row styles
  - `createErrorStyles()` - error text and border styles
  - `useDynamicFormStyles()` now composes from helper functions (171 lines -> 119 lines)

### Priority 5 - AuthProvider.tsx (FIXED)
- `src/auth/AuthProvider.tsx` - Major refactoring:
  - Extracted `convertUserInfo()` outside component (was inside)
  - Extracted `clearClientAuthState()` helper function
  - Extracted `clearSessionStorage()` for session storage cleanup
  - Extracted `clearLocalStorage()` for local storage cleanup
  - Extracted `clearWebAuthStorage()` combining both
  - Extracted `scheduleLogoutCleanup()` for delayed cleanup
  - Extracted `useLogoutButtonEffect()` custom hook
  - Extracted `useTokenRefresh()` custom hook
  - `logout` function reduced from 69 lines to 18 lines
  - Component reduced from 212 lines to ~50 lines of actual component code

## Success Criteria
- [x] `npm run lint:fix` - Priority files fixed (66 remaining issues in other files)
- [x] `npm run test:coverage` - All 301 tests pass
- [x] `npx expo export --platform web` - Build succeeds

## Changes Made

### Files Created
- `src/server/createHttpClient.ts` - Shared HTTP client factory (110 lines)

### Files Modified
- `src/server/httpClient.ts` - Simplified to use factory
- `src/server/httpClientContent.ts` - Simplified to use factory
- `src/server/httpClientIdentity.ts` - Simplified to use factory
- `src/server/httpClientQuestioner.ts` - Simplified to use factory
- `src/lib/httpInterceptor.ts` - Refactored to modular functions
- `src/theme/forms.ts` - Split styles into helper functions
- `src/auth/AuthProvider.tsx` - Extracted helpers and custom hooks

### Files Deleted
- `src/components/DynamicForm/formStyles.ts` - Dead code (not imported anywhere)

## Test Results
```
Test Suites: 47 passed, 47 total
Tests:       301 passed, 301 total
Time:        7.064 s
```

## Notes
- The remaining 66 lint issues are in other files not part of this priority task
- AuthProvider.tsx still has a 34-line function (useTokenRefresh hook) which is a warning, not an error
- The file line count warnings remain but are not blocking errors

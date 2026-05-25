# API Versioning - Frontend Swagger Regen + E2E Path Updates

## Problem Statement
All 7 backend services now use `RoutePrefix = "api/v1"` with 308 redirect middleware. The frontend and E2E tests need to be verified and updated to use the new `/api/v1/` paths consistently.

## Analysis Summary

### Step 1: Swagger + Generated Hooks
**Status: Already up to date.**
- The swagger spec files in `BaseClient/src/server/swagger/` already contain `/api/v1/` paths
- Auto-generated hooks (via Orval) already reference `/api/v1/` paths (e.g., `/api/v1/auth/login`, `/api/v1/auth/methods`)
- No regeneration needed

### Step 2: Token Refresh URLs
**Status: Already up to date.**
- `httpInterceptor.ts` line 140: `${envConfig.IDENTITY_API_URL}/api/v1/auth/refresh` -- correct
- `tokenRefresh.ts` line 109: `${envConfig.IDENTITY_API_URL}/api/v1/auth/refresh` -- correct
- Both use `envConfig.IDENTITY_API_URL` (not `API_URL`), which is correct

### Step 3: E2E Test Path Updates
**Status: 2 files updated.**

1. `E2ETests/helpers/subscription-admin.ts`:
   - Updated `baseURL` from `/api` to `/api/v1`
   - Updated JSDoc comment from `/api/subscriptions` to `/api/v1/subscriptions`

2. `E2ETests/pages/UsersPage.ts`:
   - Updated regex from `/\/api\/users\b/` to `/\/api\/v1\/users\b/`

All other E2E files already used `/api/v1/` paths.

## Additional Pre-Existing Lint Fixes
While running the verification pipeline, fixed pre-existing lint errors:

1. **`useMenuTranslations.ts`**: Added missing return types to `useTranslateMutation`, `useDeleteMutation`, `useUpdateMutation` (3 `@typescript-eslint/explicit-function-return-type` errors)

2. **`MenuAnalyticsScreen.tsx`**: Extracted `AnalyticsBackButton` and `AnalyticsCharts` sub-components to reduce complexity from 18 to under 15 (`complexity` warning)

3. **`FullMenuEditor.tsx`**: Extracted `deriveEditorColors` utility and `EditorColors` interface to separate files to bring file length under 200 lines (`max-lines` error)

4. **`MenuContentEditor.tsx`**: Fixed `no-param-reassign` / `react-compiler/react-compiler` warning by using local variable assignment for `MutableRefObject.current` mutation

## Verification Results
- `frontend-lint` -- PASS
- `frontend-lint-fix` -- PASS
- `frontend-yagni` -- PASS
- `frontend-unit-tests` -- PASS
- `frontend-prod-build` -- PASS
- `e2e-lint` -- PASS

## Files Modified
- `E2ETests/helpers/subscription-admin.ts` -- `/api` -> `/api/v1` for PaymentService
- `E2ETests/pages/UsersPage.ts` -- regex update for users API URL match
- `BaseClient/src/components/OnlineMenus/TranslationManager/hooks/useMenuTranslations.ts` -- return types
- `BaseClient/src/components/Analytics/components/MenuAnalyticsScreen.tsx` -- complexity reduction
- `BaseClient/src/features/onlinemenus/components/FullMenuEditor.tsx` -- extracted utils, reduced lines
- `BaseClient/src/features/onlinemenus/components/utils/deriveEditorColors.ts` -- new file
- `BaseClient/src/features/onlinemenus/types.ts` -- added EditorColors interface
- `BaseClient/src/components/OnlineMenus/MenuContentEditor.tsx` -- param-reassign fix

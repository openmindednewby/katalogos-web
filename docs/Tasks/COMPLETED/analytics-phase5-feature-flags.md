# Analytics Phase 5 -- Feature Flags Hook + Analytics Client Extension

## Status: COMPLETED

## Problem Statement
PostHog supports feature flags natively via `posthog.isFeatureEnabled(key)` and `posthog.getFeatureFlag(key)`. We need to expose this through the analytics abstraction layer so components can check feature flags without coupling to PostHog directly.

## Changes Made

### 1. Extended AnalyticsClient interface (`types.ts`)
- Added `FeatureFlagValue` type alias: `boolean | string | undefined`
- Added optional `getFeatureFlag?: (key: string) => FeatureFlagValue` to the `AnalyticsClient` interface
- Existing clients (NoOpClient, DevClient, UmamiClient) unaffected since the method is optional

### 2. Implemented in PostHogClient (`utils/PostHogClient.ts`)
- Added `getFeatureFlag(key)` method delegating to `posthog.getFeatureFlag(key)`
- Nullish coalescing converts `null` from PostHog SDK to `undefined`

### 3. Implemented in MultiProviderClient (`utils/MultiProviderClient.ts`)
- Added `FeatureFlagProvider` interface and `supportsFeatureFlags` type guard
- Added `getFeatureFlag(key)` method that iterates providers, returning the first defined result
- Uses `typeof` checks for `boolean` and `string` to satisfy strict-boolean-expressions rule

### 4. Created useFeatureFlag hook (`hooks/useFeatureFlag.ts`)
- `useFeatureFlag(key)` -- returns `boolean`, `true` only when flag strictly equals `true`
- `useFeatureFlagValue(key)` -- returns raw `FeatureFlagValue` for multivariate flags
- Both return safe defaults when provider lacks feature flag support

### 5. Exported from barrel (`index.ts`)
- Exported `useFeatureFlag`, `useFeatureFlagValue`, and `FeatureFlagValue` type

### 6. Unit tests
- `hooks/useFeatureFlag.test.tsx` -- 10 tests covering both hooks (no client method, enabled, disabled, string variant, undefined)
- `utils/PostHogClient.test.ts` -- 4 new tests (delegate to SDK, string variant, undefined, null handling)
- `utils/MultiProviderClient.test.ts` -- 4 new tests (first defined result, no provider has flag, skips providers without method, continues on throw)

### Pre-existing fixes
- `components/Analytics/components/TopMenusList.tsx` -- moved `menuKeyExtractor` after the component as a function declaration to fix enforce-function-style warning
- `hooks/menuPageHandlers.testUtils.ts` -- converted `mockT` from const arrow to function declaration
- `hooks/menuHandlers/menuSaveHandlers.ts` -- added missing `TranslateFn` type alias to fix unresolved type errors

## Files Modified
- `src/lib/analytics/types.ts` -- added `FeatureFlagValue` type and optional `getFeatureFlag` method
- `src/lib/analytics/utils/PostHogClient.ts` -- added `getFeatureFlag` implementation
- `src/lib/analytics/utils/MultiProviderClient.ts` -- added type guard, interface, and `getFeatureFlag` implementation
- `src/lib/analytics/hooks/useFeatureFlag.ts` -- NEW: two hooks for feature flag access
- `src/lib/analytics/hooks/useFeatureFlag.test.tsx` -- NEW: 10 unit tests
- `src/lib/analytics/utils/PostHogClient.test.ts` -- 4 new tests
- `src/lib/analytics/utils/MultiProviderClient.test.ts` -- 4 new tests
- `src/lib/analytics/index.ts` -- barrel exports updated
- `src/components/Analytics/components/TopMenusList.tsx` -- pre-existing lint fix
- `src/hooks/menuPageHandlers.testUtils.ts` -- pre-existing lint fix
- `src/hooks/menuHandlers/menuSaveHandlers.ts` -- pre-existing type fix

## Verification Results (all via Tilt MCP)
- `frontend-lint-fix` -- PASSED (0 errors, 0 warnings)
- `frontend-yagni` -- PASSED (no unused exports)
- `frontend-unit-tests` -- PASSED (all tests pass)
- `frontend-prod-build` -- PASSED (build succeeds)

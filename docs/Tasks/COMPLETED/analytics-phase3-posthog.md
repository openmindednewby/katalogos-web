# Analytics Phase 3 -- PostHog Integration

## Problem Statement
The analytics system has an abstraction layer (Phase 1) and event instrumentation (Phase 2) complete. We need to add PostHog as a third analytics provider alongside the existing DevClient and UmamiClient.

## Implementation Summary

### Step 1: Extract shared sanitizer
- Created `src/lib/analytics/utils/sanitizeProperties.ts` with the `sanitizeProperties` function extracted from `UmamiClient.ts`
- Updated `UmamiClient.ts` to import from the shared file (removed inline function, removed unused `REDACTED_VALUE`/`SENSITIVE_PROPERTY_PATTERNS` imports)
- Created `src/lib/analytics/utils/sanitizeProperties.test.ts` with 8 test cases

### Step 2: Install PostHog
- Installed `posthog-js@1.362.0` (Apache 2.0 license)

### Step 3: Create PostHog Client
- Created `src/lib/analytics/utils/PostHogClient.ts` implementing `AnalyticsClient`
  - Constructor calls `posthog.init` with `capture_pageview: false`, `capture_pageleave: true`, `persistence: 'localStorage'`
  - `track` calls `posthog.capture` with sanitized properties
  - `identify` calls `posthog.identify` with sanitized traits
  - `page` calls `posthog.capture('$pageview', { $current_url: path })`
  - `reset` calls `posthog.reset()`
- Created `src/lib/analytics/utils/PostHogClient.test.ts` with 9 test cases

### Step 4: Wire into AnalyticsProvider
- Replaced `// PostHog: Phase 3` stub with actual PostHogClient initialization
- Gated on `ANALYTICS_POSTHOG_ENABLED && postHogKey !== '' && postHogHost !== ''`
- Added `jest.mock('posthog-js')` to AnalyticsProvider test
- Added 2 new tests: PostHog configured returns MultiProviderClient, PostHog disabled returns NoOpClient

### Step 5: Export from barrel
- Added `PostHogClient` and `sanitizeProperties` exports to `index.ts`

## Files Modified
- `src/lib/analytics/utils/UmamiClient.ts` -- removed inline sanitizeProperties, imports from shared file
- `src/lib/analytics/components/AnalyticsProvider.tsx` -- wired PostHogClient with env-based gating
- `src/lib/analytics/components/AnalyticsProvider.test.tsx` -- added posthog-js mock and PostHog tests
- `src/lib/analytics/index.ts` -- added PostHogClient and sanitizeProperties exports

## Files Created
- `src/lib/analytics/utils/sanitizeProperties.ts` -- shared sanitizer
- `src/lib/analytics/utils/sanitizeProperties.test.ts` -- 8 test cases
- `src/lib/analytics/utils/PostHogClient.ts` -- PostHog provider implementation
- `src/lib/analytics/utils/PostHogClient.test.ts` -- 9 test cases

## Verification Results
- [x] `frontend-lint-fix` -- PASSED
- [x] `frontend-yagni` -- PASSED
- [x] `frontend-unit-tests` -- PASSED
- [x] `frontend-prod-build` -- PASSED

## Success Criteria
- [x] sanitizeProperties extracted and shared between UmamiClient and PostHogClient
- [x] PostHogClient implements AnalyticsClient interface
- [x] PostHog wired into AnalyticsProvider with env-based gating
- [x] All unit tests pass
- [x] Lint passes
- [x] Build succeeds
- [x] No hardcoded strings (no user-facing text in this feature)

## Status: COMPLETED

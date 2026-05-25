# Analytics Integration — Umami + PostHog (Multi-Provider)

## Status: COMPLETED (Phase 1) — 2026-03-15

## Goal
Add a multi-provider analytics abstraction to the frontend with Umami as primary provider. PostHog support deferred to Phase 3 (no stub code — YAGNI).

## Phase 1 Scope
- [x] Create `src/lib/analytics/` module with multi-provider architecture
- [x] Implement DevClient, UmamiClient, NoOpClient, MultiProviderClient
- [x] Create hooks: useAnalytics, usePageTracking, useAnalyticsIdentify
- [x] Create AnalyticsProvider with consent gating
- [x] Add `analyticsEnabled` feature flag + env vars
- [x] Integrate into `_layout.tsx`
- [x] Unit tests for all hooks and clients

## Files Created
- `src/shared/enums/AnalyticsEventName.ts` — const enum for event names
- `src/lib/analytics/types.ts` — AnalyticsClient interface, EventProperties type
- `src/lib/analytics/constants.ts` — config defaults, sensitive key patterns
- `src/lib/analytics/utils/NoOpClient.ts` — silent no-op client
- `src/lib/analytics/utils/NoOpClient.test.ts` — NoOpClient unit tests
- `src/lib/analytics/utils/DevClient.ts` — console + LoggingService client
- `src/lib/analytics/utils/DevClient.test.ts` — DevClient unit tests
- `src/lib/analytics/utils/UmamiClient.ts` — Umami tracking API wrapper
- `src/lib/analytics/utils/UmamiClient.test.ts` — UmamiClient unit tests
- `src/lib/analytics/utils/MultiProviderClient.ts` — fan-out to all providers
- `src/lib/analytics/utils/MultiProviderClient.test.ts` — MultiProviderClient unit tests
- `src/lib/analytics/hooks/useAnalytics.ts` — primary hook
- `src/lib/analytics/hooks/useAnalytics.test.tsx` — useAnalytics unit tests
- `src/lib/analytics/hooks/usePageTracking.ts` — auto page-view tracking
- `src/lib/analytics/hooks/usePageTracking.test.tsx` — usePageTracking unit tests
- `src/lib/analytics/hooks/useAnalyticsIdentify.ts` — auto-identify on auth
- `src/lib/analytics/hooks/useAnalyticsIdentify.test.tsx` — useAnalyticsIdentify unit tests
- `src/lib/analytics/components/AnalyticsProvider.tsx` — React context + consent gating
- `src/lib/analytics/components/AnalyticsProvider.test.tsx` — AnalyticsProvider unit tests
- `src/lib/analytics/index.ts` — barrel exports

## Files Modified
- `src/config/environment.ts` — add analytics env vars
- `src/config/featureFlags.ts` — add `analyticsEnabled` flag
- `app/_layout.tsx` — wrap with AnalyticsProvider, add AnalyticsEffects component

## Verification Results (2026-03-15)

| Check | Result |
|-------|--------|
| `frontend-lint-fix` | PASS |
| `frontend-yagni` | PASS |
| `frontend-unit-tests-coverage` | PASS (204 suites, 2578 tests) |
| `frontend-prod-build` | PASS |
| Code review | PASS (7 issues found → all fixed → re-verified) |

### Analytics Module Coverage

| Module | Stmts | Branch | Funcs | Lines |
|--------|-------|--------|-------|-------|
| `lib/analytics/components` | 96.15% | 90% | 100% | 100% |
| `lib/analytics/hooks` | 88.88% | 78.57% | 100% | 93.75% |
| `lib/analytics/utils` | 94.28% | 75% | 100% | 93.93% |

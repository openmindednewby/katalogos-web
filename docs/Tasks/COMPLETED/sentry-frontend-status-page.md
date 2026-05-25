# Sentry Frontend + Status Page Component

## Status: COMPLETED

## Problem Statement
Two deliverables:
1. **Sentry Frontend Integration** - Already fully implemented before this task started.
2. **Status Page Component** - New UI component to visualize backend service health.

## Part 1: Sentry Integration - COMPLETE (Pre-existing)
All work was already done by a prior task:
- `@sentry/react` v10.44.0 installed in package.json
- `src/lib/monitoring/sentry.ts` - Full wrapper with init, captureException, captureMessage, setSentryUser, clearSentryUser
- `src/lib/monitoring/useSentryUser.ts` - Hook syncing Redux auth to Sentry user scope
- `src/lib/monitoring/index.ts` - Barrel exports
- `src/config/environment.ts` - SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE in all env blocks
- `app/_layout.tsx` - initSentry() called at top level, SentryEffects component renders useSentryUser
- `src/components/ErrorBoundary/ErrorBoundary.tsx` - captureException in componentDidCatch
- `src/lib/api/errors/errorReporter.ts` - captureException for monitoring-flagged errors
- `src/lib/monitoring/sentry.test.ts` - Full test coverage (7 tests)
- `src/lib/monitoring/useSentryUser.test.tsx` - Full test coverage (3 tests)

## Part 2: Status Page Component - COMPLETE

### Files Created
1. `src/shared/enums/ServiceHealthStatus.ts` - const enum: Healthy, Degraded, Down, Unknown
2. `src/shared/testIds/statusPageTestIds.ts` - 8 test IDs for StatusPage components
3. `src/components/StatusPage/types.ts` - ServiceConfig, ServiceHealthResult, OverallHealthState
4. `src/components/StatusPage/utils/statusHelpers.ts` - Pure helper functions (determineStatus, deriveOverallStatus, statusToLabelKey, statusToColor, etc.)
5. `src/components/StatusPage/hooks/useServiceHealth.ts` - React Query hook polling /health/ready every 30s with manual refresh
6. `src/components/StatusPage/components/ServiceHealthCard.tsx` - Individual service health card with status dot, name, response time, last checked
7. `src/components/StatusPage/index.tsx` - Main StatusPage with overall status banner, service cards, refresh button
8. `src/components/StatusPage/utils/statusHelpers.test.ts` - 17 tests covering all helper functions
9. `src/components/StatusPage/hooks/useServiceHealth.test.ts` - 7 tests covering checkServiceHealth and constants

### Files Modified
- `src/localization/locales/en.json` - Added `statusPage` section with 19 translation keys
- `src/shared/testIds.ts` - Added StatusPageTestIds import and spread

### Pre-existing Issues Fixed
- `src/components/OnlineMenus/TranslationManager/components/TranslationStatusRow.tsx` - Extracted inline color literals to constants
- `src/components/OnlineMenus/hooks/useBulkActions.ts` - Removed unnecessary `?? []` conditional
- `src/hooks/useBreadcrumbs.ts` - Extracted compound condition to named variable

### Quality Check Results
- **YAGNI**: PASSED - No unused exports
- **Unit Tests**: 27/27 StatusPage tests pass, 13/13 Sentry tests pass
- **Production Build**: PASSED
- **Lint**: 8 remaining issues, all pre-existing (systemic `@dloizides/utils` type resolution issue affecting `isValueDefined` calls across multiple files)

### Architecture Decisions
- Used Fetch API directly (not axios) for health checks because `/health/ready` endpoints don't require auth
- AbortController with 5s timeout prevents hanging connections
- 2s response time threshold to flag services as "degraded"
- `flatMap` pattern in StatusPage to avoid `isValueDefined` type resolution conflicts
- Theme colors from `useThemeColors()` for consistent dark/light mode support
- All switch statements exhaustively match all enum values

### Services Monitored
Identity (5002), Questioner (5004), OnlineMenu (5006), Content (5009), Notification (5015), Payment (5018)

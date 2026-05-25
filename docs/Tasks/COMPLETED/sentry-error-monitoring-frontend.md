# Sentry Error Monitoring - Frontend Integration

## Status: COMPLETED

## Problem Statement
The codebase had TODO stubs for Sentry in `errorReporter.ts` and no external error monitoring. Integrated Sentry (sentry.io free tier) for production error tracking with DSN-gated no-op behavior for dev/test.

## Changes Made

### New Files
- `src/lib/monitoring/sentry.ts` - Sentry SDK wrapper; all functions are no-ops when DSN is empty
- `src/lib/monitoring/useSentryUser.ts` - Hook syncing Redux auth state to Sentry user scope
- `src/lib/monitoring/index.ts` - Barrel export
- `src/lib/monitoring/sentry.test.ts` - 10 tests covering enabled/disabled paths
- `src/lib/monitoring/useSentryUser.test.tsx` - 3 tests covering user sync behavior

### Modified Files
- `src/config/environment.ts` - Added SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE to all 3 env blocks
- `app/_layout.tsx` - Added initSentry() call at module level + SentryEffects headless component
- `src/components/ErrorBoundary/ErrorBoundary.tsx` - Added captureException in componentDidCatch
- `src/lib/api/errors/errorReporter.ts` - Replaced TODO stub with captureException call

### Key Design Decisions
- Static import of `@sentry/react` (not dynamic) for simpler code and testability
- `sendDefaultPii: false` enforced (GDPR compliance)
- Only opaque GUIDs sent as user IDs, never emails/names
- `tracesSampleRate: 0` in all environments (Phase 1 -- no performance tracing)
- DSN empty string = all functions are no-ops, Sentry.init never called

## Verification Results
- Sentry unit tests: 13/13 pass (sentry.test.ts + useSentryUser.test.tsx)
- Production build: PASSED
- Lint: No errors in Sentry-related files (pre-existing errors in unrelated files remain)
- Pre-existing test failures (3 suites, 13 tests) are unrelated to Sentry changes

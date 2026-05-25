# Add Feature Flags for Theme Editor and Install Notification

## Status: COMPLETED

## Problem Statement
Need to add two new feature flags to the application:
1. `enableThemeEditor` - Enable/disable the theme editor section (showcase/native-forms route)
2. `enableInstallPrompt` - Enable/disable the Install Theme Studio PWA notification

## Root Cause Analysis
- Feature flags system in `featureFlags.ts` only had module-level flags (identity, questioner, onlinemenu)
- No granular feature-level flags existed for theme editor or install prompt
- The PWA install prompt was gated via raw `process.env` check instead of the feature flag system

## Implementation Plan
1. Add `enableThemeEditor` and `enableInstallPrompt` to `FeatureFlags` interface
2. Add `getEnvBoolean` union type entries for the new env keys
3. Add defaults to all environment configs
4. Gate the showcase route with `enableThemeEditor` flag via new `FeatureGate` component
5. Gate the PWA install prompts with `enableInstallPrompt` flag
6. Add unit tests for the new flags
7. Run verification suite

## Files Modified
- `BaseClient/src/config/featureFlags.ts` - Added enableThemeEditor and enableInstallPrompt flags
- `BaseClient/src/config/environment.ts` - Added defaults to dev (true), test (true), prod (false/true)
- `BaseClient/src/components/Shared/FeatureGate.tsx` - NEW: Reusable component to gate routes behind feature flags
- `BaseClient/app/(protected)/showcase/native-forms.tsx` - Wrapped with FeatureGate for enableThemeEditor
- `BaseClient/app/_layout.tsx` - Added enableInstallPrompt flag check for PWA install prompts
- `BaseClient/src/config/__tests__/featureFlags.test.ts` - NEW: Unit tests for flag defaults and env overrides

## Success Criteria
- [x] `enableThemeEditor` flag exists with correct defaults (true in dev/test, false in prod)
- [x] `enableInstallPrompt` flag exists with correct defaults (true in all environments)
- [x] Showcase route is gated behind `enableThemeEditor` via FeatureGate component
- [x] PWA install prompt is gated behind `enableInstallPrompt` feature flag
- [x] Unit tests cover flag defaults and env var override behavior (8 tests)
- [x] `npm run lint:fix` passes with no new errors
- [x] `npm run yagni` - no new unused exports
- [x] `npm run test:coverage` - all 1384 tests pass (113 suites)
- [x] `npx expo export --platform web` - build succeeds

## Test Results
- Linting: 0 new errors (1 pre-existing error in MobileSidebarCollapsed.tsx, 34 pre-existing warnings)
- Unit Tests: 113 suites, 1384 tests all passing
- Build: Success (1350 modules bundled in ~21s)
- YAGNI: No new unused exports

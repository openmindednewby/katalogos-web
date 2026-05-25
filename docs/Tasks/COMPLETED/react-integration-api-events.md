# React Integration for API Events (Task 4)

## Status: COMPLETED

## Problem Statement
The HTTP interceptor system (Tasks 1-3) emits events via `apiEventBus` but there was no React
layer to consume them. We needed hooks, a provider, a modal component, and an enhanced query
client so that toast notifications, error modals, session-expired flows, and maintenance-mode
UIs are handled automatically from interceptor-level events.

## Implementation Plan
1. Create `useApiEvents` hook that subscribes to `apiEventBus` and dispatches UI side-effects.
2. Create `ApiEventsProvider` that mounts the hook and renders the `ApiErrorModal`.
3. Create `ApiErrorModal` component to display modal-type API error events.
4. Enhance `queryClient.ts` with smart retry logic and cache-level error handlers.
5. Add localization keys for error messages to `en.json`.
6. Write unit tests for the hook logic, provider, and query client enhancements.

## Files Created
- `src/lib/api/events/useApiEvents.ts` (114 lines) - Hook that subscribes to apiEventBus
- `src/lib/api/events/ApiEventsProvider.tsx` (38 lines) - Provider wrapping children + modal
- `src/components/feedback/ApiErrorModal.tsx` (157 lines) - Modal for API error display
- `src/lib/api/events/__tests__/useApiEvents.test.ts` - Unit tests for hook
- `src/components/feedback/__tests__/ApiErrorModal.test.tsx` - Unit tests for modal

## Files Modified
- `src/lib/queryClient.ts` (221 lines) - Added smart retry, QueryCache/MutationCache error handlers
- `src/localization/locales/en.json` - Added 13 error message keys
- `src/lib/api/events/index.ts` - Re-exports useApiEvents, ApiEventsProvider
- `src/lib/api/index.ts` - Re-exports useApiEvents, ApiEventsProvider, UseApiEventsResult
- `src/shared/testIds/commonTestIds.ts` - Added 5 API error modal test IDs
- `src/lib/__tests__/queryClient.test.ts` - Updated with smart retry tests

## Success Criteria
- [x] useApiEvents hook subscribes/unsubscribes correctly
- [x] ApiEventsProvider renders children and mounts hook
- [x] ApiErrorModal displays different modal types (ErrorModal, MaintenanceModal, UpgradePrompt, FeatureGateModal)
- [x] queryClient has smart retry (no retry on 4xx, retry once on 5xx/network)
- [x] Localization keys added (13 new error message keys)
- [x] All files under 200 lines (components), under 300 lines (files)
- [x] Lint passes (npm run lint:fix - 0 errors)
- [x] Unit tests pass (1742/1742 pass, 132 suites)
- [x] Build succeeds (npx expo export --platform web)
- [x] YAGNI check - no new unused exports

## Test Results
- **Lint**: 0 errors, 0 warnings on all new/modified files
- **Unit Tests**: 132 suites, 1742 tests all passing
  - 6 new tests in useApiEvents.test.ts
  - 6 new tests in ApiErrorModal.test.tsx
  - 14 tests in queryClient.test.ts (3 existing + 11 new for shouldRetryQuery)
- **Build**: Success (web export)
- **YAGNI**: No new unused exports introduced

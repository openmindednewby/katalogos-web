# Wire Up ApiEventsProvider and Switch to New Interceptors

## Status: COMPLETED

## Problem Statement
The new modular HTTP interceptor system at `src/lib/api/` is fully implemented but not wired up.
The app still uses the old interceptors registered in `src/lib/axios.ts`:
- Old request interceptor (lines 57-62) that manually builds headers and attaches auth tokens
- Old response interceptor via `setupResponseInterceptor(apiClient)` from `httpInterceptor.ts`

We need to:
1. Mount `<ApiEventsProvider>` in the component tree so the event bus drives UI side-effects
2. Switch `src/lib/axios.ts` to use `registerInterceptors()` from the new system
3. Preserve backward compatibility for `deffHttp` and `RequestOptions`

## Root Cause Analysis
Not a bug fix - this is a planned migration step completing the interceptor architecture.

## Implementation Plan

### Step 1: Modify `src/lib/axios.ts`
- Remove the old request interceptor block (lines 57-62)
- Remove the `setupResponseInterceptor(apiClient)` call (line 65)
- Remove the import of `setupResponseInterceptor` from `./httpInterceptor`
- Remove the import of `reduxStore` (no longer needed here for auth header)
- Remove the `buildHeaders` and `isHeaderRecord` helper functions (no longer needed)
- Add import of `registerInterceptors` from `./api/interceptors`
- Call `registerInterceptors(apiClient)` once at module level
- Keep `deffHttp`, `RequestOptions`, and the `request()` function
- The `_reqOptions` pattern needs adaptation: the new auth interceptor uses `_withToken` flag directly on config, so the `request()` function must map `options.withToken` to `cfg._withToken`

### Step 2: Mount `<ApiEventsProvider>` in `app/_layout.tsx`
- Import `ApiEventsProvider` from `src/lib/api/events/ApiEventsProvider`
- Place it inside `<AuthProvider>` wrapping the content (so it has Redux + navigation access)
- It should wrap the main content area

### Step 3: Update tests in `src/lib/__tests__/axios.test.ts`
- Tests currently mock `../httpInterceptor` - need to mock `../api/interceptors` instead
- Tests verify old request interceptor behavior - update to verify new interceptor registration

## Files to Modify
1. `BaseClient/src/lib/axios.ts` - Switch interceptors
2. `BaseClient/app/_layout.tsx` - Mount ApiEventsProvider
3. `BaseClient/src/lib/__tests__/axios.test.ts` - Update tests

## Success Criteria
- [x] `registerInterceptors(apiClient)` called once at module level in axios.ts
- [x] Old request interceptor and `setupResponseInterceptor` removed from axios.ts
- [x] `ApiEventsProvider` mounted in component tree inside Router + Redux Provider
- [x] `deffHttp` backward compatibility preserved
- [x] `npm run lint:fix` passes
- [x] `npm run test:coverage` passes
- [x] `npx expo export --platform web` succeeds

## Changes Made

### 1. `BaseClient/src/lib/axios.ts`
- Removed old imports: `setupResponseInterceptor` from `./httpInterceptor`, `reduxStore` and `RootState` from store, `isValueDefined` from utils, `InternalAxiosRequestConfig` from axios
- Removed helper functions: `isHeaderRecord()`, `buildHeaders()` (no longer needed since new auth interceptor handles token attachment)
- Removed old request interceptor block (`apiClient.interceptors.request.use(...)`) that manually built headers
- Removed `setupResponseInterceptor(apiClient)` call
- Added import of `registerInterceptors` from `./api/interceptors`
- Added `registerInterceptors(apiClient)` call at module level (runs once on import)
- Updated `request()` function to map legacy `RequestOptions` to the new interceptor system:
  - `options.withToken` maps to `cfg._withToken` (consumed by new `authInterceptor.ts`)
  - `options.withCredentials` maps to `cfg.withCredentials` (standard axios config)
  - `options.headers` merged onto `cfg.headers`
  - `options.signal` forwarded to `cfg.signal`
- Removed the `_reqOptions` pattern (no longer needed since options are mapped directly onto config properties)

### 2. `BaseClient/app/_layout.tsx`
- Added import of `ApiEventsProvider` from `src/lib/api/events/ApiEventsProvider`
- Wrapped content inside `<AuthProvider>` with `<ApiEventsProvider>`:
  - Placement: `Provider store={reduxStore}` > `QueryClientProvider` > `AuthProvider` > **`ApiEventsProvider`** > `Suspense` > content
  - This gives ApiEventsProvider access to Redux dispatch (for session-expired handling) and navigation context

### 3. `BaseClient/src/lib/__tests__/axios.test.ts`
- Rewrote all tests to mock `../api/interceptors` instead of `../httpInterceptor`
- New test: "calls registerInterceptors once at module load time" - verifies interceptors registered exactly once
- New test: "passes _withToken true by default on the config" - verifies default auth behavior
- New test: "passes _withToken false when withToken option is false" - verifies opt-out
- New test: "merges custom headers from options onto the config" - verifies header forwarding
- New test: "passes withCredentials false when option is false" - verifies credentials opt-out
- New test: "forwards signal from options to the config" - verifies abort signal forwarding

## Test Results
- `npm run lint:fix`: PASS (zero errors)
- `npm run test:coverage`: PASS (1746 tests, 132 suites, 0 failures)
- `npx expo export --platform web`: PASS (bundle built successfully)
- `npm run yagni`: No new unused exports introduced

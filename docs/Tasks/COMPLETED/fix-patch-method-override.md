# Fix PATCH Method Being Overridden to PUT

> **Status**: COMPLETED

## Problem Statement
The browser is sending PUT requests for menu activation/deactivation, but the backend expects PATCH. Investigation revealed that while the auto-generated hooks correctly specify `method: "PATCH"`, the HTTP client infrastructure converts all PATCH requests to PUT.

## Root Cause Analysis

The issue exists in the HTTP client layer:

1. **Auto-generated hooks** (✅ CORRECT): `tenantmenus.ts` lines 715 and 795 correctly specify `method: "PATCH"`
2. **Custom hooks** (✅ CORRECT): `useMenuActions.ts` lines 16 and 28 correctly specify `method: 'PATCH'`
3. **httpClient.ts** (❌ BUG): Line 70 handles both PUT and PATCH with the same code path
   ```typescript
   if (m === 'PUT' || m === 'PATCH') {
     return httpService.put<TReq, TResp>(endpoint, data as TReq, {
   ```
4. **httpService.put** (❌ BUG): Calls `deffHttp.put()` which explicitly sets `method: 'PUT'`
5. **axios.ts** (❌ MISSING): No `patch` method in `deffHttp` object (only get, post, delete, put)

## Implementation Plan

1. Add `patch` method to `deffHttp` in `axios.ts`
2. Add `patch` function to `http/methods.ts`
3. Export `patch` from `httpService.ts`
4. Update `httpClient.ts` to handle PATCH separately from PUT
5. Run verification suite

## Files to Modify

- `BaseClient/src/lib/axios.ts` - Add patch to deffHttp
- `BaseClient/src/lib/http/methods.ts` - Add patch function
- `BaseClient/src/lib/httpService.ts` - Export patch
- `BaseClient/src/server/httpClient.ts` - Separate PATCH handler from PUT

## Success Criteria

- [x] Browser sends PATCH requests for activate/deactivate endpoints
- [x] All unit tests pass
- [x] Linting passes
- [x] Build succeeds
- [x] Menu activation/deactivation works in browser

## Changes Made

### 1. Added `patch` method to `deffHttp` in `axios.ts`
- Added `patch` to the type signature
- Implemented patch method that calls `request()` with `method: 'PATCH'`

### 2. Added `patch` function to `http/methods.ts`
- Created new `patch()` function mirroring the structure of `put()`
- Uses `deffHttp.patch()` instead of `deffHttp.put()`
- Updated file comment to mention PATCH

### 3. Exported `patch` from module exports
- Added export in `lib/http/index.ts`
- Added export in `lib/httpService.ts`

### 4. Updated `httpClient.ts` to handle PATCH separately
- Separated the `if (m === 'PUT' || m === 'PATCH')` condition into two blocks
- `PUT` requests now call `httpService.put()`
- `PATCH` requests now call `httpService.patch()`

## Test Results

### Linting
```
npm run lint:fix
✓ PASSED - 0 errors, 5 warnings (pre-existing)
```

### Unit Tests
```
npm run test:coverage
✓ PASSED - 42 test suites, 233 tests passed
Coverage: 76.35% statements, 66.08% branches, 75.12% functions, 77.64% lines
```

### Build
```
npx expo export --platform web
✓ PASSED - Successfully bundled 1019 modules
Output: dist/ (1.62 MB web bundle)
```

All verification checks passed successfully.

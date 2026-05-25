# Offline PWA Support for Public Menu Viewer

## Status: COMPLETED

## Problem Statement
Customers viewing public menus on spotty restaurant WiFi lose access when connectivity drops. The public menu should work offline using PWA service worker caching.

## Implementation Summary

### 1. Service Worker Enhancement (`public/service-worker.js`)
- Replaced placeholder fetch handler with full caching strategies
- **Stale-while-revalidate** for public menu API responses (`/public/menus/`)
  - Returns cached response immediately if fresh (< 24h)
  - Fetches fresh data in background to update cache
  - Falls back to stale cache when network fails
- **Cache-first** for static assets (JS, CSS, PNG, JPG, SVG, fonts, ICO)
- Admin/protected API calls are NEVER cached (explicit exclusion)
- Cache versioning (`public-menu-api-v1`, `static-assets-v1`) with automatic cleanup of old caches on activation
- Timestamps stored via `sw-cached-at` header for freshness checks

### 2. useOnlineStatus Hook (`src/hooks/useOnlineStatus.ts`)
- Tracks `navigator.onLine` + window `online`/`offline` events
- Returns `{ isOnline, isOffline }` tuple
- Web-only: always reports `isOnline: true` on native platforms
- Properly cleans up event listeners on unmount

### 3. OfflineBanner Component (`src/components/PublicMenu/components/OfflineBanner.tsx`)
- Subtle amber banner: "You're viewing a cached version of this menu"
- Web-only rendering (returns null on native)
- Dismissable with X button
- Uses `FM()` for all text, `CommonTestIds` for testIDs
- Proper accessibility: `accessibilityRole="alert"`, `accessibilityLabel`, `accessibilityHint`
- All color literals extracted to constants

### 4. Cache Manager (`src/lib/pwa/menuCacheManager.ts`)
- `clearMenuCache()` — clears public menu API cache
- `clearAllCaches()` — clears all managed caches
- `getManagedCacheNames()` — returns list of managed cache names
- Safe: returns false when Cache API unavailable

### 5. Public Menu Page Integration (`app/public/menu/[id].tsx`)
- Added `useOnlineStatus` hook call
- Passes `isOffline` to `MenuDisplay` component
- Renders `OfflineBanner` when offline, above the menu content

### 6. Translation Keys (`src/localization/locales/en.json`)
- `pwa.offlineBanner`: "You're viewing a cached version of this menu"
- `pwa.offlineBannerHint`: "Menu data may not reflect the latest changes"
- `pwa.offlineDismissHint`: "Dismiss the offline notification"

### 7. Test IDs (`src/shared/testIds/commonTestIds.ts`)
- `OFFLINE_BANNER`: 'offline-banner'
- `OFFLINE_BANNER_DISMISS`: 'offline-banner-dismiss'

## Pre-existing Issues Fixed
- `KeyboardShortcutsModal.tsx`: Added explicit type annotation for `primary` to fix `@typescript-eslint/no-unsafe-assignment`
- `keyboardShortcutData.ts`: Added JSDoc comments to functions (resolved `smart-max-lines` warning)
- `useKeyboardShortcuts.ts`: Extracted compound condition into named variable (resolved `no-restricted-syntax`)
- `useKeyboardShortcuts.ts`: Fixed `isTextInputFocused` to check `contentEditable` property for JSDOM compatibility

## Files Created
- `src/hooks/useOnlineStatus.ts`
- `src/hooks/useOnlineStatus.test.ts` (8 tests)
- `src/components/PublicMenu/components/OfflineBanner.tsx`
- `src/lib/pwa/menuCacheManager.ts`
- `src/lib/pwa/menuCacheManager.test.ts` (10 tests)

## Files Modified
- `public/service-worker.js` — Full caching strategies
- `app/public/menu/[id].tsx` — Offline banner integration
- `src/localization/locales/en.json` — Translation keys
- `src/shared/testIds/commonTestIds.ts` — Test IDs
- `src/components/KeyboardShortcuts/KeyboardShortcutsModal.tsx` — Pre-existing lint fix
- `src/components/KeyboardShortcuts/keyboardShortcutData.ts` — Pre-existing lint fix
- `src/hooks/useKeyboardShortcuts.ts` — Pre-existing lint + test fix

## Verification Results
- [x] `frontend-lint-fix` — PASSED
- [x] `frontend-yagni` — PASSED
- [x] `frontend-unit-tests` — PASSED (281 suites, 3574 tests)
- [x] `frontend-prod-build` — PASSED

# Multi-Language Public Menu Viewer

## Status: COMPLETED

## Problem Statement

The public menu viewer page needed to support multiple languages. The AI translation backend was already done -- the `GET /api/v1/public/menus/{id}` endpoint accepts a `?lang=` query parameter and returns `availableLanguages` in the response.

## What Was Done

### 1. Updated `usePublicMenuGetById` hook
- Added optional `lang` parameter to the hook, fetch function, and query key
- When `lang` is a non-empty string, `?lang=xx` is appended to the API request
- Query key includes the language code so React Query refetches when language changes
- Added `hasLanguage()` type guard for clean null/empty checks
- File: `src/server/customHooks/usePublicMenuGetById.ts`

### 2. Enhanced `usePublicMenuLanguage` hook
- Added URL query parameter persistence via `getUrlLanguageParam()` and `setUrlLanguageParam()`
- Added RTL language detection via `isRtlLanguage()` (supports Arabic, Hebrew, Farsi, Urdu)
- Added `resolveLanguage()` function with priority: URL param > browser language > empty
- Uses `useEffect` to auto-select language when `availableLanguages` arrives from API
- Tracks manual selection via `useRef` to prevent auto-reset after user choice
- Returns `isRtl` boolean for RTL text direction support
- File: `src/components/PublicMenu/hooks/usePublicMenuLanguage.ts`

### 3. Integrated into `PublicMenuViewerPage`
- Extracted `MenuDisplay` sub-component to reduce complexity
- Two queries: initial query for `availableLanguages`, translated query with selected language
- `usePublicMenuLanguage` hook wired to available languages from API response
- Language switcher shown when `availableLanguages.length >= 2`
- `getLanguageName()` from TranslationManager used for display names
- RTL direction applied via container `direction` style
- Translation loading overlay shown during language switch (using `isFetching && !isLoading`)
- File: `app/public/menu/[id].tsx`

### 4. Translation keys
- Added `translations.loadingTranslation` key to `src/localization/locales/en.json`
- All existing translation keys (`translations.languageSwitcher`, etc.) were already present

### 5. Unit tests
- Extended `usePublicMenuLanguage.test.ts` with tests for:
  - `isRtlLanguage` utility (Arabic, Hebrew, Farsi, Urdu = true; English, Spanish, etc. = false)
  - `resolveLanguage` utility (URL param priority, browser fallback, empty fallback)
  - `getUrlLanguageParam` / `setUrlLanguageParam` URL persistence
  - Hook initialization from empty `availableLanguages` then resolving when data arrives
  - Manual selection persists through re-renders
  - URL param preferred over browser language
  - RTL detection through the hook
- File: `src/components/PublicMenu/hooks/usePublicMenuLanguage.test.ts`

### 6. Pre-existing fixes
- Fixed `useMenuActions.test.tsx` - URLs updated from `/TenantMenus/...` to `/api/v1/TenantMenus/...`
- Fixed `useMenuFilter.ts` - extracted `toggleInArray` helper, replaced `isValueDefined` with explicit null check
- Fixed `useItemDetailModal.ts` - added `isItemSelected` type guard with eslint-disable for external package resolution
- Fixed `itemDetailModalStyles.ts` - moved constants before functions, re-exported group styles from `itemDetailGroupStyles.ts`, compacted to under 200 lines

## Files Modified

| File | Change |
|------|--------|
| `src/server/customHooks/usePublicMenuGetById.ts` | Added `lang` parameter support |
| `src/components/PublicMenu/hooks/usePublicMenuLanguage.ts` | URL persistence, RTL detection, effect-based initialization |
| `src/components/PublicMenu/hooks/usePublicMenuLanguage.test.ts` | Comprehensive tests for new functionality |
| `app/public/menu/[id].tsx` | Language switching integration, MenuDisplay extraction |
| `src/localization/locales/en.json` | Added `translations.loadingTranslation` |
| `src/hooks/useMenuActions.test.tsx` | Fixed API URL prefix (pre-existing) |
| `src/components/PublicMenu/hooks/useMenuFilter.ts` | Extracted helper, fixed lint (pre-existing) |
| `src/components/PublicMenu/hooks/useItemDetailModal.ts` | Added type guard (pre-existing) |
| `src/components/PublicMenu/utils/itemDetailModalStyles.ts` | Compacted, moved constants (pre-existing) |
| `src/components/PublicMenu/utils/itemDetailGroupStyles.ts` | Already existed, now properly re-exported |

## Verification Results

- `frontend-lint-fix`: PASSED
- `frontend-unit-tests`: PASSED (3521 tests, 0 failures)

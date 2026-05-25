# Self-Hosted SEO & Structured Data for Public Menus

## Status: COMPLETED

## Problem Statement
Public menu pages lacked structured data for search engine discoverability. We needed JSON-LD structured data (schema.org), meta tags, and proper SEO integration so menus are discoverable by all search engines.

## Implementation Summary

### Files Created
1. **`BaseClient/src/components/PublicMenu/utils/menuStructuredData.ts`** - Pure function generating schema.org JSON-LD (Restaurant > Menu > MenuSection > MenuItem hierarchy). Handles missing data gracefully: skips nameless categories and items, omits empty descriptions, formats prices to 2 decimals.

2. **`BaseClient/src/components/PublicMenu/utils/menuMetaTags.ts`** - Pure function generating meta tag data (title, description, OG tags). Truncates descriptions to 160 chars. Uses FM() for title formatting and default description.

3. **`BaseClient/src/components/PublicMenu/components/SeoHead.tsx`** - Component using expo-router/head to inject meta tags and a useEffect hook to inject JSON-LD script into document.head on web. Guarded by Platform.OS check for native.

4. **`BaseClient/src/components/PublicMenu/utils/menuStructuredData.test.ts`** - 17 unit tests covering all fields, missing data, empty categories/items, price formatting, currency, serialization.

5. **`BaseClient/src/components/PublicMenu/utils/menuMetaTags.test.ts`** - 13 unit tests covering title building, description truncation, defaults, OG tags.

### Files Modified
1. **`BaseClient/src/localization/locales/en.json`** - Added `seo` section with `menuTitleFormat`, `menuTitleFallback`, `defaultDescription`, `embedTitleFormat`.

2. **`BaseClient/app/public/menu/[id].tsx`** - Integrated SeoHead component after menu data loads. Constructs publicUrl from base URL + menu ID.

3. **`BaseClient/app/public/menu/embed/[id].tsx`** - Added minimal Head with title (via FM) and noindex/nofollow robots tag for embedded iframes.

4. **`BaseClient/src/components/PublicMenu/index.ts`** - Exported SeoHead, generateMenuJsonLd, generateMenuMetaTags.

### Existing Assets (No Changes Needed)
- `BaseClient/public/robots.txt` - Already allows `/public/menu/` and points to sitemap.
- `BaseClient/public/sitemap.xml` - Static sitemap exists. Dynamic sitemap deferred until a "list all public menus" endpoint is available.

## Quality Gate Results
- [x] `frontend-lint-fix` - PASSED (0 errors, only pre-existing warnings)
- [x] `frontend-yagni` - PASSED (no unused exports)
- [x] `frontend-unit-tests` - PASSED (all tests pass)
- [x] `frontend-prod-build` - PASSED (build succeeds)

## Translation Checklist
- [x] All strings use FM() (seo.menuTitleFormat, seo.defaultDescription, seo.embedTitleFormat)
- [x] Keys added to en.json (not en/ subdirectory)
- [x] No hardcoded user-facing text

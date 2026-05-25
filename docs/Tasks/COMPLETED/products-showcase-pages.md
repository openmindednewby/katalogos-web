# Products Showcase Pages

## Problem Statement
Implement two Products showcase pages for E2E tests at routes:
- `/dashboard/products/native` - Native HTML table products page
- `/dashboard/products/syncfusion` - Syncfusion-style grid products page

## Implementation Summary

### Files Created
1. `app/(protected)/dashboard/_layout.tsx` - Stack layout for dashboard routes
2. `app/(protected)/dashboard/products/_layout.tsx` - Stack layout for products routes
3. `app/(protected)/dashboard/products/native.tsx` - Route file, feature-gated
4. `app/(protected)/dashboard/products/syncfusion.tsx` - Route file, feature-gated
5. `src/features/showcase/hooks/useProducts.ts` - Fetch hook for dummyjson products API
6. `src/features/showcase/hooks/__tests__/useProducts.test.ts` - Unit tests (5 tests)
7. `src/features/showcase/pages/NativeProductsPage/index.tsx` - Native HTML table page
8. `src/features/showcase/pages/SyncfusionProductsPage/index.tsx` - Syncfusion-style grid page

### Files Modified
1. `src/shared/testIds/stylingTestIds.ts` - Added 5 STUDIO_ product test IDs

### Test IDs Added
- `STUDIO_NATIVE_PRODUCTS_PAGE` -> `native-products-page`
- `STUDIO_NATIVE_PRODUCTS_GRID` -> `native-products-grid`
- `STUDIO_PRODUCTS_GRID` -> `products-grid`
- `STUDIO_PRODUCTS_CATEGORY_FILTER` -> `products-category-filter`
- `STUDIO_BTN_RETRY` -> `btn-retry`

### Design Decisions
- No Vite proxy exists in BaseClient (it's Expo/Metro), so hook fetches directly from `https://dummyjson.com/products`
- Web-only pages use eslint-disable for react-native/no-raw-text, no-inline-styles, i18n literal strings
- Syncfusion page uses regular HTML table with `className="e-grid"` and `className="e-row"` (no actual Syncfusion dependency)
- filterProducts extracted as a pure function outside the component

## Verification Results
- [x] ESLint: 0 errors, 0 warnings
- [x] YAGNI: No unused exports from new files
- [x] Unit tests: 5/5 pass (useProducts hook)
- [x] Build: `npx expo export --platform web` succeeds
- [x] Files under 200 lines (NativePage: 110, SyncfusionPage: 111, Hook: 79, Test: 101)

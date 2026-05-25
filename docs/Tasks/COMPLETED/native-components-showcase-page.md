# Native Components Showcase Page

## Status: COMPLETED

## Problem Statement
Create a Native Components showcase page at route `/dashboard/components/native` that displays checkbox inputs in various states (checked, unchecked, disabled, indeterminate). This page is used by E2E tests to verify native HTML checkbox behavior, including a Bug 1 fix where the indeterminate checkbox needs `readOnly` to prevent React warnings about controlled components without onChange handlers.

## Implementation Plan
1. Add native component test IDs to `BaseClient/src/shared/testIds/stylingTestIds.ts`
2. Create the page component at `src/features/showcase/pages/NativeComponentsPage/index.tsx`
3. Create the route file at `app/(protected)/dashboard/components/native.tsx`
4. Create `_layout.tsx` for `dashboard/components/` directory (dashboard/ already had one)

## Files Created/Modified
- `BaseClient/src/shared/testIds/stylingTestIds.ts` - Added NATIVE_COMPONENTS_PAGE and NATIVE_CHECKBOX_* test IDs
- `BaseClient/src/features/showcase/pages/NativeComponentsPage/index.tsx` - Page component (NEW, 82 lines)
- `BaseClient/app/(protected)/dashboard/components/native.tsx` - Route file (NEW, 17 lines)
- `BaseClient/app/(protected)/dashboard/components/_layout.tsx` - Layout for components routes (NEW, 13 lines)
- `BaseClient/src/config/routePreloader.ts` - Added preload imports for all 3 dashboard routes

## Verification Results
- [x] `npm run lint:fix` - All new/modified files pass with no errors
- [x] `npm run yagni` - No new unused exports
- [x] `npm run test:coverage` - All 150 suites, 1864 tests pass
- [x] `npx expo export --platform web` - Build succeeds, new bundle created

## Design Decisions
- Test IDs are placed on `<label>` elements wrapping the `<input>` checkboxes. E2E tests use `.locator('input[type="checkbox"]')` within the testId element to find the actual input.
- The "checked" checkbox uses `useState(false)` with `onChange` handler (controlled component).
- The "unchecked" checkbox is uncontrolled (no state binding).
- The "indeterminate" checkbox uses `checked readOnly` to prevent React's controlled-without-onChange warning (Bug 1 fix).
- The "disabled" checkbox uses the `disabled` attribute.
- All user-facing text uses `t()` i18n function with fallback strings.
- Route is gated behind `enableThemeEditor` feature flag, matching the existing NativeFormsPage pattern.

# Theme Settings Drawer Component

## Status: COMPLETED

## Problem Statement
E2E tests in `E2ETests/tests/showcase/theme-preset-cards.spec.ts` and `layout-full-width.spec.ts` expect a Theme Settings Drawer component on showcase pages. This drawer supports preset theme cards and a layout full-width toggle.

## Files Created
1. **`src/shared/testIds/showcaseTestIds.ts`** - TestIds for STUDIO_THEME_* and STUDIO_LAYOUT_* constants
2. **`src/features/showcase/components/ThemeSettingsDrawer/index.tsx`** - Main drawer component (184 lines)
3. **`src/features/showcase/components/ThemeSettingsDrawer/presets.ts`** - Theme preset data definitions
4. **`src/features/showcase/components/ThemeSettingsDrawer/styles.ts`** - CSS styles injected into document head
5. **`src/features/showcase/components/ShowcaseLayout/index.tsx`** - Layout wrapper with `#main-content` and `.max-w-content`
6. **`src/features/showcase/components/ShowcaseLayout/styles.ts`** - CSS for layout container classes

## Files Modified
1. **`src/shared/testIds.ts`** - Added `ShowcaseTestIds` import and spread
2. **`app/(protected)/showcase/native-forms.tsx`** - Wrapped NativeFormsPage with ShowcaseLayout

## Key Design Decisions
- Index-based keys for color swatches (intentional for Bug 2 fix, eslint-disable applied)
- CSS injected via style elements (matching existing pattern from NativeFormsPage)
- `--content-max-width` CSS variable set on document root for layout toggle
- Sub-components defined before main component to satisfy no-use-before-define rule
- Web-only component: eslint-disable for react-native/no-raw-text

## Verification Results
- [x] ESLint: 0 errors, 0 warnings
- [x] TypeScript: No errors in new files
- [x] Unit tests: 150 suites passed, 1864 tests passed
- [x] YAGNI: No unused exports
- [x] Build: `npx expo export --platform web` succeeded

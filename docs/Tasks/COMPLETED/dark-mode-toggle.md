# Dark Mode Toggle - Phase 1.5 P2 Polish

## Status: COMPLETED

## Problem Statement
The admin panel needed a quick toggle in the sidebar to switch between light, dark, and system (OS preference) modes, with preference persistence across sessions via localStorage.

## Implementation Summary

### Files Created
1. **`src/shared/enums/DarkModePreference.ts`** - `const enum` with Light/Dark/System values
2. **`src/theme/hooks/useDarkMode.ts`** - Hook managing preference (localStorage persistence), OS `prefers-color-scheme` detection via media query listener, and resolving effective ThemeMode
3. **`src/theme/hooks/useDarkMode.test.ts`** - 13 unit tests covering pure functions, hook state, persistence, and OS change response
4. **`src/components/Sidebar/DarkModeToggle.tsx`** - Segmented button control (Light/Dark/System) with icons (sun/moon/monitor)
5. **`src/components/Sidebar/MobileDarkModeButton.tsx`** - Icon-only cycling toggle for collapsed mobile sidebar
6. **`src/shared/testIds/darkModeTestIds.ts`** - Test IDs for toggle controls

### Files Modified
1. **`src/components/Icons/iconPaths.ts`** - Added `sun` and `moon` SVG icon definitions
2. **`src/components/Sidebar/Sidebar.tsx`** - Added DarkModeToggle in sidebar footer (above logout)
3. **`src/components/Sidebar/MobileSidebarCollapsed.tsx`** - Added MobileDarkModeButton import and placement
4. **`src/theme/components/ThemeProvider.tsx`** - Replaced Redux-based mode management with useDarkMode hook; exposed darkModePreference and setDarkModePreference via context
5. **`src/theme/components/ThemeProvider.test.tsx`** - Updated tests for new context shape and useDarkMode integration
6. **`src/theme/utils/ThemeContext.ts`** - Added darkModePreference and setDarkModePreference to ThemeContextValue interface
7. **`src/theme/index.ts`** - Exported useDarkMode and UseDarkModeReturn
8. **`src/theme/utils/layoutSidebar.ts`** - Added sidebarSpacer style
9. **`src/localization/locales/en.json`** - Added darkModeToggle.* translation keys
10. **`src/shared/testIds.ts`** - Imported and spread DarkModeTestIds
11. **`src/shared/constants/index.ts`** - Added DARK_MODE_PREFERENCE storage key

### Pre-existing Issues Fixed
- **`src/components/OnlineMenus/PdfExport/hooks/useMenuPdfExport.test.ts`** - Fixed broken test mocking (mocked `createPdfDocument` instead of stale `jspdf` dynamic import mock)
- **`src/components/OnlineMenus/PdfExport/utils/createPdfDocument.ts`** - Fixed `save` type to `Promise<void> | void` to match jsPDF's actual return type
- **`src/components/OnlineMenus/PdfExport/hooks/useMenuPdfExport.ts`** - Added `await` to `save()` call to fix no-floating-promises lint error

## Verification Results
- [x] `frontend-lint-fix` - PASSED (0 errors)
- [x] `frontend-unit-tests` - PASSED (289 suites, 3674 tests)
- [x] All files under 300 lines
- [x] All user-facing text uses FM() with keys in en.json
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] No hardcoded colors or magic numbers

# Route Preloader & Color Consistency Fixes

## Status: COMPLETED

## Problem Statement

### Issue 1: Background Module Preloading
User reports slow loading when navigating between sections. The existing `routePreloader.ts` preloads route page chunks but did NOT preload heavy library modules (jsPDF, Excel parser, QR code renderer, menu editor styling components, analytics). These large chunks caused visible loading delays on first navigation.

### Issue 2: Color Consistency
Hardcoded color literals scattered across OnlineMenus components instead of using the theme system. This caused inconsistent appearance between light/dark modes and colors that didn't respond to theme changes.

## Changes Made

### Part 1: Route Preloader Enhancement
**File: `src/config/routePreloader.ts`**
- Added `preloadHeavyModules()` function that preloads:
  - `jspdf` (~200 KB) for PDF export
  - `read-excel-file/browser` for Excel import
  - `react-qr-code` for QR code rendering
  - Menu editor styling sub-components (GlobalStylingTab, ColorSchemeEditor, TypographyEditor, BoxStyleEditor, HeaderEditor)
  - ImportMenuModal for CSV/XLSX import
  - MenuAnalyticsScreen for analytics charts
- Heavy modules are scheduled with a 3-second delay after route preloads, using a secondary `requestIdleCallback` to avoid competing with critical route chunk preloading
- Route preloading and heavy module preloading are staggered for optimal main thread usage

**File: `src/config/routePreloader.test.ts`**
- Updated tests to cover the staggered preloading behavior
- Tests verify requestIdleCallback is used for routes and setTimeout schedules heavy modules
- Tests verify fallback setTimeout behavior when requestIdleCallback unavailable
- SSR guard test preserved

### Part 2: Color Consistency Fixes

**Border/text fallback colors replaced with theme values:**
- `GlobalStylingControls.tsx` - Removed `'#ccc'`, `'#666'`, `'#FFFFFF'`, `'#000000'` fallbacks; now uses `colors.border`, `colors.textSecondary`, `colors.background`, `colors.text` from theme palette
- `ThemeSelector.tsx` - Removed `'#ccc'` border fallback; uses `colors.border`
- `MenuLivePreview.tsx` - Removed `'#ccc'` border fallback; uses `colors.border`
- `PriceInput.tsx` - Removed `BORDER_FALLBACK` constant; uses `colors.border`

**Hardcoded defaults replaced with `DEFAULT_COLOR_SCHEME` references:**
- `menuItemDisplayHelpers.ts` - `'#000000'` and `'#FFFFFF'` replaced with `DEFAULT_COLOR_SCHEME.text` and `DEFAULT_COLOR_SCHEME.background`
- `MenuItemDisplay.tsx` - `'#E5E5E5'` border fallback replaced with `DEFAULT_COLOR_SCHEME.border`
- `MenuHeader.tsx` - `DEFAULT_TEXT_COLOR` and `DEFAULT_SECONDARY_COLOR` replaced with `DEFAULT_COLOR_SCHEME.text` and `DEFAULT_COLOR_SCHEME.textSecondary`

**Button text on primary color extracted from theme:**
- `TranslationManager.tsx` - Removed `BUTTON_TEXT_COLOR = '#ffffff'`; now uses `colors.textOnPrimary` from theme palette
- `TranslationStatusRow.tsx` - Removed hardcoded `ACTION_TEXT_COLOR`, `COMPLETED_COLOR`, `FAILED_COLOR`, `STALE_COLOR`, `PENDING_COLOR`; now uses theme palette colors (`success`, `error`, `gamboge`, `subtext`, `textOnPrimary`)
- `GlobalStylingTab.tsx` - Removed `TEXT_ON_PRIMARY` import; uses `colors.textOnPrimary` from theme
- `ImportMenuModal.tsx` - Removed `TEXT_ON_PRIMARY` import; receives `textOnPrimary` from theme and passes to ModalFooter
- `ImportExportButtons.tsx` - Removed `TEXT_ON_PRIMARY` import; uses `colors.textOnPrimary` from theme

**Stylesheet color constants cleaned up:**
- `globalStylingTabStyles.ts` - Removed `TAB_BORDER_COLOR = '#ccc'` and `TEXT_ON_PRIMARY = '#fff'`; tab border color now comes from theme dynamically; added `tabButtonSelected` style with extracted transparent constant
- `menuImportStyles.ts` - Removed `TEXT_ON_PRIMARY = '#FFFFFF'` export
- `importExportButtonsStyles.ts` - Removed `TEXT_ON_PRIMARY = '#fff'` export

**Switch colors kept as local constants (not removed):**
- `FeaturedSectionSettings.tsx` and `FeaturedItemControls.tsx` - Switch thumb/track inactive colors (`#f4f3f4`, `#767577`) are standard React Native platform colors, kept as documented local constants

### Files NOT changed (intentional):
- `ThemeSelector.tsx` PREDEFINED_THEMES - Menu theme presets with specific design colors (user-selectable menu themes, not app UI)
- `DEFAULT_COLOR_SCHEME` in `menuDefaults.ts` - Menu content default colors (domain data, not app chrome)
- `COLOR_PRESETS` in `colorSchemeConstants.ts` - Color preset data for menu styling
- Placeholder text like `"#FFFFFF"` in color inputs - Format examples, not styling
- Shadow colors (`#000000`) - Standard shadow value used across platforms
- Preview backgrounds in editors - Static preview UI colors
- Validation row colors in `menuImportConstants.ts` - Import table feedback colors (red/orange/green rows)
- Error feedback colors in `ImportExportButtons.tsx` - Material Design-style light error backgrounds

## Verification Results
- [x] `frontend-lint-fix` - PASSED
- [x] `frontend-yagni` - PASSED
- [x] `frontend-unit-tests` - PASSED

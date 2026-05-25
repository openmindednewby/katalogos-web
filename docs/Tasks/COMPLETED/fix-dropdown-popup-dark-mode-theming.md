# Fix Syncfusion Dropdown/Select Popup Theming in Dark Mode

## Status: COMPLETED

## Problem Statement
Syncfusion dropdown popups (DropDownList, ComboBox, AutoComplete, MultiSelect) show a white background in dark mode, making text unreadable (light text on white/light background). The theme editor colors are not being applied to dropdown popups.

## Root Cause Analysis
Three issues contribute to this:

1. **Missing dark mode defaults in `base.css`**: The `.dark {}` block has NO default values for select-specific CSS variables (`--component-select-popup-bg`, `--component-select-popup-border`, `--component-select-item-hover`, etc.). Without these fallback values, before the injector runs, the popups have no dark mode styling.

2. **Narrow popup CSS selectors in `syncfusion-overrides.css`**: Current CSS only targets `.e-popup.e-ddl` (DropDownList popups). ComboBox (`.e-popup.e-combobox` or similar), AutoComplete, and MultiSelect popups use different CSS classes and are not covered.

3. **CSS layer specificity vs dynamically loaded CSS**: `loadSyncfusionCss('dropdowns')` dynamically injects Syncfusion CSS that is NOT in any `@layer`. Unlayered CSS has higher specificity than layered CSS. The `!important` declarations in our overrides ensure they win.

4. **AdvancedDropdownsSection uses raw Syncfusion components** without `cssClass` that includes `sf-dark`/`sf-light` theme markers.

## Implementation Plan
1. Add dark mode select defaults to `base.css` `.dark {}` block
2. Expand popup CSS selectors in `syncfusion-overrides.css` to cover all dropdown types
3. Add filter input theming inside popups (for ComboBox/AutoComplete filtering)
4. Add `cssClass` with dark/light mode to AdvancedDropdownsSection components
5. Update input exclusion selectors to also exclude `.e-multiselect`
6. Update syncfusion-themed.css dark mode focus ring to include MultiSelect
7. Visually verify in browser

## Files Modified
- `SyncfusionThemeStudio/src/styles/layers/base.css` - Added 10 dark mode select CSS variable defaults to `.dark {}` block
- `SyncfusionThemeStudio/src/styles/layers/syncfusion-overrides.css` - Expanded popup selectors to cover all dropdown types (DDL, ComboBox, AutoComplete, MultiSelect), added MultiSelect input wrapper overrides, added filter input theming, added popup scrollbar theming, added no-records message theming, updated input exclusion selectors to include `.e-multiselect`
- `SyncfusionThemeStudio/src/styles/layers/syncfusion-themed.css` - Added `.e-multiselect` to dark mode focus ring selectors
- `SyncfusionThemeStudio/src/features/components/pages/ComponentsPage/sections/AdvancedDropdownsSection.tsx` - Added `useThemeStore` and `useMemo` for `themeCssClass`/`errorCssClass`, applied `cssClass` to all 6 Syncfusion components

## Success Criteria
- [x] Dark mode select defaults present in base.css (10 variables added)
- [x] Popup CSS selectors cover all dropdown types (DDL, ComboBox, AutoComplete, MultiSelect)
- [x] Filter input inside popups is themed
- [x] AdvancedDropdownsSection components include sf-dark/sf-light cssClass
- [x] All dropdown popups show dark background in dark mode (verified ComboBox, AutoComplete, MultiSelect)
- [x] Hover and selected states work with proper colors in dark mode (verified visually)
- [x] Light mode not regressed (verified ComboBox popup in light mode)
- [x] Build succeeds
- [x] Lint passes
- [x] Typecheck passes
- [x] All 474 unit tests pass

## Test Results
- `npm run lint:fix` - PASS (no errors)
- `npm run typecheck` - PASS (no errors)
- `npm run build` - PASS (built in 21.49s)
- `npx vitest run` - PASS (25 test files, 474 tests passed)
- Visual verification:
  - ComboBox popup: dark background, light text, blue selected state
  - AutoComplete popup: dark background, light text, highlighted search matches
  - MultiSelect popup: dark background, light text, blue selected state, hover works
  - Light mode: all dropdowns still render correctly with light backgrounds
  - CSS variables confirmed resolving correctly via `getComputedStyle()` in dark mode

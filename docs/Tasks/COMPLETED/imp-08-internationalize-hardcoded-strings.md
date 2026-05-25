# IMP-08: Internationalize Hardcoded English Strings with FM()

## Status: COMPLETED

## Problem
30+ instances of hardcoded English strings in `aria-label`, `placeholder`, and option label attributes in the SyncfusionThemeStudio project that should use the `FM()` translation function.

## Plan

### 1. Add translation keys to en.json
Add keys grouped under:
- `accessibility.*` - for aria-label values (loading, dismiss, close, filter, navigation, etc.)
- `forms.placeholders.*` - for form placeholder strings
- `themeSettings.placeholders.*` - for theme editor-specific placeholders
- `components.placeholders.*` - for component page placeholders
- `themeSettings.components.dataGrid.*` - for DataGrid option labels (transform, weight)
- `themeSettings.typography.transitions.*` - for transition editor labels/placeholders
- `themeSettings.layout.animations.*` - for animation editor placeholders
- `themeSettings.layout.placeholders.*` - for dimension editor placeholders
- `themeSettings.layout.spacingSuffix` - for spacing suffix label
- `components.dataGrid.noDataAvailable` - for empty grid text

### 2. Update component files
Replace hardcoded strings with `FM('key')` calls in all identified files.

### 3. Files modified
- `src/localization/locales/en.json` - Added 50+ new translation keys
- `src/components/common/components/LoadingSpinner.tsx` - aria-label
- `src/components/layout/ThemeSettingsDrawer/components/ThemeStudioLoader.tsx` - aria-label
- `src/components/ui/native/AlertNative/index.tsx` - aria-label
- `src/components/ui/native/AlertNative/AlertNative.test.tsx` - Updated test to match i18n key
- `src/components/ui/native/DialogNative/index.tsx` - aria-label
- `src/components/ui/native/ToastNative/components/ToastItem.tsx` - aria-label
- `src/components/ui/native/SelectNative/components/DropdownPopup.tsx` - aria-label, placeholder
- `src/features/components/shared/NavMenu.tsx` - aria-label
- `src/components/ui/syncfusion/DataGrid/index.tsx` - aria-label, emptyText default
- `src/features/components/pages/ComponentsPage/sections/SelectionSection.tsx` - aria-label
- `src/features/forms/pages/NativeFormsPage/forms/NewsletterForm/index.tsx` - placeholder
- `src/features/components/pages/ComponentsPage/sections/CalendarsSection.tsx` - 6 placeholders
- `src/features/components/pages/ComponentsPage/sections/AdvancedInputsSection.tsx` - 3 placeholders
- `src/features/components/pages/ComponentsPage/sections/AdvancedDropdownsSection.tsx` - 6 placeholders
- `src/components/layout/ThemeSettingsDrawer/components/ColorsSection.tsx` - placeholder
- `src/components/layout/ThemeSettingsDrawer/sections/TypographySection/index.tsx` - 8 labels/placeholders
- `src/components/layout/ThemeSettingsDrawer/sections/LayoutSection/components/AnimationsEditor.tsx` - 2 placeholders
- `src/components/layout/ThemeSettingsDrawer/sections/LayoutSection/components/DimensionsEditor.tsx` - 5 placeholders/suffix
- `src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/components/DataGridColumnRowEditor.tsx` - 8 option labels

## Results
- `npx tsc --noEmit` passes
- `npm test` passes (115 test files, 1523 tests)
- `npm run lint:fix` passes (1 pre-existing error in DiagramCanvas.tsx, unrelated)
- No behavior changes - all translations resolve to the same English strings

## Success Criteria
- [x] All hardcoded English strings replaced with FM() calls
- [x] All new translation keys added to en.json
- [x] `npx tsc --noEmit` passes
- [x] `npm test` passes
- [x] No behavior changes

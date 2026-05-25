# DataGrid Parent Section & Column/Row Settings

## Status: COMPLETED

## Problem Statement
The DataGridEditor renders 6 separate CollapsibleSections as flat siblings in the ComponentsSection, mixing them in with other component editors (Header, Sidebar, Buttons, etc.). These should be grouped under a single parent "Data Grid / Table" collapsible section. Additionally, column/row alignment customization is needed (text alignment, row height).

## Implementation Plan

1. Add new DataGridConfig properties: `defaultTextAlign`, `headerTextAlign`, `rowHeight`
2. Add defaults for light and dark modes
3. Add CSS variable injection in dataGridInjector.ts
4. Add test fixture values
5. Add localization keys for all new labels
6. Create DataGridColumnRowEditor.tsx sub-editor component
7. Wrap all DataGrid sub-editors in a parent CollapsibleSection in DataGridEditor.tsx

## Files to Modify
- `SyncfusionThemeStudio/src/stores/theme/types/componentTypes.ts` - Add new properties
- `SyncfusionThemeStudio/src/stores/theme/defaults/defaultComponentsLight.ts` - Light defaults
- `SyncfusionThemeStudio/src/stores/theme/defaults/defaultComponentsDark.ts` - Dark defaults
- `SyncfusionThemeStudio/src/stores/theme/injectors/dataGridInjector.ts` - CSS injection
- `SyncfusionThemeStudio/src/test/fixtures/themeComponentFixtures.ts` - Test fixtures
- `SyncfusionThemeStudio/src/localization/locales/en.json` - Localization keys
- `SyncfusionThemeStudio/src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/DataGridColumnRowEditor.tsx` - New file
- `SyncfusionThemeStudio/src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/DataGridEditor.tsx` - Wrap in parent section

## Success Criteria
- [ ] All DataGrid sub-sections are nested under a single parent CollapsibleSection
- [ ] Column & Row Settings sub-section with alignment and row height controls
- [ ] New CSS variables injected for new properties
- [ ] All localization keys present
- [ ] Build succeeds with no errors
- [ ] Lint passes

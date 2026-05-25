# Task: Implement Tenant Theme Editor Page

## Status: IN PROGRESS

## Description
Replace the placeholder `/tenant-themes` page with a full theme editor UI featuring:
- Preset selection (reusing existing PresetGrid)
- Brand color editing (primary, secondary, accent) with hex validation
- Typography editing (font family chips, heading scale)
- Live preview card
- Save/reset with confirmation dialog
- Admin-only editing, read-only for non-admins

## Files Created
- `src/components/TenantThemeEditor/helpers.ts` - Pure helper functions
- `src/components/TenantThemeEditor/ColorInput.tsx` - Hex color input with validation
- `src/components/TenantThemeEditor/BrandColorEditor.tsx` - Brand color section
- `src/components/TenantThemeEditor/TypographyEditor.tsx` - Typography section
- `src/components/TenantThemeEditor/ThemePreviewCard.tsx` - Live preview section
- `src/components/TenantThemeEditor/TenantThemeEditorScreen.tsx` - Main orchestrator
- `src/components/TenantThemeEditor/index.ts` - Barrel export
- `src/components/TenantThemeEditor/__tests__/helpers.test.ts` - Helper unit tests
- `src/components/TenantThemeEditor/__tests__/ColorInput.test.tsx` - ColorInput unit tests
- `E2ETests/tests/tenant-themes/tenant-themes-editor.spec.ts` - E2E tests

## Files Modified
- `app/(protected)/tenant-themes/index.tsx` - Route to editor screen
- `src/shared/testIds/commonTestIds.ts` - Added 8 test IDs
- `E2ETests/shared/testIds.ts` - Synced test IDs
- `src/localization/locales/en.json` - Replaced placeholder with full editor keys
- `E2ETests/pages/TenantThemesPage.ts` - Added editor locators and methods
- `E2ETests/pages/index.ts` - Added TenantThemesPage export

## Reused Existing Infrastructure
- `useTenantTheme()` / `useTenantThemeMutation()` hooks
- `PresetGrid`, `Section`, `Heading`, `ConfirmDialog`, `Button` components
- `ChipSelector` for font family selection
- `isValidHex()` from palette-generator
- `useTheme()` / `setTenantConfig()` for live preview
- `DEFAULT_THEME_CONFIG` for reset

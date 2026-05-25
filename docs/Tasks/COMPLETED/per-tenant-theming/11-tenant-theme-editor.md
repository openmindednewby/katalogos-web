# Task 11: Build Theme Settings Page in BaseClient

> **Status**: COMPLETED (2026-03-06) — 35 unit tests, 5 new components
> **Agent**: `frontend-dev`
> **Blocked by**: 09 (backend endpoints), 10 (theme fetch/cache)
> **Blocks**: None
> **Estimated effort**: Small-Medium
> **Note**: The FULL theme editor is Task 13 (standalone micro-frontend). This task is the summary/settings page within BaseClient.

---

## Problem Statement

BaseClient needs a theme settings page where admins can see their current theme, quick-switch presets, and launch the full theme editor micro-frontend (Task 13). This is NOT the full editor - it's a lightweight settings page.

---

## Requirements

### Theme Settings Page
A new admin page at route `/settings/theme` with:

#### Section 1: Current Theme Summary
- Show current preset name (or "Custom")
- Color swatches for primary, secondary, accent
- Current logo preview
- Light/dark mode toggle

#### Section 2: Quick Preset Switching
- Grid of preset cards (from `GET /api/tenants/theme-presets`)
- Click to apply a preset immediately (saves via API)
- No detailed customization here - just preset selection

#### Section 3: Launch Full Editor
- Prominent "Customize Theme" button
- Opens the TenantThemeEditor micro-frontend (port 4446) in a new tab
- Passes JWT token for authentication

#### Section 4: Theme Reset
- "Reset to Default" button
- Confirmation dialog before resetting
- Clears tenant's custom theme, reverts to default preset

### Access Control
- Only users with `admin` role can access theme settings
- Regular users see the current theme but cannot modify it

---

## Acceptance Criteria

- [ ] Theme editor page accessible at designated route
- [ ] Preset selection with live preview
- [ ] Color pickers for primary/secondary/accent
- [ ] Shade scale preview for each color
- [ ] Light/dark mode override sections
- [ ] Logo upload via ContentService integration
- [ ] Live preview panel with sample UI elements
- [ ] Save persists to backend API
- [ ] Theme updates reflected immediately in the app
- [ ] Admin role required to access editor
- [ ] Responsive layout (works on tablet)
- [ ] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [ ] All user-facing text via `t()` translations
- [ ] Unit tests for color picker logic
- [ ] Unit tests for preset selection logic

---

## Files to Create

- `BaseClient/src/components/Settings/ThemeEditor/ThemeEditorScreen.tsx` - Main page
- `BaseClient/src/components/Settings/ThemeEditor/PresetSelector.tsx` - Preset grid
- `BaseClient/src/components/Settings/ThemeEditor/ColorPicker.tsx` - Color picker
- `BaseClient/src/components/Settings/ThemeEditor/ColorScalePreview.tsx` - Shade preview
- `BaseClient/src/components/Settings/ThemeEditor/ModeOverrides.tsx` - Light/dark overrides
- `BaseClient/src/components/Settings/ThemeEditor/BrandingUpload.tsx` - Logo/favicon upload
- `BaseClient/src/components/Settings/ThemeEditor/ThemePreview.tsx` - Live preview panel
- `BaseClient/src/components/Settings/ThemeEditor/index.ts` - Barrel export
- `BaseClient/src/hooks/theme/useTenantThemeMutation.ts` - Save mutation hook

---

## Files to Reference

- `SyncfusionThemeStudio/src/components/layout/ThemeSettingsDrawer/` - Reference for UI patterns
- `SyncfusionThemeStudio/src/components/theme-sections/` - Reference for color/typography editors
- `BaseClient/src/components/Content/ContentUploader.tsx` - Existing upload pattern
- `BaseClient/src/components/OnlineMenus/ColorSchemeEditor.tsx` - Existing color picker pattern
- `BaseClient/src/theme/presets/` - Built-in presets from Task 04
- `BaseClient/src/theme/palette-generator.ts` - Palette generation from Task 02

---

## Design Notes

- Start simple: MVP is preset selection + 3 color pickers + logo upload + save
- Advanced features (typography, spacing, per-component overrides) can come in later iterations
- The preview panel is important for user confidence - show real component samples
- Consider a "Reset to Default" action that clears the tenant's custom theme
- The color picker should support both hex text input and a visual color wheel/palette

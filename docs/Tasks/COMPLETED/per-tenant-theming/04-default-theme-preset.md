# Task 04: Define Default Theme Preset

> **Status**: COMPLETED (2026-03-06) — 5 presets defined
> **Agent**: `frontend-dev`
> **Blocked by**: 01 (needs TenantThemeConfig type)
> **Blocks**: 03 (ThemeProvider needs a default)
> **Estimated effort**: Small

---

## Problem Statement

The current app uses hardcoded colors in `palette.ts`. We need to convert these existing values into the new `TenantThemeConfig` format as the default preset. This ensures the app looks identical before any tenant customization is applied.

---

## Requirements

### Default Preset
Convert the current `palette.ts` light/dark values into a `TenantThemeConfig`:

**Current palette.ts values to preserve:**
```
Light mode:
  background: #ffffff, surface: #f7f7f7, primary: #005f73
  secondary: #94d2bd, accent: #008d5c, success: #0a9396
  error: #ae2012, text: #001219, subtext: #555555
  textSecondary: #777777, border: #e6e6e6

Dark mode:
  background: #0a1628, surface: #152238, primary: #0097b2
  secondary: #66c2a5, accent: #00c978, success: #00bcd4
  error: #ff6b6b, text: #e8edf5, subtext: #94a3b8
  textSecondary: #64748b, border: #1e3a5f
```

### Tag Heuer Variant
Convert the Tag Heuer variant as a second preset for reference/testing.

### Built-in Presets Array
Create a `THEME_PRESETS` array that the theme editor can display for tenants to choose from. Start with:
1. **Default** (current palette)
2. **Tag Heuer** (existing variant)
3. **Ocean** (blue tones)
4. **Forest** (green tones)
5. **Sunset** (warm tones)

Each preset is a complete `TenantThemeConfig` object.

---

## Acceptance Criteria

- [ ] `DEFAULT_THEME_CONFIG` constant matches current palette.ts values exactly
- [ ] App looks visually identical when using default preset vs current hardcoded palette
- [ ] Tag Heuer variant converted to TenantThemeConfig format
- [ ] At least 5 built-in presets defined
- [ ] `THEME_PRESETS` array exported with id, name, and config for each
- [ ] Each preset validated against TenantThemeConfig type (no missing fields)

---

## Files to Create

- `BaseClient/src/theme/presets/default.ts` - Default preset
- `BaseClient/src/theme/presets/tagHeuer.ts` - Tag Heuer preset
- `BaseClient/src/theme/presets/ocean.ts` - Ocean preset
- `BaseClient/src/theme/presets/forest.ts` - Forest preset
- `BaseClient/src/theme/presets/sunset.ts` - Sunset preset
- `BaseClient/src/theme/presets/index.ts` - Barrel export + THEME_PRESETS array

---

## Files to Reference

- `BaseClient/src/theme/palette.ts` - SOURCE OF TRUTH for current colors
- `BaseClient/src/theme/types/tenantThemeConfig.ts` - Type from Task 01
- `SyncfusionThemeStudio/src/stores/theme/presets/` - Reference for how presets are structured

---

## Design Notes

- Presets should be const objects (readonly) to prevent accidental mutation
- Each preset needs: `id` (string), `name` (display name), `config` (TenantThemeConfig)
- The `DEFAULT_THEME_CONFIG` is also used as the fallback when a tenant has no custom theme

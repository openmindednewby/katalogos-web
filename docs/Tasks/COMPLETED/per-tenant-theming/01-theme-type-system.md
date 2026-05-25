# Task 01: Design TenantThemeConfig Type System

> **Status**: COMPLETED (2026-03-06)
> **Agent**: `frontend-dev`
> **Blocked by**: None (first task)
> **Blocks**: 02, 03, 04
> **Estimated effort**: Small

---

## Problem Statement

The app currently uses a hardcoded `palette.ts` with two static color sets (light/dark). There are no types for a per-tenant configurable theme. We need a TypeScript type system that defines what a tenant theme looks like, shared between frontend and eventually the backend API.

---

## Requirements

### TenantThemeConfig (top-level)
The main config object stored per tenant. Must include:

1. **Color tokens**
   - `primary`: string (hex, e.g. `#005f73`) - Brand primary color
   - `secondary`: string (hex) - Brand secondary color
   - `accent`: string (hex) - Accent/highlight color

2. **Semantic/status colors** (optional overrides, fallback to defaults)
   - `success`: string (hex)
   - `warning`: string (hex)
   - `error`: string (hex)
   - `info`: string (hex)

3. **Mode-specific tokens** (light and dark)
   - `background`: string - Page/body background
   - `surface`: string - Cards, panels
   - `surfaceElevated`: string - Modals, dropdowns
   - `text`: string - Primary text
   - `textSecondary`: string - Secondary/muted text
   - `border`: string - Default borders
   - `divider`: string - Dividers

4. **Typography** (optional overrides)
   - `fontFamily`: string (system font name)
   - `headingScale`: number (multiplier, default 1.0)

5. **Branding**
   - `logoContentId`: string | null (GUID referencing ContentService item)
   - `faviconContentId`: string | null
   - `presetId`: string | null (which built-in preset was used as base)

### Resolved Theme (computed at runtime)
After palette generation, the resolved theme used by components:

1. **ColorPalette** - Full shade scales (50-900) for primary, secondary, accent
2. **SemanticColors** - success, warning, error, info with shade scales
3. **ModeColors** - All mode-specific tokens resolved for current mode (light/dark)
4. **Typography** - Resolved font config
5. **Branding** - Resolved logo URLs

### ThemeMode
Keep existing `const enum ThemeMode { Light, Dark }` from `BaseClient/src/shared/enums/ThemeMode.ts`.

---

## Acceptance Criteria

- [ ] `TenantThemeConfig` type defined (the JSON stored in DB)
- [ ] `ThemeModeColors` type defined (light/dark specific tokens)
- [ ] `ResolvedTheme` type defined (what components consume via `useTheme()`)
- [ ] `ColorScale` type defined (shade 50-900 for generated palettes)
- [ ] Types are JSON-serializable (no functions, no classes)
- [ ] Types exported from a barrel file
- [ ] No runtime code in this task - types only
- [ ] Each `const enum` in its own file per project conventions

---

## Files to Create

- `BaseClient/src/theme/types/tenantThemeConfig.ts` - TenantThemeConfig
- `BaseClient/src/theme/types/themeModeColors.ts` - ThemeModeColors
- `BaseClient/src/theme/types/resolvedTheme.ts` - ResolvedTheme
- `BaseClient/src/theme/types/colorScale.ts` - ColorScale (50-900 shades)
- `BaseClient/src/theme/types/index.ts` - Barrel export

---

## Files to Reference

- `BaseClient/src/theme/palette.ts` - Current color definitions (light/dark palettes, ThemeColors type)
- `BaseClient/src/theme/hooks.ts` - Current `useThemeColors()` hook
- `BaseClient/src/shared/enums/ThemeMode.ts` - Existing ThemeMode enum
- `SyncfusionThemeStudio/src/stores/theme/types/` - Reference for comprehensive theme type system (ColorScale, ThemeModeConfig, ThemeConfig patterns)

---

## Design Notes

- The `TenantThemeConfig` should be small (~2-5KB JSON) since it's stored in a DB column and fetched on every app load
- Keep it flat where possible - avoid deeply nested objects
- All color values as hex strings (not RGB triplets like ThemeStudio uses)
- The `ResolvedTheme` is the runtime-computed version with full shade scales - this is what `useTheme()` returns
- Must be compatible with React Native StyleSheet (no CSS variables)

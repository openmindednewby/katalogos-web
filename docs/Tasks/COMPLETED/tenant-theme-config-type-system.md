# Task: Implement TenantThemeConfig Type System

> **Status**: COMPLETED
> **Agent**: frontend-dev
> **Source**: `BaseClient/docs/Tasks/TODO/per-tenant-theming/01-theme-type-system.md`

---

## Problem Statement

The app currently uses a hardcoded `palette.ts` with two static color sets (light/dark). We need a TypeScript type system that defines what a per-tenant configurable theme looks like, stored as a JSON blob in the database and consumed at runtime via `useTheme()`.

---

## Implementation Plan

### Files Created

1. `BaseClient/src/theme/types/colorScale.ts` - ColorScale interface (shade 50-900)
2. `BaseClient/src/theme/types/themeModeColors.ts` - ThemeModeColors interface (mode-specific tokens)
3. `BaseClient/src/theme/types/tenantThemeConfig.ts` - TenantThemeConfig, SemanticColorOverrides, TypographyConfig, BrandingConfig
4. `BaseClient/src/theme/types/resolvedTheme.ts` - ResolvedTheme, ResolvedPalette, ResolvedSemanticColors, ResolvedTypography, ResolvedBranding
5. `BaseClient/src/theme/types/index.ts` - Barrel export for all types

### Design Decisions

- All color values as hex strings (not RGB triplets)
- Types are JSON-serializable (no functions, no classes)
- Keep TenantThemeConfig flat (~2-5KB JSON)
- Reuse existing ThemeMode const enum from `src/shared/enums/ThemeMode.ts`
- ColorScale adapted from SyncfusionThemeStudio but using hex strings only
- SemanticColorOverrides uses optional fields so tenants can override only what they need
- TypographyConfig uses optional fields for same reason
- ResolvedTheme separates "colors" (current mode's ThemeModeColors) from "palette" (full shade scales)
- No runtime code -- types only

---

## Changes Made

### `colorScale.ts`
- `ColorScale` interface with properties '50' through '900', all string (hex)

### `themeModeColors.ts`
- `ThemeModeColors` interface with: background, surface, surfaceElevated, text, textSecondary, border, divider

### `tenantThemeConfig.ts`
- `SemanticColorOverrides` interface (optional success, warning, error, info)
- `TypographyConfig` interface (optional fontFamily, headingScale)
- `BrandingConfig` interface (logoContentId, faviconContentId, presetId -- all string | null)
- `TenantThemeConfig` interface combining: primary, secondary, accent, semantic?, light, dark, typography?, branding

### `resolvedTheme.ts`
- `ResolvedPalette` (primary, secondary, accent as ColorScale)
- `ResolvedSemanticColors` (success, warning, error, info as ColorScale)
- `ResolvedTypography` (fontFamily: string, headingScale: number)
- `ResolvedBranding` (logoUrl, faviconUrl as string | null)
- `ResolvedTheme` combining: colors, palette, semantic, typography, mode, branding

### `index.ts`
- Barrel export for all 10 interfaces using `export type`

---

## Verification Results

- `npm run lint:fix` -- PASSED (no errors)
- `npm run yagni` -- PASSED (no issues in new files)
- `npm run test:coverage` -- PASSED (151 suites, 1869 tests, 0 failures)
- `npx expo export --platform web` -- PASSED (build exported to dist/)
- TypeScript check (`tsc --noEmit`) -- PASSED (no errors in new files)

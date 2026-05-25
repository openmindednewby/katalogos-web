# Task: Build Palette Generator Utility (Task 02)

> **Status**: COMPLETE
> **Agent**: `frontend-dev`
> **Blocked by**: 01 (types - COMPLETE)
> **Blocks**: 03

---

## Problem Statement

When a tenant sets a single primary color (e.g. `#005f73`), we need to generate a full shade scale (50 through 900) for use across the UI. Currently `palette.ts` has manually crafted color values. We need an algorithmic approach similar to SyncfusionThemeStudio.

---

## Implementation Summary

### Discovery

An existing implementation was already present at `BaseClient/src/theme/utils/palette-generator.ts` (with tests at `palette-generator.test.ts`), already imported by production code (`resolveTheme.ts`, `ColorInput.tsx`, `helpers.ts`). Rather than creating a duplicate file, the missing `lighten` and `darken` functions were added to the existing file.

### Files Modified
1. `BaseClient/src/theme/utils/palette-generator.ts` - Added `lighten()` and `darken()` exports
2. `BaseClient/src/theme/utils/palette-generator.test.ts` - Added 8 new tests for lighten/darken

### Functions Available (all 7 required by spec)
1. `hexToHsl(hex)` - Convert hex to HSL (pre-existing)
2. `hslToHex(h, s, l)` - Convert HSL to hex (pre-existing)
3. `isValidHex(value)` - Validate hex format (pre-existing)
4. `lighten(hex, amount)` - Lighten a color by amount (NEW)
5. `darken(hex, amount)` - Darken a color by amount (NEW)
6. `generateColorScale(baseColor)` - Generate full 50-900 scale from hex (pre-existing)
7. `generateThemePalette(config)` - Generate all palettes from TenantThemeConfig (pre-existing)

### Key Design Decisions
- Reused existing file rather than creating duplicate (avoids import conflicts)
- HSL interpolation approach: shade 500 = base color exactly, lighter shades interpolate toward white, darker shades toward black
- Ratio-based interpolation around anchor lightness of 0.5 ensures monotonic brightness ordering
- Output hex strings (#rrggbb format)
- Pure functions, no side effects, no external deps
- Works in React Native (no browser APIs)

---

## Verification Results

- [x] All functions under 50 lines (longest: generateShade at 18 lines)
- [x] File under 300 lines (263 lines)
- [x] Hex/HSL round-trips with minimal loss (tested with 7 colors)
- [x] Generated scales: 50 lightest, 900 darkest (monotonic ordering verified)
- [x] Lint passes: 0 errors
- [x] Tests pass: 46/46 (38 pre-existing + 8 new)
- [x] No external color library dependencies

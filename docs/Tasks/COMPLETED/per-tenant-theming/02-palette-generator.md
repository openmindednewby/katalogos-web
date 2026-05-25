# Task 02: Build Palette Generator Utility

> **Status**: COMPLETED (2026-03-06) — 46 unit tests
> **Agent**: `frontend-dev`
> **Blocked by**: 01 (needs ColorScale type)
> **Blocks**: 03
> **Estimated effort**: Small-Medium

---

## Problem Statement

When a tenant sets a single primary color (e.g. `#005f73`), we need to generate a full shade scale (50 through 900) for use across the UI. Currently `palette.ts` has manually crafted color values. We need an algorithmic approach like SyncfusionThemeStudio uses.

---

## Requirements

### Core Function: `generateColorScale(baseColor: string): ColorScale`
- Takes a hex color string (e.g. `#005f73`)
- Returns a `ColorScale` object with shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Shade 500 should be the base color (or closest to it)
- Lighter shades (50-400) progressively lighter
- Darker shades (600-900) progressively darker
- Output colors as hex strings

### Helper Functions
- `hexToHsl(hex: string): { h: number; s: number; l: number }` - Convert hex to HSL
- `hslToHex(h: number, s: number, l: number): string` - Convert HSL to hex
- `lighten(hex: string, amount: number): string` - Lighten a color
- `darken(hex: string, amount: number): string` - Darken a color
- `isValidHex(value: string): boolean` - Validate hex color format

### Full Palette Generation: `generateThemePalette(config: TenantThemeConfig): ThemePalette`
- Takes a TenantThemeConfig
- Generates ColorScale for primary, secondary, accent
- Generates semantic color scales (success, warning, error, info)
- Returns the complete ThemePalette used by the ThemeProvider

---

## Acceptance Criteria

- [ ] `generateColorScale()` produces visually harmonious shade scales
- [ ] Generated palettes have sufficient contrast ratios (WCAG AA at minimum)
- [ ] Pure functions with no side effects (no DOM, no React dependencies)
- [ ] Unit tests for all color conversion functions
- [ ] Unit tests verifying shade scale generation with known inputs
- [ ] Unit test for hex validation (valid/invalid inputs)
- [ ] Unit test for full palette generation from TenantThemeConfig
- [ ] No external color library dependencies (keep it lightweight)
- [ ] Works in React Native (no browser APIs)

---

## Files to Create

- `BaseClient/src/theme/palette-generator.ts` - All palette generation functions
- `BaseClient/src/theme/__tests__/palette-generator.test.ts` - Unit tests

---

## Files to Reference

- `BaseClient/src/theme/types/colorScale.ts` - ColorScale type (from Task 01)
- `BaseClient/src/theme/palette.ts` - Current hardcoded palette values (use as test fixtures)
- `SyncfusionThemeStudio/src/stores/theme/actions/colorActions.ts` - Reference for `updatePrimaryPalette` cascade logic
- `SyncfusionThemeStudio/src/stores/theme/presets/` - Reference for what good palettes look like

---

## Algorithm Approach

Use HSL color space for shade generation:
1. Convert base hex to HSL
2. For shade 500: use base color as-is
3. For lighter shades (50-400): increase lightness, slightly decrease saturation
4. For darker shades (600-900): decrease lightness, slightly adjust saturation
5. Ensure shade 50 is very light (~95% lightness) and 900 is very dark (~15% lightness)

Approximate lightness targets:
```
50:  95%    (near white tint)
100: 90%
200: 80%
300: 70%
400: 60%
500: base   (the input color)
600: 40%
700: 30%
800: 20%
900: 12%    (near black shade)
```

Adjust hue and saturation slightly across the scale for more natural-feeling palettes.

---

## Testing Strategy

Unit tests only (logic, no rendering):
- Hex ↔ HSL round-trip accuracy
- Known color inputs produce expected shade ranges
- Edge cases: pure white, pure black, fully saturated, desaturated
- Invalid hex inputs handled gracefully
- Generated scales maintain relative ordering (50 lightest, 900 darkest)

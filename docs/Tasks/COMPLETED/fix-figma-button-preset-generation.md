# Fix Figma Design Preset Button Generation

## Status: COMPLETED

## Summary
Fixed the `generate-buttons.ts` script to properly process Figma API data for button presets, addressing missing danger variant, missing hover states, and hardcoded dark mode.

## Changes Made

### 1. Split `generate-buttons.ts` into 3 files (lint: 300-line limit)
- `generate-buttons.ts` (231 lines): main pipeline, buildModeOverrides, extractTypography/Padding/Gap, propagateSharedBorderRadius, writeOutput, main()
- `generate-buttons-helpers.ts` (127 lines): ButtonVariantOverride type, color utilities, hover derivation, danger synthesis
- `generate-buttons-dark.ts` (155 lines): dark mode derivation with named color constants, danger-specific dark derivation

### 2. Meaningful hover states
Replaced hover=default fallback with pattern-based derivation:
- Dark bg (primary): lighten by 15 RGB steps (17 19 25 → 32 34 40)
- Light bg (secondary): darken by 10 RGB steps (255 255 255 → 245 245 245)
- Transparent bg (ghost/outline): add subtle gray bg (243 244 246)

### 3. Danger variant synthesis
When Figma extraction doesn't include danger, synthesize from primary's shape:
- Light: red-600 bg (220 38 38), red-700 hover (185 28 28), white text, pill shape
- Dark: red-500 bg (239 68 68), red-400 hover (248 113 113), white text

### 4. Dark mode improvements
- Danger stays red in dark mode (not inverted like primary)
- Primary disabled bg uses white (255 255 255) with opacity dimming

### 5. Corrections file structure
Created `scripts/figma/data/figma-corrections/buttons.json` (empty) for post-visual-QA fine-tuning.

## Files Modified
| File | Action |
|------|--------|
| `scripts/figma/generate-buttons.ts` | Refactored: split helpers/dark, updated hover, added danger |
| `scripts/figma/generate-buttons-helpers.ts` | NEW: color utils, hover derivation, danger synthesis |
| `scripts/figma/generate-buttons-dark.ts` | NEW: dark mode derivation with named constants |
| `scripts/figma/data/figma-corrections/buttons.json` | NEW: empty corrections file |
| `scripts/figma/data/figma-sections/buttons.json` | Regenerated (5 variants) |
| `src/stores/theme/presets/figmaDesignComponentsLight.ts` | Regenerated |
| `src/stores/theme/presets/figmaDesignComponentsDark.ts` | Regenerated |

## Verification Results

| Check | Result |
|-------|--------|
| Generation pipeline | 5 variants generated (was 4) |
| Unit tests (colorActions) | 21/21 passed |
| Full test suite | 1060/1060 passed |
| Lint | 0 errors |
| Quality Gate | GATE_PASSED |
| Code Review | REVIEW_PASSED |
| Visual QA | QA_PASSED |

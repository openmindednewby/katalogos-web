# UX Code Pattern Refactors

## Status: COMPLETED

## Problem Statement
Three systemic UX code pattern issues exist across BaseClient:
1. Modal overlay color constants are duplicated in 20+ files instead of using the shared `MODAL_OVERLAY_COLOR`
2. `DISABLED_OPACITY` is defined locally in 26+ files instead of a shared constant
3. 32 files still use the deprecated `useThemeColors()` hook instead of `useTheme()`

## Results

### Task 1: Modal overlay color consolidation -- DONE
- 17 files updated to import `MODAL_OVERLAY_COLOR` from `@/shared/constants`
- 2 files kept with intentionally different values and explanatory comments:
  - `cropModalStyles.ts` (0.85) -- darker for crop focus
  - `CategoryOverflowMenu.tsx` (0.3) -- lighter for subtle context menus
- 2 files standardized from 0.6 to 0.5 (`tooltipOverlayStyles.ts`, `itemDetailModalStyles.ts`)
- Non-modal overlays left unchanged (ProtectedLayout, MobileTopbar, MenuDisplayView, menuItemDisplayStyles)

### Task 2: DISABLED_OPACITY unification -- DONE
- Added `DISABLED_OPACITY = 0.5` to `src/shared/constants/index.ts`
- 22 files updated to use shared constant (mix of direct imports and re-exports)
- Values standardized to 0.5: Button (was 0.45), ReorderButtons (was 0.3), BillingHistoryTable (was 0.4), AiDescriptionButton (was 0.4), UndoRedoBar (was 0.4), IngredientsInput (was 0.4), WhiteLabelSettings (was 0.6), CustomDomainSettings (was 0.6)
- Updated Button.styles.test.ts and Button.presets.test.ts assertions from 0.45 to 0.5

### Task 3: useThemeColors -> useTheme migration -- DONE (32 files)
Color mapping used:
- `colors.text/textSecondary/surface/border/background/divider` -> `theme.colors.*` (same interface)
- `colors.primary` -> `theme.palette.primary['500']`
- `colors.accent` -> `theme.palette.accent['500']`
- `colors.textOnPrimary` -> `colors.background` (values are identical in both modes)
- `colors.success` -> `theme.semantic.success['500']`
- `colors.error` -> `theme.semantic.error['500']`
- `colors.subtext` -> `colors.textSecondary`
- `colors.gamboge` -> `theme.semantic.warning['500']` (StatusPage)

Special cases:
- `statusHelpers.ts`: Replaced `ThemeColors` parameter with a `StatusColorMap` interface
- `SetupChecklistItem.tsx`: Changed `colors` prop type from `ReturnType<typeof useThemeColors>` to `ThemeModeColors`, added `successColor` prop
- `WizardStepContent.tsx`: Changed props to `ThemeModeColors` + `primary: string`

## Quality Gate Results
- frontend-lint-fix: PASS
- frontend-yagni: PASS
- frontend-unit-tests: PASS
- frontend-prod-build: PASS

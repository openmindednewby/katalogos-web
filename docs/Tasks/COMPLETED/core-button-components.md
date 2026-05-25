# Task: Build Core Button Components with Theme Consumption

> **Status**: COMPLETED
> **Agent**: frontend-dev
> **Task Spec**: `docs/Tasks/TODO/per-tenant-theming/05-core-buttons.md`
> **Completed**: 2026-03-06

---

## Problem Statement

The current button components (SaveButton, CancelButton, ActionRow) use direct Redux theme access. They need to be refactored into a unified Button component system that consumes theme via `useTheme()` and supports variants (primary, secondary, outline, ghost, danger).

---

## Implementation Plan

### Files Created
1. `src/components/core/Button/utils/ButtonVariant.ts` - const enum for button variants
2. `src/components/core/Button/utils/ButtonSize.ts` - const enum for button sizes
3. `src/components/core/Button/utils/Button.styles.ts` - Theme-aware style generator
4. `src/components/core/Button/utils/Button.styles.test.ts` - Style builder unit tests
5. `src/components/core/Button/components/Button.tsx` - Main component
6. `src/components/core/Button/components/Button.test.tsx` - Component unit tests
7. `src/components/core/Button/index.ts` - Barrel export
8. `src/components/core/ActionRow/ActionRow.tsx` - Layout wrapper (children-based)
9. `src/components/core/ActionRow/index.ts` - Barrel export
10. `src/components/core/index.ts` - Core component barrel

### Files Modified
1. `src/components/Buttons/SaveButton.tsx` - Now wraps core Button with `ButtonVariant.Primary`
2. `src/components/Buttons/CancelButton.tsx` - Now wraps core Button with `ButtonVariant.Secondary`

### Key Decisions
- Each const enum (ButtonVariant, ButtonSize) in its own file under `utils/`
- Module structure convention followed: `components/` for Button.tsx, `utils/` for styles + enums
- Tests co-located next to source files (not in `__tests__/`)
- Styles generated via pure `buildButtonStyles()` function, not a hook
- Button component is 123 lines (under 200 limit)
- Style generator is 163 lines (each function under 50 lines)
- Tests focus on logic: callbacks, disabled/loading states, variant logic, style outputs

---

## Quality Gate Results

- **Unit Tests**: 28/28 passed (Button.test.tsx: 12, Button.styles.test.ts: 16)
- **ESLint**: 0 errors, 0 warnings on all Button-related files
- **TypeScript**: No type errors in core/ directory
- **Backwards Compatibility**: SaveButton and CancelButton still work via wrapper pattern; consumers import from `../Buttons/` unchanged

---

## Success Criteria
- [x] Single Button component with 5 variants (Primary, Secondary, Outline, Ghost, Danger)
- [x] All colors from useTheme() - no Redux access
- [x] Sizes: sm (32px), md (44px), lg (52px)
- [x] Loading state with ActivityIndicator
- [x] Disabled state with reduced opacity (0.45)
- [x] All buttons have testID + accessibilityLabel + accessibilityHint (required props)
- [x] Unit tests for callback behavior, disabled/loading states
- [x] SaveButton and CancelButton backwards compatible
- [x] Lint passes, tests pass, build succeeds

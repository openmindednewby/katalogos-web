# Task 06: Build Core Form Components with Theme Consumption

## Status: COMPLETED

## Problem Statement

Refactor all 11 form components to consume theme via `useTheme()` instead of direct Redux access or relying on externally-injected CSS variables.

## Analysis & Findings

### Components Already Using useTheme() (No Changes Needed)
1. `FormField.tsx` - Already uses `useTheme()` + `useMemo` for theme-derived styles
2. `FormSwitch.tsx` - Already uses `useTheme()` + `useMemo`
3. `FormActions.tsx` - Already uses `useTheme()` + `useMemo`
4. `ChipSelector.tsx` - Already uses `useTheme()` + `useMemo`
5. `Checkbox.tsx` - Already uses `useTheme()` + `useMemo`

### Components Migrated (CSS variable-based, needed useTheme bridge)
6. `FormNativeInput.tsx` - Now uses `useFormThemeVars()` to inject CSS vars from theme
7. `FormNativeDatePicker.tsx` - Now uses `useFormThemeVars()`
8. `FormNativeCheckbox.tsx` - Now uses `useFormThemeVars()`
9. `FormNativeSelect.tsx` - Now uses `useFormThemeVars()` (in ComboboxField sub-component)
10. `FormNativeTextarea.tsx` - Now uses `useFormThemeVars()`
11. `FormPasswordInput.tsx` - Now uses `useFormThemeVars()`

### Utility Already Migrated
- `useDynamicFormStyles()` in `forms.ts` - Already uses `useTheme()` internally

## Implementation

### New Files Created
- `useFormThemeVars.ts` - Hook that reads `useTheme()` and maps colors to CSS custom properties (`--form-*` vars). Applied as inline `style` on wrapper divs so components are self-contained.
- `useFormThemeVars.test.ts` - 10 tests covering all CSS variable mappings and memoization stability
- `FormField.test.tsx` - 9 tests covering theme-derived styles (label colors, input backgrounds, error borders, required marks)
- `Checkbox.test.tsx` - 12 tests covering state changes, label rendering logic, and theme-derived styles

### Architecture Decision
The native HTML form fields (6-11) use CSS class names with CSS variables for styling. Rather than replacing the entire styling approach, we created a bridge hook (`useFormThemeVars`) that:
1. Reads resolved theme colors from `useTheme()`
2. Converts them to CSS custom property inline styles
3. Applies them to each component's wrapper `<div>`

This ensures:
- Components are self-contained and work with per-tenant themes
- No dependency on external `:root` CSS variable injection
- CSS classes and structure remain unchanged (no visual regression risk)
- Focus states use `palette.primary[500]` via `--form-border-focus`
- Error states use `semantic.error[500]` via `--form-error`

### Existing Test Fix
- `FormNativeInput.test.tsx` - Added `useTheme` mock since the component now calls it indirectly via `useFormThemeVars`

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint:fix` | PASS - 0 errors in modified files |
| `npm run yagni` | PASS - no new unused exports |
| `npm run test:coverage` | PASS - 2087 tests, 166 suites, all pass |
| `npx expo export --platform web` | PASS - build succeeds |

## Files Modified
- `BaseClient/src/components/ui/form-fields/useFormThemeVars.ts` (NEW)
- `BaseClient/src/components/ui/form-fields/useFormThemeVars.test.ts` (NEW)
- `BaseClient/src/components/ui/form-fields/FormNativeInput.tsx` (MODIFIED)
- `BaseClient/src/components/ui/form-fields/FormNativeInput.test.tsx` (MODIFIED - added useTheme mock)
- `BaseClient/src/components/ui/form-fields/FormNativeDatePicker.tsx` (MODIFIED)
- `BaseClient/src/components/ui/form-fields/FormNativeCheckbox.tsx` (MODIFIED)
- `BaseClient/src/components/ui/form-fields/FormNativeSelect.tsx` (MODIFIED)
- `BaseClient/src/components/ui/form-fields/FormNativeTextarea.tsx` (MODIFIED)
- `BaseClient/src/components/ui/form-fields/FormPasswordInput.tsx` (MODIFIED)
- `BaseClient/src/components/Forms/FormField.test.tsx` (NEW)
- `BaseClient/src/components/Shared/Checkbox.test.tsx` (NEW)

# Task: Core Form Components Theme Migration (Task 06)

> **Status**: IN PROGRESS
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider - complete), 04 (default preset - complete)
> **Blocks**: 12 (domain migration)

---

## Problem Statement

Form components use a mix of `useThemeColors()` (legacy) and direct Redux `useSelector` for theme access. They need to consume theme via `useTheme()` for per-tenant customization support.

---

## Analysis

### Components requiring migration

| Component | File | Current Pattern | Migration Needed |
|-----------|------|-----------------|------------------|
| FormField | `components/Forms/FormField.tsx` | `useThemeColors()` | Yes - switch to `useTheme()` |
| FormSwitch | `components/Forms/FormSwitch.tsx` | `useThemeColors()` | Yes - switch to `useTheme()` |
| FormActions | `components/Forms/FormActions.tsx` | `useThemeColors()` | Yes - switch to `useTheme()` |
| ChipSelector | `components/Forms/ChipSelector.tsx` | `useThemeColors()` | Yes - switch to `useTheme()` |
| Checkbox | `components/Shared/Checkbox.tsx` | Direct Redux + `themePalette` | Yes - switch to `useTheme()` |
| useDynamicFormStyles | `theme/forms.ts` | Direct Redux + `themePalette` | Yes - switch to `useTheme()` |
| FormNativeInput | `components/ui/form-fields/FormNativeInput.tsx` | CSS classes only | No theme hooks used |
| FormNativeTextarea | `components/ui/form-fields/FormNativeTextarea.tsx` | CSS classes only | No theme hooks used |
| FormNativeCheckbox | `components/ui/form-fields/FormNativeCheckbox.tsx` | CSS classes only | No theme hooks used |
| FormNativeDatePicker | `components/ui/form-fields/FormNativeDatePicker.tsx` | CSS classes only | No theme hooks used |
| FormPasswordInput | `components/ui/form-fields/FormPasswordInput.tsx` | CSS classes only | No theme hooks used |
| FormNativeSelect | `components/ui/form-fields/FormNativeSelect.tsx` | CSS classes only | No theme hooks used |

### Key mapping: ThemeColors -> ThemeModeColors + ResolvedPalette

The old `ThemeColors` (from `palette.ts`) has fields like `primary`, `error`, `subtext`, `accent`.
The new `ThemeModeColors` (from `types/`) only has: `background`, `surface`, `surfaceElevated`, `text`, `textSecondary`, `border`, `divider`.
Brand/semantic colors come from `theme.palette` and `theme.semantic`:
- `colors.primary` -> `palette.primary[500]`
- `colors.error` -> `semantic.error[500]`
- `colors.accent` -> `palette.accent[500]`
- `colors.subtext` / `colors.textSecondary` -> `colors.textSecondary`
- `colors.success` -> `semantic.success[500]`

### Native form fields (6 components)

These use CSS class names (`form-native-input`, `form-native-label`, etc.) and CSS variable-based theming. They do NOT import or use any React theme hooks. They are already theme-aware via CSS variables. No code changes needed for these components.

---

## Implementation Plan

1. Migrate `FormField.tsx` - Replace `useThemeColors()` with `useTheme()`
2. Migrate `FormSwitch.tsx` - Replace `useThemeColors()` with `useTheme()`
3. Migrate `FormActions.tsx` - Replace `useThemeColors()` with `useTheme()`
4. Migrate `ChipSelector.tsx` - Replace `useThemeColors()` with `useTheme()`
5. Migrate `Checkbox.tsx` - Replace Redux `useSelector` + `themePalette` with `useTheme()`
6. Migrate `useDynamicFormStyles` in `theme/forms.ts` - Replace Redux + `themePalette` with `useTheme()`
7. Run quality checks (lint, tests, build)

---

## Success Criteria

- [ ] All 6 components/hooks with theme access now use `useTheme()` instead of legacy patterns
- [ ] No direct Redux theme access in these files
- [ ] No visual regressions (same color values resolved)
- [ ] All existing tests pass
- [ ] Lint passes
- [ ] Build succeeds

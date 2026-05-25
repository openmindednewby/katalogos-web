# Task 06: Build Core Form Components with Theme Consumption

> **Status**: COMPLETED (2026-03-06) — 31 unit tests, useFormThemeVars bridge hook
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider), 04 (default preset)
> **Blocks**: 12 (domain migration)
> **Estimated effort**: Medium-Large

---

## Problem Statement

Form components are the most-used components across the app. They currently use a mix of `useThemeColors()` and direct Redux access. They need to consume theme via `useTheme()` for per-tenant customization.

---

## Requirements

### Components to Refactor

| Component | Current Location | Styling Pattern |
|-----------|-----------------|-----------------|
| FormField | `components/Forms/FormField.tsx` | useThemeColors() + useMemo |
| FormSwitch | `components/Forms/FormSwitch.tsx` | Theme tokens |
| FormActions | `components/Forms/FormActions.tsx` | Layout styles |
| ChipSelector | `components/Forms/ChipSelector.tsx` | Inline styles + theme |
| Checkbox | `components/Shared/Checkbox.tsx` | Direct Redux + palette |
| FormNativeInput | `components/ui/form-fields/FormNativeInput.tsx` | No Syncfusion |
| FormNativeDatePicker | `components/ui/form-fields/FormNativeDatePicker.tsx` | No Syncfusion |
| FormNativeCheckbox | `components/ui/form-fields/FormNativeCheckbox.tsx` | No Syncfusion |
| FormNativeSelect | `components/ui/form-fields/FormNativeSelect.tsx` | No Syncfusion |
| FormNativeTextarea | `components/ui/form-fields/FormNativeTextarea.tsx` | No Syncfusion |
| FormPasswordInput | `components/ui/form-fields/FormPasswordInput.tsx` | No Syncfusion |

### Theme Consumption Pattern
All form components should follow this pattern:
```typescript
const { colors, palette } = useTheme();

const styles = useMemo(() => ({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  },
  label: {
    color: colors.textSecondary,
  },
  focused: {
    borderColor: palette.primary[500],
  },
  error: {
    borderColor: colors.error,
  },
}), [colors, palette]);
```

### DynamicForm Compatibility
The DynamicForm system uses `useDynamicFormStyles()` which returns a `FormStyles` object. This hook should be updated to internally use `useTheme()` so DynamicForm components automatically get tenant colors.

### Accessibility
- All interactive form elements: testID + accessibilityLabel + accessibilityHint
- Error messages announced to screen readers
- Focus states visible with primary color border

---

## Acceptance Criteria

- [ ] All 11 form components consume theme via `useTheme()`
- [ ] No direct Redux theme access (`useSelector → ui.theme`) in form components
- [ ] `useDynamicFormStyles()` internally delegates to `useTheme()`
- [ ] Form field focus states use `palette.primary[500]` border
- [ ] Error states use `colors.error` from theme
- [ ] All form elements have testID + accessibilityLabel + accessibilityHint
- [ ] Unit tests for FormField theme-derived styles
- [ ] Unit tests for Checkbox state changes (checked/unchecked callbacks)
- [ ] No visual regressions in existing forms
- [ ] Components moved to `components/core/` directory

---

## Files to Create

- `BaseClient/src/components/core/FormField/FormField.tsx`
- `BaseClient/src/components/core/FormField/index.ts`
- `BaseClient/src/components/core/FormSwitch/FormSwitch.tsx`
- `BaseClient/src/components/core/FormSwitch/index.ts`
- `BaseClient/src/components/core/Checkbox/Checkbox.tsx`
- `BaseClient/src/components/core/Checkbox/index.ts`
- `BaseClient/src/components/core/FormNativeInput/FormNativeInput.tsx`
- (and similarly for other native form components)

## Files to Modify

- `BaseClient/src/theme/forms.ts` - Update `useDynamicFormStyles()` to use `useTheme()`
- Original component files - Update to re-export from `core/` for backwards compatibility

---

## Files to Reference

- `BaseClient/src/components/Forms/FormField.tsx` - Model example of useThemeColors + useMemo
- `BaseClient/src/components/Shared/Checkbox.tsx` - Example of Redux direct access pattern
- `BaseClient/src/components/DynamicForm/QuestionRenderer/` - DynamicForm styling system
- `BaseClient/src/theme/forms.ts` - useDynamicFormStyles() hook

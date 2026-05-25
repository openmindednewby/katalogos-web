# Task 05: Build Core Button Components with Theme Consumption

> **Status**: COMPLETED (2026-03-06) — 28 unit tests
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider), 04 (default preset)
> **Blocks**: 12 (domain migration)
> **Estimated effort**: Medium

---

## Problem Statement

The current button components (SaveButton, CancelButton, ActionRow) use direct Redux theme access. They need to be refactored into a unified Button component system that consumes theme via `useTheme()` and supports variants.

---

## Requirements

### Button Component
A single `Button` component with variant props:

| Variant | Use Case | Current Equivalent |
|---------|----------|-------------------|
| `primary` | Main actions (Save, Submit, Create) | SaveButton |
| `secondary` | Secondary actions | CancelButton with different styling |
| `outline` | Tertiary actions | New |
| `ghost` | Minimal actions (icon buttons) | New |
| `danger` | Destructive actions (Delete) | New |

### Props Interface
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;  // SvgIcon name
  fullWidth?: boolean;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}
```

### ActionRow Component
Keep as layout wrapper for multiple buttons. Should not have its own theme concerns - just horizontal layout with gap.

### Theme Consumption
- All colors derived from `useTheme()` - no direct Redux access
- Primary variant uses `theme.palette.primary.500` for background
- Text colors computed for sufficient contrast
- Disabled state uses muted colors from theme
- Focus/press states use shade variations (400 for hover, 600 for press)

### Accessibility
- WCAG 2.5.5: Minimum 44px touch target (existing in `buttons.ts`)
- testID, accessibilityLabel, accessibilityHint required on all buttons
- Disabled buttons have `accessibilityState={{ disabled: true }}`

---

## Acceptance Criteria

- [ ] Single `Button` component with 5 variants
- [ ] All variants consume colors via `useTheme()` hook
- [ ] Existing SaveButton and CancelButton still work (re-export as aliases or wrappers)
- [ ] 3 sizes (sm: 32px, md: 44px, lg: 52px touch target)
- [ ] Loading state shows ActivityIndicator
- [ ] Disabled state with reduced opacity
- [ ] All buttons have testID + accessibilityLabel + accessibilityHint
- [ ] Unit tests for variant rendering logic (not visual tests)
- [ ] Unit tests for disabled/loading state behavior
- [ ] No visual regressions in existing UI

---

## Files to Create

- `BaseClient/src/components/core/Button/Button.tsx` - Main component
- `BaseClient/src/components/core/Button/Button.styles.ts` - Theme-aware styles
- `BaseClient/src/components/core/Button/index.ts` - Barrel export
- `BaseClient/src/components/core/Button/__tests__/Button.test.tsx` - Unit tests
- `BaseClient/src/components/core/ActionRow/ActionRow.tsx` - Layout wrapper
- `BaseClient/src/components/core/ActionRow/index.ts` - Barrel export
- `BaseClient/src/components/core/index.ts` - Core component barrel

## Files to Modify

- `BaseClient/src/components/Buttons/SaveButton.tsx` - Re-export as `<Button variant="primary" />`
- `BaseClient/src/components/Buttons/CancelButton.tsx` - Re-export as `<Button variant="secondary" />`

---

## Files to Reference

- `BaseClient/src/components/Buttons/SaveButton.tsx` - Current implementation
- `BaseClient/src/components/Buttons/CancelButton.tsx` - Current implementation
- `BaseClient/src/components/Buttons/ActionRow.tsx` - Current implementation
- `BaseClient/src/theme/buttons.ts` - Current button base styles (44px min-height)
- `BaseClient/src/theme/useTheme.ts` - Theme hook from Task 03

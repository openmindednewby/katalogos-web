# Task: Unit Tests for aria-label Accessibility Fixes

## Problem Statement
Three core native UI components in SyncfusionThemeStudio received `aria-label={label}` fixes on their inner `<input>` elements. We need unit tests to verify this behavior.

## Components
1. **InputNative** - Existing test file, add new tests
2. **CheckboxNative** - New test file needed
3. **SpinnerInputNative** - New test file needed (both Horizontal and Vertical variants)

## Implementation Plan
1. Add aria-label tests to `InputNative.test.tsx`
2. Create `CheckboxNative.test.tsx` with aria-label and core behavior tests
3. Create `SpinnerInputNative.test.tsx` with aria-label tests for both variants

## Tests Per Component
- aria-label is set when label prop is provided
- aria-label is not present when label prop is omitted
- Visible `<label>` element renders when label is provided

## Success Criteria
- All new tests pass
- Tests follow project conventions (vitest, @testing-library/react, logic-focused)
- Files under 300 lines
- Lint passes

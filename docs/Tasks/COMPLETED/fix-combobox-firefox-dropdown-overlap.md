# Fix Combobox Dropdown Overlap in Firefox

## Problem
E2E tests for native-forms fail in Firefox because clicking a combobox option is intercepted by the "Message" label element below the combobox. The error:
```
<label for="message" class="form-native-label">Message</label> intercepts pointer events
```

## Root Cause
The `.form-native-combobox-wrapper` has `position: relative` but no `z-index`. The dropdown inside (`.form-native-combobox-dropdown`) has `z-index: 10`, but that z-index is scoped within its parent's stacking context. Since the wrapper doesn't establish a stacking context (needs both `position` and `z-index`), the dropdown can be overlapped by subsequent `.form-native-field` siblings in the document flow.

Firefox is stricter about stacking contexts and hit-testing, causing the "Message" field's label to intercept pointer events on the dropdown options.

## Fix
Add `z-index: 1` to `.form-native-combobox-wrapper` so it creates a proper stacking context that elevates above sibling form fields below it.

## Files Modified
- `BaseClient/src/features/showcase/pages/NativeFormsPage/controlStyles.ts` - Add z-index to combobox wrapper

## Success Criteria
- [ ] Combobox dropdown renders above subsequent form fields in Firefox
- [ ] E2E combobox tests pass in Firefox
- [ ] No visual regression in Chrome or other browsers
- [ ] Lint passes
- [ ] Unit tests pass
- [ ] Build succeeds

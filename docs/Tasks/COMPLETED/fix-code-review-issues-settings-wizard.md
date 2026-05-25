# Fix Code Review Issues: Settings + Wizard

## Problem Statement
Three code review issues need fixing:

1. **Direct theme palette access** in BusinessProfileSettingsScreen (lines 36-37)
   - Uses `theme.palette.primary['500']` and `theme.semantic.error['500']`
   - Should use semantic `colors.*` tokens from `theme.colors` to match sibling sections

2. **FM('loading') consistency** in BusinessProfileSettingsScreen (line 107)
   - Uses top-level `FM('loading')` key
   - All other settings screens also use `FM('loading')` -- this IS the established pattern, leave it

3. **render* function naming** in WizardStepContent.tsx (lines 30-46)
   - Functions like `renderContinueButton`, `renderSkipButton`, `renderStep1` etc. return JSX
   - Should be PascalCase React components

## Implementation Plan

### Issue 1: Theme palette access
- Replace `theme.palette.primary['500']` with `colors.text` (matching ThemeSettingsScreen pattern)
- Replace `theme.semantic.error['500']` with `colors.text` (error is communicated by text content)
- Remove unused `primary` and `errorColor` variables

### Issue 2: FM('loading')
- Confirmed: ALL 8 settings screens use `FM('loading')` -- this IS the established pattern
- Leave as-is

### Issue 3: render* naming
- Rename all 6 functions to PascalCase components
- Update WelcomeWizard.tsx imports and call sites to use JSX syntax
- Functions already accept all data via parameters (no closure captures), so props pattern is clean

## Files to Modify
- `src/components/Settings/BusinessProfileSettings/components/BusinessProfileSettingsScreen.tsx`
- `src/components/Dashboard/components/WizardStepContent.tsx`
- `src/components/Dashboard/components/WelcomeWizard.tsx`

## Success Criteria
- No raw palette access in BusinessProfileSettingsScreen
- All wizard step functions use PascalCase naming
- All call sites updated
- Lint passes
- Unit tests pass

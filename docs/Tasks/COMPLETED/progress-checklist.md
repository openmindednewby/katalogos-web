# Progress Checklist for Dashboard (Phase 1.1, P1)

## Status: COMPLETED
## Priority: P1
## Started: 2026-03-18
## Completed: 2026-03-18

## Problem

New users need guidance on what to do next after signing up. The dashboard should show a "Set up your menu" progress checklist that tracks completion of key setup steps.

## Solution

Created a setup checklist card on the dashboard that:
1. Auto-detects completion of 5 setup steps from API data and localStorage
2. Shows a progress bar and "X of 5 complete" indicator
3. Each step is clickable, navigating to the relevant page
4. Completed steps show a visual checkmark with strikethrough text
5. Hides when all steps are complete or when dismissed by the user
6. Persists dismissal in localStorage

### Checklist Items
1. **Upload your logo** -- Checks `logoUrl` from business profile API
2. **Create your first menu** -- Checks if tenant has menus (from dashboard data)
3. **Add menu items** -- Checks if any menu has items in categories
4. **Generate a QR code** -- localStorage flag `checklist_qr_generated`
5. **Share your menu** -- localStorage flag `checklist_menu_shared`

## Files Created

- `src/shared/enums/SetupChecklistStep.ts` -- const enum for step identifiers
- `src/features/dashboard/hooks/useSetupChecklist.ts` -- Hook aggregating completion status
- `src/features/dashboard/hooks/useSetupChecklist.test.ts` -- 16 unit tests for the hook
- `src/features/dashboard/components/SetupChecklist.tsx` -- Checklist card component
- `src/features/dashboard/components/SetupChecklistItem.tsx` -- Individual checklist item row
- `src/features/dashboard/utils/setupChecklistStyles.ts` -- StyleSheet definitions
- `src/features/dashboard/utils/setupChecklistConstants.ts` -- Numeric/string constants
- `src/features/dashboard/utils/setupChecklistActions.ts` -- Utility functions for QR/share marking

## Files Modified

- `src/shared/testIds/dashboardTestIds.ts` -- Added 8 checklist test IDs
- `src/localization/locales/en.json` -- Added `dashboard.setupChecklist.*` translation keys
- `src/features/dashboard/components/DashboardPage.tsx` -- Integrated SetupChecklist component

## Verification Results

- **Lint**: PASS (no errors in new files; pre-existing MenuImport errors unrelated)
- **YAGNI**: PASS
- **Unit Tests**: PASS (16 new tests pass; pre-existing MenuContentEditor failures unrelated)
- **Prod Build**: PASS

## Standards Compliance

- All text uses `FM()` from `localization/helpers` -- zero hardcoded strings
- All translation keys added to `en.json` (not `en/core.json`)
- All interactive elements have `testID` + `accessibilityLabel` + `accessibilityHint`
- `const enum` used for `SetupChecklistStep`, in its own file
- No magic numbers -- all extracted to named constants
- Files under 300 lines, components under 200 lines, functions under 50 lines
- Unit tests focus on hook logic (completion detection, visibility, dismissal)
- No hardcoded color literals -- all from theme colors

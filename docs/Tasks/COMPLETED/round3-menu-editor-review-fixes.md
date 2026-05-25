# Round 3 Menu Editor Review Fixes

## Problem Statement
Three issues found in Round 3 menu editor code review, plus 8 files with hardcoded `opacity: 0.5` that should use the shared `DISABLED_OPACITY` constant.

## Issues

### Issue 1 (HIGH) - MetadataTab required props
`MetadataTab.tsx` declares `primaryColor` and `textOnPrimary` as required props but `EditorTabContent.tsx` doesn't pass them. Fix: make both optional with `?`.

### Issue 2 (MEDIUM) - RestoreConfirmModal missing accessibilityRole
Cancel and Confirm TouchableOpacity missing `accessibilityRole="button"`.

### Issue 3 (MEDIUM) - ScheduleEditorForm missing accessibilityRole
4 TouchableOpacity missing `accessibilityRole="button"`: Weekdays, Weekends, Save Schedule, Remove Schedule.

### Hardcoded opacity: 0.5
8 files need to import `DISABLED_OPACITY` from `@/shared/constants` instead of hardcoding `0.5`.

## Files to Modify
1. `src/components/OnlineMenus/MetadataTab.tsx` - Make props optional
2. `src/features/onlinemenus/components/RestoreConfirmModal.tsx` - Add accessibilityRole
3. `src/components/OnlineMenus/components/ScheduleEditorForm.tsx` - Add accessibilityRole
4. `src/components/Tenants/TenantListItemActions.tsx` - DISABLED_OPACITY
5. `src/components/Lists/PaginationControls.tsx` - DISABLED_OPACITY
6. `src/components/Shared/ConfirmDialog.tsx` - DISABLED_OPACITY
7. `src/components/Settings/ThemeSettings/components/PresetGrid.tsx` - DISABLED_OPACITY
8. `src/components/OnlineMenus/AiImport/utils/aiImportStyles.ts` - DISABLED_OPACITY
9. `src/features/questioner/components/DeleteInactiveButton.tsx` - DISABLED_OPACITY
10. `src/components/OnlineMenus/Styling/utils/importExportButtonsStyles.ts` - DISABLED_OPACITY
11. `src/components/OnlineMenus/MenuImport/utils/menuImportStyles.ts` - DISABLED_OPACITY

## Success Criteria
- All 3 review issues fixed
- All 8 hardcoded opacity files use DISABLED_OPACITY
- Lint passes, unit tests pass, prod build succeeds

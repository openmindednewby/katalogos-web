# Code Review: 8-Issue Cleanup

## Problem Statement
Address 8 code review findings across BaseClient, covering enum separation, hardcoded colors, magic strings, magic numbers, file length limits, and localization.

## Issues
1. **TeamRole.ts** - Two enums in one file; split `RoleSemanticColor` out
2. **versionDiffHelpers.ts** - Hardcoded hex colors; return semantic keys instead
3. **Magic strings** - Raw `'owner'`/`'pending'`/`'manager'` comparisons; use helpers/enums
4. **ScheduleEditor.tsx** - Magic numbers in StyleSheet
5. **Versioning components** - Magic numbers across 4 files; create shared constants
6. **InviteTeamMemberModal.tsx** - Over 200-line limit; move local constants out
7. **useFullMenuEditorState.ts** - `EditorTab` enum in hook file; move to own file
8. **VersionHistoryPanel.tsx** - `toLocaleString()` instead of `FD()` helper

## Files to Modify
- `src/shared/enums/TeamRole.ts` (issues 1, 3)
- `src/shared/enums/RoleSemanticColor.ts` (new - issue 1)
- `src/shared/enums/InvitationStatus.ts` (new - issue 3)
- `src/features/onlinemenus/components/utils/versionDiffHelpers.ts` (issue 2)
- `src/features/onlinemenus/components/utils/versionDiffHelpers.test.ts` (issue 2)
- `src/features/onlinemenus/components/VersionDiffView.tsx` (issue 2)
- `src/components/Settings/TeamManagement/components/TeamMemberRow.tsx` (issue 3)
- `src/components/Settings/TeamManagement/components/PendingInvitationRow.tsx` (issue 3)
- `src/components/Settings/TeamManagement/components/TeamConfirmDialogs.tsx` (issue 3)
- `src/components/Settings/TeamManagement/hooks/useTeamActions.ts` (issue 3)
- `src/components/OnlineMenus/components/ScheduleEditor.tsx` (issue 4)
- `src/features/onlinemenus/components/versioningConstants.ts` (new - issue 5)
- `src/features/onlinemenus/components/VersionHistoryPanel.tsx` (issues 5, 8)
- `src/features/onlinemenus/components/VersionDetailView.tsx` (issue 5)
- `src/features/onlinemenus/components/RestoreConfirmModal.tsx` (issue 5)
- `src/components/Settings/TeamManagement/constants.ts` (issue 6)
- `src/components/Settings/TeamManagement/components/InviteTeamMemberModal.tsx` (issue 6)
- `src/features/onlinemenus/enums/EditorTab.ts` (new - issue 7)
- `src/features/onlinemenus/hooks/useFullMenuEditorState.ts` (issue 7)
- `src/features/onlinemenus/components/EditorTabs.tsx` (issue 7)
- `src/features/onlinemenus/components/EditorTabContent.tsx` (issue 7)
- `src/features/onlinemenus/components/FullMenuEditor.tsx` (issue 7)
- `src/shared/enums/TeamRole.test.ts` (issue 3 - add isOwnerRole tests)

## Success Criteria
- All lint checks pass
- All unit tests pass
- Production build succeeds
- No hardcoded hex colors in versioning components
- Each enum in its own file
- No magic strings for role/status comparisons
- No magic numbers in StyleSheet definitions
- InviteTeamMemberModal under 200 lines
- VersionHistoryPanel uses FD() for date formatting

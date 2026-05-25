# Menu Versioning Frontend UI

## Problem Statement
The backend for menu versioning is fully implemented with 4 endpoints. We need a frontend UI
to allow users to view version history, inspect snapshots, compare versions, and restore
previous versions of their menus.

## Backend API
- `GET /TenantMenus/{menuId}/versions` - Paginated version list (page, pageSize)
- `GET /TenantMenus/{menuId}/versions/{versionId}` - Single version with full snapshot
- `POST /TenantMenus/{menuId}/versions/{versionId}/restore` - Restore a version
- `GET /TenantMenus/{menuId}/versions/{v1}/compare/{v2}` - Diff between two versions

## Implementation Plan

### Step 1: Types
- Define TypeScript interfaces matching backend DTOs
- Define ChangeType enum

### Step 2: API Hooks
- `useMenuVersions(menuId, page, pageSize)` - paginated list query
- `useMenuVersion(menuId, versionId)` - single version detail query
- `useRestoreMenuVersion()` - mutation
- `useCompareMenuVersions(menuId, v1, v2)` - comparison query

### Step 3: Utility Functions
- `formatVersionPath()` - human-readable diff path
- `getChangeSummary()` - count additions/removals/modifications
- `getChangeTypeColor()` - color mapping for change types

### Step 4: Translation Keys
- Add all versioning strings to `en.json` under `onlineMenus.versioning`

### Step 5: Test IDs
- Add versioning test IDs to a new `versioningTestIds.ts`

### Step 6: UI Components
- `VersionHistoryPanel` - side panel with paginated version list
- `VersionDetailView` - snapshot preview with restore/compare buttons
- `VersionDiffView` - diff display with colored change types

### Step 7: Integration
- Add "Version History" tab to EditorTabs
- Wire up in FullMenuEditor

### Step 8: Unit Tests
- Test hooks (query key generation, enabled logic)
- Test utility functions (path formatting, summary generation)

## Files to Create/Modify
- `src/server/customHooks/useMenuVersions.ts` (new)
- `src/server/customHooks/useMenuVersion.ts` (new)
- `src/server/customHooks/useRestoreMenuVersion.ts` (new)
- `src/server/customHooks/useCompareMenuVersions.ts` (new)
- `src/server/customHooks/useMenuVersions.test.ts` (new)
- `src/server/customHooks/useMenuVersion.test.ts` (new)
- `src/server/customHooks/useRestoreMenuVersion.test.ts` (new)
- `src/server/customHooks/useCompareMenuVersions.test.ts` (new)
- `src/features/onlinemenus/types.ts` (modify - add version types)
- `src/features/onlinemenus/components/VersionHistoryPanel.tsx` (new)
- `src/features/onlinemenus/components/VersionDetailView.tsx` (new)
- `src/features/onlinemenus/components/VersionDiffView.tsx` (new)
- `src/features/onlinemenus/components/utils/versionDiffHelpers.ts` (new)
- `src/features/onlinemenus/components/utils/versionDiffHelpers.test.ts` (new)
- `src/shared/testIds/versioningTestIds.ts` (new)
- `src/shared/testIds.ts` (modify - add import)
- `src/shared/enums/VersionChangeType.ts` (new)
- `src/localization/locales/en.json` (modify - add versioning keys)
- `src/features/onlinemenus/components/EditorTabs.tsx` (modify - add History tab)
- `src/features/onlinemenus/hooks/useFullMenuEditorState.ts` (modify - add History tab)

## Success Criteria
- All 4 version API hooks work correctly
- Version history is accessible from the menu editor
- Users can view, compare, and restore versions
- All text uses FM() translations
- All interactive elements have testID + a11y
- Unit tests pass for hooks and utilities
- Lint, YAGNI, unit tests, prod build all pass via Tilt

## Additional Files Modified (pre-existing issue fixes)
- `src/components/OnlineMenus/components/ScheduleEditor.tsx` - Reduced file to 200 lines
- `src/components/OnlineMenus/components/SeasonalAvailabilityPicker.tsx` - Prefixed unused params
- `src/components/OnlineMenus/utils/scheduleUtils.ts` - Fixed enum comparison
- `src/components/Settings/TeamManagement/hooks/useTeamMutations.ts` - Split function under 30 lines
- `src/server/customHooks/useMenuSchedule.ts` - Fixed void usage
- `src/server/customHooks/useMenuSchedule.test.ts` - Fixed deprecated import and assertions
- `src/features/onlinemenus/components/RestoreConfirmModal.tsx` (new) - Extracted from VersionDetailView

## Verification Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED (314 suites, 3908 tests)
- frontend-prod-build: PASSED

## Status: COMPLETED

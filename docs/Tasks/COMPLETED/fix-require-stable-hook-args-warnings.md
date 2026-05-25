# Fix require-stable-hook-args ESLint Warnings

## Status: COMPLETED

## Problem Statement
There were 20 `require-stable-hook-args` ESLint warnings across 14 files. These warnings indicated that inline objects or functions were being passed as arguments to custom hooks, which can cause infinite re-renders because React creates new object references on every render.

## Root Cause
Inline object literals `{ key: value }` passed directly to custom hooks create new object references each render cycle. Custom hooks that use these objects in dependency arrays will re-execute on every render, potentially causing performance issues or infinite loops.

## Implementation Plan
For each warning, extract the inline object into a `useMemo()` call with the appropriate dependency array.

## Files Modified
1. `app/(protected)/menus/index.tsx` - 3 warnings: wrapped useMenuDelete, useMenuActivateToggle, useMenuSave args in useMemo
2. `app/(protected)/tenants/index.tsx` - 1 warning: wrapped useTenantActions arg in useMemo
3. `app/(protected)/users/index.tsx` - 4 warnings: wrapped useCreateUser, useDeleteUser, useToggleUserEnabled, usePasswordSubmit args in useMemo
4. `src/components/Content/ContentImage.tsx` - 1 warning: wrapped useContentImageUrl arg in useMemo
5. `src/components/Content/ContentUploader.tsx` - 1 warning: extracted callbacks to useCallback, wrapped useUploadContent arg in useMemo, used useRef for onChange to avoid stale closure
6. `src/components/Settings/NotificationPreferencesScreen.tsx` - 1 warning: wrapped useUpdateNotificationPreferences arg in useMemo
7. `src/components/Tenants/TenantForm.tsx` - 1 warning: wrapped useTenantFormState arg in useMemo
8. `src/components/Tenants/useTenantFormState.ts` - 1 warning: wrapped useAuthState arg in useMemo
9. `src/components/ui/TableNative/hooks/useTableDragDrop.ts` - 1 warning: wrapped ctx DropContext in useMemo
10. `src/components/ui/form-fields/FormNativeSelect.tsx` - 1 warning: wrapped useCombobox arg in useMemo
11. `src/components/ui/form-fields/useCombobox.ts` - 1 warning: wrapped ComboboxState in useMemo
12. `src/hooks/quiz-templates/useTemplateMutations.ts` - 2 warnings: wrapped useSaveAndCreateHandlers and useDeleteAndActivateHandlers args in useMemo
13. `src/hooks/useQuizTemplateActions.ts` - 1 warning: wrapped useTemplateMutations arg in useMemo
14. `src/hooks/useTenantActions.ts` - 1 warning: wrapped useTenantMutations arg in useMemo

## Success Criteria
- [x] `npm run lint 2>&1 | grep "require-stable-hook-args"` returns no results (0 warnings)
- [x] `npm run test:coverage` - all 132 suites, 1746 tests pass
- [x] `npx expo export --platform web` - build succeeds
- [x] No new `react-hooks/exhaustive-deps` warnings introduced

## Test Results
- Lint: 0 require-stable-hook-args warnings (was 20)
- Tests: 132 passed, 132 total
- Build: Exported successfully to dist/

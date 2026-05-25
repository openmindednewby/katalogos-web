# Fix Module Structure Violations - Non-Component Directories

## Problem Statement
Seven non-component directories violate the module structure convention (ESLint `enforce-module-structure` rule). Files need to be reorganized into `hooks/`, `utils/`, and `components/` subdirectories.

## Directories Fixed (36 violations total)

1. `src/theme/` (16 violations) - hooks, components, utils
2. `src/hooks/quiz/` (4 violations) - hooks, utils
3. `src/lib/http/` (4 violations) - utils only
4. `src/lib/notifications/` (4 violations) - utils only
5. `src/hooks/theme/` (3 violations) - hooks, utils
6. `src/lib/hooks/content/` (3 violations) - hooks, utils
7. `src/lib/theme/` (2 violations) - utils only

## Implementation Summary

### Directory 7: `src/lib/theme/` (2 violations)
- Created `utils/` subdirectory
- Moved `fetchTenantTheme.ts`, `themeCacheStorage.ts` + test to `utils/`
- `themeCacheTypes.ts` stays at root (types file)
- Updated barrel, internal imports, and external consumers

### Directory 6: `src/lib/hooks/content/` (3 violations)
- Created `hooks/` and `utils/` subdirectories
- Moved `useContent.ts`, `useUploadContent.ts` + tests to `hooks/`
- Moved `uploadUtils.ts` to `utils/`
- `types.ts` stays at root
- Updated barrel and internal imports

### Directory 5: `src/hooks/theme/` (3 violations)
- Created `hooks/` and `utils/` subdirectories
- Moved `useTenantTheme.ts` + test, `useTenantThemeMutation.ts` to `hooks/`
- Moved `TenantThemeBridge.ts` to `utils/`
- Updated barrel, internal imports, and 4 external consumers

### Directory 4: `src/lib/notifications/` (4 violations)
- Created `utils/` subdirectory
- Moved `eventBus.ts`, `serviceWorkerRegistration.ts` + test, `testNotificationApi.ts`, `notificationHelpers.ts` to `utils/`
- Updated barrel and internal imports

### Directory 3: `src/lib/http/` (4 violations)
- Created `utils/` subdirectory
- Moved `endpoints.ts` + test, `methods.ts` + test, `utils.ts` + test, `validation.ts` + test to `utils/`
- `types.ts` + test stays at root
- Updated barrel, internal imports, mock paths, and 3 external consumers

### Directory 2: `src/hooks/quiz/` (4 violations)
- Created `hooks/` and `utils/` subdirectories
- Moved `useQuizForm.ts` + test, `useQuizFormState.ts` + test, `useQuizNavigation.ts` to `hooks/`
- Moved `quizHelpers.ts` + 6 test files to `utils/`
- Updated barrel and all internal/test imports

### Directory 1: `src/theme/` (16 violations)
- Created `hooks/`, `components/`, `utils/` subdirectories
- Moved `useTheme.ts` to `hooks/`
- Moved `ThemeProvider.tsx` + test to `components/`
- Moved 14 files to `utils/`: ThemeContext, buttons, forms, hooks + test, layout, layoutDrawer, layoutForms, layoutSidebar, layoutTopbar, palette-generator + test, palette, resolveTheme, styles, typography
- `types.ts` and `presets/` stay at root (types file and exempt directory)
- Batch-updated ~66 files importing from `theme/useTheme` -> `theme/hooks/useTheme`
- Batch-updated ~45 files importing from `theme/styles` -> `theme/utils/styles`
- Batch-updated ~15 `jest.mock()` paths for theme/useTheme

## Final Verification
- All stale direct imports verified as eliminated (grep sweeps for all old paths)
- All jest.mock/jest.doMock paths updated
- All barrel index.ts files correctly point to new subdirectory paths
- Public API unchanged for all 7 directories
- Doc comment in hooks.ts updated to reflect new useTheme path

## Status: COMPLETED

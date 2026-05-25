# Fix Calendar, Gantt Chart, and File Manager Pages

## Status: COMPLETED
## Priority: MEDIUM
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
Three Syncfusion component pages have rendering/functionality bugs:
1. Calendar - Missing header navigation (no CSS loading for Schedule module)
2. Gantt Chart - Blank timeline + unstyled toolbar (no CSS loading for Gantt module)
3. File Manager - Network error (API endpoint doesn't exist, needs mock data provider)

## Root Causes
1. **Calendar**: ScheduleView.tsx never called `loadSyncfusionCss`. The `SyncfusionCssModule` enum had no `Schedule` entry.
2. **Gantt**: GanttView.tsx never called `loadSyncfusionCss`. The `SyncfusionCssModule` enum had no `Gantt` entry.
3. **File Manager**: Pointed to `/mockapi/api/files/operations` which doesn't exist on the backend.
4. **i18n**: `common.all` translation key was missing from all locale files.

## Changes Made

### Bug 1: Calendar - Missing Header Navigation
- Added `Schedule = 'schedule'` to `SyncfusionCssModule` enum in `loadSyncfusionCss.ts`
- Added CSS loader for `@syncfusion/ej2-react-schedule/styles/tailwind.css`
- Added `useEffect` with `loadSyncfusionCss(SyncfusionCssModule.Schedule)` to `ScheduleView.tsx`
- This loads the Schedule CSS including header/toolbar/navigation styles

### Bug 2: Gantt Chart - Blank Timeline + Unstyled Toolbar
- Added `Gantt = 'gantt'` to `SyncfusionCssModule` enum in `loadSyncfusionCss.ts`
- Added CSS loader for `@syncfusion/ej2-react-gantt/styles/tailwind.css`
- Added `useEffect` with `loadSyncfusionCss(SyncfusionCssModule.Gantt)` to `GanttView.tsx`
- This loads the Gantt CSS including timeline bars, toolbar buttons, and chart styles
- Added `common.all` key to all four locale files (en, de, es, he) to fix raw i18n key display

### Bug 3: File Manager - Network Error
- Replaced AJAX-based `ajaxSettings` with Syncfusion's `fileSystemData` property for local-only operation
- Created `src/features/file-manager/data/fileSystemData.ts` with mock folder/file hierarchy
- Mock data includes: root, 3 top-level folders (Documents, Images, Downloads), 1 subfolder (Reports), and 7 files of various types
- Removed unused API URL constants from `constants.ts` (replaced with `FILE_MANAGER_HEIGHT`)
- Updated constants test accordingly
- No network requests are made; FileManager operates entirely on local data

## Files Modified
- `src/utils/loadSyncfusionCss.ts` - Added Schedule and Gantt CSS module entries
- `src/features/calendar/pages/CalendarPage/components/ScheduleView.tsx` - Added CSS loading via useEffect
- `src/features/gantt/pages/GanttPage/components/GanttView.tsx` - Added CSS loading via useEffect
- `src/features/file-manager/pages/FileManagerPage/components/FileManagerView.tsx` - Switched to fileSystemData prop
- `src/features/file-manager/data/fileSystemData.ts` - NEW: Mock file system data
- `src/features/file-manager/constants.ts` - Replaced API URLs with FILE_MANAGER_HEIGHT
- `src/features/file-manager/constants.test.ts` - Updated tests for new constants
- `src/localization/locales/en.json` - Added `common.all: "All"`
- `src/localization/locales/de.json` - Added `common.all: "Alle"`
- `src/localization/locales/es.json` - Added `common.all: "Todos"`
- `src/localization/locales/he.json` - Added `common.all: "הכל"`

## Verification
- TypeScript: `npx tsc --noEmit` - no errors (excluding pre-existing DiagramCanvas issue)
- Lint: `npx eslint` - all modified files pass with --max-warnings 0
- Tests: 115 test files, 1523 tests all pass
- Build: `npx vite build` - succeeds

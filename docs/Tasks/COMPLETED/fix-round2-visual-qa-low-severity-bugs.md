# Fix Round 2 Visual QA LOW Severity Bugs

## Problem Statement
Four LOW severity bugs found during round 2 visual QA of the SyncfusionThemeStudio app.

## Issues and Resolutions

### Issue 1: Replace hardcoded Tailwind colors with semantic tokens -- FIXED
Files modified:
- `IntegrationCards.tsx`: `bg-green-*`/`text-green-*` -> `bg-success-50`/`text-success-700`; `bg-gray-*`/`text-gray-*` -> `bg-surface-200`/`text-text-muted`; `border-status-error`/`hover:bg-red-*` -> `border-error-500`/`hover:bg-error-50`
- `IntegrationDetail.tsx`: `text-green-600 dark:text-green-400` -> `text-success-500`; `text-gray-500` -> `text-text-muted`
- `PluginDetail.tsx`: Same badge pattern as IntegrationCards
- `UserRoleBadge.tsx`: Manager `bg-blue-*`/`text-blue-*` -> `bg-primary-50`/`text-primary-700`; Viewer `bg-gray-*`/`text-gray-*` -> `bg-surface-200`/`text-text-muted`
- `UsersTable.tsx`: `text-red-600` and `text-red-500`/`hover:text-red-700` -> `text-error-500`/`hover:text-error-700`
- `RolesTable.tsx`: `text-status-error hover:text-red-700` -> `text-error-500 hover:text-error-700`
- `RoleBadge.tsx`: `bg-blue-*`/`text-blue-*` -> `bg-primary-50`/`text-primary-700`; `bg-emerald-*`/`text-emerald-*` -> `bg-success-50`/`text-success-700`
- `SidebarMainNav.tsx`: `bg-red-500` -> `bg-error-500`
- `RoleManagementPage/index.tsx`: `text-status-error` -> `text-error-500` (bonus fix, `status-error` was not a defined token)

### Issue 2: LandingFooter semantic HTML -- ALREADY CORRECT
LandingFooter already uses `<footer>` element. No change needed.

### Issue 3: Integration buttons aria-labels -- FIXED
Added descriptive `aria-label` props to:
- Connect/Disconnect toggle button: `Connect {name}` / `Disconnect {name}`
- Details button: `View {name} details`

### Issue 4: Toast auto-dismiss timing -- ALREADY CORRECT
`AUTO_DISMISS_MS = 5000` (5 seconds) is already >= 3 seconds. No change needed.

## Tests
- Updated `UserRoleBadge.test.ts` to match new semantic token class names
- All 21 admin tests pass
- TypeScript type check passes
- ESLint passes on all modified files

## Status: COMPLETED

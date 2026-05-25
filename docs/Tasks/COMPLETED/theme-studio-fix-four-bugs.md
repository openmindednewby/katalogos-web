# Fix Broken Routes, Diagram Toolbar, Products Filter, Hardcoded Colors

## Status: COMPLETED
## Priority: HIGH
## Domain: SyncfusionThemeStudio (Frontend)

## Investigation Results

### Bug 1: Broken Routes - FALSE POSITIVE
The sidebar navigation uses `RoutePath` enum values that are ALL correctly registered in `router.tsx`.
The bug report mentioned `/admin/users`, `/admin/settings`, `/alerts` but actual routes are:
- `/admin/user-management` (RouteSegment.AdminUserManagement) - registered and working
- `/admin/system-settings` (RouteSegment.AdminSystemSettings) - registered and working
- `/alerts-incidents/alerts-management` (RouteSegment.AlertsManagement) - registered and working
All sidebar items use RoutePath enum constants which match the router registrations. No fix needed.

### Bug 2: Diagram Toolbar - ALREADY STYLED
DiagramToolbar.tsx already has proper Tailwind styling:
- `BUTTON_DEFAULT`: `rounded-md px-3 py-1.5 text-sm font-medium bg-surface-alt text-text-secondary hover:bg-surface-hover`
- `BUTTON_DANGER`: `bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200`
- Proper button grouping with `<span>` separators
- All buttons have data-testid attributes
No fix needed.

### Bug 3: Products Filter - MENU TYPE (no filter bar)
Products page uses `FilterType.Menu` which shows filter via column header menu popup click, not an inline filter bar row. The default filter settings are `type: 'Menu'`. There is no visible filter bar row to be "unstyled". No fix needed.

### Bug 4: Hardcoded Colors - FIXED
Replaced all hardcoded hex colors with theme-aware alternatives.

## Changes Made

### AlertKpiCards.tsx
- Replaced `#EF4444`, `#10B981`, `#7B7B7B` trend colors with `text-error-500`, `text-success-500`, `text-text-muted` Tailwind classes
- Replaced `bg-white border-[#DFDFDF] dark:bg-[#262C39] dark:border-[#39404B]` card theme with `bg-surface border-border`
- Replaced `text-[#9397A3] dark:text-[#555B66]` drag handle with `text-text-muted`
- Replaced `text-[#A5A8B4] hover:text-[#3B4559]` kebab icon with `text-text-muted hover:text-text-primary`
- Replaced `text-[#3B4559] dark:text-[#DFDFDF]` value text with `text-text-primary`
- Replaced `text-[#646464] dark:text-[#9397A3]` label text with `text-text-secondary`
- Changed `TrendDisplay.color` (inline style) to `TrendDisplay.className` (Tailwind class)

### LoginBackground.tsx
- Replaced `#0B2535` with `var(--login-bg)`
- Replaced `#0E3A4A` with `var(--login-swoosh-primary)`
- Replaced `#155A6E` with `var(--login-swoosh-secondary)`

### LoginFormPanel.tsx
- Replaced `rgba(255, 255, 255, 0.8)` with `var(--login-panel-bg)`
- Replaced `#005368` label color with `var(--login-label)`
- Replaced `#fff` input bg with `var(--login-input-bg)`
- Replaced `#00B5E2` focus border with `var(--login-focus-border)`
- Replaced `rgba(0, 181, 226, 0.3)` focus ring with `var(--login-focus-ring)`
- Replaced `#006D87` button bg with `var(--login-btn-bg)`
- Replaced `#005368` button hover with `var(--login-btn-hover)`
- Replaced `#fff` button text with `var(--login-btn-text)`

### login.css
- Added `:root` block with 13 login brand CSS custom properties
- Updated `.native-input`, `.native-input-label`, `.native-btn-login`, `.native-link-subtle` to use CSS variables

## Verification
- TypeScript: passes (only pre-existing DiagramCanvas and FileManagerView errors remain)
- Vite build: succeeds
- No new errors introduced

## Files Modified
- `src/features/alerts-incidents/pages/AlertsManagementPage/components/AlertKpiCards.tsx`
- `src/features/auth/pages/LoginPage/components/LoginBackground.tsx`
- `src/features/auth/pages/LoginPage/components/LoginFormPanel.tsx`
- `src/styles/login.css`

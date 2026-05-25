# Fix Broken Routes - 404 Pages for Sidebar Navigation Items

## Status: TODO
## Priority: HIGH
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
Several sidebar navigation items link to routes that return 404:
1. **User Management** (`/admin/users`) - Shows 404
2. **System Settings** (`/admin/settings`) - Shows 404
3. **Alerts & Incidents** (`/alerts`) - Shows 404

These pages exist in `src/features/` but their routes are either not registered or use different URL paths.

## Investigation Needed
- Check route definitions in the router config
- Compare sidebar nav URLs with actual route paths
- The features exist (UserManagementPage, SystemSettingsPage, AlertsManagementPage) but routes may be mismatched

## Tasks
- [ ] Audit all sidebar navigation items and verify their target URLs
- [ ] Fix route registration for User Management page
- [ ] Fix route registration for System Settings page
- [ ] Fix route registration for Alerts & Incidents page
- [ ] Check for any other sidebar items that lead to 404
- [ ] Add E2E test to verify all sidebar nav items resolve to valid pages

## Files
- Router config file (check `src/routes/` or `src/app/`)
- `src/features/admin/pages/UserManagementPage/`
- `src/features/admin/pages/SystemSettingsPage/`
- `src/features/alerts-incidents/pages/AlertsManagementPage/`

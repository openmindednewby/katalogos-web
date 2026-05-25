# Fix Visual QA Low Severity Bugs (#8-#12)

## Problem Statement
Five LOW severity accessibility and UX issues found during visual QA of SyncfusionThemeStudio app.

## Issues
1. **#8** NotFoundPage button missing data-testid and aria-label
2. **#9** Dashboard "Explore Components" and "Theme Editor" buttons missing aria-label
3. **#10** Settings save buttons don't indicate demo mode
4. **#11** SpecDataGrid hardcoded hex colors (deprecated component - add TODO only)
5. **#12** Landing page hero CTA buttons missing aria-label

## Files Modified
- `SyncfusionThemeStudio/src/features/not-found/NotFoundPage.tsx`
- `SyncfusionThemeStudio/src/features/dashboard/pages/DashboardPage/index.tsx`
- `SyncfusionThemeStudio/src/features/settings/SettingsPage/sections/AccountSettings.tsx`
- `SyncfusionThemeStudio/src/features/settings/SettingsPage/sections/AppearanceSettings.tsx`
- `SyncfusionThemeStudio/src/features/settings/SettingsPage/sections/NotificationSettings.tsx`
- `SyncfusionThemeStudio/src/features/components/shared/SpecDataGrid.tsx`
- `SyncfusionThemeStudio/src/features/landing/pages/LandingPage/components/HeroSection.tsx`

## Success Criteria
- All buttons have aria-label attributes
- NotFoundPage button has data-testid matching other error pages
- Settings save feedback indicates demo mode
- SpecDataGrid has TODO comment for color migration
- Lint passes, build succeeds

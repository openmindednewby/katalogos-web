# Mobile Responsive Layout - Sidebar & Theme Settings Panel

## Problem Statement

At mobile viewport widths (375px), the sidebar navigation and Theme Settings drawer panel together occupy the full viewport width, completely blocking the page content. The playground controls are unreachable. This affects all pages in the SyncfusionThemeStudio app.

The root layout is `grid-cols-[auto_1fr_auto]` with:
- Left: Sidebar (310px expanded, 64px collapsed)
- Center: Main content (1fr)
- Right: ThemeSettingsDrawer (520px expanded, 52px collapsed)

At 375px viewport width: 310 + 52 = 362px minimum (sidebar expanded + theme panel collapsed), leaving only 13px for content. With both expanded: 310 + 520 = 830px, far exceeding viewport.

## Implementation

### Approach: Custom hook `useIsMobile` + auto-collapse behavior + mobile overlays

1. Created `useIsMobile` hook - Listens to `matchMedia('(max-width: 768px)')` and returns a boolean
2. Auto-collapse sidebar on mobile - When mobile is detected, automatically collapse sidebar
3. Auto-close theme settings on mobile - When mobile is detected, auto-close the theme settings panel
4. Added mobile overlay for sidebar - When sidebar is expanded on mobile, shows as a fixed overlay with backdrop
5. Added mobile overlay for theme panel - When theme panel is opened on mobile, shows as a fixed overlay with backdrop
6. Updated MainLayout grid - On mobile, uses single-column `grid-cols-[1fr]` instead of three-column
7. Added hamburger menu button to Header - On mobile, shows an IconMenu button to open sidebar
8. Clicking backdrop closes overlays - Both sidebar and theme panel backdrops dismiss their panels

### Files Modified

1. `SyncfusionThemeStudio/src/hooks/useIsMobile.ts` - NEW: mobile detection hook using matchMedia
2. `SyncfusionThemeStudio/src/hooks/useIsMobile.test.ts` - NEW: 4 unit tests for hook
3. `SyncfusionThemeStudio/src/components/layout/MainLayout/index.tsx` - Added isMobile prop passing, mobile grid layout
4. `SyncfusionThemeStudio/src/components/layout/Sidebar/index.tsx` - Added isMobile prop, auto-collapse, overlay mode, backdrop
5. `SyncfusionThemeStudio/src/components/layout/ThemeSettingsDrawer/index.tsx` - Added isMobile prop, auto-close, overlay mode, backdrop
6. `SyncfusionThemeStudio/src/components/layout/Header/index.tsx` - Added hamburger menu button on mobile
7. `SyncfusionThemeStudio/src/styles/layers/components-app.css` - Added mobile overlay CSS classes
8. `SyncfusionThemeStudio/src/localization/locales/en.json` - Added i18n keys for mobile overlays
9. `SyncfusionThemeStudio/src/shared/testIds.ts` - Added SIDEBAR_BACKDROP, MOBILE_MENU_BUTTON test IDs

### Results

- [x] At 375px width, main content area is fully visible and usable (single-column grid)
- [x] Sidebar collapses automatically on mobile viewports
- [x] Theme settings panel auto-closes on mobile viewports
- [x] Both panels can be opened as overlays on mobile
- [x] Clicking backdrop closes the overlay
- [x] No layout shift or content blocking
- [x] All existing desktop behavior preserved (three-column grid on desktop)
- [x] All 1205 unit tests pass (including 4 new)
- [x] Lint passes with no errors
- [x] Build succeeds
- [x] All files within size limits (max 188 lines)

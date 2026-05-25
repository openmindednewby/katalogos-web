# Interactive Tooltips (Phase 1.1, P2)

## Status: COMPLETED

## Problem Statement
New users have no guided introduction to key UI elements. The application needs contextual first-time hints that highlight important features (dashboard, menu editor, public menu preview) to help users discover the interface on their first visit.

## Implementation Summary

### Core Infrastructure (created in prior work)
1. `TooltipPlacement` enum (`src/shared/enums/TooltipPlacement.ts`) - top/bottom/left/right placement
2. `TooltipTourId` enum (`src/shared/enums/TooltipTourId.ts`) - dashboard/editor/public-menu identifiers
3. `types.ts` - TooltipStep, TooltipTour, TooltipTourState interfaces
4. `constants.ts` - TOUR_SEEN_KEY_PREFIX for localStorage
5. `useTooltipTour` hook - Step progression, localStorage persistence, dismiss, reset logic
6. `TooltipProvider` context - App-wide tour state via React context
7. `TooltipOverlay` component - Full-screen overlay with spotlight cutout, backdrop dismiss, Escape key
8. `TooltipBubble` component - Tooltip bubble with title, description, step counter, Next/Skip buttons
9. `tooltipOverlayStyles.ts` - Extracted style constants (no magic numbers)
10. `targetElement.ts` - getBoundingClientRect-based positioning, scroll-into-view
11. `tourDefinitions.ts` - 3 tour definitions (dashboard, editor, public-menu) with 3 steps each
12. `tooltipTourTestIds.ts` - Test IDs for all tooltip tour elements
13. Translation keys in `en.json` under `tooltipTour.*`

### Integration Points (completed in this session)
14. **Dashboard tour trigger** (`DashboardPage.tsx`) - Triggers on first visit after wizard completes
15. **Editor tour trigger** (`FullMenuEditor.tsx`) - Triggers when editor modal becomes visible for the first time
16. **Public menu tour trigger** (`app/(protected)/menus/index.tsx`) - Triggers on menus list page when user has menus
17. **Reset tooltips button** (`PreferencesSettingsScreen.tsx`) - "Reset Guided Tours" button in Preferences Settings
18. **Tour storage utility** (`src/lib/tourStorage.ts`) - Shared localStorage reset function (avoids product-import-in-shared violation)
19. **Provider + Overlay wiring** (`app/_layout.tsx`) - TooltipProvider wraps InnerApp, TooltipOverlay rendered after Stack

### Files Created
- `src/shared/enums/TooltipPlacement.ts`
- `src/shared/enums/TooltipTourId.ts`
- `src/shared/testIds/tooltipTourTestIds.ts`
- `src/features/tooltipTour/types.ts`
- `src/features/tooltipTour/constants.ts`
- `src/features/tooltipTour/hooks/useTooltipTour.ts`
- `src/features/tooltipTour/hooks/useTooltipTour.test.ts`
- `src/features/tooltipTour/data/tourDefinitions.ts`
- `src/features/tooltipTour/data/tourDefinitions.test.ts`
- `src/features/tooltipTour/components/TooltipOverlay.tsx`
- `src/features/tooltipTour/components/TooltipBubble.tsx`
- `src/features/tooltipTour/components/TooltipProvider.tsx`
- `src/features/tooltipTour/components/tooltipOverlayStyles.ts`
- `src/features/tooltipTour/utils/targetElement.ts`
- `src/lib/tourStorage.ts`

### Files Modified
- `src/localization/locales/en.json` - 30+ tooltip tour translation keys + reset tooltip keys + closePreviewHint
- `src/shared/testIds.ts` - Import and spread TooltipTourTestIds
- `src/shared/testIds/profileTestIds.ts` - PREFERENCES_RESET_TOOLTIPS_BUTTON testID
- `src/features/dashboard/components/DashboardPage.tsx` - Dashboard tour trigger
- `src/features/onlinemenus/components/FullMenuEditor.tsx` - Editor tour trigger
- `app/(protected)/menus/index.tsx` - Public menu tour trigger
- `app/_layout.tsx` - TooltipProvider + TooltipOverlay integration
- `src/components/Settings/PreferencesSettings/components/PreferencesSettingsScreen.tsx` - Reset tooltips button

### Bug Fixes (pre-existing)
- `src/components/OnlineMenus/MenuPreviewModal.tsx` - Hardcoded accessibility hint string replaced with FM()
- `src/components/PublicMenu/components/MenuItemDisplay.tsx` - Unnecessary `??` operator replaced with `String()`

### Tour Definitions

**Dashboard Tour** (3 steps):
1. Dashboard overview card - welcomes user to their home base
2. Quick actions - highlights create menu/survey buttons
3. Setup checklist - guides through business setup steps

**Editor Tour** (3 steps):
1. Editor tabs - explains tab navigation (categories, items, settings)
2. Auto-save indicator - explains auto-save behavior
3. Preview tab - shows how to preview the menu

**Public Menu Tour** (3 steps):
1. Theme selector - explains theme customization
2. QR code button - shows QR code generation
3. Share button - highlights sharing options

### Unit Tests
- `useTooltipTour.test.ts` - 10 tests (start, advance, finish, dismiss, persistence, reset, invalid tour, no-op)
- `tourDefinitions.test.ts` - 10 tests (IDs, step counts, uniqueness, required fields, registry completeness)

### Quality Gate Results
- `frontend-lint-fix`: OK
- `frontend-yagni`: OK
- `frontend-unit-tests`: OK
- `frontend-prod-build`: OK

### Accessibility
- Tooltip overlay has `accessibilityRole="alert"` for screen reader announcements
- All interactive elements have `testID`, `accessibilityLabel`, and `accessibilityHint`
- Escape key dismisses the active tour
- Backdrop press dismisses the tour
- Focus management via spotlight highlight

### Translation Keys
All text uses `FM()` from `localization/helpers`. 30+ keys added to `en.json` under `tooltipTour.*` namespace and `settings.preferences.resetTooltips*`.

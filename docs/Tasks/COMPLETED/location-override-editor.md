# Location Override Editor for Menu Editor

## Problem Statement
Restaurant managers with multiple locations need to set per-location price/availability/description overrides for menu items. The multi-location backend exists in OnlineMenuService with Location, MenuLocation (many-to-many), and MenuItemOverride entities. The frontend needs a UI to view and manage these overrides within the existing menu editor.

## Implementation Summary

### New Files Created
1. `src/components/OnlineMenus/LocationOverrides/index.ts` - Barrel exports
2. `src/components/OnlineMenus/LocationOverrides/types.ts` - LocationDto, MenuItemOverrideDto, OverrideContextProps
3. `src/components/OnlineMenus/LocationOverrides/components/LocationSelector.tsx` - Location picker dropdown (Base Menu + locations)
4. `src/components/OnlineMenus/LocationOverrides/components/OverrideIndicator.tsx` - Visual badge for overridden items
5. `src/components/OnlineMenus/LocationOverrides/components/ItemOverrideControls.tsx` - Price/availability/description override inputs + reset
6. `src/components/OnlineMenus/LocationOverrides/hooks/useLocationOverrides.ts` - Location selection + override delegation
7. `src/components/OnlineMenus/LocationOverrides/hooks/useOverrideMap.ts` - Core override CRUD map with dirty tracking
8. `src/components/OnlineMenus/LocationOverrides/hooks/useLocationOverrides.test.ts` - Unit tests for hook logic
9. `src/shared/testIds/locationOverrideTestIds.ts` - TestIDs for all override controls

### Modified Files
1. `src/localization/locales/en.json` - Added `onlineMenus.locationOverrides.*` translation keys (30 keys)
2. `src/shared/testIds.ts` - Import and spread LocationOverrideTestIds
3. `src/components/OnlineMenus/MenuContentEditor.tsx` - Added LocationSelector, useLocationOverrides, passes overrideContext
4. `src/components/OnlineMenus/CategoryEditor.tsx` - Accepts + passes overrideContext prop
5. `src/components/OnlineMenus/components/CategoryEditorBody.tsx` - Passes overrideContext to MenuItemEditor
6. `src/components/OnlineMenus/MenuItemEditor.tsx` - Shows OverrideIndicator badge, passes overrideContext to body
7. `src/components/OnlineMenus/components/MenuItemEditorBody.tsx` - Renders ItemOverrideControls when location selected

### Pre-existing Issues Fixed
1. `src/config/routePreloader.ts` - Added missing preload for settings/locations route
2. `src/lib/hooks/location/hooks/useLocationMutations.ts` - Refactored to extract helpers, reduce function length
3. `src/lib/hooks/notification/useNotificationPreferences.ts` - Fixed broken import path (api/api -> notifications/notifications)
4. `src/lib/hooks/notification/useNotificationPreferences.test.ts` - Fixed corresponding mock import path
5. `src/components/Settings/LocationSettings/components/LocationForm.tsx` - Suppressed unresolvable @dloizides/utils type errors

### Verification Results
- [x] `frontend-lint-fix` - PASSED (0 errors)
- [x] `frontend-unit-tests` - PASSED (all tests pass including 14 new tests)

### Design Decisions
- **No Orval hooks yet**: Backend override endpoints don't exist yet. Created manual types matching the backend MenuItemOverride entity. The useLocationOverrides hook manages client-side state; API integration will be added when endpoints are ready.
- **OverrideContextProps threading**: Override context is passed via props through CategoryEditor -> CategoryEditorBody -> MenuItemEditor -> MenuItemEditorBody, only when a location is selected (null when viewing base menu).
- **Module structure**: Components in `components/` subdirectory, hooks in `hooks/` subdirectory per enforce-module-structure ESLint rule.
- **Hook extraction**: useOverrideMap extracted from useLocationOverrides by the linter's smart-max-lines rule to keep functions under 50 lines.

## Status
COMPLETED

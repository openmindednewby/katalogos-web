# Location Picker for Public Menu Page

## Status: COMPLETE

## Problem Statement
When a menu is available at multiple locations, customers need to select their location to see location-specific prices and availability. The backend `GET /api/v1/public/menus/{id}` already supports an optional `?locationId={guid}` query parameter.

## Implementation Summary

### Files Created
- `src/components/PublicMenu/hooks/usePublicMenuLocation.ts` -- Hook for location selection with URL persistence
- `src/components/PublicMenu/hooks/usePublicMenuLocation.test.ts` -- 14 unit tests for hook logic
- `src/components/PublicMenu/components/LocationPicker.tsx` -- Themed dropdown component

### Files Modified
- `src/server/customHooks/usePublicMenuGetById.ts` -- Added `locationId` param to fetch function, query key, and hook signature
- `app/public/menu/[id].tsx` -- Wired location hook, extracts locations from API response, passes to MenuDisplay/MenuContentView
- `src/components/PublicMenu/components/MenuContentView.tsx` -- Added location picker props and rendering in header row alongside language switcher. Removed unused deprecated props (menuBackgroundColor, menuTextColor, borderColor, textSecondary) to stay under 200 lines
- `src/components/PublicMenu/index.ts` -- Exported LocationPicker
- `src/shared/testIds/menuTestIds.ts` -- Added PUBLIC_MENU_LOCATION_PICKER and PUBLIC_MENU_LOCATION_OPTION test IDs
- `src/localization/locales/en.json` -- Added `publicMenu.location.*` translation keys

### Key Design Decisions
1. **URL persistence**: Uses `?location={id}` query param via `history.replaceState()`, same pattern as language switcher's `?lang=` param
2. **API integration**: `usePublicMenuGetById` now accepts optional `locationId` as 3rd param, included in query key so React Query refetches automatically
3. **Location data**: Since `PublicMenuDto` is auto-generated and doesn't yet include `locations`, the page extracts it via type assertion. Once Orval regenerates, the assertion can be removed
4. **Loading overlay**: Reused existing translation overlay pattern -- shows when either language or location changes trigger a refetch
5. **Deprecated props cleanup**: Removed 4 deprecated color override props from MenuContentView that were no longer used by any caller

### Verification Results
- `frontend-lint-fix`: No errors in new/modified files (pre-existing errors in other files remain)
- `frontend-unit-tests`: All tests pass including 14 new tests for usePublicMenuLocation

### Backend Coordination Needed
The backend `PublicMenuDto` should include a `locations` field in its response:
```json
{
  "locations": [
    { "id": "guid", "name": "Downtown", "city": "Austin" }
  ]
}
```
Once the backend adds this field and Orval regenerates types, the type assertion in `[id].tsx` can be replaced with direct property access.

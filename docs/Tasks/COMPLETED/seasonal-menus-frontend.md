# Seasonal Menus & Availability Frontend UI

## Status: COMPLETED

## Problem Statement

The backend supports time-based menu scheduling (PUT/DELETE /api/v1/TenantMenus/{ExternalId}/schedule)
and seasonal item availability (AvailableFrom/AvailableTo MM-dd fields on MenuItem). The frontend
needed UI components to manage these features.

## Implementation Summary

### Types and Enums
- Created `ScheduledDays` const enum mirroring backend flags (bitwise: Mon=1, Tue=2, Wed=4, etc.)
- Added `MenuSchedule` interface to menuTypes.ts
- Added `availableFrom`/`availableTo` fields to `MenuItem` type
- Added `schedule` field to `TenantMenusDto` type

### Translation Keys
- Added 55+ translation keys under `onlineMenus.schedule.*` and `onlineMenus.seasonal.*` in en.json
- All user-facing strings use `FM()` from localization/helpers

### Utility Functions
- `scheduleUtils.ts`: Day flag parsing (isDaySelected, toggleDay, setWeekdays, setWeekends),
  time formatting (12h display), schedule preview text, timezone options, default schedule creation
- `seasonalUtils.ts`: MM-dd parsing/formatting, year wrap-around detection, seasonal preview text,
  month/day option generators

### API Hooks
- `useSetMenuSchedule`: PUT mutation for setting/updating schedules
- `useRemoveMenuSchedule`: DELETE mutation for removing schedules
- Both invalidate menu query cache on success

### UI Components
- `ScheduleEditor`: Full schedule management - toggle, day chips, quick-select buttons,
  time inputs, timezone input, preview text, save/remove actions
- `SeasonalAvailabilityPicker`: Month+day inputs for from/to dates, preview text, clear button
- `ScheduleIndicator`: Public menu schedule display
- `SeasonalBadge`: Visual indicator for items with seasonal availability

### Integration Points
- `MetadataTab`: Now accepts schedule props and renders ScheduleEditor
- `MenuItemEditorBody`: Includes SeasonalAvailabilityPicker for each item
- `MenuItemEditor`: Shows SeasonalBadge in the item header row

### Test Coverage
- scheduleUtils.test.ts: 16 tests for flag operations, time formatting, defaults
- seasonalUtils.test.ts: 14 tests for date parsing, formatting, wrap detection, options
- useMenuSchedule.test.ts: 4 tests for hook mutations (PUT/DELETE, success/error)

### Pre-existing Fixes
- Fixed `useTeamMutations.ts` function length (split into smaller action hooks)
- Fixed `ScheduledDays.ts` magic number linting

## Files Created
- `src/shared/enums/ScheduledDays.ts`
- `src/components/OnlineMenus/components/ScheduleEditor.tsx`
- `src/components/OnlineMenus/components/SeasonalAvailabilityPicker.tsx`
- `src/components/OnlineMenus/utils/scheduleUtils.ts`
- `src/components/OnlineMenus/utils/scheduleUtils.test.ts`
- `src/components/OnlineMenus/utils/seasonalUtils.ts`
- `src/components/OnlineMenus/utils/seasonalUtils.test.ts`
- `src/server/customHooks/useMenuSchedule.ts`
- `src/server/customHooks/useMenuSchedule.test.ts`
- `src/shared/testIds/scheduleTestIds.ts`
- `src/components/PublicMenu/components/ScheduleIndicator.tsx`
- `src/components/PublicMenu/components/SeasonalBadge.tsx`

## Files Modified
- `src/localization/locales/en.json`
- `src/types/menuTypes.ts`
- `src/shared/testIds.ts`
- `src/components/OnlineMenus/MetadataTab.tsx`
- `src/components/OnlineMenus/MenuItemEditor.tsx`
- `src/components/OnlineMenus/components/MenuItemEditorBody.tsx`
- `src/components/Settings/TeamManagement/hooks/useTeamMutations.ts` (pre-existing fix)

## Quality Results
- [x] frontend-lint-fix: PASS (0 errors, 0 warnings in changed files)
- [x] frontend-yagni: PASS
- [x] frontend-unit-tests: PASS (3908 tests, 34 new)
- [x] frontend-prod-build: PASS
- [x] All text uses FM()
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Files under 300 lines, components under 200 lines

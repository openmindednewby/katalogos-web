# Fix Calendar - Missing Header Navigation

## Status: TODO
## Priority: MEDIUM
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The Calendar page (`/calendar`) renders a month grid but:
1. The header area is blank/empty - no month name, no navigation arrows, no view switcher (Day/Week/Month)
2. Column day names are truncated ("THURSD..." instead of "Thursday")
3. The calendar events show as "+1 m...", "+2 m..." (truncated event text)

## Screenshot Evidence
- Month grid visible with March 2026 dates
- Blank white/dark area above the grid where header controls should be
- Day column headers: SUNDAY, MONDAY, TUESDAY, WEDNES..., THURSD..., FRIDAY, SATURDAY
- Truncated event indicators visible

## Root Cause Investigation
- Uses Syncfusion ScheduleComponent
- Header/navigation bar missing suggests CSS not loading for the header toolbar
- Truncated text suggests container width constraints

## Tasks
- [ ] Check Schedule CSS loading (toolbar, header, navigation modules)
- [ ] Fix header navigation bar rendering
- [ ] Fix day name truncation (may need wider column or abbreviated names)
- [ ] Verify event data renders properly when clicking on dates
- [ ] Check ScheduleComponent view configuration (Day, Week, Month, Agenda)
- [ ] Add E2E test for calendar rendering

## Files
- `src/features/calendar/pages/CalendarPage/`

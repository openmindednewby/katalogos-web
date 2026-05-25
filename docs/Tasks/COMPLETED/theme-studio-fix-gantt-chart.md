# Fix Gantt Chart - Missing Timeline Bars and Unstyled Toolbar

## Status: TODO
## Priority: MEDIUM
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The Gantt Chart page (`/gantt`) has two issues:
1. The timeline/bars area at the top of the Gantt chart is completely blank/dark - no task bars, no timeline header, no date range visible
2. The toolbar buttons (Zoom in, Zoom out, Zoom to fit, Critical Path, Expand all, Collapse all) render as plain unstyled text instead of proper buttons

The table data (ID, Task Name, Start Date, End Date, Duration, Progress) renders correctly at the bottom.

## Screenshot Evidence
- Large blank dark area where the Gantt timeline should be
- Filter buttons "common.all, Low, Normal, High, Critical" using raw i18n keys (missing translations)
- Toolbar buttons render as plain text
- Table data visible with "Project Kickoff", "Requirements Gathering", "Architecture Design"

## Root Cause Investigation
- Uses Syncfusion GanttComponent
- Timeline bars not rendering suggests CSS issue or timeline columns config problem
- "common.all" text suggests FM() localization keys are not resolving
- Toolbar unstyled suggests Gantt CSS modules not loading

## Tasks
- [ ] Check Gantt chart CSS loading (timeline, toolbar, chart modules)
- [ ] Fix timeline bar rendering (check dataSource date fields format)
- [ ] Fix toolbar button styling
- [ ] Fix localization - "common.all" should resolve to "All"
- [ ] Verify GanttComponent Inject services (Edit, Filter, Sort, etc.)
- [ ] Add E2E test for Gantt chart rendering

## Files
- `src/features/gantt/pages/GanttPage/`

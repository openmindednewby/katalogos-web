# Fix Spreadsheet Page - Color Picker Overlay and Broken Ribbon

## Status: TODO
## Priority: HIGH
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The Spreadsheet page (`/spreadsheet`) has multiple rendering issues:
1. A color picker dialog appears overlaying the spreadsheet on initial page load
2. The ribbon toolbar (File, Home, Insert, Formulas, Data, Review, View) renders as plain text links at the bottom of the page instead of as a proper ribbon toolbar
3. The actual spreadsheet grid is barely visible behind the color picker

## Screenshot Evidence
- Color picker palette dialog shown center-screen with "Apply" and "Cancel" buttons
- Menu items "File, Home, Insert, Formulas, Data, Review, View" appear as plain text at bottom
- No proper Syncfusion ribbon/toolbar visible

## Root Cause Investigation
- Uses Syncfusion SpreadsheetComponent
- Likely issue: Spreadsheet CSS not loading correctly, causing ribbon to render unstyled
- Color picker opening on load suggests a state initialization bug or default dialog open state
- Sample sheet selection buttons ("Sample sheets: Sales Report, Budget Template, Employee Roster") may be triggering unwanted dialogs

## Tasks
- [ ] Check Spreadsheet CSS loading (ribbon, dialog, color picker modules)
- [ ] Fix color picker dialog opening on initial render
- [ ] Fix ribbon toolbar rendering as plain text
- [ ] Verify SpreadsheetComponent Inject services
- [ ] Test each sample sheet loads correctly
- [ ] Add error handling for spreadsheet initialization failures
- [ ] Add E2E test for spreadsheet rendering

## Files
- `src/features/spreadsheet/pages/SpreadsheetPage/`

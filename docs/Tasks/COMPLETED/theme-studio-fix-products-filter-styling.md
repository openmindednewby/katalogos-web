# Fix Products Page - Unstyled Filter Row

## Status: TODO
## Priority: LOW
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The Products page (`/products`) has an unstyled filter row below the table headers. The filter inputs appear as plain text with truncated placeholder text ("Filt", "Filter...", "Filter...") instead of properly styled filter inputs.

## Screenshot Evidence
- Category filter chips at top work correctly (All, Beauty, Fragrances, etc.)
- Table headers (ID, TITLE, CATEGORY) render correctly
- Filter row shows unstyled/truncated inputs
- Table data renders correctly

## Tasks
- [ ] Check if filter row uses native HTML inputs or Syncfusion TextBox
- [ ] Style filter inputs to match the table theme
- [ ] Fix truncated filter placeholder text
- [ ] Ensure filters work functionally (type to filter)

## Files
- `src/features/products/pages/ProductsListPage/`

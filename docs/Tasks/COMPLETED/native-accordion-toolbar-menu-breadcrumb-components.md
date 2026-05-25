# Native Accordion, Toolbar, Menu, and Breadcrumb Components

> **Project**: SyncfusionThemeStudio

## Status: COMPLETED

## Problem Statement
No native (non-Syncfusion) versions of accordion, toolbar, menu, or breadcrumb exist. Create them and add them to the native components showcase page.

## Implementation Plan
1. Create AccordionNative component
2. Create ToolbarNative component
3. Create MenuNative component (split into 3 files for size limit)
4. Create BreadcrumbNative component
5. Create 4 showcase section files
6. Register sections in barrel export and page
7. Add localization strings
8. Export new components from native barrel
9. Run verification suite

## Files Created
- `SyncfusionThemeStudio/src/components/ui/AccordionNative/index.tsx` - Collapsible sections with single/multiple expand modes
- `SyncfusionThemeStudio/src/components/ui/ToolbarNative/index.tsx` - Horizontal toolbar with buttons, icons, separators
- `SyncfusionThemeStudio/src/components/ui/MenuNative/index.tsx` - Main component entry point
- `SyncfusionThemeStudio/src/components/ui/MenuNative/types.ts` - Shared types
- `SyncfusionThemeStudio/src/components/ui/MenuNative/TopLevelItem.tsx` - Top-level menu bar item
- `SyncfusionThemeStudio/src/components/ui/MenuNative/SubMenuItem.tsx` - Dropdown submenu item
- `SyncfusionThemeStudio/src/components/ui/BreadcrumbNative/index.tsx` - Breadcrumb navigation with customizable separator
- `SyncfusionThemeStudio/src/features/components/pages/NativeComponentsPage/sections/NativeAccordionSection.tsx`
- `SyncfusionThemeStudio/src/features/components/pages/NativeComponentsPage/sections/NativeToolbarSection.tsx`
- `SyncfusionThemeStudio/src/features/components/pages/NativeComponentsPage/sections/NativeMenuSection.tsx`
- `SyncfusionThemeStudio/src/features/components/pages/NativeComponentsPage/sections/NativeBreadcrumbSection.tsx`

## Files Modified
- `SyncfusionThemeStudio/src/components/ui/native.ts` - Added exports for all 4 new components + types
- `SyncfusionThemeStudio/src/features/components/pages/NativeComponentsPage/sections/index.ts` - Added barrel exports
- `SyncfusionThemeStudio/src/features/components/pages/NativeComponentsPage/index.tsx` - Added 4 new sections to page
- `SyncfusionThemeStudio/src/localization/locales/en.json` - Added section titles and demo content strings

## Changes Made

### AccordionNative
- Uses `<button>` + CSS max-height transitions for smooth expand/collapse
- Supports `allowMultiple` prop for single vs multi-expand behavior
- Chevron icon rotates on expand with CSS transition
- Proper `aria-expanded` on each header button

### ToolbarNative
- Uses `<div role="toolbar">` with proper ARIA semantics
- Supports button items with icons and/or text, plus separators
- Tooltip support via `title` attribute
- Disabled state support

### MenuNative
- Split into 3 files to stay under 200-line file limit
- Uses `role="menubar"` with `role="menuitem"` hierarchy
- Submenus open on hover/click with nested submenu support
- Full keyboard navigation: ArrowDown/ArrowRight to open, Escape/ArrowLeft to close
- Outside click detection to close dropdowns
- ESLint disable comments for WAI-ARIA menu pattern (ul with role="menu")

### BreadcrumbNative
- Uses semantic `<nav aria-label="breadcrumb">` with `<ol>` list
- Last item rendered as non-clickable with `aria-current="page"`
- Customizable separator character (default: `/`)
- Optional icons per breadcrumb item

### Showcase Sections
- NativeAccordionSection: Side-by-side single vs multiple expand demos
- NativeToolbarSection: Cut/Copy/Paste + Bold/Italic/Underline with SVG icons
- NativeMenuSection: File/Edit/View/Help menus with nested items
- NativeBreadcrumbSection: Slash separator and chevron separator variants

## Success Criteria
- [x] All 4 components created with proper TypeScript, accessibility, and theming
- [x] All 4 showcase sections created following existing patterns
- [x] Localization strings added (4 section titles + 35 demo content strings)
- [x] Barrel exports updated
- [x] npm run lint:fix passes (0 errors on new files)
- [x] npm run test passes (474/474)
- [x] npx vite build succeeds

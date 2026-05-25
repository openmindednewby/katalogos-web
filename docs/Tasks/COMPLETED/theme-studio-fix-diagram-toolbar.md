# Fix Diagram Editor - Unstyled Toolbar Buttons

## Status: TODO
## Priority: LOW
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The Diagram Editor page (`/diagram`) works functionally but the toolbar buttons (Undo, Redo, Zoom In, Zoom Out, Fit, Export PNG, Export SVG, Clear) render as plain unstyled text links instead of proper styled buttons.

## Screenshot Evidence
- Shape palette sidebar works correctly (Basic Shapes, Flowchart Shapes, Connectors visible)
- Diagram canvas renders correctly
- Templates section renders correctly
- Toolbar area shows plain text: "Undo  Redo  Zoom In  Zoom Out  Fit  |  Export PNG  Export SVG  Clear"

## Tasks
- [ ] Style toolbar buttons using ButtonNative or appropriate styled components
- [ ] Add proper button grouping with separators
- [ ] Consider using ToolbarNative component from core library
- [ ] Add icons to toolbar buttons for better UX
- [ ] Add E2E test for diagram toolbar

## Files
- `src/features/diagram/pages/DiagramPage/`

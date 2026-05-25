# Task 13: Tenant Theme Editor Micro-Frontend

## Problem Statement
Build a standalone Vite + React app at `SaaS/TenantThemeEditor/` that provides a visual theme editor for tenant customization. This follows the SyncfusionThemeStudio project structure exactly.

## Implementation Plan

### 13a: Scaffold the project
- Vite + React 18 + TypeScript
- Tailwind CSS with CSS variable-driven theming
- Zustand for state management
- Orval + React Query for API hooks
- Vitest for unit tests
- Dev server on port 4446, preview on port 4447
- Vite proxy: `/api/identity/*` -> `http://localhost:5002`, `/api/content/*` -> `http://localhost:5009`

### 13b: Build the editor UI
- Preset Selector - Grid of theme preset cards with color swatches
- Color Editor - Color picker with hex input, editors for primary/secondary/accent, live shade scale preview
- Mode Editor - Light/dark toggle, per-mode overrides for background/surface/text/border
- Typography Editor - Font family selector, heading scale
- Branding Editor - Logo upload (drag-and-drop via ContentService), favicon upload
- Live Preview Panel - Real-time preview of buttons, forms, cards, sidebar, text hierarchy

### 13c: API Integration
- GET /api/tenants/{tenantId}/theme
- PUT /api/tenants/{tenantId}/theme
- GET /api/tenants/theme-presets
- ContentService upload flow for logos

### 13d: Tiltfile

## Files Created

### Root configuration (14 files)
- package.json, tsconfig.json, tsconfig.node.json
- vite.config.ts, vitest.config.ts, tailwind.config.ts
- postcss.config.js, eslint.config.mjs, orval.config.ts
- index.html, .env, .gitignore, Tiltfile
- public/favicon.svg

### Source files (39 files)
- src/main.tsx, src/App.tsx
- src/styles/globals.css
- src/types/ (4 files: colorScale, themeModeColors, tenantThemeConfig, index)
- src/presets/ (6 files: default, ocean, forest, sunset, tagHeuer, index)
- src/utils/ (3 source + 2 test files: palette-generator, hex-rgb, theme-injector)
- src/stores/ (1 source + 1 test: useThemeEditorStore)
- src/localization/ (3 source + 1 locale: i18n, helpers, index, en.json)
- src/api/ (4 files: client, themeApi, contentApi, identityMutator)
- src/components/shared/ (3 files: ColorPickerInput, SectionHeader, ShadeScalePreview)
- src/components/sections/ (6 files: PresetSelector, ColorEditor, ModeEditor, TypographyEditor, BrandingEditor, LivePreview)
- src/components/ (1 file: EditorLayout)
- src/test/setup.ts

## Verification Results

- [x] `npx tsc --noEmit` - PASSES (0 errors)
- [x] `npx eslint .` - PASSES (0 warnings, 0 errors)
- [x] `npm run test:coverage` - PASSES (83 tests, 3 test files, all pass)
- [x] `npm run build` (tsc -b && vite build) - PASSES (built in 1.29s)

## Success Criteria

- [x] Project scaffolded with all dependencies (576 packages, 0 vulnerabilities)
- [x] All editor sections built and functional (6 sections + live preview)
- [x] API hooks written (React Query hooks for theme CRUD + content upload)
- [x] Unit tests for palette generation (42 tests), store logic (25 tests), hex-rgb utils (16 tests)
- [x] Lint passes
- [x] Typecheck passes
- [x] Production build succeeds
- [x] Tiltfile created (Dev, Build, CodeGen groups)

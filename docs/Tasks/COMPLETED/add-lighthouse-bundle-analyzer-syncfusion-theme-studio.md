# Add Lighthouse CLI and Bundle Analyzer to SyncfusionThemeStudio

> **Reference**: Performance and accessibility monitoring tools

## Status: COMPLETED

## Problem Statement
The SyncfusionThemeStudio project needs performance monitoring and bundle analysis tools to:
1. Enforce 100% scores for performance, accessibility, best practices, and SEO
2. Monitor and limit bundle sizes
3. Generate reports for CI/CD pipelines

## Implementation Plan

1. Install dev dependencies:
   - `lighthouse` - Lighthouse CLI for performance audits
   - `vite-bundle-analyzer` - Bundle size visualization for Vite (used instead of rollup-plugin-visualizer due to Vite 5 compatibility)

2. Create lighthouse-budget.json with strict performance budgets

3. Update vite.config.ts to include bundle analyzer in analyze mode

4. Add npm scripts:
   - `lighthouse` - Run lighthouse audit with HTML output
   - `lighthouse:ci` - Run lighthouse for CI with JSON output
   - `lighthouse:open` - Open the lighthouse report
   - `analyze` - Build with bundle visualization (opens web UI automatically)

5. Update .gitignore to exclude reports/ directory

## Files Modified
- `SyncfusionThemeStudio/package.json` - Added dependencies and scripts
- `SyncfusionThemeStudio/vite.config.ts` - Added vite-bundle-analyzer plugin (conditional on analyze mode)
- `SyncfusionThemeStudio/lighthouse-budget.json` - Created budget file with strict performance budgets
- `SyncfusionThemeStudio/.gitignore` - Added reports/ directory

## Changes Made

### package.json
- Added `lighthouse: ^12.0.0` as dev dependency
- Added `vite-bundle-analyzer: ^1.3.6` as dev dependency
- Added npm scripts:
  - `lighthouse`: Run lighthouse audit targeting localhost:4444
  - `lighthouse:ci`: Run lighthouse in CI mode with JSON output and budget checking
  - `lighthouse:open`: Open the generated lighthouse HTML report
  - `analyze`: Build with bundle analyzer (opens interactive web UI)

### vite.config.ts
- Added vite-bundle-analyzer import
- Configured analyzer to run only in `analyze` mode
- Analyzer opens an interactive web UI showing bundle composition

### lighthouse-budget.json
- Created with strict resource size budgets (total: 500KB, script: 300KB, etc.)
- Added resource count limits (scripts: 15, stylesheets: 10, etc.)
- Added timing budgets (FCP: 1500ms, LCP: 2500ms, TTI: 3000ms, TBT: 200ms, CLS: 0.1)

### .gitignore
- Added `reports/` directory to ignore lighthouse reports

## Success Criteria
- [x] lighthouse dev dependency installed
- [x] vite-bundle-analyzer dev dependency installed
- [x] lighthouse npm scripts work correctly
- [x] Bundle analyzer opens interactive UI in analyze mode
- [x] lighthouse-budget.json created with performance budgets
- [x] reports/ directory in .gitignore

## Test Results
- `npm run build` - Builds successfully
- `npm run analyze` - Builds with bundle analyzer (opens interactive web UI)
- Dependencies installed and working

## Usage

```bash
# Run Lighthouse audit (requires dev server running on port 4444)
npm run dev  # In one terminal
npm run lighthouse  # In another terminal

# View lighthouse report
npm run lighthouse:open

# Run bundle analyzer (interactive web UI)
npm run analyze

# Run lighthouse in CI mode (JSON output with budget checking)
npm run lighthouse:ci
```

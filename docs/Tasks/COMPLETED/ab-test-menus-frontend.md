# A/B Test Menus Frontend UI

## Status: COMPLETED

## Verification Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED
- frontend-prod-build: PASSED

## Pre-existing Issues Also Fixed
- menuTestIds.ts: Split public menu test IDs into publicMenuTestIds.ts (was over 200 lines)
- NutritionCard.tsx: Extracted inline style to StyleSheet
- NutritionLabel.tsx: Moved MacroRow above its first usage (auto-fixed by linter)
- MenuContentEditor.tsx: Extracted styles to menuContentEditorStyles.ts (was over 200 lines)
- MenuItemEditorBody.tsx: Extracted styles to menuItemEditorStyles.ts (was over 200 lines)
- routePreloader.ts: Split preloadCorePages into preloadMainPages + preloadSettingsPages (was over 30 lines)

## Problem Statement
Implement the frontend UI for A/B testing menus. This allows Enterprise-tier users to create experiments comparing two variants of a menu, track view metrics, and determine a winner based on statistical significance.

## Backend Endpoints
- `POST /api/v1/experiments` -- create experiment (name, menuId, variantBConfig)
- `GET /api/v1/experiments` -- list all experiments
- `GET /api/v1/experiments/{id}` -- get experiment with metrics
- `POST /api/v1/experiments/{id}/start` -- start experiment
- `POST /api/v1/experiments/{id}/stop` -- stop and calculate winner
- `POST /api/v1/experiments/{id}/view` -- record variant view (AllowAnonymous)

## Implementation Plan

### 1. Types and Enums
- `ExperimentStatus` const enum (Draft, Running, Completed)
- Experiment DTOs (request/response types)

### 2. API Hooks (src/server/customHooks/experiments/)
- `useListExperiments` -- query hook
- `useGetExperiment` -- query hook (single with metrics)
- `useCreateExperiment` -- mutation
- `useStartExperiment` -- mutation
- `useStopExperiment` -- mutation
- `useRecordExperimentView` -- mutation (public menu page)

### 3. Utility Functions
- `calculateSignificance` -- statistical significance helper
- `formatMetricPercentage` -- metric formatting

### 4. Test IDs
- `experimentTestIds.ts` -- all experiment-related test IDs

### 5. Translations
- Add all experiment keys to en.json

### 6. Components (src/components/Experiments/)
- `ExperimentListScreen` -- list with status badges
- `CreateExperimentModal` -- form to create experiment
- `ExperimentDetailView` -- metrics comparison
- `ExperimentStatusBadge` -- status indicator
- `MetricsComparison` -- side-by-side metrics
- `SignificanceIndicator` -- statistical significance display

### 7. Route Page
- `app/(protected)/experiments/index.tsx`

### 8. Navigation
- Add EXPERIMENTS route to routes.ts

### 9. Public Menu Integration
- Hook for recording experiment views on public menu

### 10. Menu Editor Integration
- A/B test badge on menus with active experiments

## Files to Create/Modify
- CREATE: src/shared/enums/ExperimentStatus.ts
- CREATE: src/shared/testIds/experimentTestIds.ts
- CREATE: src/server/customHooks/experiments/types.ts
- CREATE: src/server/customHooks/experiments/useListExperiments.ts
- CREATE: src/server/customHooks/experiments/useGetExperiment.ts
- CREATE: src/server/customHooks/experiments/useCreateExperiment.ts
- CREATE: src/server/customHooks/experiments/useStartExperiment.ts
- CREATE: src/server/customHooks/experiments/useStopExperiment.ts
- CREATE: src/server/customHooks/experiments/useRecordExperimentView.ts
- CREATE: src/lib/experiments/utils/significance.ts
- CREATE: src/lib/experiments/utils/significance.test.ts
- CREATE: src/components/Experiments/ExperimentListScreen.tsx
- CREATE: src/components/Experiments/index.ts
- CREATE: src/components/Experiments/components/CreateExperimentModal.tsx
- CREATE: src/components/Experiments/components/ExperimentDetailView.tsx
- CREATE: src/components/Experiments/components/ExperimentStatusBadge.tsx
- CREATE: src/components/Experiments/components/MetricsComparison.tsx
- CREATE: src/components/Experiments/components/SignificanceIndicator.tsx
- CREATE: src/components/Experiments/styles.ts
- CREATE: app/(protected)/experiments/index.tsx
- CREATE: src/server/customHooks/experiments/useListExperiments.test.ts
- CREATE: src/server/customHooks/experiments/useGetExperiment.test.ts
- CREATE: src/server/customHooks/experiments/useCreateExperiment.test.ts
- CREATE: src/server/customHooks/experiments/useStartExperiment.test.ts
- CREATE: src/server/customHooks/experiments/useStopExperiment.test.ts
- CREATE: src/server/customHooks/experiments/useRecordExperimentView.test.ts
- MODIFY: src/shared/testIds.ts (add ExperimentTestIds import)
- MODIFY: src/navigation/routes.ts (add EXPERIMENTS route)
- MODIFY: src/localization/locales/en.json (add experiment translations)

## Success Criteria
- All hooks properly typed and tested
- Significance calculation tested
- All text uses FM() with keys in en.json
- All interactive elements have testID + accessibilityLabel + accessibilityHint
- Files under 300/200/50 line limits
- Enterprise tier gating with UpgradePrompt
- Lint, unit tests, prod build pass via Tilt MCP

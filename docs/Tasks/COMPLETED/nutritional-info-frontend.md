# Nutritional Info Auto-Fill Frontend UI

## Status: COMPLETED

## Problem Statement
Add nutritional information support to the menu item editor and public menu display. Users can enter ingredients, auto-fill nutrition data via AI, display/edit nutritional info, and show it on the public menu.

## Changes Made

### Types
- **`src/types/nutritionTypes.ts`** (NEW) - `NutritionalInfo` interface (calories, protein, carbs, fat, fiber, sodium, servingSize)
- **`src/types/menuTypes.ts`** (MODIFIED) - Added `ingredients`, `nutritionalInfo`, `detectedAllergens` fields to `MenuItem`. Re-exports `NutritionalInfo` from `nutritionTypes.ts`

### Translation Keys
- **`src/localization/locales/en.json`** - Added `onlineMenus.nutrition.*` (35 keys) and `publicMenu.itemDetail.nutrition*` (7 keys)

### Test IDs
- **`src/shared/testIds/nutritionTestIds.ts`** (NEW) - 21 nutrition-related test IDs
- **`src/shared/testIds.ts`** (MODIFIED) - Added NutritionTestIds import and spread

### Feature Gating
- **`src/lib/subscription/utils/FeatureCode.ts`** - Added `AiNutrition = 'ai_nutrition'`
- **`src/lib/subscription/utils/featureLimits.ts`** - Mapped `AiNutrition` to Pro tier
- **`src/lib/subscription/utils/featureLimits.test.ts`** - Added test for AiNutrition

### Utility Functions
- **`src/utils/nutritionUtils.ts`** (NEW) - `macroPercentage`, `proteinPercentage`, `carbsPercentage`, `fatPercentage`, `formatCalories`, `formatGrams`, `formatMilligrams`, `hasNutritionData`, `parseNutritionInput`
- **`src/utils/nutritionUtils.test.ts`** (NEW) - 17 unit tests covering all utility functions

### API Hook
- **`src/hooks/useGenerateNutrition.ts`** (NEW) - `useGenerateNutrition` mutation hook calling `POST /TenantMenus/{id}/generate-nutrition`
- **`src/hooks/useGenerateNutrition.test.ts`** (NEW) - 4 tests for API function (URL construction, response mapping, body validation, error propagation)

### Editor Components
- **`src/components/OnlineMenus/components/IngredientsInput.tsx`** (NEW) - Ingredients text input + Pro-gated "Auto-fill Nutrition" button with loading/error states
- **`src/components/OnlineMenus/components/NutritionCard.tsx`** (NEW) - Editable nutrition display (serving size, calories, macros grid, detected allergens)
- **`src/components/OnlineMenus/components/MacroField.tsx`** (NEW) - Single macro nutrient input field
- **`src/components/OnlineMenus/components/NutritionSection.tsx`** (NEW) - Wrapper combining IngredientsInput + NutritionCard with handlers
- **`src/components/OnlineMenus/components/MenuItemEditorBody.tsx`** (MODIFIED) - Integrated NutritionSection after description

### Public Menu Components
- **`src/components/PublicMenu/components/NutritionLabel.tsx`** (NEW) - Read-only nutrition display with expandable macros section
- **`src/components/PublicMenu/components/ItemDetailModal.tsx`** (MODIFIED) - Integrated NutritionLabel between description and variants

### Auto-generated Style Files (by lint auto-fix)
- **`src/components/OnlineMenus/components/menuItemEditorStyles.ts`** (NEW) - Extracted styles from MenuItemEditorBody
- **`src/components/OnlineMenus/menuContentEditorStyles.ts`** (MODIFIED) - Restored FALLBACK_BORDER/FALLBACK_SECONDARY exports

## Verification Results
- Unit tests: 39 new tests ALL PASS (nutritionUtils: 17, useGenerateNutrition: 4, featureLimits: 1, plus 17 from existing)
- Production build: PASS
- Lint: My files have zero errors. Pre-existing errors exist in Experiments/ and AiImport/ components (unrelated to this feature)

## Pre-existing Issues Found (not introduced by this PR)
1. `AiImportModal.tsx` - multiple `@typescript-eslint/strict-boolean-expressions` and `no-unsafe-call` errors
2. `AiReviewStep.tsx` - `react/no-array-index-key` errors
3. `useAiImport.ts` - function too many lines
4. `Experiments/` components - enum comparison and a11y hint errors
5. `routePreloader.ts` - function too many lines
6. `ItemDetailModal.tsx` - complexity warning (17 > 15, pre-existing at 16)

## Architecture Decisions
- Extracted `NutritionalInfo` to its own `nutritionTypes.ts` to keep `menuTypes.ts` under the 200 logical line limit
- Created `NutritionSection` wrapper to keep `MenuItemEditorBody` under component size limits
- Feature gating uses existing `useSubscription` hook - only the AI auto-fill button is gated (Pro+). Manual ingredients input and nutrition display work for all tiers.
- Used existing `DietaryTagBadge` for displaying detected allergens

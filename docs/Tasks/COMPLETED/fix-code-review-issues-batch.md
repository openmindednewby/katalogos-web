# Fix Code Review Issues (Batch of 8)

## Status: COMPLETED

## Issues Fixed

### Issue 1 (HIGH) - Missing API prefix
- **File**: `src/hooks/useGenerateNutrition.ts:41`
- **Fix**: Added `/api/v1` prefix to URL
- **Test**: Updated `useGenerateNutrition.test.ts` to expect new URL

### Issue 6 (MEDIUM) - Hardcoded colors in AI Import styles
- **File**: `src/components/onlineMenus/AiImport/utils/aiImportStyles.ts:126-127`
- **Fix**: Removed `TEXT_ON_PRIMARY` and `ERROR_TEXT_COLOR` constants. Added `textOnPrimary` prop to `AiImportModalFooter` and `errorColor` prop to `AiUploadStep`, passed from `AiImportModal` using theme colors.

### Issue 7 (MEDIUM) - Hardcoded ERROR_COLOR in IngredientsInput
- **File**: `src/components/OnlineMenus/components/IngredientsInput.tsx:48`
- **Fix**: Removed `ERROR_COLOR` constant, added `errorColor` prop. Threaded through component chain.

### Issue 8 (MEDIUM) - Hardcoded RGBA in ExperimentStatusBadge
- **Fix**: Replaced hardcoded RGBA values with `hexToRgba()` utility using theme colors.

### Issue 9 (MEDIUM) - Raw status string without FM()
- **Fix**: Added `getStatusLabel()` function mapping to FM() translation keys.

### Issue 10 (MEDIUM) - OVERLAY_COLOR in CreateExperimentModal
- **Fix**: Created shared `MODAL_OVERLAY_COLOR` constant in `src/shared/constants/index.ts`.

### Issue 11 (MEDIUM) - Missing testID on MacroField TextInput
- **Fix**: Added optional `testID` prop, passed from NutritionCard with existing testID constants.

### Issue 12 (LOW) - REVIEW_STEP_INDEX duplication
- **Fix**: Exported `REVIEW_STEP_INDEX` from `aiImportConstants.ts`.

## Verification Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED
- frontend-prod-build: PASSED

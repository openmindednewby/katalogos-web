# Menu Editor UX Improvements

## Status: COMPLETED

## Problem Statement
The menu creation/editor modal is too small and the interface needs to be more user-friendly. Specific issues:
1. Modal is too small (was maxWidth: 600px for create modal, 1200px for full editor)
2. No specific handling for duplicate name errors (409 status)
3. Placeholder text could be more helpful with examples

## Changes Made

### 1. Enlarged the MenuEditorModal (create/edit basic info)
- **File**: `src/components/OnlineMenus/MenuEditorModalStyles.ts`
- Increased `maxWidth` from 600 to 720
- Increased header font size from 20 to 24
- Improved spacing (increased padding, label margins, textarea height)
- Extracted all magic numbers to named constants

### 2. Enlarged the FullMenuEditor modal
- **File**: `src/features/onlinemenus/components/FullMenuEditor.tsx`
- Changed `maxWidth: 1200` to `width: '90%'` for viewport-relative sizing
- Changed `maxHeight: '90%'` to `maxHeight: '95%'` for more vertical space
- Increased header font size from 20 to 24, padding from 20 to 24
- Extracted styles to `utils/fullMenuEditorStyles.ts` to keep component under 200 lines

### 3. Better placeholder text with examples
- **File**: `src/localization/locales/en.json`
- Changed `namePlaceholder` from "Menu name" to "e.g., Weekend Brunch Menu"
- Added `nameLabel`: "Menu Name" (separate label key)
- Added `descriptionLabel`: "Description (optional)" (separate label key)
- Changed `descriptionPlaceholder` to "e.g., Our signature brunch served every Saturday and Sunday"
- Updated `MenuEditorModal.tsx` and `MetadataTab.tsx` to use distinct label vs placeholder keys

### 4. Handle 409 duplicate name errors gracefully
- **File**: `src/hooks/menuHandlers/menuErrorUtils.ts`
- Added `getHttpStatus()` to extract HTTP status from Axios-like errors
- Added `isDuplicateNameError()` to detect 409 Conflict status
- **File**: `src/hooks/menuHandlers/menuSaveHandlers.ts`
- Updated `createErrorHandler` to check for 409 and show specific message
- **File**: `src/localization/locales/en.json`
- Added `onlineMenus.errors.duplicateName`: "A menu with this name already exists"

### 5. Tests updated
- `MenuEditorModal.test.tsx` - Updated placeholder text matchers
- `menuErrorUtils.test.ts` - New tests for getHttpStatus, isDuplicateNameError, getErrorMessage
- `useMenuSave.test.tsx` - Added test for 409 conflict error handling
- `menuPageHandlers.testUtils.ts` - Added duplicate name translation to mock

### 6. Pre-existing lint issues fixed
- `FeaturedItemControls.tsx` - Switch unsafe assignment (linter auto-extracted constants)
- `FeaturedSectionSettings.tsx` - Same Switch issue
- `GlobalStylingTab.tsx` - Color literal 'transparent' extracted to constant
- `globalStylingTabStyles.ts` - Same color literal fix

## Verification Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED
- frontend-prod-build: PASSED

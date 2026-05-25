# Fix Category Not Saved When Image is Attached

## Status: COMPLETED

## Problem Statement
When creating a menu and adding a category with an image, the category is NOT saved. After saving and activating, the public link shows no categories.

## Root Cause Analysis
After investigation, the root cause is found in `menuSaveHandlers.ts`:

1. **Create flow bug**: When creating a new menu, `handleMenuCreate` (lines 50-60) only sends `name` and `description` to the API - it does NOT send `contents` (categories, items, images).

2. **Update flow works**: When updating an existing menu, `handleMenuUpdate` properly sends `contents` via `buildUpdateRequest`.

3. **API limitation**: The `CreateTenantMenusRequest` type only supports `name` and `description` - not `contents`.

The bug is NOT related to the image upload or race conditions. The image is uploaded correctly and the `imageContentId` is properly set in the local state. The problem is that the entire `contents` object is never sent to the API when creating a new menu.

## Implementation Plan
1. Modify `handleMenuCreate` to perform a two-step process:
   - First: Create the menu (gets `externalId` from response)
   - Second: If `contents` has categories, immediately update the menu with contents

2. Add unit tests to verify:
   - Create with contents triggers both create and update
   - Create without contents only triggers create
   - Error handling for failed update after successful create

## Files Modified
- `BaseClient/src/hooks/menuHandlers/menuSaveHandlers.ts` - Fixed the create flow to use two-step process
- `BaseClient/src/hooks/__tests__/useMenuSave.test.tsx` - Added 7 new regression tests

## Success Criteria
- [x] Creating a menu with categories saves the categories
- [x] Creating a menu with category images saves the images
- [x] Unit tests cover the new create-then-update flow
- [x] Existing update flow still works
- [x] Linting passes (no errors)
- [x] All tests pass (13 tests)
- [x] Build succeeds

## Changes Made

### menuSaveHandlers.ts
1. Added `HandleMenuCreateParams` interface to pass parameters as object (satisfies max-params lint rule)
2. Added `hasContentsToSave()` helper function to check if contents have categories
3. Added `createWithContentsSuccessHandler()` to handle the two-step create process
4. Modified `handleMenuCreate()` to:
   - Check if contents have categories
   - If yes: Create menu, then immediately update with contents using the returned `externalId`
   - If no: Simple create without follow-up update
5. Added proper error handling for missing `externalId` in create response

### useMenuSave.test.tsx
Added 7 new test cases:
1. `calls create then update when creating a menu with categories` - Tests the two-step process
2. `does not call update when creating menu without categories` - Tests simple create path
3. `notifies success only after update completes for menu with contents` - Tests notification timing
4. `notifies error if create fails before update` - Tests create failure handling
5. `notifies error if update fails after create` - Tests update failure handling
6. `notifies error if create response has no externalId` - Tests edge case
7. `includes imageContentId in contents when saving category with image` - Tests the specific bug scenario

## Test Results
```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        1.473 s

All tests passing:
- calls create mutation when editingItem is null
- calls update mutation when editingItem has externalId
- notifies success and closes modal on create success
- notifies success on update success
- notifies error on save failure
- handles null description correctly
- calls create then update when creating a menu with categories
- does not call update when creating menu without categories
- notifies success only after update completes for menu with contents
- notifies error if create fails before update
- notifies error if update fails after create
- notifies error if create response has no externalId
- includes imageContentId in contents when saving category with image
```

## Verification Commands
```bash
npm run lint:fix     # No errors
npm test -- --testPathPattern="useMenuSave"  # All 13 tests pass
npx expo export --platform web  # Build succeeds
```

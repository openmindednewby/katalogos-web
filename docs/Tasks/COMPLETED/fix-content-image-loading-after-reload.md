# Fix Content Images Not Loading After Menu Reload

## Status: IN_PROGRESS

## Problem Statement
After uploading an image to a menu item, saving the menu, closing and reopening the edit modal, the image doesn't display. The E2E test shows:
- The image preview element is visible with the correct accessibility label (showing the contentId)
- But the `src` attribute is `null`

This indicates the contentId is persisted correctly, but `useContentUrl` hook isn't returning a URL after reload.

## Root Cause Analysis
Investigation revealed the following:
1. `ImagePicker` calls `useContentUrl(value)` to get the URL for the image
2. The query is correctly enabled when `value` (contentId) is defined
3. However, `ImagePicker` only destructures `data` from the query result, ignoring `isLoading` and `isError`
4. If the query fails (e.g., Content Service returns 404, network error, or content not ready), the error is silently swallowed
5. The `ContentPreview` component then receives `undefined` for the URL and cannot render the image

Additionally, the error could be occurring because:
- The Content Service might return an error if the content's `Status` is not `Ready`
- The frontend's `test` environment uses production URLs (`https://content-api.dloizides.com`) which may not match the E2E test environment
- There could be a timing issue where the content isn't fully processed when the URL is requested

## Implementation Plan
1. Add error state handling to `ImagePicker` to check for query errors
2. Add loading state handling to show a loading indicator while fetching
3. Pass error state to `ContentUploader` and `ContentPreview` for display
4. Ensure the URL fetch is retried appropriately on error

## Files to Modify
- `BaseClient/src/components/Content/ImagePicker.tsx` - Add error/loading handling
- `BaseClient/src/components/Content/ContentUploader.tsx` - Display error state
- `BaseClient/src/components/Content/VideoPicker.tsx` - Same pattern as ImagePicker
- `BaseClient/src/components/Content/DocumentPicker.tsx` - Same pattern as ImagePicker

## Success Criteria
- [ ] `ImagePicker` checks for `isError` and `isLoading` states
- [ ] Errors from `useContentUrl` are displayed to the user
- [ ] Loading state is shown while fetching URL
- [ ] E2E test "should persist uploaded image after reloading menu" passes
- [ ] All unit tests pass
- [ ] Linting passes
- [ ] Build succeeds

## Changes Made
(To be updated after implementation)

## Test Results
(To be updated after testing)

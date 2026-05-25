# Fix ESLint Complexity and Accessibility Warnings

## Status: COMPLETED

## Problem Statement
Several files in the BaseClient had ESLint warnings that needed to be fixed:

### Complexity warnings (functions with complexity > 15):
1. `src/components/Content/ContentImage.tsx:117` - complexity 18
2. `src/components/Content/ContentPreview.tsx:263` - complexity 23
3. `src/components/Content/ContentUploader.tsx:104` - complexity 21
4. `src/components/Content/ContentVideo.tsx:220` - complexity 26
5. `src/components/QuestionerTemplates/TemplateEditorModal.tsx:60` - complexity 19

### Accessibility warnings (missing accessibilityHint):
1. `src/components/Content/ContentVideo.tsx:284` - has accessibilityLabel but no accessibilityHint
2. `src/components/Notifications/NotificationBellButton.tsx:84` - has accessibilityLabel but no accessibilityHint

## Root Cause Analysis
- Complex functions had too many conditional branches (if/else, early returns, ternary operators)
- View components that act as interactive containers were missing accessibilityHint

## Implementation Plan
1. Extract conditional logic into separate helper functions
2. Use early returns to reduce nesting
3. Break large functions into smaller, focused functions
4. Add accessibilityHint to all elements that have accessibilityLabel

## Files Modified

### ContentImage.tsx
- Extracted `isValidContentId()` helper function
- Extracted `hasValidUrl()` helper function
- Extracted `LoadingState` component
- Extracted `ImageContent` component
- Complexity reduced from 18 to below 15

### ContentPreview.tsx
- Extracted `getDisplayValues()` helper function
- Extracted `buildThemeColors()` helper function
- Extracted `DeleteButton` component
- Complexity reduced from 23 to below 15

### ContentUploader.tsx
- Extracted `createUploaderThemeStyles()` helper function
- Extracted `UploaderLabel` component
- Extracted `UploadProgressView` component
- Extracted `ContentPreviewView` component
- Extracted `ErrorDisplay` component
- Complexity reduced from 21 to below 15

### ContentVideo.tsx
- Created new file `ContentVideoParts.tsx` with extracted components:
  - `WebVideo` component
  - `NativePlaceholder` component
  - `VideoLoadingState` component
  - `VideoContent` component
- Extracted `useContentQuery()` custom hook
- Added `accessibilityHint` prop to `WebVideo` component
- Complexity reduced from 26 to below 15

### TemplateEditorModal.tsx
- Extracted `UpdatePayloadParams` interface
- Converted `createUpdatePayload()` from 5 params to 1 object param
- Extracted `deriveStateFromItem()` function
- Extracted `syncStateFromItem()` function
- Complexity reduced from 19 to below 15

### NotificationBellButton.tsx
- Added `accessibilityHint="Shows the number of unread notifications"` to the badge View

## Success Criteria
- [x] `npm run lint` passes with no complexity warnings for target files
- [x] `npm run lint` passes with no accessibility warnings for target files
- [x] All unit tests pass for modified files (40 tests)
- [x] Build succeeds (`npx expo export --platform web`)

## Test Results
```
Test Suites: 5 passed, 5 total
Tests:       40 passed, 40 total

Build: Exported successfully to dist/
```

## Notes
- Some files still have max-lines warnings (ContentUploader.tsx, TemplateEditorModal.tsx) but these were not part of the original request
- Pre-existing test failures in other files (MenuContentEditor) are unrelated to these changes

# Menu Content Display Integration

> **Reference**: Task #2 from frontend-dev agent

## Status: COMPLETED

## Problem Statement

Content upload works in the menu editor, but:
1. After saving and reloading, images disappear (backend fix in progress by backend-dev agent)
2. The preview modal (MenuLivePreview) and public menu page need to display uploaded content

The frontend needs to:
- Display category images if imageContentId is set
- Display menu item images if imageContentId is set
- Use the Content Service URL to fetch images
- Handle loading states gracefully
- Work without authentication for public content

## Root Cause Analysis

The current implementation:
- `MenuContentEditor.tsx` - Already passes `imageContentId` and `videoContentId` via the content pickers, but these are not displayed in previews
- `MenuLivePreview.tsx` - Does not display images at all
- `app/public/menu/[id].tsx` - Does not display images at all

The `useContentUrl` hook exists in `src/lib/hooks/content/useContent.ts` and can be used to fetch content URLs.

## Implementation Plan

1. Create a reusable `ContentImage` component that:
   - Takes a `contentId` prop
   - Uses `useContentUrl` hook to fetch the URL
   - Renders an Image with loading state
   - Handles errors gracefully (returns null on error)

2. Update `MenuLivePreview.tsx` to:
   - Import and use the `ContentImage` component
   - Display category images above category titles
   - Display menu item images in the item cards

3. Update `app/public/menu/[id].tsx` to:
   - Import and use the `ContentImage` component
   - Display category images above category titles
   - Display menu item images in the item cards

## Files Modified

1. `src/components/Content/ContentImage.tsx` - NEW: Reusable image display component
2. `src/components/Content/index.ts` - Added export for ContentImage
3. `src/components/OnlineMenus/MenuLivePreview.tsx` - Added image display for categories and items
4. `app/public/menu/[id].tsx` - Added image display for categories and items
5. `src/shared/testIds.ts` - Added new test IDs: CONTENT_IMAGE, CONTENT_IMAGE_CATEGORY, CONTENT_IMAGE_MENU_ITEM
6. `src/__tests__/components/Content/ContentImage.test.tsx` - NEW: Unit tests for ContentImage component

## Changes Made

### ContentImage Component (`src/components/Content/ContentImage.tsx`)
- Created a reusable component that fetches and displays content images
- Uses `useContentUrl` hook to get the image URL from the Content Service
- Returns null if contentId is null/undefined/empty
- Returns null on error or if URL is not available
- Shows loading indicator while fetching
- Accepts customizable height, width, borderRadius, and style props
- Includes accessibilityLabel support

### MenuLivePreview.tsx
- Added import for `ContentImage` from `../Content`
- Added `categoryImage` and `itemImage` styles
- Added `ContentImage` component for each category (height: 120px)
- Added `ContentImage` component for each menu item (height: 100px)
- Test IDs follow pattern: `CONTENT_IMAGE_CATEGORY-{index}` and `CONTENT_IMAGE_MENU_ITEM-{categoryIndex}-{itemIndex}`

### Public Menu Page (`app/public/menu/[id].tsx`)
- Added import for `ContentImage` from `../../../src/components/Content`
- Updated imports to include `Category` and `MenuItem` types from menuTypes
- Added `categoryImage` and `itemImage` styles
- Renamed `MenuItem` component to `MenuItemComponent` (to avoid conflict with imported type)
- Updated props interfaces to use proper `Category` and `MenuItem` types (which include `imageContentId`)
- Added `ContentImage` component for each category (height: 150px)
- Added `ContentImage` component for each menu item (height: 120px)

### Test IDs (`src/shared/testIds.ts`)
- Added `CONTENT_IMAGE: 'content-image'`
- Added `CONTENT_IMAGE_CATEGORY: 'content-image-category'`
- Added `CONTENT_IMAGE_MENU_ITEM: 'content-image-menu-item'`

### Unit Tests (`src/__tests__/components/Content/ContentImage.test.tsx`)
- Tests conditional rendering based on contentId (null, undefined, empty string, valid)
- Tests loading state behavior
- Tests error handling (isError, undefined URL, empty URL)
- Tests successful render with valid URL
- Tests hook call behavior
- Total: 10 new tests

## Test Results

### Lint Check
```
npm run lint:fix
✖ 293 problems (0 errors, 293 warnings)
```
All warnings are pre-existing (magic numbers in other files, file length warnings). No new errors introduced.

### Unit Tests
```
npm run test:coverage

Test Suites: 47 passed, 47 total
Tests:       309 passed, 309 total (10 new tests from ContentImage)
```

### Build
```
npx expo export --platform web

Web Bundled 1340ms node_modules\expo-router\entry.js (1038 modules)
Exported: dist
```

## Success Criteria

- [x] Category images display in MenuLivePreview
- [x] Menu item images display in MenuLivePreview
- [x] Category images display in public menu page
- [x] Menu item images display in public menu page
- [x] Loading states handled gracefully (shows loading indicator, then image or nothing)
- [x] `npm run lint:fix` passes with no errors
- [x] `npm run test:coverage` passes (309 tests)
- [x] `npx expo export --platform web` succeeds

## Notes

- The `ContentImage` component gracefully handles missing content by returning `null`, so UI will not break if imageContentId is not set
- For the images to actually appear, the backend needs to persist the content IDs when saving menus (backend-dev agent is working on this)
- The component uses the `useContentUrl` hook which works for both authenticated and public content
- Public content URL fetch may need additional backend configuration if CORS or authentication issues arise

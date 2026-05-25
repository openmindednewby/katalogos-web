# Fix Video Content Display

## Status: COMPLETED

## Problem Statement

Videos are not displayed in the public menu page or the menu preview (admin dashboard). The backend supports `videoContentId` on both Category and MenuItem, and the MenuContentEditor allows uploading videos via VideoPicker, but:

1. There is no `ContentVideo` component to render video content
2. `MenuLivePreview.tsx` only renders images using `ContentImage`, ignoring `videoContentId`
3. Public menu page (`app/public/menu/[id].tsx`) only renders images, ignoring `videoContentId`

## Root Cause Analysis

- The `ContentImage` component exists and works correctly for images
- The `VideoPicker` component exists for uploading videos
- But there is NO `ContentVideo` component to display uploaded videos
- The preview and public display components do not use any video rendering

## Implementation Plan

1. **Create `ContentVideo` component** (`src/components/Content/ContentVideo.tsx`)
   - Similar to `ContentImage` but renders a video player
   - Support both authenticated and public URLs via `isPublic` prop
   - Use HTML5 video for web, placeholder for native (expo-av not installed)

2. **Update `MenuLivePreview.tsx`**
   - Import and use `ContentVideo` component
   - Render category videos using `category.videoContentId`
   - Render menu item videos using `item.videoContentId`

3. **Update `app/public/menu/[id].tsx`**
   - Import and use `ContentVideo` component
   - Render category videos using `category.videoContentId`
   - Render menu item videos using `item.videoContentId`

4. **Export ContentVideo from index.ts**
   - Add export to `src/components/Content/index.ts`

5. **Add test IDs** for video components

## Files Modified

1. `src/components/Content/ContentVideo.tsx` (NEW) - Video display component
2. `src/components/Content/index.ts` - Added ContentVideo export
3. `src/components/OnlineMenus/MenuLivePreview.tsx` - Added video rendering for categories and menu items
4. `app/public/menu/[id].tsx` - Added video rendering for categories and menu items
5. `src/shared/testIds.ts` - Added CONTENT_VIDEO, CONTENT_VIDEO_CATEGORY, CONTENT_VIDEO_MENU_ITEM

## Success Criteria

- [x] `ContentVideo` component created and working
- [x] Videos display in MenuLivePreview
- [x] Videos display in public menu page
- [x] Both authenticated and public URL fetching work (via `isPublic` prop)
- [x] `npm run lint:fix` passes (0 errors, only warnings)
- [x] `npm run test:coverage` passes (313 tests, all passing)
- [x] `npx expo export --platform web` succeeds

## Changes Made

### 1. ContentVideo Component (`src/components/Content/ContentVideo.tsx`)

Created a new component that:
- Fetches content URL using `useContentUrl` or `usePublicContentUrl` hooks based on `isPublic` prop
- On web: Renders HTML5 `<video>` element with controls
- On native: Shows a placeholder with play icon (requires expo-av for full playback)
- Supports autoPlay, loop, muted, showControls options
- Returns null if no contentId provided or URL fetch fails

### 2. Updated MenuLivePreview.tsx

- Imported `ContentVideo` from `../Content`
- Added `categoryVideo` and `itemVideo` styles
- For each category: renders `ContentVideo` with `category.videoContentId`
- For each menu item: renders `ContentVideo` with `item.videoContentId`
- Added proper `accessibilityHint` props for a11y compliance

### 3. Updated Public Menu Page (`app/public/menu/[id].tsx`)

- Imported `ContentVideo` from components
- Added `categoryVideo` and `itemVideo` styles
- In CategorySection: renders `ContentVideo` with `isPublic` for unauthenticated access
- In MenuItemComponent: renders `ContentVideo` with `isPublic` for unauthenticated access

### 4. Updated testIds.ts

Added new test IDs:
- `CONTENT_VIDEO: 'content-video'`
- `CONTENT_VIDEO_CATEGORY: 'content-video-category'`
- `CONTENT_VIDEO_MENU_ITEM: 'content-video-menu-item'`

## Test Results

```
Test Suites: 47 passed, 47 total
Tests:       313 passed, 313 total
Snapshots:   0 total
Time:        5.322 s

ESLint: 0 errors, 211 warnings
Build: Success (dist/ exported)
```

## Notes

- The ContentVideo component uses HTML5 video on web which works well
- On native (iOS/Android), it shows a placeholder because expo-av is not installed
- To enable native video playback, install expo-av package and update the component
- Videos will only display if they have been uploaded with a valid videoContentId

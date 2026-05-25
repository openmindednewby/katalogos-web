# Content Upload Components Implementation

> **Reference**: User requirement for content upload functionality in BaseClient

## Status: COMPLETED

## Problem Statement
Create React Native components for content upload functionality in the BaseClient app. These components will be used to upload images, videos, and documents to categories and menu items. The content will be managed by a Content Service (port 5010) with signed URL uploads.

## Root Cause Analysis
N/A - New feature implementation

## Implementation Plan

### Phase 1: Types and API Hooks
1. Create TypeScript types for content DTOs
2. Create `useUploadContent` hook for the upload flow
3. Create `useContent` hook for fetching content
4. Create `useContentUrl` hook for access URLs
5. Create `useContentList` hook for listing content

### Phase 2: Base Components
1. Create `UploadProgress` component for progress indication
2. Create `ContentPreview` component for displaying content
3. Create `ContentUploader` generic wrapper component

### Phase 3: Picker Components
1. Create `ImagePicker` component using expo-image-picker
2. Create `VideoPicker` component for video selection
3. Create `DocumentPicker` component using expo-document-picker

### Phase 4: Testing
1. Write unit tests for hooks (logic-focused)
2. Write unit tests for components (callback behavior)

### Phase 5: Integration
1. Add testIds to shared/testIds.ts
2. Update environment config with CONTENT_API_URL

## Files Created

### Hooks
- `src/lib/hooks/content/types.ts` - TypeScript interfaces for content upload
- `src/lib/hooks/content/useUploadContent.ts` - Upload hook with progress tracking and cancellation
- `src/lib/hooks/content/useContent.ts` - Content query hooks (useContent, useContentUrl, useContentList)
- `src/lib/hooks/content/index.ts` - Barrel export

### Components
- `src/components/Content/UploadProgress.tsx` - Progress indicator with cancel button
- `src/components/Content/ContentPreview.tsx` - Content preview with delete button
- `src/components/Content/ContentUploader.tsx` - Generic uploader component
- `src/components/Content/ImagePicker.tsx` - Image picker using expo-image-picker
- `src/components/Content/VideoPicker.tsx` - Video picker with size warning
- `src/components/Content/DocumentPicker.tsx` - Document picker using expo-document-picker
- `src/components/Content/index.ts` - Barrel export

### Tests
- `src/__tests__/hooks/content/useUploadContent.test.ts` - Upload hook tests
- `src/__tests__/components/Content/ContentUploader.test.tsx` - UploadProgress tests
- `src/__tests__/components/Content/ContentPreview.test.tsx` - ContentPreview tests

## Files Modified
- `src/shared/testIds.ts` - Added content upload test IDs
- `src/config/environment.ts` - Added CONTENT_API_URL for all environments

## Dependencies Added
- `expo-image-picker` - For image and video selection
- `expo-document-picker` - For document selection

## Success Criteria
- [x] All TypeScript types properly defined
- [x] useUploadContent hook handles full upload flow
- [x] useContent hooks fetch content metadata
- [x] ImagePicker allows image selection and shows preview
- [x] VideoPicker allows video selection with size warning
- [x] DocumentPicker handles PDF/DOCX files
- [x] UploadProgress shows progress and cancel button
- [x] ContentPreview displays images/videos/documents
- [x] All components have proper accessibility attributes
- [x] Unit tests pass for hook logic
- [x] Linter passes with no errors (only warnings)
- [x] Build succeeds

## Test Results

### Linting
```
npm run lint:fix
- 0 errors
- 7 warnings (complexity warnings in existing code, not new code)
```

### Unit Tests
```
npm run test:coverage -- --testPathPattern="Content"
- All tests pass
- Content hooks test: PASS
- ContentUploader test: PASS
- ContentPreview test: PASS
```

### Build
```
npx expo export --platform web
- Build successful
- Exported to dist/
```

## API Contract

The components expect the following API endpoints from the Content Service (port 5010):

```typescript
// Request upload URL
POST /api/content/upload-url
Request: { fileName, contentType, fileSizeBytes, category, isPublic }
Response: { contentId, uploadUrl, blobPath, expiresAt }

// Complete upload
POST /api/content/upload-complete
Request: { contentId }
Response: { contentId, status, url }

// Get content
GET /api/content/{id}
Response: { id, fileName, contentType, category, status, url, thumbnailUrl, metadata }

// Get content URL
GET /api/content/{id}/url
Response: { url, expiresAt }

// List content
GET /api/content?category=Image&page=1&pageSize=20
Response: { items: [...], totalCount, page, pageSize }
```

## Usage Examples

### ImagePicker
```tsx
import { ImagePicker } from '../components/Content';

<ImagePicker
  value={categoryImageId}
  onChange={(contentId) => setFormData({ ...formData, imageId: contentId })}
  label="Category Image"
  hint="Select an image for the category"
/>
```

### VideoPicker
```tsx
import { VideoPicker } from '../components/Content';

<VideoPicker
  value={menuItemVideoId}
  onChange={(contentId) => setFormData({ ...formData, videoId: contentId })}
  label="Item Video"
/>
```

### DocumentPicker
```tsx
import { DocumentPicker } from '../components/Content';

<DocumentPicker
  value={menuDocumentId}
  onChange={(contentId) => setFormData({ ...formData, documentId: contentId })}
  label="Menu PDF"
  hint="Upload a PDF menu"
/>
```

## Notes
- The components require the Content Service backend to be implemented
- Integration into Category and MenuItem edit forms will be done after backend is ready
- E2E tests should be created after integration to verify the full upload flow

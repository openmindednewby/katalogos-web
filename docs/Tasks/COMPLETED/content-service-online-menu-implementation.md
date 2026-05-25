# Content Service Implementation - Online Menu Phase

> **Status**: IN_PROGRESS
> **Priority**: High
> **Started**: 2026-01-24

## Problem Statement

Implement the Content Delivery Service to support uploading and serving images, videos, and documents for the online menu feature. This includes:
- Categories can have images/videos
- Menu items can have images/videos/documents (e.g., allergen info PDFs)

## Scope (Phase 1 - Online Menus Only)

### Backend
- [x] Create ContentService microservice with Clean Architecture
- [x] Implement RustFS storage integration (S3-compatible)
- [x] Upload flow with signed URLs
- [ ] Image processing (thumbnails, WebP conversion) - Future phase
- [ ] Virus scanning integration (ClamAV) - Future phase
- [x] Content metadata API
- [x] Update Tilt/Docker configuration
- [x] Unit tests for all handlers (13 tests passing)

### Frontend
- [x] Create ContentUploader component
- [x] Create ImagePicker component
- [x] Create VideoPicker component
- [x] Create DocumentPicker component
- [x] Integrate with Category edit forms - Completed
- [x] Integrate with MenuItem edit forms - Completed
- [x] Upload progress indicators
- [x] Error handling UI
- [x] Unit tests for hooks and components

### Infrastructure
- [x] Add RustFS container to docker-compose/Tilt
- [ ] Add Imgproxy container for image transformations - Future phase
- [ ] Add ClamAV container for virus scanning - Future phase
- [ ] Configure NGINX for CDN caching - Future phase
- [x] Update environment configurations

### E2E Tests
- [ ] Test image upload flow
- [ ] Test video upload flow
- [ ] Test document upload flow
- [ ] Test content display on menu
- [ ] Test error scenarios

## Technical Decisions

- **Storage**: RustFS (S3-compatible, self-hosted)
- **Image Processing**: ImageSharp (server-side) + Imgproxy (on-demand)
- **Virus Scanning**: ClamAV
- **CDN**: NGINX with caching

## API Endpoints (Content Service - Port 5010)

```
POST   /api/content/upload-url          # Get signed URL for upload
POST   /api/content/upload-complete     # Notify upload complete
GET    /api/content/{id}                # Get content metadata
GET    /api/content/{id}/url            # Get access URL
DELETE /api/content/{id}                # Soft delete content
GET    /api/content                     # List content (paginated)

# Service-specific convenience endpoints
POST   /api/content/online-menus/images
POST   /api/content/online-menus/videos
POST   /api/content/online-menus/documents
```

## Database Schema Changes

### New Tables (ContentService DB)

```sql
-- Content table
CREATE TABLE "Content" (
    "Id" SERIAL PRIMARY KEY,
    "ExternalId" UUID NOT NULL UNIQUE,
    "TenantId" UUID NOT NULL,
    "FileName" VARCHAR(255) NOT NULL,
    "OriginalFileName" VARCHAR(255) NOT NULL,
    "ContentType" VARCHAR(100) NOT NULL,
    "Category" VARCHAR(50) NOT NULL, -- Image, Video, Document
    "Status" VARCHAR(50) NOT NULL, -- Uploading, Processing, Ready, Failed
    "BlobPath" VARCHAR(500) NOT NULL,
    "FileSizeBytes" BIGINT NOT NULL,
    "Metadata" JSONB,
    "VirusScanStatus" VARCHAR(50),
    "IsPublic" BOOLEAN DEFAULT true,
    "CreatedByUserId" UUID NOT NULL,
    "CreatedDate" TIMESTAMP NOT NULL,
    "LastUpdatedDate" TIMESTAMP NOT NULL
);

-- Content variants (thumbnails, transcoded versions)
CREATE TABLE "ContentVariant" (
    "Id" SERIAL PRIMARY KEY,
    "ContentId" INT NOT NULL REFERENCES "Content"("Id"),
    "VariantName" VARCHAR(50) NOT NULL,
    "BlobPath" VARCHAR(500) NOT NULL,
    "MimeType" VARCHAR(100) NOT NULL,
    "FileSizeBytes" BIGINT NOT NULL,
    "Width" INT,
    "Height" INT,
    "CreatedDate" TIMESTAMP NOT NULL
);
```

### OnlineMenuService Schema Updates

```sql
-- Add content references to Categories
ALTER TABLE "Categories" ADD COLUMN "ImageContentId" UUID;
ALTER TABLE "Categories" ADD COLUMN "VideoContentId" UUID;

-- Add content references to MenuItems
ALTER TABLE "MenuItems" ADD COLUMN "ImageContentId" UUID;
ALTER TABLE "MenuItems" ADD COLUMN "VideoContentId" UUID;
ALTER TABLE "MenuItems" ADD COLUMN "DocumentContentIds" UUID[]; -- Multiple docs allowed
```

## Files to Create/Modify

### Backend (New ContentService)
```
Services/ContentService/
├── src/
│   ├── Content.API/
│   │   ├── Endpoints/
│   │   │   ├── Upload/RequestUploadUrl.cs
│   │   │   ├── Upload/CompleteUpload.cs
│   │   │   ├── Content/GetContent.cs
│   │   │   ├── Content/GetContentUrl.cs
│   │   │   ├── Content/ListContent.cs
│   │   │   └── Content/DeleteContent.cs
│   │   └── Program.cs
│   ├── Content.Application/
│   │   ├── UseCases/
│   │   ├── DTOs/
│   │   └── Interfaces/
│   ├── Content.Domain/
│   │   ├── Entities/
│   │   └── Enums/
│   └── Content.Infrastructure/
│       ├── Data/
│       ├── Storage/RustFsStorageService.cs
│       └── Processing/ImageProcessor.cs
├── tests/
│   ├── Content.UnitTests/
│   └── Content.IntegrationTests/
└── Dockerfile
```

### Frontend (BaseClient)
```
BaseClient/src/
├── components/
│   └── Content/
│       ├── ContentUploader.tsx
│       ├── ImagePicker.tsx
│       ├── VideoPicker.tsx
│       ├── DocumentPicker.tsx
│       ├── UploadProgress.tsx
│       └── ContentPreview.tsx
├── lib/
│   └── hooks/
│       ├── useUploadContent.ts
│       ├── useContent.ts
│       └── useContentUrl.ts
└── __tests__/
    └── components/
        └── Content/
```

### Infrastructure
```
- Tiltfile (add ContentService, RustFS, Imgproxy, ClamAV)
- docker-compose.yml (add services)
- kubernetes/ (if applicable)
```

## Success Criteria

- [ ] Can upload images to categories and menu items
- [ ] Can upload videos to categories and menu items
- [ ] Can upload documents (PDFs) to menu items
- [ ] Thumbnails are auto-generated for images/videos
- [ ] Content is virus-scanned before becoming available
- [ ] Content displays correctly in the online menu
- [ ] All unit tests pass (>80% coverage)
- [ ] All E2E tests pass
- [ ] Documentation is updated

## Implementation Order

1. **Backend Infrastructure** (backend-dev)
   - Create ContentService project structure
   - Set up RustFS Docker container
   - Implement storage abstraction
   - Implement upload flow

2. **Backend Processing** (backend-dev)
   - Image processing (thumbnails)
   - Virus scanning integration
   - Content metadata API

3. **Frontend Components** (frontend-dev)
   - Upload components
   - Integration with menu forms
   - Display components

4. **E2E Tests** (regression-tester)
   - Upload flow tests
   - Display tests
   - Error handling tests

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-01-24 | Claude | Created task document, started implementation |
| 2026-01-24 | Claude | Created ContentService docker-compose.yml with PostgreSQL, MinIO (RustFS-compatible), and bucket initialization |
| 2026-01-24 | Claude | Updated main Tiltfile to include ContentService (content-api, content-db, rustfs, rustfs-init) |
| 2026-01-24 | Claude | Added ContentService linter and unit test resources to Tiltfile |
| 2026-01-24 | Claude | Added content-api to generate-hooks dependencies |
| 2026-01-24 | Claude | Added playwright-e2e-content-all test resource |
| 2026-01-24 | Claude | Launched backend-dev agent to create ContentService microservice |
| 2026-01-24 | Claude | Launched frontend-dev agent to create upload components |
| 2026-01-24 | Claude | Frontend agent completed: Created 7 components, 4 hooks, 3 test files |
| 2026-01-24 | Claude | Backend agent completed: Created 50+ C# files, all 13 unit tests pass |
| 2026-01-24 | Claude | Fixed IDomainEventDispatcher registration in MediatrConfigs.cs |
| 2026-01-24 | Claude | Created InitialCreate database migration |
| 2026-01-24 | Claude | Integrated ImagePicker, VideoPicker, DocumentPicker into MenuContentEditor |
| 2026-01-24 | Claude | Updated Category and MenuItem types with imageContentId, videoContentId, documentContentIds fields |
| 2026-01-24 | Claude | Added test IDs for category and menu item content pickers |
| 2026-01-24 | Claude | Added i18n translations for content picker labels |
| 2026-01-24 | Claude | Updated MenuContentEditor unit tests with QueryClientProvider and content hook mocks |

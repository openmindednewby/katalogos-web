# Fix Internal Docker URL in Upload Complete Response

> **Reference**: Content Service URL handling

## Status: COMPLETED

## Problem Statement

The `POST /api/content/upload-complete` endpoint returns the internal Docker URL (`http://seaweedfs-s3:8333/...`) instead of the external URL (`http://localhost:5013/...`) for public content. This makes the URL inaccessible from browsers.

### HAR Response Example:
```json
{"contentId":"...","status":"Ready","url":"http://seaweedfs-s3:8333/content-public/..."}
```

Expected:
```json
{"contentId":"...","status":"Ready","url":"http://localhost:5013/content-public/..."}
```

## Root Cause Analysis

In `CompleteUploadHandler.cs` and `GetContentUrlHandler.cs`, when generating public URLs, the code uses `_storageSettings.ServiceUrl` directly:

```csharp
url = $"{_storageSettings.ServiceUrl}/{bucketName}/{content.BlobPath}";
```

However, `StorageSettings` has:
- `ServiceUrl`: Internal URL (e.g., `http://seaweedfs-s3:8333`)
- `ExternalServiceUrl`: External URL (e.g., `http://localhost:5013`)
- `GetEffectiveExternalUrl()`: Returns external URL if set, otherwise falls back to internal

The `S3StorageService` correctly uses `GetEffectiveExternalUrl()` for presigned URLs, but the handlers don't use it for public URLs.

## Implementation Plan

1. Fix `CompleteUploadHandler.cs`:
   - Change line 76 from `_storageSettings.ServiceUrl` to `_storageSettings.GetEffectiveExternalUrl()`

2. Fix `GetContentUrlHandler.cs`:
   - Change line 51 from `_storageSettings.ServiceUrl` to `_storageSettings.GetEffectiveExternalUrl()`

## Files Modified

- `ContentService/Content/src/Content.UseCases/Upload/CompleteUploadHandler.cs`
- `ContentService/Content/src/Content.UseCases/Content/Get/GetContentUrlHandler.cs`

## Success Criteria

- [x] `POST /api/content/upload-complete` returns external URL for public content
- [x] `GET /api/content/{id}/url` returns external URL for public content
- [x] Solution builds without errors
- [x] Existing unit tests pass

## Changes Made

### CompleteUploadHandler.cs (line 76-77)
Changed from:
```csharp
url = $"{_storageSettings.ServiceUrl}/{bucketName}/{content.BlobPath}";
```

To:
```csharp
// Use external URL for browser access (handles Docker internal vs external URLs)
url = $"{_storageSettings.GetEffectiveExternalUrl()}/{bucketName}/{content.BlobPath}";
```

### GetContentUrlHandler.cs (line 49-51)
Changed from:
```csharp
// Public URL - direct access
var bucketName = _storageSettings.PublicBucket;
url = $"{_storageSettings.ServiceUrl}/{bucketName}/{content.BlobPath}";
```

To:
```csharp
// Public URL - direct access (use external URL for browser access)
var bucketName = _storageSettings.PublicBucket;
url = $"{_storageSettings.GetEffectiveExternalUrl()}/{bucketName}/{content.BlobPath}";
```

## Test Results

- **Build**: Succeeded with 0 warnings, 0 errors
- **Unit Tests**: All 23 tests passed (Duration: 258 ms)

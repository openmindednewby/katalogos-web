# Fix Public Menu Images Return 404

> **Reference**: Online Menu public display, ContentService URL generation

## Status: IN_PROGRESS

## Problem Statement

When viewing public menus, image URLs return 404. The reported error pattern shows:
- URL being used: `http://localhost:5013/content-public/{tenantId}/image/{imageId}`
- Where `imageId` is the ContentItem's ExternalId (GUID), NOT the actual filename

Expected URL format should be:
- `http://localhost:5013/content-public/{tenantId}/image/{uuid_filename.ext}`

## Root Cause Analysis

### Investigation Findings

After extensive code analysis, ALL code paths were verified as correct:

1. **ContentService URL Generation (Verified Correct)**
   - `GetPublicContentUrlHandler.cs` correctly generates URLs using `content.BlobPath`:
   ```csharp
   var url = $"{_storageSettings.GetEffectiveExternalUrl()}/{bucketName}/{content.BlobPath}";
   ```
   - Unit tests pass confirming URL format: `http://localhost:5013/content-public/{tenantId}/image/{uuid}.jpg`

2. **Upload Flow (Verified Correct)**
   - `RequestUploadUrlHandler.cs` correctly sets BlobPath:
   ```csharp
   var blobPath = $"{tenantId}/{category.ToString().ToLowerInvariant()}/{uniqueFileName}";
   ```
   - `uniqueFileName` is `{Guid}{extension}` (e.g., `abc123.jpg`)

3. **Frontend Flow (Verified Correct)**
   - `CategoryEditor.tsx` uses `ImagePicker` with `isPublic` prop
   - `ImagePicker` passes `isPublic` to `ContentUploader`
   - `ContentUploader` passes `isPublic` to `useUploadContent`
   - `useUploadContent` sends `isPublic: true` in the upload request

4. **Public Menu Display (Verified Correct)**
   - `CategorySection.tsx` uses `ContentImage` with `isPublic` prop
   - `ContentImage` calls `usePublicContentUrl` when `isPublic=true`
   - `usePublicContentUrl` calls `GET /api/content/{contentId}/public-url`

### Likely Root Causes (Data/Environment Issues)

Since all code paths are correct, the issue is likely one of:

1. **Content not marked as public in database**
   - `GetPublicByExternalIdAsync` filters: `IsPublic == true && Status == Ready`
   - Content might have `IsPublic = false`

2. **Content status not "Ready"**
   - Content might be stuck in "Uploading" or "Processing" state

3. **File not actually uploaded to storage**
   - The presigned URL upload might have failed
   - The file might have been uploaded to wrong bucket

4. **BlobPath corrupted or empty**
   - Database might have empty/incorrect BlobPath

## Changes Made

### 1. Added Logging to GetPublicContentUrlHandler

Added comprehensive logging to help diagnose the issue:

**File**: `ContentService/Content/src/Content.UseCases/Content/Get/GetPublicContentUrlHandler.cs`

- Added `ILogger<GetPublicContentUrlHandler>` dependency
- Logs when content is requested (with ContentId)
- Logs when content is not found (with warning about possible causes)
- Logs when content has empty BlobPath (error case)
- Logs when URL is successfully generated (with BlobPath and URL)

### 2. Added BlobPath Validation

Added validation to catch data corruption:
```csharp
if (string.IsNullOrWhiteSpace(content.BlobPath))
{
  _logger.LogError("Content has empty BlobPath...");
  return Result.Error("Content has invalid storage path.");
}
```

### 3. Added Unit Test for Empty BlobPath

Added new test case `Handle_EmptyBlobPath_ReturnsError` to verify the validation works.

**File**: `ContentService/Content/tests/Content.UnitTests/UseCases/GetPublicContentUrlHandlerTests.cs`

## Files Modified

- `ContentService/Content/src/Content.UseCases/Content/Get/GetPublicContentUrlHandler.cs`
- `ContentService/Content/tests/Content.UnitTests/UseCases/GetPublicContentUrlHandlerTests.cs`

## Test Results

- All 36 ContentService unit tests pass
- Web project builds successfully

## Debugging Steps for User

To diagnose the actual issue, check the following:

### 1. Check ContentService Logs
After the changes, the logs will show:
- `Getting public content URL for ContentId={id}` - Request received
- `Public content not found...` - Content doesn't exist, not public, or not Ready
- `Content has empty BlobPath...` - Data corruption
- `Generated public URL...BlobPath={path}, URL={url}` - Success with details

### 2. Check Database Record
Query the ContentItems table:
```sql
SELECT ExternalId, FileName, BlobPath, IsPublic, Status, TenantId
FROM "Contents"
WHERE "ExternalId" = '{imageContentId-from-menu}'
```

Verify:
- `IsPublic = true`
- `Status = 'Ready'`
- `BlobPath` has correct format: `{tenantId}/image/{uuid}.{ext}`

### 3. Check Storage
Verify file exists in SeaweedFS:
```bash
curl http://localhost:5013/content-public/{blobPath}
```

### 4. Check Browser Network Tab
Verify the URL returned by `/api/content/{id}/public-url` endpoint.

## Success Criteria

- [x] Added logging to diagnose issues
- [x] Added BlobPath validation
- [x] Unit tests pass (36/36)
- [x] Web project builds successfully
- [ ] Public menu images display correctly (requires environment testing)
- [ ] E2E tests verify public menu image display

## Additional Changes (Latest Session)

### 4. Added JSON Property Naming Configuration to ContentService

**File**: `ContentService/Content/src/Content.Web/Configurations/MiddlewareConfig.cs`

Added explicit JSON naming configuration to ensure proper camelCase handling:
```csharp
c.Serializer.Options.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
c.Serializer.Options.PropertyNameCaseInsensitive = true;
```

This ensures the backend correctly deserializes camelCase JSON from the frontend (e.g., `isPublic` -> `IsPublic`).

### 5. Added Debug Logging to ContentImage Component

**File**: `BaseClient/src/components/Content/ContentImage.tsx`

- Added `logPublicContentError` function to log public URL fetch failures
- Added console.warn for cases where image doesn't render due to error/missing URL
- Refactored component to reduce complexity (extracted `useContentImageUrl` hook)

When the issue occurs, check browser console for:
- `[ContentImage] Public URL fetch failed:` - indicates API call to `/api/content/{id}/public-url` failed
- `[ContentImage] Not rendering:` - indicates image won't display (error or missing URL)

### Latest Test Results

- ContentService builds successfully
- ESLint passes for ContentImage.tsx
- All 14 ContentImage unit tests pass

## Next Steps

1. Deploy changes and observe ContentService logs
2. If content not found: Check database for `IsPublic` and `Status`
3. If URL generated but 404: Check if file exists in SeaweedFS storage
4. If file missing: Investigate upload flow completion
5. Run full E2E test suite to verify the fix works

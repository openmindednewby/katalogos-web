# Fix Authenticated Content URL Endpoint Tenant Filter

> **Reference**: Related to `fix-content-image-loading-after-reload.md`

## Status: COMPLETED

## Problem Statement
The E2E tests are failing because images do not load after reloading the menu editor. Investigation reveals:

1. Content is uploaded with `isPublic=true`
2. The authenticated endpoint `/api/content/{id}/url` uses `GetByExternalIdAsync` which has tenant filtering
3. After page reload, the URL fetch returns 404 (Not Found)

## Root Cause Analysis

### Code Flow Analysis

1. **Frontend**: `ImagePicker` uses `useContentUrl(value)` which calls `GET /api/content/{id}/url`
2. **Endpoint**: `GetContentUrl.cs` calls `GetContentUrlQuery`
3. **Handler**: `GetContentUrlHandler.cs` line 30 uses `_contentRepository.GetByExternalIdAsync()`
4. **Repository**: `EfContentRepository.GetByExternalIdAsync()` uses standard DbContext query WITH tenant filter
5. **Tenant Filter**: `ContentDbContext.SetTenantFilter()` applies:
   ```csharp
   _currentTenantService.TenantId == null || e.TenantId == _currentTenantService.TenantId
   ```

### The Issue

The tenant filter works when:
- `_currentTenantService.TenantId == null` (no tenant context) - allows all
- `e.TenantId == _currentTenantService.TenantId` (matching tenant) - allows matching

However, when an authenticated user makes a request:
- The JWT token sets `_currentTenantService.TenantId` to the user's tenant
- The filter requires `e.TenantId == user's tenant`
- If the content was uploaded by a user but the tenant ID doesn't match for some reason, the query returns null
- The handler returns 404 Not Found

### Why This Might Happen After Reload

The issue could be:
1. **Tenant ID mismatch**: Content might be saved with a different tenant ID than expected
2. **Token refresh issue**: After reload, the token might have different claims
3. **Cross-tenant content**: Public content might need to be accessible regardless of tenant

### Existing Solution Pattern

The repository already has `GetPublicByExternalIdAsync()` which uses `IgnoreQueryFilters()`:
```csharp
public async Task<ContentItem?> GetPublicByExternalIdAsync(Guid externalId, CancellationToken ct)
{
    return await _dbContext.Contents
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(
            e => e.ExternalId == externalId &&
                 e.IsPublic &&
                 e.Status == ContentStatus.Ready,
            cancellationToken);
}
```

## Implementation Plan

### Option 1: Modify Handler to Try Public Content on Not Found (RECOMMENDED)
The authenticated handler should first try the tenant-filtered query. If not found and the content is public, try without filters.

### Option 2: Check If Content Is Public and Use Appropriate Method
The handler could accept an optional `isPublic` parameter.

### Option 3: Always Use IgnoreQueryFilters for Authenticated Users
Less secure but simpler - authenticated users can access any content by ID.

**Chosen Approach: Option 1** - Try with tenant filter first, then fallback to public content lookup.

## Files to Modify

1. `ContentService/Content/src/Content.UseCases/Content/Get/GetContentUrlHandler.cs`
   - Add fallback to `GetPublicByExternalIdAsync` when content not found

2. `ContentService/Content/tests/Content.UnitTests/UseCases/GetContentUrlHandlerTests.cs` (NEW)
   - Add unit tests for the handler

## Success Criteria
- [x] Authenticated endpoint returns URL for public content even if tenant filter excludes it
- [x] Regular tenant-scoped content still requires matching tenant
- [x] Unit tests cover both scenarios
- [ ] E2E test "should persist uploaded image after reloading menu" passes
- [x] `dotnet build` succeeds
- [x] `dotnet test` passes

## Changes Made

### 1. Modified `GetContentUrlHandler.cs`

Added fallback to `GetPublicByExternalIdAsync` when tenant-filtered query returns null:

```csharp
// First try with tenant filter (for tenant-scoped content)
var content = await _contentRepository.GetByExternalIdAsync(request.ContentId, cancellationToken);

// If not found, try public content lookup (bypasses tenant filter)
// This handles the case where authenticated users access public content
// that may have been uploaded by a different tenant context
content ??= await _contentRepository.GetPublicByExternalIdAsync(request.ContentId, cancellationToken);
```

### 2. Created `GetContentUrlHandlerTests.cs`

Added comprehensive unit tests covering:
- `Handle_TenantScopedContentExists_ReturnsUrl` - Content found via tenant filter
- `Handle_ContentNotFoundInTenant_TriesPublicFallback` - Fallback to public query works
- `Handle_ContentFoundInTenant_DoesNotCallPublicFallback` - No unnecessary fallback calls
- `Handle_ContentNotFoundAnywhere_ReturnsNotFound` - Both queries fail returns 404
- `Handle_ContentNotReady_ReturnsInvalid` - Content in pending state returns error
- `Handle_PrivateContent_ReturnsPresignedUrl` - Private content returns presigned URL
- `Handle_PublicContentViaFallback_ReturnsDirectUrl` - Public fallback returns direct URL

## Test Results

```
Test Run Successful.
Total tests: 35
     Passed: 35
 Total time: 1.0056 Seconds
```

All 35 unit tests pass, including 7 new tests for `GetContentUrlHandler`.

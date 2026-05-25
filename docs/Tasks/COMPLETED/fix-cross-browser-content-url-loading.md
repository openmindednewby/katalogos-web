# Fix Cross-Browser Content URL Loading Failure

> **Related Task**: `fix-content-image-loading-after-reload.md`

## Status: IN_PROGRESS

## Problem Statement

Content images fail to load in Firefox after saving and reloading a menu, while they work correctly in Chromium-based browsers. This is a critical cross-browser compatibility issue affecting the content upload feature.

### Symptoms
- Images display correctly during the upload session
- After saving the menu and reloading, images fail to load in Firefox
- Firefox page snapshot shows NO `img` element inside the preview container
- `displayUrl` is `undefined` in Firefox, meaning the URL fetch failed
- Chromium browsers show the `img` element and load images correctly

### Evidence from E2E Tests
```yaml
# Firefox page snapshot - MISSING img element
- generic "Preview of 0c59a132-9a55-4cd6-9069-6dadfa5e0fd2" [ref=e144]

# Chromium page snapshot - img element PRESENT
- generic "Preview of 698d850c-..." [ref=e144]:
    - img "Preview of 698d850c-..." [ref=e146]
```

## Root Cause Analysis

### Primary Cause: Firefox Third-Party Cookie Blocking

Firefox's Enhanced Tracking Protection (ETP) blocks third-party cookies by default. The Content Service runs on a different port (5009) than the main application, creating a cross-origin scenario.

**Technical Flow:**

1. Content URL fetch uses `withCredentials: true`:
```typescript
// BaseClient/src/lib/hooks/content/useContent.ts
async function fetchContentUrl(contentId: string): Promise<ContentUrlResponse> {
  return get<undefined, ContentUrlResponse>(`/api/content/${contentId}/url`, undefined, {
    withToken: true,
    withCredentials: true,  // <-- PROBLEM: Firefox blocks this for cross-origin
    baseURL: CONTENT_API_URL,  // http://localhost:5009 (different port)
  });
}
```

2. Firefox blocks the cross-origin request with credentials
3. The URL fetch fails silently (error swallowed by React Query)
4. `displayUrl` becomes `undefined`
5. Image element is not rendered

### Secondary Causes

1. **Silent Error Handling**: `ImagePicker.tsx` doesn't surface URL fetch errors
2. **CORS with AllowCredentials**: Backend requires credentials mode which triggers stricter browser handling
3. **Different Origin Detection**: Firefox treats different ports as different origins more strictly than Chrome

## Architecture Decision

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **1. Remove withCredentials** | Use only Bearer token auth | Simple, works in all browsers | Requires backend CORS update |
| **2. Signed URLs** | Embed auth in URL query params | CDN-friendly, standard pattern | More backend changes |
| **3. Proxy via main API** | Route content requests through main API | No CORS issues | Latency, load |
| **4. Browser-specific headers** | Configure CORS for Firefox | Keeps existing pattern | Fragile, browser-specific |

### Decision: Option 1 - Remove withCredentials

**Rationale:**
- JWT Bearer authentication is header-based, not cookie-based
- `withCredentials: true` is unnecessary when using `Authorization` header
- Simplest fix with minimal changes
- Backend already supports header-based auth

## Implementation Plan

### Phase 1: Frontend Quick Fix (Immediate)

1. **Update `useContent.ts`** - Set `withCredentials: false`:

```typescript
// BaseClient/src/lib/hooks/content/useContent.ts

async function fetchContentUrl(contentId: string): Promise<ContentUrlResponse> {
  return get<undefined, ContentUrlResponse>(`/api/content/${contentId}/url`, undefined, {
    withToken: true,
    withCredentials: false,  // CHANGE: Don't send cookies cross-origin
    baseURL: CONTENT_API_URL,
  });
}

// Apply same change to fetchContent and fetchContentList functions
```

2. **Update `useUploadContent.ts`** - Same change for upload-related requests

### Phase 2: Backend CORS Update

1. **Update `Program.cs`** - Remove `AllowCredentials()`:

```csharp
// ContentService/Content/src/Content.Web/Program.cs

options.AddPolicy("AllowLocalhost", policy =>
{
    policy.WithOrigins(localOrigins)
          .AllowAnyHeader()
          .AllowAnyMethod();
    // REMOVED: .AllowCredentials();
});
```

### Phase 3: Error Handling (Per Related Task)

1. **Update `ImagePicker.tsx`** - Surface URL fetch errors:

```typescript
// Already destructures isError and error
const {
  data: urlData,
  isLoading: isUrlLoading,
  isError: isUrlError,
  error: urlError,
} = useContentUrl(value);

// Pass error to ContentUploader for display
const urlFetchError = isUrlError
  ? urlError instanceof Error
    ? urlError.message
    : 'Failed to load image URL'
  : undefined;
```

### Phase 4: Testing

1. Run E2E tests with Firefox:
```bash
cd E2ETests && npx playwright test --project=firefox
```

2. Run E2E tests with all browsers:
```bash
cd E2ETests && npx playwright test
```

3. Manual verification in Firefox, Chrome, Safari

## Files to Modify

| File | Change |
|------|--------|
| `BaseClient/src/lib/hooks/content/useContent.ts` | Set `withCredentials: false` for all requests |
| `BaseClient/src/lib/hooks/content/useUploadContent.ts` | Set `withCredentials: false` for all requests |
| `ContentService/Content/src/Content.Web/Program.cs` | Remove `.AllowCredentials()` from CORS policy |
| `BaseClient/src/components/Content/ImagePicker.tsx` | Already has error handling, verify it works |

## Success Criteria

- [ ] `npm run lint:fix` passes
- [ ] `npm run test:coverage` passes
- [ ] `npx expo export --platform web` succeeds
- [ ] E2E test `should persist uploaded image after reloading menu` passes in Firefox
- [ ] E2E test `should persist uploaded image after reloading menu` passes in Chrome
- [ ] No CORS errors in browser console
- [ ] Images load correctly after page reload in all browsers

## Changes Made

### Frontend Changes

1. **`BaseClient/src/lib/hooks/content/useContent.ts`**
   - Set `withCredentials: false` for `fetchContent()` function
   - Set `withCredentials: false` for `fetchContentUrl()` function
   - Set `withCredentials: false` for `fetchContentList()` function
   - Added comments explaining the cross-browser compatibility rationale

2. **`BaseClient/src/lib/hooks/content/useUploadContent.ts`**
   - Set `withCredentials: false` for `requestUploadUrl()` function
   - Set `withCredentials: false` for `completeUpload()` function
   - Set `withCredentials: false` for `fetchContent()` function
   - Added comments explaining the cross-browser compatibility rationale

### Backend Changes

3. **`ContentService/Content/src/Content.Web/Program.cs`**
   - Removed `.AllowCredentials()` from CORS policy
   - Added comment explaining the removal was for Firefox compatibility

## Test Results

### Verification Suite (2026-01-26)

1. **Linting**: No new errors introduced (only pre-existing warnings)
   ```
   npx eslint src/lib/hooks/content/useContent.ts src/lib/hooks/content/useUploadContent.ts
   # 0 errors, 9 warnings (all pre-existing)
   ```

2. **Unit Tests**: All 309 tests passing
   ```
   npm test -- --testPathPattern="Content" --passWithNoTests
   # Test Suites: 47 passed, 47 total
   # Tests: 309 passed, 309 total
   ```

3. **Build**: Successful
   ```
   npx expo export --platform web
   # Exported: dist (1.66 MB bundle)
   ```

4. **E2E Tests**: Pending - requires running with Firefox browser
   - Run: `cd E2ETests && npx playwright test --project=firefox`

### Next Steps

- [ ] Run E2E tests in Firefox to verify the fix
- [ ] Run E2E tests in Chrome to ensure no regression
- [ ] Manual testing in Safari

## References

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Firefox ETP](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop)
- [Axios withCredentials](https://axios-http.com/docs/req_config)

# Fix File Manager - Network Error (Missing Backend API)

## Status: TODO
## Priority: HIGH
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The File Manager page (`/file-manager`) shows an error dialog on load:
"NetworkError: Failed to send on XMLHTTPRequest: Failed to load /mockapi/api/files/operations"

The Syncfusion FileManagerComponent requires a backend REST API for file operations, but no mock/stub API is configured.

## Screenshot Evidence
- Page shows "File Manager" heading
- Error dialog overlays the page with the NetworkError message
- No file/folder tree visible

## Root Cause
- FileManagerComponent needs `ajaxSettings.url` pointing to a working API
- Currently points to `/mockapi/api/files/operations` which doesn't exist
- Unlike other feature pages that use hardcoded mock data, the file manager expects a real API

## Tasks
- [ ] Option A: Create a mock file system data provider (in-memory, no backend needed)
- [ ] Option B: Use Syncfusion's built-in Node.js file system provider as dev dependency
- [ ] Option C: Create static mock responses for file operations (list, create, delete, rename)
- [ ] Add graceful error handling when API is unavailable (show placeholder instead of error dialog)
- [ ] Add E2E test for file manager rendering

## Files
- `src/features/file-manager/pages/FileManagerPage/`

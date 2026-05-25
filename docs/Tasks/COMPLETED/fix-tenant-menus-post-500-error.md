# Fix POST /TenantMenus HTTP 500 Error

> **Reference**: E2E tests failing on menu creation

## Status: IN_PROGRESS

## Problem Statement
The POST /TenantMenus endpoint is returning HTTP 500 Internal Server Error, causing E2E tests to fail. The frontend successfully sends the request to `https://localhost:5006/TenantMenus`, but the backend returns a 500 error with no visible error logs.

## Context
Recent Phase 1 backend changes added:
- `isActive` field to TenantMenus (default: false)
- `displayOrder` fields to Category and MenuItem
- New Activate/Deactivate endpoints

One of these changes may have broken the create endpoint.

## Root Cause Analysis
**IDENTIFIED**: The issue is caused by the unique constraint `IX_TenantMenus_TenantId_Name` on `(TenantId, Name)`.

When a superUser (who doesn't have a tenantId in their JWT) creates a menu:
1. The `currentTenantService.TenantId` is null
2. The endpoint sets `tenantId = Guid.Empty` (00000000-0000-0000-0000-000000000000)
3. If a menu already exists with the same `(TenantId=Guid.Empty, Name="Menu Name")`, PostgreSQL throws a duplicate key constraint violation
4. This returns HTTP 500 with error: `23505: duplicate key value violates unique constraint "IX_TenantMenus_TenantId_Name"`

**Testing Results:**
- curl with unique names: ✅ Works (HTTP 200)
- curl with duplicate names: ❌ Fails (HTTP 500 - duplicate key)
- E2E test with Playwright: ❌ Fails (HTTP 500)

**Key Discovery:** E2E tests are failing but curl works with unique names. This suggests the E2E test environment might have stale data or the Playwright requests are somehow different from curl requests.

## Implementation Plan
1. Locate the POST /TenantMenus endpoint in Services folder
2. Find the CQRS command handler for creating menus
3. Check database migrations for isActive/displayOrder fields
4. Identify the specific error (enable logging if needed)
5. Fix the issue
6. Run backend unit tests
7. Verify the fix manually

## Files to Modify
- TBD (will update after investigation)

## Success Criteria
- [ ] POST /TenantMenus returns 201 Created with valid response
- [ ] Backend unit tests pass
- [ ] E2E tests pass
- [ ] No 500 errors in backend logs

## Changes Made
1. Added detailed logging to Create endpoint (`Create.cs`)
   - Logs tenantId, userId, menu name at creation
   - Logs success/failure
   - Logs exceptions with full stack trace
2. Investigated database schema and confirmed `IsActive` migration was applied
3. Decoded JWT tokens to verify superUser doesn't have tenantId claim
4. Tested endpoint with curl - works with unique names, fails with duplicates

## Recommended Fix
The real solution is **NOT a backend fix** - the backend is working as designed. The issue is that:

1. **SuperUsers don't have a tenantId** in their JWT token (by design)
2. The Create endpoint uses `Guid.Empty` for these users
3. **The E2E tests should NOT be running as superUser when testing menu creation**

**Recommended Actions:**
1. E2E tests should authenticate as a tenant-specific admin user (with a tenantId in their JWT)
2. OR, modify the Create endpoint to accept an optional `tenantId` parameter in the request body for superUsers
3. Add proper error handling to return HTTP 400 (Bad Request) when trying to create a duplicate menu instead of letting the database constraint cause a 500

## Test Results
_Pending..._

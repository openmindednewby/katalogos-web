# Fix Dietary Tag Code Review Issues

## Status: COMPLETED
## Priority: HIGH
## Service: OnlineMenu

## Problem Statement

Code reviewer found 3 issues in the DietaryTags feature of the OnlineMenu service:

1. **HIGH - Security: Cross-Tenant Deletion** - `DeleteDietaryTagHandler` does not verify tenant ownership before deleting a custom tag. A malicious tenant can delete another tenant's custom dietary tag.
2. **MEDIUM - POST Returns 200** - The Create endpoint returns 200 OK instead of 201 Created for successful creation.
3. **MEDIUM - Architecture Layer Violation** - `DietaryTagDto` in UseCases imports `OnlineMenu.Web.Common` namespace.

## Changes Made

### Issue 1: Cross-Tenant Deletion Fix (FIXED)
- Injected `ICurrentTenantService` into `DeleteDietaryTagHandler` constructor
- Added tenant ownership check after the `IsSystem` guard: compares `tag.TenantId` against the authenticated tenant's ID
- Returns `Result.Forbidden()` if the tenant does not own the tag
- Updated all existing unit tests to provide `ICurrentTenantService` mock with matching tenant ID
- Added 2 new unit tests:
  - `Handle_CrossTenantDeletion_ReturnsForbidden` -- verifies a tenant cannot delete another tenant's tag
  - `Handle_NullTenantId_UsesEmptyGuidForComparison` -- verifies null tenant ID falls back to `Guid.Empty` and is denied

### Issue 2: POST Returns 201 (FIXED)
- Changed `Description()` from `.Produces<CreateDietaryTagResponse>(StatusCodes.Status200OK)` to `Status201Created`
- Changed `HandleAsync()` success path to set `Response` and `HttpContext.Response.StatusCode = StatusCodes.Status201Created` (matching the established FastEndpoints pattern used in `CustomDomains/Add.cs`)

### Issue 3: Architecture Layer Violation (DOCUMENTED - PRE-EXISTING)
- Investigated: `BaseResponseDto` lives in `OnlineMenu.Core/Common/BaseResponseDto.cs` but declares `namespace OnlineMenu.Web.Common`
- This is a **pre-existing codebase-wide pattern** used by 4+ files in the UseCases layer: `PublicMenuDto.cs`, `TenantMenusDto.cs`, `DietaryTagDto.cs`, `BaseMapper.cs`
- Fixing the namespace would require a cross-cutting refactor of all dependent files
- Decision: Document as pre-existing; do not change in this task. Recommend a separate refactoring task to rename the namespace to `OnlineMenu.Core.Common`.

## Affected Files
- `OnlineMenu.UseCases/DietaryTags/Delete/DeleteDietaryTagHandler.cs` - added ICurrentTenantService, tenant ownership check
- `OnlineMenu.Web/DietaryTags/Create.cs` - changed to return 201 Created
- `OnlineMenu.UnitTests/UseCases/DietaryTags/DeleteDietaryTagHandlerTests.cs` - updated constructor, added 2 tests

## Verification Results
- [x] `onlinemenu-lint` -- PASSED
- [x] `onlinemenu-yagni` -- PASSED
- [x] `onlinemenu-unit-tests` -- PASSED
- [x] `onlinemenu-api` -- PASSED (container rebuilt successfully)

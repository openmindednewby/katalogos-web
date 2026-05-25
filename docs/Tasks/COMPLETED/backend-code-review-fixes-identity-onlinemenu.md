# Backend Code Review Fixes: Identity + OnlineMenu

## Problem Statement

Multiple code review issues identified in IdentityService and OnlineMenuSaaS requiring fixes.

## Changes Made

### Identity Issue 1 (MEDIUM): Test smell in UpdatePreferencesEndpointTests.cs
- Removed try/catch swallowing NotSupportedException
- Changed endpoint to use `HttpContext.Response.StatusCode = StatusCodes.Status200OK` (matching UpdateBusinessProfile pattern) instead of `Send.OkAsync()` which throws in test context
- Added proper assertion: `ep.HttpContext.Response.StatusCode.ShouldBe(200)`
- Added tenantId assertion to mediator verification
- Migrated all assertions to Shouldly for consistency

### Identity Issue 2 (MEDIUM): Null tenant fallback with Guid.Empty
- Replaced `var tenantGuid = tenantId ?? Guid.Empty` with explicit null guard returning 401
- Uses `tenantId.Value` after guard (matching UpdateBusinessProfile pattern)
- Added new test `HandleAsync_WhenNoTenantId_Returns401` verifying mediator is never called
- Updated existing `HandleAsync_WhenUpdateFails_ThrowsError` to provide valid tenantId

### Identity Issue 5 (LOW): Public setters on UserPreference entity
- Changed all property setters to `private set`
- Added `Update()` method for explicit state mutation
- Updated `UpdateUserPreferencesHandler` to call `Update()` instead of setting properties directly
- Updated all test files (3 files) to use `Update()` method via `CreatePreference` helper

### Identity Issue 7 (LOW): Mutable request DTO in LogIngestionEndpoint
- Changed `LogBatchRequest.Entries` from `{ get; set; }` to `{ get; init; }`
- Changed all `LogEntry` properties from `{ get; set; }` to `{ get; init; }`

### OnlineMenu Issue 4 (MEDIUM): Domain throws instead of using Result pattern
- Added name validation in `UpdateTenantMenusHandler` before calling domain `Update()`: returns `Result.Invalid()` with validation error
- Updated endpoint to handle `ResultStatus.Invalid` by calling `ThrowError()` with 400 status
- Updated test from `Should.ThrowAsync<ArgumentNullException>` to asserting `ResultStatus.Invalid` with validation error message
- Domain guard throw preserved as programming invariant

### OnlineMenu Issue 8 (LOW): Lowercase property name `contents`
- Renamed `contents` to `Contents` in: `UpdateTenantMenusRequest`, `UpdateTenantMenusCommand`, `UpdateTenantMenusHandler`, `Update.Validator.cs`, and test files

## Files Modified

### IdentityService
- `src/IdentityService.Core/Entities/UserPreference.cs` - private setters + Update method
- `src/IdentityService.API/Me/UpdatePreferences.cs` - tenant null guard + StatusCode pattern
- `src/IdentityService.API/LogIngestion/LogIngestionEndpoint.cs` - init setters
- `src/IdentityService.UseCases/UserPreferences/UpdateUserPreferences/UpdateUserPreferencesHandler.cs` - uses Update()
- `tests/IdentityService.Tests/Me/UpdatePreferencesEndpointTests.cs` - fixed test smell + new test
- `tests/IdentityService.Tests/UserPreferences/UpdateUserPreferencesHandlerTests.cs` - uses CreatePreference helper
- `tests/IdentityService.Tests/UserPreferences/GetUserPreferencesHandlerTests.cs` - uses CreatePreference helper
- `tests/IdentityService.Tests/UserPreferenceEntityTests.cs` - uses Update()

### OnlineMenuSaaS
- `OnlineMenu/src/OnlineMenu.Web/TenantMenus/Update.cs` - Contents PascalCase + Invalid handling
- `OnlineMenu/src/OnlineMenu.Web/TenantMenus/Update.Validator.cs` - Contents PascalCase
- `OnlineMenu/src/OnlineMenu.UseCases/TenantMenus/Update/UpdateTenantMenusCommand.cs` - Contents PascalCase
- `OnlineMenu/src/OnlineMenu.UseCases/TenantMenus/Update/UpdateTenantMenusHandler.cs` - name validation + Contents PascalCase
- `OnlineMenu/tests/OnlineMenu.UnitTests/UseCases/UpdateTenantMenusHandlerTests.cs` - updated empty name test
- `OnlineMenu/tests/OnlineMenu.UnitTests/Domain/EndpointRequestResponseTests.cs` - Contents PascalCase

## Verification Results

| Check | Result |
|-------|--------|
| identity-lint | PASS |
| identity-yagni | PASS |
| identity-unit-tests | PASS |
| onlinemenu-lint | PASS |
| onlinemenu-yagni | PASS |
| onlinemenu-unit-tests | PASS |

## Status: COMPLETED

# Backend: Duplicate Menu Name Conflict Handling

## Problem Statement
The `POST /api/v1/TenantMenus` endpoint returned HTTP 500 when creating a menu with a duplicate name (same tenant + name). The database has a unique constraint `IX_TenantMenus_TenantId_Name` but no application-level duplicate check existed in the handler, causing the `DbUpdateException` to bubble up as an unhandled 500 error.

## Architectural Approach
Followed the established pattern used by `CreateLocationHandler` and `CreateDietaryTagHandler`:
1. Created a dedicated `ITenantMenuRepository` interface extending `IBaseRepository<TenantMenus>` with `ExistsWithNameAsync`
2. Implemented `TenantMenuRepository` extending `EfRepository<TenantMenus>` with the AnyAsync query
3. Added duplicate check in the handler BEFORE calling `AddAsync`
4. Handler returns `Result.Conflict(...)` when duplicate detected
5. Endpoint handles `ResultStatus.Conflict` and returns HTTP 409

## Changes Made

### New Files
- `OnlineMenu.Core/Interfaces/ITenantMenuRepository.cs` -- Repository interface with `ExistsWithNameAsync` method
- `OnlineMenu.Infrastructure/Data/TenantMenuRepository.cs` -- Repository implementation using EF Core `AnyAsync`

### Modified Files
- `OnlineMenu.UseCases/TenantMenus/Create/CreateTenantMenusHandler.cs` -- Changed to use `ITenantMenuRepository`, added duplicate name check before create
- `OnlineMenu.Web/TenantMenus/Create.cs` -- Handles `ResultStatus.Conflict` with 409 response, removed try/catch wrapping, added OpenAPI Description for 409
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` -- Registered `ITenantMenuRepository` as `TenantMenuRepository` in DI
- `OnlineMenu.UnitTests/UseCases/CreateTenantMenusHandlerTests.cs` -- Updated mock to `ITenantMenuRepository`, added tests for duplicate name conflict

### Unit Tests Added
- `Handle_DuplicateName_ReturnsConflict` -- Verifies handler returns Conflict when name exists
- `Handle_DuplicateNameDifferentTenant_ReturnsSuccess` -- Verifies per-tenant scoping of duplicate check

## Verification Results
- [x] `onlinemenu-lint` -- PASSED
- [x] `onlinemenu-yagni` -- PASSED
- [x] `onlinemenu-unit-tests` -- PASSED (all tests pass including 2 new conflict tests)
- [x] `onlinemenu-api` -- PASSED (container rebuilds and starts successfully)

## Status: COMPLETED

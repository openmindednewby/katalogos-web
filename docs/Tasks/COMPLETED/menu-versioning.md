# Menu Versioning (Phase 3.1, P2)

## Status: COMPLETED

## Problem Statement

Users need the ability to view version history of their menus and rollback to previous states. Currently, when a menu is updated, the previous state is lost. This feature adds automatic version snapshots on every menu update, with endpoints to list, view, restore, and compare versions.

## Architectural Approach

### Domain Layer (OnlineMenu.Core)
- New `MenuVersionAggregate/MenuVersion` entity extending `BaseTenantEntity`
- Fields: MenuId (Guid), VersionNumber (int), Snapshot (JSON string), CreatedByUserId (Guid), ChangeDescription (string?), IsCurrent (bool), MenuName, MenuDescription
- New `IMenuVersionRepository` interface in `Core/Interfaces/`

### Application Layer (OnlineMenu.UseCases)
- `MenuVersions/` feature folder with CQRS handlers:
  - `GetMenuVersions` - Paginated list of versions for a menu
  - `GetMenuVersion` - Single version with full snapshot
  - `RestoreMenuVersion` - Rollback to a previous version
  - `CompareMenuVersions` - Diff between two versions with JSON-level diff
  - `CreateMenuVersion` - Auto-snapshot on menu update (dispatched by UpdateTenantMenusHandler)
- Version cleanup integrated into CreateMenuVersionHandler (prune beyond limit)

### Infrastructure Layer (OnlineMenu.Infrastructure)
- `MenuVersionRepository` implementing `IMenuVersionRepository`
- `MenuVersionConfiguration` EF Core entity config with jsonb Snapshot column
- EF Migration `20260321120000_AddMenuVersions` for MenuVersions table
- Indexes: (MenuId, VersionNumber) unique, (MenuId, IsCurrent), ExternalId, TenantId, UserId

### API Layer (OnlineMenu.Web)
- FastEndpoints in `MenuVersions/` domain folder:
  - GET `/TenantMenus/{menuId}/versions` - List versions (paginated)
  - GET `/TenantMenus/{menuId}/versions/{versionId}` - Get single version
  - POST `/TenantMenus/{menuId}/versions/{versionId}/restore` - Restore version
  - GET `/TenantMenus/{menuId}/versions/{v1}/compare/{v2}` - Compare two versions
- FluentValidation for all 4 request types

### Integration Point
- UpdateTenantMenusHandler now dispatches CreateMenuVersionCommand after every update
- Version cleanup runs after snapshot creation when versions exceed configurable limit (default 50)

## Affected Services
- OnlineMenuService (all layers)

## Changes Made

### New Files (27 files)
**Domain Layer:**
- `OnlineMenu.Core/MenuVersionAggregate/MenuVersion.cs` - Entity
- `OnlineMenu.Core/Interfaces/IMenuVersionRepository.cs` - Repository interface

**Application Layer:**
- `OnlineMenu.UseCases/MenuVersions/Constants/MenuVersionLimits.cs` - Config constants
- `OnlineMenu.UseCases/MenuVersions/DTOs/MenuVersionDto.cs` - List + Detail DTOs
- `OnlineMenu.UseCases/MenuVersions/DTOs/MenuVersionComparisonDto.cs` - Comparison DTO
- `OnlineMenu.UseCases/MenuVersions/DTOs/PaginatedMenuVersionsDto.cs` - Pagination DTO
- `OnlineMenu.UseCases/MenuVersions/Commands/CreateMenuVersion/CreateMenuVersionCommand.cs`
- `OnlineMenu.UseCases/MenuVersions/Commands/CreateMenuVersion/CreateMenuVersionHandler.cs`
- `OnlineMenu.UseCases/MenuVersions/Commands/RestoreMenuVersion/RestoreMenuVersionCommand.cs`
- `OnlineMenu.UseCases/MenuVersions/Commands/RestoreMenuVersion/RestoreMenuVersionHandler.cs`
- `OnlineMenu.UseCases/MenuVersions/Queries/GetMenuVersions/GetMenuVersionsQuery.cs`
- `OnlineMenu.UseCases/MenuVersions/Queries/GetMenuVersions/GetMenuVersionsHandler.cs`
- `OnlineMenu.UseCases/MenuVersions/Queries/GetMenuVersion/GetMenuVersionQuery.cs`
- `OnlineMenu.UseCases/MenuVersions/Queries/GetMenuVersion/GetMenuVersionHandler.cs`
- `OnlineMenu.UseCases/MenuVersions/Queries/CompareMenuVersions/CompareMenuVersionsQuery.cs`
- `OnlineMenu.UseCases/MenuVersions/Queries/CompareMenuVersions/CompareMenuVersionsHandler.cs`

**Infrastructure Layer:**
- `OnlineMenu.Infrastructure/Data/MenuVersionRepository.cs`
- `OnlineMenu.Infrastructure/Data/Config/MenuVersionConfiguration.cs`
- `OnlineMenu.Infrastructure/Migrations/20260321120000_AddMenuVersions.cs`

**Web Layer:**
- `OnlineMenu.Web/MenuVersions/List.cs` + `List.Validator.cs`
- `OnlineMenu.Web/MenuVersions/GetById.cs` + `GetById.Validator.cs`
- `OnlineMenu.Web/MenuVersions/Restore.cs` + `Restore.Validator.cs`
- `OnlineMenu.Web/MenuVersions/Compare.cs` + `Compare.Validator.cs`

**Unit Tests (6 test files):**
- `OnlineMenu.UnitTests/Domain/MenuVersionEntityTests.cs` - 6 tests
- `OnlineMenu.UnitTests/UseCases/MenuVersions/CreateMenuVersionHandlerTests.cs` - 5 tests
- `OnlineMenu.UnitTests/UseCases/MenuVersions/GetMenuVersionsHandlerTests.cs` - 4 tests
- `OnlineMenu.UnitTests/UseCases/MenuVersions/GetMenuVersionHandlerTests.cs` - 4 tests
- `OnlineMenu.UnitTests/UseCases/MenuVersions/RestoreMenuVersionHandlerTests.cs` - 5 tests
- `OnlineMenu.UnitTests/UseCases/MenuVersions/CompareMenuVersionsHandlerTests.cs` - 6 tests
- `OnlineMenu.UnitTests/UseCases/MenuVersions/ComputeDifferencesTests.cs` - 10 tests

### Modified Files (5 files)
- `OnlineMenu.UseCases/TenantMenus/Update/UpdateTenantMenusHandler.cs` - Added IMediator dependency, dispatches CreateMenuVersionCommand after update
- `OnlineMenu.Infrastructure/Data/AppDbContext.cs` - Added MenuVersions DbSet
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` - Registered IMenuVersionRepository

### Pre-existing Issues Fixed
- `OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs` - Fixed S6580 (TimeOnly.TryParse format provider)
- `OnlineMenu.Web/TenantMenus/SetSchedule.Validator.cs` - Fixed S6580 (TimeOnly.TryParse format provider)
- `OnlineMenu.UnitTests/Domain/ScheduleFilterHelperTests.cs` - Fixed S6562 (DateTime without DateTimeKind)

## Success Criteria
- [x] MenuVersion entity created with proper BaseTenantEntity inheritance
- [x] Auto-snapshot on every menu update
- [x] Paginated version list endpoint
- [x] Single version retrieval endpoint
- [x] Restore endpoint that creates a new version and updates the menu
- [x] Compare endpoint returning structured diff (JSON-level)
- [x] Version cleanup when exceeding limit (default 50)
- [x] FluentValidation for all request types
- [x] Unit tests for all handlers (40 tests total)
- [x] All Tilt checks pass (lint, YAGNI, unit tests, API rebuild)

## Tilt Verification Results
- onlinemenu-lint: PASSED
- onlinemenu-yagni: PASSED
- onlinemenu-unit-tests: PASSED
- onlinemenu-api: PASSED

## Date Started
2026-03-21

## Date Completed
2026-03-21

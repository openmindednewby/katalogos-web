# Backend Multi-Location Support

## Status: COMPLETED

## Problem Statement
Implement multi-location backend support for OnlineMenuService, allowing restaurants with multiple locations to manage location-specific menus, pricing overrides, and availability.

## Architectural Approach
- New `Location` aggregate root entity (BaseTenantEntity, IAggregateRoot)
- `MenuLocation` join entity linking locations to menus
- `MenuItemOverride` entity for per-location price/availability/description overrides
- Full CQRS stack: Commands (Create, Update, Delete) and Queries (List, GetById)
- FastEndpoints for all 5 REST endpoints
- ILocationRepository interface in Core, implementation in Infrastructure
- EF Core configurations and migration
- Simple IMultiLocationFeatureService stub (always returns true)

## Affected Services
- OnlineMenuService (Core, UseCases, Infrastructure, Web layers)

## Files Created

### Core Layer
- `OnlineMenu.Core/LocationAggregate/Location.cs` - Location entity (BaseTenantEntity, IAggregateRoot)
- `OnlineMenu.Core/LocationAggregate/MenuLocation.cs` - Join entity (Location <-> TenantMenus)
- `OnlineMenu.Core/LocationAggregate/MenuItemOverride.cs` - Per-location item overrides
- `OnlineMenu.Core/Interfaces/ILocationRepository.cs` - Repository interface
- `OnlineMenu.Core/Interfaces/IMultiLocationFeatureService.cs` - Feature gate interface

### UseCases Layer
- `OnlineMenu.UseCases/Locations/DTOs/LocationDto.cs` - DTO
- `OnlineMenu.UseCases/Locations/Commands/CreateLocation/CreateLocationCommand.cs`
- `OnlineMenu.UseCases/Locations/Commands/CreateLocation/CreateLocationHandler.cs`
- `OnlineMenu.UseCases/Locations/Commands/UpdateLocation/UpdateLocationCommand.cs`
- `OnlineMenu.UseCases/Locations/Commands/UpdateLocation/UpdateLocationHandler.cs`
- `OnlineMenu.UseCases/Locations/Commands/DeleteLocation/DeleteLocationCommand.cs`
- `OnlineMenu.UseCases/Locations/Commands/DeleteLocation/DeleteLocationHandler.cs`
- `OnlineMenu.UseCases/Locations/Queries/ListLocations/ListLocationsQuery.cs`
- `OnlineMenu.UseCases/Locations/Queries/ListLocations/ListLocationsHandler.cs`
- `OnlineMenu.UseCases/Locations/Queries/GetLocationById/GetLocationByIdQuery.cs`
- `OnlineMenu.UseCases/Locations/Queries/GetLocationById/GetLocationByIdHandler.cs`
- `OnlineMenu.UseCases/Mappers/LocationMapper.cs` - Entity-to-DTO mapper

### Infrastructure Layer
- `OnlineMenu.Infrastructure/Data/Config/LocationConfiguration.cs` - EF Core config
- `OnlineMenu.Infrastructure/Data/Config/MenuLocationConfiguration.cs` - EF Core config
- `OnlineMenu.Infrastructure/Data/Config/MenuItemOverrideConfiguration.cs` - EF Core config
- `OnlineMenu.Infrastructure/Data/LocationRepository.cs` - Repository implementation
- `OnlineMenu.Infrastructure/Services/DefaultMultiLocationFeatureService.cs` - Stub (always true)

### Web Layer
- `OnlineMenu.Web/Locations/Create.cs` - POST /api/v1/locations
- `OnlineMenu.Web/Locations/CreateLocationValidator.cs` - FluentValidation
- `OnlineMenu.Web/Locations/Update.cs` - PUT /api/v1/locations/{id}
- `OnlineMenu.Web/Locations/UpdateLocationValidator.cs` - FluentValidation
- `OnlineMenu.Web/Locations/Delete.cs` - DELETE /api/v1/locations/{id}
- `OnlineMenu.Web/Locations/List.cs` - GET /api/v1/locations
- `OnlineMenu.Web/Locations/GetById.cs` - GET /api/v1/locations/{id}

### Tests
- `OnlineMenu.UnitTests/Domain/LocationEntityTests.cs` - 14 tests
- `OnlineMenu.UnitTests/Domain/MenuItemOverrideTests.cs` - 4 tests
- `OnlineMenu.UnitTests/UseCases/Locations/CreateLocationHandlerTests.cs` - 6 tests
- `OnlineMenu.UnitTests/UseCases/Locations/UpdateLocationHandlerTests.cs` - 4 tests
- `OnlineMenu.UnitTests/UseCases/Locations/ListLocationsHandlerTests.cs` - 3 tests
- `OnlineMenu.UnitTests/UseCases/Locations/DeleteLocationHandlerTests.cs` - 2 tests
- `OnlineMenu.UnitTests/UseCases/Locations/GetLocationByIdHandlerTests.cs` - 2 tests
- `OnlineMenu.UnitTests/Mappers/LocationMapperTests.cs` - 2 tests

### Modified Files
- `OnlineMenu.Infrastructure/Data/AppDbContext.cs` - Added DbSets for Location, MenuLocation, MenuItemOverride
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` - Registered ILocationRepository and IMultiLocationFeatureService
- `OnlineMenu.Web/MapperServiceRegistration.cs` - Registered LocationMapper

### Pre-existing Issues Fixed
- Added UTF-8 BOM + CRLF line endings to all PublicApi files (src + tests)
- Removed unused `PublicApiPrefix` constant from ApiKeyAuthMiddleware.cs (IDE0051)
- Suppressed IDE0060 for unused `ct` parameter in CommandLogger.cs (interface requirement)
- Suppressed S1075 for fallback URI in ApiKeyAuthMiddleware.cs (config-driven with dev fallback)
- Fixed CS8604 nullable warning in PublicGetMenuByIdHandlerTests.cs
- Updated MapperServiceRegistrationTests count from 4 to 5

## Verification Results
- onlinemenu-lint: PASS
- onlinemenu-yagni: PASS
- onlinemenu-unit-tests: PASS (747 tests, all passing)

## Implementation Date
2026-03-20

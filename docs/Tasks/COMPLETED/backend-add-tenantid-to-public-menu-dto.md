# Add TenantId to Public Menu Response DTO

## Status: COMPLETED

## Problem Statement
The `PublicMenuDto` does not include `tenantId`, which the frontend needs to call `GET /tenants/{tenantId}/business-profile` and display business info on the public menu page.

## Approach
- Add `TenantId` (Guid) property to `PublicMenuDto`
- Update `PublicMenuMapper` to map `entity.TenantId` from `BaseTenantEntity`
- Update unit tests (mapper tests, DTO tests, handler tests)

## Affected Files
- `OnlineMenu.UseCases/DTOs/PublicMenuDto.cs` - Add property
- `OnlineMenu.UseCases/Mappers/PublicMenuMapper.cs` - Map TenantId
- `OnlineMenu.UnitTests/Mappers/PublicMenuMapperTests.cs` - Assert TenantId
- `OnlineMenu.UnitTests/Domain/DtoTests.cs` - Assert TenantId in DTO tests
- `OnlineMenu.UnitTests/UseCases/GetPublicMenuHandlerTests.cs` - Update DTO construction

## Success Criteria
- `PublicMenuDto` includes `TenantId` property
- Mapper populates it from entity
- All existing + new tests pass
- `onlinemenu-lint`, `onlinemenu-unit-tests`, `onlinemenu-api` all pass

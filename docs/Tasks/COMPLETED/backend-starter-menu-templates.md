# Backend: Starter Menu Templates

## Problem Statement
New users who create their first menu currently start with a blank menu. We need to provide pre-built "starter" menu templates (Cafe, Fine Dining, Pizzeria, Bar, Food Truck) that users can select during menu creation.

## Architectural Approach
- **MenuTemplate entity** extends `BaseEntity` (NOT BaseTenantEntity) since templates are platform-owned
- New `MenuTemplates` feature area in Core, UseCases, Infrastructure, and Web layers
- Extend existing `CreateTenantMenusCommand/Handler` to accept optional `TemplateSlug`
- Seed data via EF Core `HasData()` in configuration

## Affected Services
- OnlineMenu.Core (new entity)
- OnlineMenu.Infrastructure (EF config + seed data, DbContext registration)
- OnlineMenu.UseCases (DTO, query, handler; modify CreateTenantMenus)
- OnlineMenu.Web (new List endpoint, modify Create endpoint)
- OnlineMenu.UnitTests (new tests)

## Files Created
- `OnlineMenu.Core/MenuTemplateAggregate/MenuTemplate.cs` - Entity
- `OnlineMenu.Infrastructure/Data/Config/MenuTemplateConfiguration.cs` - EF config + seed data
- `OnlineMenu.UseCases/MenuTemplates/DTOs/MenuTemplateDto.cs` - DTO
- `OnlineMenu.UseCases/MenuTemplates/Queries/ListMenuTemplates/ListMenuTemplatesQuery.cs` - Query
- `OnlineMenu.UseCases/MenuTemplates/Queries/ListMenuTemplates/ListMenuTemplatesHandler.cs` - Handler
- `OnlineMenu.Web/MenuTemplates/List.cs` - FastEndpoint GET /MenuTemplates
- `OnlineMenu.UnitTests/UseCases/MenuTemplates/ListMenuTemplatesHandlerTests.cs` - List handler tests
- `OnlineMenu.UnitTests/Domain/MenuTemplateEntityTests.cs` - Entity tests

## Files Modified
- `OnlineMenu.Infrastructure/Data/AppDbContext.cs` - Added DbSet<MenuTemplate> (no tenant filter)
- `OnlineMenu.UseCases/TenantMenus/Create/CreateTenantMenusCommand.cs` - Added optional TemplateSlug
- `OnlineMenu.UseCases/TenantMenus/Create/CreateTenantMenusHandler.cs` - Template lookup + contents population
- `OnlineMenu.Web/TenantMenus/Create.cs` - Pass TemplateSlug, updated request record
- `OnlineMenu.UnitTests/UseCases/CreateTenantMenusHandlerTests.cs` - Updated for new constructor + template tests

## Verification Results
- [x] Lint: PASSED
- [x] YAGNI: PASSED
- [x] Unit Tests: PASSED
- [x] API Build: PASSED (Docker container builds and runs)

## Pre-existing Issues Fixed
The original lint/build failures were not in the AI description files as initially suspected. The actual issues were:
- **IDE0011** in `OnlineMenu.Web/DietaryTags/Create.cs` (lines 44-47): `else if` and `else` statements missing braces. Fixed by adding braces to both branches.
- **CHARSET** in `OnlineMenu.UnitTests/UseCases/DietaryTags/DeleteDietaryTagHandlerTests.cs`: Transient encoding detection issue; file already had UTF-8 BOM. Resolved on re-run after the braces fix.

## Status
- Started: 2026-03-18
- Completed: 2026-03-18
- Implementation: Complete, all checks pass

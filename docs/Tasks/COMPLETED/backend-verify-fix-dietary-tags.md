# Backend: Verify & Fix Allergen/Dietary Tags

## Status: COMPLETED
## Date: 2026-03-18
## Agent: backend-dev

## Problem Statement
The chief-architect agent implemented the allergen/dietary tags backend in OnlineMenuService. This task verified the implementation, fixed all lint issues, generated the EF Core migration, and rebuilt the API container.

## Issues Found & Fixed

### 1. UTF-8 BOM Encoding (24 files)
All new DietaryTag C# files were missing the UTF-8 BOM encoding required by `.editorconfig`. Fixed by writing all files with `UTF8Encoding(true)`.

**Files fixed:**
- `OnlineMenu.Core/DietaryTagAggregate/DietaryTag.cs`
- `OnlineMenu.Core/Interfaces/IDietaryTagRepository.cs`
- `OnlineMenu.Infrastructure/Data/Config/DietaryTagConfiguration.cs`
- `OnlineMenu.Infrastructure/Data/DietaryTagRepository.cs`
- `OnlineMenu.Infrastructure/Data/DietaryTagSeedData.cs`
- `OnlineMenu.UseCases/DietaryTags/Create/CreateDietaryTagCommand.cs`
- `OnlineMenu.UseCases/DietaryTags/Create/CreateDietaryTagHandler.cs`
- `OnlineMenu.UseCases/DietaryTags/Delete/DeleteDietaryTagCommand.cs`
- `OnlineMenu.UseCases/DietaryTags/Delete/DeleteDietaryTagHandler.cs`
- `OnlineMenu.UseCases/DietaryTags/DTOs/DietaryTagDto.cs`
- `OnlineMenu.UseCases/DietaryTags/List/ListDietaryTagsHandler.cs`
- `OnlineMenu.UseCases/DietaryTags/List/ListDietaryTagsQuery.cs`
- `OnlineMenu.UseCases/Mappers/DietaryTagMapper.cs`
- `OnlineMenu.Web/DietaryTags/Create.cs`
- `OnlineMenu.Web/DietaryTags/Create.Validator.cs`
- `OnlineMenu.Web/DietaryTags/Delete.cs`
- `OnlineMenu.Web/DietaryTags/List.cs`
- `OnlineMenu.Web/PublicMenus/ListDietaryTags.cs`
- All 6 unit test files

### 2. EF Core Migration Generated
Generated migration `20260318182236_AddDietaryTags` which creates:
- `DietaryTags` table with columns: Id, Key, Name, Description, Icon, Color, IsSystem, DisplayOrder, ExternalId, CreatedDate, LastUpdatedDate, UserId, TenantId
- `MenuTemplates` table (also new, from chief-architect's work) with seed data
- Unique index on `Key + TenantId` (IX_DietaryTags_Key_TenantId)
- Index on `IsSystem` (IX_DietaryTags_IsSystem)
- Index on `TenantId` (IX_DietaryTag_TenantId)
- Index on `UserId` (IX_DietaryTag_UserId)
- Unique index on `ExternalId` (IX_DietaryTags_ExternalId)

### 3. Pre-existing Issues Fixed
- `MenuTemplate.cs`: Fixed missing BOM and mixed line endings (LF -> CRLF)
- `GenerateMenuItemDescriptionHandler.cs`: Fixed mixed line endings
- `AnthropicDescriptionService.cs`: Suppressed S1075 (hardcoded URI) with pragma -- API endpoint URL is a legitimate constant

### 4. First Migration Attempt Failed (S101)
Initial migration with name `20260318120000_AddDietaryTags` produced class name `_20260318120000_AddDietaryTags` (underscore prefix from numeric start), which violated SonarAnalyzer S101 (pascal case naming). Removed and regenerated with clean name `AddDietaryTags`.

## Verification Results

| Check | Result |
|-------|--------|
| `onlinemenu-lint` | PASSED |
| `onlinemenu-yagni` | PASSED |
| `onlinemenu-unit-tests` | PASSED |
| `onlinemenu-api` | PASSED (runtime=ok, update=ok) |

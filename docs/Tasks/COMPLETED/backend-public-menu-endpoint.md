# Public Menu Endpoint for Unauthenticated Access

## Status: COMPLETED

## Problem Statement

The current `GET /TenantMenus/{id}` endpoint requires authentication. We need a public endpoint like `GET /public/menus/{externalId}` that:
1. Does NOT require authentication (no [Authorize] attribute)
2. Returns only the menu data needed for display (name, description, categories, items, content IDs)
3. Only returns menus that are marked as "active" (IsActive = true)
4. Does NOT expose sensitive tenant information

This is needed for the online menu display feature where customers can view menus without logging in.

## Root Cause Analysis

The existing `GetById.cs` endpoint uses `AllowAnonymous()` but it still exposes all menu data including inactive menus. We need:
1. A dedicated public endpoint at a separate route
2. A new query handler that filters for active menus only
3. A public DTO that excludes sensitive tenant information

## Implementation Plan

### Step 1: Create Public Menu DTO
- Location: `OnlineMenu.UseCases/DTOs/PublicMenuDto.cs`
- Purpose: DTO that only exposes public-safe menu data
- Excludes: TenantId, UserId, internal IDs, IsActive flag

### Step 2: Create Public Menu Mapper
- Location: `OnlineMenu.UseCases/Mappers/PublicMenuMapper.cs`
- Purpose: Map TenantMenus entity to PublicMenuDto

### Step 3: Create GetPublicMenu Query and Handler
- Query: `OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuQuery.cs`
- Handler: `OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuHandler.cs`
- Purpose: Bypass tenant filtering and only return active menus

### Step 4: Create Public Menu Endpoint
- Location: `OnlineMenu.Web/PublicMenus/GetById.cs`
- Route: `GET /public/menus/{externalId}`
- Purpose: Unauthenticated endpoint for viewing active menus

### Step 5: Register Mapper
- Update: `OnlineMenu.Web/MapperServiceRegistration.cs`

### Step 6: Write Unit Tests
- Location: `OnlineMenu.UnitTests/UseCases/GetPublicMenuHandlerTests.cs`

## Files Created

1. `OnlineMenu.UseCases/DTOs/PublicMenuDto.cs` - Public-safe DTO
2. `OnlineMenu.UseCases/Mappers/PublicMenuMapper.cs` - Maps entity to public DTO
3. `OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuQuery.cs` - Query record
4. `OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuHandler.cs` - Handler with active check
5. `OnlineMenu.Web/PublicMenus/GetById.cs` - FastEndpoints endpoint
6. `OnlineMenu.UnitTests/UseCases/GetPublicMenuHandlerTests.cs` - Unit tests

## Files Modified

1. `OnlineMenu.Web/MapperServiceRegistration.cs` - Added PublicMenuMapper registration

## Success Criteria

- [x] Public endpoint accessible without authentication
- [x] Only active menus (IsActive = true) are returned
- [x] No sensitive tenant information is exposed (TenantId, UserId, IsActive excluded from DTO)
- [x] Inactive menus return 404
- [x] Unit tests pass with coverage for:
  - [x] Happy path: Active menu found and returned
  - [x] Not found: Menu doesn't exist
  - [x] Not found: Menu exists but is inactive
  - [x] Not found: Menu was deactivated after being active
  - [x] Happy path with complex contents and categories
- [x] Build succeeds
- [x] All existing tests still pass (50 tests total)

## Changes Made

### PublicMenuDto.cs
```csharp
public class PublicMenuDto : BaseResponseDto
{
  public string Name { get; init; } = default!;
  public string? Description { get; init; }
  public MenuContents Contents { get; init; } = new MenuContents();
}
```

### GetPublicMenuHandler.cs
Key logic:
- Retrieves menu by ExternalId
- Returns NotFound if menu doesn't exist
- Returns NotFound if menu exists but IsActive = false (security: don't reveal existence)
- Maps to PublicMenuDto and returns success

### Public Endpoint
- Route: `GET /public/menus/{ExternalId:guid}`
- Uses `AllowAnonymous()` for unauthenticated access
- Tagged as "Public Menus" in Swagger

## Test Results

```
Test Run Successful.
Total tests: 50
     Passed: 50
 Total time: 6.3638 Seconds
```

All 5 new tests pass:
- Handle_ActiveMenuExists_ReturnsSuccessWithDto
- Handle_MenuNotFound_ReturnsNotFoundResult
- Handle_InactiveMenuExists_ReturnsNotFoundResult
- Handle_ActiveMenuWithCategories_ReturnsFullContents
- Handle_DeactivatedMenu_ReturnsNotFoundResult

## API Contract

### Request
```
GET /public/menus/{externalId}
```

### Response (200 OK)
```json
{
  "externalId": "guid",
  "createdDate": "datetime",
  "lastUpdatedDate": "datetime",
  "name": "Menu Name",
  "description": "Menu Description",
  "contents": {
    "titleFont": "string",
    "titleFontSize": 24,
    "backgroundColor": "#FFFFFF",
    "textColor": "#000000",
    "categories": [
      {
        "name": "Category Name",
        "description": "Category Description",
        "items": [
          {
            "name": "Item Name",
            "description": "Item Description",
            "price": 9.99,
            "isAvailable": true,
            "imageContentId": "guid or null",
            "videoContentId": "guid or null"
          }
        ],
        "imageContentId": "guid or null",
        "videoContentId": "guid or null"
      }
    ]
  }
}
```

### Response (404 Not Found)
Returned when:
- Menu does not exist
- Menu exists but IsActive = false

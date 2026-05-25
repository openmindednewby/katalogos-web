# Menu Service Content References Implementation

> **Reference**: Content Service Integration for Menu Items/Categories

## Status: COMPLETED

## Problem Statement
The Content Service is working and the frontend can upload content (images, videos). However, when saving a menu, the content references (imageContentId, videoContentId) are not persisted. After reloading the menu editor, the uploaded images/videos are gone because the MenuItem and Category classes do not have fields to store these content references.

## Root Cause Analysis
The `MenuItem` and `Category` classes in `TenantMenusAggregate.cs` are value objects stored as JSON via `MenuContents`. They lacked the following fields:
- `imageContentId` (Guid?, nullable) - Reference to content for images
- `videoContentId` (Guid?, nullable) - Reference to content for videos

Since these are stored as JSON, adding new nullable properties:
1. Automatically serializes when saving
2. Automatically deserializes when loading
3. Does NOT require a database migration (JSON column already exists)

## Implementation Plan

### Step 1: Update Domain Entities - COMPLETED
- Added `ImageContentId` (Guid?) to `Category` class
- Added `VideoContentId` (Guid?) to `Category` class
- Added `ImageContentId` (Guid?) to `MenuItem` class
- Added `VideoContentId` (Guid?) to `MenuItem` class
- Added parameterless constructor to `MenuItem` for JSON deserialization

### Step 2: Update DTOs (if needed) - NOT REQUIRED
- The `TenantMenusDto` already includes `MenuContents` directly
- No separate DTOs needed since the entities are serialized to JSON

### Step 3: Verify API Contract - VERIFIED
- The `UpdateTenantMenusCommand` already accepts `MenuContents`
- The mapper already maps `Contents` directly
- Changes propagate automatically through JSON serialization

### Step 4: Write Unit Tests - COMPLETED
- Added 3 tests to `UpdateTenantMenusHandlerTests.cs` for content ID persistence
- Added 3 tests to `TenantMenusMapperTests.cs` for content ID mapping
- Created new `TenantMenusJsonSerializationTests.cs` with 7 tests for JSON round-trip

## Files Modified

1. **`OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs`**
   - Added `ImageContentId` and `VideoContentId` to `Category` class (lines 98-104)
   - Added `ImageContentId` and `VideoContentId` to `MenuItem` class (lines 130-138)
   - Added parameterless constructor to `MenuItem` for JSON deserialization

2. **`OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/UseCases/UpdateTenantMenusHandlerTests.cs`**
   - Added `Handle_WithContentIds_PersistsContentReferences` test
   - Added `Handle_WithNullContentIds_PersistsNullValues` test
   - Added `Handle_WithMixedContentIds_PersistsCorrectly` test

3. **`OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/Mappers/TenantMenusMapperTests.cs`**
   - Added `ToDto_EntityWithContentIds_MapsContentIdsCorrectly` test
   - Added `ToDto_EntityWithNullContentIds_MapsNullValuesCorrectly` test
   - Added `ToDto_EntityWithMixedContentIds_MapsMixedValuesCorrectly` test

4. **`OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/Domain/TenantMenusJsonSerializationTests.cs`** (NEW)
   - Created comprehensive JSON serialization/deserialization tests
   - 7 tests covering various scenarios

## Success Criteria
- [x] Category class has ImageContentId and VideoContentId nullable Guid properties
- [x] MenuItem class has ImageContentId and VideoContentId nullable Guid properties
- [x] Unit tests verify content IDs are persisted through update
- [x] Unit tests verify content IDs are returned when fetching menu
- [x] Build succeeds without errors
- [x] All existing tests continue to pass

## Test Results
```
Test Run Successful.
Total tests: 45
     Passed: 45
 Total time: 2.7783 Seconds
```

### New Tests Added (13 total):
1. `UpdateTenantMenusHandlerTests.Handle_WithContentIds_PersistsContentReferences`
2. `UpdateTenantMenusHandlerTests.Handle_WithNullContentIds_PersistsNullValues`
3. `UpdateTenantMenusHandlerTests.Handle_WithMixedContentIds_PersistsCorrectly`
4. `TenantMenusMapperTests.ToDto_EntityWithContentIds_MapsContentIdsCorrectly`
5. `TenantMenusMapperTests.ToDto_EntityWithNullContentIds_MapsNullValuesCorrectly`
6. `TenantMenusMapperTests.ToDto_EntityWithMixedContentIds_MapsMixedValuesCorrectly`
7. `TenantMenusJsonSerializationTests.MenuContents_WithContentIds_SerializesAndDeserializesCorrectly`
8. `TenantMenusJsonSerializationTests.MenuContents_WithNullContentIds_SerializesAndDeserializesCorrectly`
9. `TenantMenusJsonSerializationTests.TenantMenus_ContentsJson_PreservesContentIds`
10. `TenantMenusJsonSerializationTests.Category_WithContentIds_SerializesAllProperties`
11. `TenantMenusJsonSerializationTests.MenuItem_WithContentIds_SerializesAllProperties`
12. `TenantMenusJsonSerializationTests.MenuItem_ParameterlessConstructor_AllowsJsonDeserialization`
13. `TenantMenusJsonSerializationTests.MenuContents_MultipleCategories_PreservesAllContentIds`

## API Contract Summary

### Updated Models (via JSON serialization)

**Category**:
```csharp
public class Category
{
  public string Name { get; set; }
  public string? Description { get; set; }
  public string? BackgroundColor { get; set; }
  public string? TextColor { get; set; }
  public int FontSize { get; set; }
  public int DisplayOrder { get; set; }
  public List<MenuItem> Items { get; set; }
  public Guid? ImageContentId { get; set; }  // NEW
  public Guid? VideoContentId { get; set; }  // NEW
}
```

**MenuItem**:
```csharp
public class MenuItem
{
  public string Name { get; set; }
  public string? Description { get; set; }
  public decimal Price { get; set; }
  public bool IsAvailable { get; set; }
  public string? BackgroundColor { get; set; }
  public string? TextColor { get; set; }
  public int FontSize { get; set; }
  public int DisplayOrder { get; set; }
  public Guid? ImageContentId { get; set; }  // NEW
  public Guid? VideoContentId { get; set; }  // NEW
}
```

## Notes for Frontend Integration
- The content IDs are GUIDs that reference content stored in the Content Service
- The Menu Service does NOT validate if the content exists - just stores the reference
- Content IDs are nullable since not all items/categories will have content
- No changes needed to existing API endpoints - the fields are automatically included in JSON serialization

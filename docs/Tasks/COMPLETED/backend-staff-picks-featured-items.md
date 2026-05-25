# Staff Picks / Featured Items - Backend Implementation

## Status: COMPLETED

## Problem Statement
Add support for "Staff Picks / Featured Items" feature to the OnlineMenu service. This allows restaurant owners to mark specific menu items as featured (staff picks) and configure a featured section in their menu.

## Architectural Approach
This is a domain model extension. The new properties are added to existing classes (`MenuItem` and `MenuContents`) that are stored as JSON in the `ContentsJson` JSONB column. No migration needed since new nullable fields with defaults are backward-compatible with existing JSON data.

## Changes Made

### 1. Domain Layer - `TenantMenusAggregate.cs`
- Added to `MenuItem` class:
  - `bool IsFeatured` (default: false) - marks an item as a staff pick
  - `string? StaffNote` - optional note from staff (e.g., "Chef's personal favorite")
  - `int FeaturedOrder` (default: 0) - controls display order in featured section
- Added to `MenuContents` class:
  - `bool? FeaturedSectionEnabled` - toggles the featured section on/off
  - `string? FeaturedSectionTitle` - custom title for the featured section

### 2. Web Layer - `Update.Validator.cs`
- Added `StaffNote` max length validation (120 characters) in the item-level child rules
- Added `MaxStaffNoteLength = 120` constant to `MenuValidationLimits`

### 3. Pre-existing Issues Fixed
- Removed invalid `app.UseSentryUserContext()` call from `Program.cs` (no Sentry package installed)
- Fixed UTF-8 BOM and CRLF line endings for ~30 Translation/Analytics files
- Refactored `GetPublicMenuHandler.MergeTranslatedContents` to reduce cognitive complexity (S3776)
- Fixed unused parameter in `TranslateMenuHandlerTests.CreateTestMenu`
- Fixed `IMenuItemViewRepository.cs` missing using directive
- Fixed `MenuAnalyticsDetailDto.cs` missing using directive

### What Was NOT Changed
- No new endpoints created
- No database migration created
- No new DTOs created

## Verification Results
- [x] `onlinemenu-lint` -- PASS
- [x] `onlinemenu-unit-tests` -- PASS (643 tests)
- [x] `onlinemenu-yagni` -- PASS

## Files Modified
- `OnlineMenu/src/OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs` (new properties)
- `OnlineMenu/src/OnlineMenu.Web/TenantMenus/Update.Validator.cs` (validation + constant)
- `OnlineMenu/src/OnlineMenu.Web/Program.cs` (removed invalid Sentry call)
- `OnlineMenu/src/OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuHandler.cs` (refactored complexity)
- Multiple Translation/Analytics files (BOM + CRLF fixes)

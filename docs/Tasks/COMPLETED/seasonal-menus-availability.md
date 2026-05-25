# Seasonal/Time-Based Menus & Seasonal Availability

## Task Info
- **Status**: COMPLETED
- **Date**: 2026-03-21
- **Roadmap**: Phase 1.2 P2 (Seasonal/time-based menus) + Phase 3.1 P2 (Seasonal availability)
- **Domain**: Backend (OnlineMenuService)

## Problem Statement
Restaurants need to:
1. Schedule menus for specific time windows (e.g., "Lunch menu" 11am-3pm, "Weekend brunch" Sat-Sun 9am-2pm)
2. Auto-hide individual menu items by date range (e.g., "Pumpkin Spice Latte" available Sep 1 - Nov 30)

## Implementation Summary

### Domain Model Changes

**`TenantMenusAggregate.cs`**:
- Added `DaysOfWeek` flags enum (Mon-Sun + Weekdays/Weekends/EveryDay convenience values)
- Added `MenuSchedule` class (DaysOfWeek, StartTime, EndTime as "HH:mm" strings, IsEnabled toggle)
- Added `Schedule` nullable property to `TenantMenus` entity with `SetSchedule()` and `RemoveSchedule()` domain methods
- Added `ScheduleJson` JSON storage property (JSONB column in PostgreSQL)
- Added `AvailableFrom` and `AvailableTo` (string?, "MM-dd" format) to `MenuItem` for seasonal availability
- Added `ScheduleFilterHelper` static class with:
  - `IsMenuVisibleAtTime()` - checks schedule against current day/time
  - `IsItemAvailableOnDate()` - checks seasonal availability with wrap-around support (Nov-Feb)

### CQRS Commands/Handlers

- `SetMenuScheduleCommand` + `SetMenuScheduleHandler` - sets/updates menu schedule
- `RemoveMenuScheduleCommand` + `RemoveMenuScheduleHandler` - removes menu schedule

### FastEndpoints

- `PUT /TenantMenus/{ExternalId}/schedule` - set/update schedule (with FluentValidation)
- `DELETE /TenantMenus/{ExternalId}/schedule` - remove schedule
- Both require Admin role

### Public API Filtering

- `GetPublicMenuHandler` now checks:
  1. Time-based schedule: returns NotFound if menu is outside its schedule window
  2. Seasonal items: filters out items outside their AvailableFrom/AvailableTo range

### Validation

- `SetMenuScheduleValidator`: validates ExternalId, DaysOfWeek not None, valid HH:mm time format, StartTime < EndTime
- `UpdateTenantMenusValidator`: added AvailableFrom/AvailableTo MM-dd format validation for menu items

### EF Core

- Added migration `20260321120000_AddMenuSchedule` (adds nullable JSONB `ScheduleJson` column)
- Updated `TenantMenusConfiguration` to configure ScheduleJson column and ignore Schedule navigation property
- Updated `TenantMenusMapper` to include Schedule in DTO
- Updated `TenantMenusDto` to include Schedule property

### Unit Tests (67 new tests)

- `ScheduleFilterHelperTests.cs` - 41 tests covering:
  - Schedule visibility (null, disabled, correct/wrong day, time boundaries, weekends, multiple days, every day, invalid format)
  - Seasonal availability (normal range, wrap-around, exact boundaries, one-sided ranges, invalid formats, empty strings)
  - DaysOfWeek flags behavior
  - MenuSchedule constructors and defaults
  - TenantMenus domain methods (SetSchedule, RemoveSchedule, overwrite, null guard)
  - MenuItem seasonal field defaults
- `SetMenuScheduleHandlerTests.cs` - 5 tests (happy path, not found, weekend brunch, overwrite, repository calls)
- `RemoveMenuScheduleHandlerTests.cs` - 4 tests (with/without schedule, not found, repository calls)
- `SetMenuScheduleValidatorTests.cs` - 12 tests (valid/invalid schedules, empty fields, format errors, time ordering)
- `UpdateTenantMenusValidatorTests.cs` - 8 new tests for seasonal availability validation

### Pre-existing Issues Fixed

- Fixed CHARSET (UTF-8 BOM) and ENDOFLINE (CRLF) issues on MenuVersions files
- Added missing `using MediatR;` to MenuVersions command/query files
- Added missing `using MultiTenancy.Abstractions;` to MenuVersions test file
- Added `InternalsVisibleTo("OnlineMenu.UnitTests")` for `ComputeDifferences` internal method

## Verification Results (All via Tilt MCP)

- [x] `onlinemenu-lint` - PASSED
- [x] `onlinemenu-yagni` - PASSED
- [x] `onlinemenu-unit-tests` - PASSED
- [x] `onlinemenu-api` - PASSED (container rebuilt successfully)

## Files Changed

### New Files
- `OnlineMenu.UseCases/TenantMenus/SetSchedule/SetMenuScheduleCommand.cs`
- `OnlineMenu.UseCases/TenantMenus/SetSchedule/SetMenuScheduleHandler.cs`
- `OnlineMenu.UseCases/TenantMenus/RemoveSchedule/RemoveMenuScheduleCommand.cs`
- `OnlineMenu.UseCases/TenantMenus/RemoveSchedule/RemoveMenuScheduleHandler.cs`
- `OnlineMenu.Web/TenantMenus/SetSchedule.cs`
- `OnlineMenu.Web/TenantMenus/SetSchedule.Validator.cs`
- `OnlineMenu.Web/TenantMenus/RemoveSchedule.cs`
- `OnlineMenu.Infrastructure/Migrations/20260321120000_AddMenuSchedule.cs`
- `OnlineMenu.UnitTests/Domain/ScheduleFilterHelperTests.cs`
- `OnlineMenu.UnitTests/UseCases/SetMenuScheduleHandlerTests.cs`
- `OnlineMenu.UnitTests/UseCases/RemoveMenuScheduleHandlerTests.cs`
- `OnlineMenu.UnitTests/Validators/SetMenuScheduleValidatorTests.cs`

### Modified Files
- `OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs` - Schedule, DaysOfWeek, MenuItem.AvailableFrom/To, ScheduleFilterHelper
- `OnlineMenu.Infrastructure/Data/Config/TenantMenusConfiguration.cs` - ScheduleJson column
- `OnlineMenu.UseCases/DTOs/TenantMenusDto.cs` - Schedule property
- `OnlineMenu.UseCases/Mappers/TenantMenusMapper.cs` - Schedule mapping
- `OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuHandler.cs` - schedule + seasonal filtering
- `OnlineMenu.Web/TenantMenus/Update.Validator.cs` - seasonal availability validation
- `OnlineMenu.UnitTests/Validators/UpdateTenantMenusValidatorTests.cs` - seasonal validation tests
- Various MenuVersions files (pre-existing fixes)

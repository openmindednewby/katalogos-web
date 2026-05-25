# OnlineMenu Service Code Review Fixes

## Status: IN PROGRESS

## Problem Statement
Fix 7 code review issues in the OnlineMenu service spanning architecture violations, enum naming, validation bugs, repository pattern issues, visibility modifiers, timezone awareness, and missing validators.

## Issues
1. **HIGH** - BaseResponseDto namespace violates Clean Architecture (UseCases -> Web dependency)
2. **MEDIUM** - DaysOfWeek enum shadows System.DayOfWeek, rename to ScheduledDays
3. **MEDIUM** - IsInEnum() on [Flags] enum rejects valid flag combinations
4. **MEDIUM** - DeleteOldestVersionsAsync calls SaveChangesAsync internally (double commit)
5. **MEDIUM** - IsMenuVisibleAtTime uses UTC with no timezone awareness
6. **LOW** - ComputeDifferences should be internal static, not public static
7. **LOW** - Missing validator for RemoveMenuScheduleRequest

## Affected Files
- OnlineMenu.Core/Common/BaseResponseDto.cs
- OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs
- OnlineMenu.Infrastructure/Data/MenuVersionRepository.cs
- OnlineMenu.Web/TenantMenus/SetSchedule.cs
- OnlineMenu.Web/TenantMenus/SetSchedule.Validator.cs
- OnlineMenu.Web/TenantMenus/RemoveSchedule.cs (new validator)
- OnlineMenu.UseCases/MenuVersions/Queries/CompareMenuVersions/CompareMenuVersionsHandler.cs
- All DTOs referencing BaseResponseDto
- All tests referencing DaysOfWeek

## Success Criteria
- All lint checks pass
- All unit tests pass
- API container rebuilds successfully

# Task: Expand Backend Unit Tests + Add Stress Test Endpoints for NotificationService

## Status: COMPLETED

## Problem Statement
The NotificationService had existing unit tests for most handlers but needed comprehensive test coverage expansion. Missing test files for `GetNotificationByIdHandler` and `DeleteNotificationHandler`. Additionally, DEBUG-only stress test endpoints were needed for load testing.

## Architectural Approach
- Followed existing test patterns: NSubstitute for mocking, Shouldly for assertions, xUnit for framework
- Added comprehensive tests covering happy paths, edge cases, error conditions
- Added DEBUG-conditional stress test endpoints using FastEndpoints pattern
- Followed Clean Architecture - stress endpoints in Web/Testing/ folder

## Affected Services
- NotificationService (Notification.UnitTests, Notification.Web)

## Changes Made

### New Test Files Created
1. **`GetNotificationByIdHandlerTests.cs`** (7 tests)
   - Valid notification retrieval with DTO mapping
   - NotFound when notification does not exist
   - Forbidden when notification belongs to other user
   - Read state correctly reflected
   - All fields mapped correctly
   - Null optional fields handled
   - Repository called with correct ID

2. **`DeleteNotificationHandlerTests.cs`** (6 tests)
   - Delete unread notification and update count
   - Delete read notification without updating count
   - NotFound when notification does not exist
   - Forbidden when notification belongs to other user
   - Correct remaining unread count calculation
   - Repository called with correct notification ID

### Expanded Existing Test Files

3. **`SendNotificationHandlerTests.cs`** (+8 tests, now 17 total)
   - Test with each priority level (Low, Normal, High, Urgent) via Theory
   - Test with all display preferences (None, InApp, OsNotification, Both) via Theory
   - Test with metadata
   - Test with missing optional fields
   - Test delivery service called with correct notification
   - Test repository exception propagation
   - Test all optional fields set correctly
   - Test notification always saved before checking preferences
   - Test delivery marks correct channel

4. **`NotificationEntityTests.cs`** (+14 tests, now 28 total)
   - MarkAsRead sets IsRead and timestamp
   - MarkAsRead twice remains read
   - Each priority level creation (Theory)
   - NotificationPriority enum values correct
   - DisplayPreference enum values correct
   - All required fields set correctly
   - Guard clause for null/whitespace type
   - Guard clause for null/whitespace title
   - Optional fields can be set
   - MarkAsDelivered with different channels
   - ConfigureQuietHours when disabled
   - ConfigureQuietHours without optional params
   - Enable after disable clears timestamp
   - All display preferences can be set

5. **`MarkAsReadHandlerTests.cs`** (+3 tests, now 7 total)
   - Already read notification does not send unread count update
   - Correct unread count sent after marking as read
   - Repository called with correct external ID

6. **`UpdatePreferencesHandlerTests.cs`** (+5 tests, now 9 total)
   - Updating only global toggle preserves other settings
   - Updating only quiet hours sets correctly
   - All display preferences set to None
   - Creating new sets correct tenant and user
   - Existing preferences call Update not Add

### Stress Test Endpoints Created

7. **`Web/Testing/StressTestEndpoints.cs`** (DEBUG-only, 4 endpoints)
   - `POST /api/notifications/test/trigger` - Trigger a single test notification
   - `POST /api/notifications/test/bulk` - Trigger N notifications (max 1000) for stress testing
   - `DELETE /api/notifications/test/clear` - Clear all notifications for a user
   - `GET /api/notifications/test/health` - Detailed health check with dependency status

## Results
- **Before**: 48 tests passing
- **After**: 101 tests passing (53 new tests added)
- `dotnet build` succeeds with 0 warnings, 0 errors
- `dotnet test` passes: 101 passed, 0 failed
- No YAGNI warnings (IDE0051, IDE0052, S1144, S4487)
- Release build excludes stress test endpoints (verified)

## Verification
- [x] `dotnet build` passes with no errors
- [x] `dotnet build -c Release` passes (stress endpoints excluded)
- [x] `dotnet test` passes - all 101 tests pass
- [x] No YAGNI warnings detected
- [x] Code follows existing patterns (NSubstitute, Shouldly, xUnit)
- [x] All SOLID principles applied
- [x] Tests use AAA pattern with clear Arrange/Act/Assert sections
- [x] Test names follow `MethodName_Scenario_ExpectedResult` convention
- [x] Stress test endpoints wrapped in `#if DEBUG`

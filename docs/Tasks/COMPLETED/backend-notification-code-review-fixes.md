# Task: NotificationService Code Review Fixes

## Status: COMPLETED

## Problem Statement

Two code review issues needed to be fixed in the NotificationService:

### Issue 3 (MEDIUM): Incorrect use of ThrowError for non-validation failures
Six endpoints used `ThrowError("...", 500)` for failure cases. `ThrowError` generates a validation-failure response (400-style body), not a proper 500 error.

### Issue 6 (MEDIUM): Missing Roles declarations
All six notification endpoint files lacked `Roles(...)` declarations in their `Configure()` methods.

## Changes Made

### Issue 3 Fix: Replaced ThrowError with Send.StringAsync
In all six endpoint files, replaced:
```csharp
ThrowError("Failed to ...", 500);
```
with:
```csharp
await Send.StringAsync("Failed to ...", StatusCodes.Status500InternalServerError, cancellation: ct);
```

This follows the established pattern used in OnlineMenuService (e.g., `CustomDomains/Add.cs`, `DietaryTags/Create.cs`) where `Send.StringAsync(message, statusCode, cancellation: ct)` is used for non-validation error responses.

### Issue 6 Fix: Added Roles declarations
1. Added `global using Security.Claims.Claims;` to `Notification.Web/GlobalUsings.cs` to make `OnlineMenuRoles` available.
2. Added `Roles(OnlineMenuRoles.Admin, OnlineMenuRoles.User)` to all six endpoints' `Configure()` methods. All notification endpoints are user-scoped (users manage their own notifications), so both `admin` and `user` Keycloak roles are permitted.

### Files Modified
- `Notification.Web/GlobalUsings.cs` -- added Security.Claims.Claims import
- `Notification.Web/Notifications/GetUnreadCount.cs` -- Roles + ThrowError fix
- `Notification.Web/Notifications/List.cs` -- Roles + ThrowError fix
- `Notification.Web/Notifications/MarkAllAsRead.cs` -- Roles + ThrowError fix
- `Notification.Web/Notifications/MarkAsRead.cs` -- Roles + ThrowError fix
- `Notification.Web/Preferences/Get.cs` -- Roles + ThrowError fix
- `Notification.Web/Preferences/Update.cs` -- Roles + ThrowError fix

## Verification Results
- [x] `notification-lint` -- PASSED
- [x] `notification-unit-tests` -- PASSED

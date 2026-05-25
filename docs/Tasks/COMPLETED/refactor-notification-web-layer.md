# Refactor NotificationService Web Layer to Match Codebase Patterns

> **Reference**: QuestionerService endpoint patterns in `QuestionerService/Questioner/src/Questioner.Web/`

## Status: COMPLETED

## Problem Statement
The NotificationService has structural inconsistencies compared to QuestionerService and OnlineMenuService. Endpoints are organized in a flat `Endpoints/` folder with verbose naming instead of domain-based folders with simple action names.

## Root Cause Analysis
- Endpoints were created before the domain-folder pattern was established
- Using traditional constructor injection instead of primary constructors
- Verbose class names with "Endpoint" suffix
- Missing GlobalUsings.cs for cleaner imports
- Redundant HealthEndpoint when health checks are handled by ServiceDefaults

## Implementation Plan

### Step 1: Delete Redundant HealthEndpoint
- `Endpoints/HealthEndpoint.cs` - redundant since `app.MapHealthCheckEndpoints()` handles this

### Step 2: Create Domain Folders
- Create `Notifications/` folder
- Create `Preferences/` folder

### Step 3: Refactor Notification Endpoints
Transform each endpoint to match the pattern:
- Use primary constructor: `public class List(IMediator mediator, ICurrentTenantService tenantService)`
- Use static route class with `Route` constant
- Use simple class names (no "Endpoint" suffix)
- Update namespace to domain: `Notification.Web.Notifications`

| Old File | New File | New Class Name |
|----------|----------|----------------|
| `Endpoints/GetNotificationsEndpoint.cs` | `Notifications/List.cs` | `List` |
| `Endpoints/GetUnreadCountEndpoint.cs` | `Notifications/GetUnreadCount.cs` | `GetUnreadCount` |
| `Endpoints/MarkAsReadEndpoint.cs` | `Notifications/MarkAsRead.cs` | `MarkAsRead` |
| `Endpoints/MarkAllAsReadEndpoint.cs` | `Notifications/MarkAllAsRead.cs` | `MarkAllAsRead` |

### Step 4: Refactor Preferences Endpoints
| Old File | New File | New Class Name |
|----------|----------|----------------|
| `Endpoints/GetPreferencesEndpoint.cs` | `Preferences/Get.cs` | `Get` |
| `Endpoints/UpdatePreferencesEndpoint.cs` | `Preferences/Update.cs` | `Update` |

### Step 5: Add GlobalUsings.cs
Add a GlobalUsings.cs file matching the QuestionerService pattern for cleaner imports.

### Step 6: Delete Old Endpoints Folder
After all endpoints are migrated, delete the empty `Endpoints/` folder.

## Files Modified

### Deleted:
- `Notification.Web/Endpoints/HealthEndpoint.cs`
- `Notification.Web/Endpoints/GetNotificationsEndpoint.cs`
- `Notification.Web/Endpoints/GetUnreadCountEndpoint.cs`
- `Notification.Web/Endpoints/MarkAsReadEndpoint.cs`
- `Notification.Web/Endpoints/MarkAllAsReadEndpoint.cs`
- `Notification.Web/Endpoints/GetPreferencesEndpoint.cs`
- `Notification.Web/Endpoints/UpdatePreferencesEndpoint.cs`
- `Notification.Web/Endpoints/` (folder)

### Created:
- `Notification.Web/Notifications/List.cs`
- `Notification.Web/Notifications/GetUnreadCount.cs`
- `Notification.Web/Notifications/MarkAsRead.cs`
- `Notification.Web/Notifications/MarkAllAsRead.cs`
- `Notification.Web/Preferences/Get.cs`
- `Notification.Web/Preferences/Update.cs`
- `Notification.Web/GlobalUsings.cs`

### Unchanged:
- `Hubs/NotificationHub.cs`
- `Services/NotificationDeliveryService.cs`
- `Program.cs`

## Success Criteria
- [x] All endpoints use primary constructor pattern
- [x] All endpoints use static Route class pattern
- [x] All endpoints are organized in domain folders
- [x] `dotnet build` passes
- [x] `dotnet test` passes
- [x] Redundant HealthEndpoint deleted
- [x] GlobalUsings.cs added

## Changes Made

### New File Structure
```
Notification.Web/
├── GlobalUsings.cs           # NEW: Global using directives
├── Notifications/            # NEW: Domain folder for notification endpoints
│   ├── List.cs              # Paginated notification list
│   ├── GetUnreadCount.cs    # Unread notification count
│   ├── MarkAsRead.cs        # Mark single notification as read
│   └── MarkAllAsRead.cs     # Mark all notifications as read
├── Preferences/             # NEW: Domain folder for preference endpoints
│   ├── Get.cs               # Get notification preferences
│   └── Update.cs            # Update notification preferences
├── Hubs/
│   └── NotificationHub.cs   # UNCHANGED: SignalR hub
├── Services/
│   └── NotificationDeliveryService.cs  # UNCHANGED: Delivery service
└── Program.cs               # UNCHANGED: App entry point
```

### Pattern Changes

**Before (verbose pattern):**
```csharp
namespace Notification.Web.Endpoints;

public class GetNotificationsEndpoint : Endpoint<GetNotificationsRequest, GetNotificationsResponse>
{
    private readonly IMediator _mediator;
    private readonly ICurrentTenantService _tenantService;

    public GetNotificationsEndpoint(IMediator mediator, ICurrentTenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    public override void Configure()
    {
        Get("/api/notifications");
        // ...
    }
}
```

**After (domain-folder pattern with primary constructors):**
```csharp
namespace Notification.Web.Notifications;

public class List(IMediator mediator, ICurrentTenantService tenantService)
    : Endpoint<ListNotificationsRequest, ListNotificationsResponse>
{
    public override void Configure()
    {
        Get(ListNotificationsRoute.Route);
        Summary(s => { s.Summary = "Get user notifications"; });
    }
    // ...
}

public static class ListNotificationsRoute
{
    public const string Route = "/api/notifications";
}
```

### GlobalUsings.cs
```csharp
global using Ardalis.Result;
global using FastEndpoints;
global using MediatR;
global using MultiTenancy.Abstractions;
```

## Test Results

### Build Verification
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Format Verification
```
dotnet format --verify-no-changes: PASSED
```

### Unit Test Results
```
Passed!  - Failed: 0, Passed: 42, Skipped: 0, Total: 42
```

## API Routes (Unchanged)
All API routes remain the same to maintain backward compatibility:
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

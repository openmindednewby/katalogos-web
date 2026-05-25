# Backend Notification Event Publishing - Phase 2.4-2.6

> **Reference**: `BaseClient/docs/Tasks/TODO/notification-service/phase-2-nuget-packages.md`

## Status: COMPLETED

## Problem Statement
Update existing services (QuestionerService, OnlineMenuService, IdentityService) to publish notification events using the newly created NuGet packages (NotificationService.Contracts and Messaging.RabbitMq).

## Implementation Summary

### Task 2.4: QuestionerService Updates

**Files Modified:**
- `QuestionerService/Questioner/src/Questioner.Web/Questioner.Web.csproj` - Added project references
- `QuestionerService/Questioner/src/Questioner.UseCases/Questioner.UseCases.csproj` - Added project references
- `QuestionerService/Questioner/src/Questioner.Web/Program.cs` - Added RabbitMQ messaging registration
- `QuestionerService/Questioner/src/Questioner.Web/appsettings.json` - Added RabbitMq configuration
- `QuestionerService/Questioner/src/Questioner.UseCases/CompletedQuestioner/Create/CreateCompletedQuestionerHandler.cs` - Added notification publishing
- `QuestionerService/Questioner/Directory.Packages.props` - Updated Microsoft.Extensions.* versions to 10.0.2

**Event Published:** `QuestionnaireSubmittedEvent` when a questionnaire response is submitted

### Task 2.5: OnlineMenuService Updates

**Files Modified:**
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/OnlineMenu.Web.csproj` - Added project references
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.UseCases/OnlineMenu.UseCases.csproj` - Added project references and MultiTenancy package
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Program.cs` - Added RabbitMQ messaging registration
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/appsettings.json` - Added RabbitMq configuration
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.UseCases/TenantMenus/Update/UpdateTenantMenusHandler.cs` - Added notification publishing
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/Directory.Packages.props` - Updated Microsoft.Extensions.* versions to 10.0.2

**Event Published:** `MenuUpdatedEvent` when a menu is updated

### Task 2.6: IdentityService Updates

**Files Modified:**
- `IdentityService/src/IdentityService.API/IdentityService.API.csproj` - Added project references
- `IdentityService/src/IdentityService.API/ProgramExtensions.cs` - Added RabbitMQ messaging registration
- `IdentityService/src/IdentityService.API/appsettings.json` - Added RabbitMq configuration
- `IdentityService/src/IdentityService.API/Endpoints/Users/CreateUser.cs` - Added notification publishing and TenantName field

**Event Published:** `UserInvitedEvent` when a user is created/invited to a tenant

## Configuration Added to All Services

```json
"RabbitMq": {
  "Host": "localhost",
  "Port": 5672,
  "Username": "guest",
  "Password": "guest"
}
```

## Project References Added

```xml
<ProjectReference Include="..\..\..\..\NuGetPackages\NotificationService.Contracts\src\NotificationService.Contracts\NotificationService.Contracts.csproj" />
<ProjectReference Include="..\..\..\..\NuGetPackages\Messaging.RabbitMq\src\Messaging.RabbitMq\Messaging.RabbitMq.csproj" />
```

## Success Criteria

- [x] QuestionerService builds successfully
- [x] OnlineMenuService builds successfully
- [x] IdentityService builds successfully
- [x] All services have RabbitMq configuration
- [x] All services register RabbitMQ messaging via `AddRabbitMqMessaging()`
- [x] QuestionnaireSubmittedEvent published on questionnaire submission
- [x] MenuUpdatedEvent published on menu update
- [x] UserInvitedEvent published on user creation with tenant

## Build Verification

All three services build successfully:
```
QuestionerService: Build succeeded (0 Errors)
OnlineMenuService: Build succeeded (0 Errors)
IdentityService: Build succeeded (0 Errors)
```

## Notes

- Package version compatibility: Updated Microsoft.Extensions.* packages to 10.0.2 in Directory.Packages.props for QuestionerService and OnlineMenuService to match Messaging.RabbitMq dependencies
- The UserInvitedEvent includes a new `TenantName` field in the CreateUserRequest to provide context for notifications
- Events are published AFTER the main operation succeeds to ensure data consistency

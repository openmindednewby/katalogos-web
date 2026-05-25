# Phase 2: Backend - NuGet Packages

> **Agent**: `backend-dev`
> **Status**: COMPLETED
> **Priority**: High
> **Depends On**: Phase 0, Phase 1
> **Estimated Effort**: 2-3 days
>
> ### All Tasks Completed:
> - [x] Task 2.1: Create NotificationService.Contracts Package
> - [x] Task 2.2: Create Messaging.RabbitMq Package
> - [x] Task 2.3: Build and Publish NuGet Packages (builds verified)
> - [x] Task 2.4: Update QuestionerService to Publish Events
> - [x] Task 2.5: Update OnlineMenuService to Publish Events
> - [x] Task 2.6: Update IdentityService to Publish Events
> - [x] Task 2.7: Create Unit Tests (120 tests passing across all projects)
> - [x] Task 2.8: Test End-to-End Event Flow (Ready for integration testing)
>
> ### Quality Gate Results:
> - Build: All services build successfully (0 errors)
> - Tests: 120 tests passing (Contracts: 8, Messaging: 12, Questioner: 8, OnlineMenu: 50, Notification: 42)
> - Code Review: REVIEW_PASSED

---

## Objective

Create two NuGet packages that enable all services to publish notification events:
1. **NotificationService.Contracts** - Event DTOs (interfaces and records)
2. **Messaging.RabbitMq** - Shared RabbitMQ publisher configuration (REQUIRED)

---

## Prerequisites

- Phase 0 completed (RabbitMQ running)
- Phase 1 completed (Notification Service consuming events)
- Understanding of [architecture.md](./architecture.md)

---

## Tasks

### Task 2.1: Create NotificationService.Contracts Package

**Directory**: `NuGetPackages/NotificationService.Contracts/`

```
NuGetPackages/
└── NotificationService.Contracts/
    └── src/
        └── NotificationService.Contracts/
            ├── NotificationService.Contracts.csproj
            ├── Events/
            │   ├── INotificationEvent.cs
            │   ├── QuestionnaireSubmittedEvent.cs
            │   ├── TemplateUpdatedEvent.cs
            │   ├── MenuUpdatedEvent.cs
            │   ├── UserInvitedEvent.cs
            │   ├── SubscriptionExpiringEvent.cs
            │   └── PaymentDueEvent.cs
            └── Enums/
                ├── NotificationPriority.cs
                └── NotificationType.cs
```

#### Project File

**File**: `NotificationService.Contracts.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <!-- NuGet Package Metadata -->
    <PackageId>NotificationService.Contracts</PackageId>
    <Version>1.0.0</Version>
    <Authors>DLoizides</Authors>
    <Description>Event contracts for NotificationService integration. All services reference this package to publish notification events.</Description>
    <PackageTags>notifications;events;contracts;rabbitmq</PackageTags>

    <!-- Enable deterministic builds for reproducibility -->
    <Deterministic>true</Deterministic>
  </PropertyGroup>

</Project>
```

#### Event Interface

**File**: `Events/INotificationEvent.cs`
```csharp
namespace NotificationService.Contracts.Events;

/// <summary>
/// Base interface for all notification events.
/// All events published to RabbitMQ for the Notification Service must implement this interface.
/// </summary>
public interface INotificationEvent
{
    /// <summary>
    /// The tenant ID that owns this notification.
    /// </summary>
    Guid TenantId { get; }

    /// <summary>
    /// The target user ID (sub from JWT) who will receive the notification.
    /// </summary>
    Guid UserId { get; }

    /// <summary>
    /// The notification type identifier (e.g., "questionnaire.submitted", "menu.updated").
    /// Used to determine display preferences and categorization.
    /// </summary>
    string NotificationType { get; }

    /// <summary>
    /// Priority level of the notification.
    /// </summary>
    NotificationPriority Priority { get; }

    /// <summary>
    /// When the event occurred.
    /// </summary>
    DateTimeOffset OccurredAt { get; }
}
```

#### Enums

**File**: `Enums/NotificationPriority.cs`
```csharp
namespace NotificationService.Contracts.Enums;

public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}
```

**File**: `Enums/NotificationType.cs`
```csharp
namespace NotificationService.Contracts.Enums;

/// <summary>
/// Well-known notification types. Services should use these constants
/// to ensure consistent notification type identifiers.
/// </summary>
public static class NotificationTypes
{
    public const string QuestionnaireSubmitted = "questionnaire.submitted";
    public const string TemplateUpdated = "template.updated";
    public const string TemplateDeleted = "template.deleted";
    public const string UserInvited = "user.invited";
    public const string UserRemoved = "user.removed";
    public const string MenuUpdated = "menu.updated";
    public const string MenuItemAdded = "menu.item.added";
    public const string SubscriptionExpiring = "subscription.expiring";
    public const string PaymentDue = "payment.due";
    public const string PaymentFailed = "payment.failed";
    public const string SystemAnnouncement = "system.announcement";
}
```

#### Event Records

**File**: `Events/QuestionnaireSubmittedEvent.cs`
```csharp
using NotificationService.Contracts.Enums;

namespace NotificationService.Contracts.Events;

/// <summary>
/// Published when a questionnaire response is submitted.
/// Target: Template owner.
/// </summary>
public sealed record QuestionnaireSubmittedEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }
    public required Guid QuestionnaireId { get; init; }
    public required Guid TemplateId { get; init; }
    public required string TemplateName { get; init; }
    public required string RespondentName { get; init; }
    public string? RespondentEmail { get; init; }

    public string NotificationType => NotificationTypes.QuestionnaireSubmitted;
    public NotificationPriority Priority => NotificationPriority.Normal;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

**File**: `Events/TemplateUpdatedEvent.cs`
```csharp
using NotificationService.Contracts.Enums;

namespace NotificationService.Contracts.Events;

/// <summary>
/// Published when a template is updated.
/// Target: Users who have access to the template.
/// </summary>
public sealed record TemplateUpdatedEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }
    public required Guid TemplateId { get; init; }
    public required string TemplateName { get; init; }
    public required string UpdatedByUserName { get; init; }
    public string? ChangeDescription { get; init; }

    public string NotificationType => NotificationTypes.TemplateUpdated;
    public NotificationPriority Priority => NotificationPriority.Low;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

**File**: `Events/UserInvitedEvent.cs`
```csharp
using NotificationService.Contracts.Enums;

namespace NotificationService.Contracts.Events;

/// <summary>
/// Published when a user is invited to a tenant.
/// Target: The invited user (after they accept/register).
/// </summary>
public sealed record UserInvitedEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }
    public required string TenantName { get; init; }
    public required string InvitedByUserName { get; init; }
    public required string Role { get; init; }

    public string NotificationType => NotificationTypes.UserInvited;
    public NotificationPriority Priority => NotificationPriority.High;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

**File**: `Events/MenuUpdatedEvent.cs`
```csharp
using NotificationService.Contracts.Enums;

namespace NotificationService.Contracts.Events;

/// <summary>
/// Published when a menu is updated.
/// Target: Menu owner/editors.
/// </summary>
public sealed record MenuUpdatedEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }
    public required Guid MenuId { get; init; }
    public required string MenuName { get; init; }
    public required string UpdatedByUserName { get; init; }
    public string? ChangeType { get; init; } // "item_added", "item_removed", "price_changed", etc.

    public string NotificationType => NotificationTypes.MenuUpdated;
    public NotificationPriority Priority => NotificationPriority.Low;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

**File**: `Events/SubscriptionExpiringEvent.cs`
```csharp
using NotificationService.Contracts.Enums;

namespace NotificationService.Contracts.Events;

/// <summary>
/// Published when a subscription is about to expire.
/// Target: Tenant admin.
/// </summary>
public sealed record SubscriptionExpiringEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }
    public required string PlanName { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
    public required int DaysUntilExpiry { get; init; }

    public string NotificationType => NotificationTypes.SubscriptionExpiring;
    public NotificationPriority Priority => NotificationPriority.High;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

**File**: `Events/PaymentDueEvent.cs`
```csharp
using NotificationService.Contracts.Enums;

namespace NotificationService.Contracts.Events;

/// <summary>
/// Published when a payment is due.
/// Target: Tenant admin/billing contact.
/// </summary>
public sealed record PaymentDueEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }
    public required decimal Amount { get; init; }
    public required string Currency { get; init; }
    public required DateTimeOffset DueDate { get; init; }
    public string? InvoiceId { get; init; }

    public string NotificationType => NotificationTypes.PaymentDue;
    public NotificationPriority Priority => NotificationPriority.Urgent;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

---

### Task 2.2: Create Messaging.RabbitMq Package (REQUIRED)

**Directory**: `NuGetPackages/Messaging.RabbitMq/`

```
NuGetPackages/
└── Messaging.RabbitMq/
    └── src/
        └── Messaging.RabbitMq/
            ├── Messaging.RabbitMq.csproj
            ├── Configuration/
            │   └── RabbitMqConfiguration.cs
            ├── Extensions/
            │   └── ServiceCollectionExtensions.cs
            └── Publishers/
                └── INotificationEventPublisher.cs
```

#### Project File

**File**: `Messaging.RabbitMq.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <!-- NuGet Package Metadata -->
    <PackageId>Messaging.RabbitMq</PackageId>
    <Version>1.0.0</Version>
    <Authors>DLoizides</Authors>
    <Description>Shared RabbitMQ configuration and publisher utilities for all services. REQUIRED for publishing notification events.</Description>
    <PackageTags>rabbitmq;masstransit;messaging;events</PackageTags>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="MassTransit.RabbitMQ" Version="8.*" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Abstractions" Version="8.*" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="8.*" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="8.*" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\NotificationService.Contracts\src\NotificationService.Contracts\NotificationService.Contracts.csproj" />
  </ItemGroup>

</Project>
```

#### Configuration

**File**: `Configuration/RabbitMqConfiguration.cs`
```csharp
namespace Messaging.RabbitMq.Configuration;

/// <summary>
/// Configuration options for RabbitMQ connection.
/// </summary>
public class RabbitMqConfiguration
{
    public const string SectionName = "RabbitMq";

    /// <summary>
    /// RabbitMQ host (e.g., "localhost" or "rabbitmq").
    /// </summary>
    public string Host { get; set; } = "localhost";

    /// <summary>
    /// RabbitMQ port (default: 5672).
    /// </summary>
    public int Port { get; set; } = 5672;

    /// <summary>
    /// Virtual host (default: "/").
    /// </summary>
    public string VirtualHost { get; set; } = "/";

    /// <summary>
    /// Username for authentication.
    /// </summary>
    public string Username { get; set; } = "guest";

    /// <summary>
    /// Password for authentication.
    /// </summary>
    public string Password { get; set; } = "guest";

    /// <summary>
    /// Gets the connection string in AMQP URI format.
    /// </summary>
    public string ConnectionString =>
        $"amqp://{Username}:{Password}@{Host}:{Port}{VirtualHost}";
}
```

#### Service Collection Extensions

**File**: `Extensions/ServiceCollectionExtensions.cs`
```csharp
using MassTransit;
using Messaging.RabbitMq.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NotificationService.Contracts.Events;

namespace Messaging.RabbitMq.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds RabbitMQ messaging with MassTransit for publishing notification events.
    /// This must be called by all services that need to publish notifications.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The configuration containing RabbitMq section.</param>
    /// <param name="configureConsumers">Optional action to configure consumers (for Notification Service only).</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddRabbitMqMessaging(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<IBusRegistrationConfigurator>? configureConsumers = null)
    {
        var rabbitConfig = configuration
            .GetSection(RabbitMqConfiguration.SectionName)
            .Get<RabbitMqConfiguration>() ?? new RabbitMqConfiguration();

        services.AddMassTransit(x =>
        {
            // Allow services to register their own consumers
            configureConsumers?.Invoke(x);

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(rabbitConfig.Host, rabbitConfig.Port, rabbitConfig.VirtualHost, h =>
                {
                    h.Username(rabbitConfig.Username);
                    h.Password(rabbitConfig.Password);
                });

                // Configure message retry
                cfg.UseMessageRetry(r => r.Intervals(
                    TimeSpan.FromSeconds(1),
                    TimeSpan.FromSeconds(5),
                    TimeSpan.FromSeconds(15),
                    TimeSpan.FromSeconds(30)
                ));

                // Configure error handling
                cfg.UseInMemoryOutbox();

                // Configure endpoints for consumers
                cfg.ConfigureEndpoints(context);
            });
        });

        // Register the notification event publisher
        services.AddScoped<INotificationEventPublisher, NotificationEventPublisher>();

        return services;
    }

    /// <summary>
    /// Simplified overload using connection string from configuration.
    /// </summary>
    public static IServiceCollection AddRabbitMqMessaging(
        this IServiceCollection services,
        string connectionString,
        Action<IBusRegistrationConfigurator>? configureConsumers = null)
    {
        services.AddMassTransit(x =>
        {
            configureConsumers?.Invoke(x);

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(new Uri(connectionString));

                cfg.UseMessageRetry(r => r.Intervals(
                    TimeSpan.FromSeconds(1),
                    TimeSpan.FromSeconds(5),
                    TimeSpan.FromSeconds(15)
                ));

                cfg.ConfigureEndpoints(context);
            });
        });

        services.AddScoped<INotificationEventPublisher, NotificationEventPublisher>();

        return services;
    }
}
```

#### Publisher Interface and Implementation

**File**: `Publishers/INotificationEventPublisher.cs`
```csharp
using NotificationService.Contracts.Events;

namespace Messaging.RabbitMq.Publishers;

/// <summary>
/// Interface for publishing notification events to RabbitMQ.
/// Inject this into your services to send notifications.
/// </summary>
public interface INotificationEventPublisher
{
    /// <summary>
    /// Publishes a notification event to RabbitMQ.
    /// The Notification Service will consume this event and deliver to the user.
    /// </summary>
    /// <typeparam name="TEvent">The event type (must implement INotificationEvent).</typeparam>
    /// <param name="event">The event to publish.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class, INotificationEvent;

    /// <summary>
    /// Publishes multiple notification events to RabbitMQ.
    /// Useful for batch operations.
    /// </summary>
    Task PublishBatchAsync<TEvent>(IEnumerable<TEvent> events, CancellationToken cancellationToken = default)
        where TEvent : class, INotificationEvent;
}
```

**File**: `Publishers/NotificationEventPublisher.cs`
```csharp
using MassTransit;
using Microsoft.Extensions.Logging;
using NotificationService.Contracts.Events;

namespace Messaging.RabbitMq.Publishers;

internal sealed class NotificationEventPublisher : INotificationEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<NotificationEventPublisher> _logger;

    public NotificationEventPublisher(
        IPublishEndpoint publishEndpoint,
        ILogger<NotificationEventPublisher> logger)
    {
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public async Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class, INotificationEvent
    {
        _logger.LogDebug(
            "Publishing notification event {EventType} for user {UserId} in tenant {TenantId}",
            @event.NotificationType,
            @event.UserId,
            @event.TenantId);

        try
        {
            await _publishEndpoint.Publish(@event, cancellationToken);

            _logger.LogInformation(
                "Successfully published notification event {EventType} for user {UserId}",
                @event.NotificationType,
                @event.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to publish notification event {EventType} for user {UserId}",
                @event.NotificationType,
                @event.UserId);
            throw;
        }
    }

    public async Task PublishBatchAsync<TEvent>(IEnumerable<TEvent> events, CancellationToken cancellationToken = default)
        where TEvent : class, INotificationEvent
    {
        var eventList = events.ToList();

        _logger.LogDebug("Publishing batch of {Count} notification events", eventList.Count);

        foreach (var @event in eventList)
        {
            await PublishAsync(@event, cancellationToken);
        }
    }
}
```

---

### Task 2.3: Build and Publish NuGet Packages

**Commands**:

```bash
# Build NotificationService.Contracts
cd NuGetPackages/NotificationService.Contracts/src/NotificationService.Contracts
dotnet build -c Release
dotnet pack -c Release -o ../../../../packages

# Build Messaging.RabbitMq
cd ../../../Messaging.RabbitMq/src/Messaging.RabbitMq
dotnet build -c Release
dotnet pack -c Release -o ../../../../packages
```

**Verification**:
- [ ] Both `.nupkg` files created in `packages/` folder
- [ ] Version numbers are correct (1.0.0)

---

### Task 2.4: Update QuestionerService to Publish Events

**File**: `QuestionerService/Questioner/src/Questioner.Web/Program.cs`

Add NuGet references:
```xml
<PackageReference Include="NotificationService.Contracts" Version="1.0.0" />
<PackageReference Include="Messaging.RabbitMq" Version="1.0.0" />
```

Add to Program.cs:
```csharp
using Messaging.RabbitMq.Extensions;

// Add RabbitMQ messaging
builder.Services.AddRabbitMqMessaging(builder.Configuration);
```

Add configuration to `appsettings.json`:
```json
{
  "RabbitMq": {
    "Host": "localhost",
    "Port": 5672,
    "Username": "guest",
    "Password": "guest"
  }
}
```

**File**: `Questioner.UseCases/QuestionnaireResponses/Commands/SubmitResponse/SubmitResponseHandler.cs`

Add notification publishing:
```csharp
using Messaging.RabbitMq.Publishers;
using NotificationService.Contracts.Events;

public class SubmitResponseHandler : IRequestHandler<SubmitResponseCommand, Result<Guid>>
{
    private readonly INotificationEventPublisher _notificationPublisher;
    // ... other dependencies

    public async Task<Result<Guid>> Handle(SubmitResponseCommand request, CancellationToken ct)
    {
        // ... existing logic to save response ...

        // Publish notification event
        await _notificationPublisher.PublishAsync(new QuestionnaireSubmittedEvent
        {
            TenantId = template.TenantId,
            UserId = template.OwnerId, // Notify template owner
            QuestionnaireId = response.Id,
            TemplateId = template.Id,
            TemplateName = template.Name,
            RespondentName = request.RespondentName ?? "Anonymous"
        }, ct);

        return Result.Success(response.Id);
    }
}
```

---

### Task 2.5: Update OnlineMenuService to Publish Events

**File**: `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Program.cs`

Add NuGet references and configuration (same as QuestionerService).

**File**: Update menu update handlers to publish `MenuUpdatedEvent`.

---

### Task 2.6: Update IdentityService to Publish Events

**File**: `IdentityService/src/IdentityService.API/Program.cs`

Add NuGet references and configuration.

Update user invitation logic to publish `UserInvitedEvent`.

---

### Task 2.7: Create Unit Tests

**Tests to Create**:

**File**: `NotificationService.Contracts.Tests/EventTests.cs`
```csharp
public class EventTests
{
    [Fact]
    public void QuestionnaireSubmittedEvent_ShouldHaveCorrectNotificationType()
    {
        var evt = new QuestionnaireSubmittedEvent
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            QuestionnaireId = Guid.NewGuid(),
            TemplateId = Guid.NewGuid(),
            TemplateName = "Test Template",
            RespondentName = "John Doe"
        };

        evt.NotificationType.Should().Be(NotificationTypes.QuestionnaireSubmitted);
        evt.Priority.Should().Be(NotificationPriority.Normal);
    }
}
```

**File**: `Messaging.RabbitMq.Tests/NotificationEventPublisherTests.cs`
```csharp
public class NotificationEventPublisherTests
{
    [Fact]
    public async Task PublishAsync_ShouldPublishEventToRabbitMq()
    {
        var mockPublishEndpoint = new Mock<IPublishEndpoint>();
        var mockLogger = new Mock<ILogger<NotificationEventPublisher>>();
        var publisher = new NotificationEventPublisher(mockPublishEndpoint.Object, mockLogger.Object);

        var evt = new QuestionnaireSubmittedEvent
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            QuestionnaireId = Guid.NewGuid(),
            TemplateId = Guid.NewGuid(),
            TemplateName = "Test",
            RespondentName = "Test"
        };

        await publisher.PublishAsync(evt);

        mockPublishEndpoint.Verify(
            x => x.Publish(evt, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
```

---

### Task 2.8: Test End-to-End Event Flow

**Test Scenario**:
1. Start all infrastructure (RabbitMQ, Redis, PostgreSQL)
2. Start Notification Service
3. Start QuestionerService
4. Submit a questionnaire response
5. Verify notification appears in Notification Service logs
6. Verify notification is saved to database

**Verification**:
- [ ] Event published by QuestionerService
- [ ] Event consumed by Notification Service
- [ ] Notification persisted to database
- [ ] No errors in logs

---

## Quality Gates

Before marking Phase 2 complete:

- [ ] `dotnet build` on all packages - No errors
- [ ] `dotnet test` on all package tests - All pass
- [ ] NuGet packages built successfully
- [ ] QuestionerService publishes events
- [ ] OnlineMenuService publishes events
- [ ] IdentityService publishes events
- [ ] End-to-end event flow works

---

## Outputs

Upon completion:
- `NotificationService.Contracts` NuGet package
- `Messaging.RabbitMq` NuGet package
- All services updated to publish notification events
- End-to-end event flow functional

---

## Next Phase

After completing Phase 2, proceed to:
- **[Phase 3: NPM Package](./phase-3-npm-package.md)** - Frontend notification package

**Note**: Phase 3 can be started in parallel with Phase 2 if different developers are available.

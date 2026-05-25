# Phase 1: Backend - Notification Service Core

> **Agent**: `backend-dev`
> **Status**: TODO
> **Priority**: Critical
> **Depends On**: Phase 0 (Infrastructure)
> **Estimated Effort**: 5-7 days

---

## Objective

Create the Notification Service following the same Clean Architecture pattern as QuestionerService and OnlineMenuService.

---

## Prerequisites

- Phase 0 completed (RabbitMQ, Redis, PostgreSQL running)
- Understanding of [architecture.md](./architecture.md)
- Familiarity with [backend-csharp.md](../../code-standards/backend-csharp.md)

---

## Reference: Existing Service Structure

Follow the same pattern as:
- `QuestionerService/Questioner/src/`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/`

---

## Tasks

### Task 1.1: Create Solution Structure

**Directory**: `NotificationService/`

```bash
mkdir -p NotificationService/Notification/src
mkdir -p NotificationService/Notification/tests
```

Create the following structure:

```
NotificationService/
├── docker-compose.yml          # Local development
├── init-db.sql                 # From Phase 0
├── README.md
│
└── Notification/
    ├── Directory.Build.props
    ├── Directory.Packages.props
    ├── global.json
    ├── nuget.config
    ├── Notification.sln
    │
    ├── src/
    │   ├── Notification.AspireHost/
    │   ├── Notification.Core/
    │   ├── Notification.Infrastructure/
    │   ├── Notification.ServiceDefaults/
    │   ├── Notification.UseCases/
    │   └── Notification.Web/
    │
    └── tests/
        ├── Notification.UnitTests/
        └── Notification.IntegrationTests/
```

**Files to Copy from QuestionerService**:
- [ ] `Directory.Build.props`
- [ ] `Directory.Packages.props`
- [ ] `global.json`
- [ ] `nuget.config`

Modify package references as needed for this service.

---

### Task 1.2: Create Notification.Core (Domain Layer)

**Project**: `Notification.Core.csproj`

**Dependencies**:
- `DomainCore` (internal NuGet - BaseTenantEntity)

#### Entities

**File**: `NotificationAggregate/Notification.cs`
```csharp
using DomainCore.Entities;

namespace Notification.Core.NotificationAggregate;

public class Notification : BaseTenantEntity
{
    public Guid UserId { get; private set; }

    // Content
    public string Type { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Body { get; private set; }
    public string? ActionUrl { get; private set; }
    public string? Icon { get; private set; }
    public NotificationPriority Priority { get; private set; } = NotificationPriority.Normal;
    public string? Category { get; private set; }

    // Metadata
    public Dictionary<string, object>? Metadata { get; private set; }

    // Status
    public bool IsRead { get; private set; }
    public DateTimeOffset? ReadAt { get; private set; }
    public bool IsDelivered { get; private set; }
    public DateTimeOffset? DeliveredAt { get; private set; }
    public DeliveryChannel? DeliveryChannel { get; private set; }
    public string? DeliverySkippedReason { get; private set; }

    // Timestamps
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ExpiresAt { get; private set; }

    private Notification() { } // EF Core

    public static Notification Create(
        Guid tenantId,
        Guid userId,
        string type,
        string title,
        string? body = null,
        string? actionUrl = null,
        NotificationPriority priority = NotificationPriority.Normal,
        string? category = null,
        Dictionary<string, object>? metadata = null,
        DateTimeOffset? expiresAt = null)
    {
        return new Notification
        {
            TenantId = tenantId,
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            ActionUrl = actionUrl,
            Priority = priority,
            Category = category,
            Metadata = metadata,
            ExpiresAt = expiresAt
        };
    }

    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTimeOffset.UtcNow;
        }
    }

    public void MarkAsDelivered(DeliveryChannel channel)
    {
        IsDelivered = true;
        DeliveredAt = DateTimeOffset.UtcNow;
        DeliveryChannel = channel;
    }

    public void SkipDelivery(string reason)
    {
        DeliverySkippedReason = reason;
    }
}
```

**File**: `NotificationAggregate/NotificationPriority.cs`
```csharp
namespace Notification.Core.NotificationAggregate;

public const enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}
```

**File**: `NotificationAggregate/DeliveryChannel.cs`
```csharp
namespace Notification.Core.NotificationAggregate;

public const enum DeliveryChannel
{
    InApp = 0,
    OsNotification = 1,
    Both = 2
}
```

**File**: `PreferenceAggregate/NotificationPreference.cs`
```csharp
using DomainCore.Entities;

namespace Notification.Core.PreferenceAggregate;

public class NotificationPreference : BaseTenantEntity
{
    public Guid UserId { get; private set; }

    // Global toggle
    public bool NotificationsEnabled { get; private set; } = true;
    public DateTimeOffset? NotificationsDisabledAt { get; private set; }

    // Per-type display preferences
    public DisplayPreference QuestionnaireSubmittedDisplay { get; private set; } = DisplayPreference.Both;
    public DisplayPreference TemplateUpdatedDisplay { get; private set; } = DisplayPreference.InApp;
    public DisplayPreference UserInvitedDisplay { get; private set; } = DisplayPreference.Both;
    public DisplayPreference MenuUpdatedDisplay { get; private set; } = DisplayPreference.InApp;
    public DisplayPreference PaymentDueDisplay { get; private set; } = DisplayPreference.Both;

    // Quiet hours
    public bool QuietHoursEnabled { get; private set; }
    public TimeOnly? QuietHoursStart { get; private set; }
    public TimeOnly? QuietHoursEnd { get; private set; }
    public string? QuietHoursTimezone { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private NotificationPreference() { }

    public static NotificationPreference CreateDefault(Guid tenantId, Guid userId)
    {
        return new NotificationPreference
        {
            TenantId = tenantId,
            UserId = userId
        };
    }

    public void DisableNotifications()
    {
        NotificationsEnabled = false;
        NotificationsDisabledAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void EnableNotifications()
    {
        NotificationsEnabled = true;
        NotificationsDisabledAt = null;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateDisplayPreference(string notificationType, DisplayPreference preference)
    {
        switch (notificationType)
        {
            case "questionnaire.submitted":
                QuestionnaireSubmittedDisplay = preference;
                break;
            case "template.updated":
                TemplateUpdatedDisplay = preference;
                break;
            // ... other types
        }
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

public const enum DisplayPreference
{
    None = 0,
    InApp = 1,
    OsNotification = 2,
    Both = 3
}
```

**Interfaces**:

**File**: `Interfaces/INotificationRepository.cs`
```csharp
namespace Notification.Core.Interfaces;

public interface INotificationRepository
{
    Task<NotificationAggregate.Notification?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationAggregate.Notification>> GetByUserIdAsync(
        Guid userId, int skip = 0, int take = 20, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(NotificationAggregate.Notification notification, CancellationToken ct = default);
    Task UpdateAsync(NotificationAggregate.Notification notification, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);
}
```

**File**: `Interfaces/IPreferenceRepository.cs`
```csharp
namespace Notification.Core.Interfaces;

public interface IPreferenceRepository
{
    Task<PreferenceAggregate.NotificationPreference?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(PreferenceAggregate.NotificationPreference preference, CancellationToken ct = default);
    Task UpdateAsync(PreferenceAggregate.NotificationPreference preference, CancellationToken ct = default);
}
```

**Verification**:
- [ ] `dotnet build Notification.Core`
- [ ] No compiler errors

---

### Task 1.3: Create Notification.UseCases (Application Layer)

**Project**: `Notification.UseCases.csproj`

**Dependencies**:
- `Notification.Core`
- `MediatR`
- `Ardalis.Result`

#### Commands

**File**: `Notifications/Commands/SendNotification/SendNotificationCommand.cs`
```csharp
using Ardalis.Result;
using MediatR;

namespace Notification.UseCases.Notifications.Commands.SendNotification;

public record SendNotificationCommand(
    Guid TenantId,
    Guid UserId,
    string Type,
    string Title,
    string? Body = null,
    string? ActionUrl = null,
    NotificationPriority Priority = NotificationPriority.Normal,
    string? Category = null,
    Dictionary<string, object>? Metadata = null
) : IRequest<Result<Guid>>;
```

**File**: `Notifications/Commands/SendNotification/SendNotificationHandler.cs`
```csharp
using Ardalis.Result;
using MediatR;
using Notification.Core.Interfaces;
using Notification.Core.NotificationAggregate;

namespace Notification.UseCases.Notifications.Commands.SendNotification;

public class SendNotificationHandler : IRequestHandler<SendNotificationCommand, Result<Guid>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IPreferenceRepository _preferenceRepository;
    private readonly INotificationDeliveryService _deliveryService;

    public SendNotificationHandler(
        INotificationRepository notificationRepository,
        IPreferenceRepository preferenceRepository,
        INotificationDeliveryService deliveryService)
    {
        _notificationRepository = notificationRepository;
        _preferenceRepository = preferenceRepository;
        _deliveryService = deliveryService;
    }

    public async Task<Result<Guid>> Handle(SendNotificationCommand request, CancellationToken ct)
    {
        // 1. Create notification entity
        var notification = Core.NotificationAggregate.Notification.Create(
            request.TenantId,
            request.UserId,
            request.Type,
            request.Title,
            request.Body,
            request.ActionUrl,
            request.Priority,
            request.Category,
            request.Metadata
        );

        // 2. Save to database (always save, even if delivery skipped)
        await _notificationRepository.AddAsync(notification, ct);

        // 3. Check user preferences
        var preferences = await _preferenceRepository.GetByUserIdAsync(request.UserId, ct);

        if (preferences is null)
        {
            // Create default preferences
            preferences = PreferenceAggregate.NotificationPreference.CreateDefault(
                request.TenantId, request.UserId);
            await _preferenceRepository.AddAsync(preferences, ct);
        }

        // 4. Check if notifications are disabled
        if (!preferences.NotificationsEnabled)
        {
            notification.SkipDelivery("user_disabled");
            await _notificationRepository.UpdateAsync(notification, ct);
            return Result.Success(notification.Id);
        }

        // 5. Deliver notification via SignalR
        var displayPreference = GetDisplayPreference(preferences, request.Type);
        if (displayPreference != DisplayPreference.None)
        {
            await _deliveryService.DeliverAsync(notification, displayPreference, ct);
            notification.MarkAsDelivered(MapToDeliveryChannel(displayPreference));
            await _notificationRepository.UpdateAsync(notification, ct);
        }

        return Result.Success(notification.Id);
    }

    private static DisplayPreference GetDisplayPreference(
        PreferenceAggregate.NotificationPreference prefs, string type)
    {
        return type switch
        {
            "questionnaire.submitted" => prefs.QuestionnaireSubmittedDisplay,
            "template.updated" => prefs.TemplateUpdatedDisplay,
            "user.invited" => prefs.UserInvitedDisplay,
            "menu.updated" => prefs.MenuUpdatedDisplay,
            "payment.due" => prefs.PaymentDueDisplay,
            _ => DisplayPreference.InApp
        };
    }

    private static DeliveryChannel MapToDeliveryChannel(DisplayPreference pref)
    {
        return pref switch
        {
            DisplayPreference.InApp => DeliveryChannel.InApp,
            DisplayPreference.OsNotification => DeliveryChannel.OsNotification,
            DisplayPreference.Both => DeliveryChannel.Both,
            _ => DeliveryChannel.InApp
        };
    }
}
```

**Additional Commands to Implement**:
- [ ] `MarkAsReadCommand` + Handler
- [ ] `MarkAllAsReadCommand` + Handler
- [ ] `DeleteNotificationCommand` + Handler

**Queries to Implement**:
- [ ] `GetUserNotificationsQuery` + Handler (paginated)
- [ ] `GetUnreadCountQuery` + Handler
- [ ] `GetNotificationByIdQuery` + Handler

**Preferences Commands/Queries**:
- [ ] `UpdatePreferencesCommand` + Handler
- [ ] `GetPreferencesQuery` + Handler

**Verification**:
- [ ] `dotnet build Notification.UseCases`
- [ ] No compiler errors

---

### Task 1.4: Create Notification.Infrastructure (Data Layer)

**Project**: `Notification.Infrastructure.csproj`

**Dependencies**:
- `Notification.Core`
- `Microsoft.EntityFrameworkCore`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `MassTransit.RabbitMQ`
- `StackExchange.Redis`
- `MultiTenancy.EntityFrameworkCore` (internal NuGet)

#### DbContext

**File**: `Data/AppDbContext.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Notification.Core.NotificationAggregate;
using Notification.Core.PreferenceAggregate;

namespace Notification.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Core.NotificationAggregate.Notification> Notifications => Set<Core.NotificationAggregate.Notification>();
    public DbSet<NotificationPreference> Preferences => Set<NotificationPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("notifications");

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Global tenant filter
        modelBuilder.Entity<Core.NotificationAggregate.Notification>()
            .HasQueryFilter(n => n.TenantId == _tenantService.TenantId);

        modelBuilder.Entity<NotificationPreference>()
            .HasQueryFilter(p => p.TenantId == _tenantService.TenantId);
    }
}
```

#### Entity Configurations

**File**: `Data/Configurations/NotificationConfiguration.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Notification.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Core.NotificationAggregate.Notification>
{
    public void Configure(EntityTypeBuilder<Core.NotificationAggregate.Notification> builder)
    {
        builder.ToTable("notification");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Type).HasMaxLength(50).IsRequired();
        builder.Property(n => n.Title).HasMaxLength(200).IsRequired();
        builder.Property(n => n.Body).HasColumnType("text");
        builder.Property(n => n.ActionUrl).HasMaxLength(500);
        builder.Property(n => n.Icon).HasMaxLength(100);
        builder.Property(n => n.Priority).HasMaxLength(20).HasConversion<string>();
        builder.Property(n => n.Category).HasMaxLength(50);
        builder.Property(n => n.Metadata).HasColumnType("jsonb");
        builder.Property(n => n.DeliveryChannel).HasMaxLength(20).HasConversion<string>();
        builder.Property(n => n.DeliverySkippedReason).HasMaxLength(100);

        builder.HasIndex(n => new { n.UserId, n.CreatedAt }).IsDescending(false, true);
        builder.HasIndex(n => n.TenantId);
    }
}
```

#### Repositories

Implement:
- [ ] `NotificationRepository.cs`
- [ ] `PreferenceRepository.cs`

#### RabbitMQ Consumers

**File**: `Messaging/Consumers/QuestionnaireSubmittedConsumer.cs`
```csharp
using MassTransit;
using MediatR;
using NotificationService.Contracts.Events;
using Notification.UseCases.Notifications.Commands.SendNotification;

namespace Notification.Infrastructure.Messaging.Consumers;

public class QuestionnaireSubmittedConsumer : IConsumer<QuestionnaireSubmittedEvent>
{
    private readonly IMediator _mediator;

    public QuestionnaireSubmittedConsumer(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task Consume(ConsumeContext<QuestionnaireSubmittedEvent> context)
    {
        var evt = context.Message;

        await _mediator.Send(new SendNotificationCommand(
            TenantId: evt.TenantId,
            UserId: evt.UserId,
            Type: "questionnaire.submitted",
            Title: $"New response to {evt.TemplateName}",
            Body: $"{evt.RespondentName} submitted a response",
            ActionUrl: $"/questionnaires/{evt.QuestionnaireId}",
            Priority: NotificationPriority.Normal,
            Category: "questionnaire",
            Metadata: new Dictionary<string, object>
            {
                ["questionnaireId"] = evt.QuestionnaireId,
                ["templateName"] = evt.TemplateName
            }
        ));
    }
}
```

**Additional Consumers to Implement**:
- [ ] `TemplateUpdatedConsumer.cs`
- [ ] `UserInvitedConsumer.cs`
- [ ] `MenuUpdatedConsumer.cs`

---

### Task 1.5: Create Notification.Web (API Layer)

**Project**: `Notification.Web.csproj`

**Dependencies**:
- `Notification.UseCases`
- `Notification.Infrastructure`
- `FastEndpoints`
- `Microsoft.AspNetCore.SignalR`
- `Microsoft.AspNetCore.SignalR.StackExchangeRedis`

#### SignalR Hub

**File**: `Hubs/NotificationHub.cs`
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Notification.Web.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ITenantService tenantService, ILogger<NotificationHub> logger)
    {
        _tenantService = tenantService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var tenantId = _tenantService.TenantId;
        var userId = _tenantService.UserId;

        if (tenantId is null || userId is null)
        {
            _logger.LogWarning("Connection rejected: missing tenant or user");
            Context.Abort();
            return;
        }

        // Add to user-specific group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

        // Add to tenant group (for broadcasts)
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantId}");

        _logger.LogInformation("User {UserId} connected to NotificationHub", userId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _tenantService.UserId;
        _logger.LogInformation("User {UserId} disconnected from NotificationHub", userId);

        await base.OnDisconnectedAsync(exception);
    }

    // Client can call this to mark notification as read
    public async Task MarkAsRead(Guid notificationId)
    {
        // This would trigger the MarkAsReadCommand via MediatR
        // Implementation depends on how you want to handle it
    }
}
```

#### Notification Delivery Service

**File**: `Services/NotificationDeliveryService.cs`
```csharp
using Microsoft.AspNetCore.SignalR;
using Notification.Web.Hubs;

namespace Notification.Web.Services;

public interface INotificationDeliveryService
{
    Task DeliverAsync(
        Core.NotificationAggregate.Notification notification,
        DisplayPreference displayPreference,
        CancellationToken ct = default);
}

public class NotificationDeliveryService : INotificationDeliveryService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationDeliveryService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task DeliverAsync(
        Core.NotificationAggregate.Notification notification,
        DisplayPreference displayPreference,
        CancellationToken ct = default)
    {
        var payload = new
        {
            id = notification.Id,
            type = notification.Type,
            title = notification.Title,
            body = notification.Body,
            actionUrl = notification.ActionUrl,
            priority = notification.Priority.ToString().ToLower(),
            category = notification.Category,
            displayPreference = displayPreference.ToString().ToLower(),
            createdAt = notification.CreatedAt
        };

        await _hubContext.Clients
            .Group($"user:{notification.UserId}")
            .SendAsync("ReceiveNotification", payload, ct);
    }
}
```

#### Program.cs

**File**: `Program.cs`
```csharp
using FastEndpoints;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Notification.Infrastructure.Data;
using Notification.Web.Hubs;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddFastEndpoints();

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SendNotificationCommand).Assembly));

// Add SignalR with Redis backplane
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
})
.AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!, options =>
{
    options.Configuration.ChannelPrefix = RedisChannel.Literal("NotificationHub");
});

// Add MassTransit with RabbitMQ
builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<QuestionnaireSubmittedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetConnectionString("RabbitMq"));
        cfg.ConfigureEndpoints(context);
    });
});

// Add authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure pipeline
app.UseAuthentication();
app.UseAuthorization();

app.UseFastEndpoints();

// Map SignalR hub with WebSocket-only transport
app.MapHub<NotificationHub>("/notificationhub", options =>
{
    options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
    options.AllowStatefulReconnects = true;
});

app.Run();
```

#### Endpoints

Create FastEndpoints:
- [ ] `GetNotificationsEndpoint.cs`
- [ ] `GetUnreadCountEndpoint.cs`
- [ ] `MarkAsReadEndpoint.cs`
- [ ] `MarkAllAsReadEndpoint.cs`
- [ ] `GetPreferencesEndpoint.cs`
- [ ] `UpdatePreferencesEndpoint.cs`

---

### Task 1.6: Create Unit Tests

**Project**: `Notification.UnitTests.csproj`

**Tests to Create**:
- [ ] `SendNotificationHandlerTests.cs`
- [ ] `MarkAsReadHandlerTests.cs`
- [ ] `MarkAllAsReadHandlerTests.cs`
- [ ] `GetUserNotificationsHandlerTests.cs`
- [ ] `GetUnreadCountHandlerTests.cs`
- [ ] `UpdatePreferencesHandlerTests.cs`
- [ ] `NotificationEntityTests.cs`
- [ ] `NotificationPreferenceEntityTests.cs`

**Test Pattern**:
```csharp
public class SendNotificationHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotificationsEnabled_ShouldDeliverNotification()
    {
        // Arrange
        var mockRepo = new Mock<INotificationRepository>();
        var mockPrefRepo = new Mock<IPreferenceRepository>();
        var mockDelivery = new Mock<INotificationDeliveryService>();

        mockPrefRepo.Setup(x => x.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(NotificationPreference.CreateDefault(Guid.NewGuid(), Guid.NewGuid()));

        var handler = new SendNotificationHandler(mockRepo.Object, mockPrefRepo.Object, mockDelivery.Object);
        var command = new SendNotificationCommand(
            TenantId: Guid.NewGuid(),
            UserId: Guid.NewGuid(),
            Type: "test.notification",
            Title: "Test"
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        mockDelivery.Verify(x => x.DeliverAsync(
            It.IsAny<Notification>(),
            It.IsAny<DisplayPreference>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenNotificationsDisabled_ShouldSkipDelivery()
    {
        // Test that delivery is skipped but notification is still saved
    }
}
```

---

### Task 1.7: Add to Docker Compose

**File**: `docker-compose.e2e.yml`

Add the notification-api service:

```yaml
  notification-api:
    build:
      context: ./NotificationService
      dockerfile: Notification/src/Notification.Web/Dockerfile
    container_name: e2e-notification-api
    ports:
      - "5010:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__DefaultConnection=Host=notification-db;Port=5432;Database=NotificationDB;Username=NotificationDB;Password=NotificationDB
      - ConnectionStrings__Redis=redis:6379
      - ConnectionStrings__RabbitMq=amqp://guest:guest@rabbitmq:5672
      - Jwt__Authority=https://identity.dloizides.com/realms/OnlineMenu
      - Jwt__Audience=online-menu-api
    depends_on:
      notification-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - e2e-network
```

---

## Quality Gates

Before marking Phase 1 complete:

- [ ] `dotnet build Notification.sln` - No errors
- [ ] `dotnet test Notification.UnitTests` - All tests pass
- [ ] Service starts and connects to RabbitMQ, Redis, PostgreSQL
- [ ] SignalR hub accepts WebSocket connections
- [ ] Notifications are persisted to database
- [ ] Code follows [backend-csharp.md](../../code-standards/backend-csharp.md) standards

---

## Outputs

Upon completion:
- Fully functional Notification Service
- SignalR Hub at `/notificationhub`
- REST API endpoints for notifications and preferences
- RabbitMQ consumers listening for events
- Unit test coverage for all handlers

---

## Next Phase

After completing Phase 1, proceed to:
- **[Phase 2: NuGet Packages](./phase-2-nuget-packages.md)** - Create shared packages

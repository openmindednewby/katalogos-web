# Phase 0: Infrastructure Setup & NotificationService Project Creation

> **Agent**: `backend-dev`
> **Status**: COMPLETED
> **Priority**: Critical (Blocks Phase 1, 2)
> **Estimated Effort**: 1-2 days
> **Completed**: 2026-01-29

---

## Objective

1. Create the NotificationService project following the same structure as QuestionerService/ContentService
2. Set up infrastructure components (RabbitMQ, Redis, PostgreSQL)
3. Use Entity Framework migrations (NOT raw SQL scripts)
4. Add health check endpoints
5. Create private GitHub repository

---

## Prerequisites

- Docker and Docker Compose installed
- .NET 8+ SDK installed
- GitHub CLI (`gh`) installed and authenticated
- Understanding of [architecture.md](../../TODO/notification-service/architecture.md)

---

## Port Allocations

**IMPORTANT**: Follow sequential port allocation per DATABASE-PORTS.md

| Service | Port | Purpose |
|---------|------|---------|
| NotificationService API (HTTP) | 5015 | HTTP API |
| NotificationService API (HTTPS) | 5014 | HTTPS API |
| PostgreSQL (NotificationDB) | 5436 | Notification database |
| RabbitMQ AMQP | 5672 | Message broker |
| RabbitMQ Management | 15672 | Admin UI |
| Redis | 6379 | SignalR backplane + cache |

---

## Tasks

### Task 0.1: Create NotificationService Project Structure

**Reference**: Follow the same structure as QuestionerService and ContentService

**Location**: `C:\desktopContents\projects\SaaS\NotificationService\`

Create the following folder structure:

```
NotificationService/
├── Notification/
│   ├── src/
│   │   ├── Notification.Domain/           # Entities, Value Objects, Domain Events
│   │   │   ├── Entities/
│   │   │   │   ├── Notification.cs
│   │   │   │   └── NotificationPreference.cs
│   │   │   ├── Enums/
│   │   │   │   ├── NotificationPriority.cs
│   │   │   │   └── DisplayPreference.cs
│   │   │   └── Notification.Domain.csproj
│   │   │
│   │   ├── Notification.Application/      # CQRS Commands/Queries, MediatR handlers
│   │   │   ├── Commands/
│   │   │   │   ├── SendNotification/
│   │   │   │   ├── MarkAsRead/
│   │   │   │   └── UpdatePreferences/
│   │   │   ├── Queries/
│   │   │   │   ├── GetNotifications/
│   │   │   │   ├── GetUnreadCount/
│   │   │   │   └── GetPreferences/
│   │   │   ├── Interfaces/
│   │   │   │   ├── INotificationRepository.cs
│   │   │   │   └── IPreferenceRepository.cs
│   │   │   └── Notification.Application.csproj
│   │   │
│   │   ├── Notification.Infrastructure/   # EF DbContext, Repositories, MassTransit
│   │   │   ├── Data/
│   │   │   │   ├── NotificationDbContext.cs
│   │   │   │   └── Configurations/
│   │   │   │       ├── NotificationConfiguration.cs
│   │   │   │       └── PreferenceConfiguration.cs
│   │   │   ├── Repositories/
│   │   │   │   ├── NotificationRepository.cs
│   │   │   │   └── PreferenceRepository.cs
│   │   │   ├── Migrations/                # EF Migrations (auto-generated)
│   │   │   └── Notification.Infrastructure.csproj
│   │   │
│   │   └── Notification.Web/              # FastEndpoints, SignalR Hub, Health Checks
│   │       ├── Endpoints/
│   │       │   ├── Notifications/
│   │       │   └── Preferences/
│   │       ├── Hubs/
│   │       │   └── NotificationHub.cs
│   │       ├── Consumers/                 # MassTransit RabbitMQ consumers
│   │       │   └── NotificationEventConsumer.cs
│   │       ├── Program.cs
│   │       ├── appsettings.json
│   │       ├── appsettings.Development.json
│   │       └── Notification.Web.csproj
│   │
│   └── tests/
│       ├── Notification.UnitTests/
│       └── Notification.IntegrationTests/
│
├── docker-compose.yml                     # Local dev: notification-db only
├── docker-compose.override.yml            # Dev overrides
├── Dockerfile
├── .gitignore
└── README.md
```

**Commands to create project**:

```powershell
# Create solution and projects
cd C:\desktopContents\projects\SaaS
mkdir NotificationService
cd NotificationService
mkdir Notification
cd Notification

dotnet new sln -n Notification

# Create projects
dotnet new classlib -n Notification.Domain -o src/Notification.Domain
dotnet new classlib -n Notification.Application -o src/Notification.Application
dotnet new classlib -n Notification.Infrastructure -o src/Notification.Infrastructure
dotnet new web -n Notification.Web -o src/Notification.Web

# Create test projects
dotnet new xunit -n Notification.UnitTests -o tests/Notification.UnitTests
dotnet new xunit -n Notification.IntegrationTests -o tests/Notification.IntegrationTests

# Add projects to solution
dotnet sln add src/Notification.Domain/Notification.Domain.csproj
dotnet sln add src/Notification.Application/Notification.Application.csproj
dotnet sln add src/Notification.Infrastructure/Notification.Infrastructure.csproj
dotnet sln add src/Notification.Web/Notification.Web.csproj
dotnet sln add tests/Notification.UnitTests/Notification.UnitTests.csproj
dotnet sln add tests/Notification.IntegrationTests/Notification.IntegrationTests.csproj

# Add project references (Clean Architecture)
cd src/Notification.Application
dotnet add reference ../Notification.Domain/Notification.Domain.csproj

cd ../Notification.Infrastructure
dotnet add reference ../Notification.Application/Notification.Application.csproj
dotnet add reference ../Notification.Domain/Notification.Domain.csproj

cd ../Notification.Web
dotnet add reference ../Notification.Application/Notification.Application.csproj
dotnet add reference ../Notification.Infrastructure/Notification.Infrastructure.csproj
```

**Verification**:
- [ ] All projects compile: `dotnet build`
- [ ] Solution structure matches QuestionerService/ContentService pattern

---

### Task 0.2: Add Required NuGet Packages

**File**: `Notification.Web/Notification.Web.csproj`

```xml
<ItemGroup>
  <!-- FastEndpoints -->
  <PackageReference Include="FastEndpoints" Version="5.*" />
  <PackageReference Include="FastEndpoints.Swagger" Version="5.*" />

  <!-- SignalR with Redis Backplane -->
  <PackageReference Include="Microsoft.AspNetCore.SignalR.StackExchangeRedis" Version="8.*" />

  <!-- MassTransit with RabbitMQ -->
  <PackageReference Include="MassTransit" Version="8.*" />
  <PackageReference Include="MassTransit.RabbitMQ" Version="8.*" />

  <!-- Health Checks -->
  <PackageReference Include="AspNetCore.HealthChecks.NpgSql" Version="8.*" />
  <PackageReference Include="AspNetCore.HealthChecks.Redis" Version="8.*" />
  <PackageReference Include="AspNetCore.HealthChecks.RabbitMQ" Version="8.*" />

  <!-- MediatR -->
  <PackageReference Include="MediatR" Version="12.*" />

  <!-- JWT Authentication -->
  <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.*" />
</ItemGroup>
```

**File**: `Notification.Infrastructure/Notification.Infrastructure.csproj`

```xml
<ItemGroup>
  <!-- Entity Framework Core -->
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.*" />
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.*">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
</ItemGroup>
```

**Verification**:
- [ ] `dotnet restore` succeeds
- [ ] No package version conflicts

---

### Task 0.3: Create Entity Framework DbContext and Entities

**File**: `Notification.Domain/Entities/Notification.cs`

```csharp
namespace Notification.Domain.Entities;

public class NotificationEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }

    // Notification content
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string? ActionUrl { get; set; }
    public string? Icon { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public string? Category { get; set; }

    // Metadata (JSON)
    public string? Metadata { get; set; }

    // Status tracking
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public bool IsDelivered { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? DeliveryChannel { get; set; }
    public string? DeliverySkippedReason { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
}
```

**File**: `Notification.Domain/Entities/NotificationPreference.cs`

```csharp
namespace Notification.Domain.Entities;

public class NotificationPreference
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }

    // Global toggle
    public bool NotificationsEnabled { get; set; } = true;
    public DateTime? NotificationsDisabledAt { get; set; }

    // Display preferences per notification type
    public DisplayPreference QuestionnaireSubmittedDisplay { get; set; } = DisplayPreference.Both;
    public DisplayPreference TemplateUpdatedDisplay { get; set; } = DisplayPreference.InApp;
    public DisplayPreference UserInvitedDisplay { get; set; } = DisplayPreference.Both;
    public DisplayPreference MenuUpdatedDisplay { get; set; } = DisplayPreference.InApp;
    public DisplayPreference PaymentDueDisplay { get; set; } = DisplayPreference.Both;

    // Quiet hours
    public bool QuietHoursEnabled { get; set; }
    public TimeOnly? QuietHoursStart { get; set; }
    public TimeOnly? QuietHoursEnd { get; set; }
    public string? QuietHoursTimezone { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

**File**: `Notification.Domain/Enums/NotificationPriority.cs`

```csharp
namespace Notification.Domain.Entities;

public enum NotificationPriority
{
    Low,
    Normal,
    High,
    Urgent
}
```

**File**: `Notification.Domain/Enums/DisplayPreference.cs`

```csharp
namespace Notification.Domain.Entities;

public enum DisplayPreference
{
    None,
    InApp,
    OsNotification,
    Both
}
```

**File**: `Notification.Infrastructure/Data/NotificationDbContext.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Notification.Domain.Entities;

namespace Notification.Infrastructure.Data;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options)
        : base(options)
    {
    }

    public DbSet<NotificationEntity> Notifications => Set<NotificationEntity>();
    public DbSet<NotificationPreference> Preferences => Set<NotificationPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NotificationDbContext).Assembly);
    }
}
```

**File**: `Notification.Infrastructure/Data/Configurations/NotificationConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Notification.Domain.Entities;

namespace Notification.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<NotificationEntity>
{
    public void Configure(EntityTypeBuilder<NotificationEntity> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Type).IsRequired().HasMaxLength(50);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.ActionUrl).HasMaxLength(500);
        builder.Property(n => n.Icon).HasMaxLength(100);
        builder.Property(n => n.Category).HasMaxLength(50);
        builder.Property(n => n.DeliveryChannel).HasMaxLength(20);
        builder.Property(n => n.DeliverySkippedReason).HasMaxLength(100);

        builder.Property(n => n.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Indexes
        builder.HasIndex(n => new { n.UserId, n.CreatedAt })
            .IsDescending(false, true);

        builder.HasIndex(n => new { n.UserId, n.IsRead })
            .HasFilter("\"IsRead\" = false");

        builder.HasIndex(n => n.TenantId);

        builder.HasIndex(n => n.ExpiresAt)
            .HasFilter("\"ExpiresAt\" IS NOT NULL");
    }
}
```

**File**: `Notification.Infrastructure/Data/Configurations/PreferenceConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Notification.Domain.Entities;

namespace Notification.Infrastructure.Data.Configurations;

public class PreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("preferences");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.QuietHoursTimezone).HasMaxLength(50);

        builder.Property(p => p.QuestionnaireSubmittedDisplay)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.TemplateUpdatedDisplay)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.UserInvitedDisplay)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.MenuUpdatedDisplay)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.PaymentDueDisplay)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Unique constraint
        builder.HasIndex(p => new { p.TenantId, p.UserId })
            .IsUnique();
    }
}
```

**Verification**:
- [ ] `dotnet build` succeeds
- [ ] All entities properly configured

---

### Task 0.4: Create Initial EF Migration

**Commands**:

```powershell
cd C:\desktopContents\projects\SaaS\NotificationService\Notification\src\Notification.Infrastructure

# Create initial migration
dotnet ef migrations add InitialCreate --startup-project ../Notification.Web --context NotificationDbContext

# Verify migration files created in Migrations folder
```

**Verification**:
- [ ] Migration file created in `Notification.Infrastructure/Migrations/`
- [ ] Migration includes both tables (notifications, preferences)
- [ ] Migration includes all indexes and constraints

---

### Task 0.5: Create docker-compose.yml for NotificationService

**File**: `NotificationService/docker-compose.yml`

```yaml
version: '3.8'

services:
  notification-db:
    image: postgres:16
    container_name: NotificationDB
    environment:
      - POSTGRES_USER=NotificationDB
      - POSTGRES_PASSWORD=NotificationDB
      - POSTGRES_DB=NotificationDB
    ports:
      - "5436:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U NotificationDB -d NotificationDB"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - notification-db-data:/var/lib/postgresql/data
    networks:
      - notification-network

  rabbitmq:
    image: rabbitmq:3-management
    container_name: NotificationRabbitMQ
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - notification-network

  redis:
    image: redis:7-alpine
    container_name: NotificationRedis
    ports:
      - "6379:6379"
    command: redis-server --appendonly no --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - notification-network

volumes:
  notification-db-data:
  rabbitmq-data:

networks:
  notification-network:
    driver: bridge
```

**Verification**:
- [ ] `docker-compose up -d` starts all services
- [ ] All health checks pass: `docker-compose ps`
- [ ] No port conflicts

---

### Task 0.6: Create appsettings.json with Connection Strings

**File**: `Notification.Web/appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "PostgresConnection": "Host=localhost;Port=5436;Database=NotificationDB;Username=NotificationDB;Password=NotificationDB",
    "Redis": "localhost:6379"
  },
  "RabbitMQ": {
    "Host": "localhost",
    "VirtualHost": "/",
    "Username": "guest",
    "Password": "guest"
  },
  "Jwt": {
    "Authority": "https://identity.dloizides.com/realms/OnlineMenu",
    "Audience": "notification-api"
  }
}
```

**File**: `Notification.Web/appsettings.Development.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "PostgresConnection": "Host=localhost;Port=5436;Database=NotificationDB;Username=NotificationDB;Password=NotificationDB",
    "Redis": "localhost:6379"
  },
  "RabbitMQ": {
    "Host": "localhost",
    "VirtualHost": "/",
    "Username": "guest",
    "Password": "guest"
  },
  "Cors": {
    "Origins": [
      "http://localhost:8082",
      "http://localhost:8081",
      "http://localhost:19006",
      "https://localhost:5006",
      "https://localhost:5004"
    ]
  }
}
```

---

### Task 0.7: Create Program.cs with Health Checks

**File**: `Notification.Web/Program.cs`

```csharp
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Notification.Infrastructure.Data;
using StackExchange.Redis;
using MassTransit;
using System.Text.Json;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext with EF
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// Add Redis for SignalR backplane
var redisConnectionString = builder.Configuration.GetConnectionString("Redis")!;
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(redisConnectionString));

// Add SignalR with Redis backplane
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnectionString, options =>
    {
        options.Configuration.ChannelPrefix = RedisChannel.Literal("NotificationHub");
    });

// Add MassTransit with RabbitMQ
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitConfig = builder.Configuration.GetSection("RabbitMQ");
        cfg.Host(rabbitConfig["Host"], rabbitConfig["VirtualHost"], h =>
        {
            h.Username(rabbitConfig["Username"]!);
            h.Password(rabbitConfig["Password"]!);
        });

        cfg.ConfigureEndpoints(context);
    });
});

// Add JWT Authentication with Keycloak role mapping
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();

        // Map Keycloak realm_access.roles to standard role claims
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                if (context.Principal?.Identity is ClaimsIdentity identity)
                {
                    var realmAccessClaim = context.Principal.FindFirst("realm_access");
                    if (realmAccessClaim != null)
                    {
                        var realmAccess = JsonDocument.Parse(realmAccessClaim.Value);
                        if (realmAccess.RootElement.TryGetProperty("roles", out var roles))
                        {
                            foreach (var role in roles.EnumerateArray())
                            {
                                identity.AddClaim(new Claim(ClaimTypes.Role, role.GetString()!));
                            }
                        }
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
            ?? new[] { "http://localhost:8082" };
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Required for SignalR
    });
});

// Add FastEndpoints
builder.Services.AddFastEndpoints();

// Add Swagger
builder.Services.SwaggerDocument(o =>
{
    o.DocumentSettings = s =>
    {
        s.Title = "Notification Service API";
        s.Version = "v1";
    };
});

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(
        builder.Configuration.GetConnectionString("PostgresConnection")!,
        name: "postgres",
        tags: new[] { "db", "ready" })
    .AddRedis(
        redisConnectionString,
        name: "redis",
        tags: new[] { "cache", "ready" })
    .AddRabbitMQ(
        new Uri($"amqp://{builder.Configuration["RabbitMQ:Username"]}:{builder.Configuration["RabbitMQ:Password"]}@{builder.Configuration["RabbitMQ:Host"]}"),
        name: "rabbitmq",
        tags: new[] { "messaging", "ready" });

var app = builder.Build();

// Apply migrations on startup (development only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    db.Database.Migrate();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.UseFastEndpoints();
app.UseSwaggerGen();

// Map SignalR hub
// app.MapHub<NotificationHub>("/notificationhub"); // Uncomment in Phase 1

// Health check endpoints (same pattern as other services)
app.MapHealthChecks("/health/start", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // Always returns healthy - just checks if app started
});

app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => !check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.Run();
```

**Verification**:
- [ ] `dotnet build` succeeds
- [ ] `dotnet run` starts without errors
- [ ] Health endpoints respond:
  - `curl http://localhost:5015/health/start`
  - `curl http://localhost:5015/health/live`
  - `curl http://localhost:5015/health/ready`

---

### Task 0.8: Configure Launch Settings

**File**: `Notification.Web/Properties/launchSettings.json`

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:5015",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "https://localhost:5014;http://localhost:5015",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

---

### Task 0.9: Create GitHub Repository (Private)

**Commands**:

```powershell
cd C:\desktopContents\projects\SaaS\NotificationService

# Initialize git
git init

# Create .gitignore
@"
## .NET
bin/
obj/
*.user
*.suo
*.cache
*.log

## IDE
.vs/
.idea/
*.swp

## Environment
appsettings.Local.json
*.local.json

## Docker
docker-compose.override.yml
"@ | Out-File -FilePath .gitignore -Encoding utf8

# Create initial README
@"
# NotificationService

Real-time notification service for the SaaS platform.

## Features

- SignalR WebSocket hub for real-time notifications
- RabbitMQ message consumption from other services
- Redis backplane for horizontal scaling
- PostgreSQL for notification history and preferences

## Ports

| Service | Port |
|---------|------|
| API (HTTP) | 5015 |
| API (HTTPS) | 5014 |
| PostgreSQL | 5436 |

## Quick Start

\`\`\`bash
# Start infrastructure
docker-compose up -d

# Run service
cd Notification/src/Notification.Web
dotnet run
\`\`\`

## Health Checks

- Startup: http://localhost:5015/health/start
- Liveness: http://localhost:5015/health/live
- Readiness: http://localhost:5015/health/ready
"@ | Out-File -FilePath README.md -Encoding utf8

# Add all files and commit
git add .
git commit -m "Initial NotificationService setup with Clean Architecture

- Domain entities (Notification, NotificationPreference)
- EF Core DbContext with PostgreSQL
- FastEndpoints + Swagger
- SignalR with Redis backplane
- MassTransit with RabbitMQ
- Health checks (postgres, redis, rabbitmq)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Create private GitHub repo
gh repo create openmindednewby/NotificationService --private --source=. --push
```

**Verification**:
- [ ] Repository created at `https://github.com/openmindednewby/NotificationService`
- [ ] All code pushed to main branch
- [ ] Repository is private

---

### Task 0.10: Update DATABASE-PORTS.md

**File**: `C:\desktopContents\projects\SaaS\DATABASE-PORTS.md`

Add the following entry:

```markdown
| 5436 | NotificationService | NotificationDB | NotificationDB |
```

And update the next available port note:
```markdown
2. **Next available DB port**: **5437**
```

**Also update OnlineMenuSaaS/README.md** with:
- NotificationService API port: 5014/5015
- NotificationDB port: 5436
- Health check endpoints

---

### Task 0.11: Add E2E Health Check Tests

**File**: `E2ETests/tests/health/notification-service.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5015';

test.describe('NotificationService Health Checks', () => {
  test('startup probe should return healthy', async ({ request }) => {
    const response = await request.get(`${NOTIFICATION_SERVICE_URL}/health/start`);
    expect(response.status()).toBe(200);
  });

  test('liveness probe should return healthy', async ({ request }) => {
    const response = await request.get(`${NOTIFICATION_SERVICE_URL}/health/live`);
    expect(response.status()).toBe(200);
  });

  test('readiness probe should return healthy when dependencies are up', async ({ request }) => {
    const response = await request.get(`${NOTIFICATION_SERVICE_URL}/health/ready`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('Healthy');
  });
});
```

**Verification**:
- [ ] Tests pass: `npx playwright test tests/health/notification-service.spec.ts`

---

## Quality Gates

Before marking Phase 0 complete:

- [ ] NotificationService project created with Clean Architecture
- [ ] All NuGet packages installed and restored
- [ ] EF DbContext and entities configured
- [ ] Initial EF migration created
- [ ] docker-compose.yml working (DB, RabbitMQ, Redis)
- [ ] Service starts and health checks pass
- [ ] GitHub repository created (private)
- [ ] DATABASE-PORTS.md updated
- [ ] E2E health check tests pass
- [ ] `dotnet build` - no errors
- [ ] `dotnet test` - all tests pass

---

## Outputs

Upon completion, the following will be available:

| Service | Port | Purpose |
|---------|------|---------|
| NotificationService API (HTTP) | 5015 | REST API |
| NotificationService API (HTTPS) | 5014 | REST API (secure) |
| PostgreSQL (NotificationDB) | 5436 | Notification database |
| RabbitMQ AMQP | 5672 | Message broker |
| RabbitMQ Management | 15672 | Admin UI |
| Redis | 6379 | SignalR backplane + cache |

---

## Connection Strings for Phase 1

- **PostgreSQL**: `Host=localhost;Port=5436;Database=NotificationDB;Username=NotificationDB;Password=NotificationDB`
- **Redis**: `localhost:6379`
- **RabbitMQ**: `amqp://guest:guest@localhost:5672`

---

## Next Phase

After completing Phase 0, proceed to:
- **[Phase 1: Backend Core](../../TODO/notification-service/phase-1-backend-core.md)** - Implement SignalR Hub and RabbitMQ consumers

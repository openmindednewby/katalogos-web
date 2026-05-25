# Architecture Patterns & Implementation Guide

> **Purpose**: This document defines HOW features are implemented in this SaaS codebase. All agents and reviewers must ensure new code follows these established patterns.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Backend Patterns](#backend-patterns)
3. [Frontend Patterns](#frontend-patterns)
4. [Multi-Tenancy Pattern](#multi-tenancy-pattern)
5. [API Hooks Generation](#api-hooks-generation)
6. [Cross-Cutting Packages](#cross-cutting-packages)
7. [Testing Patterns](#testing-patterns)
8. [Reference Implementations](#reference-implementations)

---

## Project Structure

### Monorepo Layout

```
SaaS/
├── BaseClient/                    # React Native/Expo Frontend
├── E2ETests/                      # Playwright E2E Tests
├── Services/                      # Microservices
│   ├── IdentityService/          # Authentication & User Management
│   ├── QuestionerService/        # Quiz/Questionnaire Domain
│   ├── OnlineMenuSaaS/           # Menu Management Domain
│   ├── ContentService/           # File/Media Storage
│   ├── NotificationService/      # Real-time Notifications & Email
│   └── PaymentService/           # Stripe Subscriptions & Billing
├── NuGetPackages/                # Shared .NET Packages
├── NpmPackages/                  # Shared npm Packages (@dloizides/*)
├── SyncfusionThemeStudio/        # Admin Portal (Vite/React)
├── TenantThemeEditor/            # Tenant Theme Editor (Vite/React)
├── Tiltfile                      # Local Development Orchestration
├── CLAUDE.md                     # AI Coding Instructions
└── docs/
    └── ARCHITECTURE_PATTERNS.md  # This file
```

### Service Structure (Standard Template)

Every microservice follows this Clean Architecture structure:

```
ServiceName/
├── src/
│   ├── ServiceName.Web/           # API Layer (FastEndpoints)
│   │   ├── DomainName/            # Endpoints organized by domain (NOT flat Endpoints/)
│   │   │   ├── Create.cs
│   │   │   ├── List.cs
│   │   │   ├── GetById.cs
│   │   │   └── Delete.cs
│   │   ├── Hubs/                  # SignalR hubs (if applicable)
│   │   ├── Services/              # Service implementations
│   │   ├── GlobalUsings.cs
│   │   ├── Program.cs             # DI, middleware, configuration
│   │   └── appsettings.json
│   ├── ServiceName.UseCases/      # Application Layer (CQRS)
│   │   ├── [Feature]/
│   │   │   ├── Commands/          # Write operations
│   │   │   │   └── Create[Entity]/
│   │   │   │       ├── Create[Entity]Command.cs
│   │   │   │       └── Create[Entity]Handler.cs
│   │   │   ├── Queries/           # Read operations
│   │   │   │   └── List[Entity]/
│   │   │   │       ├── List[Entity]Query.cs
│   │   │   │       └── List[Entity]Handler.cs
│   │   │   └── DTOs/
│   │   └── ServiceUseCasesServiceExtensions.cs
│   ├── ServiceName.Core/          # Domain Layer
│   │   ├── Entities/              # Domain entities (Aggregates)
│   │   ├── Specifications/        # Query specifications
│   │   └── Interfaces/            # Repository interfaces
│   └── ServiceName.Infrastructure/ # Infrastructure Layer
│       ├── Data/
│       │   ├── AppDbContext.cs    # EF Core DbContext
│       │   ├── EfRepository.cs    # Generic repository
│       │   └── Migrations/
│       └── ServiceInfrastructureExtensions.cs
├── tests/
│   ├── ServiceName.UnitTests/
│   ├── ServiceName.FunctionalTests/
│   └── ServiceName.IntegrationTests/
└── docker-compose.yml
```

---

## Backend Patterns

### Pattern 1: Clean Architecture Layers

**Dependency Direction**: Dependencies point INWARD only.

```
Web → UseCases → Core ← Infrastructure
```

**Rules**:
- Core has ZERO external dependencies (only DomainCore package)
- UseCases depends only on Core
- Infrastructure implements Core interfaces
- Web orchestrates via dependency injection

### Pattern 2: CQRS with MediatR

All operations follow Command Query Responsibility Segregation:

**Command (Write Operation)**:
```csharp
// File: UseCases/Templates/Commands/CreateTemplate/CreateTemplateCommand.cs
public record CreateTemplateCommand(string Name, string Description) : IRequest<Result<Guid>>;

// File: UseCases/Templates/Commands/CreateTemplate/CreateTemplateHandler.cs
public class CreateTemplateHandler : IRequestHandler<CreateTemplateCommand, Result<Guid>>
{
    private readonly IRepository<Template> _repository;

    public CreateTemplateHandler(IRepository<Template> repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateTemplateCommand request, CancellationToken ct)
    {
        var template = new Template(request.Name, request.Description);
        await _repository.AddAsync(template, ct);
        return Result.Success(template.ExternalId);
    }
}
```

**Query (Read Operation)**:
```csharp
// File: UseCases/Templates/Queries/ListTemplates/ListTemplatesQuery.cs
public record ListTemplatesQuery : IRequest<Result<IEnumerable<TemplateDto>>>;

// File: UseCases/Templates/Queries/ListTemplates/ListTemplatesHandler.cs
public class ListTemplatesHandler : IRequestHandler<ListTemplatesQuery, Result<IEnumerable<TemplateDto>>>
{
    private readonly IReadRepository<Template> _repository;

    public async Task<Result<IEnumerable<TemplateDto>>> Handle(ListTemplatesQuery request, CancellationToken ct)
    {
        var templates = await _repository.ListAsync(ct);
        return Result.Success(templates.Select(t => new TemplateDto(t)));
    }
}
```

### Pattern 3: FastEndpoints API

Use FastEndpoints instead of MVC Controllers. **Organize endpoints in domain folders with simple names.**

**Folder Structure (REQUIRED)**:
```
ServiceName.Web/
├── DomainName/              # e.g., Templates, Notifications
│   ├── Create.cs            # POST endpoint
│   ├── Delete.cs            # DELETE endpoint
│   ├── GetById.cs           # GET by ID endpoint
│   ├── List.cs              # GET list endpoint
│   └── Update.cs            # PUT endpoint
├── AnotherDomain/
│   ├── Get.cs
│   └── Update.cs
├── Hubs/                    # SignalR hubs (if applicable)
├── Services/                # Service implementations
└── Program.cs
```

**❌ WRONG - Flat Endpoints folder**:
```
Endpoints/
├── GetTemplatesEndpoint.cs
├── CreateTemplateEndpoint.cs
└── DeleteTemplateEndpoint.cs
```

**✅ CORRECT - Domain folders with simple names**:
```
Templates/
├── List.cs
├── Create.cs
├── GetById.cs
└── Delete.cs
```

**Endpoint Pattern (use primary constructor)**:
```csharp
// File: Web/Templates/Create.cs
namespace ServiceName.Web.Templates;

public class Create(IMediator mediator)
    : Endpoint<CreateTemplateRequest, CreateTemplateResponse>
{
    public override void Configure()
    {
        Post(CreateTemplateRoute.Route);
        Roles("Admin", "User");
    }

    public override async Task HandleAsync(CreateTemplateRequest req, CancellationToken ct)
    {
        var command = new CreateTemplateCommand(req.Name, req.Description);
        var result = await mediator.Send(command, ct);

        if (result.IsSuccess)
            Response = new CreateTemplateResponse(result.Value);
        else
            await SendErrorsAsync(cancellation: ct);
    }
}

public record CreateTemplateRequest(string Name, string Description);
public record CreateTemplateResponse(Guid Id);
public static class CreateTemplateRoute
{
    public const string Route = "/api/templates";
}
```

### Pattern 4: Entity Framework Repositories

Use the generic repository with specifications:

```csharp
// Registration in ServiceInfrastructureExtensions.cs
services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
services.AddScoped(typeof(IReadRepository<>), typeof(EfRepository<>));

// Usage in handlers
public class GetActiveTemplatesHandler : IRequestHandler<GetActiveTemplatesQuery, Result<IEnumerable<TemplateDto>>>
{
    private readonly IReadRepository<Template> _repository;

    public async Task<Result<IEnumerable<TemplateDto>>> Handle(GetActiveTemplatesQuery request, CancellationToken ct)
    {
        var spec = new ActiveTemplatesSpec(); // Specification pattern
        var templates = await _repository.ListAsync(spec, ct);
        return Result.Success(templates.Select(t => new TemplateDto(t)));
    }
}
```

### Pattern 5: Result Pattern

Always return `Result<T>` from handlers, never throw exceptions for business logic:

```csharp
// Using Ardalis.Result
public async Task<Result<Guid>> Handle(CreateTemplateCommand request, CancellationToken ct)
{
    // Validation failure
    if (string.IsNullOrEmpty(request.Name))
        return Result.Invalid(new ValidationError("Name is required"));

    // Not found
    var existing = await _repository.GetByNameAsync(request.Name);
    if (existing != null)
        return Result.Conflict("Template with this name already exists");

    // Success
    var template = new Template(request.Name);
    await _repository.AddAsync(template, ct);
    return Result.Success(template.ExternalId);
}
```

### Pattern 6: Interface Placement

**Infrastructure abstractions (interfaces for external services) MUST be in `Core/Interfaces/`**, not UseCases.

**✅ CORRECT**:
```
ServiceName.Core/
├── Entities/
├── Interfaces/
│   ├── IEmailSender.cs           # Infrastructure abstraction
│   ├── INotificationDeliveryService.cs
│   └── IExternalApiClient.cs
└── Common/
    └── IBaseRepository.cs
```

**❌ WRONG**:
```
ServiceName.UseCases/
├── Contracts/                     # DON'T put infrastructure interfaces here
│   └── INotificationDeliveryService.cs
```

**Why?** Clean Architecture dictates that:
- Core defines the contracts (interfaces)
- Infrastructure/Web implements them
- This allows UseCases to depend on Core abstractions, not implementations

**Reference Services**:
- `QuestionerService/Questioner/src/Questioner.Core/Interfaces/IEmailSender.cs`
- `OnlineMenuService/OnlineMenu/src/OnlineMenu.Core/Interfaces/IEmailSender.cs`

### Pattern 7: Health Checks

**ALL services MUST use `ServiceDefaults.HealthChecks`**. Do NOT create custom `HealthEndpoint.cs` files.

**✅ CORRECT - Using ServiceDefaults**:
```csharp
// Program.cs
using ServiceDefaults.HealthChecks;

builder.AddServiceDefaults();  // Adds postgres health check from config

var app = builder.Build();

// ... middleware ...

app.MapHealthCheckEndpoints();  // Maps /health/live, /health/start, /health/ready
app.MarkAsReady();  // Signals app is ready to serve traffic

await app.RunAsync();
```

**❌ WRONG - Custom HealthEndpoint**:
```csharp
// DON'T create Web/Endpoints/HealthEndpoint.cs
public class HealthEndpoint : EndpointWithoutRequest<HealthResponse>
{
    // This is redundant!
}
```

**Health Check Endpoints (provided by ServiceDefaults)**:
| Endpoint | Purpose |
|----------|---------|
| `/health/live` | Liveness probe - service is running |
| `/health/start` | Startup probe - service initialized |
| `/health/ready` | Readiness probe - service ready for traffic |

---

## Multi-Tenancy Pattern

### Critical: Automatic Tenant Filtering

**ALL tenant-scoped entities MUST inherit from `BaseTenantEntity`**:

```csharp
// In DomainCore package
public abstract class BaseTenantEntity : BaseEntity
{
    public Guid TenantId { get; protected set; }
    public Guid UserId { get; protected set; }
}

// Your entity
public class Template : BaseTenantEntity, IAggregateRoot
{
    public string Name { get; private set; }
    // ...
}
```

### AppDbContext Configuration

Every service's `AppDbContext` MUST apply tenant filtering:

```csharp
public class AppDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;

    public AppDbContext(DbContextOptions options, ICurrentTenantService currentTenantService)
        : base(options)
    {
        _currentTenantService = currentTenantService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply global query filter for ALL tenant entities
        SetTenantFilter<Template>(modelBuilder);
        SetTenantFilter<Question>(modelBuilder);
        // Add all tenant entities...
    }

    private void SetTenantFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : BaseTenantEntity
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e =>
            _currentTenantService.TenantId == null || // SuperUser bypass
            e.TenantId == _currentTenantService.TenantId);
    }
}
```

### Tenant Resolution

Tenant is resolved from JWT claims in `ICurrentTenantService`:

```csharp
// In NuGetPackages/MultiTenancy.EntityFrameworkCore
public class CurrentTenantService : ICurrentTenantService
{
    public Guid? TenantId { get; }
    public Guid? UserId { get; }

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        TenantId = user?.FindFirst("tenant_id")?.Value is string tid ? Guid.Parse(tid) : null;
        UserId = user?.FindFirst("user_id")?.Value is string uid ? Guid.Parse(uid) : null;
    }
}
```

---

## Frontend Patterns

### Pattern 1: Component Structure

Follow this exact order in components:

```typescript
const MyComponent = memo(() => {
  // 1. Global state (Redux)
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  // 2. TanStack Query hooks (generated)
  const { data, isLoading } = useListTemplates();
  const { mutate: createTemplate } = useCreateTemplate();

  // 3. Local state
  const [isOpen, setIsOpen] = useState(false);

  // 4. Other hooks
  const { t } = useTranslation();
  const navigation = useNavigation();

  // 5. Derived values
  const templates = data?.items ?? [];

  // 6. Effects
  useEffect(() => {
    // ...
  }, []);

  // 7. Handlers
  function handleCreate() {
    createTemplate({ name: 'New Template' });
  }

  // 8. Early returns
  if (isLoading) return <LoadingSpinner />;

  // 9. Render
  return (
    <View>
      {/* ... */}
    </View>
  );
});
```

### Pattern 2: API Hooks (Generated)

**NEVER write API hooks manually**. Use Orval-generated hooks:

```typescript
// CORRECT: Import from generated hooks
import { useListTemplates, useCreateTemplate } from '@/server/autoGeneratedHooks/questioner';

// WRONG: Manual API calls
const fetchTemplates = async () => {
  const response = await axios.get('/api/templates');
  return response.data;
};
```

### Pattern 3: Test IDs

All interactive elements MUST have `testID`:

```typescript
// In BaseClient/src/shared/testIds.ts
export const TestIds = {
  TEMPLATE_CREATE_BUTTON: 'template-create-button',
  TEMPLATE_NAME_INPUT: 'template-name-input',
  TEMPLATE_SAVE_BUTTON: 'template-save-button',
};

// In component
<TouchableOpacity
  testID={TestIds.TEMPLATE_CREATE_BUTTON}
  accessibilityLabel="Create template"
  accessibilityHint="Opens the create template form"
  onPress={handleCreate}
>
```

### Pattern 4: Localization

All user-facing text MUST use i18n:

```typescript
// CORRECT
const { t } = useTranslation();
<Text>{t('templates.createButton')}</Text>

// WRONG
<Text>Create Template</Text>
```

---

## API Hooks Generation

### When to Regenerate

Regenerate hooks when:
- Backend endpoint changes
- New endpoint added
- DTO structure changes

### How to Regenerate

```bash
cd BaseClient
npm run generate:hooks
```

### What Gets Generated

```
src/server/autoGeneratedHooks/
├── identity/           # IdentityService hooks
│   ├── auth/
│   ├── users/
│   └── tenants/
├── questioner/         # QuestionerService hooks
│   ├── templates/
│   └── submissions/
├── onlinemenu/         # OnlineMenuService hooks
│   └── tenantmenus/
└── content/            # ContentService hooks
    └── files/
```

### Hook Usage Pattern

```typescript
// Query (GET)
const { data, isLoading, error, refetch } = useListTemplates();

// Mutation (POST/PUT/DELETE)
const { mutate, isPending } = useCreateTemplate({
  onSuccess: (data) => {
    showNotification('success', t('template.created'));
    queryClient.invalidateQueries(['templates']);
  },
  onError: (error) => {
    showNotification('error', error.message);
  },
});
```

---

## Cross-Cutting Packages

### When to Create a NuGet Package

Create a shared NuGet package when:
- Functionality is needed by 2+ services
- It's a cross-cutting concern (logging, auth, tenancy)
- It provides infrastructure abstractions

### Existing NuGet Packages

| Package | Purpose | Used By |
|---------|---------|---------|
| `DomainCore` | Base entities (`BaseEntity`, `BaseTenantEntity`), domain events, `IAggregateRoot` | All services |
| `Identity.Keycloak` | Keycloak JWT integration, role mapping | All services |
| `Security.Claims` | Claims extraction (`CurrentTenantService`) | All services |
| `ServiceDefaults.HealthChecks` | Health check endpoints (`/health/live`, `/ready`, `/start`) | All services |
| `Logging.Client` | Structured logging (Serilog + Loki sink), Sentry integration | All services |
| `RateLimiting.Defaults` | Sliding-window rate limit policies (Auth, Api, Public, Upload) | All services |
| `DLoizides.Validation` | FluentValidation base classes, shared validators | All services |
| `Messaging.RabbitMq.Core` | MassTransit + RabbitMQ setup, `INotificationEventPublisher` | All services |
| `Messaging.Contracts` | Cross-service event contracts (`UserDeletedEvent`, GDPR events) | All services |
| `NotificationService.Contracts` | Notification event contracts (`MenuUpdatedEvent`, etc.) | OnlineMenu, Questioner, Payment |
| `Storage.S3` | S3-compatible storage abstraction (SeaweedFS/AWS/MinIO) | ContentService |
| `Metrics.Client` | Prometheus HTTP metrics middleware (`prometheus-net.AspNetCore`) | All services |
| `Email.Abstractions` | `IEmailService`, `IEmailTemplateRenderer` (zero-dep) | IdentityService |
| `Email.Smtp` | MailKit SMTP implementation, `EmbeddedResourceTemplateRenderer` | IdentityService |
| `Notifications` | Twilio SMS integration | IdentityService |
| `OtpAuthentication` | OTP handling | IdentityService |

### Creating a New Package

1. Create folder in `NuGetPackages/`
2. Follow existing package structure
3. Add to solution
4. Reference from services via project reference (local) or NuGet feed (production)

### When to Create an npm Package

Create a shared npm package when:
- Functionality is needed by frontend + E2E tests
- Shared types/constants (like `testIds`)

### Existing npm Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@dloizides/utils` | `NpmPackages/packages/utils/` | Shared utility functions (100% coverage) |
| `@dloizides/notification-client` | `NpmPackages/packages/notification-client/` | SignalR notification client SDK (81.8% coverage) |
| `testIds` | `BaseClient/src/shared/` & `E2ETests/shared/` | Shared test identifiers (synced between frontend and E2E) |

---

## Testing Patterns

### Unit Tests (Jest/xUnit)

**Focus on LOGIC, not rendering**:

```typescript
// GOOD: Tests business logic
it('should call onSuccess when template is created', async () => {
  const onSuccess = jest.fn();
  mockMutate.mockImplementation((_, options) => {
    options?.onSuccess?.({ id: '123' });
  });

  renderHook(() => useCreateTemplateWithCallback({ onSuccess }));
  // Trigger the mutation...

  expect(onSuccess).toHaveBeenCalledWith({ id: '123' });
});

// BAD: Tests rendering (belongs in E2E)
it('renders a button', () => {
  render(<CreateButton />);
  expect(screen.getByText('Create')).toBeTruthy();
});
```

### E2E Tests (Playwright)

**Test through the UI, never bypass**:

```typescript
// GOOD: Tests through UI
test('should create template', async ({ page }) => {
  const templatesPage = new TemplatesPage(page);
  await templatesPage.goto();
  await templatesPage.createTemplate('My Template');
  await templatesPage.expectTemplateInList('My Template');
});

// BAD: Bypasses UI
test('should create template', async ({ page }) => {
  await fetch('/api/templates', { method: 'POST', body: '...' }); // NO!
  await templatesPage.expectTemplateInList('My Template');
});
```

---

## Reference Implementations

### Gold Standard: QuestionerService

The QuestionerService is the most complete implementation. Use as reference for:
- Clean Architecture structure
- CQRS handlers
- Multi-tenancy
- Unit tests

**Key Files**:
- `Questioner/src/Questioner.Web/Endpoints/` - FastEndpoints examples
- `Questioner/src/Questioner.UseCases/QuestionerTemplates/` - CQRS examples
- `Questioner/src/Questioner.Core/QuestionerTemplateAggregate/` - Domain entities
- `Questioner/src/Questioner.Infrastructure/Data/AppDbContext.cs` - Tenant filtering

### Gold Standard: Template CRUD (Frontend)

For frontend patterns, reference:
- `BaseClient/src/components/questioner/templates/` - Component structure
- `BaseClient/src/lib/hooks/questioner/` - Custom hooks wrapping generated hooks
- `E2ETests/tests/questioner/templates/` - E2E test patterns

---

## Compliance Checklist

### For New Backend Features

- [ ] Follows Clean Architecture layer separation
- [ ] Uses CQRS (Command/Query + Handler)
- [ ] Uses FastEndpoints (not MVC Controllers)
- [ ] **Endpoints in domain folders** (e.g., `Templates/Create.cs`, NOT `Endpoints/CreateTemplateEndpoint.cs`)
- [ ] **Endpoints use primary constructors** (e.g., `public class Create(IMediator mediator)`)
- [ ] **Infrastructure interfaces in `Core/Interfaces/`** (NOT `UseCases/Contracts/`)
- [ ] Entity inherits from `BaseTenantEntity` (if tenant-scoped)
- [ ] Uses `Result<T>` pattern (not exceptions for business logic)
- [ ] Tenant filtering configured in `AppDbContext`
- [ ] **Uses `ServiceDefaults.HealthChecks`** (NO custom HealthEndpoint.cs)
- [ ] Has unit tests for handlers
- [ ] OpenAPI spec updated for hook generation

### For New Frontend Features

- [ ] Component follows structure order (Redux → Query → State → etc.)
- [ ] Uses generated API hooks (not manual fetch)
- [ ] All text uses i18n
- [ ] All interactive elements have `testID`
- [ ] All TouchableOpacity have `accessibilityHint`
- [ ] No hardcoded colors (use theme)
- [ ] Has unit tests for logic (not rendering)

### For New Services

- [ ] Follows standard service structure
- [ ] Uses shared NuGet packages
- [ ] Implements multi-tenancy
- [ ] Has docker-compose.yml
- [ ] Added to Tiltfile
- [ ] Swagger configured for hook generation
- [ ] Added to API_HOOKS_GUIDE.md

---

## Reviewer Notes

**CRITICAL**: When reviewing new backend services or features, **always verify cross-service consistency**:

### 1. Endpoint Structure Consistency

Compare the new service's Web layer with reference services:
- `QuestionerService/Questioner/src/Questioner.Web/QuestionerTemplates/` - Domain folders ✅
- `OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/TenantMenus/` - Domain folders ✅

**Reject if**:
- Endpoints are in a flat `Endpoints/` folder
- Endpoint class names have "Endpoint" suffix (e.g., `GetNotificationsEndpoint`)
- Endpoints use field injection instead of primary constructors

### 2. Health Check Consistency

All services MUST use the same health check pattern:
```csharp
builder.AddServiceDefaults();
// ...
app.MapHealthCheckEndpoints();
app.MarkAsReady();
```

**Reject if**:
- Service has a custom `HealthEndpoint.cs` file
- Service doesn't call `app.MapHealthCheckEndpoints()`
- Service doesn't call `app.MarkAsReady()`

### 3. Interface Placement Consistency

All infrastructure abstractions must be in `Core/Interfaces/`:
- `QuestionerService/Questioner/src/Questioner.Core/Interfaces/IEmailSender.cs` ✅
- `NotificationService/Notification/src/Notification.Core/Interfaces/INotificationDeliveryService.cs` ✅

**Reject if**:
- Interfaces are in `UseCases/Contracts/` or similar non-Core location
- Infrastructure implementation interfaces are defined in the Web layer

### 4. Quick Reference Commands

To verify structure consistency:
```bash
# Check endpoint structure
find ServiceName/src/ServiceName.Web -name "*.cs" ! -path "*/obj/*" | grep -v Program | grep -v GlobalUsings

# Check for HealthEndpoint (should NOT exist)
find ServiceName/src/ServiceName.Web -name "HealthEndpoint.cs"

# Check interface placement
find ServiceName/src/ServiceName.Core/Interfaces -name "I*.cs"
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](../CLAUDE.md) | AI agent instructions |
| [react-code-standards.md](../BaseClient/docs/react-code-standards.md) | Frontend coding standards |
| [API_HOOKS_GUIDE.md](../BaseClient/docs/API_HOOKS_GUIDE.md) | Hook generation guide |
| [UNIVERSAL-CSHARP-AI-INSTRUCTIONS.md](../UNIVERSAL-CSHARP-AI-INSTRUCTIONS.md) | Backend coding standards |
| [playwright-best-practices.md](../E2ETests/docs/playwright-best-practices.md) | E2E testing standards |

---

*Document Version: 1.0*
*Created: 2026-01-26*

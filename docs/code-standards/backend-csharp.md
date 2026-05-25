# Universal C# AI Coding Instructions

> General-purpose instructions for AI assistants working with C# codebases using Clean Architecture, CQRS, and modern .NET practices.

---

## Overview

These instructions provide comprehensive guidance for generating production-quality C# code following industry best practices. Use these patterns for any C# project requiring Clean Architecture, CQRS, or Domain-Driven Design approaches.

**Key Technologies:**
- .NET 6+ / .NET Core
- C# 10+
- ASP.NET Core
- MediatR (CQRS)
- Entity Framework Core
- FluentValidation
- AutoMapper
- xUnit / NUnit
- Moq
- Shouldly / FluentAssertions

---

## Part 1: Clean Architecture Implementation

### Layer Separation

Follow strict layer separation with dependencies pointing inward:

```
┌─────────────────────────────────────┐
│     Presentation Layer (API/UI)     │  Controllers, Middleware, DI setup
├─────────────────────────────────────┤
│     Application Layer               │  Use cases, CQRS handlers, DTOs
│     - Features/                     │  Commands, Queries, Validators
├─────────────────────────────────────┤
│     Domain Layer                    │  Entities, Value Objects, Aggregates
│     (Zero dependencies)             │  Business logic, Domain events
├─────────────────────────────────────┤
│     Infrastructure Layer            │  Repositories, External Services
│                                     │  Database, APIs, File system
└─────────────────────────────────────┘
```

**Dependency Rules:**
- ✅ Domain layer has ZERO external dependencies
- ✅ Application layer depends only on Domain
- ✅ Infrastructure implements Application interfaces
- ✅ Presentation layer orchestrates via dependency injection
- ❌ Never let inner layers depend on outer layers

### Domain Layer Structure

```csharp
// Base Entity
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime? DateCreated { get; set; }
    public DateTime? DateModified { get; set; }
    public string? CreatedBy { get; set; }
    public string? ModifiedBy { get; set; }
}

// Domain Entity
public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

// Value Object (record for immutability)
public record Money(decimal Amount, string Currency);

// Domain Event
public class OrderPlacedEvent : INotification
{
    public int OrderId { get; set; }
    public DateTime PlacedAt { get; set; }
}
```

---

## Part 2: CQRS with MediatR

### Command Pattern (Mutates State)

```csharp
// 1. Command - Naming: [Action][Entity]Command.cs
public class CreateOrderCommand : IRequest<int>
{
    public string CustomerName { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
}

// 2. Validator - Naming: [Command]Validator.cs
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    private readonly IOrderRepository _orderRepository;

    public CreateOrderCommandValidator(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;

        RuleFor(p => p.CustomerName)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .MaximumLength(100).WithMessage("{PropertyName} must not exceed {MaxLength} characters.");

        RuleFor(p => p.TotalAmount)
            .GreaterThan(0).WithMessage("{PropertyName} must be greater than zero.");

        RuleFor(p => p.Items)
            .NotEmpty().WithMessage("Order must contain at least one item.");

        // Async validation for business rules
        RuleFor(p => p)
            .MustAsync(ValidateOrderRules)
            .WithMessage("Order validation failed.");
    }

    private async Task<bool> ValidateOrderRules(CreateOrderCommand command, CancellationToken ct)
    {
        // Business rule validation (e.g., check inventory, credit limit)
        return await Task.FromResult(true);
    }
}

// 3. Handler - Naming: [Command]Handler.cs
public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, int>
{
    private readonly IMapper _mapper;
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<CreateOrderCommandHandler> _logger;

    public CreateOrderCommandHandler(
        IMapper mapper,
        IOrderRepository orderRepository,
        ILogger<CreateOrderCommandHandler> logger)
    {
        _mapper = mapper;
        _orderRepository = orderRepository;
        _logger = logger;
    }

    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate
        var validator = new CreateOrderCommandValidator(_orderRepository);
        var validationResult = await validator.ValidateAsync(request, cancellationToken);

        if (validationResult.Errors.Any())
            throw new BadRequestException("Invalid Order", validationResult);

        // 2. Map to domain entity
        var order = _mapper.Map<Order>(request);

        // 3. Execute business logic
        order.Status = OrderStatus.Pending;
        order.DateCreated = DateTime.UtcNow;

        // 4. Persist
        await _orderRepository.CreateAsync(order);

        // 5. Log
        _logger.LogInformation("Order {OrderId} created successfully", order.Id);

        return order.Id;
    }
}
```

### Query Pattern (Reads Data)

```csharp
// 1. Query - Naming: Get[Entity][Details/List]Query.cs
public class GetOrderDetailsQuery : IRequest<OrderDetailDto>
{
    public int OrderId { get; set; }
}

// 2. Handler - Always return DTOs, never domain entities
public class GetOrderDetailsQueryHandler : IRequestHandler<GetOrderDetailsQuery, OrderDetailDto>
{
    private readonly IMapper _mapper;
    private readonly IOrderRepository _orderRepository;

    public GetOrderDetailsQueryHandler(IMapper mapper, IOrderRepository orderRepository)
    {
        _mapper = mapper;
        _orderRepository = orderRepository;
    }

    public async Task<OrderDetailDto> Handle(GetOrderDetailsQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId);

        if (order == null)
            throw new NotFoundException(nameof(Order), request.OrderId);

        return _mapper.Map<OrderDetailDto>(order);
    }
}

// 3. DTO - Naming: [Entity]Dto.cs, [Entity]DetailDto.cs
public class OrderDetailDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
}
```

---

## Part 3: Repository Pattern

### Generic Repository

```csharp
// Generic repository interface
public interface IGenericRepository<T> where T : BaseEntity
{
    Task<IReadOnlyList<T>> GetAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T> CreateAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}

// Specialized repository extends generic
public interface IOrderRepository : IGenericRepository<Order>
{
    Task<Order?> GetByOrderNumberAsync(string orderNumber);
    Task<List<Order>> GetOrdersByCustomerAsync(string customerId);
    Task<bool> OrderExistsAsync(string orderNumber);
}

// Implementation
public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
    }

    public async Task<List<Order>> GetOrdersByCustomerAsync(string customerId)
    {
        return await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.DateCreated)
            .ToListAsync();
    }

    public async Task<bool> OrderExistsAsync(string orderNumber)
    {
        return await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber);
    }
}
```

---

## Part 4: Dependency Injection

### Service Registration

```csharp
// Pattern: [Layer]ServiceRegistration.cs
public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        return services;
    }
}

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IOrderRepository, OrderRepository>();

        return services;
    }
}

// Usage in Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
```

### Constructor Injection

```csharp
public class OrderService
{
    // Use readonly fields for all injected dependencies
    private readonly IMapper _mapper;
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<OrderService> _logger;
    private readonly IMediator _mediator;

    // Constructor injection (never property injection)
    public OrderService(
        IMapper mapper,
        IOrderRepository orderRepository,
        ILogger<OrderService> logger,
        IMediator mediator)
    {
        _mapper = mapper;
        _orderRepository = orderRepository;
        _logger = logger;
        _mediator = mediator;
    }
}
```

**Service Lifetimes:**
- **Singleton**: Stateless services, shared state (cache managers, configuration)
- **Scoped**: Per-request state (DbContext, repositories, unit of work)
- **Transient**: Lightweight, stateless operations (validators, mappers)

---

## Part 5: Exception Handling

### Custom Exceptions

```csharp
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, ValidationResult validationResult) : base(message)
    {
        ValidationErrors = new List<string>();
        foreach (var error in validationResult.Errors)
        {
            ValidationErrors.Add(error.ErrorMessage);
        }
    }

    public List<string> ValidationErrors { get; set; } = new();
}

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"{name} ({key}) was not found")
    {
    }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
```

### Global Exception Middleware

```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(httpContext, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext httpContext, Exception ex)
    {
        HttpStatusCode statusCode;
        ProblemDetails problem;

        switch (ex)
        {
            case BadRequestException badRequestException:
                statusCode = HttpStatusCode.BadRequest;
                problem = new ProblemDetails
                {
                    Title = badRequestException.Message,
                    Status = (int)statusCode,
                    Type = nameof(BadRequestException),
                    Detail = string.Join("; ", badRequestException.ValidationErrors)
                };
                break;

            case NotFoundException notFound:
                statusCode = HttpStatusCode.NotFound;
                problem = new ProblemDetails
                {
                    Title = notFound.Message,
                    Status = (int)statusCode,
                    Type = nameof(NotFoundException)
                };
                break;

            case ConflictException conflict:
                statusCode = HttpStatusCode.Conflict;
                problem = new ProblemDetails
                {
                    Title = conflict.Message,
                    Status = (int)statusCode,
                    Type = nameof(ConflictException)
                };
                break;

            default:
                statusCode = HttpStatusCode.InternalServerError;
                problem = new ProblemDetails
                {
                    Title = "An error occurred while processing your request.",
                    Status = (int)statusCode,
                    Type = nameof(HttpStatusCode.InternalServerError)
                };
                _logger.LogError(ex, "Unhandled exception occurred");
                break;
        }

        httpContext.Response.StatusCode = (int)statusCode;
        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsJsonAsync(problem);
    }
}

// Register FIRST in middleware pipeline (Program.cs)
app.UseMiddleware<ExceptionMiddleware>();
```

---

## Part 6: AutoMapper

### Mapping Profiles

```csharp
// Pattern: [Entity]Profile.cs
public class OrderProfile : Profile
{
    public OrderProfile()
    {
        // Simple mapping
        CreateMap<Order, OrderDto>().ReverseMap();
        CreateMap<Order, OrderDetailDto>();

        // Command to entity
        CreateMap<CreateOrderCommand, Order>();
        CreateMap<UpdateOrderCommand, Order>();

        // Custom mappings
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.StatusName,
                      opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ItemCount,
                      opt => opt.MapFrom(src => src.Items.Count));

        // Nested mappings
        CreateMap<OrderItem, OrderItemDto>();
    }
}
```

---

## Part 7: Testing Standards

### Unit Testing Structure

```csharp
public class CreateOrderCommandHandlerTests
{
    private readonly IMapper _mapper;
    private readonly Mock<IOrderRepository> _mockOrderRepository;
    private readonly Mock<ILogger<CreateOrderCommandHandler>> _mockLogger;

    public CreateOrderCommandHandlerTests()
    {
        // Setup mock repositories
        _mockOrderRepository = new Mock<IOrderRepository>();
        _mockLogger = new Mock<ILogger<CreateOrderCommandHandler>>();

        // Setup AutoMapper
        var mapperConfig = new MapperConfiguration(c =>
        {
            c.AddProfile<OrderProfile>();
        });
        _mapper = mapperConfig.CreateMapper();
    }

    [Fact]
    public async Task Handle_ValidOrder_ReturnsOrderId()
    {
        // Arrange
        var handler = new CreateOrderCommandHandler(
            _mapper,
            _mockOrderRepository.Object,
            _mockLogger.Object);

        var command = new CreateOrderCommand
        {
            CustomerName = "John Doe",
            TotalAmount = 100.00m,
            Items = new List<OrderItemDto>
            {
                new OrderItemDto { ProductId = 1, Quantity = 2, Price = 50.00m }
            }
        };

        _mockOrderRepository
            .Setup(r => r.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync((Order order) =>
            {
                order.Id = 1;
                return order;
            });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.ShouldBeGreaterThan(0);
        _mockOrderRepository.Verify(r => r.CreateAsync(It.IsAny<Order>()), Times.Once);
    }

    [Fact]
    public async Task Handle_InvalidOrder_ThrowsBadRequestException()
    {
        // Arrange
        var handler = new CreateOrderCommandHandler(
            _mapper,
            _mockOrderRepository.Object,
            _mockLogger.Object);

        var command = new CreateOrderCommand
        {
            CustomerName = "", // Invalid
            TotalAmount = 0,
            Items = new List<OrderItemDto>()
        };

        // Act & Assert
        await Should.ThrowAsync<BadRequestException>(async () =>
            await handler.Handle(command, CancellationToken.None));
    }
}
```

### Mock Repository Pattern

```csharp
public static class MockOrderRepository
{
    public static Mock<IOrderRepository> GetMockOrderRepository()
    {
        var orders = new List<Order>
        {
            new Order
            {
                Id = 1,
                OrderNumber = "ORD-001",
                CustomerName = "John Doe",
                TotalAmount = 100.00m,
                Status = OrderStatus.Pending
            },
            new Order
            {
                Id = 2,
                OrderNumber = "ORD-002",
                CustomerName = "Jane Smith",
                TotalAmount = 200.00m,
                Status = OrderStatus.Completed
            }
        };

        var mockRepo = new Mock<IOrderRepository>();

        mockRepo.Setup(r => r.GetAsync())
            .ReturnsAsync(orders);

        mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((int id) => orders.FirstOrDefault(o => o.Id == id));

        mockRepo.Setup(r => r.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync((Order order) =>
            {
                order.Id = orders.Max(o => o.Id) + 1;
                orders.Add(order);
                return order;
            });

        mockRepo.Setup(r => r.OrderExistsAsync(It.IsAny<string>()))
            .ReturnsAsync((string orderNumber) => orders.Any(o => o.OrderNumber == orderNumber));

        return mockRepo;
    }
}
```

---

## Part 8: Naming Conventions

### Files & Classes

**Commands & Queries:**
- Commands: `Create[Entity]Command.cs`, `Update[Entity]Command.cs`, `Delete[Entity]Command.cs`
- Queries: `Get[Entity]Query.cs`, `Get[Entity]DetailsQuery.cs`, `Get[Entity]ListQuery.cs`
- Handlers: `[CommandOrQuery]Handler.cs`

**Other Components:**
- Validators: `[Command]Validator.cs`, `[Dto]Validator.cs`
- DTOs: `[Entity]Dto.cs`, `[Entity]DetailDto.cs`, `[Entity]ListDto.cs`
- Profiles: `[Entity]Profile.cs`
- Exceptions: `[ExceptionType]Exception.cs`
- Repositories: `I[Entity]Repository.cs`, `[Entity]Repository.cs`
- Services: `I[Entity]Service.cs`, `[Entity]Service.cs`
- Tests: `[Handler]Tests.cs`, `[Service]Tests.cs`

### Methods

- PascalCase: `CreateAsync()`, `GetByIdAsync()`, `ProcessOrderAsync()`
- Async suffix: All async methods end with `Async`
- Handler method: Always `Handle(TRequest request, CancellationToken cancellationToken)`
- Test methods: `[Method]_[Scenario]_[ExpectedResult]`

### Fields & Properties

- Private readonly fields: `_mapper`, `_repository`, `_logger` (camelCase with underscore)
- Public properties: PascalCase with auto-properties
- Default values: `= string.Empty` for strings, `= new()` for collections
- Constants: `UPPER_CASE` or `PascalCase` for public constants

---

## Part 9: File Organization

```
YourProject.Application/
├── Contracts/
│   ├── Persistence/
│   │   ├── IGenericRepository.cs
│   │   └── IOrderRepository.cs
│   ├── Infrastructure/
│   │   ├── IEmailService.cs
│   │   └── IDateTimeService.cs
│   └── Identity/
│       └── IAuthService.cs
├── Features/
│   └── Orders/
│       ├── Commands/
│       │   ├── CreateOrder/
│       │   │   ├── CreateOrderCommand.cs
│       │   │   ├── CreateOrderCommandHandler.cs
│       │   │   └── CreateOrderCommandValidator.cs
│       │   ├── UpdateOrder/
│       │   └── DeleteOrder/
│       └── Queries/
│           ├── GetOrderDetails/
│           │   ├── GetOrderDetailsQuery.cs
│           │   ├── GetOrderDetailsQueryHandler.cs
│           │   └── OrderDetailDto.cs
│           └── GetOrderList/
├── DTOs/
│   ├── OrderDto.cs
│   └── OrderItemDto.cs
├── Exceptions/
│   ├── BadRequestException.cs
│   ├── NotFoundException.cs
│   └── ConflictException.cs
├── MappingProfiles/
│   └── OrderProfile.cs
└── ApplicationServiceRegistration.cs
```

---

## Part 10: Best Practices

### General Principles

- ✅ Default to minimal, composable designs with clear separation of concerns
- ✅ Prefer pure functions and small classes with single responsibilities
- ✅ Optimize for clarity: explicit names, predictable control flow
- ✅ Keep solutions framework-agnostic when possible
- ✅ Prefer immutability and explicit data flows

### Extract Complex Conditions (ENFORCED BY SONARANALYZER)

If a condition has **more than 2 conditional operators**, extract it to a named variable or method. This is enforced by SonarAnalyzer rule S1067.

```csharp
// ❌ BAD: More than 2 conditions inline (ANALYZER WARNING)
if (user != null && user.IsActive && user.HasPermission(Permission.Edit) && !user.IsLocked)
{
    // ...
}

// ✅ GOOD: Extract to named variable
var canEditResource = user != null
    && user.IsActive
    && user.HasPermission(Permission.Edit)
    && !user.IsLocked;

if (canEditResource)
{
    // ...
}

// ✅ BETTER: Extract to method for reusability
private bool CanUserEdit(User? user)
{
    return user != null
        && user.IsActive
        && user.HasPermission(Permission.Edit)
        && !user.IsLocked;
}

if (CanUserEdit(user))
{
    // ...
}
```

**Why?** Named conditions make code self-documenting and easier to debug.

### Single-Line If Statements (ENFORCED BY .EDITORCONFIG)

When an if/else statement has only a single statement in its body, write it on one line **without braces**. This is enforced by the `csharp_prefer_braces = when_multiline:warning` setting.

```csharp
// ❌ BAD: Single statement with braces (ANALYZER WARNING)
if (hasError)
{
    return BadRequest(error);
}

// ✅ GOOD: Single statement on one line
if (hasError) return BadRequest(error);

// ❌ BAD: Early return with unnecessary braces
if (request == null)
{
    throw new ArgumentNullException(nameof(request));
}

// ✅ GOOD: Single-line early return
if (request == null) throw new ArgumentNullException(nameof(request));

// ✅ GOOD: Multi-statement blocks MUST have braces
if (hasError)
{
    _logger.LogError(error, "Operation failed");
    await NotifyAdminAsync(error);
    return BadRequest(error);
}
```

**Rule:** Braces are only required when the block contains multiple statements or spans multiple lines.

### Async/Await

- ✅ Always pass `CancellationToken` through async methods
- ✅ Use `ConfigureAwait(false)` in library code to avoid context capture
- ✅ Never block on async code with `.Result` or `.Wait()`
- ✅ Use `async Task` for fire-and-forget (not `async void` except event handlers)

### Performance

- ✅ Choose algorithms for big-O impact first
- ✅ Avoid unnecessary allocations (use `Span<T>`, `Memory<T>`, `ArrayPool<T>`)
- ✅ Reuse buffers/objects when safe
- ✅ Profile before micro-optimizing

### Security

- ✅ Never log secrets, tokens, or PII
- ✅ Validate and encode all untrusted inputs (SQL injection, XSS prevention)
- ✅ Use parameterized queries with Entity Framework Core
- ✅ Store secrets in configuration (User Secrets, Key Vault, environment variables)
- ✅ Follow principle of least privilege

### Logging

```csharp
// Structured logging with named parameters
_logger.LogInformation(
    "Order {OrderId} created for customer {CustomerId} with total {TotalAmount}",
    order.Id,
    order.CustomerId,
    order.TotalAmount);

// Include correlation IDs
using (_logger.BeginScope(new Dictionary<string, object>
{
    ["CorrelationId"] = httpContext.TraceIdentifier,
    ["UserId"] = currentUser.Id
}))
{
    _logger.LogInformation("Processing order");
}
```

---

## Part 11: API Controllers

### Controller Pattern

```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize] // Apply authentication globally
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all orders
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<OrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<OrderDto>>> GetAll()
    {
        var query = new GetOrderListQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailDto>> Get(int id)
    {
        var query = new GetOrderDetailsQuery { OrderId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a new order
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> Post([FromBody] CreateOrderCommand command)
    {
        var orderId = await _mediator.Send(command);
        return CreatedAtAction(nameof(Get), new { id = orderId }, orderId);
    }

    /// <summary>
    /// Update an existing order
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Put(int id, [FromBody] UpdateOrderCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Delete an order
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        var command = new DeleteOrderCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}
```

---

## Quick Reference Checklist

### When Creating New Features:

- ☐ Identify the appropriate Clean Architecture layer
- ☐ Determine if CQRS Command (write) or Query (read)
- ☐ Create Command/Query with `IRequest<TResponse>`
- ☐ Create Handler implementing `IRequestHandler<TRequest, TResponse>`
- ☐ Create Validator using FluentValidation
- ☐ Add AutoMapper profile for entity-DTO mapping
- ☐ Create DTOs (never expose domain entities)
- ☐ Handle exceptions via custom types caught in middleware
- ☐ Use constructor injection with readonly fields
- ☐ Pass `CancellationToken` through all async methods
- ☐ Write unit tests using AAA pattern
- ☐ Add structured logging for important operations
- ☐ Document public APIs with XML comments

---

## Example: Complete Feature Implementation

### Scenario: Create Product Feature

**1. Domain Entity**
```csharp
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}
```

**2. Repository Interface**
```csharp
public interface IProductRepository : IGenericRepository<Product>
{
    Task<bool> ProductExistsAsync(string name);
}
```

**3. Command**
```csharp
public class CreateProductCommand : IRequest<int>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}
```

**4. Validator**
```csharp
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    private readonly IProductRepository _productRepository;

    public CreateProductCommandValidator(IProductRepository productRepository)
    {
        _productRepository = productRepository;

        RuleFor(p => p.Name)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .MaximumLength(200)
            .MustAsync(BeUniqueProductName).WithMessage("Product name already exists.");

        RuleFor(p => p.Price)
            .GreaterThan(0).WithMessage("{PropertyName} must be greater than zero.");

        RuleFor(p => p.StockQuantity)
            .GreaterThanOrEqualTo(0);
    }

    private async Task<bool> BeUniqueProductName(string name, CancellationToken ct)
    {
        return !await _productRepository.ProductExistsAsync(name);
    }
}
```

**5. Handler**
```csharp
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IMapper _mapper;
    private readonly IProductRepository _productRepository;
    private readonly ILogger<CreateProductCommandHandler> _logger;

    public CreateProductCommandHandler(
        IMapper mapper,
        IProductRepository productRepository,
        ILogger<CreateProductCommandHandler> logger)
    {
        _mapper = mapper;
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var validator = new CreateProductCommandValidator(_productRepository);
        var validationResult = await validator.ValidateAsync(request, cancellationToken);

        if (validationResult.Errors.Any())
            throw new BadRequestException("Invalid Product", validationResult);

        var product = _mapper.Map<Product>(request);
        await _productRepository.CreateAsync(product);

        _logger.LogInformation("Product {ProductId} created successfully", product.Id);

        return product.Id;
    }
}
```

**6. Unit Test**
```csharp
public class CreateProductCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidProduct_ReturnsProductId()
    {
        // Arrange
        var mockRepo = new Mock<IProductRepository>();
        var mapper = GetMapper();
        var logger = new Mock<ILogger<CreateProductCommandHandler>>();

        mockRepo.Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => { p.Id = 1; return p; });

        var handler = new CreateProductCommandHandler(mapper, mockRepo.Object, logger.Object);

        var command = new CreateProductCommand
        {
            Name = "Test Product",
            Description = "Test Description",
            Price = 99.99m,
            StockQuantity = 10
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.ShouldBeGreaterThan(0);
        mockRepo.Verify(r => r.CreateAsync(It.IsAny<Product>()), Times.Once);
    }
}
```

---

## Conclusion

These instructions provide a comprehensive foundation for building production-quality C# applications using Clean Architecture, CQRS, and modern .NET practices. Follow these patterns consistently to ensure maintainable, testable, and scalable code.

**Key Takeaways:**
1. ✅ Strict layer separation with dependency inversion
2. ✅ CQRS for clear separation of reads and writes
3. ✅ Repository pattern for data access abstraction
4. ✅ FluentValidation for comprehensive input validation
5. ✅ Global exception handling via middleware
6. ✅ AutoMapper for entity-DTO transformations
7. ✅ Comprehensive testing with AAA pattern
8. ✅ Structured logging with correlation IDs
9. ✅ Async/await with cancellation token support
10. ✅ Security-first mindset (no secrets, input validation, parameterized queries)

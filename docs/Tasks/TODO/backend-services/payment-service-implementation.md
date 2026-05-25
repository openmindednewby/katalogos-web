# Payment Service Implementation Plan

> **Status**: IN_PROGRESS - Phase 1+2+3 mostly COMPLETE. Remaining: billing E2E tests, Stripe test mode, SubscriptionBadge
> **Priority**: High
> **Estimated Scope**: Large (New microservice + Frontend + E2E)
> **Tracking**: See `IN_PROGRESS/payment-billing-implementation.md` for current status

---

## 1. Executive Summary

This document outlines the complete implementation plan for a Payment Service that enables monthly subscription billing for the multi-tenant SaaS platform. The service will handle pricing plans, subscription lifecycle management, automatic billing, and access control for non-paying tenants.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Tenants can view and select pricing plans | Must Have |
| FR-02 | Tenants can subscribe to a plan with payment method | Must Have |
| FR-03 | System automatically charges tenants monthly | Must Have |
| FR-04 | Failed payments trigger grace period before suspension | Must Have |
| FR-05 | Suspended tenants lose access to features | Must Have |
| FR-06 | Tenants can upgrade/downgrade plans | Should Have |
| FR-07 | Tenants can view billing history and invoices | Should Have |
| FR-08 | Super users can manage pricing plans | Should Have |
| FR-09 | System sends payment notifications (success/failure) | Should Have |
| FR-10 | Tenants can cancel subscription | Must Have |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Payment processing < 5 seconds | Performance |
| NFR-02 | PCI-DSS compliance (via payment provider) | Security |
| NFR-03 | 99.9% uptime for billing checks | Availability |
| NFR-04 | Audit trail for all payment events | Compliance |
| NFR-05 | Support for multiple currencies | Scalability |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React Native/Expo)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Pricing Page │  │ Subscription │  │   Billing    │  │   Feature    │    │
│  │              │  │    Wizard    │  │   History    │  │    Gates     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   Payment Service    │  │   Identity Service   │  │   Other Services     │
│   (NEW - Port 5008)  │  │      (Port 5002)     │  │  (Menu, Questioner)  │
│                      │  │                      │  │                      │
│  • Subscriptions     │  │  • User Management   │  │  • Check Subscription│
│  • Pricing Plans     │  │  • Tenant Config     │  │    before operations │
│  • Payments          │  │  • Auth/Keycloak     │  │                      │
│  • Scheduler         │  │                      │  │                      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
              │                                              │
              ▼                                              │
┌──────────────────────┐                                     │
│   Payment Provider   │                                     │
│   (Stripe/Paddle)    │◄────────────────────────────────────┘
│                      │   Webhooks
│  • Customer Portal   │
│  • Invoicing         │
│  • Subscriptions     │
└──────────────────────┘
              │
              ▼
┌──────────────────────┐
│    PaymentDB         │
│   (PostgreSQL)       │
│                      │
│  • Subscriptions     │
│  • PricingPlans      │
│  • Payments          │
│  • Invoices          │
└──────────────────────┘
```

### 3.2 Payment Service Internal Architecture (Clean Architecture)

```
PaymentService/
├── PaymentService.Core/              # Domain Layer
│   ├── Entities/
│   │   ├── Subscription.cs
│   │   ├── PricingPlan.cs
│   │   ├── Payment.cs
│   │   ├── Invoice.cs
│   │   └── FeatureGate.cs
│   ├── Enums/
│   │   ├── SubscriptionStatus.cs
│   │   ├── PaymentStatus.cs
│   │   └── BillingCycle.cs
│   ├── Events/
│   │   ├── SubscriptionCreatedEvent.cs
│   │   ├── PaymentSucceededEvent.cs
│   │   └── PaymentFailedEvent.cs
│   └── Interfaces/
│       ├── ISubscriptionRepository.cs
│       └── IPaymentProvider.cs
│
├── PaymentService.Infrastructure/    # Infrastructure Layer
│   ├── Data/
│   │   ├── PaymentDbContext.cs
│   │   ├── Repositories/
│   │   └── Migrations/
│   ├── PaymentProviders/
│   │   ├── StripePaymentProvider.cs
│   │   └── MockPaymentProvider.cs     # For testing
│   └── BackgroundServices/
│       └── BillingSchedulerService.cs
│
├── PaymentService.UseCases/          # Application Layer
│   ├── Commands/
│   │   ├── CreateSubscriptionCommand.cs
│   │   ├── ProcessPaymentCommand.cs
│   │   ├── CancelSubscriptionCommand.cs
│   │   └── ChangePlanCommand.cs
│   ├── Queries/
│   │   ├── GetSubscriptionQuery.cs
│   │   ├── GetPricingPlansQuery.cs
│   │   └── GetBillingHistoryQuery.cs
│   └── DTOs/
│
└── PaymentService.Web/               # Presentation Layer
    ├── Endpoints/
    │   ├── Subscriptions/
    │   ├── PricingPlans/
    │   ├── Payments/
    │   └── Webhooks/
    └── Program.cs
```

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌────────────────────────┐       ┌────────────────────────┐
│      PricingPlan       │       │     FeatureLimit       │
├────────────────────────┤       ├────────────────────────┤
│ Id (PK)                │       │ Id (PK)                │
│ ExternalId (Guid)      │───┐   │ PricingPlanId (FK)     │
│ Name                   │   │   │ FeatureCode            │
│ Description            │   │   │ LimitType              │
│ MonthlyPriceUsd        │   └──►│ LimitValue             │
│ AnnualPriceUsd         │       │ IsEnabled              │
│ Currency               │       └────────────────────────┘
│ IsActive               │
│ DisplayOrder           │
│ CreatedDate            │
│ LastUpdatedDate        │
└────────────────────────┘
           │
           │ 1:N
           ▼
┌────────────────────────┐       ┌────────────────────────┐
│     Subscription       │       │    SubscriptionEvent   │
├────────────────────────┤       ├────────────────────────┤
│ Id (PK)                │───────│ Id (PK)                │
│ ExternalId (Guid)      │ 1:N   │ SubscriptionId (FK)    │
│ TenantId (Guid)        │       │ EventType              │
│ PricingPlanId (FK)     │       │ OldStatus              │
│ Status                 │       │ NewStatus              │
│ BillingCycle           │       │ Metadata (JSON)        │
│ CurrentPeriodStart     │       │ CreatedDate            │
│ CurrentPeriodEnd       │       └────────────────────────┘
│ StripeCustomerId       │
│ StripeSubscriptionId   │
│ GracePeriodEndDate     │
│ CancellationDate       │
│ CreatedDate            │
│ LastUpdatedDate        │
└────────────────────────┘
           │
           │ 1:N
           ▼
┌────────────────────────┐
│       Payment          │
├────────────────────────┤
│ Id (PK)                │
│ ExternalId (Guid)      │
│ SubscriptionId (FK)    │
│ TenantId (Guid)        │
│ Amount                 │
│ Currency               │
│ Status                 │
│ StripePaymentIntentId  │
│ FailureReason          │
│ ProcessedDate          │
│ CreatedDate            │
└────────────────────────┘
```

### 4.2 Entity Definitions

#### Subscription Entity
```csharp
public class Subscription : BaseTenantEntity
{
    public Guid PricingPlanId { get; private set; }
    public PricingPlan PricingPlan { get; private set; }

    public SubscriptionStatus Status { get; private set; }
    public BillingCycle BillingCycle { get; private set; }

    public DateTime CurrentPeriodStart { get; private set; }
    public DateTime CurrentPeriodEnd { get; private set; }
    public DateTime? GracePeriodEndDate { get; private set; }
    public DateTime? CancellationDate { get; private set; }

    // Stripe integration
    public string? StripeCustomerId { get; private set; }
    public string? StripeSubscriptionId { get; private set; }

    // Navigation
    public ICollection<Payment> Payments { get; private set; }
    public ICollection<SubscriptionEvent> Events { get; private set; }

    // Domain methods
    public void Activate() { ... }
    public void Suspend() { ... }
    public void Cancel() { ... }
    public void ChangePlan(PricingPlan newPlan) { ... }
    public void ExtendGracePeriod(int days) { ... }
}

public enum SubscriptionStatus
{
    Trial,
    Active,
    PastDue,      // Payment failed, in grace period
    Suspended,    // Grace period expired, access revoked
    Cancelled,
    Expired
}

public enum BillingCycle
{
    Monthly,
    Annual
}
```

#### PricingPlan Entity
```csharp
public class PricingPlan : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }

    public decimal MonthlyPriceUsd { get; private set; }
    public decimal AnnualPriceUsd { get; private set; }
    public string Currency { get; private set; } = "USD";

    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Features JSON or separate table
    public ICollection<FeatureLimit> FeatureLimits { get; private set; }

    // Stripe
    public string? StripePriceIdMonthly { get; private set; }
    public string? StripePriceIdAnnual { get; private set; }
}

public class FeatureLimit
{
    public int Id { get; private set; }
    public Guid PricingPlanId { get; private set; }

    public string FeatureCode { get; private set; }  // e.g., "menus", "templates", "api_calls"
    public LimitType LimitType { get; private set; }
    public int? LimitValue { get; private set; }      // null = unlimited
    public bool IsEnabled { get; private set; }
}

public enum LimitType
{
    Count,          // Max items (e.g., 5 menus)
    Boolean,        // Feature on/off
    Unlimited       // No limit
}
```

---

## 5. Pricing Tiers (Implemented)

| Tier | Monthly | Annual | Features |
|------|---------|--------|----------|
| **Free** | $0 | $0 | 1 menu, 10 items, basic themes, watermark |
| **Pro** | $29 | $290 | Unlimited menus/items, all themes, custom domain, analytics, no watermark |
| **Enterprise** | $99 | $990 | Everything in Pro + multi-location, API access, white-label |

### Feature Matrix (Implemented as FeatureLimit seed data)

| Feature Code | Free | Pro | Enterprise |
|-------------|------|-----|------------|
| `menus` | Count: 1 | Unlimited | Unlimited |
| `menu_items` | Count: 10 | Unlimited | Unlimited |
| `themes` | Enabled | Enabled | Enabled |
| `watermark` | Enabled (shown) | Disabled (hidden) | Disabled (hidden) |
| `custom_domain` | Disabled | Enabled | Enabled |
| `analytics` | Disabled | Enabled | Enabled |
| `api_access` | Disabled | Disabled | Enabled |
| `white_label` | Disabled | Disabled | Enabled |
| `multi_location` | Disabled | Disabled | Enabled |

---

## 6. Payment Provider Integration (Stripe Recommended)

### 6.1 Why Stripe?

| Criteria | Stripe | Paddle | PayPal |
|----------|--------|--------|--------|
| Subscription support | ✅ Native | ✅ Native | ⚠️ Limited |
| PCI compliance | ✅ Full | ✅ Full | ✅ Full |
| Webhook reliability | ✅ Excellent | ✅ Good | ⚠️ Moderate |
| Developer experience | ✅ Excellent | ✅ Good | ⚠️ Complex |
| Multi-currency | ✅ 135+ | ✅ Good | ✅ Good |
| Pricing | 2.9% + $0.30 | 5% + $0.50 | 2.9% + $0.30 |
| .NET SDK | ✅ Official | ✅ Community | ✅ Official |

**Recommendation**: Use **Stripe** for its superior developer experience, native subscription support, and robust webhook system.

### 6.2 Stripe Integration Points

```csharp
public interface IPaymentProvider
{
    // Customer Management
    Task<string> CreateCustomerAsync(Guid tenantId, string email, string name);
    Task UpdateCustomerAsync(string customerId, CustomerUpdateDto dto);

    // Subscription Management
    Task<SubscriptionResult> CreateSubscriptionAsync(CreateSubscriptionDto dto);
    Task<SubscriptionResult> UpdateSubscriptionAsync(string subscriptionId, UpdateSubscriptionDto dto);
    Task CancelSubscriptionAsync(string subscriptionId, bool immediate = false);

    // Payment Methods
    Task<string> CreateSetupIntentAsync(string customerId);
    Task AttachPaymentMethodAsync(string customerId, string paymentMethodId);

    // Billing Portal
    Task<string> CreateBillingPortalSessionAsync(string customerId, string returnUrl);

    // Invoices
    Task<InvoiceResult> GetUpcomingInvoiceAsync(string customerId);
    Task<IEnumerable<InvoiceResult>> GetInvoiceHistoryAsync(string customerId);
}
```

### 6.3 Webhook Events to Handle

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Record subscription in database |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Mark as cancelled |
| `invoice.payment_succeeded` | Record payment, extend period |
| `invoice.payment_failed` | Start grace period, notify tenant |
| `invoice.upcoming` | Send reminder notification |
| `customer.subscription.trial_will_end` | Notify about trial ending |

---

## 7. Subscription Lifecycle

### 7.1 State Machine

```
                    ┌───────────────┐
                    │     START     │
                    └───────┬───────┘
                            │ signup
                            ▼
┌───────────────────────────────────────────────────────────┐
│                         TRIAL                              │
│  (Optional: 14-day free trial of Professional features)   │
└───────────────────────────┬───────────────────────────────┘
                            │ payment_succeeded OR trial_end + free_plan
                            ▼
┌───────────────────────────────────────────────────────────┐
│                        ACTIVE                              │
│  (Full access to subscribed features)                     │
└─────────┬─────────────────┬───────────────────────────────┘
          │                 │
          │ payment_failed  │ cancel_requested
          ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│    PAST_DUE     │  │    CANCELLED    │
│ (Grace period:  │  │ (Access until   │
│  7 days)        │  │  period end)    │
└────────┬────────┘  └────────┬────────┘
         │                    │
         │ grace_expired      │ period_end
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   SUSPENDED     │  │     EXPIRED     │
│ (No access,     │  │ (Downgrade to   │
│  data retained) │  │  Free plan)     │
└─────────────────┘  └─────────────────┘
```

### 7.2 Grace Period Logic

```csharp
public class GracePeriodPolicy
{
    public const int GracePeriodDays = 7;
    public const int MaxRetryAttempts = 3;
    public static readonly int[] RetryIntervalsHours = { 24, 48, 72 };

    public bool ShouldSuspend(Subscription subscription)
    {
        if (subscription.Status != SubscriptionStatus.PastDue)
            return false;

        if (subscription.GracePeriodEndDate == null)
            return false;

        return DateTime.UtcNow > subscription.GracePeriodEndDate;
    }
}
```

---

## 8. Background Scheduler Service

### 8.1 Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| ProcessDueSubscriptions | Every hour | Identify subscriptions due for renewal |
| RetryFailedPayments | Every 6 hours | Retry failed payments (up to 3 times) |
| SuspendExpiredGracePeriods | Every hour | Suspend subscriptions past grace period |
| SendPaymentReminders | Daily at 9 AM | Send reminders 3 days before billing |
| CleanupExpiredTrials | Daily at midnight | Convert or downgrade expired trials |

### 8.2 Scheduler Implementation

```csharp
public class BillingSchedulerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BillingSchedulerService> _logger;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessDueSubscriptionsAsync();
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task ProcessDueSubscriptionsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        // Get all subscriptions where CurrentPeriodEnd is approaching
        var command = new ProcessDueSubscriptionsCommand
        {
            ProcessDate = DateTime.UtcNow
        };

        await mediator.Send(command);
    }
}
```

---

## 9. Feature Gating (Access Control)

### 9.1 Middleware Approach

```csharp
public class SubscriptionValidationMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context, ISubscriptionService subscriptionService)
    {
        var tenantId = context.GetTenantId();

        if (tenantId == null)
        {
            await _next(context);
            return;
        }

        var subscription = await subscriptionService.GetActiveSubscriptionAsync(tenantId.Value);

        if (subscription == null || subscription.Status == SubscriptionStatus.Suspended)
        {
            context.Response.StatusCode = 402; // Payment Required
            await context.Response.WriteAsJsonAsync(new
            {
                error = "subscription_required",
                message = "Active subscription required to access this resource"
            });
            return;
        }

        // Add subscription info to HttpContext for use in endpoints
        context.Items["Subscription"] = subscription;

        await _next(context);
    }
}
```

### 9.2 Feature Gate Service

```csharp
public interface IFeatureGateService
{
    Task<bool> CanAccessFeatureAsync(Guid tenantId, string featureCode);
    Task<int?> GetFeatureLimitAsync(Guid tenantId, string featureCode);
    Task<FeatureUsage> GetFeatureUsageAsync(Guid tenantId, string featureCode);
}

public class FeatureGateService : IFeatureGateService
{
    public async Task<bool> CanAccessFeatureAsync(Guid tenantId, string featureCode)
    {
        var subscription = await GetSubscriptionAsync(tenantId);
        var plan = subscription?.PricingPlan;

        if (plan == null)
            return IsInFreeTier(featureCode);

        var limit = plan.FeatureLimits.FirstOrDefault(f => f.FeatureCode == featureCode);
        return limit?.IsEnabled ?? false;
    }

    public async Task<int?> GetFeatureLimitAsync(Guid tenantId, string featureCode)
    {
        var subscription = await GetSubscriptionAsync(tenantId);
        var limit = subscription?.PricingPlan?.FeatureLimits
            .FirstOrDefault(f => f.FeatureCode == featureCode);

        if (limit?.LimitType == LimitType.Unlimited)
            return null; // No limit

        return limit?.LimitValue;
    }
}
```

### 9.3 Usage in Endpoints

```csharp
public class CreateTenantMenuEndpoint : Endpoint<CreateMenuRequest, CreateMenuResponse>
{
    private readonly IFeatureGateService _featureGate;
    private readonly IMediator _mediator;

    public override async Task HandleAsync(CreateMenuRequest req, CancellationToken ct)
    {
        var tenantId = HttpContext.GetTenantId();

        // Check feature limit
        var menuLimit = await _featureGate.GetFeatureLimitAsync(tenantId, "menus");
        var currentMenuCount = await _mediator.Send(new GetMenuCountQuery(tenantId));

        if (menuLimit.HasValue && currentMenuCount >= menuLimit.Value)
        {
            await SendAsync(new CreateMenuResponse
            {
                Success = false,
                Error = "limit_reached",
                Message = $"Your plan allows up to {menuLimit} menus. Upgrade to create more."
            }, 403);
            return;
        }

        // Proceed with creation
        var result = await _mediator.Send(new CreateMenuCommand(req));
        await SendAsync(result);
    }
}
```

---

## 10. API Endpoints

### 10.1 Subscription Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscriptions/current` | Get current tenant subscription |
| POST | `/subscriptions` | Create new subscription |
| PATCH | `/subscriptions/{id}/plan` | Change subscription plan |
| DELETE | `/subscriptions/{id}` | Cancel subscription |
| POST | `/subscriptions/{id}/resume` | Resume cancelled subscription |

### 10.2 Pricing Plan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pricing-plans` | List all active pricing plans |
| GET | `/pricing-plans/{id}` | Get plan details with features |
| POST | `/pricing-plans` | Create plan (admin only) |
| PATCH | `/pricing-plans/{id}` | Update plan (admin only) |

### 10.3 Billing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/history` | Get payment history |
| GET | `/billing/invoices/{id}` | Get specific invoice |
| GET | `/billing/upcoming` | Get upcoming invoice preview |
| POST | `/billing/portal-session` | Create Stripe billing portal session |

### 10.4 Webhook Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/stripe` | Handle Stripe webhook events |

---

## 11. Frontend Implementation

### 11.1 New Pages/Components

| Component | Location | Description |
|-----------|----------|-------------|
| `PricingPage` | `src/pages/PricingPage.tsx` | Display pricing plans for selection |
| `SubscriptionPage` | `src/pages/SubscriptionPage.tsx` | Manage current subscription |
| `BillingHistoryPage` | `src/pages/BillingHistoryPage.tsx` | View payment history |
| `CheckoutWizard` | `src/components/Checkout/` | Multi-step subscription flow |
| `PlanCard` | `src/components/PlanCard.tsx` | Display single pricing plan |
| `FeatureGate` | `src/components/FeatureGate.tsx` | Wrap components that need feature check |
| `UpgradePrompt` | `src/components/UpgradePrompt.tsx` | Show when limit reached |
| `SubscriptionBadge` | `src/components/SubscriptionBadge.tsx` | Show current plan in header |

### 11.2 React Query Hooks

```typescript
// src/lib/api/hooks/useSubscription.ts
export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => api.get<Subscription>('/subscriptions/current'),
  });
}

export function usePricingPlans() {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: () => api.get<PricingPlan[]>('/pricing-plans'),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionDto) =>
      api.post<Subscription>('/subscriptions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useFeatureLimit(featureCode: string) {
  const { data: subscription } = useCurrentSubscription();
  return useMemo(() => {
    const limit = subscription?.plan?.features?.find(
      f => f.code === featureCode
    );
    return {
      canAccess: limit?.isEnabled ?? false,
      limit: limit?.value ?? null,
      isUnlimited: limit?.type === 'unlimited',
    };
  }, [subscription, featureCode]);
}
```

### 11.3 Feature Gate Component

```tsx
// src/components/FeatureGate.tsx
interface FeatureGateProps {
  featureCode: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ featureCode, children, fallback }: FeatureGateProps) {
  const { canAccess, isLoading } = useFeatureAccess(featureCode);

  if (isLoading) return <LoadingSpinner />;

  if (!canAccess) {
    return fallback ?? <UpgradePrompt feature={featureCode} />;
  }

  return <>{children}</>;
}

// Usage:
<FeatureGate featureCode="custom_branding">
  <BrandingSettings />
</FeatureGate>
```

---

## 12. Implementation Tasks

### Phase 1: Backend Core (Week 1-2)

#### Task 1.1: Create Payment Service Project Structure
- [x] Create `PaymentService.sln` with Clean Architecture layers
- [x] Add NuGet packages (Stripe.net, MediatR, EF Core)
- [x] Configure PostgreSQL database and connection
- [x] Set up multi-tenancy with `ICurrentTenantService`
- [x] Add ServiceDefaults (health checks, logging)

#### Task 1.2: Implement Domain Entities
- [x] Create `PricingPlan` entity and configuration
- [x] Create `Subscription` entity with status management
- [x] Create `Payment` entity
- [x] Create `FeatureLimit` entity
- [x] Create `SubscriptionEvent` for audit trail
- [x] Create EF Core seed data (deterministic GUIDs, 3 tiers, 27 feature limits)

#### Task 1.3: Implement Stripe Integration
- [x] Create `IPaymentProvider` interface
- [x] Implement `StripePaymentProvider` (IOptions<StripeOptions>, Scoped lifetime)
- [ ] Implement `MockPaymentProvider` for testing
- [x] Create Stripe webhook handler (signature verification, typed JSON parsing)
- [x] Handle webhook events (payment_succeeded, payment_failed, subscription_deleted)

#### Task 1.4: Implement Core Use Cases
- [x] `CreateSubscriptionCommand` / Handler (with Stripe customer + trial support)
- [x] `CancelSubscriptionCommand` / Handler
- [x] `ChangePlanCommand` / Handler (with error on missing Stripe price)
- [x] `ProcessExpiredTrialsCommand` / Handler
- [x] `SuspendExpiredGracePeriodsCommand` / Handler
- [x] `HandleStripeWebhookCommand` / Handler (typed exception handling)
- [x] `GetCurrentSubscriptionQuery` / Handler
- [x] `GetPricingPlansQuery` / Handler
- [x] `GetBillingHistoryQuery` / Handler (server-side pagination)
- [x] `CheckFeatureAccessQuery` / Handler (CQRS-compliant)
- [x] `CreatePortalSessionCommand` / Handler (CQRS-compliant)

#### Task 1.5: Implement API Endpoints
- [x] Subscription CRUD endpoints (FastEndpoints v7, domain folders)
- [x] Pricing plans endpoints (AllowAnonymous)
- [x] Billing history endpoints
- [x] Stripe webhook endpoint (AllowAnonymous, signature verification)
- [x] Add authentication/authorization (Roles("user") on all authenticated endpoints — lowercase to match Keycloak realm roles, fixed 2026-03-19)

### Phase 2: Scheduler & Feature Gates (Week 2-3)

#### Task 2.1: Implement Background Scheduler
- [x] Create `BillingSchedulerService` (in API layer, not Infrastructure)
- [x] Implement `ProcessExpiredTrialsCommand` (converts expired trials)
- [ ] Implement `RetryFailedPaymentsJob`
- [x] Implement `SuspendExpiredGracePeriodsCommand`
- [x] Add logging and error handling

#### Task 2.2: Implement Feature Gating
- [x] Create `IFeatureGateService` interface
- [x] Implement feature limit checking (FeatureGateService in Infrastructure)
- [ ] Create middleware for subscription validation (cross-service)
- [ ] Update existing services to check subscription status
- [ ] Add 402 Payment Required responses

#### Task 2.3: Backend Unit Tests
- [x] Test subscription lifecycle transitions (12 tests)
- [x] Test payment entity (7 tests)
- [x] Test feature gate logic (16 tests)
- [x] Test scheduler jobs (6 tests)
- [x] Test webhook handling (10 tests)
- [x] Test CQRS handlers (40 tests)
- [x] Total: 115 tests, 41.88% line coverage (threshold 40% met)
- [ ] Target: 80% code coverage (stretch goal)

### Phase 3: Frontend Implementation (Week 3-4)

#### Task 3.1: Create API Hooks
- [x] `useGetCurrentSubscription` hook
- [x] `useGetPricingPlans` hook
- [x] `useCreateSubscription` mutation
- [x] `useCancelSubscription` mutation
- [x] `useCheckFeatureAccess` hook
- [x] `useGetBillingHistory` hook
- [x] `useChangePlan` mutation
- [x] `useCreatePortalSession` mutation
- [x] Replace manual hooks with Orval-generated hooks (completed in Phase 3 integration)

#### Task 3.2: Implement Pricing Page
- [x] Create `PlanComparisonSection` component with billing cycle toggle
- [x] Create `PlanComparisonCard` component with feature comparison
- [x] Add plan selection flow
- [x] Style with theme tokens (no hardcoded colors)

#### Task 3.3: Implement Subscription Management
- [x] Create `BillingSettingsScreen` component (7 sub-components)
- [x] Show current plan and status (`CurrentPlanSection`, `StatusBadge`)
- [x] Add upgrade/downgrade flow (`PlanComparisonSection`)
- [x] Add cancellation flow with confirmation (`CancelConfirmDialog`)
- [x] Create billing history table (`BillingHistoryTable`)
- [x] Stripe billing portal integration (`PaymentMethodSection`)

#### Task 3.4: Implement Feature Gates
- [x] Create `UpgradePrompt` component
- [x] Create `FreeTierWatermark` component
- [ ] Add `SubscriptionBadge` to header
- [x] Integrate feature checks into menus page (subscription gate on `handleCreate`)
- [x] Fix subscription gate to be permissive during loading/error (2026-03-19)
- [x] Fix GetCurrentSubscriptionQuery to return Pro tier in Development (2026-03-19)
- [ ] Integrate feature checks into remaining components (questioner limits, content limits)

#### Task 3.5: Frontend Unit Tests
- [x] Test billingHelpers (trial days, status keys, permissions, savings)
- [x] Test useCreateSubscription hook
- [x] Test useCancelSubscription hook
- [x] All 2704 frontend tests passing

### Phase 4: Integration & E2E (Week 4-5)

#### Task 4.1: Integration Testing
- [x] Docker deployment (docker-compose.yml, API port 5018, DB port 5437)
- [x] Tilt resources (payment-lint, payment-unit-tests, payment-unit-tests-coverage, payment-yagni)
- [ ] Test full subscription creation flow with running service
- [ ] Test payment processing with Stripe test mode
- [ ] Test webhook handling end-to-end
- [ ] Test feature gating across services

#### Task 4.2: E2E Tests (Playwright)
- [ ] Test pricing page display
- [ ] Test subscription creation flow
- [ ] Test plan upgrade flow
- [ ] Test cancellation flow
- [ ] Test feature gate blocking
- [ ] Test upgrade prompts

#### Task 4.3: Documentation
- [x] Architecture document (this file)
- [x] Task tracking document (IN_PROGRESS/payment-billing-implementation.md)
- [ ] Stripe setup guide
- [ ] Pricing plan configuration guide

---

## 13. Configuration

### 13.1 appsettings.json

```json
{
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_...",
    "WebhookSecret": "whsec_...",
    "PriceIds": {
      "StarterMonthly": "price_...",
      "StarterAnnual": "price_...",
      "ProfessionalMonthly": "price_...",
      "ProfessionalAnnual": "price_...",
      "EnterpriseMonthly": "price_...",
      "EnterpriseAnnual": "price_..."
    }
  },
  "Billing": {
    "GracePeriodDays": 7,
    "MaxRetryAttempts": 3,
    "TrialDays": 14,
    "DefaultCurrency": "USD"
  },
  "ConnectionStrings": {
    "PaymentDb": "Host=localhost;Port=5432;Database=PaymentDB;Username=postgres;Password=..."
  }
}
```

---

## 14. Success Criteria

### Must Pass Before Release
- [x] All unit tests passing (115 tests, 41.88% coverage — 40% threshold met)
- [ ] All E2E tests passing (not yet written)
- [x] Stripe integration coded (needs test mode verification with real Stripe account)
- [x] Webhook handling implemented (signature verification, typed exception handling)
- [x] Feature gates implemented (FeatureGateService + CheckFeatureAccessQuery)
- [x] Subscription lifecycle complete (Trial → Active → PastDue → Suspended/Canceled/Expired)
- [x] Billing history implemented (server-side pagination)
- [x] Grace period logic implemented (7-day grace, SuspendExpiredGracePeriodsCommand)
- [x] Scheduler implemented (BillingSchedulerService with hourly processing)

### Performance Targets
- [ ] Subscription check < 50ms
- [ ] Payment processing < 5s
- [ ] Feature gate check < 10ms
- [ ] API response times < 200ms

---

## 15. Security Considerations

1. **PCI Compliance**: All card handling through Stripe (no card data stored)
2. **Webhook Verification**: Validate Stripe signatures on all webhooks
3. **API Keys**: Store in environment variables, never in code
4. **Tenant Isolation**: Ensure subscriptions are tenant-scoped
5. **Audit Trail**: Log all subscription changes
6. **Rate Limiting**: Prevent abuse of billing endpoints

---

## 16. Rollout Plan

1. **Phase 1**: Deploy Payment Service (internal testing)
2. **Phase 2**: Enable for new signups only (Free tier)
3. **Phase 3**: Enable paid tiers for early adopters
4. **Phase 4**: Migrate existing users with grandfather pricing
5. **Phase 5**: Full production rollout

---

## 17. Resolved Questions

1. **Trial Period**: YES — 14-day free trial with Pro features. Implemented with `ProcessExpiredTrialsCommand`.
2. **Tiers**: 3 tiers (Free/Pro/Enterprise) instead of planned 4 (dropped Starter tier).
3. **Payment Provider**: Stripe — implemented with `Stripe.net` v47.4.0.
4. **Port**: API on 5018, DB on 5437 (not 5008 as originally planned).
5. **Architecture**: Clean Architecture with CQRS (MediatR), all endpoints through IMediator.

## Open Questions (Remaining)

1. **Grandfather Pricing**: How to handle existing users when we launch?
2. **Payment Methods**: Credit card only, or also PayPal/bank transfer?
3. **Invoicing**: Do we need to generate PDF invoices, or is Stripe's sufficient?
4. **Refund Policy**: What's the refund policy for downgrades/cancellations?
5. **Multi-currency**: Do we need to support currencies other than USD initially?

---

## Appendix A: Stripe Setup Checklist

- [ ] Create Stripe account
- [ ] Set up products and prices in Stripe dashboard
- [ ] Configure webhook endpoint
- [ ] Set up customer portal
- [ ] Configure tax settings (if applicable)
- [ ] Set up test mode environment
- [ ] Generate API keys
- [ ] Configure billing settings (proration, collection method)

---

## Appendix B: Related Documents

- [White Label Service Plan](./white-label-service-implementation.md)
- [Logging Service Plan](./logging-service-implementation.md)
- [Playwright Best Practices](../../E2ETests/docs/playwright-best-practices.md)

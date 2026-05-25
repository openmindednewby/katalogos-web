# API Rate Limiting

> **Status**: TODO
> **Priority**: P1 - Security
> **Estimated Scope**: Small-Medium (All Backend Services)
> **Estimated Effort**: 2-3 days

---

## 1. Problem

No rate limiting on any API endpoint. Vulnerable to:
- Credential stuffing on login endpoints
- API abuse / scraping
- DDoS at application layer
- Excessive resource consumption by single tenant

---

## 2. Solution

Use ASP.NET Core's built-in `Microsoft.AspNetCore.RateLimiting` middleware with per-endpoint policies.

### 2.1 Rate Limit Policies

| Policy | Algorithm | Limit | Window | Applied To |
|--------|-----------|-------|--------|-----------|
| `auth` | Fixed window | 10 requests | 1 minute | Login, OTP, password reset |
| `api-default` | Sliding window | 100 requests | 1 minute | All authenticated endpoints |
| `api-write` | Sliding window | 30 requests | 1 minute | POST/PUT/DELETE endpoints |
| `webhook` | Token bucket | 50 tokens, 10/sec refill | N/A | Stripe webhooks, RabbitMQ |
| `public` | Fixed window | 60 requests | 1 minute | Public menu endpoints |

### 2.2 Key Strategy

- **Authenticated users**: Rate limit by `sub` claim (user ID)
- **Unauthenticated**: Rate limit by IP address
- **Per-tenant**: Rate limit by `tenant_id` claim for tenant-wide limits

---

## 3. Implementation

### 3.1 Shared NuGet Package Extension

Add rate limiting configuration to `ServiceDefaults.HealthChecks` or create new shared extension:

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
    });

    options.AddSlidingWindowLimiter("api-default", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 4;
    });
});
```

### 3.2 Per Service

Add `app.UseRateLimiter()` in Program.cs and apply policies to endpoints.

---

## 4. Affected Services

All 5 backend services. IdentityService is highest priority (login/auth endpoints).

---

## 5. Implementation Steps

1. Add `Microsoft.AspNetCore.RateLimiting` to all services (already built-in for .NET 7+)
2. Create shared rate limiting extension method in ServiceDefaults package
3. Apply `auth` policy to IdentityService login/OTP endpoints
4. Apply `api-default` and `api-write` policies to all other endpoints
5. Apply `public` policy to public menu endpoints
6. Add `Retry-After` header to 429 responses
7. Log rate limit hits to Loki for monitoring
8. Add Grafana dashboard for rate limit metrics

---

## 6. Verification

- [ ] Login endpoint returns 429 after 10 rapid requests
- [ ] Authenticated API returns 429 after 100 requests/minute
- [ ] 429 response includes `Retry-After` header
- [ ] Rate limits are per-user (not global)
- [ ] Rate limit hits logged and visible in Grafana

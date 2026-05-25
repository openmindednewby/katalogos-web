# Public REST API Architecture for Third-Party Integrations

> **Status**: COMPLETED (2026-03-20) — API key management + 3 public endpoints implemented
> **Priority**: P2 - Phase 3 Competitive Differentiation
> **Estimated Scope**: Large (New Service + Cross-Cutting Concerns)
> **Estimated Effort**: 4-6 weeks
> **Dependencies**: API Versioning (`TODO/backend-services/api-versioning.md`), PaymentService (feature gating)
> **Related**: Webhooks (Roadmap 3.2), White-Label Service (`TODO/backend-services/white-label-service-architecture.md`)

---

## 1. Problem Statement

Third-party systems (POS terminals, delivery apps like Wolt/Uber Eats, reservation platforms, digital signage) need programmatic access to tenant menu data, order creation, and real-time menu change notifications. Currently, the only access path is through the first-party BaseClient frontend, which uses internal API contracts not designed for external consumption.

External integrators need:
- Stable, versioned endpoints that do not break without notice
- API key authentication (not user JWT tokens)
- Rate limits appropriate for machine-to-machine traffic
- Clean, well-documented request/response schemas
- Webhook notifications for real-time data sync
- SDK generation for common languages

---

## 2. Existing Architecture Summary (Research Findings)

### 2.1 Current Service Topology

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| IdentityService | 5002 | PostgreSQL (identity-db:5434) | Auth, users, tenants, themes, GDPR |
| OnlineMenuSaaS | 5006 | PostgreSQL (onlinemenu-db:5432) | Menus, categories, items, QR scans, custom domains |
| QuestionerService | (varies) | PostgreSQL | Survey templates, responses |
| ContentService | (varies) | PostgreSQL + SeaweedFS S3 | File upload/storage, image management |
| NotificationService | (varies) | PostgreSQL | Real-time notifications, preferences |
| PaymentService | 5018 | PostgreSQL (5437) | Stripe subscriptions, billing, feature limits |

All services share a Docker `saas-network`. There is no API gateway or reverse proxy aggregating them today (nginx only serves the static BaseClient frontend).

### 2.2 Authentication

- **Keycloak** as the identity provider (externally hosted at identity.dloizides.com)
- **JWT Bearer tokens** validated per-service against Keycloak authority
- Keycloak `realm_access.roles` mapped to .NET `ClaimTypes.Role`
- Roles: `superUser`, `admin`, `user`
- Multi-tenancy via `tenantId` JWT claim, extracted by `CurrentTenantService`
- No API key authentication exists today

### 2.3 API Patterns

- **FastEndpoints** framework across all services
- Route prefix: `/api/` (no version segment yet)
- Request/response DTOs as records
- FluentValidation for input validation
- MediatR (CQRS) for use-case handlers
- Swagger/OpenAPI via `FastEndpoints.Swagger` + NSwag
- Orval generates React Query hooks from Swagger JSON for the frontend

### 2.4 Rate Limiting

- `RateLimiting.Defaults` NuGet package provides 4 sliding-window policies:
  - **Auth**: 5 req/min per IP (login, OTP)
  - **Api**: 100 req/min per user/IP (CRUD endpoints)
  - **Public**: 300 req/min per IP (public-facing pages)
  - **Upload**: 10 req/min per user (file uploads)
- In-process `System.Threading.RateLimiting` (not distributed/Redis-backed)

### 2.5 Inter-Service Communication

- **RabbitMQ + MassTransit** for async events
- Shared contracts in `Messaging.Contracts` NuGet (UserDeletedEvent, UserDataExportRequest, etc.)
- Notification-specific contracts in `NotificationService.Contracts` NuGet (MenuUpdatedEvent, etc.)
- No synchronous service-to-service HTTP calls (except IdentityService BaseUrl referenced from OnlineMenu config)

### 2.6 Existing Public Endpoints

OnlineMenuSaaS already has one public (anonymous) endpoint:
- `GET /api/public/menus/{ExternalId:guid}` - returns `PublicMenuDto` (AllowAnonymous, Public rate limit)

### 2.7 PaymentService Tiers

| Tier | API Access |
|------|-----------|
| Free | No API access |
| Pro | No API access (currently) |
| Enterprise | API access included (per Roadmap) |

`FeatureLimit` entity supports `FeatureCode` + `LimitType` + `LimitValue` for fine-grained feature gating.

---

## 3. Architectural Decision: Gateway vs. Distributed Public Endpoints

### 3.1 Options Considered

#### Option A: Dedicated API Gateway Service (Recommended)

A new `PublicApiGateway` service sits in front of existing services, handling authentication, rate limiting, request routing, and response shaping for all public API traffic.

```
Third-Party Client
       |
       v
[PublicApiGateway]  <-- API key auth, rate limiting, versioning, analytics
   |        |        |
   v        v        v
[OnlineMenu] [Identity] [Content]   <-- internal services, unchanged
```

**Pros:**
- Single entry point for all external traffic -- simplifies security, monitoring, CORS
- API key management lives in one place (not scattered across 5 services)
- Can reshape internal responses into stable public DTOs (decoupled from internal schema evolution)
- Rate limiting per API key is centralized (can use Redis for distributed counters)
- API usage analytics in one place
- Internal services remain unchanged (no new auth schemes to maintain per-service)
- Version routing lives in one place

**Cons:**
- New service to build and operate (Docker container, database for API keys, deployment)
- Added latency hop (~1-5ms per request for internal HTTP call)
- Risk of becoming a monolithic bottleneck if not designed carefully

#### Option B: Public Endpoint Groups on Existing Services

Each service gets a `/api/v1/public/` route group with API key middleware.

**Pros:**
- No new service to deploy
- Direct database access (no HTTP hop)
- Faster to implement initially

**Cons:**
- API key validation logic duplicated across 5 services (or extracted to a shared NuGet, but still registered 5 times)
- Rate limiting per API key needs coordination across services (harder without centralized state)
- No single place for usage analytics
- Version management spread across services
- Every service must understand API key auth in addition to JWT auth
- Internal DTO changes can accidentally break public contracts

#### Option C: YARP (Yet Another Reverse Proxy) as Gateway

Use Microsoft's YARP library as a thin reverse-proxy in front of existing services.

**Pros:**
- Lightweight, high-performance .NET reverse proxy
- Configuration-driven routing
- Can add middleware for auth, rate limiting

**Cons:**
- Still need custom middleware for API key validation, analytics
- Limited request/response transformation capability compared to a proper gateway
- Does not solve the DTO decoupling problem
- Becomes essentially Option A but with less control

### 3.2 Decision: Option A -- Dedicated API Gateway Service

**Rationale:** The platform is multi-product (OnlineMenu, Questioner, future products). Every new product would need public API endpoints. A dedicated gateway provides a single, testable, monitorable surface for all external integrations. The ~2ms latency of an internal HTTP call is negligible for machine-to-machine integrations. The gateway also provides a natural place for API key management, usage tracking, and response caching.

**Accepted trade-offs:**
- New service to operate (mitigated by existing Docker/Tilt infrastructure patterns)
- Internal HTTP calls add slight latency (mitigated by keep-alive connections and response caching)

---

## 4. Service Architecture: PublicApiGateway

### 4.1 Project Structure (Clean Architecture, matching existing services)

```
PublicApiGateway/
  PublicApi.sln
  docker-compose.yml
  Dockerfile
  nuget.config
  src/
    PublicApi.Core/            # Domain entities, interfaces
      Entities/
        ApiKey.cs              # API key entity with tenant association
        ApiKeyScope.cs         # Scopes/permissions for each key
        UsageRecord.cs         # Per-request usage tracking
      Enums/
        ApiKeyStatus.cs        # Active, Revoked, Expired
        RateLimitTier.cs       # Standard, Pro, Enterprise
      Interfaces/
        IApiKeyRepository.cs
        IUsageTrackingService.cs
    PublicApi.Infrastructure/   # Data access, HTTP clients, caching
      Data/
        PublicApiDbContext.cs
        ApiKeyRepository.cs
      HttpClients/
        OnlineMenuClient.cs    # Typed HTTP client for OnlineMenu service
        IdentityClient.cs      # Typed HTTP client for Identity service
        ContentClient.cs       # Typed HTTP client for Content service
      Caching/
        RedisCacheService.cs   # Response caching for menu reads
      Messaging/
        WebhookDispatcher.cs   # Publishes webhook events via RabbitMQ
      UsageTracking/
        UsageTrackingService.cs
    PublicApi.UseCases/         # CQRS handlers
      Menus/
        GetMenu/
        ListMenus/
      ApiKeys/
        CreateApiKey/
        RevokeApiKey/
        ListApiKeys/
    PublicApi.Web/              # FastEndpoints, middleware, pipeline
      Middleware/
        ApiKeyAuthMiddleware.cs
        RateLimitMiddleware.cs
        UsageTrackingMiddleware.cs
      V1/                      # Version 1 endpoints
        Menus/
          GetMenu.cs
          ListMenus.cs
          GetMenuCategories.cs
          GetMenuItems.cs
        Tenants/
          GetTenantInfo.cs
        ApiKeys/
          CreateApiKey.cs       # Admin-only, JWT-authenticated
          RevokeApiKey.cs
          ListApiKeys.cs
      Program.cs
      ProgramExtensions.cs
  tests/
    PublicApi.UnitTests/
```

### 4.2 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| ApiKeyAuthMiddleware | Extract API key from `X-Api-Key` header or `?api_key=` query param, validate against DB (with Redis cache), set tenant context |
| RateLimitMiddleware | Enforce per-key rate limits using Redis sliding window counters |
| UsageTrackingMiddleware | Record each request (key ID, endpoint, status, latency) for analytics |
| V1 Endpoints | Public API endpoints that call internal services via typed HTTP clients, transform responses into stable public DTOs |
| ApiKey Management Endpoints | JWT-authenticated (admin/superUser only) endpoints for CRUD on API keys |
| WebhookDispatcher | Listens to RabbitMQ events (MenuUpdatedEvent, etc.), dispatches HTTP POST to registered webhook URLs |

### 4.3 Docker Configuration

```yaml
services:
  publicapi.gateway:
    build:
      context: .
      dockerfile: Dockerfile
    mem_limit: 512m
    cpus: 1.0
    ports:
      - "5022:8080"  # Next available port in the series
    environment:
      - ConnectionStrings__PublicApiDb=Host=publicapi-db;...
      - ConnectionStrings__Redis=redis:6379
      - InternalServices__OnlineMenu=http://project1.web:8080
      - InternalServices__Identity=http://identityservice.api:8080
      - InternalServices__Content=http://content.web:8080
      - RabbitMq__Host=rabbitmq
    networks:
      - saas-network

  publicapi-db:
    image: postgres:16
    mem_limit: 256m
    cpus: 0.25
    # ... standard postgres config
```

---

## 5. Authentication for Third Parties

### 5.1 API Key Model

```
ApiKey entity:
  Id           : int (PK)
  KeyHash      : string (SHA-256 hash of the actual key)
  KeyPrefix    : string (first 8 chars, e.g., "mk_live_a1b2c3d4", for identification)
  TenantId     : Guid (FK to tenant -- mandatory, every key belongs to a tenant)
  Name         : string (human-readable label, e.g., "POS Integration")
  Scopes       : List<ApiKeyScope> (menus:read, menus:write, orders:create, etc.)
  RateLimitTier: enum (Standard, Pro, Enterprise)
  Status       : enum (Active, Revoked, Expired)
  ExpiresAt    : DateTimeOffset? (optional expiration)
  CreatedAt    : DateTimeOffset
  LastUsedAt   : DateTimeOffset?
  CreatedByUserId : Guid
```

### 5.2 Key Format

Keys follow the format: `mk_live_{32-char-random}` (e.g., `mk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

- Prefix `mk_` identifies it as a MenuFlow key
- `live_` vs `test_` distinguishes environments
- 32 random alphanumeric characters provide 190 bits of entropy
- Only the SHA-256 hash is stored in the database; the raw key is shown once at creation

### 5.3 Authentication Flow

```
1. Client sends: GET /api/v1/menus  +  Header: X-Api-Key: mk_live_xxxxx
2. ApiKeyAuthMiddleware:
   a. Extract key from header (or query param as fallback)
   b. Hash the key with SHA-256
   c. Look up hash in Redis cache (TTL: 5 min)
   d. Cache miss → query PostgreSQL → populate cache
   e. Validate: status=Active, not expired, tenant exists
   f. Set HttpContext.Items["TenantId"] = key.TenantId
   g. Set HttpContext.Items["ApiKeyId"] = key.Id
   h. Set HttpContext.Items["Scopes"] = key.Scopes
3. Endpoint checks scope authorization (e.g., requires "menus:read")
4. Internal HTTP call includes X-Tenant-Id header for backend filtering
```

### 5.4 API Key Management Endpoints (Admin-Only, JWT-Authenticated)

These endpoints are for the first-party admin UI (BaseClient), not for public API consumers.

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/v1/api-keys` | Create new API key (returns raw key once) | JWT (admin role) |
| GET | `/api/v1/api-keys` | List tenant's API keys (prefix only, never raw key) | JWT (admin role) |
| DELETE | `/api/v1/api-keys/{id}` | Revoke an API key | JWT (admin role) |
| GET | `/api/v1/api-keys/{id}/usage` | Get usage statistics for a key | JWT (admin role) |

### 5.5 Feature Gating via PaymentService

Before processing any API-key-authenticated request, the gateway checks the tenant's subscription:

```
1. Redis-cached check: Does tenant have plan_tier >= Enterprise?
2. If not: Return 403 with body { "error": "api_access_not_included", "upgrade_url": "..." }
3. If yes: Proceed with request
```

This integrates with the existing `FeatureLimit` system by adding a feature code:
- `FeatureCode = "public_api_access"`, `LimitType = Boolean`, `IsEnabled = true/false`
- `FeatureCode = "public_api_rate_limit"`, `LimitType = Numeric`, `LimitValue = 1000` (req/min)

### 5.6 Future: OAuth2 Client Credentials

For enterprise customers who need OAuth2 (e.g., for Zapier integrations), the gateway can later support OAuth2 Client Credentials flow via Keycloak:

1. Register a Keycloak client per API integration
2. Client calls `/auth/token` with client_id + client_secret to get a JWT
3. JWT includes `tenantId` claim and scopes as audience/roles

This is Phase 2 of the auth story. API keys are Phase 1 because they are simpler for integrators.

---

## 6. Resources to Expose

### 6.1 Phase 1: Read-Only Menu Data (MVP)

| Method | Route | Description | Scope |
|--------|-------|-------------|-------|
| GET | `/api/v1/menus` | List active menus for the tenant | `menus:read` |
| GET | `/api/v1/menus/{id}` | Get menu by ID with categories and items | `menus:read` |
| GET | `/api/v1/menus/{id}/categories` | List categories for a menu | `menus:read` |
| GET | `/api/v1/menus/{id}/categories/{catId}/items` | List items in a category | `menus:read` |
| GET | `/api/v1/tenant` | Get tenant public info (name, logo, business hours) | `tenant:read` |

### 6.2 Phase 2: Write Operations

| Method | Route | Description | Scope |
|--------|-------|-------------|-------|
| PATCH | `/api/v1/menus/{id}/items/{itemId}/availability` | Toggle item availability | `menus:write` |
| PATCH | `/api/v1/menus/{id}/items/{itemId}/price` | Update item price | `menus:write` |
| POST | `/api/v1/menus/{id}/items` | Add new item to a category | `menus:write` |
| DELETE | `/api/v1/menus/{id}/items/{itemId}` | Remove an item | `menus:write` |

### 6.3 Phase 3: Orders (Future)

| Method | Route | Description | Scope |
|--------|-------|-------------|-------|
| POST | `/api/v1/orders` | Create an order (from delivery app) | `orders:create` |
| GET | `/api/v1/orders/{id}` | Get order status | `orders:read` |
| PATCH | `/api/v1/orders/{id}/status` | Update order status | `orders:write` |

### 6.4 Webhooks (Phase 2, ties to Roadmap Webhooks task)

| Method | Route | Description | Scope |
|--------|-------|-------------|-------|
| POST | `/api/v1/webhooks` | Register a webhook URL | `webhooks:manage` |
| GET | `/api/v1/webhooks` | List registered webhooks | `webhooks:manage` |
| DELETE | `/api/v1/webhooks/{id}` | Remove a webhook | `webhooks:manage` |
| POST | `/api/v1/webhooks/{id}/test` | Send a test event | `webhooks:manage` |

Webhook events dispatched:
- `menu.updated` - Menu content changed
- `menu.activated` / `menu.deactivated` - Menu status changed
- `item.availability_changed` - Item toggled available/unavailable
- `item.price_changed` - Item price updated
- `order.created` / `order.status_changed` (Phase 3)

### 6.5 Public API Response DTOs (Decoupled from Internal)

Public DTOs are intentionally different from internal DTOs to provide stability:

```csharp
// Public API DTO -- stable contract
public record PublicMenuResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; }
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public List<PublicCategoryResponse> Categories { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
    public PublicMenuLinks Links { get; init; }  // HATEOAS
}

public record PublicCategoryResponse
{
    public string Name { get; init; }
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
    public List<PublicMenuItemResponse> Items { get; init; }
    public string? ImageUrl { get; init; }  // Resolved URL, not ContentId
}

public record PublicMenuItemResponse
{
    public string Name { get; init; }
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public string? Currency { get; init; }
    public bool IsAvailable { get; init; }
    public string? ImageUrl { get; init; }  // Resolved URL, not ContentId
    public int DisplayOrder { get; init; }
    public List<string>? Tags { get; init; }
    public List<PublicBadgeResponse>? Badges { get; init; }
}
```

Key design decisions for public DTOs:
- **No internal IDs** for sub-resources (categories, items) unless needed for write operations
- **Resolved image URLs** instead of ContentService IDs (gateway resolves via ContentService)
- **Flattened styling properties are excluded** -- public API consumers want data, not CSS
- **HATEOAS links** included for discoverability

---

## 7. Rate Limiting Strategy

### 7.1 Tiered Rate Limits

| Tier | Requests/Minute | Requests/Day | Burst | Use Case |
|------|-----------------|--------------|-------|----------|
| Standard | 60 | 10,000 | 10 | Small POS integration |
| Pro | 300 | 100,000 | 30 | Delivery app sync |
| Enterprise | 1,000 | Unlimited | 100 | High-volume integrations |

Tier is determined by the `RateLimitTier` on the API key entity, which is constrained by the tenant's subscription plan.

### 7.2 Implementation: Redis Sliding Window

Unlike the existing in-process `RateLimiting.Defaults` package (which is per-instance), the public API needs distributed rate limiting because:
- Multiple gateway instances may run behind a load balancer in production
- Rate limits must be per-API-key, not per-IP

```
Redis key: ratelimit:{apiKeyId}:{window}
Algorithm: Sliding window counter using MULTI/EXEC
Headers returned:
  X-RateLimit-Limit: 300
  X-RateLimit-Remaining: 287
  X-RateLimit-Reset: 1710510000 (Unix timestamp)
  Retry-After: 42 (only on 429 responses)
```

### 7.3 Extension to RateLimiting.Defaults NuGet

Add a new policy to the existing `RateLimitPolicies` class:

```csharp
public const string PublicApi = "PublicApi";
```

But the implementation will use a Redis-backed `IRateLimiter<string>` instead of the in-process `SlidingWindowRateLimiter`, because the gateway may run multiple replicas.

### 7.4 429 Response Format

Consistent with existing `RateLimitResponse`:

```json
{
  "status": 429,
  "title": "Too Many Requests",
  "detail": "API rate limit exceeded. Your plan allows 300 requests per minute.",
  "retryAfterSeconds": 42,
  "limit": 300,
  "remaining": 0,
  "resetAt": "2026-03-15T14:30:00Z"
}
```

---

## 8. Request/Response Format Standards

### 8.1 Pagination

All list endpoints use cursor-based pagination (not offset-based, which has performance issues at scale):

```json
GET /api/v1/menus?limit=20&after=eyJpZCI6MTIzfQ

Response:
{
  "data": [ ... ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTQzfQ",
    "totalCount": 47
  }
}
```

- `limit`: Items per page (default 20, max 100)
- `after`: Opaque cursor (base64-encoded, pointing to last item of previous page)
- `totalCount`: Included only if the query is cheap (small datasets); omitted for expensive counts

### 8.2 Filtering

```
GET /api/v1/menus?active=true
GET /api/v1/menus/{id}/items?available=true&category=appetizers
```

### 8.3 Error Response Format (RFC 7807 Problem Details)

```json
{
  "type": "https://api.menuflow.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Menu with ID '550e8400-e29b-41d4-a716-446655440000' was not found.",
  "instance": "/api/v1/menus/550e8400-e29b-41d4-a716-446655440000",
  "traceId": "00-abcdef1234567890-abcdef12-01"
}
```

Standard error codes:

| Status | Type | When |
|--------|------|------|
| 400 | `/errors/validation` | Invalid request body or query params |
| 401 | `/errors/unauthorized` | Missing or invalid API key |
| 403 | `/errors/forbidden` | Valid key but insufficient scope or plan |
| 404 | `/errors/not-found` | Resource does not exist |
| 409 | `/errors/conflict` | Concurrent modification conflict |
| 429 | `/errors/rate-limit` | Rate limit exceeded |
| 500 | `/errors/internal` | Unexpected server error (no details leaked) |

### 8.4 HATEOAS (Minimal)

Include `_links` on resource responses for discoverability:

```json
{
  "id": "550e8400-...",
  "name": "Lunch Menu",
  "_links": {
    "self": { "href": "/api/v1/menus/550e8400-..." },
    "categories": { "href": "/api/v1/menus/550e8400-.../categories" },
    "tenant": { "href": "/api/v1/tenant" }
  }
}
```

This is minimal HATEOAS (links only, no embedded resources). Full HAL or JSON:API is unnecessary complexity for this use case.

### 8.5 Content Negotiation

- Request: `Content-Type: application/json` (only JSON supported)
- Response: `Content-Type: application/json; charset=utf-8`
- Unsupported Accept headers return `406 Not Acceptable`

---

## 9. API Versioning Integration

### 9.1 Relationship to Existing Versioning Task

The existing `api-versioning.md` task proposes URL-based versioning (`/api/v1/`) for internal services. The public API gateway should adopt the same strategy, applied at the gateway level:

```
Public API:   /api/v1/menus    -->  OnlineMenu internal: /api/menus  (or /api/v1/menus after versioning task)
Public API:   /api/v2/menus    -->  OnlineMenu internal: /api/v2/menus  (future)
```

The gateway decouples public API versions from internal API versions. When internal v2 ships, the gateway can serve both v1 (with backward-compatible mapping) and v2 simultaneously.

### 9.2 Version Lifecycle for Public API

| Stage | Duration | Headers |
|-------|----------|---------|
| Current | Indefinite | (none) |
| Deprecated | 12 months minimum | `Sunset: <date>`, `Deprecation: true`, `Link: <migration-guide>` |
| Retired | After sunset date | Returns `410 Gone` |

Public API deprecation windows are longer (12 months) than internal API windows (6 months) because third-party integrators have slower upgrade cycles.

### 9.3 Implementation in FastEndpoints

```csharp
app.UseFastEndpoints(config =>
{
    config.Endpoints.RoutePrefix = "api/v1";
});
```

V2 endpoints would be registered with a separate route prefix or in a separate endpoint group.

---

## 10. Swagger/OpenAPI and SDK Generation

### 10.1 Dedicated OpenAPI Spec for Public API

The gateway generates its own OpenAPI spec, separate from internal service specs:

```csharp
builder.Services.SwaggerDocument(o =>
{
    o.DocumentSettings = s =>
    {
        s.Title = "MenuFlow Public API";
        s.Version = "v1";
        s.Description = "REST API for third-party integrations with MenuFlow";
    };
    // Include API key auth scheme
    o.DocumentSettings = s => s.AddAuth("apiKey", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.ApiKey,
        In = OpenApiSecurityApiKeyLocation.Header,
        Name = "X-Api-Key"
    });
});
```

### 10.2 SDK Generation

The existing Orval setup (in `BaseClient/orval.config.js`) generates React Query hooks from OpenAPI specs. The same pattern extends to public API SDKs:

| Language | Tool | Output |
|----------|------|--------|
| TypeScript | Orval or openapi-typescript-codegen | `@menuflow/api-client` npm package |
| Python | openapi-generator | `menuflow-python` PyPI package |
| C# | NSwag or Kiota | `MenuFlow.ApiClient` NuGet package |
| Go | oapi-codegen | `menuflow-go` module |

Orval is already proven in the codebase and can generate the TypeScript SDK. For other languages, `openapi-generator-cli` is the standard tool.

### 10.3 SDK Distribution

- TypeScript SDK published to npm as `@menuflow/api-client`
- SDKs generated in CI from the OpenAPI spec (single source of truth)
- SDK version tracks API version (v1.x.x)

---

## 11. Webhook Integration

### 11.1 Architecture

```
[OnlineMenuSaaS] -- publishes MenuUpdatedEvent --> [RabbitMQ]
                                                        |
                                                        v
                                              [PublicApiGateway]
                                              WebhookDispatcher consumer
                                                        |
                                                        v
                                              For each registered webhook:
                                                POST https://partner.com/webhook
                                                {
                                                  "event": "menu.updated",
                                                  "data": { ... },
                                                  "timestamp": "2026-03-15T...",
                                                  "webhookId": "wh_xxx"
                                                }
```

### 11.2 Webhook Delivery Guarantees

- **At-least-once delivery** with exponential backoff retry (1s, 30s, 5min, 30min, 2hr, 12hr)
- **HMAC-SHA256 signature** in `X-Webhook-Signature` header (secret per webhook registration)
- **Timeout**: 10 second response timeout per delivery attempt
- **Dead letter**: After 6 failed attempts, event is logged and tenant admin is notified
- **Idempotency**: Each event includes a unique `eventId` (UUID) for consumer deduplication

### 11.3 Webhook Entity

```
WebhookRegistration:
  Id          : int
  TenantId    : Guid
  Url         : string (HTTPS required in production)
  Secret      : string (for HMAC signing)
  Events      : List<string> (e.g., ["menu.updated", "item.availability_changed"])
  IsActive    : bool
  CreatedAt   : DateTimeOffset
```

---

## 12. Monitoring and Analytics

### 12.1 API Usage Tracking

Every request through the gateway is logged to a `UsageRecord` table:

```
UsageRecord:
  Id          : bigint (auto-increment)
  ApiKeyId    : int
  TenantId    : Guid
  Endpoint    : string ("/api/v1/menus")
  Method      : string ("GET")
  StatusCode  : int (200)
  LatencyMs   : int
  RequestedAt : DateTimeOffset
```

This table is write-heavy and append-only. It will be partitioned by month and have old partitions archived or aggregated.

### 12.2 Grafana Dashboards

Integrate with existing Prometheus/Grafana observability stack:

- **Requests per minute** by API key / tenant / endpoint
- **Error rate** (4xx, 5xx) by endpoint
- **P50/P95/P99 latency** by endpoint
- **Rate limit hits** (429 count) by API key
- **Top consumers** by request volume
- **Webhook delivery success rate** and retry count

### 12.3 Structured Logging

Uses the existing `Logging.Client` NuGet for Loki integration:

```csharp
builder.AddStructuredLogging(opts =>
{
    opts.ServiceName = "PublicApiGateway";
    opts.LokiUrl = builder.Configuration["Logging:LokiUrl"] ?? "http://loki:3100";
});
```

Log enrichment includes `ApiKeyId`, `TenantId`, `ApiVersion`, and `CorrelationId` on every request.

---

## 13. Security Considerations

### 13.1 OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| A01 Broken Access Control | API key scopes enforced per-endpoint; tenant isolation via TenantId on key |
| A02 Cryptographic Failures | API keys hashed with SHA-256; webhook secrets stored encrypted; TLS enforced |
| A03 Injection | FluentValidation on all inputs; parameterized queries via EF Core |
| A04 Insecure Design | Minimal data exposure (no internal IDs, no styling data); response DTOs are purpose-built |
| A05 Security Misconfiguration | CORS disabled for API key auth (no browser usage expected); HTTPS only in production |
| A06 Vulnerable Components | Dependabot + `frontend-security-audit` / `{service}-security-audit` Tilt resources |
| A07 Authentication Failures | API keys expire; rate limiting on key creation; brute force protected by key length (190 bits) |
| A08 Data Integrity Failures | Webhook signatures (HMAC-SHA256); request signing for write operations |
| A09 Logging & Monitoring | Every request logged; anomaly detection via Grafana alerts |
| A10 SSRF | Webhook URLs validated (no internal IPs, no localhost, no private ranges) |

### 13.2 Tenant Isolation

This is the most critical security requirement. Every API key is bound to exactly one tenant. The gateway MUST NOT allow any cross-tenant data access:

1. API key has `TenantId` -- set at creation, immutable
2. All internal service calls include `X-Tenant-Id` header
3. Internal services apply tenant filtering via existing `CurrentTenantService` / `BaseTenantEntity` query filters
4. No endpoint accepts a tenant ID as a URL/body parameter -- it is always derived from the API key

### 13.3 API Key Security

- Raw keys shown exactly once (at creation) -- only hash stored
- Keys prefixed with `mk_live_` or `mk_test_` for environment identification
- Key rotation: Create new key, update integration, revoke old key (no in-place rotation to avoid downtime)
- IP allowlisting (Phase 2): Optional per-key IP whitelist for Enterprise tier

---

## 14. Infrastructure Integration

### 14.1 Redis Usage

The gateway relies on Redis (already in the infrastructure) for:

1. **API key cache**: Avoids DB lookup on every request (TTL: 5 min, invalidated on revoke)
2. **Rate limit counters**: Distributed sliding window per API key
3. **Response cache**: Menu data cache (TTL: 60s, invalidated on MenuUpdatedEvent via RabbitMQ)

Redis connection string from existing infrastructure: `redis:6379`

### 14.2 RabbitMQ Usage

The gateway consumes existing events and publishes webhook dispatch events:

**Consumes:**
- `MenuUpdatedEvent` (from NotificationService.Contracts) -- triggers webhook dispatch
- `UserDeletedEvent` (from Messaging.Contracts) -- revokes API keys for deleted users

**Publishes:**
- `WebhookDispatchEvent` (new contract) -- internal event for webhook retry queue

### 14.3 Nginx / Reverse Proxy

In production, nginx or a cloud load balancer sits in front of the gateway:

```nginx
upstream publicapi {
    server publicapi.gateway:8080;
}

server {
    listen 443 ssl;
    server_name api.menuflow.com;

    location /api/ {
        proxy_pass http://publicapi;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The `UseForwardedHeaders()` middleware must be configured so rate limiting uses the real client IP (as noted in the `RateLimitingExtensions` documentation).

### 14.4 Tilt Resources

```python
# PublicApiGateway
dc_resource('publicapi.gateway', trigger_mode=TRIGGER_MODE_MANUAL, labels=['api'])
local_resource('publicapi-lint', cmd='...', trigger_mode=TRIGGER_MODE_MANUAL, labels=['quality'])
local_resource('publicapi-unit-tests', cmd='...', trigger_mode=TRIGGER_MODE_MANUAL, labels=['quality'])
local_resource('publicapi-api', cmd='...', trigger_mode=TRIGGER_MODE_MANUAL, labels=['api'])
```

---

## 15. Implementation Plan

### Phase 1: Foundation (Week 1-2)

- [ ] Create `PublicApiGateway/` project structure (matching Clean Architecture pattern of existing services)
- [ ] Implement `ApiKey` entity, `PublicApiDbContext`, EF migrations
- [ ] Implement `ApiKeyAuthMiddleware` with SHA-256 validation + Redis cache
- [ ] Implement API key CRUD endpoints (JWT-authenticated, admin only)
- [ ] Implement typed HTTP clients for OnlineMenu, Identity, Content services
- [ ] Implement `GET /api/v1/menus` and `GET /api/v1/menus/{id}` (read-only)
- [ ] Implement `GET /api/v1/tenant` (read-only)
- [ ] Docker + docker-compose configuration
- [ ] Tilt resources (lint, unit tests, API rebuild)
- [ ] Unit tests for middleware, endpoints, HTTP clients (target: 60% coverage)

### Phase 2: Rate Limiting and Analytics (Week 2-3)

- [ ] Implement Redis-backed distributed rate limiting (per API key, tiered)
- [ ] Implement `UsageTrackingMiddleware` and `UsageRecord` persistence
- [ ] Add rate limit headers to all responses
- [ ] Implement API key usage statistics endpoint
- [ ] Integrate with PaymentService for feature gating (plan tier check)
- [ ] Grafana dashboard for API usage metrics
- [ ] Prometheus metrics endpoint

### Phase 3: Documentation and SDK (Week 3-4)

- [ ] OpenAPI spec review and enrichment (descriptions, examples, error schemas)
- [ ] TypeScript SDK generation via Orval (add to `orval.config.js`)
- [ ] API documentation site (Swagger UI or Redocly)
- [ ] Developer onboarding guide (how to get an API key, first request)
- [ ] Add `publicApiApi` config to BaseClient Orval for admin UI hooks

### Phase 4: Webhooks (Week 4-5)

- [ ] Implement `WebhookRegistration` entity and CRUD endpoints
- [ ] Implement `WebhookDispatcher` RabbitMQ consumer
- [ ] HMAC-SHA256 signature generation
- [ ] Retry logic with exponential backoff
- [ ] Webhook test endpoint
- [ ] Webhook delivery monitoring in Grafana

### Phase 5: Write Operations and Hardening (Week 5-6)

- [ ] Implement write endpoints (item availability, price update)
- [ ] Implement scope-based authorization on write endpoints
- [ ] E2E tests (Playwright) for public API flows
- [ ] Security audit (OWASP checklist)
- [ ] Load testing (target: 1000 req/s sustained on Enterprise tier)
- [ ] Documentation finalization

---

## 16. Dependency on API Versioning Task

The existing `api-versioning.md` task proposes adding `/v1/` to all internal service routes. The public API gateway does NOT block on this task:

- **Without internal versioning**: Gateway routes to `/api/menus`, `/api/tenants`, etc.
- **With internal versioning**: Gateway routes to `/api/v1/menus`, `/api/v1/tenants`, etc.

The gateway's own versioning (`/api/v1/`) is independent. However, it is strongly recommended to complete the internal versioning task first or in parallel, so that:
1. Internal service contracts are stabilized
2. The gateway can pin to a specific internal version
3. Internal breaking changes do not accidentally break the public API

**Recommendation**: Execute API versioning task as a prerequisite (estimated 1 week) before Phase 1 of the public API.

---

## 17. Cost and Resource Estimates

### 17.1 Infrastructure

| Resource | Size | Monthly Cost (Cloud) |
|----------|------|---------------------|
| PublicApiGateway container | 512MB RAM, 1 CPU | ~$15 (basic K8s pod) |
| PostgreSQL (API keys, usage) | 256MB RAM | Shared with existing cluster or ~$10 |
| Redis (already exists) | Incremental memory | $0 (shared instance) |
| RabbitMQ (already exists) | Incremental memory | $0 (shared instance) |

### 17.2 Development Effort

| Phase | Effort | Team |
|-------|--------|------|
| Phase 1: Foundation | 2 weeks | 1 backend dev |
| Phase 2: Rate Limiting + Analytics | 1 week | 1 backend dev |
| Phase 3: Docs + SDK | 1 week | 1 backend dev + 1 frontend dev (admin UI) |
| Phase 4: Webhooks | 1.5 weeks | 1 backend dev |
| Phase 5: Write Ops + Hardening | 1.5 weeks | 1 backend dev + 1 tester |
| **Total** | **~7 weeks** | |

---

## 18. Open Questions

1. **Orders domain**: The Roadmap mentions "Digital ordering integration" as P2. Should the public API include order creation from day one, or should we wait for the OrderService to be designed?
   - **Recommendation**: Defer orders to Phase 3. Focus on menu read/write first.

2. **Multi-location support**: How should the API handle franchise/chain tenants with multiple locations?
   - **Recommendation**: Each location is a separate tenant with its own API key. Cross-location queries are a future enterprise feature.

3. **API key quotas beyond rate limiting**: Should there be monthly request quotas (e.g., 10,000 req/month on Standard tier)?
   - **Recommendation**: Yes, enforce daily limits in addition to per-minute rate limits. The `UsageRecord` table supports this.

4. **Sandbox/test environment**: Should there be a separate sandbox for integrators to test?
   - **Recommendation**: Use `mk_test_` prefixed keys that hit the same services but with isolated test data (or a test tenant). Defer full sandbox environment to post-launch.

5. **Rate limiting NuGet package**: Should the Redis-backed rate limiter be extracted into a new NuGet package (`RateLimiting.Redis`) for reuse across services?
   - **Recommendation**: Yes, extract after initial implementation proves the pattern. Other services (especially OnlineMenu public endpoint) can benefit.

---

## 19. Consequences and Trade-Offs

### Accepted

- **New service to maintain**: +1 Docker container, +1 database, +1 deployment pipeline. Mitigated by established patterns (all 6 existing services follow the same structure).
- **Internal HTTP hop latency**: ~2-5ms per request. Acceptable for machine-to-machine integrations where total latency budget is 200-500ms.
- **Redis dependency for rate limiting**: Redis is already in the infrastructure but becomes more critical. Mitigated by `abortConnect=false` pattern and graceful degradation (fall back to in-process limiter if Redis is down).

### Avoided

- **Duplicating auth logic across services**: By centralizing in the gateway, API key management is implemented once.
- **Coupling public contracts to internal schemas**: By using dedicated public DTOs with explicit mapping, internal refactoring does not break external integrators.
- **Over-engineering with OAuth2 from day one**: API keys are simpler for integrators and sufficient for Phase 1. OAuth2 can be added later for enterprise customers.

---

## 20. Success Criteria

- [ ] A third-party POS system can fetch menu data using an API key in under 200ms (P95)
- [ ] Rate limiting correctly enforces per-key limits across multiple gateway instances
- [ ] API key revocation takes effect within 5 minutes (Redis cache TTL)
- [ ] TypeScript SDK generated from OpenAPI spec compiles and works
- [ ] Webhook delivery succeeds with <1% failure rate for reachable endpoints
- [ ] Zero cross-tenant data leaks (verified by security audit)
- [ ] 60%+ unit test coverage on the gateway service
- [ ] Grafana dashboard shows real-time API usage per tenant

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Initial architecture document created |

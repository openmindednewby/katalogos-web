# Webhooks Architecture Plan

**Status**: COMPLETED (2026-03-20) — Full webhook system implemented in NotificationService
**Type**: Architecture / System Design
**Created**: 2026-03-15
**Author**: Chief Architect
**Domains affected**: Backend (new WebhookService), NuGetPackages (new contracts), NotificationService (consumer integration), Frontend (webhook management UI)

---

## 1. Context and Problem Statement

External integrators (POS systems, analytics platforms, third-party apps) need real-time awareness of events occurring within our SaaS platform -- menu updates, order status changes, questionnaire submissions, subscription events, and more. Currently, the only way for external systems to know about changes is to poll our APIs, which is inefficient, introduces latency, and does not scale.

We need an **outbound webhook system** that pushes event notifications to subscriber-configured HTTP endpoints. This is distinct from the existing inbound webhook pattern (e.g., `PaymentService/Webhooks/StripeWebhook.cs` which receives Stripe callbacks).

### Goals

- Enable tenants to register HTTPS endpoints that receive real-time event payloads.
- Provide reliable, at-least-once delivery with retries and dead-letter handling.
- Maintain strong multi-tenant isolation -- a tenant's webhooks only fire for that tenant's events.
- Integrate cleanly with the existing MassTransit/RabbitMQ event infrastructure.
- Offer monitoring and troubleshooting tools for both tenants and platform operators.

### Non-Goals (Explicitly Out of Scope)

- GraphQL subscriptions or server-sent events (SSE) -- those are separate features.
- Replacing the existing in-app SignalR notification system (they coexist).
- Outbound webhooks for platform-level/super-admin events (tenant provisioning, etc.) -- phase 2.

---

## 2. Codebase Research Findings

### 2.1 Existing Messaging Infrastructure

| Component | Details |
|-----------|---------|
| **Message broker** | RabbitMQ 3 (management), shared across all services via `saas-network`. Container: `NotificationRabbitMQ`, ports 5672 (AMQP) / 15672 (management UI on 5016). |
| **Messaging library** | MassTransit via `Messaging.RabbitMq` NuGet package. Provides `INotificationEventPublisher` / `NotificationEventPublisher` using `IPublishEndpoint.Publish()`. |
| **Event contracts** | `NotificationService.Contracts` NuGet package defines `INotificationEvent` interface (TenantId, UserId, NotificationType, Priority, OccurredAt) and concrete events: `MenuUpdatedEvent`, `QuestionnaireSubmittedEvent`, `TemplateUpdatedEvent`, `UserInvitedEvent`, `SubscriptionExpiringEvent`, `PaymentDueEvent`. |
| **Operational events** | `Messaging.Contracts` NuGet package defines cross-service operational events: `UserDeletedEvent`, `UserDataExportRequest/Response`, `DeletionConfirmationEvent`. These are NOT notification events (no `INotificationEvent`). |
| **Retry policy** | MassTransit `UseMessageRetry` with intervals: 1s, 5s, 15s, 30s. `UseInMemoryOutbox` for transactional consistency. |
| **Health checks** | MassTransit health reports `Degraded` (not `Unhealthy`) for publisher-only services so that RabbitMQ downtime doesn't kill readiness probes. |

### 2.2 NotificationService Architecture

| Layer | Responsibility |
|-------|---------------|
| **Core** | `NotificationEntity` (BaseTenantEntity + IAggregateRoot), `NotificationPreference`, enums. Uses Ardalis Result pattern. |
| **UseCases** | MediatR command/query handlers: `SendNotificationCommand` creates entity, checks preferences, delivers via SignalR. |
| **Infrastructure** | EF Core + PostgreSQL (`NotificationDbContext`), MassTransit consumers (`MenuUpdatedConsumer`, `QuestionnaireSubmittedConsumer`, etc.), auto tenant filtering via global query filter. |
| **Web** | FastEndpoints for REST API, SignalR `NotificationHub` with Redis backplane, JWT auth via Keycloak, rate limiting. |

Key observation: The NotificationService is purpose-built for **in-app user notifications** delivered via SignalR. Its entity model (`NotificationEntity`) is user-targeted (UserId, IsRead, DeliveredAt, DeliveryChannel). Webhooks are fundamentally different -- they target external HTTP endpoints, not users, and have different delivery semantics (retry, signature, payload format).

### 2.3 Database Patterns

- **ORM**: EF Core with PostgreSQL 16.
- **Base entities**: `BaseEntity` (int Id PK, Guid ExternalId, CreatedDate, LastUpdatedDate) and `BaseTenantEntity` (adds UserId, TenantId with immutable setters).
- **Multi-tenancy**: Global query filters on `TenantId` via reflection-based `SetTenantFilter<T>`, automatic tenant/user indexes.
- **Migrations**: Code-first, applied automatically in Development via `db.Database.MigrateAsync()`.
- **Each service** has its own PostgreSQL database (e.g., `NotificationDB` on port 5436, `IdentityServiceDB` on 5434, `OnlineMenuDB` on 5432).

### 2.4 Service Patterns

- **API framework**: FastEndpoints (minimal API style, e.g., `Endpoint<TRequest, TResponse>`, `EndpointWithoutRequest`).
- **Authentication**: JWT Bearer via Keycloak with realm role mapping.
- **Clean Architecture**: Core -> UseCases -> Infrastructure -> Web, with MediatR for CQRS.
- **Docker**: Each service has its own `docker-compose.yml` joining `saas-network`. Resource limits enforced (512m API, 512m DB, 128m Redis).
- **Existing inbound webhook**: `PaymentService/Webhooks/StripeWebhook.cs` -- receives Stripe events, verifies signature, dispatches via MediatR.

### 2.5 Infrastructure

- **Redis**: Shared instance on port 6379, used for SignalR backplane, caching, and rate limiting.
- **Observability**: Serilog structured logging with Loki sink, Grafana/Prometheus/cAdvisor monitoring stack.
- **Rate limiting**: `RateLimiting.Defaults` NuGet package applied globally.

---

## 3. Key Architectural Decisions

### 3.1 Dedicated WebhookService vs. Extension of NotificationService

| Option | Pros | Cons |
|--------|------|------|
| **A: Extend NotificationService** | Reuses existing RabbitMQ consumers and DB; no new service to deploy | Violates single responsibility; NotificationService is user-notification-centric; schema pollution; different scaling profile (webhooks need outbound HTTP workers, not SignalR) |
| **B: Dedicated WebhookService** | Clean separation of concerns; independent scaling; independent failure domain; can evolve independently | New service to deploy and monitor; needs its own DB and Docker container; must consume the same RabbitMQ events |
| **C: Webhook module inside NotificationService, separate DB schema** | Less infra overhead than B; some logical separation | Still couples deployment; shared process means a webhook delivery spike impacts in-app notifications |

**Decision: Option B -- Dedicated WebhookService**

**Rationale**: Webhooks have fundamentally different operational characteristics from in-app notifications:
- **Outbound HTTP calls** are I/O-bound and can be slow (timeouts, retries), while in-app notifications are fast SignalR pushes.
- **Scaling** is different: webhook delivery throughput depends on external endpoint response times, requiring independent horizontal scaling.
- **Failure modes** differ: a misbehaving external endpoint should never impact in-app notification delivery.
- **Data model** is different: subscriptions, delivery logs, signing secrets, retry state vs. user preferences and read/unread state.

The new service follows the same Clean Architecture pattern as all existing services and joins the shared `saas-network` + RabbitMQ infrastructure.

**Consequences**: One additional service (WebhookService) to deploy, monitor, and maintain. Mitigated by reusing all existing NuGet packages and patterns.

### 3.2 Event Sourcing for Webhook Payloads

| Option | Pros | Cons |
|--------|------|------|
| **A: Store every payload for replay** | Full audit trail; tenants can replay missed deliveries; debugging | Storage grows unboundedly; need retention policy |
| **B: Store delivery logs only (no payload)** | Lightweight; simple schema | Cannot replay; tenants must re-poll API for data |
| **C: Store payloads with TTL-based retention** | Best of both; replay within window; bounded storage | Moderate complexity |

**Decision: Option C -- Store payloads with 30-day TTL retention**

Webhook delivery logs (including the serialized payload) are stored for 30 days. A background job purges records older than the retention window. Tenants can request a replay of any delivery within that window.

### 3.3 Integration Pattern -- How Webhooks Receive Internal Events

| Option | Pros | Cons |
|--------|------|------|
| **A: WebhookService subscribes to same MassTransit events** | Decoupled; existing publishers don't change; WebhookService just adds a new consumer per event type | Must create parallel consumers for every event type; may need additional event contracts |
| **B: NotificationService publishes a "webhook-trigger" event** | Single integration point; NotificationService acts as event router | Couples webhook dispatch to NotificationService; adds latency; NotificationService becomes a bottleneck |
| **C: Each service publishes a separate "webhook" event** | Maximum flexibility per event | Doubles the publish calls in every service; fragile |

**Decision: Option A -- WebhookService subscribes directly to MassTransit events**

MassTransit's pub/sub model supports multiple consumers per message type. Adding a `WebhookMenuUpdatedConsumer` in the WebhookService alongside the existing `MenuUpdatedConsumer` in NotificationService requires zero changes to publishers. Each consumer gets its own RabbitMQ queue, so they operate independently.

For events that don't yet have contracts (e.g., `order.created`, `menu.published`), we add new event records to the appropriate contracts package. The WebhookService also defines its own `IWebhookEvent` abstraction for mapping internal events to outbound webhook payloads.

### 3.4 Retry Policy and Circuit Breaker

**Decision**:
- **Retry schedule**: Exponential backoff -- 30s, 2m, 15m, 1h, 4h, 24h (6 attempts over ~29 hours).
- **Circuit breaker**: After 5 consecutive failures to the same endpoint URL, the subscription is marked `degraded`. After 50 consecutive failures (across retries), the subscription is `disabled` and the tenant is notified via in-app notification.
- **Dead-letter**: Failed deliveries after all retries exhausted are moved to a `webhook_dead_letters` table with the payload preserved.
- **Implementation**: A background worker (`WebhookDeliveryWorker`) polls a `webhook_delivery_queue` table. Pending deliveries with `next_retry_at <= now` are picked up, attempted, and either marked `delivered` or rescheduled. This is a Transactional Outbox pattern using PostgreSQL, not an in-memory queue, ensuring deliveries survive process restarts.

### 3.5 Push vs. Pull

**Decision**: Primary delivery is push (webhooks). Additionally, expose a **Delivery Log API** (`GET /api/webhooks/deliveries`) that tenants can poll to verify what was sent, check for failures, and request replays. This is not a polling-based event feed -- it is a troubleshooting and audit interface.

### 3.6 Rate Limiting

**Decision**: Per-tenant delivery limits:
- **Default**: 1,000 deliveries/hour per tenant.
- **Burst**: Up to 100 deliveries/minute.
- **Configurable**: Platform operators can adjust per tenant via admin API.
- **Backpressure**: When rate limited, deliveries are delayed (not dropped). The delivery worker respects the rate limit before attempting the next delivery.

---

## 4. Event Catalog

### 4.1 Phase 1 Events (MVP)

These events already have MassTransit contracts in `NotificationService.Contracts`:

| Webhook Event Type | MassTransit Source | Trigger |
|---|---|---|
| `menu.updated` | `MenuUpdatedEvent` | Menu content is modified |
| `questionnaire.submitted` | `QuestionnaireSubmittedEvent` | A questionnaire response is submitted |
| `template.updated` | `TemplateUpdatedEvent` | A questionnaire template is modified |
| `user.invited` | `UserInvitedEvent` | A user is invited to a tenant |

### 4.2 Phase 2 Events (Post-MVP)

These require new MassTransit contracts to be created:

| Webhook Event Type | Source Service | Trigger |
|---|---|---|
| `menu.published` | OnlineMenuService | Menu is published/made live |
| `menu.unpublished` | OnlineMenuService | Menu is taken offline |
| `menu.item.created` | OnlineMenuService | New item added to menu |
| `menu.item.updated` | OnlineMenuService | Menu item price/details changed |
| `menu.item.deleted` | OnlineMenuService | Menu item removed |
| `order.created` | OnlineMenuService (future) | New order placed |
| `order.status_changed` | OnlineMenuService (future) | Order status transition |
| `subscription.expiring` | PaymentService | Subscription nearing expiry |
| `subscription.renewed` | PaymentService | Subscription renewed |
| `payment.succeeded` | PaymentService | Payment processed |
| `payment.failed` | PaymentService | Payment failed |

### 4.3 Event Type Naming Convention

Format: `{domain}.{resource}.{action}` (lowercase, dot-separated).

Examples: `menu.updated`, `order.created`, `subscription.expiring`.

The event catalog is stored as a database-seeded table (`webhook_event_types`) with columns: `name`, `description`, `category`, `schema_version`, `is_active`. This allows dynamic discovery and backward-compatible evolution.

---

## 5. Payload Format

### 5.1 Envelope Structure

Every webhook delivery uses a consistent JSON envelope:

```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "type": "menu.updated",
  "api_version": "2026-03-15",
  "created_at": "2026-03-15T14:30:00.000Z",
  "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "menu_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "menu_name": "Lunch Specials",
    "change_type": "updated",
    "updated_by": "John Doe"
  }
}
```

### 5.2 Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique delivery ID (idempotency key). Receivers can deduplicate on this. |
| `type` | string | Event type from the catalog (e.g., `menu.updated`). |
| `api_version` | string | Date-based API version for schema evolution (e.g., `2026-03-15`). |
| `created_at` | ISO 8601 | When the event occurred (from the source service). |
| `tenant_id` | UUID | The tenant that owns this event. |
| `data` | object | Event-specific payload. Schema varies by `type`. |

### 5.3 Schema Versioning Strategy

- API version is date-based (like Stripe: `2026-03-15`).
- Each webhook subscription is pinned to the API version that was current when it was created.
- When we introduce breaking changes to a `data` schema, we bump the version.
- Old versions are supported for 12 months after deprecation.
- The `api_version` field in the payload tells the receiver which schema to expect.

---

## 6. Security Design

### 6.1 Webhook Signatures (HMAC-SHA256)

Every outbound request includes a signature header:

```
X-Webhook-Signature: sha256=<hex-encoded-hmac>
X-Webhook-Timestamp: 1710510600
```

Signature computation:
```
payload = timestamp + "." + raw_json_body
signature = HMAC-SHA256(signing_secret, payload)
```

Including the timestamp in the signed payload prevents replay attacks. Receivers should reject requests where the timestamp is more than 5 minutes old.

### 6.2 Signing Secret Management

- Each webhook subscription gets a unique signing secret (32-byte random, base64-encoded).
- Secrets are stored **encrypted at rest** in the database using AES-256-GCM, with the encryption key from configuration (Key Vault in production).
- Tenants can view the secret once at creation, then it is masked.
- **Secret rotation**: Tenants can rotate the secret. During rotation, a grace period (1 hour) accepts signatures from both old and new secrets (dual-signing). After the grace period, only the new secret is used.

### 6.3 Endpoint Validation

- **HTTPS-only**: Webhook URLs must use `https://` (no HTTP, no IP addresses in production).
- **URL validation**: No private/internal IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, localhost). This prevents SSRF attacks.
- **Verification ping**: When a subscription is created, a `ping` event is sent to verify the endpoint is reachable and returns 2xx.
- **Custom headers**: Tenants can configure up to 5 custom headers (e.g., `Authorization: Bearer <token>`) that are included in every delivery. Stored encrypted.

### 6.4 TLS and HTTP Client

- Outbound HTTP client enforces TLS 1.2+ minimum.
- 10-second connection timeout, 30-second read timeout.
- Follow redirects up to 3 hops (but only to HTTPS URLs).
- Maximum response body read: 1 MB (we only need the status code, but we log a truncated response body for debugging).

### 6.5 Tenant Isolation

- Webhook subscriptions are scoped by `TenantId` using the same `BaseTenantEntity` + global query filter pattern used across all services.
- The WebhookService's MassTransit consumers extract `TenantId` from the event and only dispatch to subscriptions belonging to that tenant.
- Rate limits are per-tenant.

---

## 7. Data Model

### 7.1 Entity Diagram

```
WebhookSubscription (BaseTenantEntity, IAggregateRoot)
├── Id (int, PK)
├── ExternalId (Guid, unique)
├── TenantId (Guid, FK via BaseTenantEntity)
├── UserId (Guid, via BaseTenantEntity -- creator)
├── Name (string, 100) -- human-readable label
├── TargetUrl (string, 2048) -- HTTPS endpoint
├── SigningSecret (string, encrypted) -- HMAC secret
├── PreviousSigningSecret (string?, encrypted) -- for rotation grace period
├── SecretRotatedAt (DateTime?) -- when rotation started
├── Status (enum: Active, Paused, Degraded, Disabled)
├── ApiVersion (string, 20) -- pinned API version
├── CustomHeaders (string?, encrypted JSON) -- up to 5 custom headers
├── ConsecutiveFailures (int) -- for circuit breaker
├── LastDeliveryAt (DateTime?)
├── LastSuccessAt (DateTime?)
├── CreatedDate (DateTime)
├── LastUpdatedDate (DateTime)
└── EventSubscriptions (List<WebhookEventSubscription>)

WebhookEventSubscription (BaseEntity)
├── Id (int, PK)
├── ExternalId (Guid, unique)
├── WebhookSubscriptionId (int, FK)
├── EventType (string, 100) -- e.g., "menu.updated"
├── IsActive (bool)
├── CreatedDate (DateTime)
└── LastUpdatedDate (DateTime)

WebhookDelivery (BaseTenantEntity)
├── Id (int, PK)
├── ExternalId (Guid, unique) -- also serves as idempotency key in payload
├── TenantId (Guid)
├── UserId (Guid)
├── WebhookSubscriptionId (int, FK)
├── EventType (string, 100)
├── Payload (text, JSON) -- the full envelope
├── Status (enum: Pending, Delivered, Failed, DeadLettered)
├── HttpStatusCode (int?)
├── ResponseBody (string?, truncated to 1KB)
├── AttemptCount (int)
├── MaxAttempts (int, default 6)
├── NextRetryAt (DateTime?) -- null when delivered or dead-lettered
├── LastAttemptAt (DateTime?)
├── DeliveredAt (DateTime?)
├── ErrorMessage (string?)
├── DurationMs (int?) -- round-trip time of last attempt
├── CreatedDate (DateTime)
└── LastUpdatedDate (DateTime)

WebhookEventType (not tenant-scoped)
├── Id (int, PK)
├── Name (string, 100, unique) -- e.g., "menu.updated"
├── Description (string, 500)
├── Category (string, 50) -- e.g., "menu", "order", "subscription"
├── SchemaVersion (string, 20)
├── IsActive (bool)
├── SamplePayload (text?, JSON)
└── CreatedDate (DateTime)
```

### 7.2 Indexes

```sql
-- Subscription lookups
CREATE INDEX IX_WebhookSubscription_TenantId ON webhook_subscriptions (tenant_id);
CREATE INDEX IX_WebhookSubscription_Status ON webhook_subscriptions (status) WHERE status = 'Active';

-- Delivery worker: find pending deliveries ready for retry
CREATE INDEX IX_WebhookDelivery_Status_NextRetryAt
  ON webhook_deliveries (status, next_retry_at)
  WHERE status IN ('Pending', 'Failed');

-- Delivery log queries by tenant
CREATE INDEX IX_WebhookDelivery_TenantId_CreatedDate
  ON webhook_deliveries (tenant_id, created_date DESC);

-- Delivery log queries by subscription
CREATE INDEX IX_WebhookDelivery_SubscriptionId_CreatedDate
  ON webhook_deliveries (webhook_subscription_id, created_date DESC);

-- Retention cleanup
CREATE INDEX IX_WebhookDelivery_CreatedDate
  ON webhook_deliveries (created_date)
  WHERE status IN ('Delivered', 'DeadLettered');
```

---

## 8. Service Architecture

### 8.1 Project Structure

```
WebhookService/
├── docker-compose.yml
├── Webhook/
│   ├── Webhook.slnx
│   ├── Directory.Build.props
│   ├── Directory.Packages.props
│   ├── nuget.config
│   ├── src/
│   │   ├── Webhook.Core/                    # Entities, Enums, Interfaces
│   │   │   ├── Entities/
│   │   │   │   ├── WebhookSubscription.cs
│   │   │   │   ├── WebhookEventSubscription.cs
│   │   │   │   ├── WebhookDelivery.cs
│   │   │   │   └── WebhookEventType.cs
│   │   │   ├── Enums/
│   │   │   │   ├── SubscriptionStatus.cs
│   │   │   │   └── DeliveryStatus.cs
│   │   │   └── Interfaces/
│   │   │       ├── IWebhookDeliveryService.cs
│   │   │       └── ISigningService.cs
│   │   ├── Webhook.UseCases/                # MediatR commands/queries
│   │   │   ├── Subscriptions/
│   │   │   │   ├── Commands/ (Create, Update, Delete, RotateSecret, Pause, Resume)
│   │   │   │   └── Queries/ (List, GetById, GetDeliveryLog)
│   │   │   ├── Deliveries/
│   │   │   │   ├── Commands/ (EnqueueDelivery, ProcessDelivery, ReplayDelivery)
│   │   │   │   └── Queries/ (GetDeliveryById, ListDeliveries)
│   │   │   └── EventTypes/
│   │   │       └── Queries/ (ListEventTypes)
│   │   ├── Webhook.Infrastructure/           # EF Core, MassTransit, HTTP delivery
│   │   │   ├── Data/
│   │   │   │   ├── WebhookDbContext.cs
│   │   │   │   └── Configurations/
│   │   │   ├── Messaging/
│   │   │   │   └── Consumers/               # MassTransit consumers (one per event type)
│   │   │   │       ├── WebhookMenuUpdatedConsumer.cs
│   │   │   │       ├── WebhookQuestionnaireSubmittedConsumer.cs
│   │   │   │       └── ...
│   │   │   ├── Delivery/
│   │   │   │   ├── HttpWebhookDeliveryService.cs
│   │   │   │   └── HmacSigningService.cs
│   │   │   └── BackgroundServices/
│   │   │       ├── WebhookDeliveryWorker.cs
│   │   │       └── DeliveryRetentionWorker.cs
│   │   └── Webhook.Web/                     # FastEndpoints, Program.cs
│   │       ├── Program.cs
│   │       ├── Subscriptions/               # CRUD endpoints
│   │       ├── Deliveries/                  # Log/replay endpoints
│   │       └── EventTypes/                  # Catalog endpoint
│   └── tests/
│       ├── Webhook.UnitTests/
│       └── Webhook.IntegrationTests/
```

### 8.2 Component Interaction Diagram

```
                      ┌──────────────────┐
                      │  OnlineMenuSaaS  │
                      │  (publishes      │
                      │   MenuUpdated    │
                      │   event)         │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │    RabbitMQ      │
                      │  (fan-out to     │
                      │   all consumers) │
                      └──┬──────────┬────┘
                         │          │
              ┌──────────▼──┐   ┌──▼───────────────┐
              │ Notification │   │  WebhookService   │
              │ Service      │   │                   │
              │ (in-app via  │   │ 1. Consumer       │
              │  SignalR)    │   │    receives event  │
              └──────────────┘   │ 2. Looks up active │
                                 │    subscriptions   │
                                 │    for tenant +    │
                                 │    event type      │
                                 │ 3. Creates         │
                                 │    WebhookDelivery │
                                 │    records (Pending)│
                                 │ 4. DeliveryWorker  │
                                 │    picks up &      │
                                 │    delivers via HTTP│
                                 └───────────┬────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │  External Endpoint   │
                                  │  (tenant's system)   │
                                  │  POST https://...    │
                                  │  with signed payload  │
                                  └─────────────────────┘
```

### 8.3 Delivery Pipeline (Detailed Flow)

1. **Source service** publishes a MassTransit event (e.g., `MenuUpdatedEvent`). No changes needed to existing publishers.

2. **WebhookService consumer** (`WebhookMenuUpdatedConsumer`) receives the event:
   - Extracts `TenantId` from the event.
   - Queries `WebhookSubscription` table for active subscriptions where `TenantId` matches AND subscription has `menu.updated` in its `EventSubscriptions`.
   - For each matching subscription, creates a `WebhookDelivery` record with status `Pending`, serialized payload envelope, and `NextRetryAt = now`.
   - Commits all records in a single transaction (Transactional Outbox pattern).

3. **WebhookDeliveryWorker** (hosted service, runs continuously):
   - Polls `WebhookDelivery` table for records where `Status IN (Pending, Failed) AND NextRetryAt <= utcnow()`.
   - Uses `SELECT ... FOR UPDATE SKIP LOCKED` for safe concurrent processing (supports multiple worker instances).
   - For each delivery:
     a. Computes HMAC-SHA256 signature.
     b. Sends HTTP POST to `TargetUrl` with headers: `Content-Type: application/json`, `X-Webhook-Signature`, `X-Webhook-Timestamp`, plus any custom headers.
     c. On 2xx response: marks `Delivered`, records `HttpStatusCode`, `DurationMs`.
     d. On non-2xx or timeout: increments `AttemptCount`, computes next retry time (exponential backoff), updates `NextRetryAt`.
     e. If `AttemptCount >= MaxAttempts`: marks `DeadLettered`, increments `ConsecutiveFailures` on the subscription.
   - Circuit breaker check: if subscription's `ConsecutiveFailures >= 5`, mark subscription `Degraded`; if `>= 50`, mark `Disabled`.

4. **DeliveryRetentionWorker** (hosted service, runs daily):
   - Deletes `WebhookDelivery` records older than 30 days where `Status IN (Delivered, DeadLettered)`.

---

## 9. API Design

### 9.1 Subscription Management

```
POST   /api/webhooks/subscriptions              -- Create subscription
GET    /api/webhooks/subscriptions              -- List tenant's subscriptions
GET    /api/webhooks/subscriptions/{id}         -- Get subscription details
PUT    /api/webhooks/subscriptions/{id}         -- Update subscription (name, url, events, custom headers)
DELETE /api/webhooks/subscriptions/{id}         -- Delete subscription
POST   /api/webhooks/subscriptions/{id}/pause   -- Pause delivery
POST   /api/webhooks/subscriptions/{id}/resume  -- Resume delivery
POST   /api/webhooks/subscriptions/{id}/rotate-secret -- Rotate signing secret
POST   /api/webhooks/subscriptions/{id}/test    -- Send test ping event
```

### 9.2 Delivery Logs

```
GET    /api/webhooks/deliveries                 -- List deliveries (filterable by subscription, event type, status, date range)
GET    /api/webhooks/deliveries/{id}            -- Get delivery details (includes payload, response, timing)
POST   /api/webhooks/deliveries/{id}/replay     -- Re-send a specific delivery
```

### 9.3 Event Catalog

```
GET    /api/webhooks/event-types                -- List all available event types with descriptions and sample payloads
```

### 9.4 Request/Response Examples

**Create Subscription**:
```json
// POST /api/webhooks/subscriptions
// Request:
{
  "name": "POS Integration",
  "target_url": "https://pos.example.com/webhooks",
  "events": ["menu.updated", "menu.item.created"],
  "custom_headers": {
    "Authorization": "Bearer sk_live_xxx"
  }
}

// Response (201):
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "name": "POS Integration",
  "target_url": "https://pos.example.com/webhooks",
  "events": ["menu.updated", "menu.item.created"],
  "status": "active",
  "signing_secret": "whsec_MIGfMA0GCSqGSIb3DQEBA...",
  "api_version": "2026-03-15",
  "created_at": "2026-03-15T14:30:00.000Z"
}
```

**Note**: `signing_secret` is only returned in the create response and the rotate-secret response. All subsequent GET requests mask it.

---

## 10. Monitoring and Observability

### 10.1 Structured Logging

All operations emit structured logs via Serilog with Loki sink (matching existing pattern):

```
WebhookDelivery {DeliveryId} to {TargetUrl} returned {StatusCode} in {DurationMs}ms
WebhookDelivery {DeliveryId} failed: {ErrorMessage}. Retry {AttemptCount}/{MaxAttempts}, next at {NextRetryAt}
WebhookSubscription {SubscriptionId} circuit breaker tripped: {ConsecutiveFailures} consecutive failures
```

### 10.2 Health Checks

```
/health/live   -- Process is alive
/health/ready  -- DB connected, RabbitMQ connected
/health/start  -- Startup complete
```

Additional health check: `WebhookDeliveryBacklog` -- reports `Degraded` if more than 10,000 pending deliveries are queued (indicates delivery is falling behind).

### 10.3 Metrics (Prometheus)

| Metric | Type | Labels |
|--------|------|--------|
| `webhook_deliveries_total` | Counter | `event_type`, `status` (delivered, failed, dead_lettered) |
| `webhook_delivery_duration_seconds` | Histogram | `event_type` |
| `webhook_delivery_attempts_total` | Counter | `event_type`, `attempt_number` |
| `webhook_subscriptions_active` | Gauge | (none) |
| `webhook_delivery_backlog` | Gauge | `status` (pending, failed) |

### 10.4 Tenant-Facing Dashboard Data

Expose via the Delivery Logs API:
- Delivery success rate (last 24h, 7d, 30d).
- Average delivery latency.
- Recent failures with error details.
- Subscription health status.

---

## 11. Infrastructure

### 11.1 Docker Compose

```yaml
services:
  webhook.web:
    build:
      context: .
      dockerfile: Webhook/src/Webhook.Web/Dockerfile
      no_cache: true
    mem_limit: 512m
    cpus: 1.0
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    ports:
      - "5022:8081"
      - "5023:8080"
    env_file:
      - ../.env.local
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__PostgresConnection=Host=webhook-db;Port=5432;...
      - ConnectionStrings__Redis=redis:6379
      - RabbitMQ__Host=rabbitmq
      - Jwt__Authority=...
    depends_on:
      webhook-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - webhook-network
      - saas-network

  webhook-db:
    image: postgres:16
    container_name: WebhookDB
    mem_limit: 512m
    cpus: 0.5
    ports:
      - "5438:5432"
    # ... standard postgres setup
    networks:
      - webhook-network
      - saas-network
```

### 11.2 Port Allocation

Following existing pattern (Identity: 5002, OnlineMenu: 5006, Notification: 5014/5015, NotificationDB: 5436):

| Resource | Port |
|----------|------|
| WebhookService HTTPS | 5022 |
| WebhookService HTTP | 5023 |
| WebhookDB (Postgres) | 5438 |

### 11.3 Tilt Integration

New Tilt resources:
- `webhook-api` (manual trigger, Docker build)
- `webhook-lint`, `webhook-yagni`, `webhook-unit-tests`, `webhook-unit-tests-coverage`, `webhook-security-audit`

---

## 12. NuGet Package Changes

### 12.1 New Package: `Webhook.Contracts`

Contains the outbound webhook event envelope types that consumers use to understand webhook payloads. This is a thin package -- it primarily defines the `IWebhookTriggerEvent` marker interface that all events capable of triggering webhooks must implement.

```csharp
namespace Webhook.Contracts;

/// <summary>
/// Marker interface for events that can trigger outbound webhooks.
/// Implemented alongside INotificationEvent on events that should
/// trigger both in-app notifications AND outbound webhooks.
/// </summary>
public interface IWebhookTriggerEvent
{
    Guid TenantId { get; }
    string WebhookEventType { get; }  // e.g., "menu.updated"
    DateTimeOffset OccurredAt { get; }
}
```

### 12.2 Changes to `NotificationService.Contracts`

Existing events (e.g., `MenuUpdatedEvent`) can optionally also implement `IWebhookTriggerEvent`. However, to maintain backward compatibility and keep the packages decoupled, the WebhookService consumers will map from `INotificationEvent` to webhook payloads via a mapper layer -- no changes needed to existing contracts for Phase 1.

---

## 13. Implementation Plan

### Phase 1: Foundation (Estimated: 2-3 weeks)

- [ ] Create `WebhookService/` project structure (Clean Architecture, matching existing services)
- [ ] Define entities: `WebhookSubscription`, `WebhookEventSubscription`, `WebhookDelivery`, `WebhookEventType`
- [ ] Create `WebhookDbContext` with tenant isolation (copy pattern from NotificationDbContext)
- [ ] EF Core migrations for initial schema
- [ ] Implement `HmacSigningService` with HMAC-SHA256 signing and verification
- [ ] Implement `HttpWebhookDeliveryService` with secure HTTP client (TLS, SSRF protection, timeouts)
- [ ] Implement subscription CRUD endpoints (FastEndpoints)
- [ ] Implement event type catalog endpoint
- [ ] Docker Compose setup (WebhookDB, WebhookService)
- [ ] Unit tests for signing, delivery, entities

### Phase 2: Event Integration (Estimated: 1-2 weeks)

- [ ] Implement MassTransit consumers for Phase 1 events (`WebhookMenuUpdatedConsumer`, etc.)
- [ ] Implement payload mapping layer (internal events to webhook envelope format)
- [ ] Implement `WebhookDeliveryWorker` background service with retry and circuit breaker
- [ ] Implement `DeliveryRetentionWorker` for 30-day cleanup
- [ ] Implement delivery log query endpoints
- [ ] Integration tests with RabbitMQ

### Phase 3: Security and Reliability (Estimated: 1 week)

- [ ] SSRF protection (URL validation, IP block list)
- [ ] Signing secret encryption at rest
- [ ] Secret rotation with dual-signing grace period
- [ ] Endpoint verification ping on subscription creation
- [ ] Per-tenant rate limiting
- [ ] Custom header support (encrypted storage)

### Phase 4: Observability and Frontend (Estimated: 1-2 weeks)

- [ ] Prometheus metrics integration
- [ ] Grafana dashboard for webhook delivery health
- [ ] Tilt resource setup
- [ ] Frontend webhook management page (subscription CRUD, delivery log viewer)
- [ ] E2E tests for webhook management UI
- [ ] Documentation for external integrators (API reference, signature verification examples)

### Phase 5: Expansion (Ongoing)

- [ ] Add Phase 2 event contracts and consumers
- [ ] `Webhook.Contracts` NuGet package
- [ ] Replay API endpoint
- [ ] Webhook analytics (success rates, latency percentiles)
- [ ] Admin endpoints for platform operators (per-tenant rate limit overrides, force-disable)

---

## 14. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Slow/unresponsive external endpoints cause delivery backlog | High | Medium | 30s timeout, async delivery worker, backlog health check, circuit breaker |
| SSRF via webhook URL pointing to internal services | Critical | Low | URL validation, private IP block, DNS resolution check |
| Signing secret leak | High | Low | Encryption at rest, one-time display, rotation capability |
| RabbitMQ downtime causes missed events | Medium | Low | MassTransit durable queues persist messages; service reports Degraded not Unhealthy |
| Database storage growth from delivery logs | Medium | Medium | 30-day retention with automatic cleanup worker |
| Tenant misconfigures webhook and gets rate limited | Low | Medium | Clear error messages, delivery log API, degraded/disabled status notifications |

---

## 15. Open Questions

1. **Should we support webhook filtering beyond event type?** For example, only fire `menu.updated` when the change type is `price_changed`. This adds complexity but increases precision. **Recommendation**: Defer to Phase 5. Start with event-type-level subscriptions.

2. **Should we offer a "fan-out" mode where one event goes to multiple subscriptions?** **Answer**: Yes, this is the default behavior. A tenant can create multiple subscriptions, each targeting different URLs, each subscribing to different event sets.

3. **IP allowlisting for outbound requests?** Some enterprise customers may require webhook deliveries to originate from known IP addresses. **Recommendation**: Document the outbound IPs in the API docs. For cloud deployments, use a NAT gateway with static IPs.

4. **Webhook authentication beyond HMAC?** Some systems prefer mTLS or OAuth2 client credentials for webhook delivery. **Recommendation**: Start with HMAC-SHA256 + custom headers (tenant can put their Bearer token in custom headers). Add mTLS in a future phase if requested.

---

## 16. Decision Log Summary

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Dedicated WebhookService (not extending NotificationService) | Different operational profile, independent scaling, clean SRP |
| 2 | Store payloads with 30-day TTL | Enables replay and debugging without unbounded storage |
| 3 | Subscribe directly to MassTransit events | Decoupled, zero changes to existing publishers |
| 4 | Exponential backoff: 30s to 24h over 6 attempts | Balances prompt delivery with not overwhelming failing endpoints |
| 5 | HMAC-SHA256 signatures with timestamp | Industry standard (Stripe, GitHub, Shopify pattern) |
| 6 | Transactional Outbox via PostgreSQL | Survives process restarts, supports concurrent workers |
| 7 | Date-based API versioning | Proven pattern, clear deprecation lifecycle |
| 8 | Per-tenant rate limiting (1000/hour default) | Prevents abuse without impacting normal usage |

# GDPR Compliance Phase 2 & 3 -- Architecture Blueprint

> **Status**: Phase 2 COMPLETED, Phase 3 COMPLETED
> **Started**: 2026-03-13
> **Author**: Chief Architect
> **Parent Task**: gdpr-compliance.md
> **Scope**: Backend (Phase 2) + Frontend (Phase 3)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Codebase Context & Constraints](#2-codebase-context--constraints)
3. [Phase 2: Data Rights Backend](#3-phase-2-data-rights-backend)
   - 3.1 [Entity & Schema Design](#31-entity--schema-design)
   - 3.2 [API Contracts](#32-api-contracts)
   - 3.3 [Cross-Service Data Aggregation Strategy](#33-cross-service-data-aggregation-strategy)
   - 3.4 [Account Deletion with Grace Period](#34-account-deletion-with-grace-period)
   - 3.5 [UserDeletedEvent Cascade](#35-userdeletedevent-cascade)
   - 3.6 [Consent Storage](#36-consent-storage)
   - 3.7 [Migration Plan](#37-migration-plan)
4. [Phase 3: Frontend Settings](#4-phase-3-frontend-settings)
   - 4.1 [Route & Component Structure](#41-route--component-structure)
   - 4.2 [Data Export UI Flow](#42-data-export-ui-flow)
   - 4.3 [Account Deletion UI Flow](#43-account-deletion-ui-flow)
   - 4.4 [Consent Management UI](#44-consent-management-ui)
5. [Sequence Diagrams](#5-sequence-diagrams)
6. [Security Considerations](#6-security-considerations)
7. [Files to Create & Modify](#7-files-to-create--modify)
8. [Testing Strategy](#8-testing-strategy)
9. [Open Questions & Decisions](#9-open-questions--decisions)

---

## 1. Executive Summary

This document provides a comprehensive architecture blueprint for GDPR Phases 2 and 3. Phase 2 adds data rights endpoints to IdentityService (data export, account deletion, consent storage) and introduces a new `UserDeletedEvent` consumed by all five services. Phase 3 adds a `/settings/privacy` page to BaseClient with data export, deletion, and consent management UI.

**Key architectural decisions:**

1. **Data export uses MassTransit Request/Reply** (not direct HTTP calls) for cross-service aggregation, consistent with the existing MassTransit infrastructure.
2. **User identity is managed in Keycloak**, not in a local database. GDPR entities (consent, export requests, deletion requests) are stored in the IdentityService PostgreSQL database, keyed by the Keycloak `sub` (user GUID).
3. **Account deletion is a two-phase process**: a soft-delete with 30-day grace period (user disabled in Keycloak, status tracked in local DB), followed by a hard-delete cascade via `UserDeletedEvent`.
4. **A new shared NuGet package `Messaging.Contracts`** is created to hold cross-service event contracts (beyond just notification events), starting with `UserDeletedEvent`, `UserDataExportRequest`, and `UserDataExportResponse`.

---

## 2. Codebase Context & Constraints

### Current Architecture

| Component | Technology | Notes |
|-----------|-----------|-------|
| User identity | **Keycloak** (external) | Users stored in Keycloak, accessed via `IUserManagementService` |
| User management API | `Identity.Abstractions` NuGet package | `IUserManagementService.DeleteUserAsync()` already exists |
| Messaging | **MassTransit + RabbitMQ** | Publish via `INotificationEventPublisher`, consume via `IConsumer<T>` |
| Event contracts | `NotificationService.Contracts` NuGet | Currently only notification-specific events |
| Publisher helpers | `Messaging.RabbitMq` NuGet | `AddRabbitMqMessaging()` registers MassTransit + publisher |
| Database | **PostgreSQL** per service | EF Core, code-first migrations |
| API framework | **FastEndpoints** | Not MVC controllers |
| Frontend routing | **Expo Router** (file-based) | `app/(protected)/settings/` already exists |

### The Five Services

| Service | Data Types Per User | Has BaseTenantEntity | Has RabbitMQ |
|---------|-------------------|---------------------|-------------|
| **IdentityService** | Tenant membership, auth config, OTP codes | No (Tenant uses BaseEntity) | Yes (publisher only) |
| **QuestionerService** | Templates (created by), Completed questionnaires | Yes | Yes (publisher only) |
| **OnlineMenuSaaS** | Menus (created by) | Yes | Yes (publisher only) |
| **ContentService** | Uploaded files/media | Yes | No (needs adding) |
| **NotificationService** | Notification history, preferences | Yes | Yes (consumer + publisher) |

### Critical Constraint: Users Live in Keycloak

The IdentityService database does **not** have a `Users` table. User records (id, username, email, name, roles, tenantId) are stored in Keycloak and accessed through the `IUserManagementService` abstraction. This means:

- GDPR entities must be keyed by `Guid UserId` (the Keycloak `sub` claim)
- There is no local FK to a Users table -- we use the Keycloak user ID directly
- The "disable user" step of account deletion uses `IUserManagementService.SetUserEnabledAsync()`
- The "hard delete" step uses `IUserManagementService.DeleteUserAsync()`

---

## 3. Phase 2: Data Rights Backend

### 3.1 Entity & Schema Design

Three new entities in `IdentityService.Core.Entities`:

#### ConsentRecord

```
ConsentRecord : BaseEntity
  UserId          : Guid          -- Keycloak sub
  TenantId        : Guid          -- Tenant context
  ConsentType     : string        -- "analytics", "marketing", "essential"
  IsGranted       : bool          -- true = consent given
  GrantedAt       : DateTime?     -- When consent was given
  RevokedAt       : DateTime?     -- When consent was revoked
  IpAddress       : string?       -- IP at time of consent action
  UserAgent       : string?       -- Browser/device info
  Version         : string        -- Privacy policy version consented to
```

**Rationale**: GDPR requires proving that consent was freely given and recording when it was granted/revoked. Storing IP and User-Agent provides evidence of the consent action. The `Version` field links consent to a specific privacy policy revision.

#### DataExportRequest

```
DataExportRequest : BaseEntity
  UserId           : Guid         -- Keycloak sub
  TenantId         : Guid         -- Tenant context
  Status           : DataExportStatus (enum: Pending, Processing, Completed, Failed, Expired)
  RequestedAt      : DateTime
  CompletedAt      : DateTime?
  ExpiresAt        : DateTime?    -- Download link expiry (72 hours after completion)
  DownloadUrl      : string?      -- Signed URL or blob path to the ZIP file
  FileSizeBytes    : long?        -- Size of the export file
  ErrorMessage     : string?      -- If Status = Failed
  ServiceResponses : string?      -- JSON blob tracking which services have responded
```

**Rationale**: The export is asynchronous because it aggregates data from 5 services. The `ServiceResponses` JSON tracks which services have replied, enabling partial-failure handling. Download URLs expire after 72 hours per GDPR data minimization.

#### AccountDeletionRequest

```
AccountDeletionRequest : BaseEntity
  UserId                 : Guid     -- Keycloak sub
  TenantId               : Guid     -- Tenant context
  Status                 : DeletionStatus (enum: PendingConfirmation, Confirmed, Cancelled, Processing, Completed)
  RequestedAt            : DateTime
  ConfirmedAt            : DateTime?
  ScheduledDeletionDate  : DateTime -- RequestedAt + 30 days
  CancelledAt            : DateTime?
  CompletedAt            : DateTime?
  ConfirmationToken      : string   -- Email verification token
  ConfirmationExpiresAt  : DateTime -- Token expiry (24 hours)
  Reason                 : string?  -- Optional user-provided reason
  IpAddress              : string?  -- IP at time of request
```

**Rationale**: The 30-day grace period is a common GDPR-compliant pattern. Email confirmation prevents accidental/malicious deletion. The `ConfirmationToken` is a cryptographically random string sent via email.

#### Enums (each in its own file per code standards)

```
// DataExportStatus.cs
const enum DataExportStatus { Pending, Processing, Completed, Failed, Expired }

// DeletionStatus.cs
const enum DeletionStatus { PendingConfirmation, Confirmed, Cancelled, Processing, Completed }

// ConsentType.cs (used as string values, but the well-known constants help)
static class ConsentTypes { Essential, Analytics, Marketing }
```

### 3.2 API Contracts

All endpoints in `IdentityService.API/Endpoints/Privacy/` (new domain folder).

#### POST `/api/privacy/data-export`

Request a data export for the authenticated user.

```
Request:  (empty -- user ID from JWT)
Response: { RequestId: Guid, Status: string, EstimatedCompletionMinutes: int }
Status:   202 Accepted
Auth:     Any authenticated user (User, Admin, superUser)
Rate:     1 request per 24 hours per user
```

#### GET `/api/privacy/data-export/{requestId}`

Check status or download a completed export.

```
Request:  Route param requestId
Response: { RequestId, Status, RequestedAt, CompletedAt?, ExpiresAt?, DownloadUrl?, FileSizeBytes? }
Status:   200 OK / 404 Not Found
Auth:     Owner only (UserId from JWT must match request.UserId)
```

#### GET `/api/privacy/data-export/{requestId}/download`

Stream the ZIP file directly.

```
Response: application/zip stream
Status:   200 OK / 404 / 410 Gone (expired)
Auth:     Owner only
```

#### POST `/api/privacy/delete-request`

Request account deletion with email confirmation.

```
Request:  { Reason?: string }
Response: { RequestId: Guid, ScheduledDeletionDate: DateTime, ConfirmationEmailSent: bool }
Status:   202 Accepted
Auth:     Any authenticated user
Rate:     1 active request per user
```

#### POST `/api/privacy/delete-request/{requestId}/confirm`

Confirm deletion via email token.

```
Request:  { ConfirmationToken: string }
Response: { RequestId, Status: "Confirmed", ScheduledDeletionDate }
Status:   200 OK / 400 Invalid Token / 410 Token Expired
Auth:     Public (token is the auth)
```

#### DELETE `/api/privacy/delete-request/{requestId}`

Cancel a pending deletion.

```
Response: { RequestId, Status: "Cancelled" }
Status:   200 OK / 404 / 409 (already processing/completed)
Auth:     Owner only
```

#### GET `/api/privacy/consent`

Get all consent records for the authenticated user.

```
Response: { Consents: [{ ConsentType, IsGranted, GrantedAt?, RevokedAt? }] }
Auth:     Any authenticated user
```

#### PUT `/api/privacy/consent`

Update consent preferences.

```
Request:  { Consents: [{ ConsentType: string, IsGranted: bool }] }
Response: { Updated: bool }
Auth:     Any authenticated user
```

### 3.3 Cross-Service Data Aggregation Strategy

#### Decision: MassTransit Request/Reply (Scatter-Gather)

**Options Considered:**

| Approach | Pros | Cons |
|----------|------|------|
| **A: Direct HTTP calls** | Simple, synchronous, easy to debug | Tight coupling, service discovery needed, IdentityService needs to know all service URLs, no retry/resilience built in |
| **B: MassTransit Request/Reply** | Decoupled, uses existing RabbitMQ infra, built-in retry/timeout, each service owns its data extraction | More complex, requires new contracts, async pattern |
| **C: Shared database reads** | Fastest | Violates service boundaries, tight DB coupling, unacceptable |

**Decision: Option B -- MassTransit Request/Reply**

**Rationale:**
1. The codebase already uses MassTransit + RabbitMQ for all inter-service communication.
2. Each service owns its data and knows best how to extract user-specific records.
3. MassTransit's `IRequestClient<T>` supports timeout/retry out of the box.
4. Adding HTTP endpoints for data export in every service would be a larger surface area to secure and maintain.
5. The pattern is naturally asynchronous, which fits the "queue and wait" model of GDPR data exports.

#### New Shared Package: `Messaging.Contracts`

Currently, cross-service events live in `NotificationService.Contracts`, but that package is specifically for notification events (`INotificationEvent`). GDPR events are not notifications -- they are operational commands. A new package is needed.

**Create**: `NuGetPackages/Messaging.Contracts/`

This package will contain:

```
Messaging.Contracts/
  Events/
    UserDeletedEvent.cs        -- Published when user deletion is confirmed
    UserDataExportRequest.cs   -- Request sent to all services
    UserDataExportResponse.cs  -- Response from each service
```

**All 5 services** reference this package. The IdentityService publishes; the other 4 services consume.

#### UserDataExportRequest (published by IdentityService)

```
public record UserDataExportRequest
{
    public Guid CorrelationId { get; init; }   // Maps to DataExportRequest.ExternalId
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
    public string ServiceName { get; init; }   // Target service name for routing
}
```

#### UserDataExportResponse (returned by each service)

```
public record UserDataExportResponse
{
    public Guid CorrelationId { get; init; }
    public string ServiceName { get; init; }   // "QuestionerService", "OnlineMenuSaaS", etc.
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }
    public string DataJson { get; init; }      // JSON of all user data from this service
    public int RecordCount { get; init; }
}
```

#### Aggregation Flow

1. IdentityService publishes `UserDataExportRequest` to a fanout exchange
2. Each service has a `UserDataExportConsumer` that:
   - Queries all entities where `UserId == request.UserId` (and optionally `TenantId`)
   - Serializes the results to JSON
   - Responds with `UserDataExportResponse`
3. IdentityService has a background worker (`DataExportAggregatorService`) that:
   - Waits for responses (with a 5-minute timeout per service)
   - Tracks which services have responded via `ServiceResponses` JSON
   - Once all 5 respond (or timeout), assembles the ZIP file
   - Uploads to SeaweedFS (ContentService storage) or local temp storage
   - Updates `DataExportRequest.Status = Completed` with download URL

**Alternative (simpler, recommended for v1):** Instead of a persistent background worker, use MassTransit's saga pattern or a simpler approach: IdentityService publishes the request, each service responds by publishing a `UserDataExportResponse` event. A consumer in IdentityService accumulates responses and finalizes when all arrive.

### 3.4 Account Deletion with Grace Period

#### State Machine

```
User clicks "Delete Account"
  |
  v
[PendingConfirmation] -- Email sent with confirmation token
  |
  |-- Token clicked within 24h --> [Confirmed] (ScheduledDeletionDate = now + 30 days)
  |-- Token expired / User cancels --> [Cancelled]
  |
  v (30 days pass -- background job)
[Processing] -- Keycloak user disabled, UserDeletedEvent published
  |
  v (all services confirm cleanup)
[Completed] -- Keycloak user hard-deleted, local records cleaned
```

#### Background Job: DeletionSchedulerService

A `BackgroundService` (hosted service) registered in IdentityService that runs periodically (every hour):

1. Query `AccountDeletionRequests` where `Status == Confirmed AND ScheduledDeletionDate <= DateTime.UtcNow`
2. For each:
   a. Set `Status = Processing`
   b. Disable user in Keycloak via `IUserManagementService.SetUserEnabledAsync(userId, false)`
   c. Publish `UserDeletedEvent` via MassTransit
   d. Wait for all services to acknowledge (or use fire-and-forget with eventual consistency)
   e. Hard-delete from Keycloak via `IUserManagementService.DeleteUserAsync(userId)`
   f. Set `Status = Completed`

### 3.5 UserDeletedEvent Cascade

#### Event Definition (in Messaging.Contracts)

```
public record UserDeletedEvent
{
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
    public DateTime DeletedAt { get; init; }
    public string DeletionType { get; init; }  // "gdpr_request", "admin_action"
}
```

This is **not** an `INotificationEvent` -- it is an operational event. It uses MassTransit's standard publish/subscribe, not the notification publisher.

#### Consumer Implementation Per Service

Each service registers a `UserDeletedConsumer : IConsumer<UserDeletedEvent>`:

| Service | Cleanup Actions |
|---------|----------------|
| **QuestionerService** | Delete all `CompletedQuestioner` where `UserId == event.UserId`. Anonymize `QuestionerTemplate.UserId` for templates that should be preserved (set to `Guid.Empty`). |
| **OnlineMenuSaaS** | Delete all `TenantMenus` where `UserId == event.UserId`. If menu has multiple editors, transfer ownership instead. |
| **ContentService** | Soft-delete all `ContentItem` where `CreatedByUserId == event.UserId`. Schedule blob cleanup. |
| **NotificationService** | Hard-delete all `NotificationEntity` and `NotificationPreference` where `UserId == event.UserId`. |
| **IdentityService** | Delete `ConsentRecords`, `DataExportRequests`, `AccountDeletionRequests` for this user. Delete `OtpCodes` for this user. |

#### MassTransit Registration

In each service's `Program.cs` / startup, add the consumer:

```csharp
// Example for QuestionerService Program.cs
builder.Services.AddRabbitMqMessaging(builder.Configuration, cfg =>
{
    cfg.AddConsumer<UserDeletedConsumer>();
});
```

For services that currently use `AddRabbitMqMessaging()` without consumers (publisher-only), the `configureConsumers` parameter already exists in the `ServiceCollectionExtensions.AddRabbitMqMessaging()` method.

For **ContentService**, which currently has no RabbitMQ at all, add:
1. `Messaging.RabbitMq` NuGet reference to `Content.Web.csproj`
2. `Messaging.Contracts` NuGet reference to `Content.Infrastructure.csproj`
3. RabbitMQ configuration section in `appsettings.json`
4. `builder.Services.AddRabbitMqMessaging(...)` in `Program.cs`

### 3.6 Consent Storage

Consent records are per-user, per-tenant, per-type. The design supports:

- Multiple consent types (essential, analytics, marketing -- extensible)
- Full audit trail (when granted, when revoked, from which IP)
- Policy versioning (which version of the privacy policy was accepted)

The cookie consent banner (Phase 1, already implemented in `CookieConsentBanner.tsx`) currently stores consent in `localStorage`. Phase 2 adds backend persistence so that consent survives device changes and is legally defensible.

**Flow:**
1. User interacts with cookie consent banner or `/settings/privacy` page
2. Frontend calls `PUT /api/privacy/consent` with updated preferences
3. Backend creates/updates `ConsentRecord` entities
4. Frontend also stores in `localStorage` for immediate use (no network latency for consent checks)

### 3.7 Migration Plan

#### New Migration: `AddGdprEntities`

Creates three tables in the IdentityService database:

```sql
-- ConsentRecords
CREATE TABLE "ConsentRecords" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY,
    "UserId" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "ConsentType" varchar(50) NOT NULL,
    "IsGranted" boolean NOT NULL DEFAULT false,
    "GrantedAt" timestamp with time zone,
    "RevokedAt" timestamp with time zone,
    "IpAddress" varchar(45),
    "UserAgent" varchar(500),
    "Version" varchar(20) NOT NULL DEFAULT '1.0',
    "ExternalId" uuid NOT NULL,
    "CreatedDate" timestamp with time zone NOT NULL,
    "LastUpdatedDate" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ConsentRecords" PRIMARY KEY ("Id")
);

CREATE INDEX "IX_ConsentRecords_UserId_TenantId" ON "ConsentRecords" ("UserId", "TenantId");
CREATE INDEX "IX_ConsentRecords_UserId_ConsentType" ON "ConsentRecords" ("UserId", "ConsentType");

-- DataExportRequests
CREATE TABLE "DataExportRequests" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY,
    "UserId" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "RequestedAt" timestamp with time zone NOT NULL,
    "CompletedAt" timestamp with time zone,
    "ExpiresAt" timestamp with time zone,
    "DownloadUrl" varchar(1000),
    "FileSizeBytes" bigint,
    "ErrorMessage" varchar(2000),
    "ServiceResponses" text,
    "ExternalId" uuid NOT NULL,
    "CreatedDate" timestamp with time zone NOT NULL,
    "LastUpdatedDate" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_DataExportRequests" PRIMARY KEY ("Id")
);

CREATE INDEX "IX_DataExportRequests_UserId" ON "DataExportRequests" ("UserId");
CREATE INDEX "IX_DataExportRequests_Status" ON "DataExportRequests" ("Status");

-- AccountDeletionRequests
CREATE TABLE "AccountDeletionRequests" (
    "Id" integer GENERATED BY DEFAULT AS IDENTITY,
    "UserId" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "RequestedAt" timestamp with time zone NOT NULL,
    "ConfirmedAt" timestamp with time zone,
    "ScheduledDeletionDate" timestamp with time zone NOT NULL,
    "CancelledAt" timestamp with time zone,
    "CompletedAt" timestamp with time zone,
    "ConfirmationToken" varchar(256) NOT NULL,
    "ConfirmationExpiresAt" timestamp with time zone NOT NULL,
    "Reason" varchar(1000),
    "IpAddress" varchar(45),
    "ExternalId" uuid NOT NULL,
    "CreatedDate" timestamp with time zone NOT NULL,
    "LastUpdatedDate" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_AccountDeletionRequests" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_AccountDeletionRequests_ConfirmationToken"
    ON "AccountDeletionRequests" ("ConfirmationToken");
CREATE INDEX "IX_AccountDeletionRequests_UserId_Status"
    ON "AccountDeletionRequests" ("UserId", "Status");
CREATE INDEX "IX_AccountDeletionRequests_ScheduledDeletionDate_Status"
    ON "AccountDeletionRequests" ("ScheduledDeletionDate", "Status")
    WHERE "Status" = 1; -- Confirmed only, used by background job
```

---

## 4. Phase 3: Frontend Settings

### 4.1 Route & Component Structure

#### New Route

File: `BaseClient/app/(protected)/settings/privacy.tsx`

This follows the existing pattern (see `notification-preferences.tsx` and `theme.tsx`).

#### Route Registration

Add to `BaseClient/src/navigation/routes.ts`:
```
PRIVACY_SETTINGS = '/settings/privacy'
```

#### Component Structure

```
BaseClient/src/components/Settings/Privacy/
  index.tsx                          -- Main PrivacySettingsScreen (exports)
  hooks/
    useDataExport.ts                 -- Hook wrapping data export API calls
    useAccountDeletion.ts            -- Hook wrapping deletion API calls
    useConsentPreferences.ts         -- Hook wrapping consent API calls
  components/
    DataExportSection.tsx            -- Data export request/status/download
    AccountDeletionSection.tsx       -- Delete account request/status/cancel
    ConsentManagementSection.tsx     -- Consent toggle management
    DeletionConfirmationModal.tsx    -- Multi-step deletion confirmation
    ExportStatusCard.tsx             -- Shows export progress/download link
```

This follows the module structure convention (4+ files require subdirectories).

### 4.2 Data Export UI Flow

```
[Privacy Settings Page]
  |
  +--> "Export My Data" section
       |
       +--> No pending export:
       |    [Request Data Export] button
       |    Click --> POST /api/privacy/data-export
       |    Shows: "Your data export is being prepared. You will be notified when it is ready."
       |
       +--> Pending export (Status = Processing):
       |    Shows: ExportStatusCard with spinner
       |    "Your data export is being prepared..."
       |    Auto-polls GET /api/privacy/data-export/{id} every 30 seconds
       |
       +--> Completed export:
       |    Shows: ExportStatusCard with download button
       |    "Your data export is ready. Download expires on {date}."
       |    [Download ZIP] button --> GET .../download
       |
       +--> Expired export:
            Shows: "Your previous export has expired."
            [Request New Export] button
```

### 4.3 Account Deletion UI Flow

```
[Privacy Settings Page]
  |
  +--> "Delete Account" section (danger zone)
       |
       +--> No pending deletion:
       |    Warning text explaining consequences
       |    [Delete My Account] button (destructive style)
       |    Click --> Opens DeletionConfirmationModal
       |
       |    DeletionConfirmationModal (3 steps):
       |      Step 1: "Are you sure?" with consequence list
       |              [Continue] / [Cancel]
       |      Step 2: "Type DELETE to confirm"
       |              Text input validation
       |              [Continue] / [Cancel]
       |      Step 3: Optional reason text area
       |              [Send Confirmation Email] --> POST /api/privacy/delete-request
       |              Shows: "Check your email for a confirmation link."
       |
       +--> Pending confirmation (Status = PendingConfirmation):
       |    Shows: "A confirmation email was sent. Click the link to confirm."
       |    "Link expires in {time remaining}"
       |    [Cancel Deletion Request] button
       |
       +--> Confirmed (Status = Confirmed):
       |    Shows: "Your account is scheduled for deletion on {date}."
       |    "You have {days remaining} days to cancel."
       |    [Cancel Deletion] button --> DELETE /api/privacy/delete-request/{id}
       |
       +--> Processing/Completed:
            Shows: "Your account is being deleted. This cannot be undone."
```

### 4.4 Consent Management UI

```
[Privacy Settings Page]
  |
  +--> "Cookie & Tracking Preferences" section
       |
       +--> Essential Cookies: Always on (disabled toggle, explanatory text)
       +--> Analytics Cookies: Toggle (on/off)
       +--> Marketing Cookies: Toggle (on/off)
       |
       +--> [Save Preferences] button --> PUT /api/privacy/consent
       |
       +--> Link to Privacy Policy (opens PrivacyPolicyModal)
```

This mirrors the cookie consent banner toggles but provides a persistent settings page for returning users.

---

## 5. Sequence Diagrams

### 5.1 Data Export Flow

```
User            Frontend          IdentityService         RabbitMQ         Service[1..4]
 |                |                    |                     |                  |
 |-- Click Export |                    |                     |                  |
 |                |-- POST /data-export ->                   |                  |
 |                |                    |-- Create DataExportRequest (Pending)   |
 |                |                    |-- Gather Identity data (Keycloak)      |
 |                |                    |-- Publish UserDataExportRequest -----> |
 |                |                    |                     |-- Deliver to --> |
 |                |                    |                     |                  |
 |                |<-- 202 { requestId } -                   |                  |
 |                |                    |                     |                  |
 |                |                    |                     |  (each service)  |
 |                |                    |                     |<-- Response ----- |
 |                |                    |<--- UserDataExportResponse             |
 |                |                    |   (accumulate in ServiceResponses)     |
 |                |                    |                     |                  |
 |                |                    |  (once all responses received          |
 |                |                    |   or 5-min timeout)                    |
 |                |                    |-- Assemble ZIP file                    |
 |                |                    |-- Store in temp storage                |
 |                |                    |-- Update Status = Completed            |
 |                |                    |-- Publish DataExportReadyEvent ------> |
 |                |                    |   (notification to user)               |
 |                |                    |                     |                  |
 |-- Poll status  |                    |                     |                  |
 |                |-- GET /data-export/{id} ->               |                  |
 |                |<-- { status: Completed, downloadUrl } -- |                  |
 |                |                    |                     |                  |
 |-- Download     |-- GET .../download ->                    |                  |
 |                |<-- ZIP stream ---- |                     |                  |
```

### 5.2 Account Deletion Flow

```
User          Frontend         IdentityService      Email        RabbitMQ      Services
 |              |                   |                 |             |             |
 |-- Delete --> |                   |                 |             |             |
 |              |-- POST /delete-request ->           |             |             |
 |              |                   |-- Create AccountDeletionRequest (PendingConfirmation)
 |              |                   |-- Generate ConfirmationToken                |
 |              |                   |-- Send confirmation email -> |             |
 |              |<-- 202 { requestId } -              |             |             |
 |              |                   |                 |             |             |
 |-- Click email link -------------|------------------|             |             |
 |              |                   |                 |             |             |
 |              |-- POST .../confirm { token } ->     |             |             |
 |              |                   |-- Validate token              |             |
 |              |                   |-- Status = Confirmed          |             |
 |              |                   |-- ScheduledDeletionDate = now + 30d         |
 |              |<-- 200 { confirmed, scheduledDate } |             |             |
 |              |                   |                 |             |             |
 |              |   ... 30 days pass ...              |             |             |
 |              |                   |                 |             |             |
 |              |           [DeletionSchedulerService]              |             |
 |              |                   |-- Query overdue confirmed requests          |
 |              |                   |-- Status = Processing        |             |
 |              |                   |-- Disable user in Keycloak   |             |
 |              |                   |-- Publish UserDeletedEvent ------------>   |
 |              |                   |                 |             |-- Deliver-> |
 |              |                   |                 |             |             |
 |              |                   |                 |             |  (cleanup)  |
 |              |                   |                 |             |<-- ack ---- |
 |              |                   |                 |             |             |
 |              |                   |-- Hard-delete from Keycloak  |             |
 |              |                   |-- Delete local GDPR records  |             |
 |              |                   |-- Status = Completed         |             |
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization

| Endpoint | Auth Required | Owner Check | Rate Limit |
|----------|--------------|-------------|------------|
| POST /data-export | JWT | N/A (creates for self) | 1/24h per user |
| GET /data-export/{id} | JWT | UserId must match | Standard |
| GET .../download | JWT | UserId must match | Standard |
| POST /delete-request | JWT | N/A (creates for self) | 1 active per user |
| POST .../confirm | None | Token-based auth | 5 attempts/hour per IP |
| DELETE /delete-request/{id} | JWT | UserId must match | Standard |
| GET /consent | JWT | Returns own data | Standard |
| PUT /consent | JWT | Updates own data | Standard |

### 6.2 Data Protection

- **Export files are encrypted at rest** using AES-256 before storage
- **Download URLs are signed** with a per-request token and 72-hour expiry
- **Confirmation tokens** are generated using `RandomNumberGenerator` (256-bit)
- **PII in transit**: All APIs require HTTPS (enforced by HSTS)
- **Audit logging**: All GDPR operations are logged with correlation IDs (not PII values)

### 6.3 Rate Limiting

- Data export: Maximum 1 request per 24 hours per user (prevents abuse)
- Deletion request: Maximum 1 active request per user at any time
- Confirmation endpoint: 5 attempts per hour per IP (brute-force protection)
- All endpoints use the existing `RateLimiting.Defaults` package

### 6.4 OWASP Mitigations

| Threat | Mitigation |
|--------|-----------|
| **IDOR** (Insecure Direct Object Reference) | All endpoints verify `request.UserId == JWT.sub` |
| **CSRF** | JWT Bearer auth (not cookie-based), no CSRF risk |
| **Data Leakage** | Export downloads require fresh JWT, signed URLs expire |
| **Injection** | Parameterized queries via EF Core, input validation via FluentValidation |
| **Brute Force** | Rate limiting on confirmation tokens, account lockout after 5 failed attempts |
| **Replay Attack** | Confirmation tokens are single-use, marked as consumed after use |

### 6.5 Tenant Isolation

- All queries filter by `UserId` AND `TenantId` from JWT claims
- Cross-tenant data leakage is prevented by the existing `ICurrentTenantService` pattern
- The `UserDeletedEvent` includes `TenantId` so services can scope cleanup correctly
- A user belonging to multiple tenants would need separate deletion requests per tenant

---

## 7. Files to Create & Modify

### 7.1 New Shared Package

```
NuGetPackages/Messaging.Contracts/
  src/Messaging.Contracts/
    Messaging.Contracts.csproj
    Events/
      UserDeletedEvent.cs
      UserDataExportRequest.cs
      UserDataExportResponse.cs
```

### 7.2 IdentityService Changes

**New files:**
```
IdentityService/src/IdentityService.Core/
  Entities/
    ConsentRecord.cs
    DataExportRequest.cs
    AccountDeletionRequest.cs
  Enums/
    DataExportStatus.cs
    DeletionStatus.cs
    ConsentTypes.cs
  Interfaces/
    IDataExportService.cs          -- Abstraction for export orchestration

IdentityService/src/IdentityService.Infrastructure/
  Data/
    Migrations/
      YYYYMMDD_AddGdprEntities.cs  -- EF Core migration
  Services/
    DataExportAggregatorService.cs  -- Background service for export assembly
    DeletionSchedulerService.cs     -- Background service for grace period expiry
  Messaging/
    Consumers/
      UserDataExportResponseConsumer.cs  -- Handles responses from services

IdentityService/src/IdentityService.API/
  Endpoints/Privacy/
    RequestDataExport.cs            -- POST /privacy/data-export
    RequestDataExport.Validator.cs
    GetDataExportStatus.cs          -- GET /privacy/data-export/{id}
    DownloadDataExport.cs           -- GET /privacy/data-export/{id}/download
    RequestAccountDeletion.cs       -- POST /privacy/delete-request
    RequestAccountDeletion.Validator.cs
    ConfirmAccountDeletion.cs       -- POST /privacy/delete-request/{id}/confirm
    ConfirmAccountDeletion.Validator.cs
    CancelAccountDeletion.cs        -- DELETE /privacy/delete-request/{id}
    GetConsent.cs                   -- GET /privacy/consent
    UpdateConsent.cs                -- PUT /privacy/consent
    UpdateConsent.Validator.cs

IdentityService/tests/IdentityService.Tests/
  DataExportAggregatorServiceTests.cs
  DeletionSchedulerServiceTests.cs
  ConsentEndpointTests.cs
```

**Modified files:**
```
IdentityService/src/IdentityService.Infrastructure/Data/IdentityDbContext.cs
  -- Add DbSets for ConsentRecord, DataExportRequest, AccountDeletionRequest
  -- Add entity configurations in OnModelCreating

IdentityService/src/IdentityService.API/ProgramExtensions.cs
  -- Register DataExportAggregatorService as hosted service
  -- Register DeletionSchedulerService as hosted service
  -- Add Messaging.Contracts package reference
```

### 7.3 QuestionerService Changes

**New files:**
```
QuestionerService/Questioner/src/Questioner.Infrastructure/
  Messaging/
    Consumers/
      UserDeletedConsumer.cs
      UserDataExportConsumer.cs

QuestionerService/Questioner/tests/Questioner.UnitTests/
  Messaging/
    UserDeletedConsumerTests.cs
    UserDataExportConsumerTests.cs
```

**Modified files:**
```
QuestionerService/Questioner/src/Questioner.Web/Program.cs
  -- Add consumer registration to AddRabbitMqMessaging()
QuestionerService/Questioner/src/Questioner.Infrastructure/Questioner.Infrastructure.csproj
  -- Add Messaging.Contracts package reference
```

### 7.4 OnlineMenuSaaS Changes

**New files:**
```
OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Infrastructure/
  Messaging/
    Consumers/
      UserDeletedConsumer.cs
      UserDataExportConsumer.cs

OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/
  Messaging/
    UserDeletedConsumerTests.cs
    UserDataExportConsumerTests.cs
```

**Modified files:**
```
OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Program.cs
  -- Add consumer registration
OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Infrastructure/OnlineMenu.Infrastructure.csproj
  -- Add Messaging.Contracts package reference
```

### 7.5 ContentService Changes

**New files:**
```
ContentService/Content/src/Content.Infrastructure/
  Messaging/
    Consumers/
      UserDeletedConsumer.cs
      UserDataExportConsumer.cs

ContentService/Content/tests/Content.UnitTests/
  Messaging/
    UserDeletedConsumerTests.cs
    UserDataExportConsumerTests.cs
```

**Modified files:**
```
ContentService/Content/src/Content.Web/Content.Web.csproj
  -- Add Messaging.RabbitMq and Messaging.Contracts package references
ContentService/Content/src/Content.Web/Program.cs
  -- Add AddRabbitMqMessaging() with consumers
ContentService/Content/src/Content.Infrastructure/Content.Infrastructure.csproj
  -- Add Messaging.Contracts package reference
Content appsettings.json
  -- Add RabbitMQ configuration section
```

### 7.6 NotificationService Changes

**New files:**
```
NotificationService/Notification/src/Notification.Infrastructure/
  Messaging/
    Consumers/
      UserDeletedConsumer.cs
      UserDataExportConsumer.cs

NotificationService/Notification/tests/Notification.UnitTests/
  Messaging/
    UserDeletedConsumerTests.cs
    UserDataExportConsumerTests.cs
```

**Modified files:**
```
NotificationService/Notification/src/Notification.Web/Program.cs
  -- Add UserDeletedConsumer and UserDataExportConsumer to MassTransit registration
NotificationService/Notification/src/Notification.Infrastructure/Notification.Infrastructure.csproj
  -- Add Messaging.Contracts package reference
```

### 7.7 Frontend (BaseClient) Changes

**New files:**
```
BaseClient/app/(protected)/settings/privacy.tsx  -- Route page

BaseClient/src/components/Settings/Privacy/
  index.tsx
  hooks/
    useDataExport.ts
    useAccountDeletion.ts
    useConsentPreferences.ts
  components/
    DataExportSection.tsx
    AccountDeletionSection.tsx
    ConsentManagementSection.tsx
    DeletionConfirmationModal.tsx
    ExportStatusCard.tsx

BaseClient/src/shared/testIds/ (or testIds.ts update)
  -- Add PRIVACY_SETTINGS_* test IDs

BaseClient/src/localization/locales/en/features.json
  -- Add "settings.privacy.*" translation keys
```

**Modified files:**
```
BaseClient/src/navigation/routes.ts
  -- Add PRIVACY_SETTINGS route

BaseClient/src/components/Settings/index.ts
  -- Re-export PrivacySettingsScreen

BaseClient/src/components/Sidebar/Sidebar.tsx (or navigation config)
  -- Add Privacy Settings nav item under Settings group

BaseClient/src/components/CookieConsent/hooks/useCookieConsent.ts
  -- Add backend sync (call PUT /consent when preferences change)
```

---

## 8. Testing Strategy

### 8.1 Backend Unit Tests

| Test File | What It Tests |
|-----------|--------------|
| `ConsentEndpointTests.cs` | GET/PUT consent CRUD, validation, owner-only access |
| `DataExportAggregatorServiceTests.cs` | Response accumulation, timeout handling, ZIP assembly, partial failure |
| `DeletionSchedulerServiceTests.cs` | Grace period expiry, Keycloak disable/delete, event publishing |
| `UserDeletedConsumerTests.cs` (per service) | Correct entity cleanup per service |
| `UserDataExportConsumerTests.cs` (per service) | Correct data extraction per service |

### 8.2 Frontend Unit Tests

| Test File | What It Tests |
|-----------|--------------|
| `useDataExport.test.ts` | API call logic, polling behavior, error handling |
| `useAccountDeletion.test.ts` | State machine transitions, API calls, validation |
| `useConsentPreferences.test.ts` | Load/save logic, optimistic updates |

### 8.3 E2E Tests (Playwright)

| Suite | Scenarios |
|-------|----------|
| `privacy-settings.spec.ts` | Navigate to settings, verify sections render |
| `data-export.spec.ts` | Request export, verify status polling, download |
| `account-deletion.spec.ts` | Request deletion, cancel deletion, verify grace period display |
| `consent-management.spec.ts` | Toggle preferences, verify persistence across reload |

---

## 9. Open Questions & Decisions

### 9.1 Decided

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Cross-service communication for data export | MassTransit Request/Reply | Consistent with existing infra, decoupled |
| 2 | Where to store GDPR entities | IdentityService PostgreSQL | IdentityService owns user lifecycle |
| 3 | Grace period duration | 30 days | Industry standard, GDPR-compliant |
| 4 | Export file format | JSON inside ZIP | Machine-readable, portable |
| 5 | Event package location | New `Messaging.Contracts` NuGet | Separation from notification-specific contracts |

### 9.2 Resolved (2026-03-13)

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Where to store export ZIP files? | **SeaweedFS** | Consistent with ContentService pattern, already deployed, supports signed/expiring URLs |
| 2 | Email delivery mechanism for confirmation emails? | **Notification pipeline** | Reuses existing email infrastructure, consistent delivery, matching visual style. Latency is acceptable (~1-5s end-to-end) |
| 3 | Multi-tenant user deletion scope? | **Per-tenant** | User can leave one org while staying in another. Orphan check before Keycloak hard-delete. Each deletion request is tenant-scoped. |
| 4 | Should data export include Keycloak user profile? | **Yes, include full profile** | GDPR requires "all personal data", Keycloak profile is personal data |
| 5 | Background job framework? | **Simple `BackgroundService`** | Simpler, no new dependencies. Upgrade if we need persistent job queues later. |

---

## Implementation Order

### Phase 2 (Backend) -- Recommended Order

1. **Create `Messaging.Contracts` NuGet package** with event definitions
2. **Create entities + migration** in IdentityService (ConsentRecord, DataExportRequest, AccountDeletionRequest)
3. **Implement consent endpoints** (simplest, no cross-service dependency)
4. **Implement data export request endpoint** + `UserDataExportConsumer` in all 5 services
5. **Implement `DataExportAggregatorService`** background worker
6. **Implement account deletion endpoints** + email confirmation flow
7. **Implement `DeletionSchedulerService`** + `UserDeletedConsumer` in all 5 services
8. **Add RabbitMQ to ContentService** (prerequisite for steps 4 and 7)

### Phase 3 (Frontend) -- Recommended Order

1. **Add route and empty page** (`/settings/privacy`)
2. **Implement consent management section** (connects to existing cookie consent)
3. **Implement data export section** with polling
4. **Implement account deletion section** with multi-step modal
5. **Add translations** to `features.json`
6. **Add test IDs** and E2E tests

---

*Document created: 2026-03-13*
*Author: Chief Architect*

# WebSocket Notification Service - Architectural Plan

> **Status**: READY FOR IMPLEMENTATION
> **Priority**: High
> **Complexity**: High
> **Estimated Effort**: 6-8 weeks
> **Architecture Review**: ✅ APPROVED by Chief Architect

---

## Table of Contents

1. [**FINALIZED DECISIONS & CHECKLISTS**](#finalized-decisions--checklists) ⬅️ START HERE
   - [Architecture Decisions Summary](#architecture-decisions-summary)
   - [Infrastructure Requirements](#infrastructure-requirements)
   - [Service Structure](#service-structure)
   - [NPM Package Structure](#npm-package-structure)
   - [NuGet Packages](#nuget-packages)
   - [Implementation Checklists](#implementation-checklists)
2. [Executive Summary](#executive-summary)
3. [Additional Requirements: User Notification Control & Desktop Push](#additional-requirements-user-notification-control--desktop-push)
4. [Problem Statement](#problem-statement)
5. [Architecture Overview](#architecture-overview)
   - [Redis Backplane: What It Does (Detailed Explanation)](#redis-backplane-what-it-does-detailed-explanation)
6. [Technology Stack](#technology-stack)
7. [System Design](#system-design)
8. [Scalability Patterns - Decision Required](#scalability-patterns---decision-required)
9. [Backplane Options Comparison](#backplane-options-comparison)
10. [ASP.NET Core 8+ Features](#aspnet-core-8-features)
11. [Multi-Tenancy](#multi-tenancy)
12. [Security Considerations](#security-considerations)
13. [Frontend Integration](#frontend-integration)
14. [Database Schema](#database-schema)
15. [API Contracts](#api-contracts)
16. [Implementation Phases](#implementation-phases)
    - Phase 1-5: Core WebSocket Notification Service
    - **Phase 6: Global Notification Toggle**
    - **Phase 7: Service Worker for OS Notifications**
17. [Testing Strategy](#testing-strategy)
18. [Monitoring & Observability](#monitoring--observability)
19. [Final Recommendation](#final-recommendation)
20. [Messaging Architecture: RabbitMQ vs Redis](#messaging-architecture-rabbitmq-vs-redis)

---

## FINALIZED DECISIONS & CHECKLISTS

> **✅ All architectural decisions have been reviewed and approved.**
> **This section serves as the implementation blueprint.**

---

### Architecture Decisions Summary

| # | Decision | **CHOSEN** | Rationale |
|---|----------|------------|-----------|
| 1 | **Service-to-Service Messaging** | ✅ **RabbitMQ** | Durable queues, at-least-once delivery, survives restarts |
| 2 | **SignalR Backplane** | ✅ **Redis** | MS-supported, sub-millisecond latency, official package |
| 3 | **Database Strategy** | ✅ **Hybrid: Redis + Dedicated PostgreSQL** | Redis for real-time, PostgreSQL for history/audit |
| 4 | **Scaling Approach** | ✅ **Skip Negotiation + Redis Backplane** | No sticky sessions needed, simple load balancer |
| 5 | **ASP.NET Core Version** | ✅ **.NET 8+ with Stateful Reconnect** | Latest features, better reconnection handling |
| 6 | **Transport Protocol** | ✅ **WebSocket-only** | 98%+ browser support, simplifies architecture |
| 7 | **External Push Services** | ✅ **None (SignalR only)** | Privacy, no third-party dependency, full control |
| 8 | **Frontend Package** | ✅ **`@dloizides/notification-client` npm package** | Micro frontend architecture support |

---

### Infrastructure Requirements

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE COMPONENTS                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐        │
│   │      RABBITMQ       │    │       REDIS         │    │     POSTGRESQL      │        │
│   │                     │    │                     │    │   (Notification DB) │        │
│   │  • AMQP 5672        │    │  • Port 6379        │    │  • Port 5432        │        │
│   │  • Management 15672 │    │  • No persistence   │    │  • Dedicated DB     │        │
│   │                     │    │    (backplane only) │    │  • NOT shared with  │        │
│   │  Purpose:           │    │                     │    │    Identity DB      │        │
│   │  Service-to-Service │    │  Purpose:           │    │                     │        │
│   │  Event Messaging    │    │  SignalR Backplane  │    │  Purpose:           │        │
│   │                     │    │  + Real-time cache  │    │  Notification       │        │
│   │  • Durable queues   │    │  + Unread counts    │    │  History, Prefs,    │        │
│   │  • Message persist  │    │  + Recent (24h)     │    │  Audit Trail        │        │
│   │  • Dead letter Q    │    │                     │    │                     │        │
│   └─────────────────────┘    └─────────────────────┘    └─────────────────────┘        │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │                        NOTIFICATION SERVICE                                      │  │
│   │                                                                                  │  │
│   │   • Multiple instances (horizontal scaling)                                      │  │
│   │   • SignalR Hub with Redis Backplane                                             │  │
│   │   • RabbitMQ Consumer (MassTransit)                                              │  │
│   │   • FastEndpoints for REST API                                                   │  │
│   │   • Background workers for sync                                                  │  │
│   │                                                                                  │  │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Docker Compose Additions

```yaml
# Add to docker-compose.e2e.yml

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: e2e-rabbitmq
    ports:
      - "5672:5672"     # AMQP
      - "15672:15672"   # Management UI (guest/guest)
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - e2e-network
    volumes:
      - e2e-rabbitmq-data:/var/lib/rabbitmq

  redis:
    image: redis:7-alpine
    container_name: e2e-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly no --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - e2e-network

  notification-db:
    image: postgres:16
    container_name: e2e-notification-db
    environment:
      - POSTGRES_USER=NotificationDB
      - POSTGRES_PASSWORD=NotificationDB
      - POSTGRES_DB=NotificationDB
    ports:
      - "5436:5432"   # Different port to avoid conflict
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U NotificationDB -d NotificationDB"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - e2e-network
    volumes:
      - e2e-notification-db:/var/lib/postgresql/data

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

volumes:
  e2e-rabbitmq-data:
  e2e-notification-db:
```

---

### Service Structure

Following the same Clean Architecture pattern as **QuestionerService** and **OnlineMenuService**:

```
NotificationService/
├── docker-compose.yml
├── init-db.sql
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
    │   ├── Notification.AspireHost/          # .NET Aspire orchestration
    │   │   └── Program.cs
    │   │
    │   ├── Notification.Core/                # Domain Layer
    │   │   ├── NotificationAggregate/
    │   │   │   ├── Notification.cs           # Entity extends BaseTenantEntity
    │   │   │   ├── NotificationType.cs       # const enum
    │   │   │   ├── NotificationPriority.cs   # const enum
    │   │   │   └── DeliveryChannel.cs        # const enum (in_app, os, both)
    │   │   ├── PreferenceAggregate/
    │   │   │   └── NotificationPreference.cs
    │   │   └── Interfaces/
    │   │       ├── INotificationRepository.cs
    │   │       └── IPreferenceRepository.cs
    │   │
    │   ├── Notification.UseCases/            # Application Layer (CQRS)
    │   │   ├── Notifications/
    │   │   │   ├── Commands/
    │   │   │   │   ├── SendNotification/
    │   │   │   │   │   ├── SendNotificationCommand.cs
    │   │   │   │   │   └── SendNotificationHandler.cs
    │   │   │   │   ├── MarkAsRead/
    │   │   │   │   ├── MarkAllAsRead/
    │   │   │   │   └── DeleteNotification/
    │   │   │   └── Queries/
    │   │   │       ├── GetUserNotifications/
    │   │   │       ├── GetUnreadCount/
    │   │   │       └── GetNotificationById/
    │   │   └── Preferences/
    │   │       ├── Commands/
    │   │       │   └── UpdatePreferences/
    │   │       └── Queries/
    │   │           └── GetPreferences/
    │   │
    │   ├── Notification.Infrastructure/      # Infrastructure Layer
    │   │   ├── Data/
    │   │   │   ├── AppDbContext.cs           # With tenant filtering
    │   │   │   ├── Migrations/
    │   │   │   └── Configurations/
    │   │   │       ├── NotificationConfiguration.cs
    │   │   │       └── PreferenceConfiguration.cs
    │   │   ├── Repositories/
    │   │   │   ├── NotificationRepository.cs
    │   │   │   └── PreferenceRepository.cs
    │   │   ├── Messaging/
    │   │   │   ├── RabbitMqConfiguration.cs
    │   │   │   └── Consumers/
    │   │   │       ├── QuestionnaireSubmittedConsumer.cs
    │   │   │       ├── TemplateUpdatedConsumer.cs
    │   │   │       ├── UserInvitedConsumer.cs
    │   │   │       └── MenuUpdatedConsumer.cs
    │   │   ├── Caching/
    │   │   │   ├── RedisNotificationCache.cs
    │   │   │   └── INotificationCache.cs
    │   │   └── SignalR/
    │   │       └── RedisBackplaneConfiguration.cs
    │   │
    │   ├── Notification.ServiceDefaults/     # Service Defaults
    │   │   └── Extensions.cs
    │   │
    │   └── Notification.Web/                 # API Layer
    │       ├── Program.cs
    │       ├── appsettings.json
    │       ├── Dockerfile
    │       ├── Hubs/
    │       │   └── NotificationHub.cs        # SignalR Hub
    │       ├── Endpoints/
    │       │   ├── Notifications/
    │       │   │   ├── GetNotificationsEndpoint.cs
    │       │   │   ├── MarkAsReadEndpoint.cs
    │       │   │   └── GetUnreadCountEndpoint.cs
    │       │   └── Preferences/
    │       │       ├── GetPreferencesEndpoint.cs
    │       │       └── UpdatePreferencesEndpoint.cs
    │       └── BackgroundServices/
    │           ├── NotificationSyncWorker.cs  # Redis → PostgreSQL sync
    │           └── ExpiredNotificationCleaner.cs
    │
    └── tests/
        ├── Notification.UnitTests/
        │   ├── UseCases/
        │   └── Core/
        └── Notification.IntegrationTests/
            ├── Endpoints/
            └── SignalR/
```

---

### NPM Package Structure

**Package Name:** `@dloizides/notification-client`

```
NPMPackages/
└── notifications/
    ├── package.json
    ├── tsconfig.json
    ├── rollup.config.js
    ├── README.md
    │
    ├── src/
    │   ├── index.ts                          # Main exports
    │   │
    │   ├── core/                             # Framework-agnostic core
    │   │   ├── NotificationClient.ts         # SignalR connection manager
    │   │   ├── NotificationStore.ts          # State management (zustand)
    │   │   ├── types.ts                      # TypeScript interfaces
    │   │   └── constants.ts                  # Event names, defaults
    │   │
    │   ├── react/                            # React bindings
    │   │   ├── index.ts
    │   │   ├── NotificationProvider.tsx      # Context provider (singleton)
    │   │   ├── useNotifications.ts           # Main hook
    │   │   ├── useUnreadCount.ts             # Unread count hook
    │   │   ├── useNotificationActions.ts     # Mark read, dismiss
    │   │   └── useNotificationPreferences.ts # User preferences hook
    │   │
    │   ├── components/                       # Pre-built UI components
    │   │   ├── index.ts
    │   │   ├── NotificationBell.tsx          # Bell icon with badge
    │   │   ├── NotificationList.tsx          # Dropdown list
    │   │   ├── NotificationItem.tsx          # Single notification
    │   │   └── NotificationToast.tsx         # Toast popup
    │   │
    │   └── workers/                          # Service Worker utilities
    │       ├── osNotificationService.ts      # OS notification display
    │       └── sw-notifications.ts           # Service Worker code
    │
    └── dist/                                 # Build output
        ├── index.esm.js                      # ES Modules
        ├── index.cjs.js                      # CommonJS
        ├── index.d.ts                        # TypeScript declarations
        ├── react.esm.js
        ├── react.cjs.js
        ├── react.d.ts
        ├── components.esm.js
        ├── components.cjs.js
        └── components.d.ts
```

#### package.json

```json
{
  "name": "@dloizides/notification-client",
  "version": "1.0.0",
  "description": "Real-time notification client for micro frontend architecture",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react.esm.js",
      "require": "./dist/react.cjs.js",
      "types": "./dist/react.d.ts"
    },
    "./components": {
      "import": "./dist/components.esm.js",
      "require": "./dist/components.cjs.js",
      "types": "./dist/components.d.ts"
    }
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-native": ">=0.70.0"
  },
  "peerDependenciesMeta": {
    "react-native": { "optional": true }
  },
  "dependencies": {
    "@microsoft/signalr": "^8.0.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "rollup": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```

#### Micro Frontend Integration

```typescript
// Shell app (host) - owns the NotificationProvider
import { NotificationProvider } from '@dloizides/notification-client/react';
import { NotificationBell } from '@dloizides/notification-client/components';

function ShellApp() {
  const { accessToken } = useAuth();

  return (
    <NotificationProvider
      hubUrl={process.env.NOTIFICATION_HUB_URL}
      accessToken={accessToken}
      onNotification={(n) => console.log('New notification:', n)}
    >
      <Header>
        <NotificationBell />  {/* Bell icon with unread count */}
      </Header>
      <MicroFrontendContainer />
    </NotificationProvider>
  );
}

// Any micro frontend - just uses hooks
import { useUnreadCount, useNotifications } from '@dloizides/notification-client/react';

function OrdersMicroFrontend() {
  const unreadCount = useUnreadCount();
  const { notifications, markAsRead } = useNotifications();

  // Filter notifications relevant to this MFE
  const orderNotifications = notifications.filter(n => n.category === 'orders');

  return <OrdersPage notifications={orderNotifications} />;
}
```

**Module Federation Config (Critical for Micro Frontends):**

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      shared: {
        '@dloizides/notification-client': {
          singleton: true,  // CRITICAL: Only ONE SignalR connection
          requiredVersion: '^1.0.0',
        },
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

---

### NuGet Packages

#### 1. NotificationService.Contracts

Event DTOs that other services reference to publish notification events.

```
NuGetPackages/
└── NotificationService.Contracts/
    └── src/
        └── NotificationService.Contracts/
            ├── NotificationService.Contracts.csproj
            │
            ├── Events/
            │   ├── INotificationEvent.cs
            │   ├── QuestionnaireSubmittedEvent.cs
            │   ├── TemplateUpdatedEvent.cs
            │   ├── MenuUpdatedEvent.cs
            │   ├── UserInvitedEvent.cs
            │   ├── SubscriptionExpiringEvent.cs
            │   └── PaymentDueEvent.cs
            │
            └── DTOs/
                ├── NotificationPriority.cs
                └── NotificationType.cs
```

**INotificationEvent.cs:**
```csharp
namespace NotificationService.Contracts.Events;

public interface INotificationEvent
{
    Guid TenantId { get; }
    Guid UserId { get; }          // Target user (sub from JWT)
    string NotificationType { get; }
    NotificationPriority Priority { get; }
    DateTimeOffset OccurredAt { get; }
}
```

**QuestionnaireSubmittedEvent.cs:**
```csharp
namespace NotificationService.Contracts.Events;

public sealed record QuestionnaireSubmittedEvent : INotificationEvent
{
    public required Guid TenantId { get; init; }
    public required Guid UserId { get; init; }          // Template owner
    public required Guid QuestionnaireId { get; init; }
    public required string TemplateName { get; init; }
    public required string RespondentName { get; init; }
    public string NotificationType => "questionnaire.submitted";
    public NotificationPriority Priority => NotificationPriority.Normal;
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
```

#### 2. Messaging.RabbitMq (Optional - Shared Publisher)

```
NuGetPackages/
└── Messaging.RabbitMq/
    └── src/
        └── Messaging.RabbitMq/
            ├── Messaging.RabbitMq.csproj
            ├── RabbitMqConfiguration.cs
            ├── Extensions/
            │   └── ServiceCollectionExtensions.cs
            └── Publishers/
                └── EventPublisher.cs
```

---

### Implementation Checklists

#### Phase 0: Infrastructure Setup

- [ ] **RabbitMQ**
  - [ ] Add RabbitMQ service to `docker-compose.e2e.yml`
  - [ ] Verify management UI accessible at `http://localhost:15672`
  - [ ] Create exchanges and queues for notification events
  - [ ] Test basic publish/subscribe with MassTransit

- [ ] **Redis**
  - [ ] Add Redis service to `docker-compose.e2e.yml`
  - [ ] Verify connection with `redis-cli ping`
  - [ ] Configure for SignalR backplane (no persistence)

- [ ] **PostgreSQL (Notification DB)**
  - [ ] Add `notification-db` service to `docker-compose.e2e.yml`
  - [ ] Create initial migration scripts
  - [ ] Verify connection from Notification Service

---

#### Phase 1: Backend - Notification Service Core

- [ ] **Project Setup**
  - [ ] Create `NotificationService/` directory structure
  - [ ] Initialize solution following Questioner/OnlineMenu pattern
  - [ ] Add `Directory.Build.props` and `Directory.Packages.props`
  - [ ] Configure `nuget.config` for internal packages

- [ ] **Notification.Core**
  - [ ] Create `Notification` entity extending `BaseTenantEntity`
  - [ ] Create `NotificationPreference` entity
  - [ ] Define `const enum` for NotificationType, Priority, DeliveryChannel
  - [ ] Define repository interfaces

- [ ] **Notification.Infrastructure**
  - [ ] Create `AppDbContext` with tenant filtering
  - [ ] Implement repositories
  - [ ] Create EF Core migrations
  - [ ] Configure RabbitMQ with MassTransit
  - [ ] Configure Redis caching layer
  - [ ] Create event consumers (Questionnaire, Template, User, Menu)

- [ ] **Notification.UseCases**
  - [ ] Implement `SendNotificationCommand` + Handler
  - [ ] Implement `MarkAsReadCommand` + Handler
  - [ ] Implement `MarkAllAsReadCommand` + Handler
  - [ ] Implement `GetUserNotificationsQuery` + Handler
  - [ ] Implement `GetUnreadCountQuery` + Handler
  - [ ] Implement `UpdatePreferencesCommand` + Handler
  - [ ] Implement `GetPreferencesQuery` + Handler

- [ ] **Notification.Web**
  - [ ] Create SignalR `NotificationHub`
  - [ ] Configure Redis backplane for SignalR
  - [ ] Create FastEndpoints for REST API
  - [ ] Add JWT authentication middleware
  - [ ] Add tenant extraction middleware
  - [ ] Create background workers (Redis → PostgreSQL sync)

- [ ] **Testing**
  - [ ] Unit tests for all handlers
  - [ ] Integration tests for SignalR Hub
  - [ ] Integration tests for RabbitMQ consumers

---

#### Phase 2: Backend - NuGet Packages

- [ ] **NotificationService.Contracts**
  - [ ] Create project structure
  - [ ] Define `INotificationEvent` interface
  - [ ] Create event classes for all notification types
  - [ ] Build and publish NuGet package
  - [ ] Update other services to reference package

- [ ] **Update Existing Services**
  - [ ] **QuestionerService**: Add event publishing for questionnaire submissions
  - [ ] **OnlineMenuService**: Add event publishing for menu updates
  - [ ] **IdentityService**: Add event publishing for user invitations
  - [ ] Test end-to-end event flow

---

#### Phase 3: Frontend - NPM Package

- [ ] **Package Setup**
  - [ ] Create `NPMPackages/notifications/` directory
  - [ ] Initialize `package.json` with correct exports
  - [ ] Configure Rollup for ESM/CJS builds
  - [ ] Configure TypeScript

- [ ] **Core Module**
  - [ ] Implement `NotificationClient` (SignalR wrapper)
  - [ ] Implement `NotificationStore` (Zustand state)
  - [ ] Define TypeScript types
  - [ ] Add automatic reconnection logic
  - [ ] Add connection state management

- [ ] **React Bindings**
  - [ ] Implement `NotificationProvider` (singleton context)
  - [ ] Implement `useNotifications` hook
  - [ ] Implement `useUnreadCount` hook
  - [ ] Implement `useNotificationActions` hook
  - [ ] Implement `useNotificationPreferences` hook

- [ ] **Components**
  - [ ] Create `NotificationBell` component
  - [ ] Create `NotificationList` component
  - [ ] Create `NotificationItem` component
  - [ ] Create `NotificationToast` component
  - [ ] Add accessibility (a11y) support

- [ ] **Service Worker**
  - [ ] Implement `osNotificationService.ts`
  - [ ] Create `sw-notifications.ts` worker code
  - [ ] Test OS notification display

- [ ] **Build & Publish**
  - [ ] Build package with Rollup
  - [ ] Test tree-shaking
  - [ ] Publish to npm registry

---

#### Phase 4: Integration

- [ ] **Shell App Integration**
  - [ ] Install `@dloizides/notification-client` package
  - [ ] Add `NotificationProvider` to shell app
  - [ ] Configure Module Federation singleton
  - [ ] Add `NotificationBell` to header

- [ ] **Micro Frontend Integration**
  - [ ] Verify singleton sharing across MFEs
  - [ ] Test notification hooks in MFEs
  - [ ] Test category filtering per MFE

---

#### Phase 5: User Preferences

- [ ] **Backend**
  - [ ] Add preferences endpoints
  - [ ] Implement global notification toggle
  - [ ] Implement per-notification-type preferences
  - [ ] Implement quiet hours

- [ ] **Frontend**
  - [ ] Create preferences settings UI
  - [ ] Add preference hooks to npm package
  - [ ] Test preference changes real-time

---

#### Phase 6: Service Worker & OS Notifications

- [ ] **Permission Handling**
  - [ ] Request notification permission flow
  - [ ] Store permission state
  - [ ] Graceful degradation if denied

- [ ] **OS Notification Display**
  - [ ] Register Service Worker
  - [ ] Post messages to Service Worker
  - [ ] Test notification display in all browsers
  - [ ] Test click-to-focus behavior

---

#### Phase 7: E2E Tests & Monitoring

- [ ] **E2E Tests (Playwright)**
  - [ ] Test notification delivery flow
  - [ ] Test mark as read functionality
  - [ ] Test preferences changes
  - [ ] Test real-time updates across tabs
  - [ ] Test reconnection behavior

- [ ] **Monitoring**
  - [ ] Add health checks for RabbitMQ, Redis, PostgreSQL
  - [ ] Add SignalR connection metrics
  - [ ] Add notification delivery metrics
  - [ ] Configure alerts for failures

---

### Database Schema (Dedicated PostgreSQL)

```sql
-- NotificationDB (Dedicated PostgreSQL instance)

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,

    -- Global toggle
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_disabled_at TIMESTAMPTZ,

    -- Display preferences per notification type
    questionnaire_submitted_display VARCHAR(20) DEFAULT 'both',
    template_updated_display VARCHAR(20) DEFAULT 'in_app',
    user_invited_display VARCHAR(20) DEFAULT 'both',
    menu_updated_display VARCHAR(20) DEFAULT 'in_app',
    payment_due_display VARCHAR(20) DEFAULT 'both',

    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_preferences_tenant_user UNIQUE (tenant_id, user_id),
    CONSTRAINT chk_display_type CHECK (
        questionnaire_submitted_display IN ('in_app', 'os_notification', 'both', 'none')
        -- ... same for other columns
    )
);

-- Notification records
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,

    -- Notification content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    action_url VARCHAR(500),
    icon VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50),

    -- Metadata (JSON for flexibility)
    metadata JSONB,

    -- Status tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ,
    delivery_channel VARCHAR(20),
    delivery_skipped_reason VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    CONSTRAINT chk_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Indexes for common queries
CREATE INDEX idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, is_read)
    WHERE is_read = FALSE;

CREATE INDEX idx_notifications_tenant
    ON notifications (tenant_id);

CREATE INDEX idx_notifications_expires
    ON notifications (expires_at)
    WHERE expires_at IS NOT NULL;
```

---

### Why Dedicated PostgreSQL (Not Shared)?

| Factor | Shared DB | **Dedicated DB (Chosen)** |
|--------|-----------|---------------------------|
| **Service Independence** | Coupled to Identity DB lifecycle | ✅ Independent scaling/maintenance |
| **Schema Isolation** | Risk of conflicts | ✅ Full control over schema |
| **Performance** | Competes with Identity queries | ✅ Isolated resources |
| **Migrations** | Coordinate with Identity team | ✅ Independent deployments |
| **Backup/Restore** | Must include notification data | ✅ Separate backup strategy |
| **Microservice Principles** | Violates DB-per-service | ✅ Follows best practices |

---

## Executive Summary

This document outlines the architectural design for a real-time WebSocket notification service for our multi-tenant SaaS platform. The service will enable instant push notifications to connected clients for events such as questionnaire submissions, system alerts, and collaborative updates.

### Key Design Decisions (FINALIZED ✅)

| Decision | **Choice** | Rationale |
|----------|------------|-----------|
| WebSocket Technology | ✅ **SignalR** | Native .NET support, automatic reconnection |
| Service-to-Service | ✅ **RabbitMQ** | Durable, guaranteed delivery |
| SignalR Backplane | ✅ **Redis** | MS-supported, sub-millisecond latency |
| Database | ✅ **Dedicated PostgreSQL** | Service independence, isolated scaling |
| Caching | ✅ **Hybrid (Redis + PostgreSQL)** | Redis for real-time, DB for history |
| Scaling Approach | ✅ **Skip Negotiation** | No sticky sessions needed |
| Protocol | ✅ **WebSocket-only** | 98%+ browser support |
| External Push | ✅ **None (SignalR only)** | Privacy, full control |
| Frontend Package | ✅ **@dloizides/notification-client** | Micro frontend support |
| Global Notification Toggle | ✅ **User-level disable** | Audit trail preserved |
| Desktop Notifications | ✅ **Service Worker display** | OS-level notifications when tab open |

---

## Additional Requirements: User Notification Control & Desktop Push

### Requirement 5: Global Notification Disable Toggle

Each user should be able to completely disable all notifications with a global toggle.

**Architecture Decision**: Notifications should still be **created and stored** even when disabled, but **not delivered** via any channel.

**Rationale**:
1. **Audit Trail**: Maintaining notification records regardless of user preference provides a complete audit trail for compliance and debugging.
2. **User Experience**: When a user re-enables notifications, they can optionally view a history of what they missed.
3. **Analytics**: Notification creation metrics remain accurate for understanding system activity.
4. **Simplicity**: The notification generation logic in source services does not need to know about user preferences.

**Implementation Approach**:
- Add `notifications_enabled` boolean flag to `notification_preferences` table
- Check this flag in the delivery pipeline, not the creation pipeline
- When disabled: persist notification with `is_delivered = false`, `delivery_skipped_reason = 'user_disabled'`
- WebSocket connection still maintained (for when user re-enables)

### Requirement 6: OS-Level Notifications via Service Workers

Current implementation shows in-app notifications only. Need real desktop-like notifications that appear in the OS notification center when the user configures this preference.

**Architecture Decision**: Use **SignalR ONLY** for message delivery + **Service Worker for display only**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHOSEN ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ❌ NOT using Web Push API (no Google/Mozilla/Microsoft third-party)       │
│   ✅ ONLY SignalR for message delivery                                      │
│   ✅ Service Worker ONLY for displaying OS-level notifications              │
│                                                                             │
│   ┌─────────────────┐         ┌─────────────────────────────────────────┐   │
│   │  Your Backend   │         │           User's Browser                │   │
│   │                 │         │                                         │   │
│   │  SignalR Hub    │◄───────►│  SignalR Client (WebSocket connection)  │   │
│   │                 │   WS    │         │                               │   │
│   └─────────────────┘         │         ▼                               │   │
│                               │  ┌─────────────────────────────────┐    │   │
│                               │  │ Notification arrives via SignalR│    │   │
│                               │  │                                 │    │   │
│                               │  │ User preference = "OS Notif"?   │    │   │
│                               │  │         │                       │    │   │
│                               │  │    YES  │  NO                   │    │   │
│                               │  │         ▼                       │    │   │
│                               │  │  ┌─────────────┐  ┌───────────┐ │    │   │
│                               │  │  │ Service     │  │ In-app    │ │    │   │
│                               │  │  │ Worker      │  │ toast/    │ │    │   │
│                               │  │  │ shows OS    │  │ badge     │ │    │   │
│                               │  │  │ notification│  │           │ │    │   │
│                               │  │  └─────────────┘  └───────────┘ │    │   │
│                               │  └─────────────────────────────────┘    │   │
│                               └─────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Design Principles**:
1. **No Third-Party Dependencies**: We do NOT use Google FCM, Mozilla Push Service, or Microsoft WNS
2. **SignalR is the ONLY transport**: All messages flow through our SignalR WebSocket connection
3. **Service Worker = Display Layer Only**: The Service Worker does NOT receive push messages; it only displays them as OS notifications when requested
4. **User Configurable**: Users choose per-notification-type whether to show as "In-App" or "OS Notification"

**Rationale**:
1. **Privacy**: No data sent to third-party services (Google, Mozilla, Microsoft)
2. **Simplicity**: Single message transport (SignalR), no VAPID keys, no push subscriptions
3. **Control**: Full control over notification delivery without external dependencies
4. **Compliance**: Easier GDPR/data residency compliance - all data stays on your servers

**Limitation (Accepted Trade-off)**:
- ⚠️ **Tab Must Be Open**: Since SignalR requires an active WebSocket connection, notifications only work when the browser tab is open
- If the tab is closed, notifications are queued and delivered when the user returns

**When Notifications Work**:

| Scenario | Message Received? | OS Notification Possible? |
|----------|-------------------|---------------------------|
| Tab focused | ✅ Yes (SignalR) | ✅ Yes (if user configured) |
| Tab open but unfocused | ✅ Yes (SignalR) | ✅ Yes (if user configured) |
| Tab closed | ❌ No | ❌ No |
| Browser closed | ❌ No | ❌ No |

### How It Works: SignalR + Service Worker (Display Only)

#### Step 1: SignalR Delivers the Message
```
Your Backend                              User's Browser (Tab Open)
     │                                            │
     │  SignalR: "ReceiveNotification"            │
     │────────────────────────────────────────────►│
     │  {                                         │
     │    title: "New Response",                  │
     │    body: "John submitted questionnaire",   │
     │    displayAs: "os_notification"            │
     │  }                                         │
     │                                            │
```

#### Step 2: Frontend Decides How to Display
```typescript
// notificationClient.ts
connection.on('ReceiveNotification', (notification) => {
  if (notification.displayAs === 'os_notification') {
    // Use Service Worker to show OS notification
    showOSNotification(notification);
  } else {
    // Show in-app toast/badge
    showInAppNotification(notification);
  }
});
```

#### Step 3: Service Worker Shows OS Notification
```typescript
async function showOSNotification(notification) {
  // Request permission if not granted
  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;

    // Service Worker displays it in the OS notification center
    registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/icons/notification-icon.png',
      tag: notification.id,
    });
  }
}
```

### Understanding the Components

#### SignalR (Message Delivery)
- **What it does**: Delivers notification messages from server to browser
- **Requirement**: Browser tab must be open (WebSocket connection active)
- **This is the ONLY way messages arrive** - no third-party push services

#### Service Worker (Display Only)
- **What it does**: Displays notifications in the OS notification center
- **What it does NOT do**: Does NOT receive messages (that's SignalR's job)
- **Why we need it**: Regular JavaScript can only show notifications when the page is focused; Service Workers can show them even when the tab is in the background (but still open)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 SERVICE WORKER = DISPLAY LAYER ONLY                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   WITHOUT Service Worker:                WITH Service Worker:               │
│   ──────────────────────                 ───────────────────                │
│                                                                             │
│   Tab Focused:     ✅ Can show notif     Tab Focused:     ✅ Can show notif │
│   Tab Unfocused:   ❌ Cannot show        Tab Unfocused:   ✅ CAN show notif │
│   Tab Closed:      ❌ Cannot show        Tab Closed:      ❌ Cannot show    │
│                                                                             │
│   The Service Worker lets us show OS notifications even when the user       │
│   is on another tab (but our tab must still be open in the background).     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Comparison: Our Approach vs Full Web Push

| Aspect | Our Approach (SignalR + SW Display) | Full Web Push (with Google/Mozilla) |
|--------|-------------------------------------|-------------------------------------|
| **Message Transport** | SignalR (your server only) | External Push Service |
| **Third-Party Dependency** | ❌ None | ✅ Google FCM / Mozilla / Microsoft |
| **Works with Tab Closed** | ❌ No | ✅ Yes |
| **Privacy** | ✅ Full control | ⚠️ Data goes through third-party |
| **Complexity** | ✅ Simpler | ❌ VAPID keys, subscriptions, etc. |
| **OS Notification** | ✅ Yes (when tab open) | ✅ Yes (even tab closed) |

### What is Web Push? (For Reference)

> **Note**: We are NOT implementing Web Push, but understanding it helps explain why our approach is different.

Web Push is a browser technology that allows servers to send notifications through third-party services:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WEB PUSH (NOT OUR APPROACH)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Your Server                 Push Service                  User's Browser  │
│                               (Google/Mozilla)                              │
│                                                                             │
│   ┌─────────────┐            ┌─────────────┐               ┌─────────────┐  │
│   │             │            │             │               │             │  │
│   │  "Send      │───────────►│  Holds the  │──────────────►│  Service    │  │
│   │   notif"    │            │  message    │               │  Worker     │  │
│   │             │            │  until      │               │  receives   │  │
│   │             │            │  browser    │               │  & shows    │  │
│   │             │            │  is ready   │               │             │  │
│   └─────────────┘            └─────────────┘               └─────────────┘  │
│                                                                             │
│   ❌ We don't use this because:                                             │
│      - Requires sending data to Google/Mozilla/Microsoft                    │
│      - More complex (VAPID keys, push subscriptions)                        │
│      - Privacy/compliance concerns with third-party data                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why some apps use Web Push:**
- Works even when browser tab is completely closed
- Only requires browser to be running (not your app)

**Why we chose NOT to use it:**
- Privacy: We don't want to send notification data through Google/Mozilla
- Simplicity: SignalR already handles real-time communication
- Control: We want full control over our notification infrastructure
- The trade-off (tab must be open) is acceptable for our use case

### The Scenarios Explained Visually (Our Approach)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 1: Tab Focused (user is actively using your app)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐                                                          │
│   │  Your App    │  ← User is here, looking at the screen                   │
│   │  (Active)    │                                                          │
│   │              │                                                          │
│   │  🔔 New msg! │  ← SignalR delivers, shown as in-app toast               │
│   └──────────────┘                                                          │
│                                                                             │
│   SignalR: ✅ Connected - delivers message                                  │
│   Display:  In-app toast/badge (user preference)                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 2: Tab Unfocused (app open but user on another tab/window)         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐                                        │
│   │  Your App    │  │  YouTube     │  ← User is HERE watching videos        │
│   │  (Background)│  │  (Active)    │                                        │
│   └──────────────┘  └──────────────┘                                        │
│         │                 │                                                 │
│         │                 ▼                                                 │
│         │      ┌─────────────────────────────┐                              │
│         │      │ 🔔 Desktop Notification     │  ← Service Worker shows      │
│         │      │ "New questionnaire response"│    OS notification           │
│         │      └─────────────────────────────┘                              │
│         │                                                                   │
│   SignalR: ✅ Still connected (tab is open, just not focused)               │
│   Display: OS notification via Service Worker (if user configured)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO 3: Tab Closed (user closed your app's tab)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐                                                          │
│   │  YouTube     │  ← Only other tabs open, your app tab is CLOSED          │
│   │  (Active)    │                                                          │
│   └──────────────┘                                                          │
│                                                                             │
│   New notification generated on server...                                   │
│                                                                             │
│   SignalR: ❌ DISCONNECTED - WebSocket closed when tab closed               │
│   Display: ❌ Cannot show notification                                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 📋 Notification QUEUED on server                                    │   │
│   │    Will be delivered when user opens the app again                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ⚠️  THIS IS THE ACCEPTED TRADE-OFF OF NOT USING EXTERNAL PUSH SERVICES   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What the User Actually Sees

```
User's Desktop (Windows/Mac/Linux)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Browser Window (Tab MUST be open)                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Tab: Your SaaS App                                      │   │
│   │ ┌─────────────────────────────────────────────────────┐ │   │
│   │ │ 🔔 3 ← In-app badge (SignalR delivered)             │ │   │
│   │ │                                                     │ │   │
│   │ │ [Toast: "New response received"]                    │ │   │
│   │ │  ↑ In-app notification (if user chose this option)  │ │   │
│   │ └─────────────────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌──────────────────────────────┐                              │
│   │ 🔔 Your SaaS App             │  ← OS Notification           │
│   │ New questionnaire response   │    (if user chose this       │
│   │ Click to view                │     option AND tab is open)  │
│   └──────────────────────────────┘                              │
│                                                                 │
│   Both notification types require the tab to be open!           │
│   SignalR delivers the message, user preference decides         │
│   whether to show in-app toast or OS notification.              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### User Notification Preferences

Users can configure how each notification type is displayed:

| Notification Type | Display Options |
|-------------------|-----------------|
| Questionnaire Submitted | In-App Toast / OS Notification / Both / None |
| Template Updated | In-App Toast / OS Notification / Both / None |
| System Alert | In-App Toast / OS Notification / Both / None |
| Payment Due | In-App Toast / OS Notification / Both / None |

**Remember**: Regardless of the display preference, the message is **always delivered via SignalR**. The Service Worker is only used for **displaying** OS notifications, not for receiving them.

---

## Problem Statement

### Current State
- No real-time communication between backend and frontend
- Users must manually refresh to see updates
- No mechanism to notify users of events from other services

### Requirements
1. Real-time notifications for:
   - Questionnaire submissions (someone answered a questionnaire)
   - Template updates (collaborator made changes)
   - System notifications (subscription expiring, payment due)
   - Menu updates (new items, availability changes)

2. Scalability:
   - Must work behind load balancer with multiple service instances
   - Support 10,000+ concurrent connections per tenant
   - Sub-second message delivery

3. Multi-tenancy:
   - Strict tenant isolation
   - Per-tenant connection limits
   - Tenant-specific notification channels

4. Reliability:
   - Offline message queuing
   - Automatic reconnection
   - Message delivery guarantees (at-least-once)

---

## Architecture Overview

### High-Level System Diagram

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                    LOAD BALANCER                             │
                                    │              (Sticky Sessions for WS)                        │
                                    └─────────────────────┬───────────────────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
            ┌───────▼───────┐                     ┌───────▼───────┐                     ┌───────▼───────┐
            │  Notification │                     │  Notification │                     │  Notification │
            │  Service #1   │                     │  Service #2   │                     │  Service #N   │
            │  (SignalR Hub)│                     │  (SignalR Hub)│                     │  (SignalR Hub)│
            └───────┬───────┘                     └───────┬───────┘                     └───────┬───────┘
                    │                                     │                                     │
                    └─────────────────────────────────────┼─────────────────────────────────────┘
                                                          │
                                    ┌─────────────────────▼─────────────────────┐
                                    │           REDIS BACKPLANE                  │
                                    │    (SignalR Message Distribution)          │
                                    │    - Connection State                      │
                                    │    - Pub/Sub Channels                      │
                                    └─────────────────────┬─────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
            ┌───────▼───────┐                     ┌───────▼───────┐                     ┌───────▼───────┐
            │   Identity    │                     │  Questioner   │                     │  OnlineMenu   │
            │   Service     │────────────────────▶│   Service     │────────────────────▶│   Service     │
            └───────────────┘                     └───────────────┘                     └───────────────┘
                    │                                     │                                     │
                    │              ┌──────────────────────┴──────────────────────┐              │
                    │              │                                             │              │
                    │              ▼              MESSAGE QUEUE                  ▼              │
                    │    ┌─────────────────────────────────────────────────────────────┐       │
                    └───▶│              RABBITMQ / REDIS STREAMS                       │◀──────┘
                         │   (Service-to-Notification-Service Communication)           │
                         └─────────────────────────────────────────────────────────────┘
                                                          │
                                    ┌─────────────────────▼─────────────────────┐
                                    │           POSTGRESQL                       │
                                    │    - Notification History                  │
                                    │    - User Preferences                      │
                                    │    - Offline Message Queue                 │
                                    └───────────────────────────────────────────┘
```

---

### Redis Backplane: What It Does (Detailed Explanation)

> **Important Clarification**: The Redis Backplane serves ONE specific purpose - enabling SignalR to work across multiple server instances. It is NOT used for service-to-service communication.

#### The Problem Redis Backplane Solves

When you have multiple Notification Service instances (for horizontal scaling), a fundamental problem arises:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           THE HORIZONTAL SCALING PROBLEM                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   User A connects to Instance #1    │    User B connects to Instance #2                 │
│                                     │                                                   │
│   ┌─────────────┐                   │    ┌─────────────┐                                │
│   │  Browser A  │◄──WebSocket──┐    │    │  Browser B  │◄──WebSocket──┐                 │
│   └─────────────┘              │    │    └─────────────┘              │                 │
│                                │    │                                 │                 │
│                        ┌───────▼────┴───┐                     ┌───────▼───────┐         │
│                        │  Notification  │                     │  Notification │         │
│                        │  Service #1    │        ???          │  Service #2   │         │
│                        │               ─┼─────────────────────┼─►             │         │
│                        │  Knows about   │  How does #1 send   │  Knows about  │         │
│                        │  User A only   │  a message to B?    │  User B only  │         │
│                        └────────────────┘                     └───────────────┘         │
│                                                                                         │
│   Each instance only knows about its OWN connected clients!                             │
│   Instance #1 has no idea User B exists, and vice versa.                                │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### How Redis Backplane Solves It

The Redis Backplane acts as a **message router between SignalR Hub instances**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           REDIS BACKPLANE SOLUTION                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   SCENARIO: Send notification to User B (connected to Instance #2)                      │
│             from code running on Instance #1                                            │
│                                                                                         │
│   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐                    │
│   │  Instance #1   │      │     REDIS      │      │  Instance #2   │                    │
│   │                │      │   BACKPLANE    │      │                │                    │
│   │  Hub.Clients   │      │                │      │                │                    │
│   │  .User("B")    │ ───► │  Pub/Sub       │ ───► │  Receives msg  │                    │
│   │  .SendAsync()  │      │  Channel:      │      │  from Redis    │                    │
│   │                │      │  "user:B"      │      │                │ ───► Browser B     │
│   └────────────────┘      └────────────────┘      └────────────────┘                    │
│                                                                                         │
│   Step 1: Instance #1 calls Hub.Clients.User("B").SendAsync("notify", data)             │
│   Step 2: SignalR publishes to Redis channel for User B                                 │
│   Step 3: Instance #2 (subscribed to all channels) receives the message                 │
│   Step 4: Instance #2 delivers to User B's WebSocket connection                         │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Redis Backplane Responsibilities (EXACT)

| Responsibility | Description |
|----------------|-------------|
| **Hub-to-Hub Message Routing** | When Instance #1 sends to a user on Instance #2, Redis routes it |
| **Group Management** | `Clients.Group("tenant-123")` works across all instances |
| **User Mapping** | `Clients.User("user-id")` finds the user regardless of which instance they're on |
| **Connection Broadcast** | `Clients.All.SendAsync()` reaches ALL connected clients across ALL instances |
| **Pub/Sub Channels** | Creates channels like `SignalR:NotificationHub:user:xyz` for routing |

#### What Redis Backplane Does NOT Do

| NOT Responsible For | Why |
|---------------------|-----|
| **Service-to-Service Events** | That's RabbitMQ's job (Questioner → Notification Service) |
| **Message Persistence** | Messages are fire-and-forget in Redis Pub/Sub |
| **Offline Queuing** | PostgreSQL handles storing messages for offline users |
| **Message Delivery Guarantees** | Redis Pub/Sub is best-effort, not guaranteed |
| **Connection Authentication** | SignalR middleware handles JWT validation |

#### Visual: Two Separate Concerns

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         TWO SEPARATE MESSAGING CONCERNS                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   CONCERN 1: SERVICE-TO-SERVICE                 CONCERN 2: HUB-TO-HUB                   │
│   "Questioner Service wants to                  "SignalR Hub on Instance #1 wants       │
│    notify users about a submission"              to send to client on Instance #2"      │
│                                                                                         │
│   ┌─────────────────┐                           ┌─────────────────┐                     │
│   │   Questioner    │                           │  SignalR Hub    │                     │
│   │   Service       │                           │  Instance #1    │                     │
│   └────────┬────────┘                           └────────┬────────┘                     │
│            │                                             │                              │
│            │ Publish event:                              │ Hub.Clients.User("B")        │
│            │ "questionnaire.submitted"                   │ .SendAsync("notify", data)   │
│            │                                             │                              │
│            ▼                                             ▼                              │
│   ┌─────────────────┐                           ┌─────────────────┐                     │
│   │                 │                           │                 │                     │
│   │    RABBITMQ     │                           │  REDIS BACKPLANE│                     │
│   │                 │                           │                 │                     │
│   │  • Durable      │                           │  • Fast (<1ms)  │                     │
│   │  • Persistent   │                           │  • Fire-forget  │                     │
│   │  • Guaranteed   │                           │  • Ephemeral    │                     │
│   │                 │                           │                 │                     │
│   └────────┬────────┘                           └────────┬────────┘                     │
│            │                                             │                              │
│            ▼                                             ▼                              │
│   ┌─────────────────┐                           ┌─────────────────┐                     │
│   │  Notification   │                           │  SignalR Hub    │                     │
│   │  Service        │──────────────────────────▶│  Instance #2    │──► Browser B        │
│   │  (Consumer)     │  Then uses Redis          │  (has User B)   │                     │
│   └─────────────────┘  Backplane to deliver     └─────────────────┘                     │
│                                                                                         │
│   RabbitMQ: "Hey Notification Service, a questionnaire was submitted"                   │
│   Redis:    "Hey Instance #2, deliver this to User B's WebSocket"                       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Code Example: How They Work Together

```csharp
// In Notification Service - RabbitMQ Consumer
public class QuestionnaireSubmittedConsumer : IConsumer<QuestionnaireSubmittedEvent>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public async Task Consume(ConsumeContext<QuestionnaireSubmittedEvent> context)
    {
        var evt = context.Message;

        // Step 1: RabbitMQ delivered this event to us (service-to-service)
        // Step 2: Now we use SignalR to notify the user
        // Step 3: Redis Backplane automatically routes to correct instance

        await _hubContext.Clients
            .User(evt.TenantAdminUserId)           // Find user (any instance)
            .SendAsync("QuestionnaireSubmitted", new {
                questionnaireId = evt.QuestionnaireId,
                submittedAt = evt.SubmittedAt
            });

        // Behind the scenes:
        // - If user is on THIS instance → direct WebSocket send
        // - If user is on ANOTHER instance → Redis publishes, other instance delivers
        // - If user is OFFLINE → SignalR silently ignores (we handle offline separately)
    }
}
```

---

### Component Interaction Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                          EVENT FLOW: Questionnaire Submission                             │
└──────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐         ┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
    │  User   │         │ Questioner  │         │    Redis     │         │  Notification   │
    │  (Web)  │         │   Service   │         │   Pub/Sub    │         │    Service      │
    └────┬────┘         └──────┬──────┘         └──────┬───────┘         └────────┬────────┘
         │                     │                       │                          │
         │  Submit Answer      │                       │                          │
         │────────────────────▶│                       │                          │
         │                     │                       │                          │
         │                     │  Publish Event        │                          │
         │                     │  "questionnaire.      │                          │
         │                     │   submitted"          │                          │
         │                     │──────────────────────▶│                          │
         │                     │                       │                          │
         │                     │                       │  Notify Subscribers      │
         │                     │                       │─────────────────────────▶│
         │                     │                       │                          │
         │                     │                       │                          │ ┌───────────────────┐
         │                     │                       │                          │ │ 1. Lookup tenant  │
         │                     │                       │                          │ │ 2. Find connected │
         │                     │                       │                          │ │    users          │
         │                     │                       │                          │ │ 3. Push via       │
         │                     │                       │                          │ │    SignalR        │
         │                     │                       │                          │ └───────────────────┘
         │                     │                       │                          │
         │◀───────────────────────────────────────────────────────────────────────│
         │           Real-time WebSocket Push                                     │
         │           "New questionnaire response!"                                │
         │                     │                       │                          │
```

---

## Technology Stack

### Backend (NotificationService)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | ASP.NET Core | 8.0+ | Web API + SignalR hosting |
| Real-time | SignalR | Latest | WebSocket management |
| Backplane | Microsoft.AspNetCore.SignalR.StackExchangeRedis | Latest | Multi-instance scaling |
| Message Queue | RabbitMQ.Client or StackExchange.Redis | Latest | Service-to-service events |
| Cache | StackExchange.Redis | Latest | Connection state, rate limiting |
| ORM | Entity Framework Core | 8.0+ | Notification persistence |
| Database | PostgreSQL | 15+ | Notification storage |

### Frontend (React Native/Expo)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| WebSocket Client | @microsoft/signalr | Latest | SignalR JavaScript client |
| State Management | Redux Toolkit | Existing | Notification state |
| React Query | TanStack Query | Existing | Cache invalidation on notifications |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Load Balancer | nginx/Traefik | Sticky sessions for WebSocket |
| Container | Docker | Deployment |
| Orchestration | Kubernetes (future) | Scaling |

---

## System Design

### When to Use WebSockets vs Polling vs SSE

| Scenario | Technology | Rationale |
|----------|------------|-----------|
| Real-time notifications | WebSocket (SignalR) | Bi-directional, low latency |
| Live questionnaire responses | WebSocket (SignalR) | Instant updates required |
| Dashboard analytics | Polling (30s interval) | Data not time-critical |
| Large file upload progress | SSE | Server-push only, large payloads |
| Presence indicators | WebSocket (SignalR) | Real-time user status |

### Notification Service Structure

Following the established Clean Architecture pattern:

```
Services/
└── NotificationService/
    ├── src/
    │   ├── NotificationService.Web/
    │   │   ├── Hubs/
    │   │   │   └── NotificationHub.cs          # SignalR Hub
    │   │   ├── Endpoints/
    │   │   │   ├── Notifications/
    │   │   │   │   ├── GetNotificationsEndpoint.cs
    │   │   │   │   ├── MarkAsReadEndpoint.cs
    │   │   │   │   └── GetUnreadCountEndpoint.cs
    │   │   │   └── Preferences/
    │   │   │       └── UpdatePreferencesEndpoint.cs
    │   │   ├── BackgroundServices/
    │   │   │   ├── MessageQueueConsumer.cs     # RabbitMQ/Redis consumer
    │   │   │   └── OfflineNotificationProcessor.cs
    │   │   └── Program.cs
    │   ├── NotificationService.UseCases/
    │   │   ├── Notifications/
    │   │   │   ├── Commands/
    │   │   │   │   ├── SendNotification/
    │   │   │   │   ├── MarkAsRead/
    │   │   │   │   └── BroadcastToTenant/
    │   │   │   └── Queries/
    │   │   │       ├── GetUserNotifications/
    │   │   │       └── GetUnreadCount/
    │   │   └── Preferences/
    │   │       ├── Commands/
    │   │       │   └── UpdatePreferences/
    │   │       └── Queries/
    │   │           └── GetUserPreferences/
    │   ├── NotificationService.Core/
    │   │   ├── NotificationAggregate/
    │   │   │   ├── Notification.cs
    │   │   │   ├── NotificationType.cs
    │   │   │   └── NotificationPriority.cs
    │   │   ├── PreferencesAggregate/
    │   │   │   ├── UserNotificationPreferences.cs
    │   │   │   └── NotificationChannel.cs
    │   │   └── Interfaces/
    │   │       ├── INotificationRepository.cs
    │   │       └── IConnectionManager.cs
    │   └── NotificationService.Infrastructure/
    │       ├── Data/
    │       │   ├── AppDbContext.cs
    │       │   ├── NotificationRepository.cs
    │       │   └── Migrations/
    │       ├── Messaging/
    │       │   ├── RabbitMqEventSubscriber.cs
    │       │   └── RedisEventSubscriber.cs
    │       └── SignalR/
    │           ├── RedisConnectionManager.cs
    │           └── HubLifetimeManager.cs
    └── tests/
        ├── NotificationService.UnitTests/
        ├── NotificationService.IntegrationTests/
        └── NotificationService.FunctionalTests/
```

### SignalR Hub Design

```csharp
// File: NotificationService.Web/Hubs/NotificationHub.cs

public class NotificationHub : Hub
{
    private readonly ICurrentTenantService _tenantService;
    private readonly IConnectionManager _connectionManager;
    private readonly IMediator _mediator;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(
        ICurrentTenantService tenantService,
        IConnectionManager connectionManager,
        IMediator mediator,
        ILogger<NotificationHub> logger)
    {
        _tenantService = tenantService;
        _connectionManager = connectionManager;
        _mediator = mediator;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var tenantId = _tenantService.TenantId;
        var userId = _tenantService.UserId;

        if (tenantId == null || userId == null)
        {
            Context.Abort();
            return;
        }

        // Add to tenant group for broadcast notifications
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantId}");

        // Add to user group for personal notifications
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

        // Track connection in Redis for scaling
        await _connectionManager.AddConnectionAsync(userId.Value, Context.ConnectionId);

        // Send pending offline notifications
        var pendingNotifications = await _mediator.Send(
            new GetPendingNotificationsQuery(userId.Value));

        if (pendingNotifications.Any())
        {
            await Clients.Caller.SendAsync("ReceivePendingNotifications", pendingNotifications);
        }

        _logger.LogInformation(
            "User {UserId} connected from tenant {TenantId}. ConnectionId: {ConnectionId}",
            userId, tenantId, Context.ConnectionId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _tenantService.UserId;

        if (userId != null)
        {
            await _connectionManager.RemoveConnectionAsync(userId.Value, Context.ConnectionId);
        }

        _logger.LogInformation(
            "User {UserId} disconnected. ConnectionId: {ConnectionId}",
            userId, Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }

    // Client can acknowledge notification receipt
    public async Task AcknowledgeNotification(Guid notificationId)
    {
        var userId = _tenantService.UserId;
        if (userId == null) return;

        await _mediator.Send(new MarkAsReadCommand(notificationId, userId.Value));
    }

    // Client can subscribe to specific channels
    public async Task SubscribeToChannel(string channel)
    {
        var tenantId = _tenantService.TenantId;
        var sanitizedChannel = $"tenant:{tenantId}:channel:{channel}";

        await Groups.AddToGroupAsync(Context.ConnectionId, sanitizedChannel);
    }
}
```

### Message Flow: Service to Client

```csharp
// File: NotificationService.Infrastructure/Messaging/RabbitMqEventSubscriber.cs

public class NotificationEventConsumer : BackgroundService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly INotificationRepository _repository;
    private readonly IConnectionManager _connectionManager;
    private readonly IServiceScopeFactory _scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Subscribe to notification events from message queue
        await foreach (var @event in _messageQueue.ConsumeAsync(stoppingToken))
        {
            await ProcessEventAsync(@event, stoppingToken);
        }
    }

    private async Task ProcessEventAsync(NotificationEvent @event, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();

        // 1. Persist notification
        var notification = new Notification(
            @event.TenantId,
            @event.UserId,
            @event.Type,
            @event.Title,
            @event.Body,
            @event.Data);

        await _repository.AddAsync(notification, ct);

        // 2. Check if user is connected
        var connections = await _connectionManager.GetConnectionsAsync(@event.UserId);

        if (connections.Any())
        {
            // 3a. User online - send immediately
            await _hubContext.Clients
                .User(@event.UserId.ToString())
                .SendAsync("ReceiveNotification", notification.ToDto(), ct);
        }
        else
        {
            // 3b. User offline - mark for later delivery
            notification.MarkForOfflineDelivery();
            await _repository.UpdateAsync(notification, ct);
        }

        // 4. If broadcast, send to all tenant users
        if (@event.IsBroadcast)
        {
            await _hubContext.Clients
                .Group($"tenant:{@event.TenantId}")
                .SendAsync("ReceiveNotification", notification.ToDto(), ct);
        }
    }
}
```

---

## Scalability Patterns - Decision Required

> **⚠️ DECISION POINT**: Choose a scaling approach before implementation.

### The Core Problem

SignalR (and WebSockets in general) face two challenges when scaling horizontally:

1. **Connection Handshake Problem**: SignalR's default negotiation creates a connection ID on one server, but the WebSocket upgrade might go to a different server.

2. **Message Routing Problem**: User A is connected to Instance #1, but a notification for them originates from Instance #3. How does the message reach them?

```
The Two Problems Illustrated:

PROBLEM 1: Negotiation                    PROBLEM 2: Message Routing
─────────────────────────                 ──────────────────────────
Client → LB → Instance #1                 Instance #3: "Send to User A"
         ↓                                         ↓
    POST /negotiate                       But User A is on Instance #1!
    Returns: connectionId=abc123                   ↓
         ↓                                How to route the message?
Client → LB → Instance #2  ← FAILS!
    GET /hub?id=abc123
    "Unknown connection ID"
```

---

## 🔷 Option A: Skip Negotiation + Redis Backplane (Recommended) ✅ CHOSEN

**Approach**: Bypass the negotiation step entirely, go straight to WebSocket, use Redis for cross-instance messaging.

---

### What is "Negotiation" and Why Skip It?

SignalR normally performs a **negotiation handshake** before establishing a connection:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           NORMAL SIGNALR CONNECTION (WITH NEGOTIATION)                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   Browser                    Load Balancer                    Server Instances          │
│   ───────                    ─────────────                    ────────────────          │
│                                                                                         │
│   Step 1: POST /negotiate ────────────────► Round Robin ────► Instance #1               │
│           "What transports do you support?"                   Returns: connectionId,    │
│                                                               available transports      │
│                                                                                         │
│   Step 2: GET /hub?id=abc123 ─────────────► Round Robin ────► Instance #2  ❌ PROBLEM!  │
│           "Connect with this connectionId"                    "I don't know abc123!"   │
│                                                                                         │
│   The connectionId was created on Instance #1, but the WebSocket                        │
│   connection landed on Instance #2 (different server via round-robin).                  │
│   Instance #2 has no idea what connectionId "abc123" is!                                │
│                                                                                         │
│   SOLUTION: Either use sticky sessions OR skip negotiation entirely.                    │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

By **skipping negotiation**, we avoid this problem entirely:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           SKIP NEGOTIATION (OUR APPROACH)                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   Browser                    Load Balancer                    Server Instances          │
│   ───────                    ─────────────                    ────────────────          │
│                                                                                         │
│   Step 1: WebSocket UPGRADE ──────────────► Round Robin ────► Instance #2               │
│           "Connect directly via WebSocket"                    ✅ Works!                 │
│           (No prior negotiate request)                        No connectionId needed    │
│                                                                                         │
│   Only ONE request, goes to ONE server, connection established.                         │
│   No state to track between requests = no sticky session needed!                        │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Trade-off**: We lose fallback to Long Polling and Server-Sent Events (SSE). But 98%+ of browsers support WebSocket, so this is acceptable.

---

### Architecture Diagram (SignalR Scaling Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER (Round Robin)                          │
│                         No sticky sessions needed                            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
  ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
  │ Instance #1   │       │ Instance #2   │       │ Instance #N   │
  │               │       │               │       │               │
  │ SignalR Hub   │       │ SignalR Hub   │       │ SignalR Hub   │
  │ (WebSocket    │       │ (WebSocket    │       │ (WebSocket    │
  │  only mode)   │       │  only mode)   │       │  only mode)   │
  └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │       REDIS BACKPLANE          │
                  │  - Pub/Sub for messages        │
                  │  - No connection state needed  │
                  └───────────────────────────────┘
```

---

### Complete Flow Diagram: Where is RabbitMQ?

The diagram above only shows SignalR scaling. Here's the **complete picture** including RabbitMQ:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE NOTIFICATION FLOW DIAGRAM                                │
│                     (RabbitMQ + Redis + SignalR + Service Worker)                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗  │
│  ║  STEP 1: EVENT ORIGINATES FROM A SERVICE                                          ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
│                                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                     │
│   │   Questioner    │    │    Identity     │    │   OnlineMenu    │                     │
│   │    Service      │    │    Service      │    │    Service      │                     │
│   │                 │    │                 │    │                 │                     │
│   │  "Questionnaire │    │  "User invited" │    │  "Menu updated" │                     │
│   │   submitted!"   │    │                 │    │                 │                     │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘                     │
│            │                      │                      │                              │
│            │                      │                      │                              │
│  ╔═════════▼══════════════════════▼══════════════════════▼═══════════════════════════╗  │
│  ║  STEP 2: PUBLISH TO RABBITMQ (Service-to-Service Communication)                   ║  │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                                   ║  │
│  ║   ┌─────────────────────────────────────────────────────────────────────────────┐ ║  │
│  ║   │                            RABBITMQ                                         │ ║  │
│  ║   │                                                                             │ ║  │
│  ║   │   Exchange: "notifications"                                                 │ ║  │
│  ║   │   ├── Queue: "questionnaire.submitted"  ──┐                                 │ ║  │
│  ║   │   ├── Queue: "user.invited"             ──┼──► Notification Service         │ ║  │
│  ║   │   └── Queue: "menu.updated"             ──┘    (Consumer)                   │ ║  │
│  ║   │                                                                             │ ║  │
│  ║   │   Properties:                                                               │ ║  │
│  ║   │   • Durable queues (survives restart)                                       │ ║  │
│  ║   │   • Persistent messages                                                     │ ║  │
│  ║   │   • At-least-once delivery guarantee                                        │ ║  │
│  ║   │                                                                             │ ║  │
│  ║   └─────────────────────────────────────────────────────────────────────────────┘ ║  │
│  ║                                                                                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
│                                              │                                          │
│                                              ▼                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗  │
│  ║  STEP 3: NOTIFICATION SERVICE RECEIVES EVENT                                      ║  │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                                   ║  │
│  ║   ┌───────────────────────────────────────────────────────────────────────────┐   ║  │
│  ║   │                    NOTIFICATION SERVICE (Multiple Instances)              │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   1. RabbitMQ Consumer receives event                                     │   ║  │
│  ║   │   2. Look up user notification preferences (PostgreSQL)                   │   ║  │
│  ║   │   3. Check if notifications enabled for user                              │   ║  │
│  ║   │   4. Store notification in history (PostgreSQL)                           │   ║  │
│  ║   │   5. Call SignalR Hub to deliver to client                                │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   // Code running on Notification Service Instance #1                     │   ║  │
│  ║   │   await _hubContext.Clients                                               │   ║  │
│  ║   │       .User(userId)        // User might be on Instance #2!               │   ║  │
│  ║   │       .SendAsync("Notify", payload);                                      │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   └───────────────────────────────────────────────────────────────────────────┘   ║  │
│  ║                                                                                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
│                                              │                                          │
│                                              ▼                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗  │
│  ║  STEP 4: REDIS BACKPLANE ROUTES TO CORRECT INSTANCE                               ║  │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                                   ║  │
│  ║   ┌───────────────────────────────────────────────────────────────────────────┐   ║  │
│  ║   │                         REDIS (SignalR Backplane)                         │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   Instance #1 publishes: "Send to user:xyz"                               │   ║  │
│  ║   │                           │                                               │   ║  │
│  ║   │                           ▼                                               │   ║  │
│  ║   │   Redis Pub/Sub Channel: "SignalR:NotificationHub:user:xyz"               │   ║  │
│  ║   │                           │                                               │   ║  │
│  ║   │                           ▼                                               │   ║  │
│  ║   │   Instance #2 (subscribed) receives message                               │   ║  │
│  ║   │   Instance #2 has user:xyz connected → delivers via WebSocket             │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   Properties:                                                             │   ║  │
│  ║   │   • Fast (<1ms latency)                                                   │   ║  │
│  ║   │   • Fire-and-forget (not durable)                                         │   ║  │
│  ║   │   • Only for SignalR hub-to-hub routing                                   │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   └───────────────────────────────────────────────────────────────────────────┘   ║  │
│  ║                                                                                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
│                                              │                                          │
│                                              ▼                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗  │
│  ║  STEP 5: SIGNALR DELIVERS TO CLIENT VIA WEBSOCKET                                 ║  │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                                   ║  │
│  ║   ┌───────────────────────────────────────────────────────────────────────────┐   ║  │
│  ║   │                         BROWSER (Client)                                  │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   SignalR Client receives message via WebSocket                           │   ║  │
│  ║   │                           │                                               │   ║  │
│  ║   │                           ▼                                               │   ║  │
│  ║   │   connection.on("Notify", (payload) => {                                  │   ║  │
│  ║   │       // Check user preference: in_app, os_notification, or both          │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │       if (preference.includes('in_app')) {                                │   ║  │
│  ║   │           showInAppNotification(payload);  // Toast/banner in app         │   ║  │
│  ║   │       }                                                                   │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │       if (preference.includes('os_notification')) {                       │   ║  │
│  ║   │           // Post message to Service Worker for OS notification           │   ║  │
│  ║   │           navigator.serviceWorker.controller.postMessage({                │   ║  │
│  ║   │               type: 'SHOW_NOTIFICATION',                                  │   ║  │
│  ║   │               title: payload.title,                                       │   ║  │
│  ║   │               options: { body: payload.message }                          │   ║  │
│  ║   │           });                                                             │   ║  │
│  ║   │       }                                                                   │   ║  │
│  ║   │   });                                                                     │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   └───────────────────────────────────────────────────────────────────────────┘   ║  │
│  ║                                                                                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
│                                              │                                          │
│                                              ▼                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗  │
│  ║  STEP 6: SERVICE WORKER DISPLAYS OS NOTIFICATION (if configured)                  ║  │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                                   ║  │
│  ║   ┌───────────────────────────────────────────────────────────────────────────┐   ║  │
│  ║   │                         SERVICE WORKER (sw.js)                            │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   self.addEventListener('message', (event) => {                           │   ║  │
│  ║   │       if (event.data?.type === 'SHOW_NOTIFICATION') {                     │   ║  │
│  ║   │           self.registration.showNotification(                             │   ║  │
│  ║   │               event.data.title,                                           │   ║  │
│  ║   │               event.data.options                                          │   ║  │
│  ║   │           );                                                              │   ║  │
│  ║   │       }                                                                   │   ║  │
│  ║   │   });                                                                     │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   │   Result: Desktop/mobile OS notification appears!                         │   ║  │
│  ║   │   (Only works when browser tab is open)                                   │   ║  │
│  ║   │                                                                           │   ║  │
│  ║   └───────────────────────────────────────────────────────────────────────────┘   ║  │
│  ║                                                                                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Summary: RabbitMQ vs Redis in This Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           RABBITMQ vs REDIS: DIFFERENT JOBS                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   Component     │  Purpose                        │  Properties                         │
│   ──────────────┼─────────────────────────────────┼───────────────────────────────────  │
│                 │                                 │                                     │
│   RABBITMQ      │  Service-to-Service Events      │  • Durable (survives restart)       │
│                 │  "Questioner → Notification"    │  • Persistent messages              │
│                 │                                 │  • Guaranteed delivery              │
│                 │                                 │  • Used ONCE per event              │
│                 │                                 │                                     │
│   ──────────────┼─────────────────────────────────┼───────────────────────────────────  │
│                 │                                 │                                     │
│   REDIS         │  SignalR Hub-to-Hub Routing     │  • Fast (<1ms)                      │
│                 │  "Instance #1 → Instance #2"    │  • Fire-and-forget                  │
│                 │                                 │  • Not persistent                   │
│                 │                                 │  • Used for EVERY client message    │
│                 │                                 │                                     │
│   ──────────────┼─────────────────────────────────┼───────────────────────────────────  │
│                 │                                 │                                     │
│   SIGNALR       │  Server-to-Client Delivery      │  • WebSocket connection             │
│                 │  "Notification Service → User"  │  • Real-time, bidirectional         │
│                 │                                 │  • Per-user connection              │
│                 │                                 │                                     │
│   ──────────────┼─────────────────────────────────┼───────────────────────────────────  │
│                 │                                 │                                     │
│   SERVICE       │  OS Notification Display        │  • Receives from main thread        │
│   WORKER        │  "Show desktop notification"    │  • Uses Notification API            │
│                 │                                 │  • Only when tab is open            │
│                 │                                 │                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

**Frontend Configuration**:
```typescript
new signalR.HubConnectionBuilder()
  .withUrl(url, {
    skipNegotiation: true,                              // ← Key setting
    transport: signalR.HttpTransportType.WebSockets,    // ← WebSocket only
  })
```

**Backend Configuration**:
```csharp
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnectionString);
```

**Load Balancer (nginx)** - Simple round-robin:
```nginx
upstream notification_backend {
    server notification-service-1:5000;
    server notification-service-2:5000;
    server notification-service-3:5000;
}

server {
    location /notificationhub {
        proxy_pass http://notification_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

| Pros | Cons |
|------|------|
| ✅ Simple load balancer config (round-robin) | ❌ No fallback to Long Polling/SSE |
| ✅ Even distribution across instances | ❌ Requires WebSocket support (all modern browsers) |
| ✅ No session affinity complexity | ❌ Redis becomes critical dependency |
| ✅ Easy to add/remove instances | ❌ Slightly higher latency (Redis hop) |
| ✅ Works with Kubernetes autoscaling | |
| ✅ No state in load balancer | |

| Complexity | Infrastructure | Browser Support |
|------------|----------------|-----------------|
| Low | Redis required | Modern browsers only (98%+) |

---

## 🔶 Option B: Sticky Sessions (IP Hash)

**Approach**: Route all requests from the same client IP to the same server instance.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER (IP Hash)                              │
│                         Same IP → Same Instance                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
  ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
  │ Instance #1   │       │ Instance #2   │       │ Instance #N   │
  │               │       │               │       │               │
  │ Clients from  │       │ Clients from  │       │ Clients from  │
  │ IP range A    │       │ IP range B    │       │ IP range N    │
  └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │       REDIS BACKPLANE          │
                  │  (Still needed for cross-      │
                  │   instance messaging)          │
                  └───────────────────────────────┘
```

**Load Balancer (nginx)**:
```nginx
upstream notification_backend {
    ip_hash;  # ← Sticky sessions
    server notification-service-1:5000;
    server notification-service-2:5000;
    server notification-service-3:5000;
}
```

| Pros | Cons |
|------|------|
| ✅ Supports fallback transports (Long Polling, SSE) | ❌ Uneven load distribution |
| ✅ Works with older browsers | ❌ Corporate NAT = all users to one instance |
| ✅ SignalR negotiation works normally | ❌ Mobile users change IP frequently |
| ✅ Simpler debugging (user always on same instance) | ❌ Instance failure = lost connections |
| | ❌ Harder to scale dynamically |

| Complexity | Infrastructure | Browser Support |
|------------|----------------|-----------------|
| Medium | Redis + LB config | All browsers |

---

## 🔶 Option C: Sticky Sessions (Cookie-Based)

**Approach**: Set a cookie on first request, route subsequent requests based on cookie value.

```
First Request:
Client → LB → Instance #2 → Set-Cookie: SERVERID=inst2

Subsequent Requests:
Client → LB → (reads cookie) → Instance #2
```

**Load Balancer (nginx with sticky module)**:
```nginx
upstream notification_backend {
    sticky cookie srv_id expires=1h path=/;
    server notification-service-1:5000;
    server notification-service-2:5000;
    server notification-service-3:5000;
}
```

| Pros | Cons |
|------|------|
| ✅ More reliable than IP hash | ❌ Requires nginx sticky module (not in OSS) |
| ✅ Works across IP changes | ❌ Cookie overhead on every request |
| ✅ Supports fallback transports | ❌ Doesn't work if cookies disabled |
| ✅ Better load distribution than IP hash | ❌ Extra complexity |
| | ❌ Still need Redis for cross-instance messaging |

| Complexity | Infrastructure | Browser Support |
|------------|----------------|-----------------|
| Medium-High | Redis + nginx Plus/sticky module | All browsers with cookies |

---

## 🔷 Option D: Azure SignalR Service (Managed)

**Approach**: Offload WebSocket management to Azure's managed SignalR service.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AZURE SIGNALR SERVICE                                │
│                         (Managed WebSocket Infrastructure)                   │
│                                                                             │
│  - Handles all WebSocket connections                                        │
│  - Automatic scaling                                                        │
│  - Built-in Redis-like backplane                                            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
  ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
  │ Instance #1   │       │ Instance #2   │       │ Instance #N   │
  │               │       │               │       │               │
  │ Stateless     │       │ Stateless     │       │ Stateless     │
  │ API servers   │       │ API servers   │       │ API servers   │
  │ (no WS conn)  │       │ (no WS conn)  │       │ (no WS conn)  │
  └───────────────┘       └───────────────┘       └───────────────┘
```

**Backend Configuration**:
```csharp
builder.Services.AddSignalR()
    .AddAzureSignalR(connectionString);
```

| Pros | Cons |
|------|------|
| ✅ Zero WebSocket infrastructure to manage | ❌ Azure vendor lock-in |
| ✅ Automatic scaling to millions of connections | ❌ Monthly cost (~$50-500+/month) |
| ✅ Built-in monitoring and diagnostics | ❌ Data leaves your infrastructure |
| ✅ 99.9% SLA | ❌ Latency to Azure region |
| ✅ No Redis needed | ❌ Less control over configuration |
| ✅ Supports all transports | |

| Complexity | Infrastructure | Browser Support |
|------------|----------------|-----------------|
| Very Low | Azure subscription only | All browsers |

**Pricing** (as of 2024):
| Tier | Connections | Messages/day | Price/month |
|------|-------------|--------------|-------------|
| Free | 20 | 20,000 | $0 |
| Standard | 1,000 | 1,000,000 | ~$50 |
| Premium | 100,000+ | Unlimited | ~$500+ |

---

## 🔶 Option E: Single Instance (MVP/Development)

**Approach**: Start simple with one instance, scale later.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SINGLE INSTANCE                                      │
│                         (No scaling complexity)                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                          ┌───────▼───────┐
                          │ Instance #1   │
                          │               │
                          │ SignalR Hub   │
                          │ All clients   │
                          │               │
                          │ Capacity:     │
                          │ ~10,000 conn  │
                          └───────────────┘
```

| Pros | Cons |
|------|------|
| ✅ Simplest possible setup | ❌ Single point of failure |
| ✅ No Redis needed | ❌ Limited to ~10,000 connections |
| ✅ No load balancer config | ❌ No horizontal scaling |
| ✅ Fast to implement | ❌ Downtime during deployments |
| ✅ Easy debugging | ❌ Must refactor to scale later |

| Complexity | Infrastructure | Browser Support |
|------------|----------------|-----------------|
| Very Low | None | All browsers |

---

## Comparison Summary

| Approach | Complexity | Cost | Scalability | Fallback Support | Vendor Lock-in |
|----------|------------|------|-------------|------------------|----------------|
| **A: Skip Negotiation + Redis** | Low | Low | High | ❌ No | None |
| **B: IP Hash Sticky** | Medium | Low | Medium | ✅ Yes | None |
| **C: Cookie Sticky** | Medium-High | Low-Medium | Medium | ✅ Yes | nginx Plus |
| **D: Azure SignalR** | Very Low | Medium-High | Very High | ✅ Yes | Azure |
| **E: Single Instance** | Very Low | Very Low | None | ✅ Yes | None |

### Decision Matrix

| If you prioritize... | Choose |
|---------------------|--------|
| Simplicity + Modern browsers | **Option A** (Skip Negotiation + Redis) |
| Maximum browser compatibility | **Option B or C** (Sticky Sessions) |
| Zero infrastructure management | **Option D** (Azure SignalR) |
| MVP / Getting started quickly | **Option E** (Single Instance) → migrate to A later |
| Cost optimization | **Option A or E** |
| Enterprise SLA requirements | **Option D** (Azure SignalR) |

---

## 🎯 Recommendation

**For your SaaS platform, I recommend: Option A (Skip Negotiation + Redis)**

**Rationale**:
1. **Browser support is not a concern** - 98%+ of browsers support WebSockets natively
2. **Simpler infrastructure** - No sticky session complexity at load balancer
3. **Better scaling** - Even distribution, easy to add instances
4. **You already need Redis** - For caching and other services
5. **Kubernetes-friendly** - Works with autoscaling without session affinity
6. **No vendor lock-in** - Can migrate to any cloud or on-premise

**Migration Path**:
```
Phase 1: Single Instance (E) - MVP, validate the feature
    ↓
Phase 2: Skip Negotiation + Redis (A) - Production scaling
    ↓
Phase 3 (if needed): Azure SignalR (D) - If you need millions of connections
```

---

## Selected Approach Configuration

> **Note**: Update this section once a decision is made.

### Redis Backplane Configuration (Option A)

```csharp
// File: NotificationService.Web/Program.cs

builder.Services.AddSignalR()
    .AddStackExchangeRedis(options =>
    {
        options.Configuration = builder.Configuration.GetConnectionString("Redis");
        options.Configuration.ChannelPrefix = RedisChannel.Literal("NotificationHub");
    });
```

### Frontend Configuration (Option A)

```typescript
// Skip negotiation, WebSocket only
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_URL}/notificationhub`, {
    accessTokenFactory: () => accessToken,
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect()
  .build();
```

### Load Balancer Configuration (Option A)

```nginx
upstream notification_backend {
    # Round-robin (default) - no sticky sessions needed
    server notification-service-1:5000;
    server notification-service-2:5000;
    server notification-service-3:5000;
}

server {
    location /notificationhub {
        proxy_pass http://notification_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout (24 hours)
        proxy_read_timeout 86400;
    }
}
```

### Connection Capacity Planning

| Metric | Single Instance | With Redis Backplane |
|--------|-----------------|---------------------|
| Concurrent Connections | ~10,000 | ~10,000 per instance |
| Message Throughput | ~5,000/sec | Scales with instances |
| Memory per Connection | ~10KB | ~10KB + Redis overhead |
| Recommended Instance Size | 4GB RAM, 2 vCPU | Same |

---

## Messaging Architecture: RabbitMQ vs Redis (Understanding the Two Concerns)

> **⚠️ DECISION MADE**: We will use **RabbitMQ + Redis** architecture.
> - **RabbitMQ**: Service-to-service communication (durable, reliable)
> - **Redis**: SignalR backplane (fast, low latency)

### The Two Separate Concerns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TWO SEPARATE CONCERNS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. SERVICE-TO-SERVICE COMMUNICATION                                       │
│      "QuestionerService tells NotificationService: someone submitted"       │
│      └── RabbitMQ is perfect for this                                       │
│                                                                             │
│   2. SIGNALR HORIZONTAL SCALING (Backplane)                                 │
│      "NotificationService Instance #1 tells Instance #2: send to User X"    │
│      └── Redis Pub/Sub (fast, low latency)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why SignalR Needs a Backplane (For Multiple Instances)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE PROBLEM WITHOUT A BACKPLANE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Load Balancer                                                             │
│        │                                                                    │
│   ┌────┴────┐                                                               │
│   │         │                                                               │
│   ▼         ▼                                                               │
│ ┌─────────────────┐    ┌─────────────────┐                                  │
│ │ Notification    │    │ Notification    │                                  │
│ │ Service #1      │    │ Service #2      │                                  │
│ │                 │    │                 │                                  │
│ │ Connected:      │    │ Connected:      │                                  │
│ │ - User A        │    │ - User B        │                                  │
│ │ - User C        │    │ - User D        │                                  │
│ └─────────────────┘    └─────────────────┘                                  │
│                                                                             │
│   Event arrives at Instance #1: "Send notification to User B"               │
│                                                                             │
│   ❌ PROBLEM: User B is connected to Instance #2!                           │
│              Instance #1 doesn't know about User B                          │
│              Message is LOST                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE SOLUTION: BACKPLANE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────┐    ┌─────────────────┐                                  │
│ │ Notification    │    │ Notification    │                                  │
│ │ Service #1      │    │ Service #2      │                                  │
│ │                 │    │                 │                                  │
│ │ Connected:      │    │ Connected:      │                                  │
│ │ - User A        │    │ - User B        │                                  │
│ └────────┬────────┘    └────────┬────────┘                                  │
│          │                      │                                           │
│          └──────────┬───────────┘                                           │
│                     │                                                       │
│          ┌──────────▼──────────┐                                            │
│          │     BACKPLANE       │                                            │
│          │     (Redis)         │                                            │
│          │                     │                                            │
│          │  "Send to User B"   │───► Broadcasts to ALL instances            │
│          │                     │     Instance #2 sees it has User B         │
│          │                     │     Instance #2 delivers the message       │
│          └─────────────────────┘                                            │
│                                                                             │
│   ✅ SOLVED: All instances hear all messages, deliver to their users        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Infrastructure Options Comparison

#### Option 1: RabbitMQ Only (MassTransit.SignalR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 1: RABBITMQ FOR EVERYTHING                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │ Questioner  │     │ OnlineMenu  │     │ Identity    │                   │
│   │ Service     │     │ Service     │     │ Service     │                   │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│                    ┌─────────────────┐                                      │
│                    │    RabbitMQ     │                                      │
│                    │                 │                                      │
│                    │ • Service-to-   │                                      │
│                    │   Service msgs  │                                      │
│                    │                 │                                      │
│                    │ • SignalR       │  ◄── MassTransit.SignalR             │
│                    │   Backplane     │      uses RabbitMQ as backplane      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│          ┌──────────────────┼──────────────────┐                            │
│          │                  │                  │                            │
│   ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                     │
│   │ Notification│    │ Notification│    │ Notification│                     │
│   │ Service #1  │    │ Service #2  │    │ Service #N  │                     │
│   └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
│   ✅ PROS:                                                                  │
│   • Single messaging infrastructure                                         │
│   • RabbitMQ has better durability than Redis Pub/Sub                       │
│   • MassTransit handles all the complexity                                  │
│   • Fewer services to manage                                                │
│                                                                             │
│   ⚠️ CONS:                                                                  │
│   • Slightly higher latency than Redis (~5-10ms more)                       │
│   • RabbitMQ is heavier than Redis                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Option 2: RabbitMQ + Redis (CHOSEN ✅)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 2: RABBITMQ + REDIS (CHOSEN ✅)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │ Questioner  │     │ OnlineMenu  │     │ Identity    │                   │
│   │ Service     │     │ Service     │     │ Service     │                   │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│                    ┌─────────────────┐                                      │
│                    │    RabbitMQ     │  ◄── Service-to-Service only         │
│                    │                 │      (durable, reliable)             │
│                    │ "Questionnaire  │                                      │
│                    │  submitted"     │                                      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│                             ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │ Notification    │                                      │
│                    │ Service         │                                      │
│                    │ (consumes)      │                                      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│                             ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │     Redis       │  ◄── SignalR Backplane only          │
│                    │    Pub/Sub      │      (fast, low latency)             │
│                    └────────┬────────┘                                      │
│                             │                                               │
│          ┌──────────────────┼──────────────────┐                            │
│          │                  │                  │                            │
│   ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                     │
│   │ Notification│    │ Notification│    │ Notification│                     │
│   │ Service #1  │    │ Service #2  │    │ Service #N  │                     │
│   └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
│   ✅ PROS:                                                                  │
│   • Redis is extremely fast for Pub/Sub (~sub-millisecond)                  │
│   • Best of both worlds: durable messaging + fast backplane                 │
│   • Official Microsoft-supported SignalR Redis backplane                    │
│   • RabbitMQ guarantees message delivery for service events                 │
│                                                                             │
│   ⚠️ CONS:                                                                  │
│   • Two infrastructure components to manage                                 │
│   • Redis Pub/Sub is fire-and-forget (no persistence)                       │
│   • More operational complexity                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Option 3: Single Instance (MVP Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 3: SINGLE INSTANCE (NO BACKPLANE)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │ Questioner  │     │ OnlineMenu  │     │ Identity    │                   │
│   │ Service     │     │ Service     │     │ Service     │                   │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│                    ┌─────────────────┐                                      │
│                    │    RabbitMQ     │  ◄── Service-to-Service only         │
│                    └────────┬────────┘                                      │
│                             │                                               │
│                             ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │ Notification    │  ◄── SINGLE INSTANCE                 │
│                    │ Service         │      No backplane needed!            │
│                    │                 │      All users connected here        │
│                    │ Capacity:       │                                      │
│                    │ ~10,000 users   │                                      │
│                    └─────────────────┘                                      │
│                                                                             │
│   ✅ PROS:                                                                  │
│   • Simplest architecture                                                   │
│   • No Redis needed                                                         │
│   • Easy to debug                                                           │
│   • Good for up to ~10,000 concurrent connections                           │
│                                                                             │
│   ⚠️ CONS:                                                                  │
│   • Single point of failure                                                 │
│   • Cannot scale horizontally                                               │
│   • Downtime during deployments                                             │
│                                                                             │
│   📝 NOTE: You can START here and ADD Redis backplane later when needed     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Decision Matrix

| Factor | Single Instance | RabbitMQ Only | RabbitMQ + Redis |
|--------|-----------------|---------------|------------------|
| **Complexity** | ⭐ Very Low | ⭐⭐ Low | ⭐⭐⭐ Medium |
| **Latency** | ⭐ Best | ⭐⭐ Good (~10-20ms) | ⭐ Best (<5ms) |
| **Scalability** | ❌ ~10K users | ✅ Unlimited | ✅ Unlimited |
| **High Availability** | ❌ No | ✅ Yes | ✅ Yes |
| **Infrastructure** | RabbitMQ only | RabbitMQ only | RabbitMQ + Redis |
| **Zero-downtime deploy** | ❌ No | ✅ Yes | ✅ Yes |
| **Message Durability** | ✅ RabbitMQ | ✅ RabbitMQ | ✅ RabbitMQ |
| **Backplane Latency** | N/A | ~10-20ms | <5ms |

### Phased Implementation Approach

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED: PHASED APPROACH                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 1 (MVP - Can Start Here)                                            │
│   ─────────────────────────────────                                         │
│   • Single NotificationService instance                                     │
│   • RabbitMQ for service-to-service messaging                               │
│   • NO backplane needed yet                                                 │
│   • Supports: ~10,000 concurrent connections                                │
│                                                                             │
│   When to move to Phase 2:                                                  │
│   • Approaching 5,000+ concurrent connections                               │
│   • Need zero-downtime deployments                                          │
│   • Need high availability                                                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   PHASE 2 (Production Scale - Our Target ✅)                                │
│   ──────────────────────────────────────────                                │
│   • Multiple NotificationService instances                                  │
│   • RabbitMQ for service-to-service messaging                               │
│   • Redis for SignalR backplane                                             │
│   • Supports: Unlimited horizontal scaling                                  │
│   • Zero-downtime deployments                                               │
│   • High availability                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Chosen Architecture: RabbitMQ + Redis

**Why we chose RabbitMQ + Redis:**

1. **Best Performance**: Redis Pub/Sub provides sub-millisecond latency for the SignalR backplane
2. **Message Durability**: RabbitMQ ensures service-to-service events are never lost
3. **Official Support**: Microsoft officially supports the Redis SignalR backplane
4. **Separation of Concerns**: Each technology does what it's best at
5. **Production-Ready**: Both are battle-tested at massive scale

**Infrastructure Requirements:**

| Component | Purpose | High Availability |
|-----------|---------|-------------------|
| **RabbitMQ** | Service-to-service events | RabbitMQ Cluster (3 nodes) |
| **Redis** | SignalR backplane | Redis Sentinel or Redis Cluster |
| **PostgreSQL** | Notification persistence | Already in use |

---

## Backplane Options Comparison

> **Sources**: [Microsoft Learn - Redis Backplane](https://learn.microsoft.com/en-us/aspnet/core/signalr/redis-backplane), [Ably - Scaling SignalR](https://ably.com/topic/scaling-signalr), [MassTransit SignalR](https://masstransit.io/documentation/configuration/integrations/signalr), [NCache SignalR](https://www.alachisoft.com/blogs/scaling-real-time-asp-net-core-signalr-apps/)

### Why You Need a Backplane

When running multiple SignalR server instances, each instance only knows about its own connected clients. A backplane enables cross-instance message delivery:

```
WITHOUT Backplane:                      WITH Backplane:
─────────────────                       ───────────────
Instance #1: Users A, B                 Instance #1: Users A, B
Instance #2: Users C, D                 Instance #2: Users C, D
                                                    │
Send to "all users" from #1:            Send to "all users" from #1:
→ Only A, B receive ❌                  → All A, B, C, D receive ✅
                                                    │
                                        Backplane routes message
                                        to all instances
```

### Option 1: Redis Backplane (Official)

**The officially supported and most common choice.**

```csharp
// Configuration
builder.Services.AddSignalR()
    .AddStackExchangeRedis(connectionString, options => {
        options.Configuration.ChannelPrefix = RedisChannel.Literal("MyApp");
    });
```

| Aspect | Details |
|--------|---------|
| **Throughput** | ~20,000 messages/second (tested) |
| **Latency** | Sub-millisecond (same datacenter) |
| **Complexity** | Low - single NuGet package |
| **High Availability** | Redis Sentinel or Redis Cluster |
| **Message Persistence** | ❌ No - messages lost if Redis down |
| **Sticky Sessions** | Required unless WebSocket-only + SkipNegotiation |

| Pros | Cons |
|------|------|
| ✅ Official Microsoft support | ❌ Single point of failure (without HA) |
| ✅ Simple configuration | ❌ Messages lost during Redis downtime |
| ✅ Low latency | ❌ Must be in same datacenter |
| ✅ Proven at scale | ❌ Additional infrastructure to manage |
| ✅ Redis Cluster for HA | ❌ No message ordering guarantees |

**Best For**: Most self-hosted production deployments

---

### Option 2: SQL Server Backplane (Community)

**Uses SQL Server Service Broker for pub/sub messaging.**

```csharp
// Using IntelliTect.AspNetCore.SignalR.SqlServer package
builder.Services.AddSignalR()
    .AddSqlServer(connectionString);
```

| Aspect | Details |
|--------|---------|
| **Throughput** | ~1,000-10,000 messages/second |
| **Latency** | Higher than Redis (~5-50ms) |
| **Complexity** | Medium - requires Service Broker setup |
| **High Availability** | SQL Server Always On |
| **Message Persistence** | ✅ Yes - messages stored in tables |
| **Sticky Sessions** | Required |

| Pros | Cons |
|------|------|
| ✅ Use existing SQL Server | ❌ Lower throughput than Redis |
| ✅ Message persistence | ❌ Higher latency |
| ✅ Familiar technology | ❌ Service Broker not on Azure SQL |
| ✅ ACID guarantees | ❌ Not officially supported |
| ✅ No new infrastructure | ❌ Can become bottleneck at scale |

**Best For**: Teams already heavily invested in SQL Server who don't want Redis

> **Source**: [IntelliTect SQL Server Backplane](https://github.com/IntelliTect/IntelliTect.AspNetCore.SignalR.SqlServer)

---

### Option 3: MassTransit + RabbitMQ/Azure Service Bus

**Uses MassTransit as an abstraction over various message brokers.**

```csharp
// Configuration with RabbitMQ
builder.Services.AddSignalR();
builder.Services.AddMassTransit(x => {
    x.AddSignalRHub<NotificationHub>();

    x.UsingRabbitMq((context, cfg) => {
        cfg.Host("localhost", "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ConfigureEndpoints(context);
    });
});
```

| Aspect | Details |
|--------|---------|
| **Throughput** | ~10,000-50,000 messages/second (RabbitMQ) |
| **Latency** | ~1-10ms |
| **Complexity** | Medium-High - MassTransit abstraction |
| **High Availability** | RabbitMQ clustering / Azure Service Bus |
| **Message Persistence** | ✅ Yes - durable queues |
| **Sticky Sessions** | Required unless WebSocket-only + SkipNegotiation |

| Pros | Cons |
|------|------|
| ✅ Message durability | ❌ More complex setup |
| ✅ Multiple broker support | ❌ Additional abstraction layer |
| ✅ Dead letter queues | ❌ Creates many queues (5 per hub) |
| ✅ Already using MassTransit? Perfect fit | ❌ Not officially supported |
| ✅ Reuse existing RabbitMQ | ❌ Steeper learning curve |

**Best For**: Teams already using MassTransit/RabbitMQ for other messaging

> **Source**: [MassTransit SignalR Documentation](https://masstransit.io/documentation/configuration/integrations/signalr)

---

### Option 4: NCache Backplane

**Commercial distributed cache with native .NET support.**

```csharp
// Configuration
builder.Services.AddSignalR()
    .AddNCache(options => {
        options.CacheName = "SignalRCache";
    });
```

| Aspect | Details |
|--------|---------|
| **Throughput** | Claims higher than Redis (vendor claim) |
| **Latency** | Sub-millisecond |
| **Complexity** | Medium - requires NCache setup |
| **High Availability** | Built-in clustering |
| **Message Persistence** | Optional persistence |
| **Sticky Sessions** | Required |

| Pros | Cons |
|------|------|
| ✅ Native .NET (no Linux dependency) | ❌ Commercial license cost |
| ✅ Built-in high availability | ❌ Less community knowledge |
| ✅ .NET-optimized | ❌ Vendor lock-in |
| ✅ No Redis infrastructure | ❌ Another technology to learn |

**Best For**: Enterprise environments preferring native .NET solutions

> **Source**: [NCache SignalR Scaling](https://www.alachisoft.com/blogs/scaling-real-time-asp-net-core-signalr-apps/)

---

### Option 5: Orleans Backplane

**Uses Microsoft Orleans actor framework for distributed state.**

```csharp
// Requires Orleans silo setup + SignalR.Orleans package
builder.Services.AddSignalR()
    .AddOrleans();
```

| Aspect | Details |
|--------|---------|
| **Throughput** | High (actor-based, scales horizontally) |
| **Latency** | Low |
| **Complexity** | High - requires Orleans infrastructure |
| **High Availability** | Built into Orleans |
| **Message Persistence** | Configurable |
| **Sticky Sessions** | Not required (Orleans handles routing) |

| Pros | Cons |
|------|------|
| ✅ No sticky sessions needed | ❌ Significant complexity |
| ✅ Built-in clustering | ❌ Requires Orleans expertise |
| ✅ Actor model benefits | ❌ Overkill for just SignalR |
| ✅ Microsoft supported | ❌ Major architecture change |

**Best For**: Teams already using Orleans or building complex distributed systems

---

### Backplane Comparison Matrix

| Backplane | Throughput | Latency | Complexity | HA Support | Official | Cost |
|-----------|------------|---------|------------|------------|----------|------|
| **Redis** | ~20K/sec | <1ms | Low | Cluster/Sentinel | ✅ Yes | Free |
| **SQL Server** | ~1-10K/sec | 5-50ms | Medium | Always On | ❌ Community | Existing |
| **MassTransit/RabbitMQ** | ~10-50K/sec | 1-10ms | Medium-High | Clustering | ❌ Community | Free |
| **NCache** | ~20K+/sec | <1ms | Medium | Built-in | ❌ Third-party | $$ |
| **Orleans** | High | Low | High | Built-in | ❌ Community | Free |

### Decision: Backplane Selection

| If you... | Choose |
|-----------|--------|
| Want simplicity + official support | **Redis** |
| Already have SQL Server, low volume | **SQL Server** |
| Already use MassTransit/RabbitMQ | **MassTransit** |
| Need native .NET, have budget | **NCache** |
| Building complex distributed system | **Orleans** |

**Recommendation for this project**: **Redis** - simplest, officially supported, proven at scale

---

## ASP.NET Core 8+ Features

> **Source**: [Microsoft Learn - SignalR Configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)

### Stateful Reconnect (New in .NET 8)

A game-changing feature that **preserves connection state during temporary disconnects**.

#### The Problem It Solves

```
BEFORE Stateful Reconnect:
──────────────────────────
1. Client connected (ConnectionId: abc123)
2. Network blip (2 seconds)
3. Client reconnects (NEW ConnectionId: xyz789)
4. ❌ Lost: Group memberships, Context.Items, pending messages
5. App must re-sync all state

AFTER Stateful Reconnect:
─────────────────────────
1. Client connected (ConnectionId: abc123)
2. Network blip (2 seconds)
3. Client reconnects (SAME ConnectionId: abc123)
4. ✅ Preserved: Group memberships, Context.Items
5. ✅ Buffered messages delivered automatically
```

#### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STATEFUL RECONNECT FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

    Client                                              Server
       │                                                   │
       │  Connected (ConnectionId: abc123)                 │
       │◀═════════════════════════════════════════════════▶│
       │                                                   │
       │          ┌─────────────────────┐                  │
       │          │  Network disconnect │                  │
       │          │  (up to 30 seconds) │                  │
       │          └─────────────────────┘                  │
       │                                                   │
       │                                    ┌──────────────┴──────────────┐
       │                                    │ Server buffers messages     │
       │                                    │ in StatefulReconnectBuffer  │
       │                                    │ (default: 100KB)            │
       │                                    └──────────────┬──────────────┘
       │                                                   │
       │  Reconnect with same ConnectionId                 │
       │══════════════════════════════════════════════════▶│
       │                                                   │
       │  Buffered messages delivered                      │
       │◀══════════════════════════════════════════════════│
       │                                                   │
       │  ✅ Same groups, same Context.Items               │
       │                                                   │
```

#### Configuration

**Server-side (Program.cs):**
```csharp
// Enable globally
builder.Services.AddSignalR(options => {
    options.StatefulReconnectBufferSize = 100_000; // 100KB default
});

// Enable per-hub
builder.Services.AddSignalR()
    .AddHubOptions<NotificationHub>(options => {
        options.StatefulReconnectBufferSize = 50_000; // 50KB for this hub
    });

// Enable on endpoint
app.MapHub<NotificationHub>("/notificationhub", options => {
    options.AllowStatefulReconnects = true;
});
```

**Client-side (.NET):**
```csharp
var connection = new HubConnectionBuilder()
    .WithUrl("https://example.com/notificationhub")
    .WithStatefulReconnect()  // ← Enable stateful reconnect
    .Build();
```

**Client-side (JavaScript/TypeScript):**
```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notificationhub")
    .withStatefulReconnect({ bufferSize: 100000 })  // ← Enable
    .build();
```

#### Implications for Our Architecture

| Aspect | Impact |
|--------|--------|
| **Reconnection UX** | Much smoother - no re-joining groups |
| **Message Reliability** | Better - buffered during short disconnects |
| **Memory Usage** | Higher - buffer per connection (100KB default) |
| **Scaling** | Still need backplane for cross-instance messaging |
| **Sticky Sessions** | Still applies - reconnect must hit same server |

**Important**: Stateful Reconnect does NOT eliminate the need for:
- Redis backplane (cross-instance messaging)
- Sticky sessions (unless WebSocket-only + SkipNegotiation)

It complements these by improving the reconnection experience.

---

### Other .NET 8+ SignalR Improvements

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Stateful Reconnect** | Preserve connection state | Better UX |
| **Improved Compression** | WebSocket per-message deflate | Lower bandwidth |
| **Native AOT Support** | Ahead-of-time compilation | Faster startup |
| **Keyed Services** | Better DI for multiple hubs | Cleaner code |

---

## Official Microsoft Guidance Summary

> **Source**: [Microsoft Learn - SignalR Hosting and Scaling](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)

### When Sticky Sessions ARE Required

| Scenario | Sticky Sessions |
|----------|-----------------|
| Single server | ❌ Not needed |
| Multiple servers + any fallback transport | ✅ Required |
| Multiple servers + Redis + fallback transports | ✅ Required |
| Multiple servers + WebSocket-only + SkipNegotiation | ❌ Not needed |

### Microsoft's Exact Wording

> "Sticky sessions aren't required when all clients are configured to **only** use WebSockets **and** the SkipNegotiation setting is enabled in the client configuration."

### Configuration for No Sticky Sessions

To avoid sticky sessions, you MUST configure BOTH:

**Frontend (must have both settings):**
```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub", {
        skipNegotiation: true,                           // ← Required
        transport: signalR.HttpTransportType.WebSockets, // ← Required
    })
    .build();
```

**Backend (optional but recommended):**
```csharp
// Optionally disable other transports at server level
app.MapHub<NotificationHub>("/notificationhub", options => {
    options.Transports = HttpTransportType.WebSockets; // WebSocket only
});
```

---

## Multi-Tenancy

### Tenant Isolation Strategy

```csharp
// File: NotificationService.Core/Interfaces/INotificationRepository.cs

public interface INotificationRepository : IRepository<Notification>
{
    // All queries automatically filtered by TenantId via EF global filter
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(
        Guid userId,
        int skip,
        int take,
        CancellationToken ct);

    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct);
}

// File: NotificationService.Infrastructure/Data/AppDbContext.cs

public class AppDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global tenant filter - automatic isolation
        modelBuilder.Entity<Notification>().HasQueryFilter(n =>
            _currentTenantService.TenantId == null || // SuperUser bypass
            n.TenantId == _currentTenantService.TenantId);
    }
}
```

### SignalR Group Strategy

```
Groups per Tenant:
├── tenant:{tenantId}                    # All users in tenant (broadcast)
├── tenant:{tenantId}:admins             # Admin users only
├── tenant:{tenantId}:channel:questionnaire  # Questionnaire notifications
├── tenant:{tenantId}:channel:menu       # Menu update notifications
└── user:{userId}                        # Personal notifications
```

### Per-Tenant Rate Limiting

```csharp
// File: NotificationService.Web/Middleware/TenantRateLimitMiddleware.cs

public class TenantRateLimitMiddleware
{
    private readonly IDistributedCache _cache;
    private const int MAX_CONNECTIONS_PER_TENANT = 10000;
    private const int MAX_MESSAGES_PER_MINUTE = 1000;

    public async Task InvokeAsync(HttpContext context, ICurrentTenantService tenantService)
    {
        var tenantId = tenantService.TenantId;
        if (tenantId == null)
        {
            context.Response.StatusCode = 401;
            return;
        }

        var connectionCount = await _cache.GetAsync<int>($"connections:{tenantId}");
        if (connectionCount >= MAX_CONNECTIONS_PER_TENANT)
        {
            context.Response.StatusCode = 429; // Too Many Requests
            return;
        }

        await _next(context);
    }
}
```

---

## Security Considerations

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          WEBSOCKET AUTHENTICATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐         ┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
    │  Client │         │   Identity  │         │  Notification│         │     Redis       │
    │  (App)  │         │   Service   │         │   Service    │         │   (Backplane)   │
    └────┬────┘         └──────┬──────┘         └──────┬───────┘         └────────┬────────┘
         │                     │                       │                          │
         │  1. Login           │                       │                          │
         │────────────────────▶│                       │                          │
         │                     │                       │                          │
         │  2. JWT Token       │                       │                          │
         │    (contains        │                       │                          │
         │     tenant_id,      │                       │                          │
         │     user_id)        │                       │                          │
         │◀────────────────────│                       │                          │
         │                     │                       │                          │
         │  3. Connect to SignalR Hub                  │                          │
         │     (Authorization: Bearer {jwt})           │                          │
         │────────────────────────────────────────────▶│                          │
         │                     │                       │                          │
         │                     │                       │ 4. Validate JWT          │
         │                     │                       │    Extract tenant_id     │
         │                     │                       │    Extract user_id       │
         │                     │                       │                          │
         │                     │                       │ 5. Add to groups         │
         │                     │                       │    - tenant:{id}         │
         │                     │                       │    - user:{id}           │
         │                     │                       │────────────────────────▶│
         │                     │                       │                          │
         │  6. Connected       │                       │                          │
         │◀────────────────────────────────────────────│                          │
         │                     │                       │                          │
```

### JWT Validation for WebSocket

```csharp
// File: NotificationService.Web/Program.cs

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Keycloak:Authority"];
        options.Audience = builder.Configuration["Keycloak:Audience"];

        // Handle JWT in query string for WebSocket (SignalR)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/notificationhub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });
```

### Security Checklist

| Security Concern | Mitigation |
|-----------------|------------|
| Unauthorized Access | JWT validation on connection |
| Cross-Tenant Data Leak | SignalR groups isolated by tenant |
| Message Spoofing | Server-side message generation only |
| Connection Flooding | Rate limiting per tenant |
| Token Expiry | Automatic reconnect with refresh token |
| Data in Transit | WSS (WebSocket Secure) only |
| **Service Worker XSS** | CSP headers, no eval(), minimal code in sw.js |
| **Notification Content Injection** | Sanitize notification title/body server-side |

---

## Frontend Integration

### React Native SignalR Client

```typescript
// File: BaseClient/src/lib/signalr/notificationClient.ts

import * as signalR from '@microsoft/signalr';
import { store } from '@/store';
import { addNotification, setConnectionStatus } from '@/store/notificationsSlice';

const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];
const MAX_RECONNECT_ATTEMPTS = 10;

class NotificationClient {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;

  async connect(accessToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${NOTIFICATION_API_URL}/notificationhub`, {
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true, // WebSocket only
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= MAX_RECONNECT_ATTEMPTS) {
            return null; // Stop reconnecting
          }
          const delayIndex = Math.min(
            retryContext.previousRetryCount,
            RECONNECT_DELAYS.length - 1
          );
          return RECONNECT_DELAYS[delayIndex];
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.setupEventHandlers();

    try {
      await this.connection.start();
      this.reconnectAttempts = 0;
      store.dispatch(setConnectionStatus('connected'));
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      store.dispatch(setConnectionStatus('error'));
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Single notification
    this.connection.on('ReceiveNotification', (notification: NotificationDto) => {
      store.dispatch(addNotification(notification));
      this.showLocalNotification(notification);
    });

    // Batch of pending notifications
    this.connection.on('ReceivePendingNotifications', (notifications: NotificationDto[]) => {
      notifications.forEach((n) => store.dispatch(addNotification(n)));
    });

    // Connection state handlers
    this.connection.onreconnecting(() => {
      store.dispatch(setConnectionStatus('reconnecting'));
    });

    this.connection.onreconnected(() => {
      store.dispatch(setConnectionStatus('connected'));
      this.reconnectAttempts = 0;
    });

    this.connection.onclose(() => {
      store.dispatch(setConnectionStatus('disconnected'));
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async acknowledgeNotification(notificationId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('AcknowledgeNotification', notificationId);
    }
  }

  async subscribeToChannel(channel: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SubscribeToChannel', channel);
    }
  }

  private showLocalNotification(notification: NotificationDto): void {
    // Platform-specific local notification
    // Uses expo-notifications
  }
}

export const notificationClient = new NotificationClient();
```

### Redux Notification Slice

```typescript
// File: BaseClient/src/store/notificationsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting' | 'error';
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: 'disconnected',
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationDto>) => {
      // Prepend new notification
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
    setConnectionStatus: (state, action: PayloadAction<NotificationState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  setConnectionStatus,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
```

### React Query Cache Invalidation

```typescript
// File: BaseClient/src/lib/signalr/cacheInvalidator.ts

import { queryClient } from '@/lib/queryClient';
import { NotificationDto, NotificationType } from '@/types/notifications';

/**
 * Invalidate relevant caches when notifications arrive
 * This keeps the UI in sync without manual refresh
 */
export function handleNotificationCacheInvalidation(notification: NotificationDto): void {
  switch (notification.type) {
    case NotificationType.QuestionnaireSubmitted:
      // Invalidate questionnaire responses list
      queryClient.invalidateQueries({
        queryKey: ['questionnaire', 'responses', notification.data?.templateId],
      });
      break;

    case NotificationType.TemplateUpdated:
      // Invalidate template details
      queryClient.invalidateQueries({
        queryKey: ['questionnaire', 'template', notification.data?.templateId],
      });
      break;

    case NotificationType.MenuUpdated:
      // Invalidate menu list
      queryClient.invalidateQueries({
        queryKey: ['menus'],
      });
      break;

    case NotificationType.SubscriptionExpiring:
      // Invalidate subscription status
      queryClient.invalidateQueries({
        queryKey: ['subscription', 'status'],
      });
      break;
  }
}
```

### Service Worker for OS Notifications (File Structure)

> **Note**: This is NOT Web Push. The Service Worker is used ONLY for displaying OS notifications.
> All messages come through SignalR - the Service Worker does not receive push messages.

```
BaseClient/
├── public/
│   ├── sw.js                      # Service worker (display only)
│   ├── icons/
│   │   ├── notification-icon-192.png
│   │   └── badge-72.png
│   └── manifest.json              # PWA manifest
├── src/
│   ├── lib/
│   │   ├── notifications/
│   │   │   ├── osNotificationService.ts    # NOT push, just display
│   │   │   ├── serviceWorkerRegistration.ts
│   │   │   └── types.ts
```

### Service Worker Implementation (Display Only)

```javascript
// File: BaseClient/public/sw.js

// Service Worker for OS Notification DISPLAY ONLY
// This does NOT receive push messages - all messages come via SignalR
// The main app sends messages to this Service Worker to display OS notifications

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating.');
  event.waitUntil(clients.claim());
});

// NO 'push' event listener - we don't use Web Push!
// Instead, we receive messages from the main app

// Message event - receives notification requests from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from app:', event.data);

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;

    event.waitUntil(
      self.registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || '/icons/notification-icon-192.png',
        badge: options.badge || '/icons/badge-72.png',
        tag: options.tag || 'default',
        data: options.data || {},
        requireInteraction: options.requireInteraction || false,
        actions: [
          { action: 'open', title: 'Open' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              notificationId: event.notification.data?.notificationId,
              url: urlToOpen,
            });
            return;
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

### OS Notification Service (Frontend - Display Only)

```typescript
// File: BaseClient/src/lib/notifications/osNotificationService.ts

import { Platform } from 'react-native';

// This service is for DISPLAYING OS notifications only
// It does NOT handle push subscriptions or VAPID keys
// All notifications are delivered via SignalR, then displayed here

class OSNotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Check if OS notifications are supported (web only)
   */
  isSupported(): boolean {
    if (Platform.OS !== 'web') {
      return false;
    }
    return 'serviceWorker' in navigator && 'Notification' in window;
  }

  /**
   * Get current notification permission state
   */
  getPermissionState(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Request permission to show OS notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('OS notifications not supported');
    }
    return await Notification.requestPermission();
  }

  /**
   * Initialize the service worker (call on app startup)
   */
  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered for OS notifications');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Show an OS notification (called when SignalR delivers a message)
   * This sends a message to the Service Worker to display the notification
   */
  async showNotification(
    title: string,
    options: {
      body?: string;
      icon?: string;
      tag?: string;
      url?: string;
      notificationId?: string;
      requireInteraction?: boolean;
    }
  ): Promise<boolean> {
    // Check permission
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Ensure service worker is ready
    if (!this.registration) {
      await this.initialize();
    }

    const swRegistration = await navigator.serviceWorker.ready;

    // Send message to service worker to display notification
    swRegistration.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options: {
        body: options.body,
        icon: options.icon || '/icons/notification-icon-192.png',
        badge: '/icons/badge-72.png',
        tag: options.tag || options.notificationId,
        data: {
          url: options.url || '/notifications',
          notificationId: options.notificationId,
        },
        requireInteraction: options.requireInteraction,
      },
    });

    return true;
  }
}

export const osNotificationService = new OSNotificationService();
```

### Updated NotificationClient (SignalR + OS Display)

```typescript
// File: BaseClient/src/lib/signalr/notificationClient.ts

import { osNotificationService } from '@/lib/notifications/osNotificationService';

// In the setupEventHandlers method:
connection.on('ReceiveNotification', (notification: NotificationDto) => {
  // Always add to store (for in-app display)
  store.dispatch(addNotification(notification));

  // Check how user wants this notification displayed
  if (notification.displayAs === 'os_notification' || notification.displayAs === 'both') {
    // Show OS notification via Service Worker
    osNotificationService.showNotification(notification.title, {
      body: notification.body,
      notificationId: notification.id,
      url: `/notifications/${notification.id}`,
      requireInteraction: notification.priority === 'high',
    });
  }

  if (notification.displayAs === 'in_app' || notification.displayAs === 'both') {
    // Show in-app toast
    showInAppToast(notification);
  }
});
```

### Flow Diagram: SignalR → Service Worker (Display Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOW IT WORKS (NO WEB PUSH)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. Backend sends notification via SignalR                                 │
│      NotificationHub.SendAsync("ReceiveNotification", data)                 │
│                        │                                                    │
│                        ▼                                                    │
│   2. Frontend receives via WebSocket (tab must be open!)                    │
│      connection.on('ReceiveNotification', callback)                         │
│                        │                                                    │
│                        ▼                                                    │
│   3. Check user's display preference                                        │
│      if (notification.displayAs === 'os_notification')                      │
│                        │                                                    │
│                        ▼                                                    │
│   4. Send message to Service Worker                                         │
│      swRegistration.active.postMessage({ type: 'SHOW_NOTIFICATION', ... })  │
│                        │                                                    │
│                        ▼                                                    │
│   5. Service Worker displays OS notification                                │
│      self.registration.showNotification(title, options)                     │
│                        │                                                    │
│                        ▼                                                    │
│   ┌──────────────────────────────┐                                          │
│   │ 🔔 Your SaaS App             │  ← Appears in OS notification center    │
│   │ New questionnaire response   │                                          │
│   │ Click to view                │                                          │
│   └──────────────────────────────┘                                          │
│                                                                             │
│   ⚠️ REQUIREMENT: Tab must be open for SignalR to deliver the message      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### PostgreSQL Schema

```sql
-- File: NotificationService.Infrastructure/Data/Migrations/InitialCreate.sql

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    priority SMALLINT NOT NULL DEFAULT 0,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_attempts INTEGER NOT NULL DEFAULT 0,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_notifications_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes for common queries
CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, is_read)
    WHERE is_read = FALSE;

CREATE INDEX idx_notifications_tenant_created
    ON notifications (tenant_id, created_at DESC);

CREATE INDEX idx_notifications_offline_delivery
    ON notifications (is_delivered, delivery_attempts)
    WHERE is_delivered = FALSE;

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL UNIQUE,

    -- Channel preferences (email, push, in-app)
    questionnaire_submitted_channels JSONB NOT NULL DEFAULT '["in_app", "push"]',
    template_updated_channels JSONB NOT NULL DEFAULT '["in_app"]',
    system_alert_channels JSONB NOT NULL DEFAULT '["in_app", "push", "email"]',

    -- Quiet hours
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50),

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_preferences_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Notification types enum (for reference)
-- Types: questionnaire_submitted, template_updated, menu_updated,
--        subscription_expiring, payment_due, system_maintenance
```

### Schema Additions: Global Toggle & Web Push

```sql
-- =============================================================
-- MIGRATION: Add Global Notification Toggle & Display Preferences
-- =============================================================

-- Modify notification_preferences table
ALTER TABLE notification_preferences
ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN notifications_disabled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN notifications_disabled_reason VARCHAR(100),
-- Display preference per notification type: 'in_app', 'os_notification', 'both', 'none'
ADD COLUMN questionnaire_submitted_display VARCHAR(20) NOT NULL DEFAULT 'in_app',
ADD COLUMN template_updated_display VARCHAR(20) NOT NULL DEFAULT 'in_app',
ADD COLUMN system_alert_display VARCHAR(20) NOT NULL DEFAULT 'both',
ADD COLUMN payment_due_display VARCHAR(20) NOT NULL DEFAULT 'both';

-- Add delivery tracking to notifications table
ALTER TABLE notifications
ADD COLUMN delivery_skipped_reason VARCHAR(50),
-- How this notification should be displayed (determined at delivery time)
ADD COLUMN display_as VARCHAR(20) NOT NULL DEFAULT 'in_app';
-- Values for delivery_skipped_reason: null (not skipped), 'user_disabled', 'quiet_hours', 'channel_disabled', 'expired'
-- Values for display_as: 'in_app', 'os_notification', 'both', 'none'

-- NOTE: We do NOT need push_subscriptions or vapid_keys tables
-- because we are NOT using Web Push API (no external push services)
-- All notifications are delivered via SignalR, Service Worker is display-only
```

### Entity Definition

```csharp
// File: NotificationService.Core/NotificationAggregate/Notification.cs

public class Notification : BaseTenantEntity, IAggregateRoot
{
    public NotificationType Type { get; private set; }
    public string Title { get; private set; }
    public string? Body { get; private set; }
    public JsonDocument? Data { get; private set; }
    public NotificationPriority Priority { get; private set; }
    public bool IsRead { get; private set; }
    public bool IsDelivered { get; private set; }
    public int DeliveryAttempts { get; private set; }
    public DateTimeOffset? ScheduledFor { get; private set; }
    public DateTimeOffset? ExpiresAt { get; private set; }
    public DateTimeOffset? ReadAt { get; private set; }

    // Factory method
    public static Notification Create(
        Guid tenantId,
        Guid userId,
        NotificationType type,
        string title,
        string? body = null,
        object? data = null,
        NotificationPriority priority = NotificationPriority.Normal)
    {
        return new Notification
        {
            TenantId = tenantId,
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Data = data != null ? JsonDocument.Parse(JsonSerializer.Serialize(data)) : null,
            Priority = priority,
            IsRead = false,
            IsDelivered = false,
            DeliveryAttempts = 0,
        };
    }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTimeOffset.UtcNow;
    }

    public void MarkAsDelivered()
    {
        IsDelivered = true;
    }

    public void IncrementDeliveryAttempt()
    {
        DeliveryAttempts++;
    }

    public void MarkForOfflineDelivery()
    {
        IsDelivered = false;
    }
}

public enum NotificationType
{
    QuestionnaireSubmitted,
    TemplateUpdated,
    MenuUpdated,
    SubscriptionExpiring,
    PaymentDue,
    SystemMaintenance,
    UserInvited,
    PasswordChanged,
    Custom
}

public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}
```

### Note: No Web Push Entities Needed

> **IMPORTANT**: We are NOT using Web Push API, so we do NOT need:
> - `PushSubscription` entity (for storing browser push subscriptions)
> - `VapidKeys` entity (for VAPID authentication)
> - `WebPushService` (for sending to Google/Mozilla/Microsoft)
> - `WebPush-NetCore` NuGet package
>
> All notifications are delivered via **SignalR only**. The Service Worker is used
> purely for **displaying** OS notifications, not for receiving them.

---

## API Contracts

### REST Endpoints (FastEndpoints)

```csharp
// GET /api/notifications
// Returns paginated list of user notifications
public class GetNotificationsEndpoint : Endpoint<GetNotificationsRequest, PaginatedResponse<NotificationDto>>
{
    public override void Configure()
    {
        Get("/api/notifications");
        Roles("User");
    }
}

// GET /api/notifications/unread/count
// Returns unread notification count
public class GetUnreadCountEndpoint : EndpointWithoutRequest<UnreadCountResponse>
{
    public override void Configure()
    {
        Get("/api/notifications/unread/count");
        Roles("User");
    }
}

// POST /api/notifications/{id}/read
// Mark notification as read
public class MarkAsReadEndpoint : Endpoint<MarkAsReadRequest, EmptyResponse>
{
    public override void Configure()
    {
        Post("/api/notifications/{id}/read");
        Roles("User");
    }
}

// POST /api/notifications/read-all
// Mark all notifications as read
public class MarkAllAsReadEndpoint : EndpointWithoutRequest<EmptyResponse>
{
    public override void Configure()
    {
        Post("/api/notifications/read-all");
        Roles("User");
    }
}

// GET /api/notifications/preferences
// Get user notification preferences
public class GetPreferencesEndpoint : EndpointWithoutRequest<NotificationPreferencesDto>
{
    public override void Configure()
    {
        Get("/api/notifications/preferences");
        Roles("User");
    }
}

// PUT /api/notifications/preferences
// Update user notification preferences
public class UpdatePreferencesEndpoint : Endpoint<UpdatePreferencesRequest, NotificationPreferencesDto>
{
    public override void Configure()
    {
        Put("/api/notifications/preferences");
        Roles("User");
    }
}

// ============================================================
// GLOBAL NOTIFICATION TOGGLE ENDPOINTS
// ============================================================

// POST /api/notifications/preferences/disable
// Disables all notifications for the user
public class DisableNotificationsEndpoint : EndpointWithoutRequest<EmptyResponse>
{
    public override void Configure()
    {
        Post("/api/notifications/preferences/disable");
        Roles("User");
    }
}

// POST /api/notifications/preferences/enable
// Re-enables notifications for the user
public class EnableNotificationsEndpoint : EndpointWithoutRequest<EmptyResponse>
{
    public override void Configure()
    {
        Post("/api/notifications/preferences/enable");
        Roles("User");
    }
}

// ============================================================
// NOTE: NO WEB PUSH ENDPOINTS NEEDED
// ============================================================
// We do NOT need these endpoints because we're not using Web Push:
// - GET /api/notifications/push/vapid-public-key (no VAPID)
// - POST /api/notifications/push/subscribe (no external subscriptions)
// - DELETE /api/notifications/push/unsubscribe
// - GET /api/notifications/push/subscriptions
//
// All notifications are delivered via SignalR. The Service Worker
// is used only for DISPLAYING OS notifications, not receiving them.
```

### Message Queue Event Schema

```csharp
// File: NuGetPackages/Notifications.Contracts/NotificationEvent.cs

/// <summary>
/// Event published by services to trigger notifications.
/// Other services reference this package to publish events.
/// </summary>
public record NotificationEvent
{
    /// <summary>Target tenant ID</summary>
    public required Guid TenantId { get; init; }

    /// <summary>Target user ID (null for broadcast to all tenant users)</summary>
    public Guid? UserId { get; init; }

    /// <summary>Notification type for categorization</summary>
    public required string Type { get; init; }

    /// <summary>Notification title (localization key or literal)</summary>
    public required string Title { get; init; }

    /// <summary>Optional notification body</summary>
    public string? Body { get; init; }

    /// <summary>Additional data as dictionary</summary>
    public Dictionary<string, object>? Data { get; init; }

    /// <summary>Priority level (0=Low, 1=Normal, 2=High, 3=Urgent)</summary>
    public int Priority { get; init; } = 1;

    /// <summary>If true, send to all tenant users regardless of UserId</summary>
    public bool IsBroadcast { get; init; }

    /// <summary>When to send (null = immediately)</summary>
    public DateTimeOffset? ScheduledFor { get; init; }

    /// <summary>When notification expires (null = never)</summary>
    public DateTimeOffset? ExpiresAt { get; init; }
}

// Usage in QuestionerService:
public class SubmitAnswerHandler : IRequestHandler<SubmitAnswerCommand, Result<Guid>>
{
    private readonly IEventPublisher _eventPublisher;

    public async Task<Result<Guid>> Handle(SubmitAnswerCommand request, CancellationToken ct)
    {
        // ... save answer ...

        // Publish notification event
        await _eventPublisher.PublishAsync(new NotificationEvent
        {
            TenantId = _tenantService.TenantId!.Value,
            UserId = template.OwnerId, // Notify template owner
            Type = "questionnaire_submitted",
            Title = "notifications.questionnaire.submitted.title",
            Body = "notifications.questionnaire.submitted.body",
            Data = new Dictionary<string, object>
            {
                ["templateId"] = template.ExternalId,
                ["templateName"] = template.Name,
                ["respondentName"] = request.RespondentName,
            },
            Priority = 1,
        }, ct);

        return Result.Success(answer.ExternalId);
    }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Basic SignalR infrastructure with single-instance support

#### Backend Tasks

- [ ] **Create NotificationService project structure**
  - Clean Architecture layers
  - FastEndpoints configuration
  - Basic health checks

- [ ] **Implement SignalR Hub**
  - Authentication integration
  - Basic connection handling
  - Group management (tenant/user)

- [ ] **Create database schema**
  - Notifications table
  - Preferences table
  - EF Core migrations

- [ ] **Implement REST endpoints**
  - GET /api/notifications
  - GET /api/notifications/unread/count
  - POST /api/notifications/{id}/read

#### Frontend Tasks

- [ ] **Add SignalR client package**
  - @microsoft/signalr

- [ ] **Create notification client**
  - Connection management
  - Event handlers
  - Error handling

- [ ] **Create Redux notification slice**
  - Notification state
  - Actions for add/read/clear

- [ ] **Create notification components**
  - NotificationBell (header icon)
  - NotificationList (dropdown)
  - NotificationItem

#### Testing Tasks

- [ ] **Backend unit tests**
  - Hub connection tests
  - Notification handlers

- [ ] **Frontend unit tests**
  - Redux slice tests
  - Client connection tests

### Phase 2: Scalability (Week 3)

**Goal**: Multi-instance support with Redis backplane

#### Backend Tasks

- [ ] **Add Redis backplane**
  - SignalR Redis configuration
  - Connection state in Redis

- [ ] **Implement connection manager**
  - Track connections per user
  - Handle reconnections

- [ ] **Add rate limiting**
  - Per-tenant connection limits
  - Message throttling

#### Infrastructure Tasks

- [ ] **Configure load balancer**
  - Sticky sessions
  - WebSocket upgrades

- [ ] **Docker compose updates**
  - Redis service
  - Multiple notification instances

#### Testing Tasks

- [ ] **Integration tests**
  - Multi-instance message delivery
  - Failover scenarios

### Phase 3: Service Integration (Week 4)

**Goal**: Connect other services to send notifications

#### Backend Tasks

- [ ] **Create NuGet package for contracts**
  - NotificationEvent record
  - IEventPublisher interface

- [ ] **Implement message queue consumer**
  - RabbitMQ/Redis subscriber
  - Event processing

- [ ] **Integrate QuestionerService**
  - Questionnaire submission notifications
  - Template update notifications

- [ ] **Integrate OnlineMenuService**
  - Menu update notifications

- [ ] **Integrate IdentityService**
  - User invite notifications
  - Password change notifications

#### Testing Tasks

- [ ] **E2E tests**
  - Questionnaire submission flow
  - Notification receipt verification

### Phase 4: Offline & Preferences (Week 5)

**Goal**: Offline message queuing and user preferences

#### Backend Tasks

- [ ] **Implement offline delivery**
  - Queue messages for offline users
  - Deliver on reconnection
  - Retry logic

- [ ] **Implement preferences**
  - Preferences endpoints
  - Channel filtering
  - Quiet hours

#### Frontend Tasks

- [ ] **Preferences UI**
  - Notification settings screen
  - Channel toggles
  - Quiet hours configuration

- [ ] **Cache invalidation**
  - React Query invalidation on events

#### Testing Tasks

- [ ] **Offline delivery tests**
- [ ] **Preferences tests**

### Phase 5: Polish & Documentation (Week 6)

**Goal**: Production readiness

#### Tasks

- [ ] **Performance testing**
  - Load testing with k6
  - Connection limits validation

- [ ] **Monitoring setup**
  - Metrics (Prometheus)
  - Logging (ELK/Loki)
  - Alerting rules

- [ ] **Documentation**
  - API documentation
  - Integration guide
  - Runbook

- [ ] **Security audit**
  - Penetration testing
  - Code review

### Phase 6: Global Notification Toggle (Week 7 - 3 days)

**Goal**: Allow users to completely disable/enable all notifications

#### Backend Tasks (backend-dev)

- [ ] **Database migration for notification preferences**
  - Add `notifications_enabled` column to `notification_preferences`
  - Add `delivery_skipped_reason` column to `notifications`
  - Create migration script and update EF model

- [ ] **Implement disable/enable endpoints**
  - POST /api/notifications/preferences/disable
  - POST /api/notifications/preferences/enable
  - Update GET /api/notifications/preferences to include new field

- [ ] **Modify notification delivery pipeline**
  - Check `notifications_enabled` flag before delivery
  - Set `delivery_skipped_reason` when skipping
  - Add logging for skipped deliveries

- [ ] **Update UserPreferencesService**
  - Add methods for enable/disable
  - Update preference DTO with new fields

#### Frontend Tasks (frontend-dev)

- [ ] **Add global toggle to preferences screen**
  - Add switch component with proper accessibility
  - Add warning banner when disabled
  - Wire up API calls

- [ ] **Update Redux/state slice**
  - Add `notificationsEnabled` to state
  - Add actions for toggle

- [ ] **Add translations**
  - en.json, el.json entries for new UI strings

#### Testing Tasks (regression-tester)

- [ ] **Backend unit tests**
  - Test delivery skipping when disabled
  - Test enable/disable endpoints

- [ ] **Frontend unit tests**
  - Test toggle behavior
  - Test warning banner visibility

- [ ] **E2E tests**
  - Test disabling notifications prevents delivery
  - Test re-enabling restores delivery

### Phase 7: Service Worker for OS Notifications (Week 7-8 - 3 days)

**Goal**: Display OS-level notifications using Service Workers (SignalR delivers the message, Service Worker displays it)

> **IMPORTANT**: This is NOT Web Push. We are NOT using external push services (Google/Mozilla/Microsoft).
> The Service Worker is used ONLY for displaying notifications in the OS notification center.
> All messages still come through SignalR (requires tab to be open).

#### Backend Tasks (backend-dev)

- [ ] **Add display preference to notification preferences**
  - Add `display_preference` column (enum: 'in_app', 'os_notification', 'both')
  - Migration script
  - Update preference DTO

- [ ] **Update SignalR notification payload**
  - Include `displayAs` field based on user preference
  - Include notification metadata for OS display (icon, badge, etc.)

#### Frontend Tasks (frontend-dev)

- [ ] **Create service worker file (sw.js)**
  - Handle `showNotification` message from main app
  - Handle notification click (focus app, navigate to notification)
  - Handle notification close
  - NO push event handler (we don't use Web Push)

- [ ] **Create OSNotificationService**
  - Request notification permission from browser
  - Check permission state
  - Send notification to Service Worker for display
  - NO VAPID keys, NO push subscriptions (we don't use Web Push)

- [ ] **Create ServiceWorkerRegistration utility**
  - Registration logic on app startup
  - Message passing to Service Worker
  - Handle Service Worker updates

- [ ] **Create NotificationPermissionPrompt component**
  - Modal explaining OS notifications
  - Request permission button
  - Handle permission denied state
  - Accessibility compliance

- [ ] **Update NotificationClient (SignalR)**
  - Check `displayAs` field in received notifications
  - Route to in-app toast OR OS notification based on preference
  - Call OSNotificationService for OS notifications

- [ ] **Update NotificationPreferencesScreen**
  - Add display preference selector per notification type
  - Options: In-App Toast / OS Notification / Both / None
  - Show permission status for OS notifications

- [ ] **Add PWA manifest updates**
  - Add notification icons (192x192, 72x72 badge)
  - Update manifest.json if needed

#### Testing Tasks (regression-tester)

- [ ] **Frontend unit tests**
  - OSNotificationService permission handling
  - Display routing logic (in-app vs OS)
  - Service Worker message passing

- [ ] **E2E tests**
  - Notification permission flow
  - OS notification display (when tab unfocused but open)
  - Notification click brings user back to app
  - Preference changes reflect correctly

---

## Testing Strategy

### Unit Tests

```typescript
// Frontend: BaseClient/src/lib/signalr/__tests__/notificationClient.test.ts

describe('NotificationClient', () => {
  it('should connect with valid token', async () => {
    const client = new NotificationClient();
    await client.connect('valid-jwt-token');
    expect(client.isConnected).toBe(true);
  });

  it('should dispatch notification to store', () => {
    const notification = createMockNotification();
    // Simulate receiving notification
    // Assert store.dispatch was called
  });

  it('should handle reconnection', async () => {
    // Simulate disconnect
    // Assert automatic reconnect
  });
});
```

```csharp
// Backend: NotificationService.UnitTests/Hubs/NotificationHubTests.cs

public class NotificationHubTests
{
    [Fact]
    public async Task OnConnectedAsync_AddsUserToCorrectGroups()
    {
        // Arrange
        var hub = CreateHub(tenantId: Guid.NewGuid(), userId: Guid.NewGuid());

        // Act
        await hub.OnConnectedAsync();

        // Assert
        _mockGroups.Verify(g => g.AddToGroupAsync(
            It.IsAny<string>(),
            It.Is<string>(s => s.StartsWith("tenant:")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task OnConnectedAsync_SendsPendingNotifications()
    {
        // Arrange
        var pending = new List<NotificationDto> { /* ... */ };
        _mockMediator.Setup(m => m.Send(It.IsAny<GetPendingNotificationsQuery>(), default))
            .ReturnsAsync(pending);

        // Act
        await hub.OnConnectedAsync();

        // Assert
        _mockClients.Verify(c => c.Caller.SendAsync(
            "ReceivePendingNotifications",
            It.IsAny<IEnumerable<NotificationDto>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

### E2E Tests

```typescript
// E2ETests/tests/notifications/notification-flow.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { QuestionnairePublicPage } from '../../pages/QuestionnairePublicPage';

test.describe('Notification Flow', () => {
  test('should receive notification when questionnaire is submitted', async ({ page, context }) => {
    // Setup: Login as template owner
    const ownerPage = page;
    const loginPage = new LoginPage(ownerPage);
    await loginPage.login('owner@tenant.com', 'password');

    const dashboard = new DashboardPage(ownerPage);
    await dashboard.waitForNotificationConnection();

    // Get initial notification count
    const initialCount = await dashboard.getUnreadNotificationCount();

    // Action: Submit questionnaire from another browser context
    const respondentPage = await context.newPage();
    const publicPage = new QuestionnairePublicPage(respondentPage);
    await publicPage.navigateToQuestionnaire('template-id');
    await publicPage.fillAndSubmit({ name: 'Test User', email: 'test@example.com' });

    // Assert: Owner receives notification
    await expect(async () => {
      const newCount = await dashboard.getUnreadNotificationCount();
      expect(newCount).toBe(initialCount + 1);
    }).toPass({ timeout: 10000 });

    // Verify notification content
    await dashboard.openNotificationPanel();
    await expect(dashboard.getLatestNotification()).toContainText('New questionnaire response');
  });
});
```

---

## Monitoring & Observability

### Metrics (Prometheus)

```csharp
// File: NotificationService.Web/Metrics/NotificationMetrics.cs

public static class NotificationMetrics
{
    public static readonly Counter NotificationsSent = Metrics.CreateCounter(
        "notifications_sent_total",
        "Total notifications sent",
        new CounterConfiguration
        {
            LabelNames = new[] { "type", "priority", "tenant_id" }
        });

    public static readonly Gauge ActiveConnections = Metrics.CreateGauge(
        "signalr_connections_active",
        "Number of active SignalR connections",
        new GaugeConfiguration
        {
            LabelNames = new[] { "tenant_id" }
        });

    public static readonly Histogram MessageDeliveryTime = Metrics.CreateHistogram(
        "notification_delivery_seconds",
        "Time to deliver notification",
        new HistogramConfiguration
        {
            LabelNames = new[] { "type" },
            Buckets = new[] { 0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5 }
        });

    public static readonly Counter DeliveryFailures = Metrics.CreateCounter(
        "notification_delivery_failures_total",
        "Total notification delivery failures",
        new CounterConfiguration
        {
            LabelNames = new[] { "type", "reason" }
        });
}
```

### Logging

```csharp
// Structured logging example
_logger.LogInformation(
    "Notification sent. Type: {NotificationType}, Tenant: {TenantId}, User: {UserId}, DeliveryTime: {DeliveryMs}ms",
    notification.Type,
    notification.TenantId,
    notification.UserId,
    deliveryTime.TotalMilliseconds);
```

### Health Checks

```csharp
// File: NotificationService.Web/Program.cs

builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "database")
    .AddRedis(redisConnectionString, name: "redis")
    .AddRabbitMQ(rabbitConnectionString, name: "rabbitmq")
    .AddCheck<SignalRHealthCheck>("signalr");
```

### Alerting Rules

```yaml
# prometheus/alerts/notification-service.yml
groups:
  - name: notification-service
    rules:
      - alert: HighConnectionCount
        expr: sum(signalr_connections_active) > 50000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High number of SignalR connections

      - alert: NotificationDeliveryFailures
        expr: rate(notification_delivery_failures_total[5m]) > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: High rate of notification delivery failures

      - alert: SlowNotificationDelivery
        expr: histogram_quantile(0.95, rate(notification_delivery_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 95th percentile notification delivery time > 2s
```

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Message Latency | < 500ms (p95) | Prometheus histogram |
| Connection Success Rate | > 99.5% | Error rate tracking |
| Reconnection Success | > 99% within 30s | Connection metrics |
| Offline Message Delivery | 100% within 1 hour | Queue monitoring |
| Multi-instance Scaling | Linear to 10 instances | Load testing |
| **Disable Toggle Response** | < 200ms | API latency |
| **Service Worker Registration** | > 99% success | Registration success rate |
| **OS Notification Display** | > 99% (when permission granted) | Display success tracking |
| **Notification Permission Rate** | Track user acceptance | Analytics |

---

## Final Recommendation

> **✅ DECISIONS MADE**: Architecture decisions have been finalized.

### Summary of Decisions Made

| Decision | Options | **CHOSEN** |
|----------|---------|-------------|
| **1. Scaling Approach** | A: Skip Negotiation + Redis (no sticky)<br>B: IP Hash Sticky Sessions<br>C: Cookie Sticky Sessions<br>E: Single Instance (MVP) | **✅ Option A** |
| **2. SignalR Backplane** | Redis / SQL Server / MassTransit+RabbitMQ / NCache / Orleans | **✅ Redis** |
| **3. Service-to-Service Messaging** | Redis Pub/Sub / RabbitMQ / Azure Service Bus | **✅ RabbitMQ** |
| **4. ASP.NET Core Version** | .NET 8+ (with Stateful Reconnect) / .NET 7 | **✅ .NET 8+** |
| **5. Fallback Transports** | WebSocket-only / Include SSE+LongPolling | **✅ WebSocket-only** |
| **6. External Push Services** | Google FCM / Mozilla / Microsoft / None | **✅ None (SignalR only)** |

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINAL ARCHITECTURE DECISIONS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ✅ RabbitMQ ──► Service-to-Service Communication (durable, reliable)      │
│   ✅ Redis ────► SignalR Backplane (fast, low latency)                      │
│   ✅ SignalR ──► Client Message Delivery (real-time WebSocket)              │
│   ✅ Service Worker ──► OS Notification Display Only (no external push)     │
│                                                                             │
│   ❌ NO external push services (Google FCM, Mozilla, Microsoft)             │
│   ❌ NO Web Push API / VAPID keys                                           │
│                                                                             │
│   ⚠️  Trade-off: Notifications only work when browser tab is open           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Approved Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPROVED ARCHITECTURE ✅                          │
│                                                                             │
│  Scaling: Option A (Skip Negotiation + Redis Backplane, no sticky sessions) │
│  SignalR Backplane: Redis                                                   │
│  Service Messaging: RabbitMQ                                                │
│  Features: .NET 8 Stateful Reconnect enabled                                │
│  Transport: WebSocket-only                                                  │
│  Push Notifications: SignalR + Service Worker (no external services)        │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
                    │                CLIENTS                       │
                    │  Browser tabs with Service Worker enabled    │
                    └──────────────────────┬──────────────────────┘
                                           │ WebSocket (SignalR)
                                           │
                              ┌────────────▼────────────┐
                              │     Load Balancer       │
                              │     (Round Robin)       │
                              │     No sticky needed    │
                              └────────────┬────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
      ┌───────▼───────┐            ┌───────▼───────┐            ┌───────▼───────┐
      │ Notification  │            │ Notification  │            │ Notification  │
      │ Service #1    │            │ Service #2    │            │ Service #N    │
      │               │            │               │            │               │
      │ • SignalR Hub │            │ • SignalR Hub │            │ • SignalR Hub │
      │ • WS only     │            │ • WS only     │            │ • WS only     │
      │ • Stateful    │            │ • Stateful    │            │ • Stateful    │
      │   Reconnect   │            │   Reconnect   │            │   Reconnect   │
      │ • RabbitMQ    │            │ • RabbitMQ    │            │ • RabbitMQ    │
      │   Consumer    │            │   Consumer    │            │   Consumer    │
      └───────┬───────┘            └───────┬───────┘            └───────┬───────┘
              │                            │                            │
              │    ┌───────────────────────┼───────────────────────┐    │
              │    │                       │                       │    │
              │    │  ┌────────────────────▼────────────────────┐  │    │
              │    │  │         Redis (SignalR Backplane)       │  │    │
              │    │  │   • Fast Pub/Sub for client delivery    │  │    │
              │    │  │   • Low latency (<1ms)                  │  │    │
              │    │  │   • Hub-to-hub message broadcast        │  │    │
              │    │  └─────────────────────────────────────────┘  │    │
              │    │                                               │    │
              └────┼───────────────────────────────────────────────┼────┘
                   │                                               │
                   │  ┌─────────────────────────────────────────┐  │
                   │  │      RabbitMQ (Service-to-Service)      │  │
                   │  │   • Durable message queues              │  │
                   │  │   • Event publishing from services      │  │
                   │  │   • Notification Service subscribes     │  │
                   │  └──────────────────┬──────────────────────┘  │
                   │                     │                         │
                   └─────────────────────┼─────────────────────────┘
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       │                                 │                                 │
┌──────▼──────┐                  ┌───────▼───────┐                 ┌───────▼───────┐
│  Identity   │                  │  Questioner   │                 │  OnlineMenu   │
│  Service    │                  │  Service      │                 │  Service      │
│             │                  │               │                 │               │
│ Publishes:  │                  │ Publishes:    │                 │ Publishes:    │
│ • UserInvite│                  │ • Submitted   │                 │ • MenuUpdated │
│ • PwdChange │                  │ • TplUpdated  │                 │ • ItemAdded   │
│             │                  │               │                 │               │
│ (via        │                  │ (via          │                 │ (via          │
│  RabbitMQ)  │                  │  RabbitMQ)    │                 │  RabbitMQ)    │
└─────────────┘                  └───────────────┘                 └───────────────┘
```

---

### Configuration Summary

**Backend (Program.cs):**
```csharp
// 1. Add SignalR with Redis backplane
builder.Services.AddSignalR(options => {
    options.StatefulReconnectBufferSize = 100_000; // 100KB buffer
})
.AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis"), options => {
    options.Configuration.ChannelPrefix = RedisChannel.Literal("NotificationHub");
});

// 2. Map hub with stateful reconnect and WebSocket-only
app.MapHub<NotificationHub>("/notificationhub", options => {
    options.AllowStatefulReconnects = true;
    options.Transports = HttpTransportType.WebSockets;
});
```

**Frontend (notificationClient.ts):**
```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/notificationhub`, {
        accessTokenFactory: () => accessToken,
        skipNegotiation: true,                           // No negotiate step
        transport: signalR.HttpTransportType.WebSockets, // WebSocket only
    })
    .withStatefulReconnect({ bufferSize: 100000 })      // .NET 8 feature
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();
```

**Load Balancer (nginx):**
```nginx
upstream notification_backend {
    # Round-robin - NO sticky sessions needed
    server notification-service-1:5000;
    server notification-service-2:5000;
    server notification-service-3:5000;
}

server {
    location /notificationhub {
        proxy_pass http://notification_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

---

### Trade-offs Accepted (If This Architecture Approved)

| Trade-off | Accepted Risk | Mitigation |
|-----------|---------------|------------|
| No fallback to SSE/Long Polling | ~1-2% users on very old browsers/corporate proxies | 98%+ browser support; critical users can refresh |
| Redis single point of failure | Messages lost during Redis downtime | Redis Sentinel/Cluster for HA |
| Token in query string | Visible in logs | Use short-lived tokens; log scrubbing |
| 100KB buffer per connection | Memory usage at scale | Monitor; tune buffer size |
| **Global disable still stores notifications** | Storage growth | TTL-based cleanup job |
| **Tab must be open for notifications** | Users miss notifications when tab closed | Offline queue; deliver on reconnect |
| **No notifications when browser closed** | Cannot reach user at all | Accepted trade-off for privacy/simplicity |
| **OS notification requires permission** | Users may deny permission | Clear permission prompt; fallback to in-app |

---

### Questions for Decision Makers

1. **Browser Support**: Are you comfortable with WebSocket-only (98%+ support) or do you need SSE/Long Polling fallback for specific users?

2. **Redis Availability**: Do you need Redis Sentinel/Cluster from day one, or is single-instance Redis acceptable for MVP?

3. **Backplane Alternative**: Any preference for MassTransit+RabbitMQ if you're already using RabbitMQ elsewhere?

4. **Azure Future**: Any chance of migrating to Azure? Azure SignalR Service would simplify scaling significantly.

---

## Related Documents

- [Architecture Patterns](../../../code-standards/architecture-patterns.md)
- [Backend C# Standards](../../../code-standards/backend-csharp.md)
- [Frontend React Standards](../../../code-standards/frontend-react.md)
- [Logging Service Plan](./logging-service-implementation.md)
- [Payment Service Plan](./payment-service-implementation.md)

---

## Appendix: Alternative Approaches Considered

### Option 1: Server-Sent Events (SSE)

**Pros:**
- Simpler than WebSockets
- Works through most proxies
- Native browser support

**Cons:**
- Unidirectional (server-to-client only)
- No native reconnection
- Limited browser tab support

**Decision:** Rejected - need bidirectional communication for acknowledgments

### Option 2: Long Polling

**Pros:**
- Works everywhere
- No special infrastructure

**Cons:**
- High latency
- Resource intensive
- Poor scalability

**Decision:** Rejected - does not meet latency requirements

### Option 3: Raw WebSockets

**Pros:**
- Maximum control
- No dependencies

**Cons:**
- Must implement reconnection
- Must implement fallbacks
- Must implement message routing

**Decision:** Rejected - SignalR provides these features out-of-box

---

*Document Version: 1.1*
*Created: 2026-01-27*
*Updated: 2026-01-27*
*Author: Chief Software Architect*

---

## Sources & References

- [Microsoft Learn - SignalR Hosting and Scaling](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)
- [Microsoft Learn - Redis Backplane](https://learn.microsoft.com/en-us/aspnet/core/signalr/redis-backplane)
- [Microsoft Learn - SignalR Configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)
- [Ably - Scaling SignalR](https://ably.com/topic/scaling-signalr)
- [MassTransit SignalR Documentation](https://masstransit.io/documentation/configuration/integrations/signalr)
- [NCache SignalR Scaling](https://www.alachisoft.com/blogs/scaling-real-time-asp-net-core-signalr-apps/)
- [IntelliTect SQL Server Backplane](https://github.com/IntelliTect/IntelliTect.AspNetCore.SignalR.SqlServer)
- [CodeOpinion - SignalR Scaling](https://codeopinion.com/practical-asp-net-core-signalr-scaling/)
- [GitHub Issue - SignalR Sticky Sessions](https://github.com/dotnet/aspnetcore/issues/11678)

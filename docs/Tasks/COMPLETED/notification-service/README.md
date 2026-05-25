# Notification Service - Feature Implementation

> **Status**: READY FOR IMPLEMENTATION
> **Priority**: High
> **Estimated Effort**: 6-8 weeks
> **Architecture Review**: ✅ APPROVED by Chief Architect

---

## Overview

This folder contains all tasks required to implement the real-time WebSocket Notification Service for our multi-tenant SaaS platform.

---

## Architecture Decisions Summary

| # | Decision | **CHOSEN** | Rationale |
|---|----------|------------|-----------|
| 1 | Service-to-Service Messaging | ✅ **RabbitMQ** | Durable queues, at-least-once delivery |
| 2 | SignalR Backplane | ✅ **Redis** | MS-supported, sub-millisecond latency |
| 3 | Database | ✅ **Dedicated PostgreSQL** | Service independence, isolated scaling |
| 4 | Scaling Approach | ✅ **Skip Negotiation** | No sticky sessions needed |
| 5 | .NET Version | ✅ **.NET 8+** | Stateful Reconnect support |
| 6 | Transport Protocol | ✅ **WebSocket-only** | 98%+ browser support |
| 7 | External Push | ✅ **None (SignalR only)** | Privacy, full control |
| 8 | Frontend Package | ✅ **@dloizides/notification-client** | Micro frontend support |

---

## Task Files

| Phase | Task File | Agent | Focus |
|-------|-----------|-------|-------|
| 0 | [phase-0-infrastructure.md](./phase-0-infrastructure.md) | `backend-dev` | RabbitMQ, Redis, PostgreSQL setup |
| 1 | [phase-1-backend-core.md](./phase-1-backend-core.md) | `backend-dev` | Service structure, CQRS, SignalR Hub |
| 2 | [phase-2-nuget-packages.md](./phase-2-nuget-packages.md) | `backend-dev` | Contracts, Messaging.RabbitMq packages |
| 3 | [phase-3-npm-package.md](./phase-3-npm-package.md) | `frontend-dev` | @dloizides/notification-client npm package |
| 4 | [phase-4-integration.md](./phase-4-integration.md) | `frontend-dev` + `backend-dev` | Shell app, micro frontends |
| 5 | [phase-5-user-preferences.md](./phase-5-user-preferences.md) | `frontend-dev` + `backend-dev` | Settings UI, global toggle |
| 6 | [phase-6-service-worker.md](./phase-6-service-worker.md) | `frontend-dev` | OS notifications via Service Worker |
| 7 | [phase-7-e2e-monitoring.md](./phase-7-e2e-monitoring.md) | `regression-tester` | Playwright E2E tests, metrics |

---

## Reference Documents

- **Full Architecture Document**: [architecture.md](./architecture.md) - Complete technical specification
- **Code Standards**: [../../code-standards/README.md](../../code-standards/README.md)
- **Backend Patterns**: [../../code-standards/backend-csharp.md](../../code-standards/backend-csharp.md)
- **Frontend Patterns**: [../../code-standards/frontend-react.md](../../code-standards/frontend-react.md)
- **E2E Test Guide**: [../../code-standards/e2e-playwright.md](../../code-standards/e2e-playwright.md)

---

## Implementation Order

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7
   │           │           │           │           │           │           │           │
   │           │           │           │           │           │           │           │
Infra      Backend     NuGet       NPM        Integ      Prefs      SW/OS      E2E
Setup      Service    Packages   Package    ration     UI         Notif      Tests
```

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 0 | - | 1, 2 |
| 1 | 0 | 2, 4 |
| 2 | 0, 1 | 4, 5 |
| 3 | - | 4 |
| 4 | 1, 2, 3 | 5, 6, 7 |
| 5 | 4 | 7 |
| 6 | 4 | 7 |
| 7 | 4, 5, 6 | - |

**Note**: Phases 0-2 (Backend) can run in parallel with Phase 3 (Frontend NPM Package).

---

## New Components Created

### Backend (C#)

```
NotificationService/
├── Notification/
│   └── src/
│       ├── Notification.AspireHost/
│       ├── Notification.Core/
│       ├── Notification.Infrastructure/
│       ├── Notification.ServiceDefaults/
│       ├── Notification.UseCases/
│       └── Notification.Web/

NuGetPackages/
├── NotificationService.Contracts/    # Event DTOs
└── Messaging.RabbitMq/               # Shared RabbitMQ publisher (REQUIRED)
```

### Frontend (TypeScript)

```
NPMPackages/
└── notifications/                    # @dloizides/notification-client
    └── src/
        ├── core/
        ├── react/
        ├── components/
        └── workers/
```

### Infrastructure

```
docker-compose.e2e.yml additions:
├── rabbitmq          # AMQP 5672, Management 15672
├── redis             # Port 6379
├── notification-db   # PostgreSQL 5436
└── notification-api  # Port 5010
```

---

## Quality Gates (Required for Each Phase)

Each phase must pass these checks before completion:

### Backend Phases (0, 1, 2, 4-backend, 5-backend)
- [ ] `dotnet build` - No errors
- [ ] `dotnet test` - All unit tests pass
- [ ] Code follows [backend-csharp.md](../../code-standards/backend-csharp.md) standards
- [ ] No hardcoded secrets or connection strings

### Frontend Phases (3, 4-frontend, 5-frontend, 6)
- [ ] `npm run lint:fix` - No linting errors
- [ ] `npm run test:coverage` - All unit tests pass
- [ ] `npx expo export --platform web` - Build succeeds
- [ ] Code follows [frontend-react.md](../../code-standards/frontend-react.md) standards

### E2E Phase (7)
- [ ] All Playwright tests pass
- [ ] Tests follow [e2e-playwright.md](../../code-standards/e2e-playwright.md) standards
- [ ] No `waitForTimeout()` calls
- [ ] Proper cleanup in afterEach/afterAll

---

## How to Start

1. **Read the full architecture**: Start with [architecture.md](./architecture.md)
2. **Pick a phase**: Choose based on dependencies (Phase 0 or Phase 3 first)
3. **Assign to agent**: Use the specified agent for each phase
4. **Follow checklist**: Each phase has detailed step-by-step tasks
5. **Pass quality gates**: Run all checks before marking complete

### Agent Commands

```bash
# Start Phase 0 (Infrastructure)
claude --agent backend-dev "Complete Phase 0 from notification-service tasks"

# Start Phase 1 (Backend Core)
claude --agent backend-dev "Complete Phase 1 from notification-service tasks"

# Start Phase 3 (NPM Package) - Can run parallel with 0-2
claude --agent frontend-dev "Complete Phase 3 from notification-service tasks"

# Start Phase 7 (E2E Tests)
claude --agent regression-tester "Complete Phase 7 from notification-service tasks"
```

---

## Contact

For questions or clarifications, consult the chief-architect agent:

```bash
claude --agent chief-architect "Review notification service architecture"
```

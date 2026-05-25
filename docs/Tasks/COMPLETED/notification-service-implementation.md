# Task: Notification Service Full Implementation

> **Status**: IN_PROGRESS
> **Started**: 2026-03-06
> **Priority**: High
> **Agents**: backend-dev, frontend-dev, regression-tester (parallel)

---

## Objective

Implement all remaining notification service tasks (Phases 3, 5, 6, 7) plus comprehensive unit tests, stress tests, and E2E tests.

---

## Work Streams (Parallel)

### 1. Backend (backend-dev)
- [x] Read all existing source files
- [ ] Expand unit tests for all handlers (comprehensive coverage)
- [ ] Add stress test endpoints (#if DEBUG - trigger, bulk, clear, health)
- [ ] Implement DeleteNotificationHandler if missing
- [ ] Run dotnet build + dotnet test

### 2. NPM Package - Phase 3 (frontend-dev)
- [ ] Create NPMPackages/notifications/ package structure
- [ ] Implement core module (NotificationClient, NotificationStore, types, constants)
- [ ] Implement React module (Provider, hooks)
- [ ] Implement UI components (Bell, List, Item, Toast)
- [ ] Implement workers module (OSNotificationService, SW code)
- [ ] Write comprehensive unit tests (including stress tests for store)
- [ ] npm install + npm test

### 3. E2E Tests - Phase 7 (regression-tester)
- [ ] Create notification page object
- [ ] Create test helpers (trigger, bulk, clear, health)
- [ ] Enhance existing 4 test files
- [ ] Create realtime.spec.ts (6+ tests)
- [ ] Create connection.spec.ts (4+ tests)
- [ ] Create cross-tab.spec.ts (2+ tests)
- [ ] Create health.spec.ts (3+ tests)
- [ ] Create stress.spec.ts (8+ tests)
- [ ] Update Playwright config

---

## Architecture Decisions (from approved architecture.md)

| Decision | Choice |
|----------|--------|
| Service-to-Service Messaging | RabbitMQ |
| SignalR Backplane | Redis |
| Database | Dedicated PostgreSQL |
| Scaling | Skip Negotiation + Redis |
| .NET Version | .NET 8+ |
| Transport | WebSocket-only |
| External Push | None (SignalR only) |
| Frontend Package | @dloizides/notification-client |

---

## Quality Gates

### Backend
- [ ] dotnet build - No errors
- [ ] dotnet test - All tests pass
- [ ] Code follows backend-csharp.md standards

### Frontend (NPM Package)
- [ ] npm run test - All tests pass
- [ ] TypeScript compiles without errors
- [ ] Code follows frontend-react.md standards

### E2E
- [ ] All Playwright tests pass
- [ ] No waitForTimeout() calls
- [ ] Proper cleanup in afterEach/afterAll

---

## Files Changed

*To be updated as agents complete*

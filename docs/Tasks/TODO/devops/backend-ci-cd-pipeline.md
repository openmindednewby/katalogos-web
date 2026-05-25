# Backend CI/CD Pipeline

> **Status**: TODO
> **Priority**: P0 - Critical (Deployment Blocker)
> **Estimated Scope**: Medium (DevOps)
> **Estimated Effort**: 1-2 weeks

---

## 1. Problem

CI/CD only covers SyncfusionThemeStudio. The 5 core backend services and BaseClient frontend have no automated build, test, or deployment pipeline. Deployments are manual Docker builds with no validation gate.

---

## 2. Current State

- `.github/workflows/ci.yml` — SyncfusionThemeStudio only (lint, typecheck, tests, Docker build)
- `.github/workflows/docker-publish.yml` — SyncfusionThemeStudio image publishing only
- `.github/workflows/e2e.yml` — SyncfusionThemeStudio E2E only
- **No workflows** for IdentityService, OnlineMenuSaaS, QuestionerService, ContentService, NotificationService, or BaseClient

---

## 3. Required Workflows

### 3.1 `backend-ci.yml` — On every PR and push to main

Per service (matrix strategy):
1. **Restore** — `dotnet restore`
2. **Build** — `dotnet build --no-restore`
3. **Unit Tests** — `dotnet test` with coverage report
4. **Code Format** — `dotnet format --verify-no-changes`
5. **Docker Build** — Build image (don't push)
6. **Security Scan** — `dotnet list package --vulnerable` (NuGet audit)

Matrix:
```yaml
strategy:
  matrix:
    service:
      - IdentityService/src/IdentityService.API
      - OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web
      - QuestionerService/Questioner/src/Questioner.Web
      - ContentService/Content/src/Content.Web
      - NotificationService/Notification/src/Notification.Web
```

### 3.2 `backend-publish.yml` — On tag push (v*)

1. Build Docker images for all services
2. Push to container registry (ghcr.io)
3. Tag with version + latest

### 3.3 `frontend-ci.yml` — On every PR and push to main

1. `npm ci` (clean install)
2. `npm run lint` (ESLint)
3. `npm run test:coverage` (Jest)
4. `npx expo export --platform web` (production build)
5. Bundle size check (size-limit)
6. Lighthouse CI audit

### 3.4 `e2e-full.yml` — On push to main or manual trigger

1. Start all services via docker-compose
2. Wait for health checks
3. Run full Playwright suite
4. Upload test reports as artifacts

---

## 4. Implementation Steps

1. Create `backend-ci.yml` with matrix strategy for all 5 services
2. Create `backend-publish.yml` for Docker image publishing
3. Create `frontend-ci.yml` for BaseClient
4. Update `e2e-full.yml` to test all services (not just SyncfusionThemeStudio)
5. Add branch protection rules requiring CI pass before merge
6. Add Dependabot config for all backend services (currently only SyncfusionThemeStudio)
7. Add status badges to README

---

## 5. Verification

- [ ] All 5 backend services build and test in CI
- [ ] Frontend builds and passes lint/tests in CI
- [ ] Docker images published on tag push
- [ ] E2E tests run against full stack
- [ ] Branch protection requires CI pass
- [ ] Dependabot monitors all service dependencies

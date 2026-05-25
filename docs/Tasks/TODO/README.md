# TODO Tasks

Organized by category. 22 tasks remaining (3 moved to COMPLETED, 2 to IN_PROGRESS). Analytics Phase 1 completed. Payment service Phase 1+2+3 complete — billing E2E suite done (37 unique tests × 3 browsers = 116 total, split into `billing-subscription` and `billing-pricing` sub-batches, 2026-03-20). Frontend bug fixed: `useMenuActions.ts` missing `/api/v1/` prefix on activate/deactivate URLs (2026-03-20).

**2026-03-22 E2E Infrastructure Overhaul:**
- Split 7 large E2E runners into 21 smaller runners (~50-60 tests each) for faster parallel execution
- Created `max-tests-per-file` ESLint rule (max 50 tests/file)
- Split 10+ oversized spec files and 7 page objects (all under 300 lines)
- Fixed ~30 E2E test failures (missing DB migration, tooltip overlay, subscription provisioning, Firefox file handling, WebSocket stubs, public menu caching)
- Fixed 3 npm security vulnerabilities (`flatted` in BaseClient, notification-client, utils)
- All 21 E2E runners pass, zero lint warnings
- Tilt `max_parallel_updates=12` enables concurrent execution across independent service domains

## Partially Implemented (3)

Need additional work to complete:

| Task | What Exists | What's Missing |
|------|-------------|----------------|
| [distributed-tracing](partially-implemented/distributed-tracing.md) | OpenTelemetry packages in 4/5 services | Jaeger deployment, Identity service, Grafana datasource |
| [content-storage-distribution-system](partially-implemented/content-storage-distribution-system.md) | SeaweedFS + ContentService | RustFS migration, CDN, Imgproxy, FFmpeg, ClamAV |
| [performance-optimization-plan](partially-implemented/performance-optimization-plan.md) | Lazy styling exports, Lighthouse config | Critical CSS, skeleton screens, font subsetting, TBT reduction |

## Security (3)

| Task | Description |
|------|-------------|
| [secrets-management](security/secrets-management.md) | Extract hardcoded secrets to .env.local / vault |
| [rate-limiting](security/rate-limiting.md) | ASP.NET Core rate limiting middleware for all services |
| [input-validation-pipeline](security/input-validation-pipeline.md) | FluentValidation for all FastEndpoints request types |

## DevOps / CI-CD (4)

| Task | Description |
|------|-------------|
| [backend-ci-cd-pipeline](devops/backend-ci-cd-pipeline.md) | GitHub Actions for all 5 backend services + frontend |
| [production-environment-config](devops/production-environment-config.md) | Staging/Production appsettings, HTTPS, CORS |
| [kubernetes-deployment](devops/kubernetes-deployment.md) | Helm charts, Terraform, K8s manifests |
| [migrate-dev-environment-to-wsl2](devops/migrate-dev-environment-to-wsl2.md) | Move project to WSL2 filesystem |

## Infrastructure (2)

| Task | Description |
|------|-------------|
| [database-backup-strategy](infrastructure/database-backup-strategy.md) | Automated backup for 5 PostgreSQL DBs + SeaweedFS |
| [cdn-configuration](infrastructure/cdn-configuration.md) | Cloudflare CDN for static assets and content |

## Monitoring (2)

| Task | Description |
|------|-------------|
| [alerting-integration](monitoring/alerting-integration.md) | Grafana alerts to Slack/PagerDuty |
| [error-monitoring-sentry](monitoring/error-monitoring-sentry.md) | Sentry for frontend + backend error tracking |

## Backend Services (3)

| Task | Description |
|------|-------------|
| [api-versioning](backend-services/api-versioning.md) | /api/v1/ route prefix for all endpoints |
| [email-service-integration](backend-services/email-service-integration.md) | SendGrid for transactional emails (OTP, password reset) |
| [white-label-service-architecture](backend-services/white-label-service-architecture.md) | Per-tenant theming, custom domains, branding |

## Frontend / UX (2)

| Task | Description |
|------|-------------|
| [user-onboarding-flow](frontend-ux/user-onboarding-flow.md) | Welcome modal, onboarding checklist, feature tooltips |
| [user-profile-account-page](frontend-ux/user-profile-account-page.md) | Profile, security, preferences settings pages |

## Compliance (1)

| Task | Description |
|------|-------------|
| [gdpr-compliance](compliance/gdpr-compliance.md) | Cookie consent, privacy pages, data export, account deletion |

## Analytics (1)

| Task | Description |
|------|-------------|
| [analytics-tracking](analytics/analytics-tracking.md) | Multi-provider analytics (Umami + PostHog). **Phase 1 DONE** (frontend abstraction — see `COMPLETED/analytics-integration-umami-posthog.md`). Remaining: Phase 2 (instrument events), Phase 3 (PostHog client), Phase 4 (backend RabbitMQ), Phase 5 (dashboards + Tilt) |

---

## Recently Completed (moved out)

- **http-interceptor-architecture** → `COMPLETED/` (full interceptor system with error registry, event bus, tests)
- **lazy-preload-route-pages** → `COMPLETED/` (route preloader, ESLint rule, login integration)

## In Progress (moved out)

- **i18n-lint-enforcement** → `IN_PROGRESS/` (plugin active as warn, ~125 warnings to fix)
- **payment-billing-implementation** → `COMPLETED/` (Phase 1+2+3 done. Full E2E suite: 116 tests split into 2 sub-batches. Frontend bug fixed: `useMenuActions.ts` activate/deactivate URLs. Remaining: Stripe test mode verification, SubscriptionBadge in header)
- **public-api-architecture** → `IN_PROGRESS/` (Research & planning phase)
- **white-label-service** → `IN_PROGRESS/` (Architecture & planning phase)
- **webhooks-architecture** → `IN_PROGRESS/` (Architecture & planning phase)
- **api-versioning-implementation** → `IN_PROGRESS/` (Planning phase, required before Public API)

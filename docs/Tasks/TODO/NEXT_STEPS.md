# Suggested Next Steps

Based on the current state of the project (2026-03-22), here are the recommended priorities organized by impact and effort.

---

## Immediate (This Week) — High Impact, Low Effort

### 1. Implement Notification Screen UI
**Why**: 5 E2E connection tests are `test.fixme()` because the notification screen doesn't exist. The bell icon, toast system, and badge all work, but `/notifications` has no route handler.
**Effort**: ~1 day
**Files**: Create `BaseClient/app/(protected)/notifications/index.tsx` with notification list, mark-read, filter by read/unread. Page objects (`NotificationsPage.ts`) and E2E tests already written.

### 2. Fix Public Menu API Caching
**Why**: 6 E2E tests use graceful skips because newly activated menus don't appear on the public viewer immediately. This affects real users too.
**Effort**: ~2 hours
**Options**: Disable server-side caching on `/api/v1/public/menus` in Docker, or add cache invalidation on menu activation.

### 3. Stripe Test Mode Verification
**Why**: Payment Phase 1+2+3 complete but Stripe test mode hasn't been verified end-to-end.
**Effort**: ~2 hours
**Files**: Already in TODO — just needs a test run with Stripe test keys.

---

## Short Term (Next 2 Weeks) — Pre-Launch Blockers

### 4. Backend Test Coverage Push
**Why**: Identity is at 82% but other services are lower. Security-critical services need ≥60%.
**Effort**: ~3-5 days
**Services**: Questioner, OnlineMenu, Content, Notification (5 tasks in TODO/backend-coverage/)

### 5. Distributed Tracing Completion
**Why**: OpenTelemetry is in 4/5 services. Jaeger is running in Docker. Just needs the Identity service instrumented and Grafana datasource configured.
**Effort**: ~1 day
**Status**: Partially implemented (see TODO/partially-implemented/distributed-tracing.md)

### 6. Error Monitoring (Sentry)
**Why**: No production error tracking. When something breaks in prod, you won't know unless a user reports it.
**Effort**: ~2 days
**Files**: TODO/monitoring/error-monitoring-sentry.md

### 7. Alerting Integration
**Why**: Grafana is running with dashboards but no alerts configured. Need Slack/PagerDuty notifications for downtime, high error rates.
**Effort**: ~1 day
**Files**: TODO/monitoring/alerting-integration.md

---

## Medium Term (Next Month) — Production Readiness

### 8. Production Environment Config
**Why**: No staging/production appsettings exist. HTTPS, CORS, production logging need configuration.
**Effort**: ~3 days
**Files**: TODO/devops/production-environment-config.md

### 9. Kubernetes Deployment
**Why**: Currently Docker Compose only. Need Helm charts and manifests for production.
**Effort**: ~5 days
**Files**: TODO/devops/kubernetes-deployment.md

### 10. CDN Configuration
**Why**: Static assets and content (images, PDFs) served directly from SeaweedFS. Need Cloudflare/CDN for performance and DDoS protection.
**Effort**: ~2 days
**Files**: TODO/infrastructure/cdn-configuration.md

### 11. Email Service Integration (SendGrid)
**Why**: Currently using Mailpit (dev-only SMTP trap). Need real email delivery for OTP, password reset, notifications.
**Effort**: ~2 days
**Files**: TODO/backend-services/email-service-integration.md

---

## Longer Term — Feature Development

### 12. User Profile & Account Page
**Why**: Users can't change their password, update profile, or manage their account.
**Effort**: ~3 days
**Files**: TODO/frontend-ux/user-profile-account-page.md

### 13. White-Label Service
**Why**: Per-tenant branding (custom domains, CSS injection) is the premium feature for Enterprise tier.
**Effort**: ~5 days
**Status**: IN_PROGRESS (Architecture phase)
**Files**: TODO/backend-services/white-label-service-architecture.md

### 14. Public API & Webhooks
**Why**: Enables integrations. Customers can build on top of the platform.
**Effort**: ~5 days each
**Status**: Both IN_PROGRESS (Planning phase)
**Depends on**: API versioning implementation

### 15. Performance Optimization
**Why**: Lighthouse shows room for improvement. Critical CSS, skeleton screens, font subsetting.
**Effort**: ~3 days
**Files**: TODO/partially-implemented/performance-optimization-plan.md

---

## Architecture Wins Already in Place

These were completed today or recently and don't need further work:

- **21 E2E runners** split for parallel execution (~50-60 tests each)
- **ESLint `max-tests-per-file`** rule prevents future test file bloat
- **7 page objects** split into focused classes (OnlineMenusPage → 4 classes, etc.)
- **Pro subscription auto-provisioning** for E2E test tenants
- **Zero-warnings lint policy** enforced across entire E2E codebase
- **Security audits** pass (0 high-severity vulnerabilities)
- **Bundle size monitoring** with `.size-limit.json`

---

## Recommended Priority Order

```
Week 1:  #1 (notification screen) + #2 (public menu caching) + #3 (Stripe verify)
Week 2:  #4 (backend coverage) + #5 (distributed tracing) + #6 (Sentry)
Week 3:  #7 (alerting) + #8 (production config) + #11 (SendGrid)
Week 4:  #9 (Kubernetes) + #10 (CDN)
Month 2: #12-#15 (features + API)
```

# Analytics & Usage Tracking

> **Status**: PARTIALLY DONE — Phase 1 complete (frontend abstraction), Phases 2-5 remaining
> **Priority**: P2 - Growth & Product Decisions
> **Estimated Scope**: Medium (Frontend + Backend)
> **Estimated Effort**: ~6-8 days remaining (Phases 2-5)
> **Phase 1 Task Doc**: `COMPLETED/analytics-integration-umami-posthog.md`

---

## 1. Problem

Zero insight into user behavior. Cannot answer:
- How many active users per tenant?
- Which features are used most/least?
- Where do users drop off in flows?
- What's the conversion rate for quiz completions?
- How often do users create/edit menus?

---

## 2. Solution

### 2.1 Architecture Decision: Multi-Provider (Umami + PostHog)

**Chosen approach**: Start with Umami (lightweight, self-hosted, ~256MB) as primary provider. Add PostHog later (full OSS, self-hosted VPS) for session replay, feature flags, and funnels. Multi-provider abstraction makes this a config toggle, not a code change.

| Provider | Role | Status |
|----------|------|--------|
| **Umami** | Lightweight analytics (page views, events, funnels) | Phase 1 DONE (client), Tilt container Phase 5 |
| **PostHog** | Advanced analytics (session replay, feature flags) | Phase 3 TODO |
| **DevClient** | Console + Loki logging in development | Phase 1 DONE |

### 2.2 Phase 1 — COMPLETED (Frontend Abstraction)

Implemented in `src/lib/analytics/`:
- `MultiProviderClient` — fan-out to all configured providers, graceful degradation
- `UmamiClient` — Umami `/api/send` wrapper with sensitive property redaction
- `DevClient` — console logging via LoggingService (always on in dev)
- `NoOpClient` — silent no-op for consent denied / no providers
- `AnalyticsProvider` — React context, consent gating via `useCookieConsent()`, DNT detection
- `useAnalytics` — primary hook (track, identify, page, reset)
- `usePageTracking` — auto page-view on Expo Router pathname change
- `useAnalyticsIdentify` — auto-identify with Keycloak GUID (no PII), reset on logout
- `analyticsEnabled` feature flag + env vars in `featureFlags.ts` / `environment.ts`
- Integrated in `app/_layout.tsx` via `AnalyticsProvider` + `AnalyticsEffects`

---

## 3. Events to Track

### 3.1 Core Business Events

| Event | Properties | Screen |
|-------|-----------|--------|
| `menu_created` | tenantId, menuType | Menus |
| `menu_published` | tenantId, menuId | Menus |
| `menu_viewed_public` | tenantId, menuId, source | Public Menu |
| `quiz_template_created` | tenantId, templateId | Quiz Templates |
| `quiz_completed` | tenantId, templateId, duration | Active Quiz |
| `notification_received` | type, displayPreference | Global |
| `notification_clicked` | type, actionUrl | Notification Toast |
| `user_invited` | tenantId, role | Users |

### 3.2 Engagement Events

| Event | Properties | Screen |
|-------|-----------|--------|
| `page_viewed` | path, referrer | All |
| `feature_used` | featureName | All |
| `search_performed` | query, resultCount | Lists |
| `error_encountered` | errorType, errorCode | All |
| `theme_changed` | mode (light/dark) | Settings |

### 3.3 Subscription Events (After Payment Service)

| Event | Properties |
|-------|-----------|
| `plan_viewed` | planId, planName |
| `subscription_started` | planId, amount |
| `subscription_cancelled` | planId, reason |
| `payment_failed` | planId, errorCode |

---

## 4. Implementation

### 4.1 Analytics Abstraction

```typescript
// src/lib/analytics.ts
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

const analytics = {
  track(event: AnalyticsEvent): void { /* PostHog / provider */ },
  identify(userId: string, traits?: Record<string, unknown>): void { /* ... */ },
  page(name: string): void { /* ... */ },
  reset(): void { /* on logout */ },
};
```

### 4.2 GDPR Integration

- Only initialize analytics after cookie consent is given
- Respect "Do Not Track" browser setting
- `analytics.reset()` on logout
- No PII in event properties (use IDs, not emails/names)

---

## 5. Implementation Steps

### Phase 1 — Frontend Abstraction (DONE)
- [x] Create analytics abstraction layer (`src/lib/analytics/`)
- [x] Implement multi-provider client architecture (MultiProviderClient, UmamiClient, DevClient, NoOpClient)
- [x] Initialize after cookie consent (useCookieConsent gate)
- [x] Add `identify()` call after login with userId + tenantId (useAnalyticsIdentify)
- [x] Add `page()` tracking via Expo Router pathname (usePageTracking)
- [x] Add `reset()` on logout (useAnalyticsIdentify)
- [x] Unit tests for all clients and hooks (7 test suites, all passing)

### Phase 2 — Instrument Core Business Events (TODO)
- [ ] Add `track()` calls in menu creation/publish/view flows
- [ ] Add `track()` calls in quiz template creation, notification clicks
- [ ] Add `track()` calls for search, theme toggle, error boundary
- [ ] Verify events in Umami dashboard with correct properties

### Phase 3 — PostHog Client (TODO, optional)
- [ ] Install `posthog-js`, create `PostHogClient.ts`
- [ ] Wire into `AnalyticsProvider` (activated by `POSTHOG_ENABLED=true`)
- [ ] Test consent flow: grant → events flow; revoke → events stop

### Phase 4 — Backend Analytics via RabbitMQ (TODO)
- [ ] Add `AnalyticsEvent` to Messaging.Contracts NuGet
- [ ] Add `IAnalyticsPublisher` to Messaging.RabbitMq NuGet
- [ ] Add `AnalyticsEventConsumer` to NotificationService
- [ ] Inject publisher in key handlers across services

### Phase 5 — Dashboards + Tilt Polish (TODO)
- [ ] Add Umami container to docker-compose + Tiltfile
- [ ] Configure Umami dashboards (page views, events, funnels)
- [ ] Add `analytics-event-log` Tilt resource (Loki query viewer)

---

## 6. Verification

### Phase 1 (DONE)
- [x] AnalyticsProvider integrated in `_layout.tsx`
- [x] User identified with userId only (no PII) — useAnalyticsIdentify
- [x] Page views tracked automatically — usePageTracking
- [x] Analytics disabled when consent not given — NoOpClient
- [x] DNT header respected — NoOpClient when `navigator.doNotTrack === '1'`
- [x] Analytics reset on logout — useAnalyticsIdentify
- [x] Sensitive properties redacted — UmamiClient sanitization
- [x] Feature flag gate — `analyticsEnabled` in featureFlags
- [x] All quality checks pass (lint, YAGNI, 2578 tests, prod build)

### Remaining Phases
- [ ] Events appear in Umami dashboard (Phase 2 + 5)
- [ ] PostHog enable/disable is a config toggle, no code changes (Phase 3)
- [ ] Backend events flow: Handler → RabbitMQ → Consumer → Umami API (Phase 4)
- [ ] Umami container runs in Tilt (~256MB, dashboard at localhost:3001) (Phase 5)
- [ ] analytics-event-log Tilt resource shows events from Loki (Phase 5)

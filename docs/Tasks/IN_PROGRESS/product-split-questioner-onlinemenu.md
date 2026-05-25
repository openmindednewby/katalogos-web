# Product Split: Questioner & OnlineMenu

## Status: PLANNING
## Date: 2026-05-01
## Owner: Demetris

---

## Problem Statement

`BaseClient/` currently bundles two distinct products (Questioner and OnlineMenu) into a single React Native/Expo app sharing one Keycloak realm, one brand, one landing page, and one URL. We want to ship them as **two fully independent products**:

- Different domains, different brands, different marketing.
- A user of Product A must never see Product B referenced anywhere user-facing (emails, OAuth consent, footers, error pages, billing).
- Independent identity (separate Keycloak realms — hard wall, no shared sessions or user table).
- Independent deploys, independent uptime.

Internal plumbing (NuGet/npm packages, Tilt, CI/CD scaffolding, observability) stays shared and invisible to users.

---

## Target Architecture

### Repo Layout (single monorepo, atomic refactors preserved)

```
SaaS/
├── apps/
│   ├── questioner-web/           # was BaseClient/ (questioner subset)
│   ├── onlinemenu-web/           # was BaseClient/ (online-menu subset)
│   ├── questioner-landing/       # static marketing site
│   └── onlinemenu-landing/       # static marketing site
├── NpmPackages/                  # existing — expanded
│   ├── utils/
│   ├── ui-primitives/            # NEW — shared design-agnostic components
│   ├── auth-client/              # NEW — Keycloak token plumbing
│   └── api-client-base/          # NEW — fetch wrappers, error mapping
├── NuGetPackages/                # existing — unchanged
├── Services/
│   ├── Identity/                 # serves BOTH realms (single Keycloak install)
│   ├── Questioner/               # unchanged
│   ├── OnlineMenu/               # unchanged
│   ├── Notification/             # DECISION NEEDED — fork or partition
│   └── Content/                  # DECISION NEEDED — fork or partition
├── E2ETests/
│   ├── questioner/
│   └── onlinemenu/
└── personalServerNotes/
    └── k8s/
        ├── questioner/           # ingress, deployments, certs
        └── onlinemenu/
```

### Identity (the hard wall)

- **Single Keycloak install, two realms**: `questioner` and `onlinemenu`.
- Each realm has its own user store, own OAuth clients (Google/Apple/etc registered separately per realm), own email templates, own login theme.
- Tokens issued in one realm cannot validate in the other — backend services check the issuer claim and reject cross-realm tokens.
- One person signing up for both products creates two independent accounts; they share no data.

### Domains & Branding

| Surface | Questioner | OnlineMenu |
|---|---|---|
| Marketing | `questioner.com` (TBD) | `onlinemenus.com` (TBD) |
| App | `app.questioner.com` | `app.onlinemenus.com` |
| API | `api.questioner.com` | `api.onlinemenus.com` |
| Email sender | `noreply@questioner.com` | `noreply@onlinemenus.com` |
| Support | `support@questioner.com` | `support@onlinemenus.com` |
| Logo / palette | independent | independent |
| Privacy policy | independent | independent |
| Terms | independent | independent |
| Cookie banner | independent | independent |

### Backend Service Sharing (decision needed)

Two options for `Notification` and `Content`:

- **Option A — Fork per product**: Cleanest user-visible isolation. `notification-questioner` and `notification-onlinemenu` deployments. Doubles ops cost (two SMTP configs, two RabbitMQ queues, two databases, two Daily Report sections).
- **Option B — Shared but partitioned**: One deployment, partitioned by realm/tenant claim. Cheaper. Requires a security audit confirming no cross-realm leakage is possible (logs, error messages, rate-limit counters, batch-processing workers, queue names).

**Recommendation**: Option B for `Content` (file storage is naturally tenant-scoped already). Option A for `Notification` (email is the most visible cross-product leak risk — different sender domain, different SMTP credentials, different unsubscribe flows).

### Shared Packages (the only thing that crosses the line)

- `DomainCore` (NuGet) — `BaseEntity`, `BaseTenantEntity`, EF Core base patterns.
- `Logging.Client` (NuGet) — Loki/Grafana log shipping.
- `Security.Claims` (NuGet) — claim parsing helpers; **must be realm-aware**.
- `Messaging.RabbitMq` (NuGet) — MassTransit conventions.
- `utils` (npm) — pure utilities, zero brand assumptions.
- `ui-primitives` (npm) — **NEW**: themable Button, Input, Modal, etc. No baked-in colors or copy. Each app injects its own theme.
- `auth-client` (npm) — **NEW**: Keycloak PKCE flow, token refresh, takes realm name as config.
- `api-client-base` (npm) — **NEW**: fetch wrappers, error envelope handling, takes API base URL as config.

### CI/CD Pipelines

- `questioner-frontend-ci`, `questioner-backend-ci`, `questioner-e2e`
- `onlinemenu-frontend-ci`, `onlinemenu-backend-ci`, `onlinemenu-e2e`
- `shared-packages-ci` — runs on changes under `NpmPackages/` or `NuGetPackages/`, publishes, then triggers downstream consumer rebuilds.
- Path-filtered: a Questioner-only PR never builds OnlineMenu.

### Observability

- Shared Loki/Grafana/Prometheus stack (internal, never user-facing).
- Dashboards split per product; alerts route to product-specific channels.
- Daily Environment Report stays single email to the operator (you), with Questioner and OnlineMenu sections clearly separated.

---

## Migration Plan (phased, reversible at each step)

### Phase 0 — Decisions (before any code moves)

- [ ] Pick the two product names + domains. Buy domains on GoDaddy.
- [ ] Decide Option A vs B for `Notification` and `Content`.
- [ ] Confirm "single Keycloak, two realms" vs "two Keycloak installs". (Recommend single.)
- [ ] Decide pricing model per product (independent — could be free, freemium, paid, B2B).
- [ ] Draft brand directions (logo, palette, typography) for both products.

### Phase 1 — Shared package extraction (no user-visible change)

- [ ] Extract `ui-primitives` from current `BaseClient/src/components/`. Theme via injection.
- [ ] Extract `auth-client` from current Keycloak integration code.
- [ ] Extract `api-client-base` from current API hooks.
- [ ] Audit `Security.Claims` for realm-awareness; add `expectedRealm` validation.
- [ ] Bump and publish all affected NuGet/npm packages.
- [ ] BaseClient still works exactly as before, just consuming new packages.

### Phase 2 — Identity split (Keycloak realms)

- [x] **2026-05-01** — Update each backend service to validate token issuer against an allowed list of realms (`Authentication:AllowedRealms`). Six services, 24 new files, 54 unit tests, fail-closed semantics. See `COMPLETED/phase2-step2-realm-validation.md`.
- [x] **2026-05-01** — Create `questioner` and `onlinemenu` realms in Keycloak via `scripts/provision-realms.ps1` + Tilt resource `keycloak-provision-realms`. Idempotent, source-realm template snapshot checked in. Legacy `OnlineMenu` realm preserved for now; cutover plan documented. See `COMPLETED/phase2-step1-realm-provisioning.md`.
- [x] **2026-05-01** — Cross-product isolation E2E suite (Phase 2 / Step 5). Regression-guard suite at `E2ETests/tests/cross-product-isolation/` (4 specs, 44 tests). Covers acceptance criterion #1 (API-layer cross-realm rejection). Tilt resource `playwright-e2e-cross-product-isolation`. Token acquisition skips with `PHASE_2_STEP_3_PENDING` reason until the OAuth-client + user-seeding step lands. Acceptance criteria #2–#4 (DOM, email, OAuth consent) deferred to Phases 3 / 5. See `COMPLETED/phase2-step5-cross-product-isolation-suite.md`.
- [ ] Migrate OAuth clients into new realms (Phase-2/Step-3). `online-menu-api`, `online-menu-client`, `online-menu-swagger` clients live only in the legacy realm; two paths in the step-1 task report (kc.sh export/import in-pod, or per-resource Admin API calls).
- [ ] Migrate users: read-only export from current realm, classify by usage (questioner-active vs onlinemenu-active vs both vs inactive). Both-product users get duplicated into both realms (they'll need to set passwords separately on first login of each). NOTE: locked decision is "Option C - clean slate", so this step likely no-ops in dev.
- [ ] Register OAuth identity providers (Google/Apple) per realm — can't be scripted; manual in Google Cloud Console / Apple Developer portal.
- [ ] Configure email templates per realm with product-specific branding.
- [ ] Identity service rewires its login flow to issue tokens against the new realm names (currently still issues `OnlineMenu`-realm tokens; the new realms exist but are not yet the issuance target).
- [ ] After cutover: drop `OnlineMenu` from each service's `Authentication:AllowedRealms` (dev `appsettings.Development.json` currently keeps all three for backward compatibility).
- [ ] Decommission legacy `OnlineMenu` realm.
- [ ] Communicate the migration to existing users (one email per realm they belong to). N/A under clean-slate decision.

### Phase 3 — Repo split

- [ ] Create `apps/questioner-web/` by copying `BaseClient/` and stripping online-menu features.
- [ ] Create `apps/onlinemenu-web/` by copying `BaseClient/` and stripping questioner features.
- [ ] Each app gets its own theme, brand assets, copy, i18n keys.
- [ ] Each app points to its product-specific API base URL and Keycloak realm.
- [ ] Old `BaseClient/` becomes deprecated, kept temporarily for rollback.
- [ ] Update `Tiltfile` to add resources for both apps in parallel.
- [ ] Update E2E test suites to point at the new app URLs.

### Phase 4 — Landing pages

- [ ] Build `apps/questioner-landing/` (static, distinctive design via `/frontend-design`).
- [ ] Build `apps/onlinemenu-landing/` (static, distinctive design — different art direction).
- [ ] Privacy policies, terms, cookie banners per product.
- [ ] Analytics property per product (no shared GA/Plausible across products).

### Phase 5 — Infrastructure (K3s on Hetzner)

- [ ] Buy the two domains. Add wildcard DNS or per-subdomain records.
- [ ] Issue TLS certs per domain (cert-manager + Let's Encrypt).
- [ ] Create K3s ingresses per product: marketing site, app, API.
- [ ] Configure Maddy mail server with two sender domains (DKIM, SPF, DMARC per domain).
- [ ] Deploy each product end-to-end on staging laptop first; smoke-test cross-product isolation (sign in to A, confirm zero references to B anywhere).

### Phase 6 — Cutover

- [ ] DNS cutover: old SaaS domain redirects to a chooser page or sunsets cleanly.
- [ ] Decommission old shared `BaseClient/` deployment.
- [ ] Update `personalServerNotes/credential-inventory.yml` with new per-product credentials.
- [ ] Update Daily Environment Report collectors to report per-product.

### Phase 7 — Cleanup

- [ ] Delete deprecated `BaseClient/` from repo.
- [ ] Delete legacy Keycloak realm (after grace period for any stragglers).
- [ ] Archive old K8s manifests.

---

## Cross-product Isolation Acceptance Criteria

A customer of Product A signing in, navigating, receiving emails, and hitting error states must never see:

- The other product's name, logo, brand color, or URL.
- An OAuth consent screen referencing the other product.
- A footer link, support email, or legal page from the other product.
- An error message that references the other product (e.g. "user not found in `onlinemenu` realm" must read as a plain "invalid credentials").
- A 404 or 500 page styled with the other product's brand.

This is verified by:
- E2E test per product that asserts no other-product strings appear in DOM, network responses, or page metadata.
- Manual penetration check: take a Product A token and call Product B's API — must 401.
- Email audit: send a password reset, signup confirmation, billing email from each product; verify sender domain, footer, links.

---

## Decisions Locked

- **Persona overlap**: NONE — genuinely different buyers. Split is justified.
- **Pricing model (both products, identical 4-tier)**:
  1. Trial period
  2. Free with ads
  3. Paid (no ads)
  4. Paid full-featured
  → Implies shared `billing-client` npm package + shared `Billing` backend service (partitioned by realm) + shared `ads-client` package with `hasPremium` entitlement gate (same pattern already used in Keyboard Piano).
- **Parent brand presence**: Option A (zero EisaiPollis branding in either product) **PLUS** a portfolio-wide discreet attribution footer.

### Discreet Attribution Footer (PORTFOLIO-WIDE DECISION)

Applies not just to Questioner + OnlineMenu but to **every product Demetris ships** (Keyboard Piano [except COPPA contexts], Morphe, Beyond the Void, Hacker Screen, Deep House Vibes, all future projects).

**Wording**: `built by dloizides.com` (links to portfolio).

**Treatment**:
- 60–70% opacity, ~10–11px, footer-only, never sticky/floating.
- Renders in the natural page footer of every web page.

**Where it appears**:
- ✅ All web app pages (Questioner, OnlineMenu, etc.)
- ✅ All landing pages
- ✅ Legal pages (Privacy, Terms)
- ✅ Error pages (404, 500, maintenance)
- ✅ Swagger UI / OpenAPI docs (every backend service)
- ✅ HTTP response header on all backend services: `X-Built-By: dloizides.com`
- ✅ OpenAPI `info.contact` field on every service spec
- ✅ Container metadata: `LABEL org.opencontainers.image.authors="dloizides.com"` + `LABEL built-by="dloizides.com"` on every Dockerfile in the portfolio
- ✅ Health check endpoint response payload includes `builtBy: "dloizides.com"`
- ✅ Internal Grafana dashboards (custom panel, ops-visible)

**Where it does NOT appear**:
- ❌ Transactional emails (deliverability/DKIM/spam-trust risk; Maddy footer stays product-branded only)
- ❌ Keyboard Piano or any kids/COPPA/GDPR-K/Families-Policy app (external link-out is a compliance risk — gated by `complianceMode: 'kids'` flag)
- ❌ Keycloak OAuth consent screens (controlled by Keycloak templates; we keep those product-branded only)
- ❌ Push notifications / SMS (no room, no value)

**Implementation**:
- **Frontend**: Single `<PoweredByFooter />` React component in the `ui-primitives` npm package. Props: `hide?: boolean`, `complianceMode?: 'kids' | 'standard'`. Every app imports it once.
- **Backend**: Single shared middleware in a new `Branding.AspNetCore` NuGet package. Registers the `X-Built-By` header globally + injects into Swagger UI HTML + standardizes the health-check payload.
- **Containers**: Add LABELs to a base Dockerfile snippet, included by every service Dockerfile.
- **White-label opt-out**: `hidePoweredBy` boolean tenant setting. Future B2B upsell ("remove attribution: +$X/mo") if any product ever needs it.

**Cross-product discoverability risk acknowledged**: a curious user clicking the footer reaches `dloizides.com` and sees the full portfolio. Acceptable for B2C indie products. If a future B2B deal requires hiding sibling products, the link target becomes a stripped-down `dloizides.com/about` instead of the full portfolio listing.

---

## More Decisions Locked

- **Marketing budget**: Lane A — indie / zero budget. Both products launch in parallel via organic channels only (Product Hunt, Reddit, Twitter/LinkedIn, content/SEO, `dloizides.com` portfolio cross-link). DIY brand assets in Figma. No paid ad spend. Launch timeline "weeks not days" but cash burn ~zero.
- **User migration**: Option C — clean slate. No real production users to migrate; nuke existing data, start fresh with the two-realm architecture.

### E2E Test Reconfiguration (mandatory part of the split)

The existing `E2ETests/` setup assumes a single product, single realm, single base URL. Must be restructured to mirror the product split.

**New E2E layout**:
```
E2ETests/
├── questioner/
│   ├── playwright.config.ts          # base URL: app.questioner.com (or local equivalent)
│   ├── tests/
│   ├── pages/                         # Questioner-only page objects
│   └── fixtures/                      # Questioner test users (seeded into questioner realm)
├── onlinemenu/
│   ├── playwright.config.ts          # base URL: app.onlinemenus.com
│   ├── tests/
│   ├── pages/
│   └── fixtures/                      # OnlineMenu test users (seeded into onlinemenu realm)
├── cross-product-isolation/
│   ├── playwright.config.ts
│   └── tests/                         # the wall-holds-up regression suite
└── shared/
    ├── auth/                          # realm-aware Keycloak helpers
    ├── api-base/                      # tenant-aware API client wrappers
    └── testIds/                       # synced from each app's shared/testIds
```

**Cross-product isolation suite (NEW — the regression guard for the whole split)**:
- Take a Questioner JWT, call OnlineMenu API endpoints → must 401.
- Take an OnlineMenu JWT, call Questioner API endpoints → must 401.
- Sign into Questioner UI → assert DOM, network responses, page metadata, source maps contain zero strings matching `/online ?menu/i` or the OnlineMenu domain.
- Sign into OnlineMenu UI → assert no strings matching `/question(?:er|nair)/i` or the Questioner domain.
- Trigger password reset / signup confirmation in each realm → verify outgoing email sender domain, footer, links match the right product only.
- Verify Keycloak OAuth consent screens are product-branded (no other-product logo or copy).
- Verify error pages (404/500) per product render product-specific branding only.

**Test user seeding**:
- Each suite seeds users via Keycloak admin API directly into its own realm. No shared global users.
- Seed scripts live in `E2ETests/{product}/fixtures/seed-realm.ts`, idempotent, run as a Tilt resource (`questioner-e2e-seed`, `onlinemenu-e2e-seed`) before the test suites.

**Tilt resource renames + additions**:
- `playwright-e2e-questioner-templates` → `playwright-e2e-questioner-templates` (path moves but name stays — config now points to `E2ETests/questioner/`).
- `playwright-e2e-online-menus-*` → `playwright-e2e-onlinemenu-*` (note: drop hyphen in product name to match `apps/onlinemenu-web/`).
- `playwright-e2e-smoke` → split into `playwright-e2e-questioner-smoke` and `playwright-e2e-onlinemenu-smoke`.
- NEW: `playwright-e2e-cross-product-isolation` — runs against both products, gates every shared-package PR.
- NEW: `questioner-e2e-seed`, `onlinemenu-e2e-seed` — run before respective test suites.

**Shared E2E helpers**:
- `shared/auth/login.ts` takes a `realm` argument and a `product` argument; never hardcodes either.
- `shared/api-base/client.ts` takes a base URL; never assumes a single API host.
- `shared/testIds/` stays synced via the existing test-id sharing mechanism, but split per product (Questioner test IDs only sync from `apps/questioner-web/src/shared/testIds/`, etc.).

**CI/CD path filtering for E2E**:
- Questioner-only PR → runs `playwright-e2e-questioner-*` only.
- OnlineMenu-only PR → runs `playwright-e2e-onlinemenu-*` only.
- Shared package PR (`NpmPackages/`, `NuGetPackages/`) → runs all three: questioner + onlinemenu + cross-product-isolation.
- Cross-product-isolation suite is the gate — if it ever fails, no merge.

**Existing test debt to preserve**: every current `BaseClient/docs/Tasks/COMPLETED/` E2E task that established a flow needs its assertions migrated to the new product-specific suite. No tests get deleted in the move; some get duplicated (e.g. login flow exists in both products' suites since both have login).

---

## Final Decisions Locked

- **Data retention (tier-dependent)**:
  - **Paid users (no-ads tier + full-featured tier)**: indefinite retention. Data kept as long as the subscription is active. After cancellation, account drops to free-tier rules.
  - **Free-tier users**: 12-month inactivity sunset. After 12 months of zero activity, send a 30-day warning email ("log in to keep your account"). If still inactive, the account enters soft-delete (data anonymized for analytics, PII purged).
  - **Trial users**: same 12-month sunset, but the trial expiry itself converts them to free-tier first.
- **Explicit deletion (user clicks "Delete my account")**:
  - **Soft delete + 30-day grace period**. Account immediately becomes inaccessible (login disabled, data hidden from all queries). User receives a confirmation email with a one-click "undo" link valid for 30 days. After 30 days: hard delete (PII purged from primary store + backups on next rotation). GDPR-compliant — restoration is possible during grace window, fully irreversible after.
- **Implementation**:
  - New `Retention` background job in each backend service: scans for inactivity, sends warnings, performs anonymization. Per-realm so the policies stay isolated.
  - `account_status` enum on user records: `active`, `pending_deletion`, `anonymized`. Soft-deleted users return `404` from the user-lookup API, not `403` (don't leak existence).
  - Privacy Policy text per product must spell out the 12-month / 30-day numbers verbatim — required for GDPR compliance.
  - User-facing settings page: "Delete account" button → confirmation modal → email with undo link → 30-day countdown visible to the user if they log back in during grace.

---

## Planning Phase — COMPLETE

All decisions locked. Implementation can now proceed via the phased migration plan above (Phase 0 → Phase 7).

---

## Phase 1 — Shared Package Extraction (IN PROGRESS, scaffolding done 2026-05-01)

### Shipped to nuget.org / npm

| Package | Version | Status | What |
|---|---|---|---|
| `Branding.AspNetCore` | 1.0.1 | ✅ Published | Portfolio attribution: `X-Built-By` header middleware, Swagger UI footer snippet, health-check payload helper |
| `@dloizides/ui-primitives` | 1.0.1 | ✅ Published | `<PoweredByFooter />` React component (9 tests, 100% coverage) |
| `Security.Claims` | 1.5.0 | ✅ Published | NEW: `RealmExtensions` — `GetIssuer()`, `GetRealm()`, `IsFromRealm(expected)`, `ExtractRealmFromIssuer()` for the cross-realm hard wall |
| `@dloizides/auth-client` | 1.0.0 | ✅ Published | Realm-aware Keycloak/OIDC helpers: `AuthClient` class (constructor takes `realm` + `clientId`), token storage adapters, URL builders, `parseRealmFromIssuer`, `normalizeKeycloakUser`, `decodeJwt`, `isTokenExpired`. 138 tests at 100% coverage. BaseClient now consumes it. |
| `@dloizides/api-client-base` | 1.0.0 | ✅ Published | Realm-agnostic, product-agnostic HTTP plumbing: `ApiClient` (fetch-based, `getAccessToken` callback for token injection), `ApiError` / `ApiErrorEnvelope`, typed event bus (`ApiEventBus` + variants), declarative error registry + matcher, pure classifier on duck-typed `AxiosErrorLike`, envelope-extraction helpers. 116 tests at 100% coverage. BaseClient now consumes it via re-export shims. |

### Wired into all 6 backend services

`Branding.AspNetCore` is registered (`builder.AddBranding()`) and applied (`app.UseBuiltByHeader()`) in:

- IdentityService (build verified)
- QuestionerService (build verified)
- OnlineMenuService (build verified)
- NotificationService (build verified)
- ContentService (build verified)
- PaymentService (build verified)

Each `Directory.Packages.props` includes `<PackageVersion Include="Branding.AspNetCore" Version="1.0.1" />` and each Web/API .csproj includes the corresponding `<PackageReference>`. Every Program.cs has the standard insertion point (after structured logging, after tracing, before the build).

### Container labels — all 19 Dockerfiles in the monorepo

Every Dockerfile (5 SaaS backend services + BaseClient + 4 games + InterviewPrep frontend/api + SyncfusionThemeStudio + MockServer + platform-ops + jobs-runner + E2ETests + KeyboardPiano android build) now carries:

```
LABEL org.opencontainers.image.authors="dloizides.com"
LABEL org.opencontainers.image.vendor="dloizides.com"
LABEL org.opencontainers.image.title="<service-name>"
LABEL built-by="dloizides.com"
```

### Scaffolds (skeletons only — extraction pending)

| Package | Version | Status | Pending Work |
|---|---|---|---|
| `@dloizides/auth-client` | **1.0.0** | ✅ **Published** | Extracted realm-aware Keycloak helpers: types, URL builders, token storage adapters, JWT decode, normalisation, expiry helpers. 138 tests at 100% coverage. BaseClient consumes via re-export shim. See `BaseClient/docs/Tasks/COMPLETED/extract-auth-client-package.md`. The PKCE React hook + Redux-coupled `AuthProvider` stay in BaseClient — too entangled to extract without behavior change. |
| `@dloizides/api-client-base` | **1.0.0** | ✅ **Published** | Extracted realm-agnostic plumbing: `ApiClient` fetch wrapper with `getAccessToken` callback, `ApiError`, typed event bus, error registry/matcher/classifier, envelope extraction helpers. 116 tests at 100% coverage. BaseClient consumes via re-export shims. See `BaseClient/docs/Tasks/COMPLETED/extract-api-client-base-package.md`. The Redux-coupled interceptors + i18n-coupled `errorActions` + Sentry-coupled `errorReporter` + the `useApiEvents`/`ApiEventsProvider` UI handler stay in BaseClient — too entangled to extract without behavior change. |

Both registered in `NpmPackages/publish-all.ps1`. Skeleton APIs (`AuthClient`, `ApiClient` classes) defined to lock in the realm-aware contract. Full extraction is a downstream task that benefits from `frontend-dev` agent specialization since it requires deep BaseClient code-archaeology.

### Phase 1 — Remaining

- [x] **2026-05-01** — Extract Keycloak helpers from `BaseClient/src/` into `@dloizides/auth-client` v1.0.0 (published, BaseClient consumes it, 100% coverage)
- [x] **2026-05-01** — Extract HTTP plumbing from `BaseClient/src/lib/api/` into `@dloizides/api-client-base` v1.0.0 (published, BaseClient consumes it via shims, 100% coverage)
- [x] Add unit tests at 100% coverage for `@dloizides/auth-client` (138 tests)
- [x] Add unit tests at 100% coverage for `@dloizides/api-client-base` (116 tests)
- [x] Refactor BaseClient to consume `@dloizides/auth-client` (no behavior change — re-export shim + helper imports)
- [x] Refactor BaseClient to consume `@dloizides/api-client-base` (no behavior change — six re-export shims + adapter file)
- [ ] Add Tilt resources for `npm-auth-client-*` and `npm-api-client-base-*`
- [ ] Wire `app.UseSwaggerUI(o => o.HeadContent += ...)` into each service that exposes Swagger
- [ ] Create GitHub repos for `Branding.AspNetCore`, `ui-primitives`, `auth-client`, `api-client-base`

**Summary of locked decisions**:
| Question | Decision |
|---|---|
| Persona overlap | None — genuinely different buyers |
| Pricing | Identical 4-tier (trial / free+ads / paid no-ads / paid full) for both products |
| Parent brand | Option A (zero EisaiPollis user-facing) + portfolio-wide "built by dloizides.com" attribution |
| Marketing budget | Lane A — indie / zero budget / organic-only / parallel launch |
| User migration | Option C — clean slate (no production users) |
| Data retention | Tier-dependent: paid indefinite, free/trial 12-month inactivity sunset |
| Explicit deletion | Soft delete + 30-day grace, then hard delete |
| E2E reconfiguration | Per-product suites + cross-product-isolation regression suite |

**Recommended starting point**: Phase 1 (shared package extraction) — lowest risk, no user-visible change, and unblocks every later phase.

---

## Tradeoffs Acknowledged

- **Ongoing duplication cost**: two privacy policies, two trademark searches, two support inboxes, two billing setups, two Maddy sender domains, two analytics properties. Real ongoing time cost.
- **Migration friction for existing users**: anyone using both products today gets two accounts and has to set passwords twice.
- **Initial build cost**: phases 1–5 are weeks of work, not days.
- **Worth it only if**: the products target different buyer personas. If they overlap heavily, this is over-engineering — revisit.

---

## Next Steps

1. Answer the Open Questions above.
2. Decide Option A vs B for `Notification` and `Content` (security audit if B).
3. Buy domains.
4. Begin Phase 1 (shared package extraction) — lowest risk, no user-visible change, sets up everything else.

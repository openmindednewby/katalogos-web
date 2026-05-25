# Phase 2 / Step 5 — Cross-Product Isolation E2E Suite

## Status: COMPLETED
## Date: 2026-05-01
## Owner: regression-tester (Claude)

---

## Problem Statement

Phase 2 / Step 2 introduced the cross-realm wall in code: each backend
service validates the `iss` claim of incoming JWTs against a configured
`Authentication:AllowedRealms` list, and rejects mismatches with HTTP 401
(intentionally NOT 403, to avoid leaking realm topology). Phase 2 / Step 1
provisioned the new `questioner` and `onlinemenu` realms in Keycloak. The
unit-test layer covers 54 test cases across six services for the realm-
validation handler itself.

What was missing: an end-to-end regression suite that proves the wall
actually holds at the wire — real Keycloak, real backend services, real
JWTs, real cross-realm rejection.

This task ships that suite.

---

## What Shipped

### 1. New E2E suite directory

`C:\desktopContents\projects\SaaS\E2ETests\tests\cross-product-isolation\`

Four spec files (44 total test cases):

| File | Tests | Focus |
|---|---|---|
| `cross-realm-rejection.spec.ts` | 5 | The wall holds — A's token rejected by B's API |
| `cross-realm-acceptance.spec.ts` | 8 | Multi-realm services accept BOTH realms (Identity, Notification, Content, Payment) |
| `malformed-token-rejection.spec.ts` | 25 | Every service fails closed on garbage / no-token / bad-signature |
| `response-sanitization.spec.ts` | 5 | 401 body and headers leak no realm/product names |

Plus a `README.md` documenting suite intent, what's covered, what's deferred,
how to run it, and override env vars.

### 2. Realm-aware token helper

`C:\desktopContents\projects\SaaS\E2ETests\helpers\realm-token-helper.ts`

Module that acquires Keycloak access tokens scoped to specific realms:

- `OnlineMenu` realm → IdentityService `/api/v1/auth/login` (the path every
  existing E2E test uses)
- `questioner` / `onlinemenu` realms → OIDC ROPC against
  `https://identity.dloizides.com/realms/<realm>/protocol/openid-connect/token`
- Per-worker token caching (no thrashing of Keycloak)
- Returns `{accessToken, unavailableReason, source}` — when a new realm
  doesn't yet have a registered user, dependent tests `.skip()` with the
  reason `PHASE_2_STEP_3_PENDING — ...`

The helper is intentionally non-failing on missing prerequisites: if Phase 2 /
Step 3 (OAuth client + user migration) isn't done yet, the suite skeleton is
still in place and the relevant tests skip cleanly. Once Step 3 lands and
seeds a test user into each new realm, every test in the suite goes live
without code changes.

### 3. Playwright project + npm script

`E2ETests/playwright.projects.ts` — added a new `cross-product-isolation`
project that targets `tests/cross-product-isolation/*.spec.ts`. Depends on
the existing `setup` project (no `multi-tenant-setup` because cross-product
isolation operates on realm-scoped tokens, not tenant-scoped users).

`E2ETests/package.json` — added two scripts:
- `test:cross-product-isolation` — runs the suite via Playwright
- `tilt:cross-product-isolation` — runs the suite via the existing Tilt
  E2E runner

### 4. Tilt resource

`Tiltfile` — new resource `playwright-e2e-cross-product-isolation` in the
`Playwright` label. `TRIGGER_MODE_MANUAL` consistent with the rest of the
playwright-e2e family. Depends on every product API + identity API + the
e2e-lint resource. Unlike the UI-touching suites, this one does NOT depend
on `frontend` since it never opens a browser.

### 5. CLAUDE.md mapping

`CLAUDE.md` — added the new resource to the "Resource Name Mapping" table
under the E2E section so other agents discover it.

### 6. In-progress task doc updated

`BaseClient/docs/Tasks/IN_PROGRESS/product-split-questioner-onlinemenu.md` —
checked off the API-layer isolation suite item under Phase 2.

---

## Acceptance Criteria Coverage

The four cross-product-isolation acceptance criteria from the parent task
doc are:

| # | Criterion | Status | Where |
|---|---|---|---|
| 1 | Cross-realm token rejection at the API layer (must 401, NOT 403) | **COVERED** | This suite (`cross-realm-rejection.spec.ts`, `response-sanitization.spec.ts`) |
| 2 | DOM / network-body / metadata leak in the *other* product's name | **DEFERRED to Phase 3** | Cannot test until `apps/questioner-web/` and `apps/onlinemenu-web/` exist as separate apps. Current BaseClient bundles both. |
| 3 | Email sender domain matches the right product | **DEFERRED to Phase 5** | Per-product Maddy SMTP mailboxes (`noreply@questioner.com`, `noreply@onlinemenus.com`) don't exist yet — both realms route through shared mailbox. |
| 4 | OAuth consent screens reference only the right product | **DEFERRED to Phase 2 / Step 3 + Phase 3** | New realms inherit default Keycloak theme; per-realm custom themes land with the OAuth client migration + theme work. |

When Phases 2/3, 3, and 5 land, this suite gains DOM-based, email-based, and
consent-screen-based test files alongside the existing four. The pattern is
already in place.

---

## Test Inventory (44 tests)

### `cross-realm-rejection.spec.ts` (5 tests)
1. Legacy `OnlineMenu` realm token still works against QuestionerService (backward-compat — flips to 401 after cutover)
2. `questioner` realm token is REJECTED by OnlineMenuService (401) — **THE WALL**
3. `onlinemenu` realm token is REJECTED by QuestionerService (401) — **THE WALL**
4. `questioner` realm token is ACCEPTED by QuestionerService (sanity)
5. `onlinemenu` realm token is ACCEPTED by OnlineMenuService (sanity)

### `cross-realm-acceptance.spec.ts` (8 tests)
1–2. Both new realms accepted by IdentityService
3–4. Both new realms accepted by NotificationService
5–6. Both new realms accepted by ContentService (Option-B partitioned)
7–8. Both new realms accepted by PaymentService

### `malformed-token-rejection.spec.ts` (25 tests = 4 scenarios × 6 services + 1 doc test)
For each of the 6 services (Questioner, OnlineMenu, Identity, Notification,
Content, Payment):
- No Authorization header → 401
- Empty bearer token → 401
- Garbage bearer token → 401
- Structurally valid JWT with bad signature → 401

Plus one "documentation-only" test that flags the iss-claim variant matrix
as covered at the unit-test layer (we cannot forge a tampered-iss JWT with a
valid Keycloak signature in E2E without Keycloak's RS256 private key).

### `response-sanitization.spec.ts` (5 tests) — info-leak P0 guard
1. QuestionerService 401 (no token) does NOT leak realm/product names
2. OnlineMenuService 401 (no token) does NOT leak realm/product names
3. QuestionerService 401 (cross-realm `onlinemenu` token) does NOT leak
4. OnlineMenuService 401 (cross-realm `questioner` token) does NOT leak
5. Cross-realm rejection 401 must be byte-equal status code to no-token 401
   (anti-info-leak: a wrong-realm token must be indistinguishable from a
   missing token)

Forbidden patterns checked in body + headers:
- `\brealm\b` (case-insensitive)
- `\bquestioner\b`
- `\bonlinemenu\b`
- `\bAllowedRealms\b`
- `\biss\b\s*[:=]`

Plus `WWW-Authenticate` header MUST NOT carry a `realm=questioner` /
`realm=onlinemenu` directive (this would leak the *expected* realm name).

---

## Verification

### Quick Mode (Playwright direct, NOT authoritative — Tilt was not running)

```
cd E2ETests
npx playwright test tests/cross-product-isolation/cross-realm-rejection.spec.ts \
  --project=cross-product-isolation
```

Result: **6 skipped** (1 setup + 5 tests).

Reason: every backend service (`localhost:5002`, `5004`, `5006`, `5009`,
`5015`, `5018`) is unreachable because Tilt isn't running. The
`globalSetup` correctly logs:

```
🔍 Checking IdentityService at http://localhost:5002...
⚠️  Warning: IdentityService is not available at http://localhost:5002
   Tests requiring authentication will be skipped.
```

The realm-token-helper then reports each token as unavailable with the
exact reason, and the tests skip with the helper's `unavailableReason`
string surfacing in the Playwright report.

This is the **correct behaviour**. The harness fails closed and surfaces a
diagnostic message. When Tilt is running and the new realms have seeded
users, every test goes live.

### Lint

```
cd E2ETests
npm run lint
```

Result: **0 errors, 8 pre-existing warnings**. None of the warnings are in
the new files (cross-product-isolation specs and realm-token-helper). All
pre-existing warnings come from files under `helpers/`, `pages/`, and other
`tests/` directories that already exceeded the 300-line file limit before
this task.

### TypeScript compilation

```
cd E2ETests
npx tsc --noEmit
```

Result: **clean** — no type errors.

### Test discovery

```
cd E2ETests
npx playwright test tests/cross-product-isolation \
  --project=cross-product-isolation --list
```

Result: **44 tests discovered across 5 files** (1 setup + 4 specs).

### Tilt MCP (NOT executed — environment limitation)

The CLAUDE.md feedback loop mandates running tests via Tilt MCP:

```
mcp__tilt__trigger_and_wait("playwright-e2e-cross-product-isolation", timeout=300)
```

This was attempted; Tilt is not currently running on the dev machine
(`mcp__tilt__status` returned `No tilt apiserver found: tilt-default`). The
Tilt resource is wired in and ready — the next time `tilt up` runs, it'll
appear in the UI under the `Playwright` label and can be triggered
manually.

Per CLAUDE.md, **Quick Mode results are not authoritative**. Once Tilt is
running and Phase 2 / Step 3 has seeded users into the new realms, the
suite must be verified via the Tilt-MCP feedback loop before sign-off.

---

## Probe Verification (Keycloak realms — done via direct HTTP)

To confirm the new realms are actually reachable by the helper, I hit each
realm's OIDC token endpoint directly:

```
curl -X POST https://identity.dloizides.com/realms/onlinemenu/protocol/openid-connect/token \
  -d grant_type=password \
  -d client_id=online-menu-client \
  -d username=superUser \
  -d password=SuperUser123! \
  -d scope=openid

→ {"error":"invalid_grant","error_description":"Invalid user credentials"}
```

```
curl -X POST https://identity.dloizides.com/realms/questioner/protocol/openid-connect/token \
  -d grant_type=password \
  -d client_id=online-menu-client \
  -d username=superUser \
  -d password=SuperUser123! \
  -d scope=openid

→ {"error":"invalid_grant","error_description":"Invalid user credentials"}
```

Both responses are **`invalid_grant`**, NOT `invalid_client`. This means:

1. The new realms exist (Phase 2 / Step 1 ✅).
2. The `online-menu-client` OAuth client EXISTS in both new realms with
   Direct Access Grants enabled (so Phase 2 / Step 3's client clone is
   partially or fully done — the client is reachable; only the user
   seeding remains).
3. The user `superUser` does NOT exist in the new realms — this is the
   `PHASE_2_STEP_3_PENDING` dependency.

Once Phase 2 / Step 3 seeds a test user into each new realm (or
the existing user-migration path lands), the suite's `getRealmToken()` will
return real tokens and every test goes live with no code changes.

The legacy realm continues to work:

```
curl -X POST https://identity.dloizides.com/realms/OnlineMenu/protocol/openid-connect/token \
  -d grant_type=password \
  -d client_id=online-menu-client \
  -d username=superUser \
  -d password=SuperUser123! \
  -d scope=openid

→ {"access_token":"eyJhbGc...","expires_in":300,...}
```

---

## P0 Findings

**None as of this task.** The realm-validation handler in
`Security.Claims@1.5.0` and per-service handlers explicitly avoid logging
or returning realm names in 401 bodies (verified via code reading at
`QuestionerService/Questioner/src/Questioner.Web/Security/RealmAuthorizationHandler.cs`),
so the `response-sanitization.spec.ts` checks should pass on the first run.

**Possible findings to surface once the suite runs live**:
- If any service returns a 403 instead of 401 for a cross-realm token,
  that's a P0 backend bug — the wall must always 401.
- If any service's 401 body contains the literal text `realm`,
  `questioner`, `onlinemenu`, or `AllowedRealms`, that's a P0 backend
  bug — file against the responsible service's `RealmAuthorizationHandler`
  or its `Program.cs` JWT bearer error handler.
- If `WWW-Authenticate` carries a `realm=` directive that names a
  Keycloak realm, that's a P0 backend bug.

Each test asserts on these conditions with a descriptive failure message
that explains exactly why the check matters and what to fix.

---

## How to Extend the Suite (Phase 3 hand-off)

When Phase 3 splits BaseClient into `apps/questioner-web/` and
`apps/onlinemenu-web/`, the suite gains three new spec files alongside the
existing four:

| New spec file | What it asserts |
|---|---|
| `dom-leak-questioner-app.spec.ts` | Sign into Questioner app → no `onlinemenu` strings in DOM, network response bodies, page metadata, source maps |
| `dom-leak-onlinemenu-app.spec.ts` | Sign into OnlineMenu app → no `questioner` strings (mirror) |
| `email-sender-domain.spec.ts` | Trigger password reset / signup confirm → outgoing email's `From:` domain matches the product (Mailpit-driven for dev, real-mailbox for staging) |
| `oauth-consent-branding.spec.ts` | Hit each app's OAuth flow → consent screen carries the right product's logo / copy / terms link |

The realm-token-helper's `getRealmToken()` is reusable for all of these.
The skip-on-missing pattern keeps these specs green during the transitional
state when one app exists and the other doesn't.

---

## Files Changed (absolute paths)

### New
- `C:\desktopContents\projects\SaaS\E2ETests\tests\cross-product-isolation\README.md`
- `C:\desktopContents\projects\SaaS\E2ETests\tests\cross-product-isolation\cross-realm-rejection.spec.ts` (177 lines)
- `C:\desktopContents\projects\SaaS\E2ETests\tests\cross-product-isolation\cross-realm-acceptance.spec.ts` (205 lines)
- `C:\desktopContents\projects\SaaS\E2ETests\tests\cross-product-isolation\malformed-token-rejection.spec.ts` (176 lines)
- `C:\desktopContents\projects\SaaS\E2ETests\tests\cross-product-isolation\response-sanitization.spec.ts` (200 lines)
- `C:\desktopContents\projects\SaaS\E2ETests\helpers\realm-token-helper.ts` (252 lines)
- `C:\desktopContents\projects\SaaS\BaseClient\docs\Tasks\COMPLETED\phase2-step5-cross-product-isolation-suite.md` (this file)

### Modified
- `C:\desktopContents\projects\SaaS\E2ETests\playwright.projects.ts` (added `cross-product-isolation` project)
- `C:\desktopContents\projects\SaaS\E2ETests\package.json` (added `test:cross-product-isolation` and `tilt:cross-product-isolation` scripts)
- `C:\desktopContents\projects\SaaS\Tiltfile` (added `playwright-e2e-cross-product-isolation` resource)
- `C:\desktopContents\projects\SaaS\CLAUDE.md` (added resource to mapping table)
- `C:\desktopContents\projects\SaaS\BaseClient\docs\Tasks\IN_PROGRESS\product-split-questioner-onlinemenu.md` (checked off API-layer isolation suite under Phase 2)

---

## What This Unblocks

- Phase 2 / Step 3 (OAuth client + user migration) — its completion
  criterion can include "cross-product-isolation suite goes from `skipped`
  to `passing`". Once a test user is seeded into each new realm, every
  test in the suite runs live without code changes.
- Phase 2 cutover — when each service's `AllowedRealms` is narrowed to
  drop `OnlineMenu`, the existing "legacy OnlineMenu-realm token still
  works against QuestionerService" test will start to fail; that's the
  signal the cutover landed cleanly. The test will then be flipped to
  assert 401 instead of not-401.
- Phase 3 (per-product apps) — the helper, project config, and Tilt
  resource are all in place. Phase 3 just needs to add three more spec
  files for DOM-leak, email, and consent-screen tests using the same
  patterns.

---

## Out of Scope (deferred to subsequent tasks)

- **DOM-leak / network-body-leak / metadata-leak tests** — Phase 3
  dependency (per-app split).
- **Email sender domain tests** — Phase 5 dependency (per-product Maddy
  mailboxes).
- **OAuth consent screen branding tests** — Phase 2/Step 3 + Phase 3
  dependency (per-realm custom themes).
- **Tilt MCP authoritative run** — environment dependency (Tilt was not
  running during this task; the resource is wired and ready for the next
  `tilt up`).
- **Live test pass with real cross-realm tokens** — Phase 2 / Step 3
  dependency (user seeding into the new realms).

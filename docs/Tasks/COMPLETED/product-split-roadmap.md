# Product Split — Remaining Roadmap (Phase 2 → Phase 7)

## Status: 2026-05-02
## Owner: Demetris

---

## LOCKED DECISIONS (2026-05-02)

| Decision | Value |
|---|---|
| Product 1 name | **Erevna** (Έρευνα — "research / inquiry / survey") |
| Product 2 name | **Katalogos** (Κατάλογος — "catalogue / menu") |
| Domain strategy | All subdomains under `*.dloizides.com` (no separate domain registrations) |
| Erevna URLs | App: `erevna.dloizides.com` · API: `erevna-api.dloizides.com` · Email: `erevna@dloizides.com` |
| Katalogos URLs | App: `katalogos.dloizides.com` · API: `katalogos-api.dloizides.com` · Email: `katalogos@dloizides.com` |
| Subdomain pattern | Option A — flat (marketing + app on one subdomain) |
| OAuth providers | Google only (free). Apple skipped — no $99/year membership |
| Login methods at launch | Email + password + Google OAuth |
| Brand cohesion | Greek-portfolio aesthetic alongside Morphe + EisaiPollis |

---

## How to read this doc

Three classes of work:

- 🧑 **YOU** — only you can do this (third-party UIs, business decisions, secret entry, brand work)
- 🤖 **AGENT** — I can launch a backend-dev / frontend-dev / regression-tester agent to do this; no input needed beyond approval
- 🤝 **HYBRID** — agent does most of the work, you supply specific values (secrets, copy, names, domain choices)

Each step lists: who, what, why, deliverable, blocking dependencies, estimated wall time.

The whole roadmap from here to "two products live in production" is **~6–10 weeks of calendar time** if you push, mostly bottlenecked on YOUR steps (domain registration, brand decisions, marketing copy, OAuth registration). The agent work compresses to a few focused sessions.

---

## What's already shipped (reference)

```
✅ Phase 1: shared package extraction (5 packages live)
✅ Phase 2 Step 1: realm provisioning automated (questioner + onlinemenu exist on staging)
✅ Phase 2 Step 1b: OAuth clients cloned into both new realms
✅ Phase 2 Step 2: realm validation in 6 backend services (3033 tests pass)
✅ Phase 2 Step 4: per-realm SMTP sender config
✅ Phase 2 Step 5: cross-realm E2E isolation suite (44 tests, awaiting user seed)
✅ Portfolio "built by dloizides.com" attribution: 19 Dockerfiles labeled, 6 services emit X-Built-By header
```

What this means in practice: **the cross-realm wall is built and tested.** Tokens issued by `questioner` realm cannot authenticate against OnlineMenu's API; tokens from `onlinemenu` realm cannot authenticate against Questioner's API. The validation runs in production code today. What's left is the actual switch from a one-realm-one-product world to a two-realm-two-app world.

---

# 🟡 PHASE 2 — Finish what's open

## Step 3 — Google OAuth client registration 🧑 USER (Apple skipped)

**Why**: Each new realm needs its own OAuth client registrations with Google and Apple so users see product-branded consent screens (not "EisaiPollis" or shared brand). A user signing into Questioner via Google should see "Sign in to Questioner" — never "Sign in to OnlineMenus".

**What you do** (~60 min):

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project for each product (e.g. `questioner-prod`, `onlinemenu-prod`) — keeping them in separate Google projects keeps OAuth consent screens fully isolated
3. For each project: APIs & Services → OAuth consent screen → External, fill in:
   - App name: "Questioner" / "OnlineMenus"
   - User support email: `support@questioner.com` / `support@onlinemenus.com` (works even before mailbox provisioned — Google just stores it)
   - Logo: 120×120 PNG. If you don't have one yet, skip and add later — Google allows publishing without
   - Authorized domains: leave blank for now (or add `dloizides.com` if you want a placeholder)
   - Developer contact: `loizidesdemetris@gmail.com`
4. Credentials → Create Credentials → OAuth client ID → Web application
   - Authorized redirect URIs:
     - Questioner: `https://identity.dloizides.com/realms/questioner/broker/google/endpoint`
     - OnlineMenu: `https://identity.dloizides.com/realms/onlinemenu/broker/google/endpoint`
   - Local dev: also add `http://localhost:8443/realms/{realm}/broker/google/endpoint` if you test locally
5. Copy Client ID + Client Secret. **Do not commit these.**

### Apple
Same drill at [Apple Developer](https://developer.apple.com/account/resources/identifiers/) — register two Services IDs (one per product), generate a Sign in with Apple key per app, configure Return URLs same shape as Google.

**Apple is the harder one** — needs $99/year Apple Developer Program membership. If you don't have it, skip Apple entirely for now. Google alone covers ~60% of social login share.

### Then either:

**Option A** (faster, semi-manual): paste the credentials into Keycloak admin UI → realm → Identity Providers → Add provider → Google. Repeat per realm.

**Option B** (fully reproducible): add the four IDP entries (questioner-google, questioner-apple, onlinemenu-google, onlinemenu-apple) to the **legacy** `OnlineMenu` realm via Keycloak admin UI with placeholder values, then run `tilt trigger keycloak-provision-realms-with-clients` — the existing `Copy-IdentityProviders` helper auto-propagates to both new realms with `REPLACE_ME_*` placeholders. Then paste real secrets per realm via admin UI once.

Recommend Option A. Less moving parts. The reproducibility benefit doesn't matter much for OAuth secrets that already need to be entered manually somewhere.

### What I need from you to proceed past this step

Paste me the four sets of credentials (or two if Apple-skipped) and I'll write them to Keycloak via API. Or do it yourself in admin UI, takes 5 min.

**Deliverable**: per-realm OAuth IDPs work. Test by hitting `https://identity.dloizides.com/realms/questioner/protocol/openid-connect/auth?client_id=online-menu-client&response_type=code&redirect_uri=...&kc_idp_hint=google` — you should land on Google with the Questioner consent screen.

**Blocks**: full Phase 3 user testing (you can't test "sign in with Google to Questioner" until this is done). Doesn't block Phase 3 development.

---

## Step 6 — Seed test users into new realms 🤖 AGENT

**Why**: The cross-realm E2E suite goes fully live the moment users exist in `questioner` and `onlinemenu` realms. Right now 38 of 44 tests skip with `PHASE_2_STEP_3_PENDING`.

**What I do**: launch backend-dev to write `scripts/seed-realm-users.ps1` that creates a `superUser` test account in each new realm via Keycloak admin API. Idempotent. Add a Tilt resource `keycloak-seed-test-users`. Document the test credentials in `personalServerNotes/credential-inventory.yml`.

**What I need from you**: nothing.

**Deliverable**: run `tilt trigger keycloak-seed-test-users` once, then `playwright-e2e-cross-product-isolation` runs all 44 tests green.

**Blocks**: nothing critical. The wall is enforced regardless. This just makes the regression guard fully active.

---

# 🟡 PHASE 3 — Per-product app split

This is the biggest phase. Goal: replace the single `BaseClient/` with two separate apps that share zero brand, copy, or feature surface.

## Step 1 — Pick the product names + domains 🧑 USER

**Why**: Every step downstream depends on knowing what the products are called and where they live.

**What you do** (~15 min, just deciding):

Pick two product names. Constraints:
- Different from "Questioner" / "OnlineMenu" if you want — those are working titles. Could become "FormFlow" + "TableMenu" or whatever feels right
- Domains must be available on GoDaddy/Namecheap. Check both .com and the brand-relevant TLD
- Names must not already be SaaS trademarks in the same vertical

Decide:
| | Questioner-thing | OnlineMenu-thing |
|---|---|---|
| Product name | ? | ? |
| Marketing domain | ?.com | ?.com |
| App subdomain | app.?.com | app.?.com |
| API subdomain | api.?.com | api.?.com |
| Email sender | noreply@?.com | noreply@?.com |
| Support email | support@?.com | support@?.com |

If you can't decide right now: stick with `questioner.com` and `onlinemenus.com` as working titles — they're descriptive, available based on a 30-second check, and cheap to migrate later. Domains are €10–15/year each.

### What I need from you

The two domain names + the four subdomain choices above. Once you decide, I'll register them via your GoDaddy account (you'll need to be logged in) or you register them yourself and tell me when done.

**Deliverable**: two registered domains + DNS records pointing at Hetzner.

**Blocks**: Phase 3 Step 4 (TLS certs), Phase 4 (landing page deploy), Phase 5 (K3s ingresses), most user-visible work.

---

## Step 2 — Pick brand directions 🧑 USER

**Why**: Each product needs distinct logo, palette, typography, voice. Memory locked "Lane A — indie/zero budget", so this is DIY in Figma, not a paid designer.

**What you do** (~2–4 hours per brand):

For each product:
1. Figma file (free tier is plenty)
2. Logo: text-based is fine. Try 3 variants. Pick fonts from [Google Fonts](https://fonts.google.com/) — restrict to free/commercial-friendly licenses. Same advice as the games portfolio.
3. Palette: 1 primary, 1 accent, 4–5 grays, 2 semantic (success/error). Use [Coolors.co](https://coolors.co) generators
4. Voice/copy direction: 3 example marketing taglines, 5 example UI strings, the "About us" page draft
5. Save logo as SVG + PNG at 32/64/128/256/512 px

This is the "creative work" part you can't outsource without paying. Set a 2–3 evening timebox; resist perfectionism. Indie products iterate brands constantly.

### What I need from you

Per product, hand me:
- Logo: SVG + PNG (multiple sizes)
- Palette: 6–8 hex codes labeled (primary, accent, gray-900, gray-700, ..., success, error)
- Typography: 1 heading font name + 1 body font name from Google Fonts
- 5 example UI copy strings (button labels, error messages — your voice)
- 3 marketing taglines (one will become the homepage hero)

Drop them all in `apps/questioner-web/brand/` and `apps/onlinemenu-web/brand/` respectively (I'll create those folders during Phase 3 Step 3).

**Deliverable**: brand assets ready to consume in Figma + checked into the repo.

**Blocks**: Phase 3 Step 4 (theming the apps), Phase 4 (landing pages — they need brand too).

---

## Step 3 — Scaffold `apps/questioner-web/` and `apps/onlinemenu-web/` 🤖 AGENT

**Why**: Mechanical copy of `BaseClient/` into two siblings, each pointed at its own realm. No feature stripping yet — that's Step 4.

**What I do**: launch frontend-dev to:
1. Create `apps/questioner-web/` and `apps/onlinemenu-web/`. Copy `BaseClient/` into each (verbatim, including all dependencies and tests). Update `package.json` `name` and version per app
2. Each app gets its own `app.json` (Expo config) with product-specific name, slug, icons placeholder
3. Each app's `keycloakConfig.ts` points at its own realm via `AuthClient({ realm: 'questioner' })` / `AuthClient({ realm: 'onlinemenu' })` — using the `@dloizides/auth-client@1.0.0` package we already shipped
4. Each app's API base URL points at its own subdomain (config-driven, env vars, default to localhost in dev)
5. Add Tilt resources for both apps (`questioner-web-lint`, `questioner-web-prod-build`, etc., mirroring the existing `frontend-*` family)
6. Tag each app's `<PoweredByFooter />` with its product testID
7. Verify both apps build and test green, plus existing BaseClient continues to build (we're not deleting it yet — that's Phase 6)

**What I need from you**: the product names + brand assets from Steps 1–2 above. Without those I can scaffold with placeholder names ("App-A", "App-B") but you'll just rename them later.

**Deliverable**: `apps/questioner-web/` and `apps/onlinemenu-web/` build and run, each pointed at its own realm. Both products visually identical to BaseClient at this stage (theming is Step 4).

**Blocks**: Step 4 (feature stripping), all subsequent Phase 3 work.

---

## Step 4 — Strip cross-product features per app 🤝 HYBRID

**Why**: Right now both apps have 100% of BaseClient's features. Questioner-web shouldn't have menu-editor pages; OnlineMenu-web shouldn't have questioner-template pages.

**What I do** (agent): grep the codebase for feature-level imports and split them:
- `src/screens/questioner/*` stays in `apps/questioner-web/`, deleted from `apps/onlinemenu-web/`
- `src/screens/online-menus/*` stays in `apps/onlinemenu-web/`, deleted from `apps/questioner-web/`
- Navigation routes adjusted per app
- Translation keys for stripped features deleted
- TestIDs for stripped features deleted
- Brand-relevant theming applied (colors, fonts, logo from your brand assets)

**What you do** (per app, ~30–60 min review):
- Walk through the app, click everything, confirm only product-relevant features show up
- Veto/redirect when an agent guesses wrong (e.g. "this 'Templates' thing — is it a Questioner concept or generic?")

There's some genuine ambiguity here that an agent shouldn't resolve unilaterally:
- **Auth pages**: shared. Both products use the same login form, just with different branding. One copy stays; theme injection differs
- **Settings / profile / billing**: shared shape (both products have a profile page with the same fields), product-specific theming
- **Notifications page**: depends on the Notification service (which accepts both realms). Might be product-specific styled, but the data layer is shared
- **Team management / multi-tenancy**: shared infrastructure; might or might not be product-specific in UX terms

I'll flag every ambiguous case and ask you before deleting.

**Deliverable**: each app shows only its own product's features. Cross-product Playwright suites split into `E2ETests/questioner/` and `E2ETests/onlinemenu/` (Phase 1 plan already specs this).

**Blocks**: Phase 6 cutover.

---

## Step 5 — Per-realm token issuance flip 🤖 AGENT

**Why**: Today each app config still has `OnlineMenu` in `Authentication:AllowedRealms` for backward compat. Once Phase 3 apps are real, we drop the legacy realm from each service's allow-list.

**What I do**: launch backend-dev to:
1. Update Identity service to issue tokens against the realm matching the app that called it (probably already realm-aware via `AuthClient`'s realm param flowing through to the OAuth flow)
2. Drop `"OnlineMenu"` from `Authentication:AllowedRealms` in each service's `appsettings.Production.json` and `appsettings.Staging.json`. Keep it in `appsettings.Development.json` until dev environment cuts over too
3. Run all 6 services' unit tests + the cross-realm E2E suite

**What I need from you**: confirmation that staging's been smoke-tested with the new realms and you're ready to drop the legacy. After this lands, any token from the legacy `OnlineMenu` realm gets 401 in staging.

**Deliverable**: legacy realm tokens rejected by all services in staging. Production unchanged for now (still allows legacy until Phase 6 cutover).

---

# 🟡 PHASE 4 — Landing pages

## Step 1 — Two distinct marketing sites 🤝 HYBRID

**What I do** (agent, via `/frontend-design` skill): build `apps/questioner-landing/` and `apps/onlinemenu-landing/` as static sites — Astro or plain HTML/CSS, no React framework needed. Distinctive visual design per product (the `/frontend-design` skill is built exactly for this).

**What you do**:
- Provide the brand assets (Step 2 of Phase 3)
- Provide marketing copy: hero tagline, 3 feature blocks, pricing table, FAQ, contact details
- Sign off on the visual direction before I deploy

Marketing copy is the bottleneck here. If you have the brand done, you can dictate the copy in 1 hour ("Hero: ...; Feature 1: ...; Feature 2: ..."). I'll polish it.

**Deliverable**: two landing pages live at `https://questioner.com` and `https://onlinemenus.com`, each with privacy + terms + cookie banner, each linking to its own app.

---

## Step 2 — Per-product Privacy Policy + Terms of Service 🧑 USER

**Why**: Legal requirement (GDPR + general). Each product needs its own legal pages reflecting its data practices.

**What you do**: 
- Use a generator like [Termly](https://termly.io) or [iubenda](https://www.iubenda.com) — €10–30/month each, or one-time DIY using a template
- Reflect the policies decided earlier:
  - 12-month inactivity sunset for free users
  - Soft delete + 30-day grace for explicit deletion
  - Single Keycloak install operating under "EisaiPollis Ltd" (or your registered legal entity) on behalf of [Product Name]
  - Cookie disclosures
- Two separate documents per product. Don't share text across products if avoidable

If you don't have a registered legal entity yet, "Demetris Loizides, sole proprietor, Cyprus" works for indie-stage products. UK/EU customers might prefer a corporate entity later.

### What I need from you

The legal text. I'll wire it into the landing pages and the apps' settings/footer pages.

**Blocks**: production launch. Cannot legally collect user data without these in place.

---

# 🟡 PHASE 5 — Infrastructure (DNS + TLS + ingresses)

## Step 1 — Register the two domains 🧑 USER

**What you do** (~15 min, ~€20–30):
- GoDaddy or Namecheap: register `[questioner-name].com` and `[onlinemenu-name].com`
- Add DNS records pointing at Hetzner (`204.168.225.236`):
  - `A *.[domain]` → Hetzner IP — wildcard handles all subdomains automatically (memory says "dloizides.com wildcard DNS already covers everything via CNAME"; the new domains can do the same)
  - Or per-subdomain: `A app.[domain]`, `A api.[domain]`, `A [domain]`, `A www.[domain]` → Hetzner IP

**Blocks**: TLS certs, K3s ingresses.

---

## Step 2 — TLS certs + K3s ingresses 🤖 AGENT

**What I do**: launch backend-dev to:
- Add cert-manager `Certificate` resources for each new domain (Let's Encrypt, DNS-01 or HTTP-01)
- Add K3s ingresses per product: `[domain]` → landing, `app.[domain]` → web app, `api.[domain]` → API gateway
- Configure `personalServerNotes/k8s/` with the new ingresses
- Verify via `kubectl get certificate` that both certs issue cleanly

**What I need from you**: domains registered and DNS pointing at Hetzner.

**Deliverable**: HTTPS working on both new domains.

---

## Step 3 — Per-product email senders 🤝 HYBRID

**Why**: Each product needs its own outbound email domain. Memory says "Maddy mail server" runs on staging and handles `noreply@dloizides.com` today.

**What you do**:
- Add MX, SPF, DKIM records per new domain (DNS records you control)
- DKIM keys: I generate them via Maddy's CLI; you paste the DKIM TXT record into DNS
- Verify with [mail-tester.com](https://www.mail-tester.com) that test emails get 9–10/10 score

**What I do (agent)**:
- Configure Maddy on staging laptop with the new mailboxes
- Update notification service per-product SMTP credentials
- Test send via the existing Daily Environment Report path

**Deliverable**: `noreply@questioner.com` and `noreply@onlinemenus.com` deliver emails that don't land in spam.

---

# 🟡 PHASE 6 — Cutover

## Step 1 — Smoke test in staging 🤝 HYBRID

**What I do**: deploy both new apps + landings + backend changes to staging. Run the smoke test suite. Run the cross-realm isolation E2E suite (now fully live). Run a 24-hour soak.

**What you do**: actually use both apps as a user. Sign up. Sign in. Trigger flows. Verify no leak between products. Look at incoming emails and confirm sender domains match. Check OAuth consent screens.

**Deliverable**: 24h green on staging, no regressions, no cross-product references found by manual inspection.

---

## Step 2 — Production cutover 🤝 HYBRID

**What you do**: pick a low-traffic window (you have ~zero production users today so this is moot, but the discipline matters). Communicate to anyone testing the existing BaseClient that the cutover is happening.

**What I do**: deploy to production. Drop legacy realm from production allow-lists. Monitor for 1 hour. Have rollback ready.

**Deliverable**: both products live in production. Independent deploys. Independent uptime.

---

## Step 3 — Decommission legacy `OnlineMenu` realm 🤖 AGENT

**Why**: Closing out the old. Cleanup keeps Keycloak's user list clean and prevents accidental cross-realm auth in the future.

**What I do** (after 1 week of green production): export legacy realm one final time as a backup, then delete it. Update credential inventory. Update task docs.

**What I need from you**: explicit go-ahead at the 1-week mark.

---

# 🟡 PHASE 7 — Cleanup

## Step 1 — Delete BaseClient 🤖 AGENT

After Phase 6 lands cleanly, `BaseClient/` is dead code. I delete it, update the Tiltfile, update CLAUDE.md, archive its docs into `docs/Tasks/COMPLETED/baseclient-archive/`.

## Step 2 — Rename clients in Keycloak 🤖 AGENT

The cloned clients are still named `online-menu-api`, `online-menu-client`, `online-menu-swagger` in the new realms — semantically wrong. Rename to `questioner-api`/`onlinemenu-api`/etc. Update each app's `clientId` config. Coordinate across apps + Keycloak in one PR.

## Step 3 — GitHub repos for the 4 new packages 🤖 AGENT

`Branding.AspNetCore`, `ui-primitives`, `auth-client`, `api-client-base` are published to nuget.org/npm but their `repository.url` fields point at non-existent GitHub repos. `gh repo create` for each, push initial commit. ~15 min agent task.

## Step 4 — Tests for `Branding.AspNetCore` and `Security.Claims` realm helpers 🤖 AGENT

I shipped these without tests. Add xUnit projects and write at least 100% coverage on the realm helpers (string parsing, edge cases) and the branding middleware (header set, suppress flag, options config). Closes a known testing gap.

---

# Consolidated YOU action list (copy-paste checklist)

In recommended order:

- [ ] **A. Pick product names + domains** (~15 min). Decide: what are the two products called? Two domain names. Send them to me.
- [ ] **B. Register the two domains** (~15 min). GoDaddy or Namecheap. Add DNS A-records pointing wildcard at Hetzner (`204.168.225.236`).
- [ ] **C. Brand work, Product 1** (~3 hours). Logo SVG/PNG, palette hex codes, font names, 5 UI strings, 3 taglines.
- [ ] **D. Brand work, Product 2** (~3 hours). Same.
- [ ] **E. Google Cloud Console: register OAuth client, Product 1** (~20 min). Send me Client ID + Secret.
- [ ] **F. Google Cloud Console: register OAuth client, Product 2** (~20 min). Send me Client ID + Secret.
- [ ] **G. Apple Developer (optional, $99/year): register Services IDs** (~30 min each).
- [ ] **H. Marketing copy, Product 1** (~1–2 hours). Hero, features, pricing, FAQ.
- [ ] **I. Marketing copy, Product 2** (~1–2 hours). Same.
- [ ] **J. Privacy + Terms, Product 1** (~30 min if using Termly). Generate or DIY. Send me text.
- [ ] **K. Privacy + Terms, Product 2** (~30 min). Same.
- [ ] **L. Mailbox provisioning DKIM step**: I generate DKIM keys, you paste TXT record into DNS for each domain.
- [ ] **M. Staging smoke test**: spend 30 min using both apps as a real user, looking for cross-product leaks.
- [ ] **N. Production cutover go-ahead**: confirm you're ready.
- [ ] **O. Legacy realm deletion go-ahead**: 1 week after production cutover, confirm I can delete the OnlineMenu realm.

**Total your time: ~12–18 hours spread over weeks. Most of it is brand + copy work that doesn't compress.**

---

# Consolidated AGENT action list

In dependency order, parallelizable where shown:

| # | Task | Agent | Depends on YOU step | Wall time |
|---|---|---|---|---|
| 1 | Seed test users into new realms | backend-dev | none | 30 min |
| 2 | Scaffold `apps/questioner-web/` + `apps/onlinemenu-web/` | frontend-dev | A | 2–3 hr |
| 3 | Strip cross-product features (per-app) | frontend-dev | 2 + D | 3–4 hr each |
| 4 | Per-realm token issuance flip | backend-dev | 2, 3 | 1 hr |
| 5 | Build `apps/questioner-landing/` + `apps/onlinemenu-landing/` | frontend-dev (`/frontend-design`) | C, D, H, I | 2–3 hr each |
| 6 | TLS certs + K3s ingresses | backend-dev | B | 1–2 hr |
| 7 | Per-product email senders (Maddy + Notification config) | backend-dev | B + L | 1 hr |
| 8 | Add Privacy/Terms pages to landings + apps | frontend-dev | J, K | 30 min |
| 9 | Smoke + soak deployment to staging | tilt-ops | 1–8 done | 1 hr active + 24 hr wait |
| 10 | Production cutover | backend-dev | M | 30 min active + 1 hr monitor |
| 11 | Decommission legacy OnlineMenu realm | backend-dev | O | 15 min |
| 12 | Delete BaseClient | frontend-dev | cutover stable | 30 min |
| 13 | Rename clients in Keycloak | backend-dev | cutover stable | 1 hr |
| 14 | GitHub repos for 4 new packages | backend-dev | none | 30 min |
| 15 | Add tests for Branding.AspNetCore + Security.Claims realm helpers | backend-dev | none | 2–3 hr |

**Total agent time: ~22–30 hours of focused work, parallelizable into ~3–5 sessions.**

---

# Suggested sequencing (calendar view)

### Week 1 (this week)
- 🧑 You: Steps A, B (decide names, register domains) — **30 min total**
- 🤖 Me: Tasks 1, 14, 15 (test users, GitHub repos, missing tests) — fully unblocked, can start now without you
- 🧑 You: Step C, D (brand work) — start when ready

### Week 2
- 🧑 You: Step E, F (Google OAuth) — **40 min**
- 🤖 Me: Task 2 (scaffold apps), Task 6 (TLS + ingresses) — unblocked once domains registered
- 🧑 You: Step H, I (marketing copy) — start when brand is ~stable

### Week 3
- 🤖 Me: Task 3 (feature stripping), Task 5 (landings), Task 7 (email senders)
- 🧑 You: Step J, K (legal), Step L (DKIM)

### Week 4
- 🤖 Me: Task 4 (token flip), Task 8 (legal pages wired), Task 9 (staging deploy)
- 🧑 You: Step M (smoke test)

### Week 5
- 🧑 You: Step N (cutover go-ahead)
- 🤖 Me: Task 10 (production cutover)

### Week 6
- 🧑 You: Step O (decom go-ahead) — 1 week after cutover
- 🤖 Me: Tasks 11, 12, 13 (cleanup)

---

# Things that can start RIGHT NOW (no user blocker)

If you want me to keep moving while you do the brand work:

1. ✅ **Task 1**: seed test users into new realms — makes the cross-realm E2E suite fully active
2. ✅ **Task 14**: create GitHub repos for `Branding.AspNetCore`, `ui-primitives`, `auth-client`, `api-client-base`
3. ✅ **Task 15**: write tests for `Branding.AspNetCore` middleware + `Security.Claims` `RealmExtensions` (closes the test-coverage gap I shipped without)

These three can run as one parallel batch and clean up loose ends from earlier phases. Want me to launch them?

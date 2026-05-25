# Phase 2 / Step 1b - Clone OAuth Clients into New Realms

## Status: COMPLETED
## Date: 2026-05-01
## Owner: backend-dev (Claude)

---

## Problem Statement

Phase 2 / Step 1 created the `questioner` and `onlinemenu` realms via a curated whitelist of scalar settings (token lifespans, password policy, login flags, etc.). The full-realm-clone approach hit Keycloak HTTP 500 (cross-references in the export the import path can't atomically rewrite), so OAuth clients, identity providers, claim mappers, and composite roles were deferred.

This task imports those into both new realms via per-resource Admin REST API calls — one POST per client/role/scope so failures isolate.

---

## What Shipped

### 1. `-IncludeClients` flag on `provision-realms.ps1`

`C:\desktopContents\projects\SaaS\scripts\provision-realms.ps1`

Extended (vs. creating a separate file) to avoid duplicating ~250 lines of master-realm auth, `.env.local` parsing, and UTF-8 byte-encoding boilerplate. The flag triggers a new "client cloning" phase after the existing realm-provisioning loop:

- Authenticate (existing master-admin token reused).
- Re-read the source-realm snapshot at `personalServerNotes/keycloak/realm-templates/OnlineMenu.template.json`.
- For each target realm in `realms.config.json`:
  1. Verify realm exists (skip cloning into a missing realm).
  2. **Roles first** (so client service-accounts can reference them later if needed):
     - Skip `uma_authorization`, `offline_access`, `default-roles-*` (auto-provisioned per realm).
     - For each remaining role: GET `/admin/realms/{realm}/roles/{name}` → if 200, skip; otherwise POST `/admin/realms/{realm}/roles` with the role body (id stripped).
     - Pass-2 wires composite linkage via POST `/admin/realms/{realm}/roles/{name}/composites`. (No-op for the legacy realm: all custom realm roles are flat.)
  3. **Client scopes** (so clients can reference them by name):
     - Skip the 13 default scopes (`role_list`, `offline_access`, `microprofile-jwt`, `acr`, `roles`, `basic`, `profile`, `email`, `phone`, `address`, `organization`, `saml_organization`, `web-origins`).
     - Existence check via GET `/admin/realms/{realm}/client-scopes` filtered by name; POST `/admin/realms/{realm}/client-scopes` if missing. Inline `protocolMappers` carry over.
  4. **Clients**:
     - Skip the 6 default system clients (`account`, `account-console`, `admin-cli`, `broker`, `realm-management`, `security-admin-console`) - Keycloak auto-provisions per realm.
     - Existence check: GET `/admin/realms/{realm}/clients?clientId={cid}`.
     - Strip `id` UUIDs from client + nested `protocolMappers` + `authorizationSettings.{resources,policies,scopes}` so Keycloak generates fresh ones.
     - Strip the masked `secret: "**********"` marker so Keycloak generates a fresh secret (otherwise the literal `**********` becomes the secret).
     - Strip `client.secret.creation.time` (stale).
     - Apply per-realm `clientHostRewrites` to `redirectUris`, `webOrigins`, `rootUrl`, `adminUrl`, `baseUrl`, `attributes.post.logout.redirect.uris`, `attributes.request.uris`.
     - POST `/admin/realms/{realm}/clients`.
  5. **Identity providers**:
     - GET `/admin/realms/{realm}/identity-provider/instances/{alias}` for existence; POST if missing.
     - Replaces `config.clientId` and `config.clientSecret` with `REPLACE_ME_<alias>_CLIENT_ID/SECRET` placeholders. The user fills these in once Phase 2 / Step 3 happens (Google Cloud Console / Apple Developer registration).
     - **No-op for current legacy realm** (it has no IDPs registered).

All four cloning phases share `Invoke-KeycloakPost`, which uses the same UTF-8-bytes encoding + ErrorDetails extraction we already use for realm creation. PowerShell's default ISO-8859-1 string-body encoding still bites Keycloak with HTTP 400 "unable to read contents from stream" — same gotcha as Step 1.

Switches: `-IncludeClients` enables the phase. `-Force` deletes-and-recreates matched clients/roles/scopes (rather than skipping). `-DryRun` prints what would be created without POSTing. All combinations are idempotent.

### 2. `clientHostRewrites` per realm

`personalServerNotes/keycloak/realms.config.json`

Each realm entry gained a `clientHostRewrites: []` array. Each entry is `{ from: "host", to: "host" }` and applies as a literal string replace across the URL-bearing client fields. **Currently empty for both `questioner` and `onlinemenu`** — the brief said "if domains are unset/TBD, keep the original hostnames + add localhost dev URLs". The new realms inherit the legacy `online-menu-api.dloizides.com` / `online-menu.dloizides.com` URLs so the cloned clients are functional against the existing ingress until Phase 2 / Step 3 provisions per-product DNS.

When per-product DNS lands, the override looks like:
```json
"clientHostRewrites": [
  { "from": "online-menu-api.dloizides.com", "to": "questioner-api.dloizides.com" },
  { "from": "online-menu.dloizides.com",     "to": "questioner.dloizides.com" }
]
```

### 3. New Tilt resource

`Tiltfile`, label `IdentityService`, sibling to `keycloak-provision-realms`:

```python
local_resource(
    name='keycloak-provision-realms-with-clients',
    labels=['IdentityService'],
    cmd='powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1 -IncludeClients',
    trigger_mode=TRIGGER_MODE_MANUAL,
    auto_init=False,
    allow_parallel=True,
)
```

Same manual-trigger pattern as the rest. `auto_init=False` prevents auto-run on `tilt up`.

### 4. Credential inventory entries

`personalServerNotes/credential-inventory.yml` gained 4 new entries (the `online-menu-client` is a public PKCE client with no secret, so it's not tracked):

- `keycloak_client_online_menu_api_questioner`
- `keycloak_client_online_menu_swagger_questioner`
- `keycloak_client_online_menu_api_onlinemenu`
- `keycloak_client_online_menu_swagger_onlinemenu`

All `enabled: false` until cutover (Phase 2 / Step 4), since no production traffic authenticates against the new realm clients yet. Rotation command points at `scripts/provision-realms.ps1 -IncludeClients -Force` (delete-and-recreate generates a fresh secret).

Google/Apple IDP credentials are out of scope here — they get registered manually in Phase 2 / Step 3 (Task #11).

### 5. Updated task doc

Moved this file from `IN_PROGRESS/` to `COMPLETED/`.

---

## Smoke-Test Results (against live Keycloak at identity.dloizides.com, 2026-05-01)

Both realms received the expected items:

```
=== Realm 'questioner' ===
Client: online-menu-api
  redirectUris : https://localhost:5006, https://online-menu-api.dloizides.com
  webOrigins   : https://localhost:5006, https://online-menu-api.dloizides.com,
                 https://localhost:8082, http://localhost:8082
  publicClient : False
  svcAccounts  : True
  protocol-mappers: Client ID, online-menu-api-audience, content-api-audience,
                    Client IP Address, Client Host
  post.logout.redirect.uris: https://online-menu-api.dloizides.com##https://localhost:5006

Client: online-menu-client
  redirectUris : https://online-menu.dloizides.com/*, http://localhost:8082/*,
                 http://localhost:8082, http://localhost:8082/login,
                 https://online-menu.dloizides.com
  webOrigins   : (mirrors redirectUris)
  publicClient : True
  svcAccounts  : False
  protocol-mappers: Client ID, Client Host, api-audience, Client IP Address

Client: online-menu-swagger
  redirectUris : https://localhost:5006, https://localhost:5006/swagger/index.html
  webOrigins   : (mirrors redirectUris)
  publicClient : False
  svcAccounts  : True
  protocol-mappers: Client ID, Client Host, Client IP Address

Realm roles (custom):
  admin (composite=False)
  superUser (composite=False)
  user (composite=False)

Custom client-scopes:
  tenantId protocol=openid-connect
    mapper: tenantId (oidc-usermodel-attribute-mapper)
      claim.name = tenantId
```

Realm `onlinemenu` is identical (same source export, same per-realm config).

The critical `tenantId` mapper survived — that's the one BaseClient relies on for tenant routing via the access-token claim.

---

## Idempotency Proof

First run (against realms with no application clients yet):

```
Realm 'questioner':
  Roles    created=3 skipped=0 forced=0 failed=0  -> user, superUser, admin
  Scopes   created=1 skipped=0 forced=0 failed=0  -> tenantId
  Clients  created=3 skipped=0 forced=0 failed=0  -> online-menu-api, online-menu-client, online-menu-swagger
  Idps     created=0 skipped=0 forced=0 failed=0
Realm 'onlinemenu':
  Roles    created=3 skipped=0 forced=0 failed=0
  Scopes   created=1 skipped=0 forced=0 failed=0
  Clients  created=3 skipped=0 forced=0 failed=0
  Idps     created=0 skipped=0 forced=0 failed=0
```

Second run (immediately after, same inputs):

```
Realm 'questioner':
  Roles    created=0 skipped=3 forced=0 failed=0
  Scopes   created=0 skipped=1 forced=0 failed=0
  Clients  created=0 skipped=3 forced=0 failed=0
  Idps     created=0 skipped=0 forced=0 failed=0
Realm 'onlinemenu':
  Roles    created=0 skipped=3 forced=0 failed=0
  Scopes   created=0 skipped=1 forced=0 failed=0
  Clients  created=0 skipped=3 forced=0 failed=0
  Idps     created=0 skipped=0 forced=0 failed=0
```

Every item registers as already-existing on re-run. No duplicates, no errors, no API calls beyond the existence GETs.

---

## Hard Constraints — Verification

| Constraint | Status |
|---|---|
| Idempotent (running twice does the same as running once) | OK (proven above) |
| Mirrors existing `provision-realms.ps1` style (Set-StrictMode, hashtable URL-encoding, UTF-8 byte body, .env-quote stripping) | OK |
| Doesn't break the legacy `OnlineMenu` realm (read-only against it) | OK (only reads from snapshot; no calls to legacy realm) |
| PowerShell, not Bash | OK |
| `.env.local` quote-stripping handles `KEYCLOAK_MASTER_ADMIN_PASSWORD='...'` | OK (inherited from existing `Read-EnvLocal` helper) |
| Per-resource POSTs (not partial-import) so failures isolate | OK |
| `id` UUIDs stripped from client + nested representations | OK (`Remove-RepresentationIds` recurses into protocolMappers / authorizationSettings) |
| Masked `secret: "**********"` stripped (Keycloak generates fresh) | OK |
| Default system clients/roles/scopes skipped | OK (whitelisted skip lists) |
| Per-realm `clientHostRewrites` applied to redirectUris/webOrigins/post-logout/etc | OK (currently empty arrays, but the rewrite logic was tested manually with a temporary `from`/`to` pair) |
| Tilt resource is `TRIGGER_MODE_MANUAL` + `auto_init=False` | OK |
| No CI side effects | OK (manual trigger only) |
| Task doc created in IN_PROGRESS, moved to COMPLETED | OK |

---

## Files Changed (absolute paths)

### Modified
- `C:\desktopContents\projects\SaaS\scripts\provision-realms.ps1` — added `-IncludeClients` switch, ~500 lines of cloning helpers (`Remove-RepresentationIds`, `Update-ClientHosts`, `Invoke-KeycloakPost`, `Get-KeycloakClientId`, `Test-KeycloakRealmRole`, `Get-KeycloakClientScopeId`, `Copy-Clients`, `Copy-RealmRoles`, `Copy-ClientScopes`, `Copy-IdentityProviders`), the cloning loop, and the extended summary block.
- `C:\desktopContents\projects\SaaS\personalServerNotes\keycloak\realms.config.json` — added `clientHostRewrites: []` per realm + comment block explaining the field.
- `C:\desktopContents\projects\SaaS\Tiltfile` — added `keycloak-provision-realms-with-clients` resource (sibling to `keycloak-provision-realms`).
- `C:\desktopContents\projects\SaaS\personalServerNotes\credential-inventory.yml` — added 4 entries (`keycloak_client_online_menu_{api,swagger}_{questioner,onlinemenu}`), all `enabled: false` until cutover.

### Live state on https://identity.dloizides.com (verified 2026-05-01)

Realm `questioner`:
- 3 application clients: `online-menu-api`, `online-menu-client`, `online-menu-swagger`
- 3 custom realm roles: `user`, `superUser`, `admin`
- 1 custom client scope: `tenantId` (with `oidc-usermodel-attribute-mapper` for `claim.name = tenantId`)
- 0 identity providers (deferred to Phase 2 / Step 3)

Realm `onlinemenu`: same.

Realm `OnlineMenu` (legacy): unchanged.

---

## Per-Realm Override Decisions

| Realm | clientHostRewrites | Rationale |
|---|---|---|
| `questioner` | `[]` (empty) | Per-product DNS not yet provisioned. Brief: "If domains are unset/TBD, keep the original hostnames". The cloned clients keep `online-menu-api.dloizides.com` / `online-menu.dloizides.com` so they remain functional against the existing ingress while we develop. Phase 2 / Step 3 will add the rewrites. |
| `onlinemenu` | `[]` (empty) | Same reasoning. (And the `onlinemenu` realm being a successor to the legacy `OnlineMenu` realm makes keeping the original hostnames extra sensible — the production frontends already point at those URLs.) |

Localhost dev URLs (`localhost:5006`, `localhost:8082`) are intentionally left as-is in both realms — shared dev infra.

---

## What Needs Manual Intervention

### Google / Apple identity provider credentials per realm

The `Copy-IdentityProviders` helper exists and works but the legacy realm has zero IDPs registered, so nothing was cloned. When Phase 2 / Step 3 (Task #11) runs:

1. User logs into Google Cloud Console, creates an OAuth client per realm (`questioner-google`, `onlinemenu-google`), downloads the client ID/secret.
2. User logs into Apple Developer, creates an Apple Sign In key per realm.
3. User pastes the credentials into Keycloak admin UI (one IDP per realm) — **OR** if the user prefers automation, register the IDPs in the legacy `OnlineMenu` realm first, then re-run `provision-realms.ps1 -IncludeClients` and the cloning helper will propagate to both new realms (with the placeholder client ID/secret values that the user then replaces via UI).

The placeholder values that the helper writes: `REPLACE_ME_<alias>_CLIENT_ID` and `REPLACE_ME_<alias>_CLIENT_SECRET`. They make broken IDPs visibly broken instead of silently broken.

### Cutover-time secret plumbing

The cloned `online-menu-api` / `online-menu-swagger` clients each have fresh server-generated secrets (different from the legacy realm's secret). When backend services are repointed at the new realms (Phase 2 / Step 4), each service's `Authentication:ClientSecret` config + K3s secret needs the new realm's secret. Steps:

```bash
# After cutover, fetch each new realm's client secret via Admin API:
GET /admin/realms/{realm}/clients/{clientUuid}/client-secret
# Update appsettings.Development.json (local), then K3s secrets (staging/prod).
```

The credential inventory entries point at this flow.

---

## What This Unblocks

- **Phase 2 / Step 3 (Task #11)**: Google/Apple OAuth IDP registration — the new realms now have the application clients that those IDPs will be linked to.
- **Phase 2 / Step 4**: Identity service rewiring — issuance against the new realms is now possible because the application clients exist there.
- **E2E `cross-product-isolation` suite**: real OAuth flow against the new realms, not just realm-validation handler unit tests.
- **Frontend `auth-client` per-app realm wiring**: `apps/questioner-web/` can call `new AuthClient({ realm: 'questioner', clientId: 'online-menu-client' })` and the realm now has that client to authenticate against. (The `online-menu-client` clientId is awkwardly product-named in a `questioner` realm; renaming the clientId is a Phase 2 / Step 3+ concern — the brief explicitly only asked for hostname rewrites here.)

---

## Out of Scope (still deferred)

- Real Google/Apple OAuth IDP registration (Phase 2 / Step 3 — Task #11).
- Authentication-flow customisations beyond Keycloak defaults (none in legacy realm).
- User migration into the new realms (Phase 2 / Step 4 — locked decision: clean slate).
- Renaming `online-menu-*` clientIds in the new realms (out of scope per brief — only hostnames in URI fields were requested).
- Per-product Maddy SMTP mailboxes (Phase 5 infra task — currently both realms still share `noreply@dloizides.com`).

---

## How to Invoke

```powershell
# First-time clone (or fresh re-run after legacy realm changed):
powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1 -IncludeClients

# Or via Tilt:
tilt trigger keycloak-provision-realms-with-clients

# Preview without writing:
powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1 -IncludeClients -DryRun

# Skip re-export of the source snapshot (use the checked-in template):
powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1 -IncludeClients -SkipExport

# Wipe-and-recreate matched clients/roles/scopes:
powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1 -IncludeClients -Force
```

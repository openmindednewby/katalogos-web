# Phase 2 / Step 1 - Keycloak Realm Provisioning

## Status: COMPLETED
## Date: 2026-05-01
## Owner: backend-dev (Claude)

---

## Problem Statement

Phase 2 of the product split needs two new Keycloak realms - `questioner`
and `onlinemenu` - alongside the existing shared `OnlineMenu` realm so the
realm-validation handlers shipped in Phase 2 / Step 2 actually have realms to
discriminate against. The realms must be created without clicking through
the Keycloak admin console, and the process must be reproducible (next
environment, replacement disaster-recovery node, future products joining the
portfolio).

---

## What Shipped

### 1. Idempotent provisioning script

`C:\desktopContents\projects\SaaS\scripts\provision-realms.ps1`

PowerShell, mirrors the style and credential-handling conventions of
`scripts/rotate-credentials.ps1`. Handles:

- Auth via Resource Owner Password grant against `admin-cli` in the master
  realm (same path as rotate-credentials.ps1, same hashtable URL-encoding
  fix for special characters).
- `.env.local` parsing with surrounding-quote stripping (the master admin
  password is wrapped in single quotes in the active dev `.env.local` -
  raw rotate-credentials.ps1 parsing would have left the quotes in the
  password and 401'd).
- Source-realm export via `POST /admin/realms/<source>/partial-export`
  (the brief said GET; Keycloak requires POST for this endpoint).
- Snapshot persistence to
  `personalServerNotes/keycloak/realm-templates/OnlineMenu.template.json`
  (~248 KB, checked in for reproducibility).
- Per-realm POST `/admin/realms` with a UTF-8-encoded body (PowerShell's
  default `Invoke-RestMethod` body encoding is ISO-8859-1; Keycloak rejects
  with HTTP 400 "unable to read contents from stream" when that hits its
  JSON parser).
- Verify-after-create.
- Idempotency: GET `/admin/realms/<name>` first; skip if present, recreate
  only with `-Force`.
- Summary block: created / skipped / forced / dry-run / failed lists.

Switches: `-DryRun`, `-Force`, `-SkipExport`, plus parameter overrides for
every credential / URL / config path.

### 2. Per-realm config

`C:\desktopContents\projects\SaaS\personalServerNotes\keycloak\realms.config.json`

JSON (chose over YAML to avoid the `powershell-yaml` module dependency).
Each realm entry:

- `name`, `displayName`, `displayNameHtml`
- `loginTheme`, `emailTheme`
- `smtp` block with `${ENV_VAR}` placeholders resolved at provisioning time
  from the script's environment, then `.env.local`.

To add a future product: append a new entry. Idempotent runs skip
existing realms; pass `-Force` to delete-and-recreate.

### 3. Versioned source-realm snapshot

`C:\desktopContents\projects\SaaS\personalServerNotes\keycloak\realm-templates\OnlineMenu.template.json`

Pretty-printed JSON, ~248 KB. Refreshed on every run (or skipped via
`-SkipExport`). This is the input for the deferred client-import follow-up
(see "Out of scope" below).

### 4. Tilt resource

`Tiltfile`, label `IdentityService`:

```python
local_resource(
    name='keycloak-provision-realms',
    labels=['IdentityService'],
    cmd='powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1',
    trigger_mode=TRIGGER_MODE_MANUAL,
    auto_init=False,
    allow_parallel=True,
)
```

`TRIGGER_MODE_MANUAL` + `auto_init=False` consistent with the
`disk-cleanup`, `docker-prune`, `docker-vhdx-reset` pattern - never auto-runs
on `tilt up`, only fires when the user explicitly clicks the trigger or
runs `tilt trigger keycloak-provision-realms`.

No `resource_deps` because the Keycloak instance is hosted on staging at
`https://identity.dloizides.com` (external to local Tilt) - it has no
local Tilt resource to wait on.

### 5. Credential inventory updated

`personalServerNotes/credential-inventory.yml` gained two entries:

- `keycloak_realm_smtp_questioner`
- `keycloak_realm_smtp_onlinemenu`

Both `enabled: false` for now (credentials currently mirror the shared
`SMTP_PASSWORD` already tracked elsewhere). When per-product Maddy
mailboxes are provisioned, flip `enabled: true` and update the location
field.

---

## Smoke-Test Results (against live Keycloak at identity.dloizides.com)

```
Realm 'questioner'
  enabled              : True
  displayName          : Questioner
  displayNameHtml      : <strong>Questioner</strong>
  loginTheme           : keycloak
  emailTheme           : keycloak
  smtp.from            : noreply@questioner.com
  smtp.fromDisplayName : Questioner
  smtp.host            : mail.dloizides.com
  smtp.port            : 587
  smtp.replyTo         : support@questioner.com
  rememberMe           : True
  resetPasswordAllowed : True
  issuer               : https://identity.dloizides.com/realms/questioner
  clients              : account, account-console, admin-cli, broker,
                         realm-management, security-admin-console

Realm 'onlinemenu'
  enabled              : True
  displayName          : OnlineMenus
  displayNameHtml      : <strong>OnlineMenus</strong>
  loginTheme           : keycloak
  emailTheme           : keycloak
  smtp.from            : noreply@onlinemenus.com
  smtp.fromDisplayName : OnlineMenus
  smtp.host            : mail.dloizides.com
  smtp.port            : 587
  smtp.replyTo         : support@onlinemenus.com
  rememberMe           : True
  resetPasswordAllowed : True
  issuer               : https://identity.dloizides.com/realms/onlinemenu
  clients              : account, account-console, admin-cli, broker,
                         realm-management, security-admin-console
```

- Both realms exist, both reachable via OIDC discovery.
- Issuer claim format matches what the Phase-2/Step-2 realm-validation
  handler expects (`https://<host>/realms/<realm-name>`).
- SMTP per-realm sender domains correctly applied.
- Branding (`displayName`, `displayNameHtml`) correctly applied.
- Default Keycloak system clients auto-provisioned for each realm.
- Idempotency verified: second run prints "Realm 'X' already exists -
  skipping (pass -Force to recreate)" for both.

The existing `OnlineMenu` realm continues to function unchanged.

---

## Implementation Trade-off (read this if you're touching the script)

The brief said clone the entire OnlineMenu realm including all OAuth clients,
role mappings, and claim mappers. **In practice that approach hit Keycloak
HTTP 500 "unknown_error"** even after stripping built-in clients and ids.
The exported representation carries cross-references (client UUIDs embedded
in protocol mapper configs, authenticator-config IDs referenced by flow
steps, scope-mapping links to source-realm clients) that the realm-import
path does not atomically rewrite into a fresh realm.

Per the brief's explicit fallback option (b) - **"build the realm config
from scratch using the existing realm as a reference"** - the script now
builds the POST body from a curated whitelist of scalar/setting fields
copied from the source export plus the per-realm overrides:

- All token lifespans (access, refresh, SSO session, offline session,
  device-code, action-token).
- All login-flow flags (rememberMe, verifyEmail, loginWithEmailAllowed,
  resetPasswordAllowed, registrationAllowed, etc.).
- Brute-force protection settings.
- OTP / WebAuthn policy.
- Authentication-flow names (browserFlow, registrationFlow, etc.).
- Events/admin-events configuration.
- Internationalization settings.
- Browser security headers.
- Realm `attributes` map.
- `passwordPolicy`, `requiredCredentials`.

The full whitelist lives in `$RealmCopyFields` in the script.

OAuth clients, identity providers, claim mappers, composite roles, and
authentication-flow customisations are **deliberately not** carried over
by the script. They are deferred to a follow-up task (see "Out of scope").

---

## How to Add a Future Realm

1. Append an entry to `personalServerNotes/keycloak/realms.config.json`:
   ```json
   {
     "name": "newproduct",
     "displayName": "NewProduct",
     "displayNameHtml": "<strong>NewProduct</strong>",
     "loginTheme": "keycloak",
     "emailTheme": "keycloak",
     "smtp": {
       "from": "noreply@newproduct.com",
       "fromDisplayName": "NewProduct",
       "replyTo": "support@newproduct.com",
       "host": "${SMTP_HOST}",
       "port": "${SMTP_PORT}",
       "ssl": "true",
       "starttls": "false",
       "auth": "true",
       "user": "${SMTP_USERNAME}",
       "password": "${SMTP_PASSWORD}"
     }
   }
   ```
2. `tilt trigger keycloak-provision-realms` (or run
   `powershell -ExecutionPolicy Bypass -File scripts/provision-realms.ps1`).
3. Update `personalServerNotes/credential-inventory.yml` with a new
   `keycloak_realm_smtp_newproduct` entry.
4. Update each backend service that should accept tokens from the new
   realm: add `"newproduct"` to `Authentication:AllowedRealms` in the
   relevant `appsettings.*.json`. Hard-wall services keep their list to
   only their own realm.
5. Register OAuth identity providers (Google/Apple) for the new realm
   manually in the Keycloak admin UI.

---

## Cutover Plan (when do we stop accepting `OnlineMenu` realm tokens)

The current dev/staging configuration accepts tokens from all three realms
(legacy `OnlineMenu` + new `questioner` + new `onlinemenu`) via the
realm-validation handler from Phase 2 / Step 2. That's intentional: it
preserves backward compatibility while the Identity service login flow is
rewired.

Strict ordering for the cutover:

1. **Now (this task)**: New realms exist. Backend already validates
   issuer claims. No cutover needed.
2. **Next task — OAuth client migration**: Manually register Google/Apple
   OAuth identity providers in each new realm (Google Cloud Console,
   Apple Developer portal). Copy client roles and protocol mappers from
   the OnlineMenu realm. Two valid paths:
   - **Path A**: `kc.sh export --realm OnlineMenu --file /tmp/legacy.json`
     inside the Keycloak K3s pod, then a targeted `kc.sh import` of just
     the `clients` block into each new realm. Cleanest, requires shell
     access to the pod.
   - **Path B**: Per-resource Admin API calls — POST each application
     client, role, and mapper individually to each new realm. More
     scriptable; can be added as a follow-up to `provision-realms.ps1` if
     the manual route proves slow.
3. **Identity service rewiring**: Identity service starts issuing tokens
   against the new realm names instead of `OnlineMenu`. The frontend
   `auth-client` (already realm-aware via `AuthClient(realm, clientId)`)
   gets reconfigured per app: `apps/questioner-web/` → `questioner`,
   `apps/onlinemenu-web/` → `onlinemenu`.
4. **Backend allow-list narrowing**: Update each service's
   `appsettings.*.json`:
   - QuestionerService: keep `["questioner"]` only (already prod-correct;
     drop `OnlineMenu` from `appsettings.Development.json`).
   - OnlineMenuService: keep `["onlinemenu"]` only.
   - ContentService, NotificationService, PaymentService, IdentityService:
     keep `["questioner", "onlinemenu"]`. Drop `OnlineMenu` everywhere.
5. **Decommission legacy realm**: After the dev/staging flip lands
   cleanly and ~1 week of green E2E runs, delete the `OnlineMenu` realm
   on the dev Keycloak. Production Keycloak gets the same treatment after
   user migration runs (Phase 2 / Step 4 - clean slate per locked
   decision in the migration plan, so realm deletion is non-destructive).

---

## Hard Constraints — Verification

| Constraint | Status |
|---|---|
| Idempotent (running twice does the same as running once) | OK |
| Versioned source-realm template | OK (`personalServerNotes/keycloak/realm-templates/OnlineMenu.template.json`) |
| No hardcoded credentials | OK (parameter > env var > .env.local; mirrors rotate-credentials.ps1) |
| Doesn't break the existing `OnlineMenu` realm | OK (verified post-run; existing realm still serves its `online-menu-api` client unchanged) |
| PowerShell, not Bash | OK |
| Reads existing scripts first; matches their style | OK (mirrors rotate-credentials.ps1: `Set-StrictMode`, `Set-ErrorActionPreference`, `Write-Step/Ok/Skip/Warn/Fail` helpers, `[CmdletBinding()]` with `param()`) |
| `.env.local` reads handle `#` and special chars | OK (regex anchors on KEY=VALUE; quote-strip pass added because `KEYCLOAK_MASTER_ADMIN_PASSWORD` is wrapped in single quotes in the live file) |
| No magic numbers, no hardcoded URLs | OK (`KEYCLOAK_URL` env var with `http://localhost:8080` default) |

---

## Files Changed (absolute paths)

### New
- `C:\desktopContents\projects\SaaS\scripts\provision-realms.ps1` (676 lines)
- `C:\desktopContents\projects\SaaS\personalServerNotes\keycloak\realms.config.json`
- `C:\desktopContents\projects\SaaS\personalServerNotes\keycloak\realm-templates\OnlineMenu.template.json`
  (export snapshot, 248 KB - regenerated on every run unless `-SkipExport`)

### Modified
- `C:\desktopContents\projects\SaaS\Tiltfile`
  (added `keycloak-provision-realms` resource in the `IdentityService`
  label after `identity-deps-health`)
- `C:\desktopContents\projects\SaaS\personalServerNotes\credential-inventory.yml`
  (added `keycloak_realm_smtp_questioner`, `keycloak_realm_smtp_onlinemenu`
  entries, both `enabled: false` until per-product mailboxes exist)

### Live state on https://identity.dloizides.com (verified 2026-05-01)
- Realm `questioner` created (id `5396c400-ba0e-4d0b-bb92-855aa6d70b14`)
- Realm `onlinemenu` created (id `0804bd2d-3430-483e-98ea-b96d6039a133`)
- Realm `OnlineMenu` (legacy, shared) - unchanged

---

## Out of Scope (deferred to subsequent tasks)

- **OAuth client migration into the new realms** — `online-menu-api`,
  `online-menu-client`, `online-menu-swagger` clients live only in the
  legacy `OnlineMenu` realm. Two paths described in the cutover plan
  (kc.sh export/import inside the pod, or per-resource Admin API).
- **Google / Apple OAuth identity providers** per realm — can't be
  scripted (require registration in Google Cloud Console / Apple
  Developer portal). Brief explicitly excluded these from automation.
- **Custom Keycloak themes** — file-based assets, follow-up task.
  Current realm-level branding (displayName, displayNameHtml, sender
  domain) is enough for the realm wall to be testable.
- **Per-product Maddy SMTP mailboxes** — currently both realms point at
  the shared `noreply@dloizides.com` mailbox. Spinning up
  `noreply@questioner.com` and `noreply@onlinemenus.com` is a Phase-5
  infra task. The credential-inventory entries are seeded with
  `enabled: false` until that work lands.
- **Identity service rewiring to issue tokens against the new realms** —
  the realm-validation handler in Phase-2/Step-2 ALREADY accepts the new
  realms, so no further backend code change is needed for this cutover.
  The Identity service login flow change is the gate.
- **`OnlineMenu` legacy realm decommissioning** — last step in the
  cutover plan. Only after the new realms are fully wired and seeing
  green E2E runs.

---

## What This Unblocks

- Phase 2 / Step 3 — OAuth client migration (kc.sh import, or per-resource
  POSTs against the Admin API).
- Phase 2 / Step 4 — Identity service issuance flow rewire.
- Phase 3 — Frontend `auth-client` per-app realm wiring (already
  realm-aware via `new AuthClient({ realm: 'questioner' })`).
- E2E `cross-product-isolation` suite — once tokens are realm-scoped, the
  cross-realm-rejection regression suite has actual realms to reject
  against.

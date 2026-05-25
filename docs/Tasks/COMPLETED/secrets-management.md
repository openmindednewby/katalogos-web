# Secrets Management - Local Dev Extraction

> **Status**: COMPLETED
> **Priority**: P0 - Critical (Security Blocker)
> **Estimated Scope**: Small (Infrastructure)
> **Completed**: 2026-03-11

---

## 1. Problem

All secrets were hardcoded in `appsettings.json` / `appsettings.Development.json` files and docker-compose environment variables, committed to git. 29 hardcoded secrets across 8 config files.

---

## 2. What Was Done

### 2.1 Created Root `.env.local` (Gitignored)
Single source of truth for all secrets, organized by category:
- Keycloak (server URL, realm, client ID, client secret, admin client secret)
- Database credentials (5 services x user/password/name)
- RabbitMQ credentials
- SeaweedFS S3 storage credentials
- Twilio SMS/OTP credentials
- Kestrel HTTPS cert password

### 2.2 Created `.env.example` (Committed Template)
Mirrors `.env.local` structure with `your-xxx-here` placeholder values.

### 2.3 Updated `.gitignore`
Ignores `.env.local`, `.env.*.local`, `.env.staging`, `.env.production`.

### 2.4 Updated All 5 Docker Compose Files
Each service's `docker-compose.yml` now uses:
- `env_file:` directive → injects vars into containers at runtime
- `${VAR}` substitution → resolves DB names, passwords, Keycloak URLs, etc.

| File | `env_file:` path |
|------|-----------------|
| `IdentityService/docker-compose.yml` | `../.env.local` |
| `QuestionerService/docker-compose.yml` | `../.env.local` |
| `OnlineMenuSaaS/OnlineMenuService/docker-compose.yml` | `../../.env.local` |
| `ContentService/docker-compose.yml` | `../.env.local` |
| `NotificationService/docker-compose.yml` | `../.env.local` |

### 2.5 Updated Tiltfile
Added `env_file='.env.local'` to all 5 `docker_compose()` calls. This passes `--env-file` to Docker Compose for YAML-level `${VAR}` substitution.

### 2.6 Cleaned appsettings.json Files
Replaced 29 hardcoded secrets with empty strings across 8 files:
- `IdentityService/src/IdentityService.API/appsettings.json`
- `IdentityService/src/IdentityService.API/appsettings.Development.json`
- `QuestionerService/Questioner/src/Questioner.Web/appsettings.json`
- `QuestionerService/Questioner/src/Questioner.Web/appsettings.Docker.json`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/appsettings.json`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/appsettings.Docker.json`
- `ContentService/Content/src/Content.Web/appsettings.json`
- `NotificationService/Notification/src/Notification.Web/appsettings.json`

---

## 3. How It Works

```
.env.local (gitignored, real secrets)
    │
    ├── Tiltfile: docker_compose(..., env_file='.env.local')
    │   └── docker compose --env-file .env.local
    │       └── Resolves ${VAR} in docker-compose.yml at parse time
    │
    └── docker-compose.yml: env_file: ../.env.local
        └── Injects all vars into the container at runtime
            └── .NET reads env vars → overrides appsettings.json
```

---

## 4. Verification Checklist

- [x] No secrets in any appsettings.json files
- [x] No secrets in any docker-compose.yml files
- [x] `.env.local` is in `.gitignore`
- [x] `.env.example` committed with placeholder values
- [x] Tiltfile updated with `env_file` parameter
- [ ] Full stack starts correctly with new setup (requires `tilt down` + `tilt up`)

---

## 5. Remaining Secrets in Docs (Separate Task)

These documentation files still reference real credentials:
- `OnlineMenuSaaS/docs/howToSetUpKeyCloak/howToSetUpKeycloak.md`
- `OnlineMenuSaaS/README.md`
- `IdentityService/README.md`

Tracked in: `TODO/security/credential-rotation-git-history.md`

---

## 6. Related Follow-Up Tasks

| Task | Status | File |
|------|--------|------|
| Credential rotation + git history cleanup | TODO | `TODO/security/credential-rotation-git-history.md` |
| Per-environment Tilt builds (dev/staging/prod) | TODO | `TODO/devops/tilt-per-environment-builds.md` |
| Local vault integration | TODO | Future task |

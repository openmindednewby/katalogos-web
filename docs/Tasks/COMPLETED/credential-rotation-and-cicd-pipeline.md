# Credential Rotation & Backend CI/CD Pipeline

> **Status**: COMPLETED
> **Completed**: 2026-03-18
> **Priority**: P0 (CI/CD) + P1 (Credentials)
> **Phase**: 0.1 - Launch Blockers

---

## Summary

Implemented two Phase 0 launch blockers:
1. **Backend CI/CD pipeline** - GitHub Actions workflows for all backend services, frontend, E2E tests, Docker publishing, and NuGet packages
2. **Credential rotation & security cleanup** - Full secret audit, automated rotation script, and pre-commit protections

---

## 1. Backend CI/CD Pipeline (Item #4)

### Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/backend-ci.yml` | CI for 6 backend services (restore, build, lint, test, Docker build). Path-filtered dynamic matrix. |
| `.github/workflows/frontend-ci.yml` | BaseClient CI (lint, unit tests, Expo web build, security audit) |
| `.github/workflows/platform-e2e.yml` | Full-stack E2E - spins up all infrastructure, runs 8 Playwright suites |
| `.github/workflows/docker-publish-platform.yml` | Docker image publishing for all services to ghcr.io |
| `.github/workflows/nuget-packages-ci.yml` | CI for all 18 NuGet packages |
| `.github/dependabot.yml` | Extended with all services, BaseClient, E2ETests, NuGet packages |

### Architecture Decisions

- **Path-filtered triggers** with `dorny/paths-filter@v3` - a PR touching only IdentityService doesn't build all 6 services
- **Gate jobs** (`*-ci-gate`) for branch protection - single required status check per workflow
- **.NET 10.0.x** to match `net10.0` target framework in all csproj files
- **Per-service GHA cache scoping** to prevent cache thrashing
- **Commented-out staging deployment placeholders** ready to wire up

### Next Steps (Wiring Up)

- Set gate jobs as required status checks on `main` branch
- Uncomment `deploy-staging` jobs and configure `staging` GitHub environment
- Add Keycloak container to E2E workflow (currently no auth in CI)
- Create proper `BaseClient/Dockerfile` with nginx config

---

## 2. Credential Rotation & Security Cleanup (Item #5)

### Secret Audit Results

**35 credential findings** across the codebase, classified by severity:

| Severity | Count | Examples |
|----------|-------|---------|
| CRITICAL | 7 | NPM token in publish-all.ps1, Twilio SID/token in .env.local |
| HIGH | 7 | Keycloak config with user passwords, personalServerNotes with WiFi passwords |
| MEDIUM | 9 | Hardcoded DB passwords in appsettings, Grafana admin/admin, server IPs |
| LOW | 12 | Documentation credential references, domain names |

### P0 Security Fixes Applied

| Fix | File(s) |
|-----|---------|
| Removed hardcoded NPM token | `NpmPackages/publish-all.ps1` - reads from `-NpmToken` param / `$env:NPM_TOKEN` / `.env.local` |
| Gitignored sensitive dirs | `.gitignore` - added `personalServerNotes/`, `OnlineMenuSaaS/keyclok config/`, `**/bin/`, `**/obj/` |
| Cleaned .env.example | Replaced real domain, phone number, access key with placeholders |
| Fixed PaymentService appsettings | Removed hardcoded `Password=PaymentDB` |
| Fixed NotificationService appsettings | Emptied hardcoded DB + RabbitMQ passwords |
| Parameterized docker-compose.test.yml | OnlineMenuSaaS uses `${ONLINEMENU_DB_*:-defaults}` |
| Removed server IP | `167.235.51.52` removed from 2 appsettings.Development.json files |
| Redacted Keycloak config | 4 passwords/secrets replaced with `CHANGE_ME_BEFORE_IMPORT` |
| Parameterized Grafana creds | `infrastructure/observability/docker-compose.yml` uses env vars |
| Created gitleaks config | `.gitleaks.toml` with 7 detection rules |

### Automated Credential Rotation Script

**File**: `scripts/rotate-credentials.ps1`

Rotates all credentials in a single run:
- **6 PostgreSQL passwords** - `ALTER USER` via `docker exec` + temp SQL file
- **RabbitMQ** - Management HTTP API on port 5016
- **SeaweedFS S3** - Updates `s3.json` config + `.env.local`
- **Grafana** - Admin API on port 3000
- **Keycloak** - Master realm admin token -> regenerate client secrets for `online-menu-api` and `admin-cli`
- **Twilio** - Creates new API key via REST API (optional)

All new passwords are 24-char cryptographically random, written to `.env.local`.

```powershell
# Preview
.\scripts\rotate-credentials.ps1 -DryRun

# Full rotation (Keycloak requires KEYCLOAK_MASTER_ADMIN_* in .env.local)
.\scripts\rotate-credentials.ps1 -SkipTwilio

# Skip external services
.\scripts\rotate-credentials.ps1 -SkipKeycloak -SkipTwilio
```

**File**: `scripts/setup-github-secrets.ps1`

Reads `.env.local` and pushes all 19 secrets to GitHub Actions via `gh secret set`.

### Credentials Rotated (Verified)

| Credential | Method | Status |
|------------|--------|--------|
| Identity DB password | ALTER USER via docker exec | ROTATED + API verified |
| Questioner DB password | ALTER USER via docker exec | ROTATED + API verified |
| OnlineMenu DB password | ALTER USER via docker exec | ROTATED + API verified |
| Content DB password | ALTER USER via docker exec | ROTATED + API verified |
| Payment DB password | ALTER USER via docker exec | ROTATED + API verified |
| Notification DB password | .env.local updated (container was stopped) | UPDATED |
| Keycloak online-menu-api secret | Admin REST API (master realm) | ROTATED + API verified |
| Keycloak admin-cli secret | Admin REST API (master realm) | ROTATED + API verified |
| RabbitMQ password | .env.local updated (container was stopped) | UPDATED |
| SeaweedFS access/secret keys | s3.json + .env.local updated | UPDATED |
| Grafana admin password | .env.local updated | UPDATED |
| NPM publish token | Old token revoked on npmjs.com, new token in .env.local | ROTATED |

### .env.local New Fields

Added to support the rotation script and CI/CD:
- `KEYCLOAK_MASTER_ADMIN_USER` - Master realm admin username
- `KEYCLOAK_MASTER_ADMIN_PASSWORD` - Master realm admin password
- `GRAFANA_ADMIN_PASSWORD` - Grafana admin password (was hardcoded before)
- `NPM_TOKEN` - NPM publishing token

---

## Findings & Lessons Learned

1. **admin-cli in OnlineMenu realm has no roles** - Cannot manage clients. Must use master realm admin credentials for Keycloak API operations.
2. **PowerShell URL encoding** - `Invoke-RestMethod` with string body doesn't URL-encode special chars. Use hashtable body instead.
3. **PostgreSQL containers use service user as superuser** - No `postgres` role exists. Must connect as the service user (e.g., `identityuser`, `OnlineMenuDB`).
4. **Docker exec + PowerShell `$ErrorActionPreference`** - Docker stderr warnings (like blkio throttle) are treated as terminating errors. Need `SilentlyContinue` wrapper.
5. **Nested shell quoting** - `Process.Arguments` mangles nested quotes. Solution: write SQL to temp file, `docker cp` into container, execute with `psql -f`.

---

## Files Modified/Created

### New Files
- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`
- `.github/workflows/platform-e2e.yml`
- `.github/workflows/docker-publish-platform.yml`
- `.github/workflows/nuget-packages-ci.yml`
- `.gitleaks.toml`
- `scripts/rotate-credentials.ps1`
- `scripts/setup-github-secrets.ps1`
- `OnlineMenuSaaS/keyclok config/README.md`

### Modified Files
- `.gitignore` - Added security entries
- `.env.example` - Replaced real values with placeholders
- `.env.local` - New credential fields + rotated values
- `.github/dependabot.yml` - Extended coverage
- `NpmPackages/publish-all.ps1` - Removed hardcoded token, reads from .env.local
- `PaymentService/src/PaymentService.API/appsettings.json` - Emptied password
- `NotificationService/.../appsettings.Development.json` - Emptied passwords
- `OnlineMenuSaaS/docker-compose.test.yml` - Parameterized credentials
- `OnlineMenuSaaS/keyclok config/Dynalux-keyclokConfiguration.json` - Redacted secrets
- `OnlineMenuSaaS/.../appsettings.Development.json` - Removed server IP
- `QuestionerService/.../appsettings.Development.json` - Removed server IP
- `OnlineMenuSaaS/.../appsettings.Docker.json` - Renamed IpHashSalt
- `infrastructure/observability/docker-compose.yml` - Parameterized Grafana creds
- `ContentService/docker/init-buckets.sh` - Added dev-only disclaimer
- `ContentService/docker/s3.json` - Rotated credentials

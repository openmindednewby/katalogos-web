# Dependency Analysis Integration

> **Reference**: npm audit, dotnet list package, depcheck, license-checker

## Status: COMPLETED

## Problem Statement

We need comprehensive dependency analysis for all services and frontend, checking for security vulnerabilities, outdated packages, deprecated packages, license compliance, unused dependencies, and bundle size. These checks should be per-service (not combined), manual trigger, and run after services start to avoid delays.

## Analysis Categories

| Category | npm Command | NuGet Command | Fails Build |
|----------|-------------|---------------|-------------|
| Security Vulnerabilities | `npm audit --audit-level=high` | `dotnet list package --vulnerable --include-transitive` | Yes |
| Outdated Packages | `npm outdated` | `dotnet list package --outdated` | No (warning) |
| Deprecated Packages | N/A | `dotnet list package --deprecated` | No (warning) |
| License Compliance | `npx license-checker --onlyAllow "MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause"` | Manual/tool | Yes |
| Unused Dependencies | `npx depcheck` | N/A (handled by YAGNI) | No (warning) |
| Bundle Size | `npx bundlesize` | N/A | Yes (if exceeds) |

## Implementation Plan

### Phase 1: Frontend (BaseClient) Setup

#### 1.1 Install Dependencies
```bash
cd BaseClient
npm install -D depcheck bundlesize license-checker
```

#### 1.2 Create Bundle Size Configuration
Create `BaseClient/bundlesize.config.json`:
```json
{
  "files": [
    {
      "path": "dist/**/*.js",
      "maxSize": "500 kB",
      "compression": "gzip"
    },
    {
      "path": "dist/**/*.css",
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ]
}
```

#### 1.3 Add npm Scripts to BaseClient/package.json
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "deps:outdated": "npm outdated || true",
    "deps:unused": "npx depcheck",
    "deps:licenses": "npx license-checker --onlyAllow \"MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause;0BSD;Unlicense;CC0-1.0;CC-BY-3.0;CC-BY-4.0;Python-2.0;BlueOak-1.0.0\"",
    "deps:bundle-size": "npx bundlesize",
    "deps:health": "npm run deps:outdated && npm run deps:unused",
    "deps:all": "npm run security:audit && npm run deps:health && npm run deps:licenses"
  }
}
```

#### 1.4 Add to BaseClient/.gitignore
```
# Dependency analysis
.bundlesize/
```

### Phase 2: NpmPackages Setup

#### 2.1 Add Scripts to NpmPackages/packages/utils/package.json
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "deps:outdated": "npm outdated || true",
    "deps:unused": "npx depcheck",
    "deps:licenses": "npx license-checker --onlyAllow \"MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause;0BSD;Unlicense;CC0-1.0\"",
    "deps:health": "npm run deps:outdated && npm run deps:unused"
  }
}
```

#### 2.2 Add Scripts to NpmPackages/packages/notification-client/package.json
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "deps:outdated": "npm outdated || true",
    "deps:unused": "npx depcheck",
    "deps:licenses": "npx license-checker --onlyAllow \"MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause;0BSD;Unlicense;CC0-1.0\"",
    "deps:health": "npm run deps:outdated && npm run deps:unused"
  }
}
```

### Phase 3: Tiltfile Updates (Per-Service Pattern)

#### Frontend Section Addition
Add after `frontend` resource:
```python
# --- Frontend Security Audit (manual, after frontend starts) ---
local_resource(
    name='frontend-security-audit',
    labels=['Frontend'],
    cmd='npm run security:audit',
    dir='BaseClient',
    resource_deps=['frontend'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Frontend Dependency Health (manual) ---
local_resource(
    name='frontend-deps-health',
    labels=['Frontend'],
    cmd='npm run deps:health',
    dir='BaseClient',
    resource_deps=['frontend'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Frontend License Compliance (manual) ---
local_resource(
    name='frontend-license-check',
    labels=['Frontend'],
    cmd='npm run deps:licenses',
    dir='BaseClient',
    resource_deps=['frontend'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Frontend Bundle Size (manual) ---
local_resource(
    name='frontend-bundle-size',
    labels=['Frontend'],
    cmd='npm run deps:bundle-size',
    dir='BaseClient',
    resource_deps=['frontend'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### Identity Service Section Addition
Add after `identity-api` resource:
```python
# --- Identity Security Audit (manual, after API starts) ---
local_resource(
    name='identity-security-audit',
    labels=['IdentityService'],
    cmd='dotnet list package --vulnerable --include-transitive',
    dir='IdentityService',
    resource_deps=['identity-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Identity Dependency Health (manual) ---
local_resource(
    name='identity-deps-health',
    labels=['IdentityService'],
    cmd='dotnet list package --outdated && dotnet list package --deprecated',
    dir='IdentityService',
    resource_deps=['identity-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### Questioner Service Section Addition
Add after `questioner-api` resource:
```python
# --- Questioner Security Audit (manual, after API starts) ---
local_resource(
    name='questioner-security-audit',
    labels=['QuestionerService'],
    cmd='dotnet list package --vulnerable --include-transitive',
    dir='QuestionerService/Questioner',
    resource_deps=['questioner-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Questioner Dependency Health (manual) ---
local_resource(
    name='questioner-deps-health',
    labels=['QuestionerService'],
    cmd='dotnet list package --outdated && dotnet list package --deprecated',
    dir='QuestionerService/Questioner',
    resource_deps=['questioner-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### OnlineMenu Service Section Addition
Add after `onlinemenu-api` resource:
```python
# --- OnlineMenu Security Audit (manual, after API starts) ---
local_resource(
    name='onlinemenu-security-audit',
    labels=['OnlineMenuService'],
    cmd='dotnet list package --vulnerable --include-transitive',
    dir='OnlineMenuSaaS/OnlineMenuService/OnlineMenu',
    resource_deps=['onlinemenu-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- OnlineMenu Dependency Health (manual) ---
local_resource(
    name='onlinemenu-deps-health',
    labels=['OnlineMenuService'],
    cmd='dotnet list package --outdated && dotnet list package --deprecated',
    dir='OnlineMenuSaaS/OnlineMenuService/OnlineMenu',
    resource_deps=['onlinemenu-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### Content Service Section Addition
Add after `content-api` resource:
```python
# --- Content Security Audit (manual, after API starts) ---
local_resource(
    name='content-security-audit',
    labels=['ContentService'],
    cmd='dotnet list package --vulnerable --include-transitive',
    dir='ContentService',
    resource_deps=['content-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Content Dependency Health (manual) ---
local_resource(
    name='content-deps-health',
    labels=['ContentService'],
    cmd='dotnet list package --outdated && dotnet list package --deprecated',
    dir='ContentService',
    resource_deps=['content-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### Notification Service Section Addition
Add after `notification-api` resource:
```python
# --- Notification Security Audit (manual, after API starts) ---
local_resource(
    name='notification-security-audit',
    labels=['NotificationService'],
    cmd='dotnet list package --vulnerable --include-transitive',
    dir='NotificationService/Notification',
    resource_deps=['notification-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Notification Dependency Health (manual) ---
local_resource(
    name='notification-deps-health',
    labels=['NotificationService'],
    cmd='dotnet list package --outdated && dotnet list package --deprecated',
    dir='NotificationService/Notification',
    resource_deps=['notification-api'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

#### NpmPackages Section Addition
Add after existing npm package resources:
```python
# --- NPM Utils Security Audit (manual) ---
local_resource(
    name='npm-utils-security-audit',
    labels=['NpmPackages'],
    cmd='npm run security:audit',
    dir='NpmPackages/packages/utils',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- NPM Utils Dependency Health (manual) ---
local_resource(
    name='npm-utils-deps-health',
    labels=['NpmPackages'],
    cmd='npm run deps:health',
    dir='NpmPackages/packages/utils',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- NPM Notification Client Security Audit (manual) ---
local_resource(
    name='npm-notification-client-security-audit',
    labels=['NpmPackages'],
    cmd='npm run security:audit',
    dir='NpmPackages/packages/notification-client',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- NPM Notification Client Dependency Health (manual) ---
local_resource(
    name='npm-notification-client-deps-health',
    labels=['NpmPackages'],
    cmd='npm run deps:health',
    dir='NpmPackages/packages/notification-client',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
```

### Phase 4: Documentation Updates

#### Update CLAUDE.md
Add new section for dependency analysis commands and update quality gate documentation.

## Files to Modify

| File | Changes |
|------|---------|
| `BaseClient/package.json` | Add depcheck, bundlesize, license-checker; add scripts |
| `BaseClient/bundlesize.config.json` | Create bundle size configuration |
| `BaseClient/.gitignore` | Add .bundlesize/ |
| `NpmPackages/packages/utils/package.json` | Add security/deps scripts |
| `NpmPackages/packages/notification-client/package.json` | Add security/deps scripts |
| `Tiltfile` | Add per-service dependency analysis resources |
| `OnlineMenuSaaS/TIltfileBackup/Tiltfile` | Mirror all Tiltfile changes |
| `CLAUDE.md` | Document dependency analysis commands |

## Success Criteria

- [ ] Frontend has security:audit, deps:outdated, deps:unused, deps:licenses, deps:bundle-size scripts
- [ ] NpmPackages have security and deps scripts
- [ ] Each backend service has security-audit and deps-health Tilt resources
- [ ] Frontend has 4 Tilt resources: security-audit, deps-health, license-check, bundle-size
- [ ] All resources are manual trigger and depend on their service being started
- [ ] Both Tiltfiles are identical
- [ ] CLAUDE.md documents all new commands
- [ ] Agents can run: `cd BaseClient && npm run security:audit`
- [ ] Agents can run: `cd BaseClient && npm run deps:licenses`

## Allowed Licenses

The following licenses are allowed for npm packages:
- MIT
- Apache-2.0
- ISC
- BSD-2-Clause
- BSD-3-Clause
- 0BSD
- Unlicense
- CC0-1.0
- CC-BY-3.0
- CC-BY-4.0
- Python-2.0
- BlueOak-1.0.0

## Agent Usage After Implementation

```bash
# Frontend
cd BaseClient && npm run security:audit      # Security vulnerabilities
cd BaseClient && npm run deps:health         # Outdated + unused
cd BaseClient && npm run deps:licenses       # License compliance
cd BaseClient && npm run deps:bundle-size    # Bundle size check

# Backend (any service)
cd IdentityService && dotnet list package --vulnerable --include-transitive
cd IdentityService && dotnet list package --outdated
cd IdentityService && dotnet list package --deprecated
```

## Changes Made

1. **Installed frontend dependencies**: `depcheck` and `license-checker` (bundlesize skipped due to native dependency build issues on Windows without Visual Studio build tools)

2. **Created `BaseClient/bundlesize.config.json`**: Bundle size configuration for future use when bundlesize is installed

3. **Updated `BaseClient/package.json`**: Added 7 new scripts:
   - `security:audit` - npm security vulnerabilities
   - `deps:outdated` - List outdated packages
   - `deps:unused` - Find unused dependencies with depcheck
   - `deps:licenses` - License compliance check
   - `deps:bundle-size` - Bundle size check (requires bundlesize)
   - `deps:health` - Combined outdated + unused check
   - `deps:all` - All dependency checks

4. **Updated `BaseClient/.gitignore`**: Added `.bundlesize/` directory

5. **Updated `NpmPackages/packages/utils/package.json`**: Added 5 security/deps scripts

6. **Updated `NpmPackages/packages/notification-client/package.json`**: Added 5 security/deps scripts

7. **Updated `Tiltfile`**: Added 18 new manual-trigger resources:
   - 2 for IdentityService (security-audit, deps-health)
   - 2 for QuestionerService (security-audit, deps-health)
   - 2 for OnlineMenuService (security-audit, deps-health)
   - 2 for ContentService (security-audit, deps-health)
   - 2 for NotificationService (security-audit, deps-health)
   - 4 for NpmPackages (utils and notification-client security + deps)
   - 4 for Frontend (security-audit, deps-health, license-check, bundle-size)

8. **Copied Tiltfile to backup**: Both Tiltfiles are now identical

9. **Updated `CLAUDE.md`**: Added comprehensive Dependency Analysis section with:
   - Frontend command reference table
   - Backend command reference table
   - List of all Tilt resources
   - Allowed licenses list

## Test Results

- All file modifications completed successfully
- depcheck and license-checker installed in BaseClient (70 packages added)
- Tiltfile copied to backup location

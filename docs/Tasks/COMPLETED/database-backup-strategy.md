# Database Backup Strategy

> **Status**: COMPLETED
> **Started**: 2026-03-12
> **Completed**: 2026-03-12
> **Priority**: P0 - Critical (Data Loss Risk)
> **Scope**: Infrastructure

---

## Decision Log

- **Backup format**: PostgreSQL custom format (`pg_dump -Fc -Z 6`) - compressed, supports selective restore
- **Architecture**: `platform-ops` Docker container with crond for scheduled infrastructure tasks
- **Scheduling**: Cron inside container - every 6 hours (00:00, 06:00, 12:00, 18:00)
- **Observability**: Backup results pushed to Loki via HTTP API + Grafana alert on failures
- **Retention**: 5 most recent backups per database
- **Backup storage**: Docker named volume (`platform_ops_backups`)
- **Business logic jobs** (e.g., payment subscription checks): NOT in platform-ops; use `IHostedService` inside the owning service
- **Email notifications**: Deferred - needs separate email server architecture decision
- **Alert channel**: Grafana UI only for now

---

## Phase 1: Local Backup Scripts (DONE)

- [x] Created `scripts/backup-databases.ps1` - pg_dump all 5 databases via `docker exec`
- [x] Created `scripts/restore-database.ps1` - restore from backup with drop/recreate
- [x] Created `backup-databases.bat` and `restore-database.bat` wrappers
- [x] Added `backup-databases` Tilt resource (manual trigger, depends on all 5 DB containers)
- [x] Added `backups/` to `.gitignore`
- [x] Tested: All 5 databases backed up successfully (host-side)

## Phase 2: Platform-Ops Container (DONE)

- [x] Created `infrastructure/platform-ops/Dockerfile` (based on `postgres:16-alpine` + curl)
- [x] Created `infrastructure/platform-ops/docker-compose.yml` (128m/0.25cpu, saas-network)
- [x] Created `infrastructure/platform-ops/scripts/backup-databases.sh` (pg_dump + Loki push)
- [x] Created `infrastructure/platform-ops/scripts/restore-database.sh` (drop/recreate + pg_restore)
- [x] Created `infrastructure/platform-ops/crontab` (every 6h schedule)
- [x] Added `platform-ops` Tilt resource (manual trigger, depends on all 5 DBs + Loki)
- [x] Fixed CRLF line endings in Dockerfile (sed -i 's/\r$//')
- [x] Added `identity-db` and `notification-db` to `saas-network` (were isolated on local bridge networks)
- [x] Tested: All 5/5 databases backed up successfully from container
- [x] Verified: Backup logs visible in Loki (`{ServiceName="platform-ops", job="database-backup"}`)
- [x] Verified: Cron schedule loaded correctly inside container

## Phase 3: Monitoring (DONE)

- [x] Backup results pushed to Loki via HTTP API (structured labels: ServiceName, job, Level)
- [x] Added Grafana alert rule `backup-failure` (triggers on any Error log with "FAILED" in last 10m)
- [x] Restarted Grafana to load new alert rule

---

## Files Created

### Platform-Ops Container
- `infrastructure/platform-ops/Dockerfile`
- `infrastructure/platform-ops/docker-compose.yml`
- `infrastructure/platform-ops/crontab`
- `infrastructure/platform-ops/scripts/backup-databases.sh`
- `infrastructure/platform-ops/scripts/restore-database.sh`

### Local Backup Scripts (host-side, manual use)
- `scripts/backup-databases.ps1`
- `scripts/restore-database.ps1`
- `backup-databases.bat`
- `restore-database.bat`

## Files Modified
- `.gitignore` - Added `backups/`
- `Tiltfile` - Added `backup-databases` + `platform-ops` resources
- `IdentityService/docker-compose.yml` - Added `identity-db` to `saas-network`
- `NotificationService/docker-compose.yml` - Added `notification-db` to `saas-network`
- `infrastructure/observability/provisioning/alerting/alerts.yaml` - Added `backup-failure` alert rule

---

## Usage

### Automated (container cron)
Runs automatically every 6 hours when the `platform-ops` container is running.
Logs visible in Grafana: `{ServiceName="platform-ops", job="database-backup"}`

### Manual (host-side scripts)
```
# Via Tilt
tilt trigger backup-databases

# Via PowerShell
.\scripts\backup-databases.ps1                    # All databases
.\scripts\backup-databases.ps1 -Filter identity   # Single database
.\scripts\backup-databases.ps1 -List              # List existing backups

# Restore
.\scripts\restore-database.ps1 -Database identity                     # Latest backup
.\scripts\restore-database.ps1 -Database identity -Timestamp 20260312_143000
.\scripts\restore-database.ps1 -List
```

### Manual (inside container)
```
docker exec saas-platform-ops /scripts/backup-databases.sh
docker exec saas-platform-ops /scripts/backup-databases.sh identity
docker exec saas-platform-ops /scripts/restore-database.sh identity
docker exec saas-platform-ops /scripts/restore-database.sh --list
```

---

## Remaining TODO

- [ ] Cloud storage upload (Azure Blob / AWS S3) - requires cloud provider decision
- [ ] WAL archiving for point-in-time recovery - production only
- [ ] SeaweedFS backup (content files/images)
- [ ] Weekly automated restore test
- [ ] Email notification channel for alerts - requires email server architecture

---

## Verification

- [x] All 5 databases backed up on demand (host-side)
- [x] All 5 databases backed up from container
- [x] Automated schedule running (cron every 6h)
- [x] Backup logs visible in Loki
- [x] Grafana alert rule for backup failures
- [ ] Restore tested successfully for each database
- [ ] Cloud storage with retention policy
- [ ] SeaweedFS data backed up

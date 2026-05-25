# Database Backup Strategy

> **Status**: TODO
> **Priority**: P0 - Critical (Data Loss Risk)
> **Estimated Scope**: Medium (Infrastructure)
> **Estimated Effort**: 1 week

---

## 1. Problem

5 PostgreSQL databases with zero backup automation. Data persistence relies solely on Docker named volumes. One disk failure, accidental deletion, or corrupted migration = total, unrecoverable data loss.

---

## 2. Databases to Back Up

| Database | Docker Volume | Port | Data Criticality |
|----------|--------------|------|-----------------|
| IdentityServiceDb | identity_db_data | 5434 | Critical (users, tenants, auth) |
| OnlineMenuDB | onlinemenu_db_data | 5432 | High (menus, categories, items) |
| QuestionerDB | questioner_db_data | 5433 | High (templates, responses) |
| ContentDB | content_db_data | 5435 | Medium (metadata only, files in SeaweedFS) |
| NotificationDB | notification_db_data | 5436 | Medium (notification history) |

Additionally:
- **SeaweedFS volumes** — file/image/video data (content-public, content-private, content-staging)

---

## 3. Backup Strategy

### 3.1 Local Development

- Docker volume snapshots via `docker run --rm -v volume:/data -v ./backups:/backup alpine tar czf /backup/db.tar.gz /data`
- Manual trigger via Tilt resource or script
- Keep last 3 backups

### 3.2 Production

- **pg_dump** scheduled via cron (every 6 hours)
- Compressed with gzip, encrypted with GPG
- Upload to cloud storage (Azure Blob / AWS S3)
- Retention policy: 7 daily, 4 weekly, 12 monthly
- Point-in-time recovery via WAL archiving (PostgreSQL)

### 3.3 SeaweedFS Backup

- SeaweedFS built-in `weed backup` command
- Or sync S3 bucket to cloud storage via `aws s3 sync`
- Daily incremental backups

---

## 4. Implementation Steps

### Phase 1: Local Backup Script (1-2 days)

1. Create `scripts/backup-databases.sh` that pg_dumps all 5 databases
2. Create `scripts/restore-database.sh` for restore from backup
3. Add `backup` Tilt resource (manual trigger) to Tiltfile
4. Store backups in `./backups/` (gitignored)

### Phase 2: Production Backup Pipeline (3-4 days)

1. Create backup Docker container with pg_dump + cloud CLI
2. Configure cron schedule (0 */6 * * *)
3. Set up cloud storage bucket with lifecycle rules (retention)
4. Add WAL archiving configuration to PostgreSQL containers
5. Create restore runbook with step-by-step instructions
6. Test restore procedure on a separate database instance

### Phase 3: Monitoring (1 day)

1. Add Grafana alert for backup job failures
2. Log backup size and duration to Loki
3. Weekly automated restore test (verify backup integrity)

---

## 5. Verification

- [ ] All 5 databases backed up on schedule
- [ ] Restore tested successfully for each database
- [ ] Backups stored in cloud storage with retention policy
- [ ] Alerting on backup failures
- [ ] Restore runbook documented and tested
- [ ] SeaweedFS data backed up

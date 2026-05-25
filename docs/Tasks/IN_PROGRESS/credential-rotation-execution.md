# Credential Rotation Execution — Open Plan

**Status:** Pre-flight done. Execution PENDING.
**Last updated:** 2026-05-01

This task tracks the rotation of credentials flagged by the new monitoring system. The infrastructure (inventory, status checks, email cron, Tilt indicators, rotation wrappers) is **complete and verified**. What remains is actually rotating the things.

## Where we are

| Phase | Status |
|-------|--------|
| Build credential inventory + monitoring | ✅ Done — see `BaseClient/docs/Tasks/COMPLETED/credential-rotation-system.md` |
| Build dev-PC disaster recovery + age-encrypted backups | ✅ Done — see `BaseClient/docs/Tasks/COMPLETED/dev-pc-disaster-recovery.md` |
| Build per-credential rotation wrappers | ✅ Done — `personalServerNotes/scripts/rotate-*.ps1` |
| Audit `scripts/rotate-credentials.ps1` for the bundle rotation | ✅ Done — findings in `personalServerNotes/docs/rotate-credentials-prep.md` |
| Take pre-rotation DB snapshots | ✅ Done — `backups/pre-rotation-20260501-1558/*.sql` (6 files, ~77 KB) |
| Execute the SAFE rotation set (age, github_pat, npm_token) | ⏸ Pending — user has not asked to run yet |
| Execute the BUNDLE rotation (DBs, RabbitMQ, SeaweedFS, Grafana, Keycloak) | ⏸ Pending — script needs patches first (see Blockers) |
| Execute the K3s production secret rotation | ⏸ Pending — separate procedure, not what `rotate-credentials.ps1` does |

## Status snapshot (current)

```
[credential-rotation] 2026-05-01 — 15 OVERDUE, 13 WARN, 6 DISABLED

OVERDUE (15):
  [HIGH]          db_identity, db_questioner, db_onlinemenu, db_content,
                  db_notification, db_payment
  [CATASTROPHIC]  db_shared_superuser
  [HIGH]          rabbitmq           — currently 'guest/guest' (default!)
  [HIGH]          seaweedfs
  [MEDIUM]        grafana_admin
  [CATASTROPHIC]  keycloak_master_admin
  [HIGH]          keycloak_client_secret
  [HIGH]          keycloak_admin_client_secret
  [HIGH]          npm_token
  [CATASTROPHIC]  github_pat

WARN (13):
  Mail accounts × 4 (Maddy)
  [MEDIUM]              mail_snappymail_admin
  [CATASTROPHIC]        docker_registry_jim    — keep as 'jim/jim' per user
  [MEDIUM]              twilio_auth_token
  [MEDIUM]              amazon_client_secret
  [HIGH]                nuget_api_key
  [CATASTROPHIC]        ssh_id_ed25519
  [LOW]                 gpg_keyring
  [HIGH]                wireguard_hub
  [HIGH]                wireguard_staging_peer

DISABLED (6) — muted, see footer in email/Tilt output:
  stripe_secret, stripe_webhook_secret           (placeholders, not real keys)
  pagerduty_integration_key, slack_alerting_webhook (placeholders, not wired up)
  kp_admob_app_id                                 (AdMob IDs not really rotatable)
  kp_upload_keystore                              (Play App Signing — never rotate)
```

The toggle script `personalServerNotes/scripts/toggle-credential-monitoring.ps1` is what flipped the 6 muted entries; the WARN count dropped 19 → 13 as a result.

## User direction (2026-05-01)

- ✅ Keep staging laptop SSH/sudo creds as `jim`/`jim`. Don't rotate.
- ✅ Keep Docker registry htpasswd as `jim`/`jim`. Don't rotate `docker_registry_jim`.
- ✅ Don't run any rollout yet. Pre-flight only.
- ✅ Document state for next session (this file + memory entries).

## Blockers — must fix before bundle rotation runs

### B1. Container names in `rotate-credentials.ps1` are stale

The script targets `IdentityServiceDB`, `QuestionerDB`, `OnlineMenuDB`, `ContentDB`, `NotificationDB`, `PaymentServiceDB` — six separate containers from a previous setup. **Today there's only `SharedDB`** with all 6 logical databases inside.

If you run today, all 6 DB rotations silently SKIP with `[SKIP] <X> not running`. Same probably true for `NotificationRabbitMQ`, `ContentSeaweedS3`, `saas-grafana`.

**Fix needed before next run**: patch the `$databases` table in `rotate-credentials.ps1` to use `SharedDB` for all 6, and pass `-d <dbname>` to `psql` so it connects to the right logical DB. ~10 lines of changes. Same audit needed for the RabbitMQ / SeaweedFS / Grafana container names.

### B2. Keycloak section hits production

Step 5 in the script calls `$KEYCLOAK_SERVER_URL/admin/realms/$realm/clients/.../client-secret`. `KEYCLOAK_SERVER_URL` in `.env.local` = `https://identity.dloizides.com` = **production Keycloak**.

Running it regenerates `online-menu-api` + `admin-cli` client secrets on production. The new secrets land in `.env.local` but production K3s deployments still have the OLD values, so production APIs start returning 401 until you update the K3s secrets and roll the deployments.

**Always pass `-SkipKeycloak`** unless you've planned the matching K3s deploy (procedure C in `personalServerNotes/docs/rotate-credentials-prep.md`).

### B3. Tilt was not running during pre-flight

DB containers weren't up, so even a "successful" run today would no-op. Bring up Tilt before the next attempt.

## Recommended next session — SAFE rotations only

Three rotations that don't need a maintenance window and don't touch production data:

1. **`personalServerNotes/scripts/rotate-age-key.ps1`** — removes the harness-log compromise on the master backup key generated 2026-05-01. ~5 min.
   - Generates a fresh keypair (you save the new private key).
   - Forces a new backup with the new key.
   - Old `.zip.age` files become unreadable to the new key but age out in 30 days; keep the old key in password manager for that month.

2. **`personalServerNotes/scripts/rotate-github-pat.ps1`** — opens browser, paste new PAT, runs `gh auth login --with-token`. ~3 min.

3. **`personalServerNotes/scripts/rotate-npm-token.ps1`** — paste new NPM token, updates `.env.local` + GH secret. ~3 min.

After these three, the inventory will show:
- `age_master_key`, `github_pat`, `npm_token`: OK (next due in 90/365 days).
- Everything else: same status as today.

## When the bundle rotation IS planned — checklist

The big bundle (6 DBs + RabbitMQ + SeaweedFS + Grafana + Keycloak) needs:

1. Apply patches to `rotate-credentials.ps1` to handle SharedDB consolidation. (~10 min dev work.)
2. Bring Tilt up, verify all target containers are running.
3. Take fresh DB snapshots (`pg_dumpall`).
4. Pick a low-traffic window — Saturday 04:00–06:00 UTC ideal.
5. Open the multi-terminal layout from `personalServerNotes/docs/rotate-credentials-prep.md`.
6. Run `.\scripts\rotate-credentials.ps1 -SkipKeycloak -SkipTwilio -DryRun` first.
7. If clean, run for real with `-SkipKeycloak -SkipTwilio`.
8. Restart all API containers via Tilt.
9. Update inventory: edit each rotated entry's `last_rotated:` to today's date, commit, push.
10. Watch Grafana for 30 min for any error spike.

The K3s production secret rotation (procedure B in the prep doc) is a SEPARATE session, run only when production-side rotation is actually needed. The script doesn't touch K3s at all.

## Pointer to docs

- `personalServerNotes/docs/credential-rotation-runbook.md` — overall system
- `personalServerNotes/docs/rotate-credentials-prep.md` — pre-flight runbook with cheat sheet
- `personalServerNotes/credential-inventory.yml` — what's tracked
- `BaseClient/docs/Tasks/COMPLETED/credential-rotation-system.md` — what was built
- `BaseClient/docs/Tasks/COMPLETED/dev-pc-disaster-recovery.md` — sister system
- `.claude/skills/credential-rotation/SKILL.md` — agent fast lookup
- `.claude/skills/email-systems/SKILL.md` — sister skill (mail server, daily report, this report)

## When to move this doc to COMPLETED

Move to `COMPLETED/credential-rotation-execution.md` when:
- All OVERDUE credentials in the inventory have `last_rotated` set to a real date.
- The script's container-name staleness is fixed (or replaced with the per-credential wrappers).
- A "first real bundle rotation" date is recorded here.

Until then, this document is the bookmark for the next session.

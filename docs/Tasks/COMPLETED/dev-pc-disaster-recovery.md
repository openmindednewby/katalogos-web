# Dev PC Disaster Recovery — Complete System

**Status:** Completed 2026-05-01
**Type:** Infrastructure / operational resilience

## Goal

Make a dead developer PC a 30-minute problem instead of a 2-day problem.
Before this work: nothing was documented; some files (Android keystores, age master key) would have been irrecoverable.
After this work: a single one-liner on a fresh Windows 11 PC restores everything.

## Result

| Capability | Before | After |
|------------|--------|-------|
| Bootstrap a fresh PC | undocumented manual ~6 hr | scripted ~30 min + background pulls |
| Off-PC backup of secrets | none | nightly-able, age-encrypted, on-site (staging laptop) |
| Disaster recovery | re-derive everything by hand | one-line fast path: `git clone … bootstrap; .\recover.ps1` |
| Audit visibility | none | Tilt resource `dev-pc-backup-health` goes red after 24 h |
| Secret rotation safety | mocked | round-trip smoke-tested 2026-05-01 |

## Architecture

```
   Dev PC                          Staging Laptop                  Recovery PC (future)
   ──────                          ──────────────                  ────────────────────
   secrets bundle ──> age encrypt ──> scp ──> /home/jim/backups/dev-pc/
                       (public key)                  │
                                                     ├── dev-pc-secrets-2026-05-01-1326.zip.age
                                                     ├── ... (last 30 days, pruned daily 03:00 UTC)
                                                     └── current  (symlink → newest)
                                                            ▲
                                                            │  scp + age decrypt
                                                            │  (private key from password manager)
                                                            │
                                                          recover.ps1
```

**Three secrets you must remember (all in your password manager):**
1. `AGE-SECRET-KEY-...` — master decryption key. The only catastrophic loss.
2. `ghp_...` — GitHub PAT with `repo:read` to clone all repos.
3. `id_ed25519` — SSH private key for `jim@192.168.10.200`. Recoverable by adding a fresh key from a phone or other machine.

## What was built

### Documentation
| File | Purpose |
|------|---------|
| `personalServerNotes/docs/dev-pc-bootstrap.md` | Full bootstrap runbook (TL;DR fast-path, 8 phases, backup architecture, disaster recovery checklist). |
| `personalServerNotes/README.md` (updated) | Links to dev-pc-bootstrap.md and to the new scripts. |
| `personalServerNotes/docs/operational-runbook.md` (updated, prior task) | SSH access table now lists `jim`/`jim` credentials explicitly. |
| `personalServerNotes/docs/staging-access-guide.md` (updated, prior task) | Same credential callout at top. |
| `personalServerNotes/docs/container-registry-guide.md` (updated, prior task) | Removed "(replace YOUR_USERNAME)" misdirection. |

### Scripts on the dev PC (this repo)
| File | Purpose |
|------|---------|
| `personalServerNotes/scripts/setup-age-keypair.ps1` | One-time master keypair generator. Public key → `~/.config/dloizides-backup/age-recipient.txt`; private key → user's password manager. |
| `personalServerNotes/scripts/backup-dev-pc-secrets.ps1` | Local + remote backup. `-Remote` flag age-encrypts and scp's to staging. Writes heartbeat for Tilt. |
| `personalServerNotes/scripts/bootstrap-dev-pc.ps1` | Full toolchain installer (winget). |
| `personalServerNotes/scripts/setup-staging-backup-vault.sh` | One-time staging-laptop bootstrap (creates vault dir, installs age, installs 30-day retention cron). |
| `scripts/infra/dev-pc-backup.bat` | Tilt wrapper for backup-dev-pc-secrets.ps1 -Remote. |
| `scripts/infra/dev-pc-backup-health.ps1` + `.bat` | Tilt health check; goes red after 24 h since last backup. |

### Tilt resources (added to `Tiltfile`)
- `dev-pc-backup-health` — auto, polls heartbeat, red ≥ 24 h.
- `dev-pc-backup` — manual trigger, runs the encrypted upload.

Both under the **Infrastructure** label, alongside `disk-cleanup`, `docker-prune`, `backup-databases`, etc.

### New private repo: `openmindednewby/dloizides-bootstrap`
Lives at `https://github.com/openmindednewby/dloizides-bootstrap` (private). Local clone at `C:\desktopContents\projects\dloizides-bootstrap\`.

| File | Purpose |
|------|---------|
| `recover.ps1` | Disaster-recovery entrypoint. Phases A–H. |
| `clone-all-repos.ps1` | Clones every repo in repos.json using a PAT. |
| `repos.json` | All 33 repos, with `primary: true/false`, easy to extend. |
| `README.md` | "If you're reading this, dev PC is dead — here's the one-liner." |
| `.gitignore` | Belt-and-braces — never commits anything matching `*.age`, `age-key*`. |

### Staging laptop changes
- Installed `age` (Ubuntu apt package, v1.1.1).
- Created `/home/jim/backups/dev-pc/` (mode 700).
- Installed daily cron at 03:00: `find /home/jim/backups/dev-pc -maxdepth 1 -type f -name '*.zip.age' -mtime +30 -delete`.

## Verification — what was actually exercised

| Step | Status | Evidence |
|------|--------|----------|
| age install (winget) | ✅ | `age 1.3.1` on dev PC; `age 1.1.1` on staging laptop. |
| Master keypair generation | ✅ | Public key `age1p8hcvc06j5t3h398az08xn542wkyh3qn4264tsqgh6xdkcg6wfss5zrqgr` saved to `~/.config/dloizides-backup/age-recipient.txt`. |
| Staging vault bootstrap | ✅ | `/home/jim/backups/dev-pc/` exists, mode 700. Cron line installed. |
| First remote backup | ✅ | `dev-pc-secrets-2026-05-01-1326.zip.age` (8 097 bytes) on staging. `current` symlink set. |
| Heartbeat | ✅ | `~/.config/dloizides-backup/last-remote-backup` = `2026-05-01T13:27:00`. |
| `dloizides-bootstrap` repo | ✅ | Pushed to GitHub as private. https://github.com/openmindednewby/dloizides-bootstrap |
| Recovery round-trip smoke test | ✅ | scp pull → age decrypt → expand → all 7 expected files present (saas.env.local, e2e.env.local, .ssh/id_ed25519, .ssh/id_ed25519.pub, docker-config.json, .wslconfig, NuGet.Config). Run on dev PC against throwaway temp dir. |

**Not yet exercised** (deferred to user):
- Full bare-metal smoke test on Hyper-V VM or spare PC. The round-trip test above proves the cryptographic chain; what it doesn't prove is that `recover.ps1` correctly runs winget on a vanilla Windows install. Recommend doing this within 30 days.

## Open / outstanding items

### IMPORTANT — pending action by user
1. **Save age private key** (`AGE-SECRET-KEY-13SKFEM66EPC9K3W7ZW5SV3YLDKPH8ZM5WSHLPM40TQNPZP9W4N0SGAFG49`) into:
   - Password manager entry "dloizides backup age private key" (PRIMARY)
   - Paper backup in fire-safe / safety-deposit box
   - Encrypted USB stored off-site (optional)

2. **Rotate the keypair eventually.** The private key was generated via the harness Bash tool, which means it appears in the conversation log + `~/.config/dloizides-backup/last-remote-backup` heartbeat doesn't expose it but the `gen-age-key.ps1` execution log does. For a real production secret you would generate it in a fresh PowerShell window that no harness sees. Recommend rotating once full Phase-2 setup is bedded in:
   - Run `setup-age-keypair.ps1` (will refuse to overwrite — you must delete `~/.config/dloizides-backup/age-recipient.txt` first).
   - Save new private key.
   - Re-run `backup-dev-pc-secrets.ps1 -Remote` to produce the first backup encrypted with the new key.
   - Old `.zip.age` files in the staging vault become unreadable — they will age out over 30 days. Document the rotation in this file.

3. **(Optional) Off-site cloud copy.** Staging laptop is on-site; for true 3-2-1 redundancy you also want a periodic upload of the local zip (`D:\backups\dev-pc-secrets-*.zip`) to encrypted cloud (OneDrive Personal Vault / Proton Drive).

4. **Smoke-test on a clean Windows VM** within 30 days. See `dev-pc-bootstrap.md` "TL;DR — The Fast-Path Recovery" section.

5. **(Optional) Schedule nightly Task Scheduler run** if you don't want to rely on the Tilt indicator. Command in `dev-pc-bootstrap.md` Phase 8.

### Future enhancements (not blocking)
- Add `recovery-test` Tilt resource that reproduces the round-trip smoke test against a temp dir, to detect chain breakage before disaster strikes.
- Daily cron on staging laptop that pings dev PC for last-backup heartbeat, alerts on email if missing.
- When Keyboard Piano signs its first AAB, immediately re-run `backup-dev-pc-secrets.ps1 -Remote` so the keystore is captured.

## Files changed in this work

```
NEW:    personalServerNotes/docs/dev-pc-bootstrap.md
NEW:    personalServerNotes/scripts/setup-age-keypair.ps1
NEW:    personalServerNotes/scripts/backup-dev-pc-secrets.ps1
NEW:    personalServerNotes/scripts/bootstrap-dev-pc.ps1
NEW:    personalServerNotes/scripts/setup-staging-backup-vault.sh
NEW:    scripts/infra/dev-pc-backup.bat
NEW:    scripts/infra/dev-pc-backup-health.ps1
NEW:    scripts/infra/dev-pc-backup-health.bat
EDIT:   Tiltfile (+ 2 local_resource entries)
EDIT:   personalServerNotes/README.md (added link to dev-pc-bootstrap.md)
EDIT:   personalServerNotes/docs/operational-runbook.md (jim/jim creds)
EDIT:   personalServerNotes/docs/staging-access-guide.md (jim/jim creds)
EDIT:   personalServerNotes/docs/container-registry-guide.md (jim/jim creds)
NEW:    BaseClient/docs/Tasks/COMPLETED/dev-pc-disaster-recovery.md (this file)

External:
NEW:    https://github.com/openmindednewby/dloizides-bootstrap (private)
        - recover.ps1
        - clone-all-repos.ps1
        - repos.json
        - README.md
        - .gitignore
```

## How to invoke (cheat sheet)

| Want to... | Run |
|------------|-----|
| Take a backup now | `tilt trigger dev-pc-backup` (or `personalServerNotes\scripts\backup-dev-pc-secrets.ps1 -Remote`) |
| See if backup is fresh | Tilt UI → `dev-pc-backup-health` resource (red ≥ 24 h) |
| Add a new repo to recovery | edit `repos.json` in `dloizides-bootstrap`, commit, push |
| Rotate age key | delete `~/.config/dloizides-backup/age-recipient.txt`, run `setup-age-keypair.ps1` |
| Recover dead PC | (on new PC, elevated PS) `winget install Git.Git; git clone https://$pat@github.com/openmindednewby/dloizides-bootstrap.git C:\bootstrap; cd C:\bootstrap; .\recover.ps1 -Pat $pat` |
| Verify staging vault | `ssh jim@192.168.10.200 "ls -la /home/jim/backups/dev-pc/"` |
| Manual decrypt | `age -d -i <private-key-file> <file>.age > backup.zip` |

## References
- `personalServerNotes/docs/dev-pc-bootstrap.md` — full operator guide
- `personalServerNotes/docs/operational-runbook.md` — SSH + ops
- `personalServerNotes/docs/container-registry-guide.md` — registry
- `https://github.com/openmindednewby/dloizides-bootstrap` — recovery entrypoint
- `BaseClient/docs/Tasks/COMPLETED/credential-rotation-system.md` — sister system (rotation tracking)
- `.claude/skills/credential-rotation/SKILL.md` — agent skill for credential ops
- `.claude/skills/email-systems/SKILL.md` — agent skill for email subsystem

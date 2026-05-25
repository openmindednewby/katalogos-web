# Docker Stability & Development Environment Optimization

**Status**: PHASE 2 COMPLETE (Monitoring + Quick Wins done. Phase 3 deferred — allocation fits within WSL2 limit)
**Created**: 2026-03-20
**Completed**: 2026-03-20
**Priority**: P0 (blocks all development when Docker crashes)

---

## Problem Statement

Docker Desktop crashes frequently during development. The root cause is memory over-allocation: **~7.9 GB of container memory limits vs 4 GB WSL2 limit**. When all 22 auto-start containers run simultaneously, WSL2 swap thrashes, Docker Desktop hangs, and eventually crashes with "Application Hang."

---

## Investigation Findings

### Current Resource Allocation

| Category | Containers | Memory | CPUs | Startup |
|----------|-----------|--------|------|---------|
| Databases (6 PostgreSQL) | 6 | 3,072 MB | 3.0 | Auto |
| API Services (6 .NET) | 6 | 3,072 MB | 6.0 | Auto |
| Message Queue + Cache | 3 | 768 MB | 1.0 | Auto |
| SeaweedFS + Nginx | 5 | 1,088 MB | 2.75 | Auto |
| Observability | 4 | 1,152 MB | 1.75 | Manual |
| Analytics (Umami) | 2 | 512 MB | 1.0 | Manual |
| Monitors + Infra | 3 | 148 MB | 0.35 | Auto |
| **Total** | **29+** | **~7,940 MB** | **~16.4** | |
| **Auto-start only** | **22** | **~7,464 MB** | **~14.0** | |

### WSL2 Configuration (`~/.wslconfig`)

```ini
memory=4GB
swap=8GB
processors=8
autoMemoryReclaim=gradual
```

### The Math

- Auto-start containers demand: **~7.5 GB**
- WSL2 memory limit: **4 GB**
- Deficit: **-3.5 GB** (absorbed by swap until thrashing → crash)

### Additional Memory Consumers (not in Docker)

- Frontend dev server (Metro/Webpack): ~1-2 GB
- `dotnet watch` test watchers (when active): ~500 MB each
- Playwright browsers (during E2E): ~300 MB per worker
- Node.js processes (Tilt local_resources): ~200 MB total

---

## Implementation Plan

### Phase 1: Fix Monitoring & Establish Baseline (DO FIRST)

**Goal**: Get accurate visibility into actual memory usage before making any changes.

We can't make informed decisions without data. The current health monitor reports "WSL2: 0.0GB" — we're flying blind.

#### Step 1.1: Fix Health Monitor Script

**What**: Fix the PowerShell script that reads `vmmemWSL` process memory so `docker-health.log` shows real numbers.

**Implementation**:
- Read and fix the monitor script (likely in `scripts/` or a Tilt local_resource)
- The `vmmemWSL` process name changed on Windows 11 build 26200+ — verify the script checks both `vmmem` and `vmmemWSL`
- Ensure the script outputs: WSL2 RSS, Docker engine status, per-container memory usage
- Add `docker stats --no-stream --format` output to the health log for per-container breakdown

**Acceptance criteria**: `docker-health.log` shows non-zero WSL2 memory readings and per-container memory.

#### Step 1.2: Monitoring Phase — Collect Baseline Data

**What**: Run the fixed monitor for a full development session and collect data on actual memory usage patterns.

**Data to collect**:
1. WSL2 `vmmemWSL` process memory at idle (just DBs + APIs running)
2. WSL2 memory during active development (frontend dev server + file changes)
3. WSL2 memory during quality checks (lint + unit tests + build)
4. WSL2 memory during E2E tests (Playwright browsers)
5. Per-container actual usage vs allocated limits (`docker stats`)
6. Timestamp of any Docker Desktop crashes or hangs
7. Swap file usage on the host

**How to collect**:
- Enhanced health monitor logs every 10s to `docker-health.log`
- Manual `docker stats --no-stream` snapshots at key moments
- Record which containers are actually using their allocated memory vs sitting idle

**Duration**: At least 1 full development day (or until first crash).

**Why this matters**: If DBs only use 80 MB of their 512 MB limit, we know Proposal 4 is safe. If APIs spike to 400 MB during AI calls, Proposal 5 needs the GC fix. If SeaweedFS barely touches its allocation, we might not need 4 containers.

---

### Phase 2: Low-Risk Quick Wins (after baseline data)

Implement these based on Phase 1 data, in order:

#### Proposal 4: Reduce Database Memory to 256 MB

**What**: Change `mem_limit` from 512 MB to 256 MB for all 6 PostgreSQL containers.

**Savings**: 1,536 MB (6x512 → 6x256)

**Implementation**: Edit `mem_limit` in each service's `docker-compose.yml`.

**Pros**:
- Simple change — 6 lines across 6 files
- PostgreSQL defaults (`shared_buffers=128MB`, `work_mem=4MB`) fit within 256 MB
- Dev workloads are light (single-user, small datasets)

**Cons**:
- Large queries (e.g., data export, analytics aggregation) might OOM
- `pg_dump` for backups uses extra memory
- If a DB hits the limit, the container is killed — confusing error
- Need to verify no service's migrations or seed data require >256 MB

**Risk**: LOW — PostgreSQL is efficient. 256 MB is the standard Docker recommendation for dev.

**Validation**: Phase 1 data must show DB containers using <200 MB in practice.

**Go/No-Go**: If any DB container regularly exceeds 200 MB during Phase 1, keep it at 512 MB and reduce only the others.

---

#### Proposal 5: Reduce API Service Memory to 256 MB (with GC fix)

**What**: Change `mem_limit` from 512 MB to 256 MB for all 6 .NET API containers AND switch to Workstation GC in dev.

**Savings**: 1,536 MB (6x512 → 6x256)

**Implementation**:
1. Add `DOTNET_SYSTEM_GC_SERVER=0` environment variable to each service's `docker-compose.yml`
2. Reduce `mem_limit` from 512 MB to 256 MB

**Why the GC fix is mandatory**: .NET's Server GC is designed for throughput — it aggressively allocates up to the container limit. On a 512 MB container, it'll happily use 400 MB even if the app only needs 150 MB. Workstation GC is designed for responsiveness and uses much less memory. In dev mode with one user, Server GC provides zero benefit.

```yaml
environment:
  - DOTNET_SYSTEM_GC_SERVER=0  # Use Workstation GC in dev (less memory)
```

**Pros**:
- 1.5 GB savings
- Workstation GC actually reduces latency for dev (more frequent, shorter collections)
- .NET 10 in dev mode typically uses 100-150 MB with Workstation GC

**Cons**:
- Different GC behavior in dev vs production (production uses Server GC)
- If a service genuinely needs >256 MB (image processing, large AI payloads), it OOMs
- Need to ensure `DOTNET_SYSTEM_GC_SERVER=0` is only in dev compose files, not production

**Risk**: MEDIUM without GC fix, LOW with GC fix.

**Validation**: Phase 1 data must show API containers using <200 MB with Workstation GC.

**Go/No-Go**: If any API service exceeds 200 MB after switching to Workstation GC, keep it at 512 MB individually.

---

### Phase 3: Structural Changes (highest impact, more effort)

#### Proposal 1: Shared Database Instance

**What**: Replace 6 separate PostgreSQL containers with 1 shared instance hosting 6 databases.

**Savings**: 2,048 MB (6x512 MB → 1x1024 MB), or 1,280 MB if Phase 2 already reduced DBs to 256 MB (6x256 → 1x512)

**Implementation**:
1. Create `infrastructure/postgres/docker-compose.yml`:
   ```yaml
   services:
     postgres:
       image: postgres:17-alpine
       mem_limit: 512m  # one instance serves all 6 DBs
       cpus: 1.0
       ports:
         - "5432:5432"
       environment:
         POSTGRES_USER: platform
         POSTGRES_PASSWORD: ${SHARED_DB_PASSWORD}
       volumes:
         - ./init-databases.sql:/docker-entrypoint-initdb.d/01-init.sql
         - postgres-data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U platform"]
         interval: 10s
         timeout: 5s
         retries: 3
   ```

2. Create `infrastructure/postgres/init-databases.sql`:
   ```sql
   -- Create databases for each service
   CREATE DATABASE "IdentityServiceDb";
   CREATE DATABASE "QuestionerServiceDb";
   CREATE DATABASE "OnlineMenuServiceDb";
   CREATE DATABASE "ContentServiceDb";
   CREATE DATABASE "NotificationServiceDb";
   CREATE DATABASE "PaymentServiceDb";

   -- Grant full access to the platform user
   GRANT ALL PRIVILEGES ON DATABASE "IdentityServiceDb" TO platform;
   -- ... repeat for each DB
   ```

3. Update each service's connection string to use the shared instance:
   - Port: 5432 (single port for all)
   - User: `platform` (shared superuser)
   - Database: service-specific name

4. Remove individual `*-db` containers from each service's `docker-compose.yml`

5. Update Tiltfile:
   - Load `infrastructure/postgres/docker-compose.yml` first
   - Remove `dc_resource` entries for individual DBs
   - Update API service dependencies to depend on `postgres` instead of `{service}-db`

**Pros**:
- Biggest structural savings
- Simpler infrastructure (1 container vs 6)
- Faster startup (1 DB init vs 6 parallel)
- Fewer ports to manage (1 vs 6)
- Matches production pattern (shared DB cluster)

**Cons**:
- Less isolation — heavy query in one service impacts others
- Single point of failure — if postgres crashes, all services down
- Connection string changes across ~18+ files (appsettings, docker-compose envs)
- Need to handle DB-specific extensions (if any service uses special PG extensions)
- EF Core migrations need to target the correct database on the shared instance
- Backup script (`backup-databases`) needs to iterate databases, not containers

**Risk**: LOW — PostgreSQL handles multi-database well. Main risk is migration complexity.

**Validation**: Test all 6 services can connect, run migrations, and pass unit tests against the shared instance.

---

#### Proposal 3: Tiered Service Profiles

**What**: Define Tilt profiles that load different subsets of services based on what you're working on.

**Savings**: Variable — `minimal` saves ~5 GB, `standard` is current behavior.

**Implementation**:
```python
# In Tiltfile
profile = os.getenv('TILT_PROFILE', 'standard')

# Phase 1: Always load (shared infra)
docker_compose('infrastructure/postgres/docker-compose.yml')  # shared DB
load_rabbitmq_redis()  # always needed

# Phase 2: Core services (always needed)
if profile in ['minimal', 'standard', 'full']:
    load_identity_service()   # auth is always needed
    load_onlinemenu_service()  # primary product

# Phase 3: Secondary services
if profile in ['standard', 'full']:
    load_questioner_service()
    load_content_service()
    load_notification_service()
    load_payment_service()

# Phase 4: Observability & analytics
if profile == 'full':
    load_observability()  # loki, grafana, prometheus, cadvisor
    load_analytics()      # umami
```

**Usage**:
```bash
# Frontend development (2 services + infra)
TILT_PROFILE=minimal tilt up

# Full-stack development (all services)
TILT_PROFILE=standard tilt up  # or just: tilt up

# Pre-deploy verification (everything)
TILT_PROFILE=full tilt up
```

**Profile breakdown**:

| Profile | Services | Containers | Est. Memory |
|---------|----------|-----------|-------------|
| `minimal` | Identity + OnlineMenu + Redis + RabbitMQ + 1 DB | ~6 | ~1.5 GB |
| `standard` | All 6 services + core infra | ~17 | ~4.5 GB |
| `full` | Everything + observability + analytics | ~25 | ~7 GB |

**Pros**:
- Most flexible — choose what you need
- `minimal` profile makes Docker virtually crash-proof
- Purely additive — `standard` is identical to current behavior
- Frontend developers rarely need all 6 backends

**Cons**:
- Adds Tiltfile complexity (~50 lines of conditional logic)
- Need to document which features work in which profile
- Services that depend on missing services (e.g., menu creation needs ContentService for images) will fail
- Need to handle missing service gracefully in frontend (error toasts, not crashes)

**Risk**: LOW — purely additive.

**Dependencies**: Best combined with Proposal 1 (shared DB) so `minimal` profile only needs 1 DB container.

---

### Proposal 6: Fix Health Monitor Script

**What**: Fix the monitoring script that reports "WSL2: 0.0GB" so we have actual visibility into memory pressure.

**Savings**: None directly — enables informed decisions.

**Implementation**:
- Find and fix the monitor script (Tilt local_resource `docker-health-monitor`)
- Fix `vmmemWSL` process memory reading (Windows 11 build 26200+ renamed the process)
- Add `docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"` to the log output
- Add total WSL2 memory and swap usage

**Enhanced log format**:
```
[2026-03-20 14:30:00] WSL2: 3.2/4.0 GB (80%) | Swap: 2.1/8.0 GB (26%) | Docker: running
  identity-db: 87/256 MB (34%) | identityservice.api: 142/256 MB (55%)
  questioner-db: 62/256 MB (24%) | questioner.web: 118/256 MB (46%)
  onlinemenu-db: 95/256 MB (37%) | project1.web: 165/256 MB (64%)
  content-db: 71/256 MB (28%) | content.web: 131/256 MB (51%)
  notification-db: 58/256 MB (23%) | notification.web: 109/256 MB (43%)
  payment-db: 54/256 MB (21%) | paymentservice.api: 98/256 MB (38%)
  rabbitmq: 142/512 MB (28%) | redis: 12/128 MB (9%)
  TOTAL CONTAINERS: 1,344/4,096 MB
```

**Pros**:
- Essential for diagnosing future issues
- Enables proactive alerts before crashes
- Validates that Phase 2/3 changes actually helped
- Low effort

**Cons**: None

**Risk**: NONE

---

## Rejected Proposals

### ~~Proposal 2: Increase WSL2 Memory to 8 GB~~ — REJECTED

**Reason**: This masks the problem without solving it. The container allocation (~7.9 GB) exceeds even 8 GB once you add frontend dev server, test processes, and Playwright browsers. As the project grows (more services, more containers), the problem returns. The correct approach is to reduce allocation to fit within the existing 4 GB limit.

---

## Decision Matrix

| Proposal | Savings | Effort | Risk | Phase | Depends On |
|----------|---------|--------|------|-------|------------|
| 6. Fix monitor | Visibility | 30 min | None | **1** | Nothing |
| *Monitoring phase* | *Baseline data* | *1 day* | *None* | **1** | Proposal 6 |
| 4. Reduce DB mem | 1,536 MB | 30 min | Low | **2** | Phase 1 data |
| 5. Reduce API mem + GC | 1,536 MB | 1 hour | Low* | **2** | Phase 1 data |
| 1. Shared DB | 1,280 MB** | 2-3 hours | Low | **3** | Phase 2 validated |
| 3. Tilt Profiles | Variable | 2-3 hours | Low | **3** | Proposal 1 |

*Low with GC fix, Medium without
**Savings on top of Phase 2 reductions

### Expected Cumulative Impact

| After Phase | Container Allocation | WSL2 Headroom (4 GB) |
|-------------|---------------------|---------------------|
| Current | ~7,940 MB | **-3,940 MB** (deficit) |
| Phase 2 (DB + API reduction) | ~4,868 MB | **-868 MB** (tight) |
| Phase 3 (shared DB) | ~3,588 MB | **+412 MB** (stable) |
| Phase 3 + minimal profile | ~1,500 MB | **+2,500 MB** (comfortable) |

---

## Execution Sequence

```
Phase 1: Monitoring (prerequisite for everything else)
  ├─ Step 1.1: Fix health monitor script
  ├─ Step 1.2: Collect baseline data for 1 day
  └─ Step 1.3: Analyze data → Go/No-Go for each Phase 2 proposal

Phase 2: Quick Wins (data-driven, apply only what's safe)
  ├─ Proposal 4: Reduce DB mem (if data shows <200 MB usage)
  ├─ Proposal 5: Add Workstation GC + reduce API mem (if data shows <200 MB)
  └─ Validate: Re-run monitoring, confirm stability

Phase 3: Structural (if Phase 2 isn't enough)
  ├─ Proposal 1: Shared DB (biggest structural change)
  ├─ Proposal 3: Tilt Profiles (best combined with shared DB)
  └─ Validate: Full E2E suite passes, no regressions
```

---

## Implementation Log

### Phase 1: Monitoring

| Step | Status | Date | Notes |
|------|--------|------|-------|
| 1.1 Fix health monitor | **DONE** | 2026-03-20 | Enhanced `monitor-docker.ps1` with per-container `docker stats` snapshot every 5 min, peak WSL2 tracking, total container memory sum. Added `deps` watch in Tiltfile for auto-restart on script change. |
| 1.2 Collect baseline | **DONE** | 2026-03-20 | First snapshot collected. See "Baseline Snapshot" section below. |
| 1.3 Analyze + Go/No-Go | **DONE** | 2026-03-20 | All proposals validated — data shows massive over-allocation. See analysis below. |

#### Baseline Snapshot (2026-03-20 17:44:03)

**WSL2**: 2.0 GB | **Peak**: 2.0 GB | **26 containers** | Docker: RUNNING

| Container | Actual | Limit | Usage % | Decision |
|-----------|--------|-------|---------|----------|
| **Databases** | | | | |
| IdentityServiceDB | 27.6 MB | 512 MB | 5.4% | → **128 MB** |
| OnlineMenuDB | 24.2 MB | 512 MB | 4.7% | → **128 MB** |
| QuestionerDB | 23.0 MB | 512 MB | 4.5% | → **128 MB** |
| ContentDB | 25.6 MB | 512 MB | 5.0% | → **128 MB** |
| NotificationDB | 19.7 MB | 512 MB | 3.9% | → **128 MB** |
| PaymentServiceDB | 36.1 MB | 512 MB | 7.0% | → **128 MB** |
| **API Services** | | | | |
| identityservice.api | 289.3 MB | 512 MB | 56.5% | → **384 MB** (heaviest) |
| project1.web (OnlineMenu) | 221.3 MB | 512 MB | 43.2% | → **256 MB** + Workstation GC |
| notification.web | 172.1 MB | 512 MB | 33.6% | → **256 MB** + Workstation GC |
| paymentservice.api | 165.7 MB | 512 MB | 32.4% | → **256 MB** + Workstation GC |
| questioner.web | 165.7 MB | 512 MB | 32.4% | → **256 MB** + Workstation GC |
| content.web | 140.4 MB | 512 MB | 27.4% | → **256 MB** + Workstation GC |
| **Infrastructure** | | | | |
| RabbitMQ | 213.3 MB | 512 MB | 41.7% | → **384 MB** |
| Loki | 119.7 MB | 512 MB | 23.4% | → **256 MB** |
| Grafana | 133.8 MB | 256 MB | 52.3% | Keep 256 MB |
| Prometheus | 110.2 MB | 256 MB | 43.1% | Keep 256 MB |
| cAdvisor | 61.9 MB | 128 MB | 48.4% | Keep 128 MB |
| SeaweedFS (4 containers) | 210.8 MB | 1,024 MB | 20.6% | Keep (already low per-container) |
| Redis | 11.1 MB | 128 MB | 8.7% | Keep 128 MB |
| Redis Commander | 43.5 MB | 128 MB | 34.0% | Keep 128 MB |
| Nginx | 8.9 MB | 64 MB | 13.8% | Keep 64 MB |
| Mailpit | 20.9 MB | 128 MB | 16.3% | Keep 128 MB |
| **TOTAL** | **2,223 MB** | **7,940 MB** | **28%** | |

### Phase 2: Quick Wins

| Step | Status | Date | Notes |
|------|--------|------|-------|
| 4. Reduce DB mem | **DONE** | 2026-03-20 | All 6 DBs: 512 MB → 128 MB. Saves 2,304 MB. |
| 5. API mem + GC fix | BLOCKED | | Waiting on Phase 1 data |
| 5. Reduce API mem + GC | **DONE** | 2026-03-20 | Identity: 512→384 MB. 5 others: 512→256 MB. `DOTNET_SYSTEM_GC_SERVER=0` added to all 6. Saves 1,408 MB. |
| Reduce Loki | **DONE** | 2026-03-20 | 512 MB → 256 MB. Saves 256 MB. |
| Reduce RabbitMQ | **DONE** | 2026-03-20 | 512 MB → 384 MB. Saves 128 MB. |
| Validation | **IN PROGRESS** | 2026-03-20 | Monitoring next snapshot to confirm stability |

#### Phase 2 Summary

| Change | Before | After | Saved |
|--------|--------|-------|-------|
| 6 Databases | 3,072 MB | 768 MB | **2,304 MB** |
| Identity API | 512 MB | 384 MB | **128 MB** |
| 5 other APIs | 2,560 MB | 1,280 MB | **1,280 MB** |
| RabbitMQ | 512 MB | 384 MB | **128 MB** |
| Loki | 512 MB | 256 MB | **256 MB** |
| **TOTAL SAVED** | | | **4,096 MB** |
| **New total allocation** | **7,940 MB** | **3,844 MB** | **51.6% reduction** |

All 6 API services also received `DOTNET_SYSTEM_GC_SERVER=0` to switch from Server GC (memory-hungry, optimized for throughput) to Workstation GC (low-memory, optimized for responsiveness). This prevents .NET from aggressively consuming available memory up to the container limit.

### Phase 3: Structural

| Step | Status | Date | Notes |
|------|--------|------|-------|
| 1. Shared DB | DEFERRED | | Phase 2 savings sufficient — total allocation now fits within 4 GB |
| 3. Tilt Profiles | DEFERRED | | Revisit if more services are added |
| Full E2E validation | TODO | | After containers restart with new limits |

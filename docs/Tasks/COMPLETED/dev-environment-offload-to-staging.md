# Dev Environment Offload to Staging Laptop

## Status

SCOPED — Tier 3 architectural plan complete and on disk for future reference. Tier 1 (auto_init=False audit) was implemented instead and achieved the immediate goal (~93% idle RAM reduction). Tier 3 deferred until/unless Tier 1 proves insufficient.

## Problem Statement

The dev PC (Windows 11, 4 GB WSL2 allocation, 3.8 GB total Docker allocation
already painstakingly tuned down from 7.9 GB) is the single host for the entire
dev environment: 5 backend APIs (Identity / Questioner / OnlineMenu / Content /
Notification + Payment), 6 Postgres databases (consolidated into shared-db),
RabbitMQ, Redis, SeaweedFS, Mailpit, Nginx, the observability stack (Loki,
Grafana, Prometheus, cAdvisor), Keycloak, the frontend dev server, three Vite
dev servers (BaseClient port 8082, erevna-web 8083, katalogos-web 8084), and a
Playwright runner that spawns up to 6 Firefox workers per E2E suite. There are
~70 Tilt resources today, of which 23 are `playwright-e2e-*`. Even with
TRIGGER_MODE_MANUAL on every API service, idle baseline RAM regularly bumps the
Docker allocation, vmmemWSL has to be auto-restarted by the watchdog, and the
inner-loop save -> see-result cycle suffers from CPU contention whenever a
build, lint, test, or E2E run is in flight.

The staging laptop (`jim@10.0.0.2`, also reachable on LAN as
`192.168.10.200`) runs a proven K3s cluster: Phase 8 bootstrap teardown +
re-bootstrap was smoke-tested at 35/35 pods in 21 minutes. It hosts a container
registry at `10.0.0.2:5000` over WireGuard (default push target since
2026-05-06), a working `cronjob/smoke-daily` pattern that `manage.sh smoke
staging` exercises today, and the `daily-report-staging-preview` cron. It has
~30 GB of free headroom. The dev PC has the faster CPU but no spare RAM; the
staging laptop has the spare RAM but a slower CPU and is across a WireGuard
tunnel.

## Goal

Offload everything that does **not** need to be in the dev PC's hot inner loop
to the staging laptop, while keeping the editor + the active service's
build / hot-reload / debugger experience local and fast. Move the dev PC from
"runs the whole world" to "runs the file I am currently editing." Reclaim
enough RAM to make WSL2 OOMs and Docker Desktop crashes a thing of the past
without losing any developer-experience speed on the active service.

## Resolved Decisions (user-confirmed defaults — deviate only with documented reasoning)

1. **HYBRID model, not pure-remote.** The active service being edited stays
   local for fast inner loop; idle backend services + databases + observability
   + E2E tests run on staging. Editor + frontend dev servers always local.
   *Reasoning: pure-remote loses the inner loop; pure-local is what we have
   today and it does not fit in 3.8 GB.*

2. **Tilt profiles via env var.** `TILT_PROFILE=local|hybrid|staging` selects
   the resource set. `local` = today's behavior. `hybrid` = the new default.
   `staging` = nothing local except observers / tunnels. Profile-aware Tiltfile
   branches `dc_resource` / `local_resource` / `k8s_resource` registration.
   *Reasoning: a single source of truth (the Tiltfile) avoids parallel
   compose / k8s files drifting out of sync, and an env var lets the user flip
   profiles without touching code.*

3. **Active service selection.** `ACTIVE_SERVICE=identity|questioner|onlinemenu|content|notification|all`.
   Only that service spins up local; all other backend services are pointed at
   staging URLs over WireGuard. `all` is today's behavior, kept as an escape
   hatch for offline work and full-stack debugging.
   *Reasoning: 90% of dev sessions touch one service at a time; hybrid pays
   for itself the instant the developer is editing fewer than five services.*

4. **E2E tests run as K8s Jobs on staging.** Extend the proven
   `smoke-daily-trigger-staging` -> `kubectl create job --from=cronjob/smoke-daily`
   pattern. Each `playwright-e2e-{suite}` Tilt resource becomes a thin local
   wrapper that does: build/push the E2E image (if changed) -> `kubectl create
   job --from=cronjob/playwright-e2e-{suite}` -> tail logs -> exit with the
   Job's exit code. No local Playwright runner. Local Lighthouse stays local
   (it runs against `localhost:8082` and is not a memory hog).
   *Reasoning: Playwright with 6 Firefox workers is the single biggest local
   RAM consumer at peak. The smoke pattern is already proven end-to-end.*

5. **Database strategy.** Active local service uses local Postgres (fast,
   ephemeral, can be wiped). Idle staging services keep using their existing
   staging Postgres. **No** shared / cross-cluster DB access — that pattern
   creates schema-migration race conditions and 'who owns the data' confusion.
   Test-data isolation handled by staging-side fixtures (existing pattern from
   smoke + daily-report).
   *Reasoning: cross-cluster DB access is the reliability footgun that always
   bites. Two databases with clear ownership > one shared DB with split
   ownership.*

6. **Image build stays local + pushes to staging registry.** The dev PC has
   the faster CPU; moving builds to staging would slow the build-push-deploy
   loop by 3-5x. Existing `manage.sh deploy <name>` already does
   `docker build` locally + `docker push 10.0.0.2:5000/<name>` over WireGuard
   + `kubectl set image` over SSH. The new piece: a Tilt helper (`tilt-deploy
   <service>`) that wraps `manage.sh deploy --staging-only <service>` so the
   developer never leaves the Tilt UI to redeploy a staging-target service.
   *Reasoning: keeps the build context local where the source is, reuses the
   already-debugged deploy path, and adds a single Tilt button per service.*

## Open Questions

1. **Are the 5 docker-compose services on staging deployable as-is to K3s, or
   do they only exist as docker-compose definitions today?** The `manage.sh
   deploy` registry shows all 5 APIs (`identity-api`, `questioner-api`, etc.)
   already mapped to manifests in `personalServerNotes/k8s/saas/apis.yml`, so
   K8s deployments exist. Need to confirm staging has working Postgres
   instances + RabbitMQ + Redis + SeaweedFS for each service, or whether some
   of those are still production-only.

2. **WireGuard latency tolerance for inter-service auth (Identity calls from
   the active local service to staging)?** Acceptable for dev?
   `localhost:5002` -> WireGuard `10.0.0.2:5002` adds ~5-10 ms per hop. If
   the active service hits identity 20 times during a request that is
   100-200 ms of added latency. Probably fine for dev; flag it.

3. **Should observability (Loki / Grafana / Prometheus / cAdvisor) move
   wholesale to staging, or stay local for the active service?** Suggested:
   move wholesale. The active service still ships logs to the staging Loki
   over WireGuard (existing `Logging.Client` package supports remote
   endpoints). Saves ~512 MB locally.

4. **Keycloak: stays local, moves to staging, or already-on-staging?** Today
   it is one of the heavier infra containers. If staging already runs a
   Keycloak (does it?), the active local service points at staging Keycloak
   and we save another ~256 MB. If not, this becomes its own sub-task to
   provision realms on staging — non-trivial because of
   `keycloak-provision-realms-with-clients` and the seeded test users.

5. **Mobile app folder TBD** (Phase 6 cutover deletes BaseClient). The
   frontend / dev-server portion of this plan is written for the new mobile
   app folder once it lands. For now the plan keeps `frontend` (port 8082),
   `erevna-web` (8083), `katalogos-web` (8084) as the local dev servers.

6. **Single-developer assumption is locked in (per user instruction "Multi-
   developer / team support is out").** Confirm: no team mode ever?

7. **Offline mode requirement: how often does the dev PC need to work without
   WireGuard?** This drives Phase 8 priority. If "rarely / on a plane" is
   acceptable, offline mode is a quick `TILT_PROFILE=local` flip and we
   document it. If "needs to be seamless," more work.

## Approach (phased — each phase independently shippable and reversible)

### Phase 1: Inventory & Baseline (1 agent-day)

Measure first; cut second.

- [ ] Capture current dev PC RAM / CPU under three load profiles: idle (Tilt up,
      no triggers), typical (1 API rebuild + frontend + 1 E2E suite), peak
      (3 APIs rebuilding + 2 E2E suites). Record `vmmemWSL`, `Docker Desktop`,
      `node` (Metro), `dotnet` (msbuild), per-process top 20.
- [ ] Inventory current Tilt resource count by category (count today: ~70
      total; 23 `playwright-e2e-*`). Confirm the categorization.
- [ ] Confirm staging readiness: K3s pods running, registry healthy at
      `10.0.0.2:5000`, WireGuard latency baseline (avg + p99), free RAM/CPU on
      staging laptop, free disk for image pushes (current registry size +
      growth rate).
- [ ] Confirm staging-side databases / RabbitMQ / Redis / SeaweedFS / Keycloak
      exist and are reachable for each of the 5 APIs (drives Open Question 1
      and 4).
- [ ] Document current dev-loop timings: time to first hot reload after `tilt
      trigger identity-api`, time for full `playwright-e2e-identity-all`, time
      for `frontend-prod-build`. These are the regression baselines for Phase
      9.
- [ ] **Deliverable**: `dev-environment-offload-baseline.md` checked into
      `BaseClient/docs/Tasks/IN_PROGRESS/` with hard numbers, not adjectives.

### Phase 2: Tiltfile Profile Mechanism (1 agent-day)

Branching first; routing second. No behavior change yet.

- [ ] Add `TILT_PROFILE` env-var read at the top of the Tiltfile. Default
      `hybrid`. Validate against `local|hybrid|staging`.
- [ ] Add `ACTIVE_SERVICE` env-var read. Default `all` (so existing behavior
      is preserved for anyone who does not set the var). Validate against
      `identity|questioner|onlinemenu|content|notification|all`.
- [ ] Refactor each backend service block (Identity / Questioner / OnlineMenu
      / Content / Notification) into a helper function `register_backend_service(name,
      compose_path, ...)` that internally checks the profile + active-service
      flags and decides whether to register the local `dc_resource` or skip
      it.
- [ ] Add a `staging_resource(name, ...)` helper that registers a
      `local_resource` whose `cmd` is `manage.sh check <name> --staging-only`
      (health check) and links to the staging URL. Goes in the same Tilt
      label as the local resource for consistency.
- [ ] Phase 2 acceptance: `TILT_PROFILE=local tilt up` is byte-identical in
      behavior to `tilt up` today. `TILT_PROFILE=hybrid ACTIVE_SERVICE=all tilt
      up` is also byte-identical. Other combinations may not work yet but the
      Tiltfile must parse.

### Phase 3: Service Routing Infrastructure (1.5 agent-days)

Make the active local service talk to staging for everything it does not own.

- [ ] Define the staging service URL map: `IDENTITY_URL_STAGING=http://10.0.0.2:5002`
      etc. (one per API). Add to `.env.staging-routes` (new file, gitignored
      pattern, committed example as `.env.staging-routes.example`).
- [ ] Update each service's `.env.local` template to read service URLs from
      env vars with sensible defaults (`http://localhost:5002` for local).
      When `TILT_PROFILE=hybrid` and the service is not the `ACTIVE_SERVICE`,
      Tilt injects the staging URL via the compose `environment:` block (or a
      profile-specific override compose file `docker-compose.staging-route.yml`).
- [ ] Secrets: staging-routes only carry hostnames + ports, not creds. The
      active local service still authenticates against staging Keycloak using
      the same client secret it would use locally (Keycloak is per-realm,
      cred is the same). Document that staging-route mode requires the
      WireGuard tunnel up — no fallback to localhost (fails loud).
- [ ] Health-check pinger: a lightweight `local_resource` named
      `wireguard-health` that pings `10.0.0.2:5000` every 30 s; goes red on
      tunnel failure. Hard-required dependency for any `staging_resource`.
- [ ] **Phase 3 acceptance**: `TILT_PROFILE=hybrid ACTIVE_SERVICE=questioner
      tilt up` brings up local questioner-api + local shared-db + local
      RabbitMQ + local Redis, but the questioner can call identity at
      `http://10.0.0.2:5002/me` over WireGuard and gets a 200. All other
      backend services do not run locally.

### Phase 4: E2E Offload — Convert playwright-e2e-* to K8s Jobs (2 agent-days)

Highest-value RAM win. Pattern is proven by smoke.

- [ ] Build a per-suite `cronjob/playwright-e2e-{suite}` (suspended) on
      staging, mirroring the existing `cronjob/smoke-daily` shape. Each
      cronjob references the existing E2E test image; container env carries
      `PLAYWRIGHT_SUITE_FILTER=<suite>` + `PLAYWRIGHT_TARGET_BASE_URL=https://<env>.dloizides.com`
      (or staging URL).
- [ ] Add `manage.sh e2e <suite> [--staging|--local-active]` command,
      modelled directly on `cmd_smoke`. `--staging` does
      `kubectl create job --from=cronjob/playwright-e2e-{suite}` over SSH +
      tails logs + exits with Job exit code. `--local-active` is the escape
      hatch (today's local Playwright run).
- [ ] Convert all 23 `playwright-e2e-*` Tilt resources. Each becomes:
      `cmd='bash personalServerNotes/scripts/manage.sh e2e <suite> --staging'`
      under `TILT_PROFILE=hybrid|staging`. Under `TILT_PROFILE=local` they
      keep today's `npm run test:<suite>` cmd.
- [ ] Image build: the E2E image gets built locally + pushed once on suite
      changes (`E2ETests/**` deps in a new `e2e-image` `local_resource`).
      Pattern matches `manage.sh deploy`.
- [ ] **Phase 4 acceptance**: triggering `playwright-e2e-questioner-active`
      from the Tilt UI under hybrid profile creates a K8s job on staging,
      tails its logs in the Tilt log pane, and exits green when all tests
      pass. Local RAM impact during the run: zero new processes (just an
      ssh + tail).

### Phase 5: Idle-Service Offload (2 agent-days)

For each of the 5 API services, build the staging-pointing variant.

- [ ] For each service, add a `staging_resource('<name>-staging', ...)` that:
      health-pings `https://<env>.dloizides.com/<service>/health` every 60 s,
      surfaces the K8s pod status (via `kubectl get pod -l app=<name>` over
      SSH), and links to the staging service URL + Grafana log filter.
- [ ] Under `TILT_PROFILE=hybrid` and when the service is not
      `ACTIVE_SERVICE`, register the `staging_resource` and skip the
      `dc_resource`. Under `TILT_PROFILE=local`, register the `dc_resource`
      and skip the staging variant. Identity is the special case: it is
      every other service's auth dependency, so even when it is not the
      active service the active service must reach it (over WireGuard).
- [ ] Add a `<service>-deploy-staging` `local_resource` (manual trigger,
      auto_init=False) that wraps `manage.sh deploy <service> --staging-only`.
      One Tilt button per service to push a fresh build to staging from
      inside the dev loop.
- [ ] **Phase 5 acceptance**: `TILT_PROFILE=hybrid ACTIVE_SERVICE=questioner
      tilt up` shows 1 local API service (questioner) + 4 staging health
      pings. RAM drops by roughly the cost of 4 dotnet API containers + 4
      compose dependencies that those services would have triggered (rough
      estimate: 1.0-1.5 GB).

### Phase 6: Active-Service Local Profile (1 agent-day)

Verify the inner loop is intact for each of the 5 services.

- [ ] For each `ACTIVE_SERVICE` value, run the standard inner-loop check:
      edit a file -> `tilt trigger <service>-api` -> request hits the local
      service -> response under 200 ms (excluding cold start). Record
      timings.
- [ ] Cross-service test: `ACTIVE_SERVICE=questioner` + a request that
      triggers questioner -> identity -> back. Measure WireGuard hop cost.
      Compare against the all-local baseline from Phase 1.
- [ ] **Phase 6 acceptance**: switching `ACTIVE_SERVICE` between any two
      services takes under 90 s (Tilt down + up). Each service in `active`
      mode has a save -> see-result cycle under 15 s.

### Phase 7: Documentation (0.5 agent-days)

- [ ] Update `/tilt` skill (`.claude/skills/tilt/`) to document profiles +
      `ACTIVE_SERVICE` + the new resource shapes.
- [ ] Add runbook to `personalServerNotes/docs/dev-environment-offload.md`:
      "switch active service", "back to all-local for offline work",
      "WireGuard down — what stops working and what to do," "staging laptop
      power loss — recovery."
- [ ] Update top-level `CLAUDE.md` Tilt MCP table: add the new
      `<service>-deploy-staging` resources, document `TILT_PROFILE` and
      `ACTIVE_SERVICE` env vars, flag that `playwright-e2e-*` resources are
      now K8s-job-backed under hybrid mode.

### Phase 8: Resilience (1 agent-day)

The hard scenarios.

- [ ] Offline mode: `TILT_PROFILE=local` is the documented escape hatch.
      Verify it works after an extended offline session — image cache is
      preserved on dev PC, no staging-side dependencies.
- [ ] WireGuard-down fallback: `wireguard-health` going red triggers a Tilt
      banner ('OFFLINE — switch to TILT_PROFILE=local'). Active local
      service does not fail — it just sees the dependent staging service as
      down (same as today if a real service was crash-looping).
- [ ] Staging laptop power-loss recovery: documented in runbook. Boot
      staging -> run `tilt trigger <every saas-* deployment>` on the dev PC
      OR `manage.sh deploy --all --staging-only` for a full redeploy. Test
      this once.
- [ ] Image-push retry: `manage.sh deploy` already exits non-zero on push
      failure; the Tilt resource will go red. Add a one-line retry hint to
      the error path. No automatic retry (silent retries hide flakiness).
- [ ] Clock skew: the active local service signs JWTs that staging services
      may validate (and vice versa). Add a one-time check in Phase 1
      baseline: `ssh jim@10.0.0.2 date -u` vs local `date -u`. Document
      acceptable skew (under 30 s) and how to fix (Windows time service +
      `chrony` on staging).
- [ ] Port conflict: staging APIs are on the same ports as local APIs
      (5001-5006). Local active service binds `localhost:<port>`; staging
      services are reached via the WireGuard `10.0.0.2:<port>`. No conflict
      because the staging endpoint is not bound to `localhost`. Document
      this explicitly so it is not a surprise.

### Phase 9: Verification (1 agent-day)

Measure the wins. Compare against Phase 1 baselines.

- [ ] Re-run the three Phase 1 load profiles under `TILT_PROFILE=hybrid
      ACTIVE_SERVICE=questioner` (representative active service). Diff
      against baseline. Record the deltas in
      `dev-environment-offload-results.md`.
- [ ] Run all 23 E2E suites end-to-end under hybrid mode. All must pass.
      Total wall-clock time delta from local: aim for ~zero (parallel K8s
      jobs vs serial-ish local).
- [ ] Run the inner-loop save -> see-result cycle for each of the 5 active
      services. All must stay under 15 s.
- [ ] Run a 4-hour soak: `tilt up` under hybrid, do typical dev work
      (3 builds, 2 E2E runs, 1 frontend reload, repeat). Record peak
      vmmemWSL, Docker engine RAM, host commit. Compare against today's
      soak.
- [ ] Sign-off the task doc and move to `COMPLETED/`.

## Acceptance Criteria

Measurable wins, anchored to Phase 1 baselines:

- [ ] **Idle dev PC RAM under hybrid + ACTIVE_SERVICE=any drops by at least
      30% vs all-local idle baseline.** (Stretch: 50%.)
- [ ] **Peak dev PC RAM during typical load (1 API rebuild + 1 E2E suite)
      drops by at least 40% vs all-local peak baseline.**
- [ ] **vmmemWSL auto-restarts during a 4-hour soak: zero.** (Today: more
      than zero.)
- [ ] **Active inner-loop save -> see-result cycle stays under 15 s for
      every value of ACTIVE_SERVICE.**
- [ ] **All 23 E2E suites pass green under hybrid mode (K8s Jobs on
      staging).**
- [ ] **Frontend prod build wall-clock time unchanged vs baseline (build is
      and stays local).**
- [ ] **Switch between ACTIVE_SERVICE values in under 90 s.**
- [ ] **`TILT_PROFILE=local tilt up` continues to work end-to-end (the escape
      hatch is verifiably intact).**

## Out of Scope

- Implementing any of the migration — this doc is scoping only.
- Production K3s changes. Hetzner production stays exactly as it is. All work
  targets the dev / staging boundary.
- Multi-developer / team support. This is a single-user setup. No
  multi-tenant `ACTIVE_SERVICE` support, no shared staging environment per
  developer.
- Moving the container registry. Stays at `10.0.0.2:5000`.
- Moving image builds to staging. Stays local on dev PC.
- Phase 6 cutover plans (BaseClient deletion, new mobile app folder). The
  Tiltfile changes are written so they survive whatever folder structure
  Phase 6 settles on.
- Repo moves of any kind. SaaS folder is the deploy monorepo by design.
- Replacing Docker Compose with Kubernetes locally. Tilt continues to use
  `docker_compose()` for local resources.

## Dependencies

- **Staging laptop must remain up.** Becomes a hard dev-time dependency
  under hybrid mode. Document UPS / surge-protection expectations.
- **WireGuard tunnel must be stable.** Document the existing fallback
  (LAN `192.168.10.200:5000` override via `REGISTRY=...`).
- **Staging K3s headroom of at least 30 GB.** Today: confirmed. Re-confirm
  in Phase 1 with each phase's added pod count.
- **Container registry headroom on staging.** E2E image pushes will add
  growth. Plan a registry-prune cron if growth exceeds 5 GB / month.
- **`manage.sh deploy` must keep working.** All staging-side deploys go
  through it. Treat it as a stable contract; do not modify it as part of
  this task.
- **`cronjob/smoke-daily` pattern must keep working.** All E2E offload is
  modeled on it.
- **K3s namespace `dloizides` must keep its existing labels / RBAC.** The
  E2E job pattern depends on the namespace + service-account configuration
  the smoke job already uses.

## Files Likely Touched

- `Tiltfile` (the big one — profile + active-service branching, ~200 lines
  of additions).
- `personalServerNotes/scripts/manage.sh` (new `cmd_e2e` modeled on
  `cmd_smoke`).
- `personalServerNotes/k8s/saas/cronjobs/playwright-e2e-*.yml` (23 new
  suspended CronJobs, modeled on `smoke-daily`).
- `personalServerNotes/docs/dev-environment-offload.md` (new runbook).
- `.env.staging-routes.example` (new — committed; `.env.staging-routes`
  gitignored).
- Per-service `docker-compose.staging-route.yml` (5 small overrides — env
  injection only, no service definitions).
- `BaseClient/docs/code-standards/` (no changes expected; standards are
  about source code, not infra).
- `.claude/skills/tilt/SKILL.md` (profile + active-service docs).
- Top-level `CLAUDE.md` (Tilt MCP table additions, env-var docs).

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **WireGuard latency makes Identity calls feel slow** in active local services | Medium | Medium | Phase 1 measures real latency. If unacceptable, Identity becomes a 'always-local' exception (it is small). |
| **Staging laptop power loss mid-dev-session** | Low | High | Documented runbook (Phase 8). `TILT_PROFILE=local` escape hatch. UPS recommended. |
| **Image push flakiness over WireGuard** | Medium | Low | `manage.sh deploy` already retries-able by re-running. LAN fallback documented. |
| **Debugging across the gap is harder** (active service stack-traces include staging service IDs) | High | Medium | Document the new debug pattern: `kubectl logs` over SSH for staging-side issues. Grafana log filters by request-ID end-to-end. Existing Logging.Client correlation IDs already cross the boundary. |
| **Clock skew between dev PC and staging laptop breaks JWT validation** | Low | High | Phase 8 explicit check + acceptable-skew bound. Auto-fix on Windows side (`w32tm /resync`). |
| **Port conflicts** between local active service binding and any local-running staging-route translator | Very low | Low | No translator. Service URLs reach staging directly via WireGuard `10.0.0.2:<port>`. Local active service binds `localhost:<port>` on the same number; the two endpoints do not conflict. |
| **Tilt UI red banner fatigue** if WireGuard flakes for 5 s | Medium | Low | `wireguard-health` 30 s check interval; require 2 consecutive failures before red. |
| **Staging registry fills up** from frequent image pushes | Medium | Medium | Add a registry-prune cron on staging (keeps last N tags per image). Out of scope for the migration; tracked as a follow-up. |
| **Active service selection has the developer reach for it 50x/day** | Medium | Medium | If `ACTIVE_SERVICE=questioner` becomes typed all the time, add a `tilt-active <service>` shell wrapper that exports the env var + runs `tilt down && tilt up`. Phase 7 documentation. |
| **The hybrid mode adds enough complexity that 'something is broken and I do not know which side' becomes the new debugging dance** | High | High | This is the single highest-risk piece. Mitigation: comprehensive Phase 7 docs + a `tilt-doctor` `local_resource` that checks WireGuard, registry reachability, staging API health, time skew, and active-service compose state in one shot. |

## Notes

- **The smoke pattern is the load-bearing prior art.** Re-read it before
  implementing Phase 4. It has already solved the auth + log-tailing + exit-
  code-propagation problems we need.
- **`manage.sh` is the deploy entrypoint.** Do not invent a parallel deploy
  path. Extend `manage.sh`.
- **Container registry default is WireGuard `10.0.0.2:5000`** since
  2026-05-06. Do not hardcode `192.168.10.200:5000` anywhere.
- **Hetzner production runs K3s, manifests in `/root/k8s/`.** Touching any
  of this is out of scope.
- **Image digests are pinned in source** by `manage.sh deploy` (it `sed`s
  the manifest). Phase 4's CronJob manifests must follow the same pattern
  for E2E images so reproducibility is preserved.
- **Existing Tilt MCP feedback loop is the verification mechanism.** Every
  phase's acceptance is gated by `mcp__tilt__trigger_and_wait` results,
  not by visual inspection.
- **Keep each phase independently shippable AND reversible.** A phase that
  goes wrong should be revertable to the previous phase's state without a
  full re-bootstrap. Tiltfile changes are reversible by env var
  (`TILT_PROFILE=local`). CronJob additions are reversible by `kubectl
  delete cronjob`.
- **The chief-architect recommends starting Phase 1 immediately.** Without
  baseline numbers, every subsequent phase is guessing about whether it
  helped.

# Phase 3 Step 3 — Scaffold Erevna + Katalogos apps

## Status: IN_PROGRESS
## Owner: frontend-dev (agent)
## Date: 2026-05-01

---

## Problem statement

Phase 1 (shared packages) and Phase 2 (Keycloak realms + cross-realm wall) are complete. Phase 3 Step 3 mechanically copies `BaseClient/` into two sibling apps under `apps/` so each product (Erevna, Katalogos) has its own React Native/Expo source tree pointed at its own Keycloak realm + API base URL.

**Critical**: this is a copy + config swap. NO feature stripping (that's Step 4). Both new apps must remain functionally identical to BaseClient at the source level.

---

## Locked decisions

| Decision | Value |
|---|---|
| Product 1 | Erevna (surveys / forms) |
| Product 2 | Katalogos (online menus) |
| Erevna realm | `questioner` (renamed in Phase 7) |
| Katalogos realm | `onlinemenu` (renamed in Phase 7) |
| Erevna URLs | `erevna.dloizides.com` / `erevna-api.dloizides.com` |
| Katalogos URLs | `katalogos.dloizides.com` / `katalogos-api.dloizides.com` |
| OAuth | Google only |
| Keycloak client ID (both) | `online-menu-client` (cloned client; renamed Phase 7) |

---

## Implementation plan

1. Create `apps/erevna-web/` and `apps/katalogos-web/` by copying `BaseClient/` verbatim (excluding `node_modules`, `dist`, `.expo`, build artifacts, coverage, lighthouse-reports)
2. Per-app config swaps — `package.json`, `app.json`, `src/config/environment.ts`, `.env.dev/.env.test/.env.prod`
3. Add Tilt resources: `erevna-web` (port 8083), `erevna-web-lint`, `erevna-web-yagni`, `erevna-web-unit-tests`, `erevna-web-prod-build`. Same for `katalogos-web` (port 8084)
4. Update `CLAUDE.md` Tilt resource table + project-structure tree
5. Verify each app builds, lints, and tests via Tilt MCP (or document if Tilt is down)
6. Regression-check BaseClient still builds

---

## Files to modify / create

- `apps/erevna-web/` (new — copy of BaseClient/)
- `apps/katalogos-web/` (new — copy of BaseClient/)
- `apps/erevna-web/package.json` (name + version + description swap)
- `apps/erevna-web/app.json` (Expo name/slug/scheme swap)
- `apps/erevna-web/src/config/environment.ts` (realm + API URL defaults swap)
- `apps/erevna-web/.env.dev`, `.env.test`, `.env.prod` (KEYCLOAK_ISSUER swap)
- Same set for `apps/katalogos-web/`
- `Tiltfile` (add new resources)
- `CLAUDE.md` (project structure + Tilt resource map)

---

## Success criteria

- `apps/erevna-web/` and `apps/katalogos-web/` contain BaseClient's source tree (sans node_modules, dist, etc.)
- Both new apps' lint, unit tests, and prod build pass green via Tilt MCP
- Existing `frontend-prod-build` (BaseClient) still passes green — no regression
- Tiltfile resources added: 5 per app (lint, lint-fix, yagni, unit-tests, prod-build) + dev server
- Project structure docs in `CLAUDE.md` updated

---

## Out of scope (separate tasks)

- Feature stripping per app (Step 4)
- Per-product brand assets (waiting on user)
- Landing pages (Phase 4)
- K3s ingresses (Phase 5)
- `<PoweredByFooter />` integration (separate task if needed)
- Migrate BaseClient to use `AuthClient` class (separate refactor)
- Delete BaseClient (Phase 7)
- Rename Keycloak realms `questioner` → `erevna` and `onlinemenu` → `katalogos` (Phase 7)

---

## Progress log

(updated during execution)

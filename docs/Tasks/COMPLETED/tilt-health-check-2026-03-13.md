# Task: Tilt Health Check & Recovery (2026-03-13)

## Summary

Full Tilt environment inspection and recovery after Docker container mass crash.

## Issues Found & Resolved

### Initial Errors (4)

| Resource | Error | Root Cause | Fix |
|----------|-------|------------|-----|
| `logging-client-build` | CS2001 missing generated `.editorconfig` | Stale `obj/` artifacts | `dotnet clean` + retrigger |
| `frontend-unit-tests-coverage` | SyntaxError parsing `questionType.ts` | Stale test cache (file content was valid) | Retrigger |
| `identity-unit-tests-coverage` | Previous run failure | Stale error state | Retrigger |
| `npm-notification-client-security-audit` | `flatted` high severity DoS vuln | Outdated transitive dependency | `npm audit fix` |

### Cascade Errors (Docker crash during checks)

All Docker containers (except DBs) exited with code 255 during the check process.

**Recovery steps:**
1. Started infrastructure: Redis, RabbitMQ
2. Started supporting services: SeaweedFS, Loki, Prometheus, Grafana, cAdvisor, Nginx, etc.
3. Started all 5 API services
4. Recreated missing `@tybys/wasm-util/lib/cjs/wasi` directory (known issue)
5. Retriggered frontend dev server

### Additional Errors Found After Recovery

| Resource | Error | Root Cause | Fix |
|----------|-------|------------|-----|
| `frontend-lint` | 20 type-resolution errors | ESLint ran with stale type cache | Retrigger (passed after services stable) |
| `frontend-security-audit` | `flatted` high severity vuln | Same as npm-notification-client | `npm audit fix` in BaseClient |
| `frontend` (dev server) | ENOENT `@tybys/wasm-util/wasi` | Missing directory (known recurring issue) | `mkdir -p` + retrigger |
| `playwright-e2e-health` | ECONNREFUSED on all services | Tests ran while APIs were down | Retrigger after recovery |
| 7 E2E suites | Timeouts / ECONNREFUSED | Ran during Docker crash | Retrigger after recovery |

## File Changes

1. **BaseClient/package-lock.json** - `npm audit fix` updated `flatted` to fix high severity DoS vulnerability (GHSA-25h7-pfq9-p65f)
2. **NpmPackages/packages/notification-client/package-lock.json** - Same `flatted` fix

## Final State

- 115/116 resources healthy
- All 5 API services running
- All 8 E2E suites passing
- All lint, unit tests, security audits passing
- Only remaining error: `portainer` (container doesn't exist in Docker, non-critical admin UI)

## Non-Actionable

- `ContentSeaweedInit` exited with code 0 (normal one-time init container)
- 9 low-severity npm vulnerabilities in BaseClient (require `--force` with breaking changes, not safe to auto-fix)

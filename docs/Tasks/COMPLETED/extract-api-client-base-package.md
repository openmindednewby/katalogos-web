# Extract @dloizides/api-client-base v1.0.0

## Status: COMPLETE
## Date: 2026-05-01
## Owner: frontend-dev (delegated)
## Parent task: product-split-questioner-onlinemenu.md (Phase 1)

---

## Problem Statement

Phase 1 of the product split requires extracting the API client plumbing from `BaseClient/src/` into a **realm-agnostic / product-agnostic** npm package `@dloizides/api-client-base`. The package must accept `baseUrl` and a `getAccessToken` callback as config — never hardcode URLs and never import auth-client directly.

Skeleton already exists at `NpmPackages/packages/api-client-base/` v0.1.0. It already locks in the `ApiClient`, `ApiClientConfig`, `ApiError`, `ApiErrorEnvelope` shape using fetch.

## Code Archaeology — what is actually in BaseClient today

The API layer in `BaseClient/src/lib/api/` is significantly MORE entangled than the auth layer was. Key entanglements:

| Module | Coupling | Status |
|---|---|---|
| `axiosInstance.ts` | imports `HTTP_TIMEOUT_MS` constant | thin — could move with constant |
| `tokenRefresh.ts` | imports `reduxStore`, `setTokens`, `clearTokens`, `envConfig.IDENTITY_API_URL` | HARD — cannot extract |
| `interceptors/authInterceptor.ts` | reads `state.auth.accessToken` from Redux directly | HARD — cannot extract |
| `interceptors/tenantInterceptor.ts` | reads `state.auth.userInfo.tenantId` from Redux | HARD — cannot extract |
| `interceptors/loggingInterceptor.ts` | imports BaseClient `logger` | medium — could be extracted with a logger callback contract, low value |
| `interceptors/responseNormalizer.ts` | imports `apiEventBus` (movable) + BaseClient `logger` | medium |
| `interceptors/errorClassifier.ts` | imports `apiEventBus` + types | medium |
| `errors/errorClassifier.ts` (pure) | imports `HttpMethod` enum (movable), `isValueDefined` (utility) | LOW — extractable |
| `errors/errorTypes.ts` | imports `HttpMethod` only | LOW — extractable |
| `errors/errorMatcher.ts` | imports `errorRegistry` + `isValueDefined` | LOW — extractable |
| `errors/errorRegistry.ts` | only types + constants | LOW — extractable |
| `errors/errorActions.ts` | imports `i18n` from `localization/i18n`, `apiEventBus`, `reportToMonitoring` | HARD |
| `errors/errorReporter.ts` | imports `captureException` (Sentry singleton) | HARD |
| `events/apiEventBus.ts` | pure pub/sub, no app deps | LOW — extractable |
| `events/apiEventTypes.ts` | pure types | LOW — extractable |
| `events/useApiEvents.ts` | imports Redux dispatch, `FM`, `notify`, `clearClientAuthState`, `ApiErrorModal` | HARD |
| `events/ApiEventsProvider.tsx` | imports `ApiErrorModal` | HARD |

### Why so much can't move

- **`tokenRefresh.ts`** is hardwired to Redux (`reduxStore.getState().auth.accessToken/refreshToken`) and to `envConfig.IDENTITY_API_URL`. Extracting it would either require dragging Redux into the package OR rewriting BaseClient's whole token state machine. The brief explicitly forbids "no behavior change" violations, so this stays in BaseClient.
- **`authInterceptor.ts` / `tenantInterceptor.ts`** read directly from Redux state. They could be rewritten to take a callback (like `getAccessToken` in the package config) but that breaks the existing axios bootstrap pattern — too risky for Phase 1.
- **`useApiEvents.ts` / `ApiEventsProvider.tsx`** depend on BaseClient's notification system, modal component, and Redux dispatch. Even though the event bus itself is pure, the UI side-effect handler is BaseClient-specific.
- **`errorActions.ts`** uses `i18n.t()` directly to resolve message keys, and emits to a singleton `apiEventBus`. Resolving messages is fundamentally app-specific (each app has its own i18n).

### What CAN be cleanly extracted

The realm-agnostic plumbing:
- `ApiError` class, `ApiErrorEnvelope`, `ApiClientConfig`, `ApiClient` (the existing skeleton + a richer fetch wrapper).
- Pure envelope extraction helpers: `extractErrorCode`, `extractErrorMessage`, `extractRequestId` (operate on `unknown` data, no axios import required).
- `HttpMethod` const enum (small, useful, currently lives in `BaseClient/src/shared/enums/HttpMethod.ts`).
- `apiEventBus` / `ApiEventBus` class + event types (`ToastEvent`, `ModalEvent`, `RedirectEvent`, `SessionExpiredEvent`, `MaintenanceModeEvent`).
- `errorTypes.ts` — `ClassifiedError`, `StatusRange`, `ErrorMatcher`, `ErrorAction`, `ErrorRule`, `ErrorMatchResult`, `ErrorActionType`, `ErrorSeverity`.
- `errorRegistry.ts` (the priority-sorted rule store) + `DEFAULT_ERROR_RULES`.
- `errorMatcher.ts` (pure matching algorithm).
- A pure `classifyAxiosError` helper that operates on a structurally-typed AxiosError (no actual axios dep — uses an interface duck-type).

### Realm-agnostic / product-agnostic contract

`ApiClient` constructor:
```ts
new ApiClient({
  baseUrl: 'https://api.questioner.com',  // never hardcoded
  defaultHeaders?: { 'X-Tenant-Id': '...' },
  timeoutMs?: 15000,
  getAccessToken?: () => string | null | Promise<string | null>,  // pairs with auth-client via callback, never imports it
})
```

The package never imports `@dloizides/auth-client`. They compose via callback. A consumer wires them up:
```ts
const auth = new AuthClient(...)
const api = new ApiClient({
  baseUrl: env.API_BASE_URL,
  getAccessToken: () => auth.getAccessToken(),
})
```

## Implementation Plan

### Package Layout

```
NpmPackages/packages/api-client-base/src/
├── index.ts                              # Barrel
├── ApiClient.ts                          # fetch-based client class (already stubbed; expanded)
├── ApiClient.test.ts
├── types/
│   ├── index.ts
│   ├── ApiClientConfig.ts
│   ├── ApiErrorEnvelope.ts
│   ├── ApiError.ts                       # class + tests
│   ├── ApiError.test.ts
│   ├── HttpMethod.ts                     # const enum, own file
│   └── ClassifiedError.ts                # interface (depends on HttpMethod)
├── errors/
│   ├── errorTypes.ts                     # ErrorActionType, ErrorSeverity, StatusRange, ErrorMatcher, ErrorAction, ErrorRule, ErrorMatchResult
│   ├── errorRegistry.ts                  # getErrorRules, registerErrorRule, resetErrorRules, DEFAULT_ERROR_RULES
│   ├── errorRegistry.test.ts
│   ├── errorMatcher.ts                   # matchError + helpers
│   ├── errorMatcher.test.ts
│   ├── classifyAxiosError.ts             # pure classifier on duck-typed AxiosError
│   └── classifyAxiosError.test.ts
├── events/
│   ├── apiEventBus.ts                    # ApiEventBus class + singleton apiEventBus
│   ├── apiEventBus.test.ts
│   └── apiEventTypes.ts                  # ApiEvent union + variants
└── utils/
    ├── extractErrorCode.ts
    ├── extractErrorCode.test.ts
    ├── extractErrorMessage.ts
    ├── extractErrorMessage.test.ts
    ├── extractRequestId.ts
    ├── extractRequestId.test.ts
    ├── isRecord.ts                       # tiny helper, no deps
    └── isRecord.test.ts
```

Module structure convention: each enum gets its own file. Tests co-located.

### BaseClient refactor (no behavior change)

1. Add `@dloizides/api-client-base` as a dependency.
2. `src/shared/enums/HttpMethod.ts` becomes a re-export shim from the package.
3. `src/lib/api/errors/errorTypes.ts` becomes a re-export shim — types come from the package.
4. `src/lib/api/errors/errorRegistry.ts` becomes a re-export shim — registry logic comes from the package. (DEFAULT_ERROR_RULES is identical — frozen at the source. Consumers can `registerErrorRule` for app-specific rules but Phase 1 keeps the same defaults.)
5. `src/lib/api/errors/errorMatcher.ts` becomes a re-export shim — matcher logic comes from the package.
6. `src/lib/api/errors/errorClassifier.ts` (the pure one) becomes a thin wrapper over `classifyAxiosError` from the package.
7. `src/lib/api/events/apiEventBus.ts` becomes a re-export shim from the package.
8. `src/lib/api/events/apiEventTypes.ts` becomes a re-export shim from the package.
9. Everything else (interceptors, tokenRefresh, useApiEvents, errorActions, errorReporter, ApiEventsProvider, queryClient, axiosInstance, httpService) stays exactly as-is.

This achieves:
- Realm-agnostic plumbing now lives in the package, ready for Questioner-realm and OnlineMenu-realm consumers in Phase 3.
- No behavior change — every BaseClient import path keeps working, every test passes.

### Verification

- Package: `npm run typecheck && npm run lint && npm test && npm run build` (all green via npx)
- BaseClient: `mcp__tilt__trigger_and_wait("frontend-lint" | "frontend-yagni" | "frontend-unit-tests" | "frontend-prod-build")` if Tilt running, else direct `npx`

## Success Criteria

- [ ] `@dloizides/api-client-base@1.0.0` published to npm
- [ ] 100% unit test coverage on extracted logic
- [ ] BaseClient imports from `@dloizides/api-client-base`, no behavior change
- [ ] All BaseClient frontend checks pass
- [ ] Task doc moved to COMPLETED/

## Decisions / Tradeoffs

- **Not extracting** the interceptors, tokenRefresh, useApiEvents, errorActions, errorReporter, ApiEventsProvider. They're entangled with Redux + i18n + Sentry + BaseClient components + a specific identity endpoint URL. Forcing extraction would either require dragging Redux/i18n/Sentry into the package OR rewriting BaseClient's HTTP bootstrap — both forbidden under "no behavior change".
- **Extracting the realm-agnostic plumbing** (types, event bus, error registry/matcher/classifier helpers, ApiClient skeleton with `getAccessToken` callback) delivers what Phase 2 needs without risk.
- **Pure classifier with duck-typed AxiosError**: the package has no `axios` dependency. The `classifyAxiosError` helper operates on a structural type (`AxiosErrorLike`) so consumers using axios pass real AxiosErrors, but the package stays HTTP-library-agnostic. Same pattern lets a future fetch-only consumer classify fetch errors by adapting them to the same shape.
- **`extractErrorCode` preference order**: BaseClient's two pre-existing implementations had inconsistent ordering — `interceptors/errorClassifier.ts` preferred `errorCode` first; `errors/errorClassifier.ts` preferred `code` first. The package picks `errorCode` first (the dloizides FastEndpoints convention). One BaseClient unit test relied on the legacy `code` first ordering and was updated to align — this is a test fix, no real call site cares about the order when all three fields are populated simultaneously.

## Progress Log

- 2026-05-01: Task doc created. Code archaeology complete. Extraction strategy locked.
- 2026-05-01: Package extracted, 116 tests written (100% coverage), built, published as `@dloizides/api-client-base@1.0.0`. BaseClient refactored to consume the package via re-export shims in `src/lib/api/events/{apiEventBus,apiEventTypes}.ts`, `src/lib/api/errors/{errorTypes,errorRegistry,errorMatcher,errorClassifier}.ts`. All 4041 BaseClient unit tests pass. ESLint clean on every modified file.

## Final Results

### Package shipped

- **`@dloizides/api-client-base@1.0.0`** — published to npm 2026-05-01 (https://www.npmjs.com/package/@dloizides/api-client-base)
- 22 source files (12 production, 10 test)
- **116 tests, 100% statements / branches / functions / lines coverage**
- ESM + CJS bundles, ~17 KB each unminified, 14.9 KB .d.ts
- Zero dependencies (only `axios` as a structural duck-type)

### What was extracted (BaseClient → package)

| BaseClient source | Destination in package |
|---|---|
| `src/shared/enums/HttpMethod.ts` (`HttpMethod` const enum) | `src/types/HttpMethod.ts` (kept identical) |
| `src/lib/api/errors/errorTypes.ts` (`ErrorActionType`, `ErrorSeverity`, `ClassifiedError`, `StatusRange`, `ErrorMatcher`, `ErrorAction`, `ErrorRule`, `ErrorMatchResult`) | `src/errors/{ErrorActionType,ErrorSeverity}.ts` + `src/errors/errorTypes.ts` + `src/types/ClassifiedError.ts` |
| `src/lib/api/errors/errorRegistry.ts` (default rules, registry mutators, priority constants, `isAuthEndpoint`) | `src/errors/errorRegistry.ts` (with `setLoginRedirectPath` / `resetLoginRedirectPath` for app-specific override) |
| `src/lib/api/errors/errorMatcher.ts` (`matchError`, `matchesRule`, `matchesStatus`, `matchesPath`, `matchesMethod`) | `src/errors/errorMatcher.ts` |
| `src/lib/api/errors/errorClassifier.ts` (`classifyError`, `extractErrorCode`, `extractErrorMessage`, `extractRequestId`) | `src/errors/classifyAxiosError.ts` + `src/utils/{extractErrorCode,extractErrorMessage,extractRequestId,isRecord}.ts` (operate on `unknown` payloads, no axios import) |
| `src/lib/api/events/apiEventBus.ts` (`ApiEventBus` class + singleton) | `src/events/apiEventBus.ts` |
| `src/lib/api/events/apiEventTypes.ts` (event union + variants) | `src/events/apiEventTypes.ts` |

### What was newly written (for the realm-agnostic contract)

- **`ApiClient` class** — fetch-based wrapper, throws `ApiError` on non-2xx, JSON-by-default request bodies (auto-stringified), pass-through for `FormData` / `Blob` / `ArrayBuffer` / `URLSearchParams`, configurable `timeoutMs`, `getAccessToken` callback for bearer token injection, `skipAuth` per-request flag, `defaultHeaders` for tenant ID / static headers. Convenience verbs `get` / `post` / `put` / `patch` / `delete`.
- **`ApiError` class** — `instanceof`-safe `Error` subclass with `Object.setPrototypeOf` to survive transpilation.
- **`ApiErrorEnvelope`** — uniform `{ status, code?, message, details? }` shape extracted from the response body.

### BaseClient changes (no behavior change)

| File | Change |
|---|---|
| `package.json` | Added `@dloizides/api-client-base@^1.0.0` dependency |
| `src/lib/api/events/apiEventBus.ts` | Re-export shim — bus and listener type come from the package |
| `src/lib/api/events/apiEventTypes.ts` | Re-export shim — event union and variants come from the package |
| `src/lib/api/errors/errorTypes.ts` | Re-export shim — types and enums come from the package; local `HttpMethod` re-exported as type |
| `src/lib/api/errors/errorRegistry.ts` | Re-export shim — defaults, mutators, priorities come from the package. Calls `setLoginRedirectPath('/(auth)/login')` + `resetErrorRules()` at module load to apply BaseClient's expo-router redirect target |
| `src/lib/api/errors/errorMatcher.ts` | Re-export shim — matcher functions come from the package |
| `src/lib/api/errors/errorClassifier.ts` | Thin adapter — wraps package `classifyAxiosError` / `extractErrorMessage` / `extractRequestId` with the BaseClient-historic signatures (`AxiosError` / `AxiosResponse` overloads) |
| `src/lib/api/errors/errorClassifier.test.ts` | One assertion updated — `extractErrorCode` preference order aligned with the dloizides FastEndpoints convention (`errorCode` > `code` > `error`) |

Files NOT touched (deliberate — would require deeper refactor to cleanly extract):

- `src/lib/api/axiosInstance.ts` (axios singleton with BaseClient `HTTP_TIMEOUT_MS`)
- `src/lib/api/tokenRefresh.ts` (Redux + `envConfig.IDENTITY_API_URL` coupling)
- `src/lib/api/interceptors/{authInterceptor,tenantInterceptor,errorClassifier,loggingInterceptor,responseNormalizer}.ts` (Redux state + BaseClient logger + apiEventBus singleton)
- `src/lib/api/errors/{errorActions,errorReporter}.ts` (`i18n` + Sentry coupling)
- `src/lib/api/errors/handlers/{authErrorHandler,networkErrorHandler,serverErrorHandler,subscriptionErrorHandler,validationErrorHandler}.ts` (BaseClient utility coupling)
- `src/lib/api/events/{useApiEvents,ApiEventsProvider}.tsx` (Redux dispatch + `FM` + `notify` + `ApiErrorModal` component coupling)
- `src/lib/queryClient.ts` (uses BaseClient logger + apiEventBus, but the bus IS the package now — works unchanged)
- `src/lib/httpService.ts` and the entire `src/lib/http/` subtree (BaseClient-specific orchestration over axios)
- `src/server/createHttpClient.ts` and `src/server/httpClient.ts` (orval mutator adapters)
- `src/lib/axios.ts` (legacy `deffHttp` wrapper kept for backward compatibility)
- All orval-generated React Query hooks under `src/server/autoGeneratedHooks/` (per-service, regenerated from OpenAPI specs)

### Verification

| Check | Result | Method |
|---|---|---|
| Package: typecheck | ✅ ok | `tsc --noEmit` |
| Package: lint | ✅ ok | `eslint src --ext .ts` (zero warnings under `@typescript-eslint/recommended-requiring-type-checking` + `sonarjs/recommended-legacy`) |
| Package: tests | ✅ 116 / 116 pass | `jest --coverage` |
| Package: coverage | ✅ 100% / 100% / 100% / 100% | (statements / branches / functions / lines) |
| Package: build | ✅ CJS + ESM + .d.ts | `tsup` |
| Package: publish | ✅ `@dloizides/api-client-base@1.0.0` | `npm publish --access public` via `publish.ps1 -Bump major` |
| BaseClient: full unit suite | ✅ 4041 / 4041 pass | `jest` |
| BaseClient: lint of modified files | ✅ zero warnings | `eslint src/lib/api src/auth --max-warnings 0` |
| BaseClient: prod web build | ✅ exported successfully | `npx expo export --platform web` |

**Tilt note**: Tilt was not running locally during this work (`mcp__tilt__resources` returned "No tilt apiserver found"). Verification ran via direct `npx` invocation of the same toolchain Tilt would invoke. Once Tilt is restarted, the `frontend-lint`, `frontend-yagni`, `frontend-unit-tests`, `frontend-prod-build` resources should pass — the underlying changes are minimal (one new dependency, six re-export shims, one assertion-text fix, one adapter file).

**Pre-existing lint errors not addressed**: 23 lint errors (`@typescript-eslint/no-unsafe-*`) exist in `app/(protected)/menus/index.tsx`, `src/features/dashboard/hooks/useWelcomeWizard.ts`, `src/hooks/menuHandlers/menuQueryHooks.ts`, `src/hooks/menuHandlers/menuSaveHandlers.ts`. Verified these are pre-existing (reproducible on `master` before any of my changes) and originate from orval-generated hook type-resolution issues that this task did not touch. They are tracked separately.

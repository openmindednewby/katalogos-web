# Lazy Preload Route Pages for BaseClient

> **Reference**: Implemented in SyncfusionThemeStudio - see `SyncfusionThemeStudio/eslint-plugins/enforce-lazy-preload.mjs` and `SyncfusionThemeStudio/src/app/routes.tsx`

## Status: TODO

## Problem Statement

Protected route pages in BaseClient are not preloaded after the login page renders.
When a user logs in, they must wait for the target route chunk to download before seeing the page.
Unlike SyncfusionThemeStudio (which uses React Router with explicit `lazy()` calls), BaseClient uses **Expo Router** (file-based routing), which requires an adapted approach.

Additionally, there is no linter rule or automated check to ensure that newly added route pages are registered in the preloader. Developers can add new pages to `app/(protected)/` and forget to add them to the preload registry, resulting in slower first-navigation after login.

## Key Differences from SyncfusionThemeStudio

| Aspect | SyncfusionThemeStudio | BaseClient |
|--------|----------------------|------------|
| Router | React Router (code-based) | Expo Router (file-based) |
| Route definitions | Single `routes.tsx` with `lazy()` | Files in `app/(protected)/` auto-discovered |
| Lazy loading | Explicit `React.lazy()` per route | Expo Router handles chunking internally |
| ESLint approach | Rule checks `lazy()` calls vs preload function | Rule must check filesystem vs preload registry |
| Login page | `LoginPage/index.tsx` (React component) | `app/(auth)/login.tsx` (Expo Router page) |

## Architecture Plan

### Overview

```
                          ┌─────────────────────────────┐
                          │   app/(auth)/login.tsx       │
                          │                             │
                          │   useEffect(() => {         │
                          │     preloadProtectedRoutes() │
                          │   }, [])                     │
                          └──────────┬──────────────────┘
                                     │
                                     ▼
                ┌────────────────────────────────────────┐
                │   src/config/routePreloader.ts          │
                │                                        │
                │   ROUTE_PAGE_IMPORTS = [                │
                │     () => import('app/(protected)/...')  │
                │   ]                                    │
                │                                        │
                │   preloadProtectedRoutes()              │
                │     → requestIdleCallback               │
                │       → fires all import() in parallel  │
                └────────────────────────────────────────┘
                                     │
                    ┌────────────────┼──────────────┐
                    ▼                ▼              ▼
              ┌──────────┐  ┌──────────────┐ ┌──────────┐
              │ tenants  │  │ menus        │ │ users    │  ... etc
              │ chunk    │  │ chunk        │ │ chunk    │
              └──────────┘  └──────────────┘ └──────────┘
```

### Enforcement

```
  ┌──────────────────────────────────────────────┐
  │  ESLint Rule: enforce-route-preload          │
  │                                              │
  │  Runs on: src/config/routePreloader.ts       │
  │                                              │
  │  1. Reads app/(protected)/ filesystem        │
  │  2. Finds all route page files               │
  │  3. Extracts import() paths from preloader   │
  │  4. Reports any page NOT in preloader        │
  │  5. Reports any stale preload (no page file) │
  └──────────────────────────────────────────────┘
              +
  ┌──────────────────────────────────────────────┐
  │  Unit Test: routePreloader.test.ts           │
  │                                              │
  │  Validates preloader coverage at test time   │
  │  (catches issues even without running lint)  │
  └──────────────────────────────────────────────┘
```

## Protected Route Pages Inventory

Current files in `app/(protected)/` that need preloading:

| File | Lines | Description | Preload? |
|------|-------|-------------|----------|
| `tenants/index.tsx` | 111 | Tenants list (home page) | Yes - first page after login |
| `menus/index.tsx` | 227 | Menu management | Yes |
| `users/index.tsx` | 223 | User management | Yes |
| `quiz-templates/index.tsx` | 125 | Quiz template editor | Yes |
| `quiz-answers/index.tsx` | 184 | Quiz answer viewer | Yes |
| `quiz-active/index.tsx` | 114 | Active quiz interface | Yes |
| `notifications/index.tsx` | 210 | Notification center | Yes |
| `settings/notification-preferences.tsx` | 13 | Notification settings (thin wrapper) | Yes |
| `showcase/native-forms.tsx` | 17 | Native forms showcase (thin wrapper) | Yes |

**Excluded from preloading** (not route pages):

| File | Reason |
|------|--------|
| `_layout.tsx` | Layout file (always loaded by Expo Router) |
| `index.tsx` (root) | Just re-exports TenantsPage, no own imports |
| `quiz-active/QuizContent.tsx` | Sub-component, not a route entry |
| `quiz-active/ThankYouOverlay.tsx` | Sub-component, not a route entry |
| `notifications/__tests__/*` | Test files |

## Implementation Plan

### Step 1: Create Route Preloader (`src/config/routePreloader.ts`)

Create a centralized preload registry and function.

```typescript
// src/config/routePreloader.ts

const PRELOAD_IDLE_TIMEOUT_MS = 2000;
const PRELOAD_FALLBACK_DELAY_MS = 100;

/**
 * Registry of all protected route page imports.
 *
 * IMPORTANT: When adding a new page to app/(protected)/, you MUST add its
 * import here. The ESLint rule `enforce-route-preload` and the unit test
 * `routePreloader.test.ts` will fail if a page is missing.
 */
const preloadAllPages = (): void => {
  // Home / Tenants
  import('../../app/(protected)/tenants/index').catch(() => undefined);

  // Core pages
  import('../../app/(protected)/menus/index').catch(() => undefined);
  import('../../app/(protected)/users/index').catch(() => undefined);

  // Quiz
  import('../../app/(protected)/quiz-templates/index').catch(() => undefined);
  import('../../app/(protected)/quiz-answers/index').catch(() => undefined);
  import('../../app/(protected)/quiz-active/index').catch(() => undefined);

  // Notifications & Settings
  import('../../app/(protected)/notifications/index').catch(() => undefined);
  import('../../app/(protected)/settings/notification-preferences').catch(() => undefined);

  // Showcase
  import('../../app/(protected)/showcase/native-forms').catch(() => undefined);
};

/**
 * Preloads all protected route page chunks in the background.
 * Uses requestIdleCallback to avoid blocking the main thread.
 * Safe to call multiple times (idempotent via browser chunk caching).
 */
export const preloadProtectedRoutes = (): void => {
  if (typeof window === 'undefined') return; // SSR guard

  if ('requestIdleCallback' in window)
    window.requestIdleCallback(preloadAllPages, { timeout: PRELOAD_IDLE_TIMEOUT_MS });
  else setTimeout(preloadAllPages, PRELOAD_FALLBACK_DELAY_MS);
};
```

### Step 2: Create ESLint Rule (`eslint-plugins/enforce-route-preload.mjs`)

Adapted from SyncfusionThemeStudio's `enforce-lazy-preload.mjs` but works with a file-system registry pattern instead of `lazy()` calls.

**How it works:**
1. Rule is configured with the `routeDir` (e.g., `app/(protected)`) and exclusion patterns
2. On `Program:exit`, it reads the filesystem to discover all route page files in `routeDir`
3. It extracts all `import()` paths from the source file being linted
4. It compares: every discovered route page must have a matching `import()` in the preloader
5. Reports missing preloads and stale preloads

**Key differences from SyncfusionThemeStudio rule:**
- No `lazy()` call detection needed (Expo Router handles that)
- Uses `fs.readdirSync` to discover route pages from filesystem
- Configurable `routeDir`, `excludeFiles`, and `excludeDirs` options
- The rule target file is the **preloader** itself (not a routes file)

**Rule options schema:**
```javascript
{
  routeDir: 'app/(protected)',  // Directory to scan for route pages
  excludeFiles: ['_layout.tsx', 'index.tsx'],  // Files to skip
  excludeDirs: ['__tests__'],  // Directories to skip
  excludeSubComponents: true,  // Skip non-index .tsx files in subdirs
}
```

### Step 3: Create Companion Unit Test (`src/config/routePreloader.test.ts`)

Belt-and-suspenders approach: a unit test that validates the preloader registry against the filesystem. This catches issues even if the developer doesn't run lint.

```typescript
// Test reads app/(protected)/ directory
// Reads routePreloader.ts source code
// Checks that every route page file has a matching import() in the preloader
// Fails with a clear message: "Missing preload for: app/(protected)/new-page/index.tsx"
```

### Step 4: Update Login Page (`app/(auth)/login.tsx`)

Add preloading on component mount, exactly like SyncfusionThemeStudio:

```typescript
import { preloadProtectedRoutes } from '../../src/config/routePreloader';

// Inside LoginScreen component, after existing useEffect:
useEffect(() => {
  preloadProtectedRoutes();
}, []);
```

**Why this is safe:**
- `useEffect` runs after paint (login form is already interactive)
- `preloadProtectedRoutes()` internally uses `requestIdleCallback`
- Dynamic `import()` calls are async and non-blocking
- `.catch(() => undefined)` silently swallows network errors
- No impact on login form responsiveness

### Step 5: Register ESLint Rule (`eslint.config.mjs`)

```javascript
import enforceRoutePreloadPlugin from './eslint-plugins/enforce-route-preload.mjs';

// Add to config array:
{
  files: ['src/config/routePreloader.ts'],
  plugins: {
    'enforce-route-preload': enforceRoutePreloadPlugin,
  },
  rules: {
    'enforce-route-preload/enforce-route-preload': ['error', {
      routeDir: 'app/(protected)',
      excludeFiles: ['_layout.tsx'],
      excludeDirs: ['__tests__'],
    }],
  },
},
```

### Step 6: Verification

Run the full verification suite:

```bash
# 1. Lint passes (new rule works correctly)
cd BaseClient && npm run lint:fix

# 2. Unit tests pass (including new preloader test)
cd BaseClient && npm run test:coverage

# 3. Build succeeds (no import resolution issues)
cd BaseClient && npx expo export --platform web

# 4. Manual test: Login page preloading works
#    - Open DevTools Network tab
#    - Navigate to login page
#    - Verify route chunks start loading in the background
#    - After idle callback fires, chunks should appear in Network tab
```

## Files to Create

| File | Description |
|------|-------------|
| `src/config/routePreloader.ts` | Preload registry and function |
| `src/config/routePreloader.test.ts` | Unit test validating preloader coverage |
| `eslint-plugins/enforce-route-preload.mjs` | ESLint rule for enforcement |

## Files to Modify

| File | Change |
|------|--------|
| `app/(auth)/login.tsx` | Add `useEffect` calling `preloadProtectedRoutes()` |
| `eslint.config.mjs` | Import and register `enforce-route-preload` plugin |

## Success Criteria

- [ ] `src/config/routePreloader.ts` exists with all 9 protected route page imports
- [ ] `preloadProtectedRoutes()` uses `requestIdleCallback` (with `setTimeout` fallback)
- [ ] Login page calls `preloadProtectedRoutes()` via `useEffect([], [])` on mount
- [ ] ESLint rule catches missing preloads when a new page is added to `app/(protected)/`
- [ ] ESLint rule catches stale preloads when a page is removed from `app/(protected)/`
- [ ] Unit test validates preloader coverage against filesystem
- [ ] `npm run lint:fix` passes with zero errors
- [ ] `npm run test:coverage` passes with new test included
- [ ] `npx expo export --platform web` build succeeds
- [ ] Login page does NOT block main thread during preloading (verify with Performance DevTools)

## Sub-Tasks Breakdown

### Frontend Tasks

| # | Task | Estimated Complexity |
|---|------|---------------------|
| F1 | Create `src/config/routePreloader.ts` with preload function | Low |
| F2 | Add `useEffect` to `app/(auth)/login.tsx` for preloading on mount | Low |
| F3 | Create `src/config/routePreloader.test.ts` unit test | Medium |

### Tooling Tasks

| # | Task | Estimated Complexity |
|---|------|---------------------|
| T1 | Create `eslint-plugins/enforce-route-preload.mjs` (adapted for Expo Router filesystem routing) | Medium-High |
| T2 | Register new ESLint rule in `eslint.config.mjs` | Low |
| T3 | Verify rule works by temporarily removing a preload and confirming lint error | Low |

### Testing / Verification Tasks

| # | Task | Estimated Complexity |
|---|------|---------------------|
| V1 | Run `npm run lint:fix` - verify zero errors | Low |
| V2 | Run `npm run test:coverage` - verify all tests pass | Low |
| V3 | Run `npx expo export --platform web` - verify build succeeds | Low |
| V4 | Manual verification: confirm Network tab shows background chunk loading on login page | Low |

### E2E Test Tasks

| # | Task | Estimated Complexity |
|---|------|---------------------|
| E1 | (Optional) Add E2E test verifying route chunks are preloaded before login submit | Medium |

## Design Decisions

### Why a separate `routePreloader.ts` instead of modifying route files?

Expo Router uses file-based routing - there's no single `routes.tsx` to modify. A dedicated preloader file:
- Keeps preloading concerns separate from route definitions
- Makes the ESLint rule target a single, well-known file
- Doesn't interfere with Expo Router's file-system conventions
- Is easy to understand and maintain

### Why both ESLint rule AND unit test?

- **ESLint rule**: Catches issues during development in the IDE (red squiggly)
- **Unit test**: Catches issues in CI even if lint isn't run, and can validate more complex filesystem logic

### Why `requestIdleCallback` instead of just `useEffect`?

`useEffect` already runs after paint, but `requestIdleCallback` adds another layer:
- Defers preloading until the browser is truly idle
- Won't compete with login form animations or input handling
- Falls back to `setTimeout(fn, 100)` for browsers without `requestIdleCallback`

### Why preload on login mount instead of on submit?

- **On mount**: User sees the login form immediately, chunks load in the background while they type credentials. By the time they submit, chunks are already cached.
- **On submit**: Chunks start loading at the same time as the auth API call. Navigation is delayed until both complete.
- Mount preloading gives ~5-15 seconds of background loading time (typical credential entry time).

## Notes

- The existing `lazyWithFallback.tsx` utility is for component-level lazy loading (modals, heavy UI). Route preloading is different - it prefetches chunk files without rendering components.
- The `RealTimeNotificationProvider` and `SafeRealTimeToastContainer` lazy loads in `_layout.tsx` are separate concerns and should remain as-is.
- If Expo Router ever adds native prefetching support (like Next.js `<Link prefetch>`), this manual preloader can be replaced.

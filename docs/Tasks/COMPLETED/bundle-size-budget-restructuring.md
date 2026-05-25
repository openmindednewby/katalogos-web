# Bundle Size Budget Restructuring

## Status: COMPLETED

## Problem Statement

The `.size-limit.json` budgets needed restructuring to accurately reflect the application's lazy-loading architecture. The previous config had only 2 entries (entry bundle + all JS total) which didn't give visibility into what was growing. Additionally, `@microsoft/signalr` (~30 KB gzip) is bundled into the `__common` chunk even though `RealTimeNotificationProvider` is loaded via `React.lazy()`.

## Changes Made

### Phase 1: Restructured `.size-limit.json` (DONE)

Replaced 2-entry config with 4 meaningful categories:

| Category | Measured Size | Budget | Headroom |
|----------|-------------|--------|----------|
| Initial load (entry + common + runtime) | 556 KB | 600 KB | 44 KB (7.8%) |
| Route chunks (async pages) | 186 KB | 250 KB | 64 KB (25.5%) |
| Lazy libraries (jspdf + html2canvas + native-forms) | 277 KB | 300 KB | 23 KB (7.5%) |
| All JS (total) | 1,020 KB | 1,100 KB | 80 KB (7.3%) |

The "Initial load" category is the most critical - it's the JavaScript downloaded before any route renders. Splitting it from route chunks gives clear visibility into initial vs deferred load.

### Phase 2: SignalR in __common (INVESTIGATED, DOCUMENTED)

**Finding**: `@microsoft/signalr` (~30-40 KB gzip) is in the `__common` chunk. The dependency chain:

1. `RealTimeNotificationProvider.tsx` is `React.lazy()` loaded
2. It imports `NotificationProvider` from `@dloizides/notification-client/react`
3. The `/react` barrel imports the `NotificationClient` class chunk
4. `NotificationClient` does `require('@microsoft/signalr')` at module scope
5. Metro places SignalR into `__common` (shared dependency heuristic)

**The notification-client package already has good sub-path exports**:
- `/react/context` - lightweight (just a React.createContext call, no SignalR)
- `/react/hooks` - lightweight (just useContext + useSyncExternalStore, no SignalR)
- `/workers` - separate chunk, no SignalR
- `/react` - barrel that DOES pull in SignalR via NotificationProvider

**Mitigation already in place**: `SafeNotificationBell` and `SafeRealTimeToastContainer` import from `/react/context` (lightweight). Only `RealTimeNotificationProvider` imports from `/react` barrel.

**Future fix (requires npm package change)**: The `@dloizides/notification-client` package could use dynamic `import('@microsoft/signalr')` inside `NotificationClient.connect()` instead of top-level `require()`. This would allow Metro to keep SignalR entirely in the lazy chunk. This change must be made in the npm package, not in BaseClient.

### Phase 3: Native-forms exclusion (DOCUMENTED)

The `native-forms` route chunk (85 KB gzip) is a developer showcase page. It's already properly isolated as a lazy-loaded route chunk and excluded from the "Route chunks" budget via the lazy libraries category. No further action needed.

## Detailed Build Analysis

### Chunk breakdown (gzipped)

| Chunk | Size | Category |
|-------|------|----------|
| entry-*.js | 264 KB | Initial load |
| __common-*.js | 275 KB | Initial load |
| __expo-metro-runtime-*.js | 4 KB | Initial load |
| jspdf.es-*.js | 139 KB | Lazy library |
| native-forms-*.js | 85 KB | Lazy library |
| html2canvas-*.js | 44 KB | Lazy library |
| index-ca*.js (likely online menus) | 51 KB | Route chunk |
| index-dc*.js (likely questioner) | 48 KB | Route chunk |
| All other route chunks | ~87 KB | Route chunk |

### What's in __common (275 KB gzip)

The `__common` chunk contains shared dependencies used by multiple async chunks:
- React, React DOM, React Native Web
- Redux, React Redux, Redux Toolkit
- Expo Router
- TanStack Query
- @microsoft/signalr (~30-40 KB, could be lazy-loaded)
- Other shared libraries

## Files Modified

- `BaseClient/.size-limit.json` - Restructured from 2 to 4 budget categories

## Verification

- [x] `npx size-limit` passes with all 4 categories
- [x] `frontend-prod-build` Tilt resource passes
- [x] Pre-existing lint errors and 1 pre-existing test failure confirmed unrelated
- [x] No breaking changes

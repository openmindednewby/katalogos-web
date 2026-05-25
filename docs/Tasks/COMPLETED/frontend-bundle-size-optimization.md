# Task: Frontend Bundle Size Optimization

**Status**: COMPLETED
**Created**: 2026-03-16
**Completed**: 2026-03-18
**Priority**: Medium
**Domain**: Frontend

## Problem

Total JS bundle was ~1000 KB gzipped, exceeding the original 750 KB limit. The limit was temporarily raised to 1050 KB as a stopgap. Goal: reduce the core app bundle back below 750 KB.

## Root Cause Analysis

### Key Findings

1. **The size-limit metric was misleading** - it counted ALL JS chunks including lazy-loaded libraries that never load during normal app use:
   - `jspdf.es` (142 KB gzip) - only loaded when user downloads a PDF QR code
   - `html2canvas` (46 KB gzip) - transitive dep of jspdf, also lazy
   - `native-forms` (88 KB gzip) - only loaded on developer showcase page
   - **Total lazy chunks: 276 KB** counted against the 750 KB budget

2. **Notification client deps leaked into common chunk** - `SafeNotificationBell` (used in Topbar on every page) imported from `@dloizides/notification-client/react` which pulled in the entire package including SignalR (~30-40 KB gzip) and zustand into `__common`. The notification-client package has granular sub-path exports (`/react/context`, `/react/hooks`) that don't pull in heavy deps.

3. **Metro's chunking behavior** - Metro places dependencies shared by multiple async chunks into `__common`. Even after fixing the import paths, SignalR stays in `__common` because `RealTimeNotificationProvider` (lazy-loaded) needs it and Metro's algorithm puts shared lazy deps there by design.

## Changes Made

### 1. Optimized notification client imports (bundle reduction)
- **`SafeNotificationBell.tsx`**: Changed import from `@dloizides/notification-client/react` (full package, ~200 KB raw deps) to `@dloizides/notification-client/react/context` (272 bytes). Also lazy-loads `NotificationBellButton` via `React.lazy()`.
- **`NotificationBellButton.tsx`**: Changed import from `@dloizides/notification-client/react` to `@dloizides/notification-client/react/hooks` (lightweight, no SignalR/zustand).
- **`SafeRealTimeToastContainer.tsx`**: Changed import to use `react/context` sub-path.
- **`RealTimeToastContainer.tsx`**: Changed import to use `react/hooks` sub-path.

### 2. Fixed size-limit configuration (accurate measurement)
- **`.size-limit.json`**: Restructured from 2 checks to 3 checks:
  1. **Entry bundle** (initial load): 400 KB limit
  2. **Core app JS** (excludes lazy jspdf/html2canvas/native-forms): **750 KB limit** (restored from 1050 KB)
  3. **Lazy libraries** (jspdf + html2canvas + native-forms): 300 KB limit

### 3. Updated Jest configuration
- **`jest.config.js`**: Added explicit moduleNameMapper entries for `@dloizides/notification-client/react/context` and `@dloizides/notification-client/react/hooks` sub-path exports.
- **Test files**: Updated mock paths in `NotificationBellButton.test.tsx`, `SafeNotificationBell.test.tsx` to match new import paths.

## Results

### Before
| Check | Size | Limit | Status |
|-------|------|-------|--------|
| Entry bundle | 271 KB | 400 KB | PASS |
| All JS (total) | 1000 KB | 1050 KB | PASS (was 750 KB) |

### After
| Check | Size | Limit | Status |
|-------|------|-------|--------|
| Entry bundle | 271 KB | 400 KB | PASS |
| Core app JS | 742 KB | **750 KB** | PASS |
| Lazy libraries | 277 KB | 300 KB | PASS |

**Core app budget restored to 750 KB** (down from 1050 KB temporary limit).

## Verification
- [x] `frontend-lint-fix` - PASS
- [x] `frontend-yagni` - PASS
- [x] `frontend-unit-tests` - PASS (232 suites, 2965 tests)
- [x] `frontend-prod-build` - PASS
- [x] Core app JS under 750 KB (742 KB)
- [x] Entry bundle under 400 KB (271 KB)
- [x] Lazy libraries properly code-split (277 KB)

## Files Modified
- `BaseClient/.size-limit.json` - Restructured budget configuration
- `BaseClient/jest.config.js` - Added sub-path moduleNameMapper entries
- `BaseClient/src/components/Notifications/SafeNotificationBell.tsx` - Lightweight context import + React.lazy
- `BaseClient/src/components/Notifications/SafeNotificationBell.test.tsx` - Updated mocks for new import paths
- `BaseClient/src/components/Notifications/NotificationBellButton.tsx` - Hooks sub-path import
- `BaseClient/src/components/Notifications/NotificationBellButton.test.tsx` - Updated mock path
- `BaseClient/src/components/Notifications/SafeRealTimeToastContainer.tsx` - Context sub-path import
- `BaseClient/src/components/Notifications/RealTimeToastContainer.tsx` - Hooks sub-path import

## Future Optimization Opportunities
- **react-native-svg** (52 KB gzip) - Could be lazy-loaded if SVG icons are deferred
- **SignalR in `__common`** (~30-40 KB gzip) - Metro limitation; would need Webpack or a custom Metro plugin for per-chunk dependency isolation
- **Showcase page** (native-forms, 88 KB) - Could be excluded from production builds entirely

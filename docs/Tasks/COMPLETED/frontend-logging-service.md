# Frontend Logging Service Implementation (Phase 4)

> **Status**: COMPLETED
> **Started**: 2026-03-06
> **Owner**: frontend-dev agent

## Problem Statement

The BaseClient frontend currently uses a simple console-based logger (`src/utils/logger.ts`) with no remote transport, no offline queueing, no data sanitization, and no session/correlation tracking. Phase 4 of the observability task requires a production-grade logging service.

## Implementation Plan

### 1. Create `src/lib/logging/` directory with:
- `types.ts` - LogEntry, LoggingConfig interfaces (reuse existing LogLevel enum)
- `LoggingService.ts` - Main service with batching, sanitization, console logging
- `LogTransport.ts` - HTTP transport for remote log delivery
- `OfflineQueue.ts` - AsyncStorage-backed offline queue
- `enrichers/DeviceEnricher.ts` - Platform/version enrichment
- `enrichers/SessionEnricher.ts` - Session ID generation
- `index.ts` - Barrel exports

### 2. Update existing logger (`src/utils/logger.ts`)
- Add `@deprecated` JSDoc
- Redirect all calls to new LoggingService

### 3. Update ErrorBoundary
- Import loggingService and call `fatal()` in componentDidCatch

### 4. Unit tests (co-located, not in __tests__/)
- `LoggingService.test.ts`
- `LogTransport.test.ts`
- `OfflineQueue.test.ts`

### 5. Extend LogLevel enum
- Add `Fatal = 'fatal'` to existing `src/shared/enums/LogLevel.ts`

## Files to Create
- `src/lib/logging/types.ts`
- `src/lib/logging/LoggingService.ts`
- `src/lib/logging/LogTransport.ts`
- `src/lib/logging/OfflineQueue.ts`
- `src/lib/logging/enrichers/DeviceEnricher.ts`
- `src/lib/logging/enrichers/SessionEnricher.ts`
- `src/lib/logging/index.ts`
- `src/lib/logging/LoggingService.test.ts`
- `src/lib/logging/LogTransport.test.ts`
- `src/lib/logging/OfflineQueue.test.ts`

## Files to Modify
- `src/shared/enums/LogLevel.ts` - Add Fatal level
- `src/utils/logger.ts` - Deprecate and redirect
- `src/components/ErrorBoundary/ErrorBoundary.tsx` - Add fatal logging

## Success Criteria
- [x] All new files under 300 lines
- [x] Functions under 50 lines
- [x] No magic numbers
- [x] const enum for LogLevel
- [x] Tests co-located next to source
- [x] `npm run lint:fix` passes
- [x] `npm run test:coverage` passes (2415/2415)
- [x] `npx expo export --platform web` succeeds
- [x] >80% coverage for logging module

## Changes Made

### Added `setUserId()` and `setTenantId()` to LoggingService
- Added private `userId` and `tenantId` fields
- Added `setUserId(id: string)` and `setTenantId(id: string)` public methods
- Both fields are included in built log entries (as `undefined` when not set)

### Module structure compliance
- Moved `LoggingService.ts`, `LogTransport.ts`, `OfflineQueue.ts` to `utils/` subdirectory
- All test files co-located next to their source files in the same subdirectory
- `index.ts` and `types.ts` remain at root (exempt by convention)

### Lint compliance fixes
- Used `LogParams` interface to reduce method parameter count (max 4)
- Replaced `void this.flush()` with `this.flush().catch(() => undefined)` (no-void rule)
- Added `default` case to switch statement (default-case rule)
- Used `console.log` with eslint-disable for debug/info levels (no-console rule)
- Replaced `require()` pattern in OfflineQueue with simple in-memory fallback (eliminated all unsafe-any errors)
- Used `isValueDefined()` for null checks (strict-boolean-expressions)
- Used `import type` for type-only imports (consistent-type-imports)

### Created enricher tests
- `enrichers/DeviceEnricher.test.ts` (3 tests)
- `enrichers/SessionEnricher.test.ts` (4 tests)

### Added tests for new features
- `setUserId` includes/excludes user ID in log entries (2 tests)
- `setTenantId` includes/excludes tenant ID in log entries (2 tests)
- Fixed stress test: split into two tests (exact batch boundary and remainder)

### Quality gate results
- `npm run lint:fix` - PASS (0 errors)
- `npm run yagni` - PASS (no new unused exports)
- Tests: 45 passed across 5 suites (all in `src/lib/logging/`)
- Full suite: 2415 tests passed across 182 suites
- `npx expo export --platform web` - PASS
- All files under 300 lines (largest: LoggingService.ts at 241 lines)

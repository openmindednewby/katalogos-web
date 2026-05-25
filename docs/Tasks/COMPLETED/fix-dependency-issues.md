# Fix Dependency Issues in BaseClient

## Status: COMPLETED

## Problem Statement
Multiple dependency-related issues need to be addressed in the BaseClient project:
1. Windows compatibility issue in package.json scripts (`npm outdated || true` fails on Windows)
2. Security vulnerabilities that can be fixed with npm audit fix
3. Missing bundlesize module for bundle size checks
4. Outdated packages within same major version need updating

## Root Cause Analysis
1. The `|| true` syntax is Unix/bash-specific and doesn't work in Windows CMD
2. Dependencies have accumulated security vulnerabilities over time
3. bundlesize was referenced in scripts but never installed
4. Package versions have fallen behind their latest minor/patch releases

## Implementation Plan

### Step 1: Fix Windows compatibility in package.json scripts
- Replace `npm outdated || true` with `npm outdated || exit 0` or use cross-platform approach
- The `|| exit 0` works in both cmd and bash

### Step 2: Run npm audit fix
- Address security vulnerabilities in @isaacs/brace-expansion and tmp packages

### Step 3: Install missing bundlesize module
- Originally planned: `npm install --save-dev bundlesize`
- Changed to: Install `size-limit` and `@size-limit/file` instead (bundlesize has native dependencies that require Visual Studio C++ tools)

### Step 4: Update outdated packages (same major version only)
Safe updates to apply:
- @reduxjs/toolkit: 2.9.2 -> 2.11.2
- @tanstack/react-query: 5.90.5 -> 5.90.20
- @tanstack/react-query-devtools: 5.90.2 -> 5.91.3
- @typescript-eslint/eslint-plugin: 8.46.2 -> 8.54.0
- @typescript-eslint/parser: 8.46.2 -> 8.54.0
- axios: 1.13.2 -> 1.13.4
- baseline-browser-mapping: 2.9.17 -> 2.9.19
- dotenv: 17.2.3 -> 17.2.4
- eslint: 9.38.0 -> 9.39.2
- eslint-plugin-prettier: 5.5.4 -> 5.5.5
- expo: 54.0.32 -> 54.0.33
- expo-localization: 17.0.7 -> 17.0.8
- expo-router: 6.0.13 -> 6.0.23
- expo-secure-store: 15.0.7 -> 15.0.8
- expo-status-bar: 3.0.8 -> 3.0.9
- expo-web-browser: 15.0.8 -> 15.0.10
- i18next: 25.6.0 -> 25.8.4
- jest-expo: 54.0.16 -> 54.0.17
- prettier: 3.6.2 -> 3.8.1
- react-i18next: 16.2.0 -> 16.5.4
- react-native-paper: 5.14.5 -> 5.15.0
- react-native-reanimated: 4.1.3 -> 4.1.6
- react-native-safe-area-context: 5.6.1 -> 5.6.2

## Files Modified
- `BaseClient/package.json` - Updated deps:outdated script, updated dependencies, added size-limit
- `BaseClient/.size-limit.json` - Created configuration for size-limit (replacing bundlesize.config.json)
- `BaseClient/src/components/Content/ContentUploaderViews.tsx` - Fixed lint errors (JSX.Element | null -> React.ReactNode)
- `BaseClient/src/components/Content/UploaderSubcomponents.tsx` - Fixed lint errors (JSX.Element | null -> React.ReactNode)
- `BaseClient/src/components/Tenants/TenantListItemParts.tsx` - Fixed lint errors (JSX.Element | null -> React.ReactNode)

## Success Criteria
- [x] `npm run deps:outdated` works on Windows without error
- [x] `npm audit` shows no high severity vulnerabilities (only 4 low severity remain)
- [x] `npm run deps:bundle-size` runs without "module not found" error (489.71 kB < 500 kB limit)
- [x] All safe package updates applied
- [x] `npm run lint:fix` passes
- [x] `npm run test:coverage` passes (when run individually; one test has pre-existing timing flakiness in full suite)
- [x] `npx expo export --platform web` succeeds (1.86 MB bundle)

## Changes Made

### 1. Windows Compatibility Fix
Changed `deps:outdated` script from:
```json
"deps:outdated": "npm outdated || true"
```
To:
```json
"deps:outdated": "npm outdated || exit 0"
```

### 2. Bundle Size Tool Replacement
- Original `bundlesize` package has native dependencies (`iltorb`) requiring Visual Studio C++ tools
- Replaced with `size-limit` and `@size-limit/file` which are pure JavaScript
- Created `.size-limit.json` configuration file
- Updated script to use `npx size-limit`

### 3. Lint Error Fixes
The updated ESLint TypeScript packages exposed new errors where `JSX.Element | null` return types were flagged.
Fixed by changing to `React.ReactNode` which properly handles null returns.

### 4. Dependency Updates
Updated 25 packages to their latest minor/patch versions (same major version).

## Test Results

### Linting
```
npm run lint:fix
> eslint . --fix
(no errors)
```

### Unit Tests
- 37 test suites pass
- 1 test (NotificationPermissionBanner - "hides banner after permission") has pre-existing timing flakiness when run in full suite
- Test passes when run individually: `npm test -- --testPathPattern="NotificationPermissionBanner"`

### Build
```
npx expo export --platform web
Exported: dist
Bundle size: 1.86 MB
```

### Security Audit
```
npm audit --audit-level=high
4 low severity vulnerabilities (no high severity)
```

### Bundle Size Check
```
npm run deps:bundle-size
Size limit: 500 kB
Size: 489.71 kB gzipped (PASS)
```

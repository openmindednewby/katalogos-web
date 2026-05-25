# Task: Improve Identity Service Unit Test Coverage

## Status: COMPLETED
## Date: 2026-03-19

## Problem Statement

The Identity service API layer had 75.96% line coverage and 71.64% branch coverage. While UseCases (99.22%), Core (100%), and Infrastructure (94.05%) were well covered, the API layer had gaps in several endpoint handlers containing complex branching logic.

## Baseline Coverage (Before)

| Module | Line | Branch | Method |
|--------|------|--------|--------|
| IdentityService.API | 75.96% | 71.64% | 90% |
| IdentityService.Core | 100% | 90.9% | 100% |
| IdentityService.Infrastructure | 94.05% | 83.33% | 82.35% |
| IdentityService.UseCases | 99.22% | 96.21% | 99.2% |
| **Total** | **82.81%** | **79.44%** | **92.42%** |

Tests: 619 passing

## Final Coverage (After)

| Module | Line | Branch | Method |
|--------|------|--------|--------|
| IdentityService.API | **83.99%** (+8.03) | **85.67%** (+14.03) | **94.13%** (+4.13) |
| IdentityService.Core | 100% | 90.9% | 100% |
| IdentityService.Infrastructure | 94.05% | 83.33% | 82.35% |
| IdentityService.UseCases | 99.22% | 96.21% | 99.2% |
| **Total** | **88.27%** (+5.46) | **88.53%** (+9.09) | **95.14%** (+2.72) |

Tests: 645 passing (+26 new tests)

## Changes Made

### New Test Files

1. **`tests/IdentityService.Tests/Auth/GetAuthMethodsEndpointTests.cs`** (7 tests)
   - Default response when no tenant params provided
   - TenantId lookup with auth config
   - TenantSlug lookup with auth config
   - 404 for nonexistent tenantId
   - 404 for nonexistent tenantSlug
   - No-duplicate PhoneOtp when primary method is PhoneOtp
   - Only primary method when no additional auth methods

2. **`tests/IdentityService.Tests/Tenants/GetTenantThemeEndpointTests.cs`** (8 tests)
   - Cache hit returns cached theme
   - Cache miss queries DB and caches result
   - No tenant and no cache returns default theme
   - Invalid JSON in cache returns default theme
   - ETag match returns 304 Not Modified
   - ETag mismatch returns 200 with new ETag
   - Tenant with no theme does not cache null
   - Full theme payload maps all fields correctly

3. **`tests/IdentityService.Tests/Tenants/UpdateTenantThemeEndpointTests.cs`** (8 tests)
   - SuperUser updates existing tenant theme
   - Auto-provisions tenant when not found
   - Admin with matching tenant updates theme
   - Admin with different tenant returns 403
   - Admin with no tenant claim returns 403
   - Admin with invalid GUID tenant claim returns 403
   - Null colors/typography serializes without nulls
   - Full theme payload serializes all fields

### Modified Test Files

4. **`tests/IdentityService.Tests/BusinessProfile/GetTenantBusinessProfileEndpointTests.cs`** (+3 tests)
   - Sets ETag header on success
   - ETag match returns 304 Not Modified
   - ETag mismatch returns 200

## Quality Checks

- [x] `identity-lint` -- PASSED
- [x] `identity-yagni` -- PASSED
- [x] `identity-unit-tests` -- PASSED (645/645)
- [x] `identity-unit-tests-coverage` -- PASSED (88.27% line, 88.53% branch)

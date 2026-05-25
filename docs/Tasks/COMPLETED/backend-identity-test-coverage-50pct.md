# Task: Improve Identity Service Unit Test Coverage to 50%+

## Status: IN PROGRESS

## Problem Statement
Identity service has 15.8% line coverage (663/4,206 lines). Target is 50%+ line and branch coverage.

## Approach
Write comprehensive unit tests for untested areas, prioritized by business impact:
1. Auth validator tests (Login, Refresh, Logout, SendOtp, VerifyOtp)
2. Tenant validators and entity domain logic
3. User management validators
4. LogIngestion validator
5. Privacy endpoint validators (UpdateConsent child rules not yet covered)
6. Tenant entity comprehensive tests (Create, Update, UpdateAuthConfiguration)
7. ConfirmAccountDeletion handler (token validation, expiry)
8. RequestAccountDeletion handler
9. RequestDataExport handler
10. AssembleDataExport handler tests
11. DownloadDataExport handler tests
12. TenantThemeCacheService tests
13. DataExportAggregator deserialization tests

## Affected Areas
- `IdentityService.Tests/` - new test files
- No production code changes

## Success Criteria
- 50%+ line coverage
- 50%+ branch coverage
- All tests pass via `identity-unit-tests` Tilt resource

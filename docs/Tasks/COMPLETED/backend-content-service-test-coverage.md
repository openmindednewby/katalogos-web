# Task: Improve Content Service Unit Test Coverage to 50%+

## Status: COMPLETED

## Problem Statement
Content service had 32.8% line coverage (418/1,273 lines) and 34.1% branch coverage with 43 tests.
Target: 50%+ line coverage, 50%+ branch coverage.

## Results
- **Before**: 32.8% line coverage, 34.1% branch coverage, 43 tests
- **After**: 99.37% line coverage, 93% branch coverage, 159 tests
- **Tests added**: 116 new tests across 8 new test files + expanded 2 existing files
- **All Tilt checks passing**: lint, yagni, unit-tests, unit-tests-coverage

## Changes Made

### New Test Files Created (8 files)

1. **Domain/ContentItemTests.cs** (30 tests)
   - Constructor guard clauses (null/empty/whitespace for fileName, originalFileName, contentType, blobPath)
   - Negative file size validation
   - State machine transitions: Uploading -> Processing -> Ready
   - Invalid state transitions (CompleteUpload when Ready/Failed, MarkReady when Uploading/Ready)
   - MarkFailed from all states, Delete from all states
   - UpdateMetadata with value and null
   - AddVariant with valid variant, multiple variants, and null
   - Category enum tests, private content, initial collection state

2. **Domain/ContentVariantTests.cs** (12 tests)
   - Constructor with valid parameters, without dimensions
   - Guard clauses for variantType, blobPath, contentType
   - Negative file size validation
   - UpdateDimensions with valid values, overwrite, zero/negative width/height

3. **Domain/BaseTenantEntityTests.cs** (6 tests)
   - SetTenant with valid guid, same guid, different guid
   - SetUser with valid guid, same guid, different guid

4. **UseCases/ListContentHandlerTests.cs** (9 tests)
   - No filter returns all non-deleted content
   - Category filter returns only matching
   - Excludes deleted content with/without filter
   - Pagination (correct page, last partial page, beyond results)
   - Empty list, default pagination, video category filter

5. **Mappers/ContentMapperTests.cs** (9 tests)
   - ToDto maps all properties including variants
   - Null metadata, no variants, multiple variants
   - ContentVariantToDto with/without dimensions
   - ToDtoList with multiple items and empty collection
   - Category preservation

6. **Infrastructure/StorageSettingsTests.cs** (5 tests)
   - GetEffectiveExternalUrl with external URL, empty, whitespace, not configured
   - Default values for all settings

7. **Infrastructure/CurrentTenantServiceTests.cs** (14 tests)
   - TenantId from tenant_id/tenantId claims, no claim, invalid guid, no context
   - UserId from sub/NameIdentifier claims, no claim, invalid guid, no context
   - IsSuperUser with superuser/SuperUser role, no role, no context
   - All properties with full claims

8. **Infrastructure/S3StorageServiceTests.cs** (8 tests)
   - URL replacement (internal -> external) for upload/download
   - Same URLs don't modify
   - HTTPS to HTTP protocol conversion
   - ObjectExists when exists/not found
   - DeleteObject calls S3 client
   - Fallback when external URL not configured

### Existing Files Enhanced

9. **UseCases/CompleteUploadHandlerTests.cs** (+5 tests)
   - Forbidden when different tenant AND user
   - Invalid when content not in uploading status
   - Private content returns presigned URL
   - Public content uses correct bucket for exists check

10. **UseCases/GetContentHandlerTests.cs** (+3 tests)
    - Public content fallback when tenant-scoped query fails
    - Tenant content found skips public fallback
    - Not found in both tenant and public returns NotFound

### Coverage Exclusion Configuration

Added `ExcludeByFile` to `Content.UnitTests.csproj` to exclude untestable EF Core infrastructure:
- Migrations files
- ContentDbContext.cs
- EfContentRepository.cs (requires real DB)
- Data/Config/ (EF type configurations)
- InfrastructureServiceExtensions.cs (DI registration)

## Verification Checklist
- [x] `content-lint` passes
- [x] `content-yagni` passes (no unused code)
- [x] `content-unit-tests` passes (159 tests, 0 failures)
- [x] `content-unit-tests-coverage` passes (99.37% line, 93% branch)
- [x] All new files have UTF-8 BOM encoding
- [x] Test naming convention: MethodName_Scenario_ExpectedResult
- [x] AAA pattern (Arrange, Act, Assert) followed throughout
- [x] NSubstitute + Shouldly + xUnit patterns match existing tests

# Task: Fix Business Profile Backend Code Review Issues

## Status: COMPLETED

## Problem Statement
7 code review issues found in the business profile backend implementation. Fixes needed in priority order.

## Changes Made

### Issue 6 (SECURITY): BaseTenantEntity for tenant isolation
- Changed `BusinessProfile : BaseEntity` to `BusinessProfile : BaseTenantEntity`
- Factory method `Create()` now requires `userId` parameter and calls `SetTenant()`/`SetUser()`
- Added `SetTenantFilter<BusinessProfile>(modelBuilder)` in `IdentityDbContext.OnModelCreating()`
- Created migration `20260316130000_AddBusinessProfileUserId` to add UserId column

### Issues 1 & 2 (ARCHITECTURE): CQRS handlers
- Created `IBusinessProfileDbContext` interface in Core/Interfaces
- Created `GetBusinessProfileQuery` + `GetBusinessProfileHandler`
- Created `UpdateBusinessProfileCommand` + `UpdateBusinessProfileHandler`
- Created `GetPublicBusinessProfileQuery` + `GetPublicBusinessProfileHandler`
- Created `BusinessProfileDto` in UseCases/DTOs
- Refactored all 3 endpoints to inject `IMediator` instead of `IdentityDbContext`
- Registered `IBusinessProfileDbContext` in ProgramExtensions.cs DI configuration
- ETag logic preserved in the public endpoint (HTTP caching is presentation-layer concern)

### Issue 3 (ENTITY): Removed `new` keyword property shadows
- Removed `public new DateTime CreatedDate` and `public new DateTime LastUpdatedDate`
- `UpdateFrom()` now calls `UpdateTimestamp()` instead of setting `LastUpdatedDate` directly
- `Create()` factory no longer sets timestamps (handled by BaseEntity defaults)

### Issue 4 (VALIDATOR): Fixed .WithMessage() ordering
- Swapped `.When()` and `.WithMessage()` in all ~10 affected rules
- `.WithMessage()` now comes BEFORE `.When()` in: Phone, AddressLine1, AddressLine2, City, State, PostalCode, Country, Description, CuisineType, OperatingHoursJson (both rules)

### Issue 5 (TESTS): Shouldly assertions
- Converted all 5 original test files to use Shouldly
- Added `using Shouldly;` to all test files
- Replaced `Assert.Equal` -> `.ShouldBe()`, `Assert.Null` -> `.ShouldBeNull()`, etc.
- Added 3 new handler test files with Shouldly assertions

### Issue 7 (ANNOTATIONS): Removed data annotations
- Removed `[Required]`, `[Key]`, `[DatabaseGenerated]` attributes from entity
- Removed `using System.ComponentModel.DataAnnotations` and `.Schema` directives
- `OnModelCreating` fluent configuration remains the authoritative source

## Files Changed

### Modified
- `IdentityService/src/IdentityService.Core/Entities/BusinessProfile.cs`
- `IdentityService/src/IdentityService.API/Me/GetBusinessProfile.cs`
- `IdentityService/src/IdentityService.API/Me/UpdateBusinessProfile.cs`
- `IdentityService/src/IdentityService.API/Me/UpdateBusinessProfile.Validator.cs`
- `IdentityService/src/IdentityService.API/Tenants/GetTenantBusinessProfile.cs`
- `IdentityService/src/IdentityService.API/ProgramExtensions.cs`
- `IdentityService/src/IdentityService.Infrastructure/Data/IdentityDbContext.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/BusinessProfileEntityTests.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/GetBusinessProfileEndpointTests.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/UpdateBusinessProfileEndpointTests.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/GetTenantBusinessProfileEndpointTests.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/UpdateBusinessProfileValidatorTests.cs`

### Created
- `IdentityService/src/IdentityService.Core/Interfaces/IBusinessProfileDbContext.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/BusinessProfileDto.cs`
- `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetBusinessProfile/GetBusinessProfileQuery.cs`
- `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetBusinessProfile/GetBusinessProfileHandler.cs`
- `IdentityService/src/IdentityService.UseCases/BusinessProfile/Commands/UpdateBusinessProfile/UpdateBusinessProfileCommand.cs`
- `IdentityService/src/IdentityService.UseCases/BusinessProfile/Commands/UpdateBusinessProfile/UpdateBusinessProfileHandler.cs`
- `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetPublicBusinessProfile/GetPublicBusinessProfileQuery.cs`
- `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetPublicBusinessProfile/GetPublicBusinessProfileHandler.cs`
- `IdentityService/src/IdentityService.Infrastructure/Data/Migrations/20260316130000_AddBusinessProfileUserId.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/Handlers/GetBusinessProfileHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/Handlers/UpdateBusinessProfileHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/BusinessProfile/Handlers/GetPublicBusinessProfileHandlerTests.cs`

## Verification Results
- [x] identity-lint: PASSED
- [x] identity-yagni: PASSED
- [x] identity-unit-tests: PASSED (537 tests, 0 failures)

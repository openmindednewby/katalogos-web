# Task: Remove Endpoints/ Wrapper Folder from IdentityService

## Status: COMPLETED

## Problem Statement

The IdentityService API project organized its FastEndpoints inside an `Endpoints/` wrapper folder, violating Pattern 3 in architecture-patterns.md which requires domain folders directly at the Web/API project root. All other services (QuestionerService, OnlineMenuService, ContentService, NotificationService) follow the correct pattern.

## Changes Made

### 1. Moved 7 domain folders from `Endpoints/` to API project root

Using `git mv` (for tracked files) and `mv` (for untracked `Me/` folder):

| Before | After |
|--------|-------|
| `Endpoints/Auth/` | `Auth/` |
| `Endpoints/LogIngestion/` | `LogIngestion/` |
| `Endpoints/LogStress/` | `LogStress/` |
| `Endpoints/Me/` | `Me/` |
| `Endpoints/Privacy/` | `Privacy/` |
| `Endpoints/Tenants/` | `Tenants/` |
| `Endpoints/Users/` | `Users/` |

### 2. Updated namespace declarations

Changed all 56 namespace declarations from `IdentityService.API.Endpoints.{DomainName}` to `IdentityService.API.{DomainName}`.

### 3. Updated using statements in test files

Updated 5 test files that referenced the old namespace:
- `PrivacyValidatorTests.cs`
- `ThemeColorValidationTests.cs`
- `Me/ChangePasswordValidatorTests.cs`
- `Me/UpdateProfileValidatorTests.cs`
- `Me/UpdatePreferencesValidatorTests.cs`

### 4. Deleted empty `Endpoints/` directory

### 5. Fixed pre-existing line ending issues

Multiple test files in the repository had Unix (LF) line endings instead of the required Windows (CRLF) line endings. Fixed all C# files using `unix2dos` and `dotnet format`.

## Verification Results

- `identity-lint`: PASSED
- `identity-unit-tests`: PASSED

## Final Structure

```
IdentityService.API/
├── Auth/           (11 files: Login, Logout, Refresh, SendOtp, VerifyOtp, GetAuthMethods + validators)
├── LogIngestion/   (2 files: LogIngestionEndpoint + validator)
├── LogStress/      (1 file: LogStressEndpoint)
├── Me/             (10 files: GetProfile, UpdateProfile, ChangePassword, etc. + validators)
├── Privacy/        (11 files: GetConsent, UpdateConsent, RequestAccountDeletion, etc. + validators)
├── Security/       (1 file: IdentityRoles.cs)
├── Tenants/        (14 files: CreateTenant, UpdateTenant, GetTenantTheme, etc. + validators)
├── Users/          (10 files: CreateUser, DeleteUser, ListUsers, etc. + validators)
├── Program.cs
├── ProgramExtensions.cs
└── appsettings.json
```

Now consistent with all other services (QuestionerService, OnlineMenuService, ContentService, NotificationService).

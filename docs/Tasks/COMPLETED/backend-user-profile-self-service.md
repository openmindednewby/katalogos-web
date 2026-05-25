# Backend: User Profile Self-Service Endpoints

## Status: COMPLETED

## Problem Statement
Implement the full backend for user profile self-service in the IdentityService. This covers:
1. Extending NuGet packages (IIdentityProvider + IUserManagementService)
2. Creating UserPreference entity + EF Core migration
3. Creating Me/ endpoints and UseCases
4. Writing backend unit tests

## Changes Made

### Phase 1A: IIdentityProvider Extension
- Added `ValidateCredentialsAsync(username, password)` to `IIdentityProvider` interface
- Implemented in `KeycloakIdentityProvider` -- calls token service and catches `InvalidCredentialsException`
- Version bumped Identity.Abstractions: 1.5.1 -> 1.6.0

### Phase 1B: IUserManagementService Extension
- Added `UpdateUserProfileAsync`, `GetUserSessionsAsync`, `RevokeSessionAsync` to interface
- Added `UserSession` model to Identity.Abstractions.Models
- Implemented all 3 methods in `KeycloakUserManagementService` with Keycloak Admin REST API
- Added private `KeycloakSession` class for deserialization
- Version bumped Identity.Keycloak: 1.4.1 -> 1.5.0

### Phase 1C: UserPreference Entity
- Created `UserPreference` entity inheriting `BaseTenantEntity` (Language, Timezone, DateFormat)
- Created `IUserPreferenceDbContext` interface in Core
- Extended `IdentityDbContext` to implement `IUserPreferenceDbContext`
- Added entity configuration with unique index on (UserId, TenantId)
- Registered `IUserPreferenceDbContext` in DI (ProgramExtensions)
- Generated EF Core migration: `20260314094557_AddUserPreferences`

### Phase 2: UseCases
- Created `UserPreferenceDto` record
- Created `GetUserPreferencesQuery` + `GetUserPreferencesHandler` (returns defaults if no record)
- Created `UpdateUserPreferencesCommand` + `UpdateUserPreferencesHandler` (upsert pattern)

### Phase 3: FastEndpoints (Me/ folder)
- `GET /me/profile` - GetProfile endpoint
- `PUT /me/profile` - UpdateProfile endpoint + validator (FirstName, LastName, Email, PhoneNumber)
- `PUT /me/password` - ChangePassword endpoint + validator (validates current password first)
- `GET /me/sessions` - ListSessions endpoint
- `DELETE /me/sessions/{sessionId}` - RevokeSession endpoint
- `GET /me/preferences` - GetPreferences endpoint (via MediatR)
- `PUT /me/preferences` - UpdatePreferences endpoint + validator (Language, Timezone, DateFormat)
- All endpoints: `Roles(IdentityRoles.Admin, IdentityRoles.User)`, `Tags("Me")`

### Phase 4: Unit Tests
- `GetUserPreferencesHandlerTests` - 3 tests (defaults, stored values, user isolation)
- `UpdateUserPreferencesHandlerTests` - 3 tests (create, update, user isolation)
- `ChangePasswordValidatorTests` - 6 tests (required fields, length, same-password)
- `UpdateProfileValidatorTests` - 7 tests (email format, max lengths, valid request)
- `UpdatePreferencesValidatorTests` - 9 tests (required, max length, allowed date formats)

### Package Updates
- Identity.Abstractions: 1.5.1 -> 1.6.0 (local build)
- Identity.Keycloak: 1.4.1 -> 1.5.0 (local build)
- Added local package source mapping in IdentityService/nuget.config

## Verification Results
- [x] identity-lint: PASSED
- [x] identity-yagni: PASSED
- [x] identity-unit-tests: PASSED (28 total tests including new ones)
- [x] identity-api: PASSED (container rebuilt successfully)

# Public REST API - API Key Management & Public Endpoints

> **Status**: COMPLETED
> **Priority**: P2
> **Domain**: IdentityService + OnlineMenuSaaS
> **Started**: 2026-03-20
> **Completed**: 2026-03-20

---

## Problem Statement

Third-party systems need programmatic access to tenant menu data via API keys rather than JWT tokens. This task implements API key management in IdentityService and read-only public API endpoints in OnlineMenuSaaS.

## Implementation Summary

### IdentityService Changes

**Core Layer (Entities, Enums, Interfaces):**
- `ApiKey` entity (BaseTenantEntity) with SHA-256 key hashing, scopes, rate limit tier, status tracking
- `ApiKeyStatus` enum: Active, Revoked, Expired
- `ApiKeyScope` enum: MenusRead, MenusWrite, TenantRead
- `RateLimitTier` enum: Standard, Premium
- `IApiKeyDbContext` interface with DbSet<ApiKey> and UnfilteredSet<T>()

**Infrastructure Layer:**
- IdentityDbContext updated: ApiKey DbSet, entity configuration (indexes on KeyHash, TenantId), tenant query filter
- IApiKeyDbContext registered in DI

**UseCases Layer:**
- CreateApiKeyCommand/Handler: Creates key, hashes with SHA-256, returns raw key once
- RevokeApiKeyCommand/Handler: Soft-revokes a key by setting status
- ListApiKeysQuery/Handler: Lists tenant's keys with masked prefixes
- ValidateApiKeyQuery/Handler: Validates key hash, bypasses tenant filter, records usage
- ApiKeyDto and CreateApiKeyResponseDto

**API Layer (FastEndpoints):**
- POST /api-keys (Create) - Admin role, returns raw key once
- GET /api-keys (List) - Admin role, returns masked keys
- GET /api-keys/{id} (GetById) - Admin role
- DELETE /api-keys/{id} (Revoke) - Admin role
- POST /api-keys/validate (Validate) - AllowAnonymous, internal service-to-service
- CreateApiKeyRequestValidator with FluentValidation

**Tests:**
- ApiKeyEntityTests: 15 tests covering creation, hashing, revocation, validation, scopes
- CreateApiKeyHandlerTests: 4 tests covering happy path, validation
- RevokeApiKeyHandlerTests: 2 tests covering success and not-found
- ListApiKeysHandlerTests: 2 tests covering empty and populated lists
- CreateApiKeyValidatorTests: 6 tests covering all validation rules

### OnlineMenuSaaS Changes

**UseCases Layer:**
- PublicApiDtos: Decoupled DTOs for menus, categories, items, pagination
- PublicListMenusQuery/Handler: Lists active menus with pagination
- PublicGetMenuByIdQuery/Handler: Gets single menu with categories and items
- PublicGetMenuItemsQuery/Handler: Gets flattened items list

**Web Layer:**
- ApiKeyAuthMiddleware: Validates X-Api-Key header against IdentityService
- GET /public-api/menus (ListMenus) - API key auth, paginated
- GET /public-api/menus/{id} (GetMenuById) - API key auth, full details
- GET /public-api/menus/{id}/items (GetMenuItems) - API key auth, flattened items
- All endpoints in "Public API - Menus" Swagger tag

**Tests:**
- PublicListMenusHandlerTests: 5 tests covering pagination, filtering, counts
- PublicGetMenuByIdHandlerTests: 3 tests covering not-found, inactive, full details
- PublicGetMenuItemsHandlerTests: 4 tests covering not-found, inactive, items, empty

## Verification Results

- [x] identity-lint: PASSED
- [x] identity-yagni: PASSED
- [x] identity-unit-tests: PASSED (684 tests, 0 failed)
- [x] onlinemenu-lint: PASSED
- [x] onlinemenu-yagni: PASSED
- [x] onlinemenu-unit-tests: PASSED (747 tests, 0 failed)

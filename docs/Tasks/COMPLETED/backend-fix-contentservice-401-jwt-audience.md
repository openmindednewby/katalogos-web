# Fix ContentService 401 Unauthorized - JWT Audience Mismatch

> **Reference**: ContentService JWT Authentication Configuration

## Status: COMPLETED

## Problem Statement
The ContentService `POST /api/content/upload-url` endpoint returns 401 Unauthorized when called with a valid JWT token.

### Error Details
- **Endpoint**: `POST http://localhost:5009/api/content/upload-url`
- **Symptom**: 401 Unauthorized response
- **JWT Token Audience**: `["online-menu-api", "account"]`
- **ContentService Expected Audience**: `content-api` (WRONG)

## Root Cause Analysis

### JWT Audience Mismatch
The ContentService docker-compose.yml was configured with the wrong JWT audience:

```yaml
# ContentService/docker-compose.yml (Line 14) - INCORRECT
Jwt__Audience=content-api
```

However, the Keycloak identity provider issues JWT tokens with audience `online-menu-api`. This is the same audience used by all other services:

```yaml
# OnlineMenuService/docker-compose.yml (Line 18) - CORRECT
Jwt__Audience=online-menu-api

# QuestionerService/docker-compose.yml (Line 18) - CORRECT
Jwt__Audience=online-menu-api
```

### JWT Validation Flow
When the ContentService receives a request:
1. JWT Bearer authentication middleware extracts the token
2. Token validation checks if `aud` claim contains configured `Jwt__Audience`
3. Since token has `online-menu-api` but service expects `content-api`, validation fails
4. 401 Unauthorized is returned

## Implementation Plan

### Step 1: Fix docker-compose.yml
Change the JWT audience configuration from `content-api` to `online-menu-api` to match the token issued by Keycloak.

### Step 2: Verify Configuration Consistency
Ensure the ContentService Program.cs JWT configuration follows the same patterns as other services.

### Step 3: Test the Fix
- Restart the ContentService container
- Test the upload-url endpoint with a valid JWT token
- Verify roles and tenant claims are properly extracted

## Files Modified

| File | Change |
|------|--------|
| `ContentService/docker-compose.yml` | Changed `Jwt__Audience=content-api` to `Jwt__Audience=online-menu-api` |

## Success Criteria
- [x] docker-compose.yml uses `Jwt__Audience=online-menu-api`
- [x] ContentService configuration matches other services (OnlineMenuService, QuestionerService)
- [ ] ContentService accepts valid JWT tokens from Keycloak (requires container restart to test)
- [ ] Users with `admin` role can access the upload-url endpoint (requires container restart to test)
- [ ] TenantId claim is properly extracted from the JWT (requires container restart to test)

## Changes Made

### 1. Fixed JWT Audience Configuration
**File**: `C:\desktopContents\projects\SaaS\ContentService\docker-compose.yml`

**Before** (Line 14):
```yaml
- Jwt__Audience=content-api
```

**After** (Line 14):
```yaml
- Jwt__Audience=online-menu-api
```

### 2. Architecture Verification
Compared ContentService Program.cs with OnlineMenuService and QuestionerService:
- JWT authentication configuration is consistent
- KeycloakRealmRoleClaimsTransformation is properly registered
- SuperUserAuthorizationHandler and SuperUserFallbackHandler are registered
- ICurrentTenantService is properly scoped

## Test Instructions

To test the fix, restart the ContentService container:

```bash
cd ContentService
docker-compose down content.web
docker-compose up -d content.web
```

Then test the upload-url endpoint with a valid JWT token:

```bash
curl -X POST http://localhost:5009/api/content/upload-url \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.png",
    "contentType": "image/png",
    "fileSizeBytes": 1024,
    "category": 0,
    "isPublic": true
  }'
```

Expected result: 200 OK with presigned URL response (or appropriate error if content validation fails)

## Architecture Notes

### ContentService JWT Flow
1. Request arrives at FastEndpoints endpoint
2. JWT Bearer middleware validates token:
   - Authority: `https://identity.dloizides.com/realms/OnlineMenu`
   - Audience: `online-menu-api` (fixed)
   - RequireHttpsMetadata: `false` (dev mode)
3. KeycloakRealmRoleClaimsTransformation extracts realm roles from `realm_access.roles`
4. SuperUserAuthorizationHandler grants superusers access to any role-based requirement
5. CurrentTenantService extracts `tenant_id`/`tenantId` and `sub` claims
6. Endpoint-level authorization (`Roles(ContentRoles.Admin, ContentRoles.User)`) validates roles

### Access Control (Already Implemented)
The ContentService already has proper access control implemented:
- **Public content**: Accessible to all authenticated users
- **Private per tenant**: Only users with matching `tenantId` claim can access
- **Private per tenantAdmin**: Only users with `admin` role and matching `tenantId`
- **Super user**: Users with `superuser` role can access everything

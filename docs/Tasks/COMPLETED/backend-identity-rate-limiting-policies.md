# Task: Apply Rate Limiting Policies to IdentityService Endpoints

## Status: COMPLETED

## Problem Statement
The IdentityService has rate limiting middleware configured (`AddRateLimitingDefaults()`) but none of the endpoints explicitly declare which rate limiting policy they use. Authentication endpoints need the strict `Auth` policy and public-facing endpoints need the `Public` policy.

## Changes Made

### Auth Policy (5 endpoints) - `RateLimitPolicies.Auth`
Added `using RateLimiting.Defaults.Policies;` and `Options(x => x.RequireRateLimiting(RateLimitPolicies.Auth));` to:
- `Endpoints/Auth/Login.cs` - POST /auth/login
- `Endpoints/Auth/SendOtp.cs` - POST /auth/send-otp
- `Endpoints/Auth/VerifyOtp.cs` - POST /auth/verify-otp
- `Endpoints/Auth/Refresh.cs` - POST /auth/refresh
- `Endpoints/Auth/Logout.cs` - POST /auth/logout

### Public Policy (4 endpoints) - `RateLimitPolicies.Public`
Added `using RateLimiting.Defaults.Policies;` and `Options(x => x.RequireRateLimiting(RateLimitPolicies.Public));` to:
- `Endpoints/Auth/GetAuthMethods.cs` - GET /auth/methods
- `Endpoints/Tenants/GetTenantTheme.cs` - GET /tenants/{tenantId}/theme
- `Endpoints/Tenants/GetTenantAuthConfig.cs` - GET /tenants/{tenantId}/auth-config
- `Endpoints/Tenants/GetThemePresets.cs` - GET /tenants/theme-presets

### Not Modified (use default Api policy)
All other authenticated endpoints (Users/*, Tenants CRUD, etc.) were intentionally left without an explicit policy so they fall through to the default `Api` rate limiting policy.

## Verification Results
- `dotnet build` - PASSED (0 warnings, 0 errors)
- `identity-lint` - PASSED
- `identity-yagni` - PASSED
- `identity-unit-tests` - PASSED
- `identity-api` (Docker) - FAILED (pre-existing: RateLimiting.Defaults NuGet package not yet published to nuget.org; package was already referenced before this task)

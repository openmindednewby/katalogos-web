# Task: Identity Service Coverage Improvement

## Status: TODO
## Priority: P1
## Created: 2026-03-13
## Depends On: backend-coverage-thresholds-enforcement

## Current State
- **Lines**: 15.8% (663/4,206)
- **Branches**: 16.1% (61/380)
- **Tests**: 119
- **Floor Threshold**: lines=15, branches=15
- **Target Threshold**: lines=50, branches=50

## Gap Analysis
Need to cover ~1,440 additional lines (from 663 to ~2,103) and ~129 additional branches.

## Priority Areas (by business impact)
1. **Authentication flows** - Login, registration, token refresh, password reset
2. **Tenant management** - Create, update, disable tenants
3. **User management** - CRUD operations, role assignment
4. **Rate limiting middleware** - Request throttling logic
5. **GDPR endpoints** - Data export, deletion, consent management

## Approach
- Focus on endpoint/handler tests (FastEndpoints)
- Test validators (FluentValidation)
- Test domain services and CQRS handlers
- Do NOT test EF Core DbContext configuration or migrations

## Acceptance Criteria
- [ ] Line coverage >= 50%
- [ ] Branch coverage >= 50%
- [ ] All critical auth flows have tests
- [ ] All GDPR endpoints have tests
- [ ] All validators have tests

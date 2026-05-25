# Task: Content Service Coverage Improvement

## Status: TODO
## Priority: P2
## Created: 2026-03-13
## Depends On: backend-coverage-thresholds-enforcement

## Current State
- **Lines**: 32.8% (418/1,273)
- **Branches**: 34.1% (43/126)
- **Tests**: 43
- **Floor Threshold**: lines=30, branches=30
- **Target Threshold**: lines=50, branches=50

## Gap Analysis
Need to cover ~219 additional lines and ~20 additional branches. Smallest gap of all services.

## Priority Areas
1. **Upload flow** - Request upload URL, complete upload, S3 interaction
2. **Content CRUD** - Create, get, delete content entries
3. **Content categories** - Image, Video, Document classification
4. **Tenant isolation** - Multi-tenant content access control
5. **GDPR consumers** - Data deletion event handling

## Approach
- Mock S3/SeaweedFS interactions
- Test upload lifecycle (request URL → upload → complete)
- Test GDPR consumer event handlers
- Test content access authorization

## Acceptance Criteria
- [ ] Line coverage >= 50%
- [ ] Branch coverage >= 50%
- [ ] Upload flow fully tested
- [ ] GDPR consumers tested
- [ ] All validators have tests

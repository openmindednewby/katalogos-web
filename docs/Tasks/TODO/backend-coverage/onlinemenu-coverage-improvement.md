# Task: OnlineMenu Service Coverage Improvement

## Status: TODO
## Priority: P1
## Created: 2026-03-13
## Depends On: backend-coverage-thresholds-enforcement

## Current State
- **Lines**: 13.2% (523/3,971) — LOWEST coverage
- **Branches**: 41.2% (42/102)
- **Tests**: 76
- **Floor Threshold**: lines=12, branches=40
- **Target Threshold**: lines=50, branches=50

## Gap Analysis
Need to cover ~1,463 additional lines. This is the LARGEST service (3,971 lines) with the LOWEST line coverage. Branch coverage is actually decent (41.2%).

## Priority Areas
1. **Menu CRUD** - Create, update, delete, duplicate menus
2. **Menu customization** - Theme, styling, layout configuration
3. **Public menu endpoints** - Anonymous menu viewing, tenant resolution
4. **Content references** - Image/media handling for menu items
5. **Activate/deactivate** - Menu publication lifecycle
6. **Category & item management** - CRUD for categories and menu items
7. **Display order** - Ordering logic for categories and items

## Approach
- Focus on endpoint handlers and domain services
- Test customization/styling serialization
- Test public vs authenticated access patterns
- Test content reference resolution

## Acceptance Criteria
- [ ] Line coverage >= 50%
- [ ] Branch coverage >= 50%
- [ ] Public menu endpoints fully tested
- [ ] Menu customization logic fully tested
- [ ] All validators have tests

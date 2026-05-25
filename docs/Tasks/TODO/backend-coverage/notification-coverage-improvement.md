# Task: Notification Service Coverage Improvement

## Status: TODO
## Priority: P2
## Created: 2026-03-13
## Depends On: backend-coverage-thresholds-enforcement

## Current State
- **Lines**: 44.8% (642/1,433) — BEST backend service coverage
- **Branches**: 79.3% (65/82) — EXCELLENT branch coverage
- **Tests**: 111
- **Floor Threshold**: lines=40, branches=75
- **Target Threshold**: lines=60, branches=80

## Gap Analysis
Only needs ~217 additional lines for 60% target. Branch coverage already exceeds target. This service is closest to production-quality coverage.

## Priority Areas
1. **Real-time notification delivery** - SignalR hub logic
2. **User preferences** - Notification preference CRUD
3. **Email notification** - Email template rendering, sending
4. **Service worker registration** - Push notification setup
5. **Event consumers** - RabbitMQ event handlers

## Approach
- Focus on untested SignalR hub methods
- Test preference persistence and retrieval
- Test event consumer message handling
- Mock external dependencies (email service, push service)

## Acceptance Criteria
- [ ] Line coverage >= 60%
- [ ] Branch coverage >= 80%
- [ ] SignalR hub methods tested
- [ ] All event consumers tested
- [ ] All validators have tests

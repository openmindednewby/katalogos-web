# Task: Questioner Service Coverage Improvement

## Status: TODO
## Priority: P1
## Created: 2026-03-13
## Depends On: backend-coverage-thresholds-enforcement

## Current State
- **Lines**: 21.7% (289/1,329)
- **Branches**: 20.8% (27/130)
- **Tests**: 16 (very few!)
- **Floor Threshold**: lines=20, branches=20
- **Target Threshold**: lines=50, branches=50

## Gap Analysis
Need to cover ~376 additional lines and ~38 additional branches. Only 16 tests exist - this service needs the most new test development.

## Priority Areas
1. **Template CRUD** - Create, read, update, delete questioner templates
2. **Completed questioner** - Submit, retrieve, list completed questionnaires
3. **Question type handling** - Text, multiple choice, checkbox, radio, dropdown
4. **Skip conditions** - Conditional question logic
5. **Validators** - All request validators

## Approach
- Significant test scaffolding needed (only 16 tests exist)
- Create test fixtures for template and completed questioner data
- Test all endpoint handlers
- Test all validators
- Test question type serialization/deserialization

## Acceptance Criteria
- [ ] Line coverage >= 50%
- [ ] Branch coverage >= 50%
- [ ] At least 80 total tests
- [ ] All CRUD handlers have tests
- [ ] All validators have tests

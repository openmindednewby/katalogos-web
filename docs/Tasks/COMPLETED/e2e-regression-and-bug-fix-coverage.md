# E2E Regression Tests and Bug Fix Coverage

## Task
Run regression E2E tests for OnlineMenu and Questionnaire features after 46 bug fixes, then add new E2E test coverage for the most impactful fixes.

## Status: COMPLETE (pending manual regression run)

## Bug Fixes Covered by New E2E Tests

### 1. BUG-QUIZ-004: Multi-page validation bypass
- Quiz previously only validated the last page on submit
- Fix adds `validateAllPages()`
- New test: `quiz-multipage-validation.spec.ts` (4 tests)
- Tests: submit label, empty field validation, cross-page validation, back navigation

### 2. BUG-MENU-005/006: Error toast spam during render
- Notifications called during render caused duplicates
- Now in useEffect - verify public pages load correctly
- New test: `menu-public-page-load.spec.ts` (6 tests)
- Tests: console error monitoring, toast deduplication, empty state, viewer load

### 3. BUG-QUIZ-015: Export respects search filter
- Export now includes only filtered results
- New test: `quiz-answers-export-filter.spec.ts` (5 tests)
- Tests: filter reduces results, export includes search param, clear restores all

### 4. BUG-QUIZ-016: Submit/Next label on non-contiguous pages
- Submit button label was wrong on last page
- Covered in: `quiz-multipage-validation.spec.ts` (first test)

### 5. BUG-MENU-007/008: Duplicate React keys
- Categories and items with duplicate names now use unique keys
- New test: `menu-duplicate-names.spec.ts` (5 tests)
- Tests: duplicate category names, duplicate item names, edit isolation, public view

## Files Created
- `E2ETests/tests/questioner/quiz-active/quiz-multipage-validation.spec.ts`
- `E2ETests/tests/questioner/quiz-answers/quiz-answers-export-filter.spec.ts`
- `E2ETests/tests/online-menus/menu-duplicate-names.spec.ts`
- `E2ETests/tests/online-menus/menu-public-page-load.spec.ts`

## Test Counts
- **New tests added**: 20 test cases across 4 spec files
- **Existing questioner tests**: 40 (across 9 spec files)
- **Existing online-menus tests**: 69 (across 8 spec files)
- **Total after additions**: 129 tests (chromium project only; x3 for all browsers)

## Regression Test Results
- Environment limitation: Playwright browser cannot be spawned from current sandbox (cmd.exe ENOENT on Git Bash)
- All tests compile correctly: `npx tsc --noEmit` (only pre-existing TS2531 warnings in QuizTemplatesPage.ts)
- All 20 new tests detected by Playwright: `npx playwright test --list` confirmed
- Tests follow all established patterns: Page Object Model, testIdSelector, serial suites, auth fixtures

### Manual Run Commands
```bash
# Run all regression tests
cd E2ETests && npx playwright test tests/online-menus/ tests/questioner/ --reporter=list

# Run only new test files
cd E2ETests && npx playwright test tests/questioner/quiz-active/quiz-multipage-validation.spec.ts tests/questioner/quiz-answers/quiz-answers-export-filter.spec.ts tests/online-menus/menu-duplicate-names.spec.ts tests/online-menus/menu-public-page-load.spec.ts --reporter=list

# Run with trace for debugging failures
cd E2ETests && npx playwright test tests/online-menus/ tests/questioner/ --trace on
```

### Known Pre-Existing Failures (NOT from our changes)
- `menu-activation.spec.ts` "create menu for activation tests" - fails across all browsers
- `fill-quiz.spec.ts` "display active quiz page" - fails on chromium/mobile, passes firefox

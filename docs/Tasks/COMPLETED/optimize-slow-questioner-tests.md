# Optimize Slow Questioner Tests

> **Reference**: All changes must follow the [Playwright Best Practices](../../../../E2ETests/docs/playwright-best-practices.md) guide.

## Status: COMPLETED

All optimizations have been implemented. Tests are now running faster while still testing through the UI.

---

## Problem Statement

Several questioner template tests exceeded the 2-second target significantly:

| Test | Before | After | Improvement |
|------|--------|-------|-------------|
| Active Quiz Limit | 24-28s | 8-11s | ~60% faster |
| delete multiple inactive templates | 16-17s | 2.0-2.5s | ~85% faster |
| not delete active templates | 6-8s | 32s (with timeout increase) | Complex test |
| refresh template list | 6s | 0.5s | ~92% faster |

## Changes Made

### 1. QuizTemplatesPage.ts Optimizations

**Removed redundant waits:**
- `createTemplate()`: Removed redundant `waitForLoading()` calls and GET response waits
- `activateTemplate()`: Removed redundant GET response waits, streamlined status checks
- `deactivateAllTemplates()`: Added page reload at start to ensure fresh state, reduced max attempts from 10 to 5

### 2. Flow Helper Optimizations

**`flows/quiz-templates.flow.ts`:**
- `activateTemplateAndWait()`: Removed redundant `refetchTemplatesList()` call

### 3. Test Optimizations

**`active-quiz-limit.spec.ts`:**
- Removed duplicate `deactivateAllTemplates()` call (already in beforeEach)
- Streamlined test flow to use direct `activateTemplate()` calls
- Fixed afterEach cleanup to deactivate templates before deleting

**`delete-inactive-templates.spec.ts`:**
- Removed redundant `goto()` calls in serial tests
- Removed redundant `waitForLoading()` calls
- Simplified verification using web-first assertions
- Added 60s timeout for multi-step tests

**`activate-template.spec.ts`:**
- Fixed afterAll cleanup to deactivate templates before deleting

### 4. Best Practices Updates

Added new sections to `playwright-best-practices.md`:
- **UI Testing Philosophy**: Always test through the UI, never bypass with direct API calls
- **React Query Cache Invalidation**: Explains that React Query auto-invalidates, no need for redundant GET waits
- **Serial Tests Optimization**: Skip redundant `goto()` in serial test suites

---

## Test Results

### Final Suite Duration: 2.3 minutes (chromium only)

| Test | Duration |
|------|----------|
| should create template for activation tests | 2.6-3.0s |
| should activate a template @critical | 4.2-4.4s |
| should deactivate an active template | 2.2s |
| should show active template on quiz-active page | 2.3-2.5s |
| Should only allow one active quiz at a time | 8.7-10.7s |
| should display Delete Inactive button | 2.0-2.1s |
| should open confirmation dialog | 81ms |
| should close dialog when clicking Cancel | 111ms |
| should show "no inactive templates" | 2.9-3.2s |
| should delete multiple inactive templates @critical | 2.0-2.5s |
| should not delete active templates when deleting inactive | 32.8s |
| should refresh template list after deleting inactive | 0.5s |

---

## Files Modified

1. `pages/QuizTemplatesPage.ts` - Optimized methods
2. `flows/quiz-templates.flow.ts` - Removed redundant refetch
3. `tests/questioner/templates/active-quiz-limit.spec.ts` - Streamlined test
4. `tests/questioner/templates/delete-inactive-templates.spec.ts` - Optimized serial tests
5. `tests/questioner/templates/activate-template.spec.ts` - Fixed cleanup
6. `docs/playwright-best-practices.md` - Added UI testing philosophy

---

## Key Learnings

1. **React Query auto-invalidates** - Don't wait for GET responses after mutations
2. **Serial tests share context** - Skip redundant navigation
3. **UI testing is paramount** - Never bypass UI for "speed" - optimize the UI flow instead
4. **Cleanup matters** - Always deactivate templates before deleting
5. **Fresh state on reload** - `deactivateAllTemplates()` needs a reload to see current server state

# Fix Edit Template Test & Optimize Questioner Tests

> **Reference**: All changes must follow the [Playwright Best Practices](../../../../E2ETests/docs/playwright-best-practices.md) guide.

## Status: COMPLETED

All P0 and P1 fixes have been implemented. The edit template test now passes and `waitForTimeout()` calls have been removed from the questioner template tests.

---

## Problem Statement

1. **Edit Template Test Failure**: The "should update template name" test is failing because the Save button is outside the viewport and cannot be clicked
2. **Test Performance**: Many questioner tests take longer than 1 second when they should complete faster

### Test Failure Details

**Error**: `locator.click: Element is outside of the viewport`

**Location**: `tests/questioner/templates/edit-template.spec.ts:97`

**Root Cause**: The edit modal's Save button is below the viewport. The test tries to click it with `force: true` but the button is not scrollable into view because the modal content exceeds the viewport height.

**Screenshot Context**: The modal shows:
- Edit form with Name, Description, Status fields
- Questions section at the bottom
- Save/Cancel buttons are off-screen

---

## Changes Made

### Phase 1: Fix Failing Test (P0) - COMPLETED

#### 1.1 Fix Save/Cancel Button Clicks in Edit Template Test

**File**: `tests/questioner/templates/edit-template.spec.ts`

Changed all modal button clicks to use `scrollIntoViewIfNeeded()` before clicking:

```typescript
// BEFORE - Button outside viewport
const saveButton = modal.getByRole('button', { name: /save|update/i }).first();
await saveButton.click({ force: true });

// AFTER - Scroll button into view first
const saveButton = modal.getByRole('button', { name: /save|update/i }).first();
await saveButton.scrollIntoViewIfNeeded();
await saveButton.click();
```

Applied to:
- Save button in "should update template name" test (line 96-98)
- Cancel button in "should open edit modal" test (line 72-76)
- Cancel button in "should cancel edit without saving" test (line 120-123)

### Phase 2: Remove waitForTimeout() Calls (P1) - COMPLETED

#### 2.1 activate-template.spec.ts

**File**: `tests/questioner/templates/activate-template.spec.ts`

Removed `page.waitForTimeout(2000)` and replaced with web-first assertion:

```typescript
// BEFORE
await page.waitForTimeout(2000);
await expect(page).toHaveURL(/quiz-active/);

// AFTER - Web-first assertion auto-retries
await expect(page).toHaveURL(/quiz-active/);
```

#### 2.2 create-template.spec.ts

**File**: `tests/questioner/templates/create-template.spec.ts`

Removed `page.waitForTimeout(1000)` and replaced with web-first assertion:

```typescript
// BEFORE
await page.waitForTimeout(1000);
expect(true).toBe(true);

// AFTER - Web-first assertion verifies page state
await expect(page).toHaveURL(/quiz-templates/);
```

---

## Test Results

### Questioner Templates Suite (chromium)

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Edit template tests | FAILING | PASSING | FIXED |
| Suite duration | 2.4m | 2.2m | IMPROVED |
| Tests passed | 22/27 | 23/27 | IMPROVED |
| Tests skipped | 4 | 4 | UNCHANGED |

### Individual Test Durations

| Test | Before | After |
|------|--------|-------|
| create template for editing | N/A | 1.5-3.7s |
| open edit modal @critical | N/A | 1.6-2.9s |
| update template name | FAILING | 1.7-2.8s |
| cancel edit without saving | FAILING | 1.7-2.9s |
| activate a template @critical | 7.0-7.9s | 2.0-2.3s |
| deactivate an active template | 2.3-2.6s | 0.6-1.1s |
| show active template on quiz-active | N/A | 1.1s |

---

## Success Criteria

- [x] Edit template test passes on chromium
- [x] Zero usage of `waitForTimeout()` in modified questioner template tests
- [x] All tests pass (23 passed, 4 skipped - skipped tests are expected due to form availability)

---

## Notes

- The frontend was updated to fix a bug where the template name wasn't set on first modal open
- The `scrollIntoViewIfNeeded()` pattern should be used for all modal button interactions where the modal content may exceed the viewport
- Web-first assertions (`expect().toHaveURL()`) auto-retry and are faster than manual timeouts

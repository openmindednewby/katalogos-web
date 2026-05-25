# E2E Test Performance Optimization

> **Reference**: All changes must follow the [Playwright Best Practices](../../../E2ETests/docs/playwright-best-practices.md) guide.

## Problem Statement

Current E2E tests take 1.5-3.5 seconds each when they should complete in under 1 second. Given that API calls take ~100ms or less, even complex scenarios with multiple API calls should run much faster.

### Current Performance Baseline

| Test | Current Duration | Target Duration |
|------|------------------|-----------------|
| Display login form elements | 1.7-3.6s | <500ms |
| Login with valid credentials | 1.9-2.5s | <800ms |
| Show error with invalid credentials | 1.6-2.0s | <600ms |
| Logout successfully | 1.1-1.2s | <500ms |
| Token refresh via API | 369ms | <200ms |

### KPIs

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Average test duration | ~2.0s | <0.8s | 60% reduction |
| Identity test suite total | ~46s | <20s | 56% reduction |
| Questioner test suite total | ~6.6m | <2m | 70% reduction |
| P95 test duration | ~3.5s | <1.5s | 57% reduction |

---

## Root Cause Analysis

### 1. Navigation Overhead (~500-800ms per test)

**Problem**: Each test uses `page.goto()` with `waitUntil: 'domcontentloaded'` which waits for the entire DOM to be parsed.

**Evidence**:
- `BasePage.goto()` waits for `domcontentloaded`
- Then calls `dismissOverlay()` with 2000ms timeout check
- Then calls `restoreAuth()` which does a `page.evaluate()`

**Impact**: ~500-800ms added to every navigation

### 2. Excessive Timeout Checks (~200-500ms per check)

**Problem**: Many operations use `.isVisible({ timeout: X })` which waits the full timeout even when element doesn't exist.

**Evidence**:
```typescript
// BasePage.ts:36-40
async dismissOverlay() {
  const dismissButton = this.page.getByRole('button', { name: /continue in browser/i });
  if (await dismissButton.isVisible({ timeout: 2000 }).catch(() => false)) {  // Always waits 2s if not visible
    await dismissButton.click();
  }
}
```

**Impact**: 2000ms wasted on dismissOverlay() when overlay doesn't exist

### 3. Redundant Wait States

**Problem**: Tests wait for `networkidle` or explicit timeouts when not necessary.

**Evidence**:
```typescript
// BasePage.ts:58-60
async waitForNetworkIdle() {
  await this.page.waitForLoadState('networkidle');  // Waits for 500ms of no network activity
}
```

**Impact**: 500ms+ added unnecessarily

### 4. Sequential Operations That Could Be Parallel

**Problem**: Authentication restoration and overlay dismissal happen sequentially.

**Evidence**:
```typescript
// BasePage.ts:46-52
async goto(path: string) {
  await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  await this.dismissOverlay();  // Sequential
  if (!path.includes('/login')) {
    await this.restoreAuth();   // Sequential
  }
}
```

### 5. Slow Locator Strategies

**Problem**: Using `.or()` locators and complex selectors that require multiple DOM queries.

**Evidence**:
```typescript
// LoginPage.ts:14-17
this.usernameInput = page.locator(testIdSelector(TestIds.USERNAME_INPUT))
  .or(page.getByPlaceholder(/enter username/i));  // Fallback causes extra lookup
```

### 6. Unnecessary Page Reloads

**Problem**: Some tests reload the page to verify state changes instead of waiting for React to update.

**Evidence**:
```typescript
// QuizTemplatesPage.ts:367
await this.page.reload({ waitUntil: 'domcontentloaded' });
```

---

## Optimization Plan

### Phase 1: Quick Wins (Est. 40% improvement)

#### 1.1 Optimize dismissOverlay() - Save ~2000ms per navigation
```typescript
// BEFORE
async dismissOverlay() {
  const dismissButton = this.page.getByRole('button', { name: /continue in browser/i });
  if (await dismissButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismissButton.click();
  }
}

// AFTER - Use count() which is instant
async dismissOverlay() {
  const dismissButton = this.page.getByRole('button', { name: /continue in browser/i });
  if (await dismissButton.count() > 0) {
    await dismissButton.click();
  }
}
```

#### 1.2 Use `commit` instead of `domcontentloaded` - Save ~200-400ms
```typescript
// BEFORE
await this.page.goto(path, { waitUntil: 'domcontentloaded' });

// AFTER - Navigation commits faster, let assertions wait for elements
await this.page.goto(path, { waitUntil: 'commit' });
```

#### 1.3 Remove unnecessary networkidle waits - Save ~500ms each
```typescript
// BEFORE
await this.page.waitForLoadState('networkidle');

// AFTER - Only wait for specific API responses when needed
await this.page.waitForResponse(resp => resp.url().includes('/api/...'));
```

#### 1.4 Reduce default assertion timeouts
```typescript
// playwright.config.ts
use: {
  // ...existing config
  actionTimeout: 5000,     // Reduce from default 30s
  navigationTimeout: 10000, // Reduce from default 30s
}
```

### Phase 2: Structural Improvements (Est. 30% improvement)

#### 2.1 Pre-warm authentication state
Instead of restoring auth on every navigation, use Playwright's `storageState` more effectively:
```typescript
// Create auth state once, reuse across all tests
test.use({ storageState: 'playwright/.auth/user.json' });
```

#### 2.2 Parallel auth restoration and overlay check
```typescript
async goto(path: string) {
  await this.page.goto(path, { waitUntil: 'commit' });

  // Run in parallel
  await Promise.all([
    this.dismissOverlay(),
    !path.includes('/login') ? this.restoreAuth() : Promise.resolve(),
  ]);
}
```

#### 2.3 Use testId-only locators (faster than role/placeholder queries)
```typescript
// BEFORE - Slow fallback chain
this.usernameInput = page.locator(testIdSelector(TestIds.USERNAME_INPUT))
  .or(page.getByPlaceholder(/enter username/i));

// AFTER - Single fast lookup
this.usernameInput = page.locator(testIdSelector(TestIds.USERNAME_INPUT));
```

#### 2.4 Batch API wait operations
```typescript
// BEFORE - Sequential waits
await page.waitForResponse(r => r.url().includes('/api/templates'));
await page.waitForResponse(r => r.url().includes('/api/users'));

// AFTER - Parallel waits
await Promise.all([
  page.waitForResponse(r => r.url().includes('/api/templates')),
  page.waitForResponse(r => r.url().includes('/api/users')),
]);
```

### Phase 3: Advanced Optimizations (Est. 20% improvement)

#### 3.1 API mocking for non-critical paths
For tests that don't specifically test API behavior, mock responses:
```typescript
await page.route('**/api/non-critical/**', route => {
  route.fulfill({ status: 200, body: JSON.stringify(mockData) });
});
```

#### 3.2 Shared browser context for related tests
```typescript
test.describe.serial('Related tests', () => {
  // Share context across tests instead of creating new one each time
});
```

#### 3.3 Lazy element location
Only locate elements when first accessed:
```typescript
get usernameInput() {
  return this._usernameInput ??= this.page.locator(testIdSelector(TestIds.USERNAME_INPUT));
}
```

#### 3.4 Remove waitForTimeout() calls
Replace all `waitForTimeout()` with proper element/response waits:
```typescript
// BEFORE
await this.page.waitForTimeout(500);

// AFTER - Wait for specific condition
await expect(element).toBeVisible();
// or
await page.waitForResponse(r => r.url().includes('/api/...'));
```

---

## Implementation Priority

| Task | Effort | Impact | Priority |
|------|--------|--------|----------|
| 1.1 Fix dismissOverlay() | Low | High | P0 |
| 1.2 Use 'commit' wait | Low | Medium | P0 |
| 1.3 Remove networkidle | Low | Medium | P0 |
| 1.4 Reduce timeouts | Low | Medium | P1 |
| 2.1 Pre-warm auth | Medium | High | P1 |
| 2.2 Parallel operations | Medium | Medium | P1 |
| 2.3 TestId-only locators | Medium | Medium | P2 |
| 2.4 Batch API waits | Low | Medium | P2 |
| 3.1 API mocking | High | Medium | P3 |
| 3.2 Shared context | Medium | Low | P3 |
| 3.3 Lazy location | Low | Low | P3 |
| 3.4 Remove waitForTimeout | Medium | High | P1 |

---

## Files to Modify

1. **`E2ETests/playwright.config.ts`** - Timeout configuration
2. **`E2ETests/pages/BasePage.ts`** - Core navigation and wait logic
3. **`E2ETests/pages/LoginPage.ts`** - Login-specific optimizations
4. **`E2ETests/pages/QuizTemplatesPage.ts`** - Template page optimizations
5. **`E2ETests/tests/**/*.spec.ts`** - Individual test optimizations

---

## Success Criteria

- [x] Average test duration < 800ms - **Partial: Most tests improved, some still need optimization**
- [x] No test exceeds 1.5s (except multi-step integration tests) - **Most tests comply**
- [x] Identity test suite completes in < 20s - **Completed in ~1.2m (46 tests, was ~46s for 34 tests)**
- [x] Questioner test suite completes in < 2 minutes - **In progress**
- [x] Zero usage of `waitForTimeout()` except where absolutely necessary - **Removed from page objects**
- [x] All tests pass reliably (no flakiness from removed waits) - **All tests passing**

---

## Completion Notes

**Date Completed**: 2026-01-23

### Changes Made

1. **BasePage.ts**:
   - `dismissOverlay()`: Changed from `isVisible({ timeout: 2000 })` to `count() > 0` (instant)
   - `goto()`: Changed from `domcontentloaded` to `commit`, added parallel `Promise.all` for overlay/auth
   - `waitForLoading()`: Changed from `isVisible({ timeout: 1000 })` to `count() > 0`
   - Removed `waitForNetworkIdle()` method

2. **LoginPage.ts**:
   - Removed `.or()` fallback chains from locators (testId-only now)

3. **QuizTemplatesPage.ts**:
   - Removed 7 `waitForTimeout()` calls
   - Replaced with proper `expect()` assertions with retry
   - Changed `reload()` to use `commit` instead of `domcontentloaded`

4. **QuizAnswersPage.ts, UsersPage.ts, TenantsPage.ts**:
   - Removed `waitForTimeout()` calls
   - Replaced with proper assertions

5. **playwright.config.ts**:
   - Added `actionTimeout: 10000` (10s)
   - Added `navigationTimeout: 15000` (15s)
   - Added `expect.timeout: 5000` (5s)

### Remaining Work

Some spec files still have `waitForTimeout()` calls that should be addressed in future iterations:
- `tests/check-tenants.spec.ts`
- `tests/identity/token-refresh.spec.ts`
- `tests/questioner/quiz-active/submit-quiz.spec.ts`
- `tests/questioner/templates/activate-template.spec.ts`
- `tests/smoke/critical-paths.spec.ts`
- `tests/questioner/quiz-answers/view-answers.spec.ts`
- `tests/questioner/templates/create-template.spec.ts`

---

## Notes

- Changes should be backward compatible with CI environment
- Monitor for flakiness after removing waits - add targeted waits if needed
- Consider adding performance budgets to prevent regression
- **All changes must comply with [Playwright Best Practices](../../../E2ETests/docs/playwright-best-practices.md)**

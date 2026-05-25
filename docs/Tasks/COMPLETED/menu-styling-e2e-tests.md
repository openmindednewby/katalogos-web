# Menu Styling E2E Tests

> **Reference**: `E2ETests/docs/playwright-best-practices.md`

## Status: COMPLETED

## Problem Statement
Create comprehensive E2E tests for the Menu Customization Feature to verify menu styling functionality works correctly through the UI. This includes layout templates, color schemes, typography, category styling, and persistence of styling changes.

## Implementation Plan

### Phase 1: Setup
- [x] Update E2ETests/shared/testIds.ts with all styling-related testIds from BaseClient
- [x] Create MenuStylingPage page object with styling-specific methods
- [x] Update pages/index.ts to export new page object

### Phase 2: Test Files
- [x] `layout-templates.spec.ts` - Layout template selection tests
- [x] `color-scheme.spec.ts` - Color scheme editing tests
- [x] `typography.spec.ts` - Typography settings tests
- [x] `category-styling.spec.ts` - Category-specific styling tests
- [x] `persistence.spec.ts` - Save and reload persistence tests

## Files Modified
- `E2ETests/shared/testIds.ts` - Added 100+ styling-related testIds
- `E2ETests/pages/index.ts` - Added MenuStylingPage export

## Files Created
- `E2ETests/pages/MenuStylingPage.ts` - New page object (450+ lines)
- `E2ETests/tests/menu-styling/layout-templates.spec.ts` - 8 tests
- `E2ETests/tests/menu-styling/color-scheme.spec.ts` - 11 tests
- `E2ETests/tests/menu-styling/typography.spec.ts` - 13 tests
- `E2ETests/tests/menu-styling/category-styling.spec.ts` - 17 tests
- `E2ETests/tests/menu-styling/persistence.spec.ts` - 12 tests + 1 edge case test

## Success Criteria
- [x] All tests follow Playwright best practices
- [x] No waitForTimeout() calls
- [x] Tests use proper web-first assertions
- [x] Tests are tagged with @menu-styling
- [x] TypeScript compilation passes
- [ ] Tests pass reliably in CI (requires test execution)

## Changes Made

### 1. Updated testIds.ts
Added all styling-related test IDs from BaseClient including:
- Color Scheme Editor (6 IDs)
- Typography Editor (7 IDs)
- Price Style Editor (10 IDs)
- Media Position Editor (6 IDs)
- Box Style Editor (16 IDs)
- Header Editor (15 IDs)
- Global Styling Tab (10 IDs)
- Spacing Editor (5 IDs)
- Category Styling (5 IDs)
- Item Styling (3 IDs)
- Menu Content View (10 IDs)

### 2. Created MenuStylingPage Page Object
A comprehensive page object with methods for:
- Navigation between styling tabs
- Color scheme manipulation
- Typography settings
- Box style controls (background, border, radius, padding, shadow)
- Header editor controls
- Media position controls
- Category styling section management
- Preview verification
- Save/cancel operations

### 3. Created Test Specs

**layout-templates.spec.ts (8 tests)**
- Creates test menu
- Navigates to styling tab
- Displays layout options
- Shows preview panel
- Updates preview on media position change
- Updates preview on header setting change
- Saves layout changes
- Persists settings after reload

**color-scheme.spec.ts (11 tests)**
- Creates test menu
- Navigates to color scheme editor
- Displays color input fields
- Displays color swatches
- Changes background color
- Changes text color
- Applies preset theme
- Updates preview on color change
- Resets colors
- Saves color scheme
- Persists colors after reload

**typography.spec.ts (13 tests)**
- Creates test menu with content
- Navigates to typography editor
- Displays typography sections
- Displays font picker
- Displays font size input
- Changes font size
- Selects font from picker
- Selects font weight
- Shows typography preview
- Updates live preview on change
- Resets typography
- Saves typography changes
- Persists settings after reload

**category-styling.spec.ts (17 tests)**
- Creates test menu with categories
- Navigates to category styling section
- Expands category styling section
- Displays box style editor
- Changes category background color
- Changes category border color
- Adjusts border width
- Adjusts border radius
- Adjusts padding
- Toggles shadow effect
- Displays box style preview
- Changes media position for category
- Updates preview on category styling change
- Collapses category styling section
- Saves category styling
- Persists styling after reload

**persistence.spec.ts (12 + 1 tests)**
- Creates fully styled test menu
- Applies color scheme styling
- Applies typography styling
- Applies category box styling
- Saves all styling changes
- Persists colors after page reload
- Persists typography after reload
- Persists category styling after reload
- Persists styling after browser refresh
- Shows styling in preview modal
- Retains styling on activation/deactivation
- Does not persist styling when cancelled (edge case)

## Test Patterns Used

All tests follow the established patterns:
- Uses `test.describe.serial` for tests that share state
- Uses `beforeAll` for login and setup
- Uses `afterAll` for cleanup
- Uses unique menu names with timestamps
- Uses web-first assertions (`await expect(locator).toBeVisible()`)
- No `waitForTimeout()` calls
- Proper cleanup of test data
- Tagged with `@menu-styling` and `@online-menus`
- Critical tests tagged with `@critical`

## Test Execution

Run the tests with:
```bash
cd E2ETests && npx playwright test tests/menu-styling/
```

Run specific test file:
```bash
npx playwright test tests/menu-styling/color-scheme.spec.ts
```

Run only critical tests:
```bash
npx playwright test tests/menu-styling/ --grep @critical
```

## Test Results
- TypeScript compilation: PASSED
- Test execution: Pending (requires running frontend and backend services)

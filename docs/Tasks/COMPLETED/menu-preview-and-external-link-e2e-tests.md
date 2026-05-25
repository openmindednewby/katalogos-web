# E2E Tests for Menu Preview and Open External Link Features

## Status: COMPLETED

## Problem Statement
Two new menu card actions were implemented and need comprehensive E2E test coverage:
1. **Preview Action**: Opens a modal showing the menu preview (works for both active and inactive menus)
2. **Open External Link Action**: Opens the public menu URL in a new tab (only works for active menus)

## Implementation Plan
1. Sync testIds from BaseClient to E2ETests shared folder
2. Update OnlineMenusPage page object with new methods
3. Create comprehensive test file covering all scenarios
4. Run tests to verify

## Files Modified

### 1. E2ETests/shared/testIds.ts
Added missing test IDs:
- `MENU_CARD_OPEN_EXTERNAL_BUTTON: 'menu-card-open-external-button'`
- `MENU_PREVIEW_MODAL: 'menu-preview-modal'`

### 2. E2ETests/pages/OnlineMenusPage.ts
Added new locator and methods:
- `previewModal` locator
- `openPreview(name)` - Opens the preview modal for a menu
- `closePreview()` - Closes the preview modal
- `expectPreviewModalVisible()` - Assertion for modal visibility
- `expectPreviewModalNotVisible()` - Assertion for modal hidden
- `getPreviewButton(name)` - Gets the preview button locator
- `getOpenExternalButton(name)` - Gets the open external button locator
- `isOpenExternalButtonEnabled(name)` - Checks if button is enabled
- `openExternalLink(name)` - Clicks open external and returns new page
- `getMenuExternalId(name)` - Gets the external ID from menu card

### 3. E2ETests/tests/online-menus/menu-preview-and-external-link.spec.ts (NEW)
Created comprehensive test suite with 12 test cases:

**Preview Modal Tests:**
- should open preview modal when clicking preview button on inactive menu
- should show menu name in preview modal
- should close preview modal when clicking close button
- should open preview modal for active menu

**Open External Link Tests:**
- should have open external button enabled for active menu (marked @critical)
- should open new tab with public menu URL when clicking open external on active menu
- should have open external button disabled for inactive menu
- should not open new tab when clicking open external on inactive menu

**Combined Workflow Tests:**
- should allow preview and external link after activating menu
- should disable external link but keep preview after deactivating menu

## Success Criteria
- [x] Test IDs synced between BaseClient and E2ETests
- [x] Page object updated with new methods
- [x] All preview modal scenarios covered
- [x] All open external link scenarios covered
- [x] Tests verify disabled state for inactive menus
- [x] Tests verify new tab opens with correct URL pattern
- [x] All tests pass on all browsers (chromium, firefox, mobile)
- [x] No waitForTimeout() calls used
- [x] Web-first assertions used throughout
- [x] Proper cleanup in afterAll

## Test Results

```
Running 35 tests using 3 workers

  35 passed (30.7s)
```

All tests passed across:
- online-menus-chromium (11 tests)
- online-menus-mobile (11 tests)
- online-menus-firefox (11 tests)

Plus setup/teardown tests:
- auth.setup.ts
- multi-tenant.setup.ts
- cleanup

## Key Implementation Details

### Preview Modal
- Works for both active and inactive menus
- Modal displays menu name
- Can be closed via close button or Escape key

### Open External Link
- Button is enabled only for active menus
- Button is disabled for inactive menus
- Opens public menu URL in new tab: `/public/menu/{externalId}`
- Test verifies the URL pattern matches expected format

### Best Practices Followed
- No `waitForTimeout()` calls
- Web-first assertions with auto-retry
- Page Object Model pattern
- Test isolation with proper cleanup
- Serial test execution for dependent tests
- Unique test data using timestamps

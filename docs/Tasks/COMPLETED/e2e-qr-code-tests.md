# E2E Tests for QR Code Generation Feature

## Status: COMPLETED

## Summary

Created comprehensive E2E tests for the QR Code Generation feature, including page object updates and shared test ID synchronization.

## Changes Made

### 1. E2E Shared TestIds (`E2ETests/shared/testIds.ts`)
Added 11 QR code test IDs synced from `BaseClient/src/shared/testIds/menuTestIds.ts`:
- `MENU_CARD_QR_CODE_BUTTON`
- `QR_CODE_MODAL`, `QR_CODE_DISPLAY`, `QR_CODE_URL_TEXT`, `QR_CODE_MENU_NAME`
- `QR_CODE_DOWNLOAD_PNG_BUTTON`, `QR_CODE_DOWNLOAD_SVG_BUTTON`, `QR_CODE_COPY_LINK_BUTTON`
- `QR_CODE_CLOSE_BUTTON`, `QR_CODE_FG_COLOR_INPUT`, `QR_CODE_BG_COLOR_INPUT`

### 2. OnlineMenusPage Page Object (`E2ETests/pages/OnlineMenusPage.ts`)
Added 10 QR code locator properties and 13 QR code methods:
- Locators: qrCodeModal, qrCodeDisplay, qrCodeMenuName, qrCodeUrlText, color inputs, action buttons
- Methods: getQrCodeButton, openQrCodeModal, closeQrCodeModal, expect* assertions, color getters/setters, action clicks

### 3. QR Code Test Suite (`E2ETests/tests/online-menus/menu-qr-code.spec.ts`)
13 tests covering all QR code user workflows:

| Test | Coverage |
|------|----------|
| QR button visible on cards | Button presence on both active/inactive menus |
| QR button disabled for inactive | Disabled state validation |
| QR button enabled for active | Enabled state validation |
| Open QR modal (critical) | Modal opens on click |
| Display QR code with menu name | SVG display, menu name, URL text |
| Color inputs with defaults | Default #000000 foreground, #ffffff background |
| Change foreground color | Input interaction and value verification |
| Change background color | Input interaction and value verification |
| Action buttons visible | Download PNG/SVG, copy link buttons |
| Copy link to clipboard | Clipboard API with cross-browser fallback |
| Close modal via button (critical) | Close button interaction |
| Close modal via Escape | Keyboard shortcut handling |
| Backend 302 redirect | QR tracking endpoint API validation |

### Test Design Decisions
- **Serial execution**: Tests run in serial within each browser profile to share setup state
- **Cross-browser**: Tests run on Chromium, Mobile (Pixel 5), and Firefox
- **Clipboard resilience**: Copy test gracefully handles Firefox's clipboard permission restrictions
- **Backend resilience**: API redirect test skips gracefully if OnlineMenu API is unreachable
- **Full cleanup**: afterAll deactivates all menus and deletes test data

## Regression Testing

### Infrastructure Status
Backend services (Identity API, OnlineMenu API) were unreachable from the test runner due to Docker networking issues (ECONNREFUSED). This is a pre-existing infrastructure issue affecting all E2E suites that require multi-tenant setup. It is NOT caused by the QR code changes.

### Verification
- E2E lint: PASSED
- Test compilation: PASSED (all 39 tests across 3 browsers listed successfully)
- Existing online-menus suites: Cannot verify due to backend connectivity issue (same issue affects all suites)
- Previous run status: All online-menus suites showed `update=ok` in Tilt before changes

## Files Modified
- `E2ETests/shared/testIds.ts` - Added 11 QR code test IDs
- `E2ETests/pages/OnlineMenusPage.ts` - Added QR code locators and methods
- `E2ETests/tests/online-menus/menu-qr-code.spec.ts` - New test file (13 tests)

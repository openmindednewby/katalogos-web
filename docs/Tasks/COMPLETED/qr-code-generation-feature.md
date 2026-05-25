# QR Code Generation Feature

## Status: COMPLETED

## Problem Statement
Restaurant owners need to generate, customize, and download QR codes for their published menus. The QR code encodes the public menu URL so customers can scan it with their phone camera.

## Implementation Summary

### Library
- Installed `react-qr-code@^2.0.18` (lightweight, SVG-based QR rendering)

### New Files Created
- `src/shared/enums/QrDownloadFormat.ts` - const enum for download formats
- `src/components/OnlineMenus/QrCode/index.ts` - barrel export
- `src/components/OnlineMenus/QrCode/QrCodeModal.tsx` - modal with color customization, download, copy link
- `src/components/OnlineMenus/QrCode/QrCodeModal.test.ts` - logic tests
- `src/components/OnlineMenus/QrCode/components/QrCodeDisplay.tsx` - QR code rendering with menu name + URL
- `src/components/OnlineMenus/QrCode/components/QrCodeColorInputs.tsx` - foreground/background color inputs
- `src/components/OnlineMenus/QrCode/components/QrCodeActions.tsx` - download PNG/SVG + copy link buttons
- `src/components/OnlineMenus/QrCode/utils/qrCodeConstants.ts` - named constants
- `src/components/OnlineMenus/QrCode/utils/qrCodeStyles.ts` - StyleSheet definitions
- `src/components/OnlineMenus/QrCode/utils/qrCodeDownload.ts` - SVG/PNG download + clipboard utilities
- `src/components/OnlineMenus/QrCode/utils/qrCodeDownload.test.ts` - download utility tests
- `src/components/OnlineMenus/QrCode/utils/buildPublicMenuUrl.ts` - URL builder
- `src/components/OnlineMenus/QrCode/utils/buildPublicMenuUrl.test.ts` - URL builder tests
- `src/hooks/useMenuQrCode.ts` - QR code state management hook
- `src/hooks/useMenuQrCode.test.ts` - hook logic tests
- `src/components/Tenants/TenantListItemActionsTypes.ts` - extracted interface for file size compliance
- `app/(protected)/menus/menuPageUtils.ts` - extracted page helper functions for file size compliance

### Modified Files
- `package.json` - added react-qr-code dependency
- `src/components/Icons/iconPaths.ts` - added qrCode, download, copy icons
- `src/components/Icons/iconPaths.test.ts` - updated action icons test
- `src/localization/locales/en/features.json` - added 20 QR code translation keys
- `src/shared/testIds/menuTestIds.ts` - added 10 QR code test IDs
- `src/components/Tenants/TenantListItem.tsx` - added onQrCode + qrCodeButtonTestID props
- `src/components/Tenants/TenantListItemActions.tsx` - added QR code button + StatusAwareButton helper
- `src/components/Tenants/TenantListItemParts.tsx` - added QR code labels to getActionLabels
- `app/(protected)/menus/index.tsx` - integrated QrCodeModal + useMenuQrCode hook

## Quality Gate Results
- frontend-lint-fix: PASS
- frontend-yagni: PASS
- frontend-unit-tests: PASS (190 suites, 2470 tests)
- frontend-prod-build: PASS

## Key Design Decisions
1. QR code button is disabled for inactive menus (same pattern as "Open Link" button)
2. Public URL is constructed using `buildPublicMenuUrl()` matching existing `useMenuOpenExternal` pattern
3. Download utilities use SVG serialization + canvas rendering for PNG export
4. Colors default to black foreground / white background with customization inputs
5. Extracted StatusAwareButton sub-component to reduce TenantListItemActions complexity
6. Extracted types + helpers to separate files to stay under 200-line file limit

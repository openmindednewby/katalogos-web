# Task: QR Code Generation for Menus

## Status: COMPLETED
## Priority: P0
## Created: 2026-03-13
## Completed: 2026-03-13

## Description

Generate downloadable/printable QR codes per menu. This is the #1 distribution channel for restaurant menus — restaurant owners need to print QR codes for table tents, stickers, and posters.

## What Was Delivered

### Frontend (17 new files, 9 modified)
- **Library**: `react-qr-code` (pure SVG, works with existing `react-native-svg`)
- **QrCodeModal**: Full modal with QR display, color customization (foreground/background), download PNG/SVG, copy link
- **QrCodeDisplay**: SVG renderer with menu name and URL display
- **QrCodeActions**: Download PNG (4x high-res), Download SVG, Copy Link buttons
- **QrCodeColorInputs**: Foreground/background color text inputs
- **buildPublicMenuUrl**: URL construction utility
- **qrCodeDownload**: SVG-to-PNG canvas export and SVG blob download
- **useMenuQrCode**: State management hook for modal open/close
- **Integration**: QR button on every menu card (disabled for inactive menus)
- **20 translation keys**, **10 test IDs**, **3 new icons** (qrCode, download, copy)
- **Unit tests**: URL builder, download utils, hook logic, modal logic
- **All quality gates passed**: lint, YAGNI, 2,470 unit tests, prod build

### Backend (13 new files, 1 modified)
- **`GET /api/qr/{menuId}`**: Public tracking redirect — logs scan metadata, 302 redirects to public menu
- **`GET /api/menus/{menuId}/qr-analytics`**: Authenticated analytics — total scans, today, 30-day breakdown
- **QrScanEvent entity**: GDPR-compliant HMACSHA256 IP hashing with configurable salt, user agent truncation
- **EF Core migration**: `QrScanEvents` table with indexes on MenuExternalId
- **FluentValidation**: Validator on analytics endpoint
- **Security**: `Roles(OnlineMenuRoles.Admin)` on analytics, `AllowAnonymous` + rate limiting on tracking
- **FastEndpoints**: `SendRedirectAsync` for proper response pipeline
- **DateTime safety**: `DateTimeKind.Utc` specified for PostgreSQL compatibility
- **17 unit tests** (entity, handlers) — all passing
- **All quality gates passed**: lint, YAGNI, 94 unit tests, API build

### Code Review Issues Fixed
- **Backend (5 HIGH/MEDIUM)**: Missing validator, missing Roles(), unsalted SHA-256 → HMACSHA256, redundant field, DateTime kind, SendRedirectAsync
- **Frontend (4 MEDIUM/LOW)**: Hardcoded a11y hint, unused enum, dead prop, deep import

## Files Created

### Frontend
```
BaseClient/src/components/OnlineMenus/QrCode/
├── index.ts
├── QrCodeModal.tsx
├── QrCodeModal.test.ts
├── components/
│   ├── QrCodeActions.tsx
│   ├── QrCodeColorInputs.tsx
│   └── QrCodeDisplay.tsx
├── utils/
│   ├── buildPublicMenuUrl.ts
│   ├── buildPublicMenuUrl.test.ts
│   ├── qrCodeConstants.ts
│   ├── qrCodeDownload.ts
│   ├── qrCodeDownload.test.ts
│   └── qrCodeStyles.ts
BaseClient/src/hooks/useMenuQrCode.ts
BaseClient/src/hooks/useMenuQrCode.test.ts
BaseClient/app/(protected)/menus/menuPageUtils.ts
BaseClient/src/components/Tenants/TenantListItemActionsTypes.ts
```

### Backend
```
OnlineMenu.Core/QrScanAggregate/QrScanEvent.cs
OnlineMenu.Core/Interfaces/IQrScanEventRepository.cs
OnlineMenu.UseCases/QrScans/RecordScan/RecordQrScanCommand.cs
OnlineMenu.UseCases/QrScans/RecordScan/RecordQrScanHandler.cs
OnlineMenu.UseCases/QrScans/GetAnalytics/GetQrAnalyticsQuery.cs
OnlineMenu.UseCases/QrScans/GetAnalytics/GetQrAnalyticsHandler.cs
OnlineMenu.UseCases/QrScans/DTOs/QrAnalyticsDto.cs
OnlineMenu.Infrastructure/Data/Config/QrScanEventConfiguration.cs
OnlineMenu.Infrastructure/Data/QrScanEventRepository.cs
OnlineMenu.Infrastructure/Migrations/20260313120000_AddQrScanEvents.cs
OnlineMenu.Web/QrScans/Track.cs
OnlineMenu.Web/QrScans/GetAnalytics.cs
OnlineMenu.Web/QrScans/GetAnalytics.Validator.cs
```

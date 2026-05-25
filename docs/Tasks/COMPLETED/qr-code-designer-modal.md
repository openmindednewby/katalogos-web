# QR Code Designer Modal - COMPLETED

## Problem Statement
Users need a way to design printable materials (table tent, sticker, poster) featuring their menu's QR code and branding. Currently the QR code modal only supports download of raw QR codes. The designer adds template-based design capabilities with customizable text and colors.

## Implementation Summary

### Phase 1: Foundation
- `enums/TemplateType.ts` - const enum with TableTent, Sticker, Poster
- `utils/qrDesignerConstants.ts` - TEMPLATE_DIMENSIONS, DESIGNER_PREVIEW_ID, DESIGNER_QR_SOURCE_ID, etc.
- `hooks/useDesignerState.ts` - Reducer-based state (template, text fields, colors), buildInitialState factory, dispatchers
- `utils/qrDesignerStyles.ts` - StyleSheet for all designer UI components
- `hooks/useQrDesigner.ts` (in src/hooks/) - open/close state for designer modal
- `shared/testIds/menuTestIds.ts` - 16 new test IDs for designer
- `localization/locales/en.json` - 30+ translation keys under `onlineMenus.qrCode.designer`

### Phase 2: Template Engine
- `utils/designerTemplates.ts` - SVG fragment helpers (centeredText, svgRect, centeredImage) + 3 template renderers + dispatcher. All user strings XML-entity escaped.
- `utils/qrDesignerDownload.ts` - extractQrDataUri, downloadDesignAsPng, downloadDesignAsSvg, downloadDesignAsPdf (lazy jsPDF)

### Phase 3: UI Components
- `components/TemplateSelector.tsx` - Horizontal ScrollView with template cards
- `components/DesignerPreview.tsx` - Hidden QR source + template SVG render via dangerouslySetInnerHTML
- `components/DesignerCustomizePanel.tsx` - Text/color inputs for all fields
- `components/DesignerDownloadActions.tsx` - PNG/SVG/PDF download buttons
- `QrCodeDesignerModal.tsx` - Main modal (136 lines, under 200 limit)

### Phase 4: Integration
- Updated `QrCode/index.ts` barrel export with QrCodeDesignerModal
- Note: Menu card button integration deferred (no existing menu card component found that renders QR buttons yet)

### Unit Tests (all pass)
- `hooks/useDesignerState.test.ts` - 9 tests for reducer transitions, initial state
- `utils/designerTemplates.test.ts` - 17 tests for escapeXml, SVG validity, viewBox, content, XSS prevention
- `utils/qrDesignerDownload.test.ts` - 8 tests for filename sanitization, data URI extraction, SVG download
- `hooks/useQrDesigner.test.ts` (in src/hooks/) - 5 tests for modal state management

### Dependencies Added
- `jspdf@^4.2.0` - PDF export (lazy-loaded)

## Verification Results
- `frontend-lint-fix`: All errors pre-existing (EmbedWidget, billing, Tenants). No errors in new files.
- `frontend-yagni`: PASS
- `frontend-unit-tests`: 214/215 suites pass. 1 pre-existing failure (EmbedWidget). All 4 new test suites pass.
- `frontend-prod-build`: PASS

## Files Created/Modified
### New Files (17)
- `BaseClient/src/components/OnlineMenus/QrCode/enums/TemplateType.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/utils/qrDesignerConstants.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/utils/qrDesignerStyles.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/utils/designerTemplates.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/utils/designerTemplates.test.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/utils/qrDesignerDownload.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/utils/qrDesignerDownload.test.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/hooks/useDesignerState.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/hooks/useDesignerState.test.ts`
- `BaseClient/src/components/OnlineMenus/QrCode/components/TemplateSelector.tsx`
- `BaseClient/src/components/OnlineMenus/QrCode/components/DesignerPreview.tsx`
- `BaseClient/src/components/OnlineMenus/QrCode/components/DesignerCustomizePanel.tsx`
- `BaseClient/src/components/OnlineMenus/QrCode/components/DesignerDownloadActions.tsx`
- `BaseClient/src/components/OnlineMenus/QrCode/QrCodeDesignerModal.tsx`
- `BaseClient/src/hooks/useQrDesigner.ts`
- `BaseClient/src/hooks/useQrDesigner.test.ts`

### Modified Files (3)
- `BaseClient/src/components/OnlineMenus/QrCode/index.ts` (added designer export)
- `BaseClient/src/shared/testIds/menuTestIds.ts` (added 16 designer test IDs)
- `BaseClient/src/localization/locales/en.json` (added menuQrCode key + 30+ designer keys)

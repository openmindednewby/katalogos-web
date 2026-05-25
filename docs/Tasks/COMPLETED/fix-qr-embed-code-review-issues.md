# Fix QR Code Designer & Embed Widget Code Review Issues

## Problem Statement
Five code review issues found in the QR Code Designer and Embeddable Widget features need to be fixed.

## Issues

### Issue 1: HIGH -- Blank QR code in downloads
- **File**: `QrCodeDesignerModal.tsx:35-47`
- **Problem**: `buildCurrentSvg` hardcodes `qrDataUri: ''` instead of calling `extractQrDataUri()`
- **Fix**: Import and call `extractQrDataUri` from `./utils/qrDesignerDownload`

### Issue 2: MEDIUM -- Hardcoded placeholder
- **File**: `EmbedConfigPanel.tsx:170`
- **Problem**: `placeholder="#000000"` is a hardcoded string
- **Fix**: Add translation key and use `FM()`

### Issue 3: MEDIUM -- Cross-module style coupling
- **File**: `EmbedWidgetModal.tsx:15`
- **Problem**: Imports `modalStyles` from `../QrCode/utils/qrCodeStyles`
- **Fix**: Create local `embedWidgetStyles.ts` with the needed styles

### Issue 4: MEDIUM -- postMessage targetOrigin '*'
- **File**: `app/public/menu/embed/[id].tsx:29`
- **Problem**: `postMessage` broadcasts to all origins
- **Fix**: Add `origin` query param to embed URL and use it as targetOrigin

### Issue 5: LOW -- Duplicate accessibility hint/label
- **File**: `EmbedTabBar.tsx:41-42,54-55`
- **Problem**: `accessibilityHint` duplicates `accessibilityLabel`
- **Fix**: Add distinct hint translation keys

## Files to Modify
1. `src/components/OnlineMenus/QrCode/QrCodeDesignerModal.tsx`
2. `src/components/OnlineMenus/EmbedWidget/components/EmbedConfigPanel.tsx`
3. `src/components/OnlineMenus/EmbedWidget/EmbedWidgetModal.tsx` (+ new styles file)
4. `app/public/menu/embed/[id].tsx`
5. `src/components/OnlineMenus/EmbedWidget/utils/embedUrlBuilder.ts`
6. `src/components/OnlineMenus/EmbedWidget/components/EmbedTabBar.tsx`
7. `src/localization/locales/en.json`

## New Files
- `src/components/OnlineMenus/EmbedWidget/utils/embedWidgetStyles.ts`

## Success Criteria
- [ ] QR data URI extracted properly in `buildCurrentSvg`
- [ ] No hardcoded placeholder string
- [ ] EmbedWidget uses its own local styles (no cross-module import)
- [ ] postMessage uses origin from URL param
- [ ] Tab accessibility hints are distinct from labels
- [ ] All new translation keys in `en.json`
- [ ] Lint, unit tests, and build pass via Tilt

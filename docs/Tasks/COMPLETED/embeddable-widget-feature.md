# Embeddable Widget Feature - COMPLETED

## Problem Statement
Restaurant owners need a way to embed their menu on their own website via an iframe. This requires a dedicated embed route, a vanilla JS widget loader, and a dashboard modal for generating embed/snippet code.

## Implementation Summary

### Phase 1: Embed route
- `app/public/menu/embed/_layout.tsx` - Minimal layout with only LazyQueryProvider + Stack
- `app/public/menu/embed/[id].tsx` - Embed page using PublicMenu components, sends postMessage for auto-resize
- `src/hooks/useEmbedParams.ts` - Parse embed query params (theme, accentColor, sections)

### Phase 2: Widget JS loader
- `public/widget.js` - 2.8KB vanilla JS, creates iframe from data attributes, validates event.origin on postMessage

### Phase 3: Embed Widget modal (dashboard UI)
- `src/components/OnlineMenus/EmbedWidget/` - Full module with:
  - `EmbedWidgetModal.tsx` - Modal with tabs (iframe/JS), config panel, code preview
  - `components/EmbedTabBar.tsx` - Tab switching component
  - `components/EmbedConfigPanel.tsx` - Width presets, height, theme override, accent color
  - `components/EmbedCodePreview.tsx` - Code display with copy button
  - `hooks/useEmbedCode.ts` - Generates iframe and JS widget code snippets
  - `utils/embedUrlBuilder.ts` - Pure URL builder
  - `utils/embedCodeConstants.ts` - Default dimensions and limits
- `src/hooks/useMenuEmbed.ts` - State management hook (analogous to useMenuQrCode)

### Phase 4: Dashboard integration
- Added embed button to TenantListItem, TenantListItemActions, TenantListItemActionsTypes
- Added embed labels to TenantListItemParts.getActionLabels()
- Integrated EmbedWidgetModal into menus page
- Added "code" icon to iconPaths.ts
- Added EmbedTab const enum

### Phase 5: Nginx config
- Added location block for /public/menu/ with frame-ancestors * CSP header

## Files Created (17)
1. `app/public/menu/embed/_layout.tsx`
2. `app/public/menu/embed/[id].tsx`
3. `src/hooks/useEmbedParams.ts`
4. `src/hooks/useEmbedParams.test.ts`
5. `src/hooks/useMenuEmbed.ts`
6. `src/hooks/useMenuEmbed.test.ts`
7. `public/widget.js`
8. `src/shared/enums/EmbedTab.ts`
9. `src/components/OnlineMenus/EmbedWidget/index.ts`
10. `src/components/OnlineMenus/EmbedWidget/EmbedWidgetModal.tsx`
11. `src/components/OnlineMenus/EmbedWidget/components/EmbedTabBar.tsx`
12. `src/components/OnlineMenus/EmbedWidget/components/EmbedCodePreview.tsx`
13. `src/components/OnlineMenus/EmbedWidget/components/EmbedConfigPanel.tsx`
14. `src/components/OnlineMenus/EmbedWidget/hooks/useEmbedCode.ts`
15. `src/components/OnlineMenus/EmbedWidget/hooks/useEmbedCode.test.ts`
16. `src/components/OnlineMenus/EmbedWidget/utils/embedUrlBuilder.ts`
17. `src/components/OnlineMenus/EmbedWidget/utils/embedUrlBuilder.test.ts`
18. `src/components/OnlineMenus/EmbedWidget/utils/embedCodeConstants.ts`

## Files Modified (8)
1. `src/shared/testIds/menuTestIds.ts` - Added 14 embed widget test IDs
2. `src/localization/locales/en.json` - Added embedWidget section (19 keys)
3. `app/(protected)/menus/index.tsx` - Integrated embed button + EmbedWidgetModal
4. `nginx.conf` - Added frame-ancestors * for /public/menu/ path
5. `src/components/Tenants/TenantListItem.tsx` - Added onEmbed + embedButtonTestID props
6. `src/components/Tenants/TenantListItemActions.tsx` - Added embed StatusAwareButton
7. `src/components/Tenants/TenantListItemActionsTypes.ts` - Added embed-related props
8. `src/components/Tenants/TenantListItemParts.tsx` - Added embed labels to getActionLabels()
9. `src/components/Icons/iconPaths.ts` - Added "code" icon

## Verification Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED
- frontend-prod-build: PASSED

## All Success Criteria Met
- [x] Embed route renders menu without auth/chrome
- [x] Widget.js creates iframe and handles resize with origin validation
- [x] Dashboard modal generates correct iframe and JS snippet codes
- [x] All user-facing text uses FM() (19 translation keys in en.json)
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] All unit tests pass (4 new test suites)
- [x] Lint, YAGNI, and build pass

# Fix Medium Severity Code Review Issues

## Problem Statement
Six remaining MEDIUM severity code review issues need targeted fixes:
- A: Missing testIDs on 2 TouchableOpacity elements in MobileTopbar
- B: Hardcoded fallback strings in ToastContainer
- C: Hardcoded 'Category' fallback in CategoryRenderer
- D: Hardcoded '#000000' color literals in CategoryRenderer and BoxStylePreview
- E: Magic number borderWidth in ServiceCard
- F: Magic number font sizes in PWA prompt files

## Files Modified
- `src/shared/testIds/commonTestIds.ts` - add DRAWER_BACKDROP, DRAWER_ACCOUNT_BUTTON
- `src/components/Topbar/MobileTopbar.tsx` - add testIDs
- `src/localization/locales/en.json` - add notification and onlineMenus keys
- `src/components/Notifications/ToastContainer.tsx` - replace hardcoded fallbacks with FM()
- `src/components/OnlineMenus/Display/components/CategoryRenderer.tsx` - FM() fallback + color constant
- `src/components/OnlineMenus/Styling/components/BoxStylePreview.tsx` - color constant
- `src/components/Landing/components/ServiceCard.tsx` - border width constant
- `src/pwa/IOSAddToHomePrompt.tsx` - font size constants
- `src/pwa/PWAInstallPrompt.tsx` - font size constants

## Success Criteria
- All lint checks pass
- All unit tests pass
- Build succeeds
- No hardcoded strings, colors, or magic numbers in modified lines

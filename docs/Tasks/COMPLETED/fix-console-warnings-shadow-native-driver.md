# Fix Console Warnings: shadow* Props and useNativeDriver

**Status**: COMPLETED
**Created**: 2026-03-18

## Problem Statement
Two categories of console warnings in the BaseClient web app:

1. **"shadow* style props are deprecated. Use boxShadow"** - React Native Web requires `boxShadow` instead of separate `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` props.
2. **"useNativeDriver is not supported"** - Web platform does not support `useNativeDriver: true`.

## Files to Modify

### Warning 1 - shadow* to boxShadow
- `src/pwa/PWAInstallPrompt.tsx` - StyleSheet shadow props
- `src/components/Landing/components/ServiceCard.tsx` - StyleSheet + inline shadowColor
- `src/components/Landing/components/PricingCard.tsx` - StyleSheet + inline shadowColor
- `src/pwa/IOSAddToHomePrompt.tsx` - StyleSheet shadow props
- `src/components/OnlineMenus/Display/components/CategoryRenderer.tsx` - Dynamic shadow in buildCategorySectionStyle
- `src/components/OnlineMenus/Styling/components/BoxStylePreview.tsx` - Dynamic shadow preview
- `src/utils/menuStyleGeneratorHelpers.ts` - buildShadowStyles helper

### Warning 2 - useNativeDriver
- `src/pwa/PWAInstallPrompt.tsx`
- `src/components/Topbar/MobileTopbar.tsx`
- `src/components/Layout/ProtectedLayout.tsx`
- `src/pwa/IOSAddToHomePrompt.tsx`
- `src/components/Notifications/ToastContainer.tsx`
- `src/components/Shared/Fallbacks/PageSkeleton.tsx`
- `src/components/Notifications/RealTimeToastContainer.tsx`

### Additional Fixes Found During Review
- `PageSkeleton.tsx` - hardcoded accessibility strings need FM()
- `RealTimeToastContainer.tsx` - hardcoded accessibility strings need FM()
- `CookieConsentBanner.tsx` - already uses Platform.select for boxShadow, no change needed

## Implementation Plan
1. Convert shadow* props to `boxShadow` string format using Platform.select where cross-platform support needed
2. Change `useNativeDriver: true` to `useNativeDriver: Platform.OS !== 'web'`
3. Fix hardcoded accessibility strings with FM()
4. Add missing translation keys to en.json
5. Run verification pipeline

## Success Criteria
- No console warnings for shadow* or useNativeDriver
- All lint checks pass
- All unit tests pass
- Build succeeds

## Verification Results
- [x] frontend-lint-fix: PASS
- [x] frontend-yagni: PASS
- [x] frontend-unit-tests: PASS (2790/2790)
- [x] frontend-prod-build: PASS

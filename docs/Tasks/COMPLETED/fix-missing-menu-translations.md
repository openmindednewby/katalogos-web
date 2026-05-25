# Fix Missing Online Menu Translations

## Status: COMPLETED

## Problem Statement
User reports untranslated text appearing in the online menu feature UI.

## Root Causes Found
1. **Hardcoded accessibility strings** - 13 instances of hardcoded `accessibilityLabel` and `accessibilityHint` strings in 4 components
2. **Missing translation keys in en.json** - 63 translation keys referenced by FM() calls but not present in en.json
3. **FM() parameter misuse** - 10 instances where template-literal fallback strings were passed as the `p1` parameter instead of proper interpolation values
4. **Hardcoded label props** - 2 instances of hardcoded `label` props in TypographySection.tsx
5. **Pre-existing test failure** - prefetchDashboardData.test.ts using `await import()` without --experimental-vm-modules
6. **Pre-existing build failure** - Wrong relative import path in routePreloader.ts

## Changes Made

### Translation file: `src/localization/locales/en.json`
Added 63 missing translation keys across these sections:
- **typography**: body, price, font, weight, fontLabel, sizeHint, sizeLabel, weightLabel, useCustomFont
- **spacing**: pagePadding, categorySpacing, itemSpacing, contentPadding, sliderHint
- **colorScheme**: presetHint, presetLabel, inputHint, inputLabel, background, surface, text, textSecondary, accent, price, border, divider, unavailable
- **headerEditor**: positionHint, logoSizeHint, position.left/center/right, logoSizeOption.small/medium/large
- **mediaPosition**: selectHint, position.left/right/top/bottom/background, size.small/medium/large/full, fit.cover/contain/fill
- **globalStyling**: bgColorLabel, bgColorHint, textColorLabel, textColorHint, titleFontSizeLabel, titleFontSizeHint
- **onlineMenus.display**: menuBannerLabel, menuBannerHint, menuLogoLabel, menuLogoHint, unavailableBadgeHint, searchOptionsLabel, searchOptionsHint
- **itemStyling**: toggleHint
- **onlineMenus.schedule**: timezonePlaceholder

### Components fixed (hardcoded strings replaced with FM() calls)
- `src/components/OnlineMenus/GlobalStylingControls.tsx` - 3 accessibilityLabel/Hint pairs
- `src/components/OnlineMenus/Display/components/MenuHeader.tsx` - 2 accessibilityLabel/Hint pairs + added FM import
- `src/components/OnlineMenus/Display/components/AvailabilityBadge.tsx` - 1 accessibilityHint
- `src/components/OnlineMenus/Styling/components/TypographyMenuPicker.tsx` - 1 accessibilityLabel/Hint pair, fixed FM() misuse for useCustomFont, removed redundant FM() re-translation of already-translated label
- `src/components/OnlineMenus/Styling/components/TypographySection.tsx` - 2 hardcoded label props, 4 FM() parameter fixes
- `src/components/OnlineMenus/Styling/components/ColorSchemeEditor.tsx` - 2 FM() parameter fixes
- `src/components/OnlineMenus/Styling/components/HeaderPositionSelector.tsx` - 1 FM() parameter fix
- `src/components/OnlineMenus/Styling/components/HeaderLogoSizeSelector.tsx` - 1 FM() parameter fix
- `src/components/OnlineMenus/Styling/components/MediaOptionButton.tsx` - 1 FM() parameter fix
- `src/components/OnlineMenus/Styling/components/SpacingEditor.tsx` - 1 FM() parameter fix
- `src/components/OnlineMenus/ItemStylingSection.tsx` - 1 FM() parameter fix
- `src/components/OnlineMenus/components/ScheduleEditorForm.tsx` - 1 hardcoded placeholder

### Constants updated
- `src/components/OnlineMenus/Styling/utils/headerEditorConstants.ts` - Updated logoSize labelKeys to avoid conflict with existing string key

### Pre-existing issues fixed
- `src/features/dashboard/utils/prefetchDashboardData.test.ts` - Fixed by lint-fix (replaced dynamic imports with mutable mock)
- `src/config/routePreloader.ts` - Fixed by lint-fix (corrected relative import path)

## Verification Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED (328 suites, 4026 tests)
- frontend-prod-build: PASSED

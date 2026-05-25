# Social Sharing Buttons UI

## Problem Statement
The public menu page needs social sharing buttons so restaurant owners and customers can share menu links via WhatsApp, Facebook, Twitter/X, copy link, and the native Web Share API.

## Implementation Plan

### Files Created
1. `src/shared/enums/SharePlatform.ts` - Const enum for sharing platforms (WhatsApp, Facebook, Twitter, CopyLink, NativeShare)
2. `src/components/PublicMenu/utils/shareUtils.ts` - URL construction logic for each platform, clipboard API, Web Share API detection
3. `src/components/PublicMenu/utils/shareUtils.test.ts` - 12 unit tests covering all sharing logic
4. `src/components/PublicMenu/utils/shareOptions.ts` - Data-driven share option definitions (icon, label key, hint key, testId)
5. `src/components/PublicMenu/components/ShareButton.tsx` - Floating share button with dropdown menu

### Files Modified
1. `src/localization/locales/en.json` - Added `onlineMenus.socialSharing` section with 13 translation keys
2. `src/shared/testIds/menuTestIds.ts` - Added 6 test IDs for share components
3. `src/components/PublicMenu/index.ts` - Exported ShareButton component
4. `src/components/PublicMenu/components/MenuContentView.tsx` - Integrated ShareButton with optional menuUrl/primaryColor/textOnPrimary props

### Design Decisions
- **Data-driven dropdown**: Share options are defined in `shareOptions.ts` to keep the component DRY and under the 200-line limit
- **Optional integration**: ShareButton only renders when `menuUrl`, `primaryColor`, and `textOnPrimary` are all provided, making it backward-compatible
- **Floating FAB pattern**: The share button is positioned absolutely at bottom-right, non-intrusive on the menu content
- **Web Share API first**: On mobile browsers that support it, the "More" option triggers native sharing; falls back to individual platform links
- **Copy feedback**: "Copied!" text shows for 2 seconds with a green color, then reverts to "Copy Link"

### Verification Results
- [x] `frontend-lint-fix` - No errors in new files (pre-existing errors in other files)
- [x] `frontend-yagni` - No unused exports
- [x] `frontend-unit-tests` - All tests pass (12 new tests for shareUtils)
- [x] `frontend-prod-build` - Build succeeds

## Status: COMPLETED

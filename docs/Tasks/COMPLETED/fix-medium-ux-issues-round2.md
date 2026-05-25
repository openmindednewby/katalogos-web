# Fix Medium UX Issues from Round 2 Review

## Status: COMPLETED

## Problem Statement
10 MEDIUM UX issues blocking QA_PASSED across Dashboard/Nav, Public Menu, Menu Editor, and Settings areas.

## Issues Fixed

### Dashboard + Nav (3)
1. **NavExpandableItem.tsx** - Added active route highlighting for child items using `usePathname` + `isRouteActive`. Applied `activeItemStyle` (background) and `primaryColor` (text) to matching child items. Added `primaryColor` prop and passed it through Sidebar.tsx.
2. **SkipNavLink.tsx** - Added `onFocus`/`onBlur` handlers that toggle `isFocused` state. When focused, `top: 8` makes the link visible. When blurred, returns to `-9999`.
3. **login.tsx** - Replaced all hardcoded colors (`#f5f5f5`, `#333`, `#666`, `#ddd`, `white`, `#007AFF`) with theme colors from `useTheme()`. Fixed generic `accessibilityLabel="Text input field"` to use specific `FM('login.usernameInputLabel')` / `FM('login.passwordInputLabel')`.

### Public Menu (3)
4. **MenuCard.tsx** - Replaced hardcoded English a11y strings with `FM('publicMenu.menuCard.viewMenuHint')` and `FM('publicMenu.menuCard.viewMenuLabel', name)`. Extracted all magic numbers to named constants. Added `FM` import.
5. **MenuDisplayView.tsx** - Passed theme-derived colors (`theme.colors.surface`, `theme.colors.accent`, `theme.colors.text`) to `<OfflineBanner />`.
6. **MenuItemDisplay.tsx + FeaturedItemCard.tsx** - Changed `SeasonalBadge textOnPrimary` from `theme.colors.surface` to white (`#ffffff`) for reliable contrast on dark themes.

### Menu Editor (3)
7. **SeasonalAvailabilityPicker.tsx** - Added `accessibilityRole="button"` to clear button.
8. **VersionHistoryPanel.tsx** - Added `accessibilityRole="button"` to version list items and load more button.
9. **VersionDetailView.tsx + VersionDiffView.tsx** - Added `accessibilityRole="button"` to all 5 TouchableOpacity (back, restore, compare, toggle raw data, diff back).

### Settings (1)
10. **LocationForm.tsx** - Added `isValueDefined` import from `utils/is`. Removed eslint-disable comment. Replaced cancel/save TouchableOpacity with core `<CancelButton>` and `<SaveButton>` components. Removed unused imports (`TouchableOpacity`, `DISABLED_OPACITY`, `INPUT_BORDER_WIDTH`, `BODY_FONT_SIZE`).

## Pre-existing Issues Also Fixed
- **CategoryOverflowMenu.tsx** - Fixed misnamed constant `CATEGORY_MENU_CATEGORY_MENU_OVERLAY_COLOR` -> `CATEGORY_MENU_OVERLAY_COLOR`
- **9 files missing `MODAL_OVERLAY_COLOR` import** - Added import from `shared/constants` to: KeyboardShortcutsModal, embedWidgetStyles, MenuPreviewModal, qrCodeStyles, qrDesignerStyles, TranslationEditModal, InviteTeamMemberModal, ModalDropdown, FullMenuEditor
- **2 files with `DISABLED_OPACITY` re-export issue** - WhiteLabelSettings/styles.ts and ContentPreviewStyles.ts used `export { X } from` which doesn't bring into local scope. Fixed to import + re-export.
- **TimePeriodSelector.tsx** - Added missing `primary` dependency to useCallback array
- **TooltipOverlay.tsx** - Removed unused `colors` destructuring (auto-fixed by linter)

## Translation Keys Added
- `login.usernameInputLabel`: "Username input"
- `login.passwordInputLabel`: "Password input"
- `publicMenu.menuCard.viewMenuHint`: "Opens the full menu"
- `publicMenu.menuCard.viewMenuLabel`: "View {{p1}} menu"

## Quality Gate Results
- Lint: PASSED
- YAGNI: PASSED
- Unit tests: PASSED
- Prod build: PASSED

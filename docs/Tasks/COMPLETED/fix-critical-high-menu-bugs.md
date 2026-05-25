# Fix Critical and High Severity Bugs - OnlineMenu Feature

## Problem Statement
Nine bugs (3 critical, 6 high) identified in the OnlineMenu feature affecting stability, correctness, and user experience.

## Bugs Fixed

### Critical
- **BUG-MENU-001**: Stale closure cascade in `refetchMenusSoon` - used `useRef` for `listQuery.refetch` so the callback has stable identity (`[]` deps) while always calling the latest refetch.
- **BUG-MENU-002**: Wrong onSuccess parameter count (4 vs 3) - changed `(data, variables, onMutateResult, ctx)` to `(data, variables, context)` matching the useMutation signature.
- **BUG-MENU-003**: `...options` spread overwrites onSuccess - destructured `onSuccess` out of options, spread `...restOptions` BEFORE `mutationFn`/`onSuccess`, ensuring the inline `onSuccess` always runs and calls `options?.onSuccess` internally.

### High
- **BUG-MENU-004**: Stale closure in `handleThemeSelect` - used functional updater `setMenuContents((prev) => applyThemeToMenuContents(menuTheme, prev))` with empty deps.
- **BUG-MENU-005**: Error side effects during render in public menus list - moved `logger.error` and `notify` into `useEffect` with `[listQuery.isError, listQuery.error]` deps. Placed useEffect before early returns to satisfy Rules of Hooks.
- **BUG-MENU-006**: Error side effects during render in public menu viewer - same fix as BUG-005.
- **BUG-MENU-007**: Duplicate React keys for categories - changed from `category-${categoryName}` to `category.id ?? \`category-${index}\``.
- **BUG-MENU-008**: Duplicate React keys for menu items - changed from `${categoryName}-${itemName}-${itemPrice}` to `item.id ?? \`item-${index}\``.
- **BUG-MENU-009**: Font size input snaps back when cleared - added local `fontSizeText` state, validate on blur only, sync from prop via useEffect.

## Files Modified
- `src/hooks/menuHandlers/menuQueryHooks.ts` (BUG-001)
- `src/hooks/useMenuActions.ts` (BUG-002, BUG-003)
- `src/components/OnlineMenus/FullMenuEditor.tsx` (BUG-004)
- `app/public/menus/index.tsx` (BUG-005)
- `app/public/menu/[id].tsx` (BUG-006)
- `src/components/PublicMenu/MenuContentView.tsx` (BUG-007)
- `src/components/PublicMenu/CategorySection.tsx` (BUG-008)
- `src/components/OnlineMenus/GlobalStylingControls.tsx` (BUG-009)

## Test Files Updated/Created
- `src/hooks/__tests__/useMenuQueries.test.tsx` - updated with ref stability and latest-refetch tests
- `src/hooks/__tests__/useMenuActions.test.tsx` - added 3-param signature and no-overwrite tests
- `src/components/OnlineMenus/__tests__/handleThemeSelect.test.ts` - NEW: functional updater tests
- `src/components/PublicMenu/__tests__/errorSideEffects.test.ts` - NEW: error side effect pattern tests
- `src/components/PublicMenu/__tests__/reactKeyUniqueness.test.ts` - NEW: key uniqueness tests
- `src/components/OnlineMenus/__tests__/fontSizeInput.test.ts` - NEW: font size validation tests

## Verification Results
- `npm run lint:fix` - all changed files pass (0 errors in our files)
- `npm run test:coverage` - 1850/1851 tests pass (1 failure is pre-existing in quiz tests)
- `npx expo export --platform web` - build succeeds

## Status: COMPLETED

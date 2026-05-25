# Subscription Feature Gating - UI Integration

## Status: COMPLETED

## Problem Statement
The subscription infrastructure (hooks, limits, components) was built but not wired into the actual UI flows. Users on the free tier could create unlimited menus, add unlimited items, use premium themes, configure custom domains, and the public menu never showed a watermark.

## Changes Made

### 1. Menu Creation Limit
- **File**: `app/(protected)/menus/index.tsx`
- Added `useSubscription()` hook to get `limits.maxMenus`
- Modified `handleCreate` to compare `allItems.length >= limits.maxMenus`
- Shows info notification with `settings.billing.featureGating.menuLimitReached` when at limit

### 2. Menu Item Creation Limit
- **File**: `src/components/OnlineMenus/MenuContentEditor.tsx`
- Added `useSubscription()` hook to get `limits.maxItemsPerMenu`
- Modified `handleAddItem` to check `existingItems.length >= limits.maxItemsPerMenu`
- Shows info notification with `settings.billing.featureGating.itemLimitReached` when at limit

### 3. Theme Selection Gating
- **File**: `src/components/OnlineMenus/ThemeSelector.tsx`
- Added `isPremiumTheme()` utility (exported, tested) - light/dark are free, elegant/colorful/minimal are premium
- Added `hasPremiumThemes` and `onPremiumThemeBlocked` props
- Premium themes show lock icon and reduced opacity when locked
- Blocked themes trigger `onPremiumThemeBlocked` callback instead of selecting
- Fixed pre-existing hardcoded accessibility strings
- Added testIDs per theme card
- **File**: `src/components/OnlineMenus/MetadataTab.tsx` - passes through gating props
- **File**: `src/features/onlinemenus/components/FullMenuEditor.tsx` - wires subscription limits
- **Test**: `src/components/OnlineMenus/isPremiumTheme.test.ts` - 6 test cases

### 4. Watermark on Public Menu
- **File**: `app/public/menu/[id].tsx`
- Added `FreeTierWatermark` component after `MenuContentView`
- Controlled by `showWatermark` derived from API data (safe type assertion)
- Since public menu API doesn't yet include `showWatermark` field, defaults to showing
- Does NOT use `useSubscription()` (correct - public page has no auth context)
- Backend ticket needed: add `showWatermark` field to public menu DTO

### 5. Custom Domain Gating
- **File**: `src/components/Settings/CustomDomainSettings/components/CustomDomainSettingsScreen.tsx`
- Added `useSubscription()` hook for `limits.hasCustomDomain` and `tier`
- When no domain configured AND `!limits.hasCustomDomain`: shows `UpgradePrompt` with Pro tier
- When no domain configured AND `limits.hasCustomDomain`: shows `AddDomainForm` (existing behavior)
- Existing domains still visible (for users who downgraded)
- Refactored to avoid nested ternary (ESLint compliance)

### Translation Keys Added
- `settings.billing.featureGating.customDomainRequiresPro`
- `settings.billing.featureGating.premiumThemeLockHint`
- `settings.billing.featureGating.premiumThemeLockLabel`
- `onlineMenus.themes.applyHint`

## Verification Results
- frontend-lint-fix: All errors are pre-existing (not from this PR)
- frontend-yagni: PASS
- frontend-unit-tests: PASS
- frontend-prod-build: PASS

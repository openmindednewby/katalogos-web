# Popular Items Heatmap (Phase 1.4, P2)

## Status: COMPLETED

## Problem Statement
Customers browse the public menu page but the business has no insight into which items attract the most attention. We need scroll/visibility tracking on the public menu to capture "item impressions" and "item clicks", then surface that popularity data in the admin dashboard.

## Implementation Summary

### Already Implemented (prior work)
- `useItemVisibilityTracker` hook with IntersectionObserver + 1s debounce
- `usePopularItems` hook fetching from `/api/analytics/popular-items`
- `PopularItemsCard`, `PopularItemRow`, `TimePeriodSelector`, `ItemPopularityBadge` components
- `popularityUtils` with `computeClickThroughRate`, `getPopularityTier`, `getDateRangeForPeriod`, `getTopItems`
- `AnalyticsEventName` enum with `MenuItemViewed` and `MenuItemClicked`
- `PopularityTier` and `TimePeriod` enums
- Test IDs in `analyticsTestIds.ts`
- Translation keys in `en.json` under `analytics.popularItems`
- Dashboard integration in `DashboardCards.tsx`
- MenuItemEditor integration with `ItemPopularityBadge`
- Unit tests for tracker, popularity utils, and query key

### Completed in This Session (wiring the tracker into public menu)

**Files modified:**
- `src/components/PublicMenu/components/MenuContentView.tsx` - Added `menuId` prop, initialized `useItemVisibilityTracker` with analytics + cookie consent, passed `observeItem` and `trackItemClick` to children
- `src/components/PublicMenu/components/MenuContentBody.tsx` - Added `menuId` and `observeItem` props, forwarded to `CategorySection`
- `src/components/PublicMenu/components/CategorySection.tsx` - Added `menuId` and `observeItem` props, forwarded to `MenuItemDisplay` with `categoryName`
- `src/components/PublicMenu/components/MenuItemDisplay.tsx` - Added ref callback that sets `data-track-item-id` dataset and calls `observeItem` for IntersectionObserver tracking
- `app/public/menu/[id].tsx` - Passed `menuId` to `MenuContentView`
- `app/public/menu/embed/[id].tsx` - Passed `menuId` to `MenuContentView`

**Pre-existing issues fixed:**
- `app/(protected)/menus/index.tsx` - Extracted complex 3-expression condition to named variable
- `src/hooks/whiteLabel/hooks/useWhiteLabelRuntime.test.ts` - Updated test mock to include `setAttribute` method after linter changed `existing.href = url` to `existing.setAttribute('href', url)`
- `src/components/PublicMenu/components/MenuDisplayView.tsx` - Extracted from `[id].tsx` by linter (auto-fix for max-lines)

## Data Flow

```
Public Menu Page ([id].tsx)
  -> MenuContentView (initializes useItemVisibilityTracker with analytics + consent)
    -> MenuContentBody (forwards observeItem, menuId)
      -> CategorySection (forwards observeItem, menuId, categoryName)
        -> MenuItemDisplay (ref callback sets data-track-item-id, calls observeItem)
          -> IntersectionObserver tracks visibility >1s -> fires MenuItemViewed event
          -> Item press -> fires MenuItemClicked event via trackItemClick

Analytics Provider (gated on cookie consent)
  -> MultiProviderClient (PostHog, Umami, DevClient)
    -> Events sent to analytics backend

Admin Dashboard
  -> PopularItemsCard (usePopularItems hook fetches from /api/analytics/popular-items)
    -> TimePeriodSelector (Today/7d/30d)
    -> PopularItemRow (item name, category, views, clicks, CTR, bar chart)

Menu Editor
  -> MenuItemEditor
    -> ItemPopularityBadge (Hot/Popular/Normal based on view count thresholds)
```

## Success Criteria
- [x] IntersectionObserver tracks item visibility after 1s with debounce
- [x] Analytics events fired for item_viewed and item_clicked
- [x] GDPR consent check before tracking (cookie consent analytics flag)
- [x] PopularItemsCard shows top items with view/click/CTR
- [x] TimePeriodSelector allows Today/7d/30d filtering
- [x] ItemPopularityBadge shows Hot/Popular/Normal tiers
- [x] All text uses FM()
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Unit tests pass (3790/3790)
- [x] Lint passes (0 errors, 0 warnings)
- [x] YAGNI passes (no unused exports)
- [x] Build succeeds

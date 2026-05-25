# Trade History Page Implementation

## Problem Statement
The `IncidentsManagementPage` at route `/alerts-incidents/incidents-management` currently shows a "Not Implemented" placeholder. It needs to be replaced with a fully functional Trade History page showing completed/historical trades.

## Implementation Plan
1. Delete the existing stub file `IncidentsManagementPage.tsx`
2. Create directory `IncidentsManagementPage/` with:
   - `index.tsx` - Main page component with header, search, KPIs, and table
   - `data/tradeHistoryData.ts` - Deterministic mock trade data (~80 records)
   - `sections/TradeHistoryTable.tsx` - Native HTML table with PillBadge status/side badges
   - `sections/TradeHistoryKpis.tsx` - 4 KPI summary cards
   - `types.ts` - TradeRecord interface and TradeStatus/TradeSide enums
   - `constants.ts` - Color class mappings and formatting constants
3. Add test IDs to `testIds.business.ts`
4. Add localization keys to `en.json`
5. Write unit tests for data generation and utility functions

## Files to Modify
- DELETE: `src/features/alerts-incidents/pages/IncidentsManagementPage.tsx`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/index.tsx`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/types.ts`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/constants.ts`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/data/tradeHistoryData.ts`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/data/tradeHistoryData.test.ts`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/sections/TradeHistoryTable.tsx`
- CREATE: `src/features/alerts-incidents/pages/IncidentsManagementPage/sections/TradeHistoryKpis.tsx`
- MODIFY: `src/shared/testIds.business.ts`
- MODIFY: `src/localization/locales/en.json`

## Success Criteria
- Page renders with KPI cards, search filter, and trade history table
- PillBadge badges for status and side columns
- Deterministic mock data (~80 records)
- All lint, YAGNI, unit tests, and build checks pass
- Follows existing codebase patterns (CustomersTable, InvoicesTable, alertData)

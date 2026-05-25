# Fix Trade History Hardcoded Text (STS-1)

## Problem
`TradeHistoryTable.tsx` renders `trade.side` and `trade.status` directly as user-facing text inside `<PillBadge>` components without translation. Values like 'Buy', 'Sell', 'Filled', 'Partially Filled', 'Cancelled', 'Expired' are hardcoded runtime strings.

## Files to Modify
- `SyncfusionThemeStudio/src/localization/locales/en.json` - Add translation keys
- `SyncfusionThemeStudio/src/features/alerts-incidents/pages/IncidentsManagementPage/sections/TradeHistoryTable.tsx` - Use FM() with lookup maps

## Implementation Plan
1. Add translation keys under `tradeHistory.side.*` and `tradeHistory.status.*` in en.json
2. Create typed lookup maps mapping data values to translation keys
3. Replace `{trade.side}` and `{trade.status}` with `{FM(lookup[value])}` calls

## Success Criteria
- No hardcoded user-facing text in PillBadge components
- Lint passes
- Build passes

# Menu Data Export (CSV/JSON) - Phase 1.2 P2

## Status: COMPLETE

## Problem Statement
Business users need the ability to export their menu data for backup purposes and GDPR data portability compliance. The export should produce CSV and JSON files that are round-trip compatible with the existing import wizard.

## Implementation Summary

### Files Created (12 files)
1. `src/shared/enums/ExportFormat.ts` - const enum for CSV/JSON
2. `src/shared/testIds/menuExportTestIds.ts` - 5 test IDs for export UI
3. `src/components/OnlineMenus/MenuExport/utils/formatMenuCsv.ts` - CSV formatting (import-compatible)
4. `src/components/OnlineMenus/MenuExport/utils/formatMenuJson.ts` - Structured JSON formatting
5. `src/components/OnlineMenus/MenuExport/utils/downloadFile.ts` - Browser Blob download + filename builder
6. `src/components/OnlineMenus/MenuExport/utils/formatMenuCsv.test.ts` - 10 CSV tests
7. `src/components/OnlineMenus/MenuExport/utils/formatMenuJson.test.ts` - 8 JSON tests
8. `src/components/OnlineMenus/MenuExport/utils/downloadFile.test.ts` - 7 filename tests
9. `src/components/OnlineMenus/MenuExport/hooks/useMenuExport.ts` - Export hook with format selection
10. `src/components/OnlineMenus/MenuExport/hooks/useMenuExport.test.ts` - 10 hook tests
11. `src/components/OnlineMenus/MenuExport/ExportMenuButton.tsx` - Button with CSV/JSON toggle
12. `src/components/OnlineMenus/MenuExport/index.ts` - Barrel export

### Files Modified (3 files)
1. `src/localization/locales/en.json` - Added `menuExport` section with 11 translation keys
2. `src/shared/testIds.ts` - Imported and spread `MenuExportTestIds`
3. `src/components/OnlineMenus/MenuContentEditor.tsx` - Added ExportMenuButton below import button

### Verification Results
- **Lint**: All MenuExport files pass lint (pre-existing errors in PdfExport, EmojiPicker, Sidebar unchanged)
- **Unit Tests**: All 4 new test suites (35 tests) pass (pre-existing failures in CategoryEditor/EmojiPicker/PdfExport unchanged)
- **All user-facing text uses FM()** - verified
- **All interactive elements have testID + accessibilityLabel + accessibilityHint** - verified
- **Files under 300 lines** - largest is ExportMenuButton.tsx at 89 lines

### CSV Format
Headers: `Category,Item Name,Description,Price`
- Compatible with the import wizard column aliases
- Sorted by displayOrder (categories, then items within each)
- Proper CSV escaping for commas, quotes, newlines

### JSON Format
```json
{
  "exportDate": "2026-03-20T...",
  "categoryCount": 2,
  "itemCount": 5,
  "categories": [
    {
      "name": "Starters",
      "description": "",
      "displayOrder": 0,
      "items": [{ "name": "Soup", "description": "Tomato", "price": 5.00, "isAvailable": true, "dietaryTags": [] }]
    }
  ]
}
```

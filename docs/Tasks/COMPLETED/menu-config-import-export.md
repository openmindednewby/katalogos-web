# Menu Configuration Import/Export

> **Reference**: Phase 6 of Menu Customization Feature

## Status: COMPLETED

## Problem Statement

Implement Import/Export functionality for menu configuration to allow users to:
1. Export their current menu configuration as a JSON file for backup
2. Import previously exported configurations to restore or share menu styles
3. Preview imported configurations before applying them

## Implementation

### Export Utility (`menuConfigExport.ts`)
- `exportMenuConfig(contents: MenuContents): string` - Converts to JSON with metadata
- `downloadMenuConfig(contents: MenuContents, filename?: string)` - Triggers browser download
- `createMenuConfigBlob(contents: MenuContents): Blob` - Creates blob for manual handling
- `generateExportFilename(customName?: string): string` - Generates timestamped filename
- Includes metadata: version, exportDate, appVersion

### Import Utility (`menuConfigImport.ts`)
- `parseMenuConfig(jsonString: string): ImportResult` - Parse and validate JSON
- `validateMenuConfig(config: unknown): config is MenuContents` - Type guard
- `migrateMenuConfig(contents, fromVersion): MenuContents` - Version migration
- `importMenuConfigFromFile(file: File): Promise<ImportResult>` - File reading with validation
- `getValidationErrors(config): ValidationError[]` - Detailed error reporting
- Handles both full export format (with metadata) and raw MenuContents (legacy)

### UI Component (`ImportExportButtons.tsx`)
- Export button that downloads current config as JSON
- Import button with file picker
- Preview modal showing imported config summary
- Error display for invalid files
- Metadata display (export date, app version)
- Confirmation before applying import

## Files Created

- `BaseClient/src/utils/menuConfigExport.ts` - Export utility (100% test coverage)
- `BaseClient/src/utils/menuConfigImport.ts` - Import utility (87%+ test coverage)
- `BaseClient/src/utils/__tests__/menuConfigExport.test.ts` - Export tests (31 tests)
- `BaseClient/src/utils/__tests__/menuConfigImport.test.ts` - Import tests (54 tests)
- `BaseClient/src/components/OnlineMenus/Styling/ImportExportButtons.tsx` - UI component
- `BaseClient/src/components/OnlineMenus/Styling/importExportButtonsStyles.ts` - Styles
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/ImportExportButtons.test.tsx` - Component tests (10 tests)

## Files Modified

- `BaseClient/src/shared/testIds.ts` - Added new testIds for import/export
- `BaseClient/jest.setup.js` - Added Button mock for react-native-paper

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       95 passed, 95 total

Coverage:
- menuConfigExport.ts: 100% statements, 100% branches, 100% functions, 100% lines
- menuConfigImport.ts: 87% statements, 87% branches, 93% functions, 96% lines
- ImportExportButtons.tsx: 51% (logic tested, UI interactions via E2E)
```

## Verification Results

- [x] `npm run lint:fix` - No errors (28 warnings, pre-existing)
- [x] `npm test` - All 95 tests pass
- [x] `npx expo export --platform web` - Build succeeds

## Success Criteria - All Met

- [x] Export utility correctly serializes MenuContents to JSON with metadata
- [x] Export utility triggers browser download
- [x] Import utility correctly parses and validates JSON
- [x] Import utility handles invalid JSON gracefully
- [x] Import utility handles version migration
- [x] UI component allows export and import
- [x] UI component shows preview before applying
- [x] Unit tests for export/import utilities with 80%+ coverage
- [x] Component under 200 lines (176 lines)
- [x] Linting passes with no errors
- [x] Build succeeds

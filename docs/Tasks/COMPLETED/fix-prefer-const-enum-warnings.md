# Fix prefer-const-enum and enum-file-isolation ESLint Warnings

## Status: COMPLETED

## Problem Statement
The codebase had ~40 `prefer-const-enum` warnings (string literal union types that should be const enums) and 2 `enum-file-isolation` warnings (multiple exported enums in one file). These must be fixed to comply with ESLint rules.

## Implementation Plan

### Phase 1: Shared/consolidated enums (need own files)
Create new enum files for types used across multiple files:
1. `ThemeMode` -> `src/shared/enums/ThemeMode.ts`
2. `HttpMethod` -> `src/shared/enums/HttpMethod.ts`
3. `Viewport` -> `src/shared/enums/Viewport.ts`
4. `LayoutTemplate` -> `src/types/enums/LayoutTemplate.ts`

### Phase 2: File-local enums (convert in-place or create own file)
5. `EditorTab` in FullMenuEditor.tsx
6. `ConnectionStatusType` in RealTimeNotificationProvider.tsx (removed, using library type)
7. `MenuTabFilter` -> `src/shared/enums/MenuTabFilter.ts`
8. `Environment` -> `src/shared/enums/Environment.ts`
9. `PwaInstallOutcome` in usePWAInstall.ts
10. `LogLevel` -> `src/shared/enums/LogLevel.ts`

### Phase 3: Convert types in menuStyleTypes.ts and menuStyleItemTypes.ts
Each exported to its own file:
- FontWeight, LayoutTemplate, CategoryLayoutType, ItemLayoutType
- HorizontalPosition, LogoSize, MediaPosition, MediaSize, MediaFit
- TitlePosition, ContentAlignment, CategoryItemLayout
- PricePosition, CurrencyPosition, ItemLayoutVariant, ItemImagePosition, BadgePosition

### Phase 4: Other files
- QuestionType -> `src/shared/enums/QuestionType.ts`
- NotificationType -> `src/shared/enums/NotificationType.ts`
- ContentCategory, ContentStatus -> `src/shared/enums/ContentCategory.ts`, `ContentStatus.ts`
- TypographySectionKey, NumericFontWeight -> own files
- BuiltInToolbarItem -> own file

### Phase 5: identity-client enum-file-isolation
- Split AuthMethod and OtpType into separate files

## Changes Made

### New Enum Files Created (~32 files)
- `src/shared/enums/ThemeMode.ts` - Light='light', Dark='dark'
- `src/shared/enums/HttpMethod.ts` - Get='GET', Post='POST', Put='PUT', Patch='PATCH', Delete='DELETE'
- `src/shared/enums/Viewport.ts` - Mobile='mobile', Tablet='tablet', Desktop='desktop'
- `src/shared/enums/Environment.ts`, `LogLevel.ts`, `NotificationType.ts`
- `src/shared/enums/ContentCategory.ts`, `ContentStatus.ts`
- `src/shared/enums/QuestionType.ts`, `MenuTabFilter.ts`
- `src/shared/enums/BuiltInToolbarItem.ts`, `TypographySectionKey.ts`, `NumericFontWeight.ts`
- `src/types/enums/FontWeight.ts` - W100-W900 plus Normal, Bold
- `src/types/enums/LayoutTemplate.ts`, `CategoryLayoutType.ts`, `ItemLayoutType.ts`
- `src/types/enums/HorizontalPosition.ts`, `LogoSize.ts`
- `src/types/enums/MediaPosition.ts`, `MediaSize.ts`, `MediaFit.ts`
- `src/types/enums/TitlePosition.ts`, `ContentAlignment.ts`, `CategoryItemLayout.ts`
- `src/types/enums/PricePosition.ts`, `CurrencyPosition.ts`
- `src/types/enums/ItemLayoutVariant.ts`, `ItemImagePosition.ts`, `BadgePosition.ts`
- `packages/identity-client/src/AuthMethod.ts`, `OtpType.ts`

### Source Files Updated (~80+ files)
All source files that used string literal values were updated to import and use the const enum members. Key patterns:
- `theme === 'dark'` -> `theme === ThemeMode.Dark` (59 files)
- `position === 'left'` -> `position === MediaPosition.Left` (10+ files)
- `category === 'Image'` -> `category === ContentCategory.Image` (5+ files)
- `question.type === 'text'` -> `question.type === QuestionType.Text` (3+ files)
- All `import type` changed to value imports where enum members are used as values

### Test Files Updated (~35+ files)
All test files updated with:
- Const enum member references instead of string literals (223+ replacements via script + manual fixes)
- Removed duplicate imports (type import + value import for same enum)
- Fixed JSX attribute syntax (`category={ContentCategory.Image}` instead of `category="Image"`)
- Fixed jest.mock factory limitations (cannot reference const enum imports)

## Test Results
- `npm run lint:fix` - 1 pre-existing error (useTenantActions.ts smart-max-lines), zero prefer-const-enum/enum-file-isolation warnings
- `npx tsc --noEmit` - Zero errors
- `npm run test:coverage` - 132 suites, 1746 tests, all passing
- `npx expo export --platform web` - Build succeeds
- `npm run yagni` - No new unused exports

## Success Criteria
- [x] `npm run lint 2>&1 | grep -E "prefer-const-enum|enum-file-isolation"` returns nothing
- [x] `npx tsc --noEmit` has zero errors
- [x] `npm run test:coverage` all tests pass
- [x] `npx expo export --platform web` build succeeds

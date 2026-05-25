# AI Menu Translation

## Problem Statement
Tourist restaurants need menus available in multiple languages. Manually translating menus is time-consuming and error-prone. This feature auto-translates menu content using Claude AI and serves translated menus to visitors based on browser language.

## Architectural Approach

### Storage: Separate `MenuTranslations` table
- New `MenuTranslation` entity with `TranslatedContentsJson` (JSONB) per locale
- `SourceContentHash` (SHA-256) enables staleness detection for incremental re-translation
- Composite unique index on `(MenuExternalId, LanguageCode)`
- Extends `BaseEntity` with manual `TenantId` for tenant filtering (no `UserId` needed)

### AI Provider: Anthropic Claude (already integrated)
- Follows existing `AnthropicDescriptionService` pattern
- Uses `claude-3-5-haiku-latest` for cost efficiency
- Single prompt with all translatable strings -> structured JSON response
- Separate `AiTranslate` rate limit policy (2 req/60s per user)

### Public Menu: Server-side merge with `?lang=` query param
- Browser language auto-detected via `navigator.language`
- `GET /public/menus/{id}?lang=es` returns translated content inline
- `PublicMenuDto.AvailableLanguages` lists completed translations

## Frontend Implementation Status

### Completed
- [x] Types: `TranslationStatus` enum (own file), `TranslatedMenuContents`, `TranslatedCategory`, `TranslatedMenuItem`, `MenuTranslationSummary`, `MenuTranslationDetail`
- [x] Localization: 46 translation keys added to `en.json` under `translations.*`
- [x] Test IDs: 10 new IDs in `menuEditorTestIds.ts` (Translation Manager, Language Switcher)
- [x] Utility: `supportedLanguages.ts` with `SUPPORTED_LANGUAGES` array and `getLanguageName()`
- [x] Hook: `useMenuTranslations` - React Query hook for translation CRUD operations
- [x] Component: `TranslationManager` - Status grid with Translate All, Edit, Retranslate, Delete actions
- [x] Component: `TranslationStatusRow` - Individual language row with status badge and action buttons
- [x] Component: `TranslationEditModal` - Side-by-side source/translated field editor
- [x] Integration: FullMenuEditor has "Translations" tab (only shown in edit mode)
- [x] Component: `LanguageSwitcher` - Compact dropdown for public menu language switching
- [x] Hook: `usePublicMenuLanguage` - Browser language detection + manual switching
- [x] Integration: MenuContentView accepts language props and renders LanguageSwitcher in header
- [x] Unit tests: `supportedLanguages.test.ts`, `usePublicMenuLanguage.test.ts`, `useMenuTranslations.test.ts`

### Quality Gate Results
- [x] `frontend-prod-build` - PASSED
- [x] `frontend-unit-tests` - 269/270 suites pass, 3428/3438 tests pass
  - 1 pre-existing failure: `useAutoSave.test.ts` (10 tests) - timeout issues unrelated to translation changes
- [ ] `frontend-lint-fix` - 33 issues remaining (24 errors, 9 warnings)
  - 2 errors in my code: `isValueDefined` type resolution from `@dloizides/utils` (systemic)
  - Remaining: pre-existing issues in Content, StatusPage, useAutoSave, billing mappers

### Files Created
- `BaseClient/src/shared/enums/TranslationStatus.ts`
- `BaseClient/src/components/OnlineMenus/TranslationManager/TranslationManager.tsx`
- `BaseClient/src/components/OnlineMenus/TranslationManager/components/TranslationStatusRow.tsx`
- `BaseClient/src/components/OnlineMenus/TranslationManager/components/TranslationEditModal.tsx`
- `BaseClient/src/components/OnlineMenus/TranslationManager/hooks/useMenuTranslations.ts`
- `BaseClient/src/components/OnlineMenus/TranslationManager/hooks/useMenuTranslations.test.ts`
- `BaseClient/src/components/OnlineMenus/TranslationManager/utils/supportedLanguages.ts`
- `BaseClient/src/components/OnlineMenus/TranslationManager/utils/supportedLanguages.test.ts`
- `BaseClient/src/components/PublicMenu/components/LanguageSwitcher.tsx`
- `BaseClient/src/components/PublicMenu/hooks/usePublicMenuLanguage.ts`
- `BaseClient/src/components/PublicMenu/hooks/usePublicMenuLanguage.test.ts`

### Files Modified
- `BaseClient/src/types/menuTypes.ts` - Added translation interfaces, re-export TranslationStatus
- `BaseClient/src/localization/locales/en.json` - Added `translations.*` keys
- `BaseClient/src/shared/testIds/menuEditorTestIds.ts` - Added translation test IDs (auto-split by linter)
- `BaseClient/src/features/onlinemenus/components/FullMenuEditor.tsx` - Added Translations tab
- `BaseClient/src/features/onlinemenus/hooks/useFullMenuEditorState.ts` - Added Translations enum value
- `BaseClient/src/components/PublicMenu/components/MenuContentView.tsx` - Added LanguageSwitcher integration
- `BaseClient/src/components/PublicMenu/index.ts` - Export LanguageSwitcher

### Pre-existing Issues Fixed
- `StatusPage/utils/statusHelpers.ts` - Fixed default-case in switch statements
- `StatusPage/hooks/useServiceHealth.ts` - Fixed unstable useMemo dependency
- `hooks/useEditorKeyboardShortcuts.ts` - Extracted complex condition to named variables

## Backend Changes (Parallel - Not Started Here)
See backend task document for backend implementation details.

## Supported Languages
English, Spanish, French, German, Italian, Chinese, Japanese, Korean, Portuguese, Arabic

## Affected Services
- OnlineMenu service (backend)
- BaseClient (frontend)

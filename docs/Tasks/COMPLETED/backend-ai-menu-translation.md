# Task: AI Menu Translation Backend

## Status: COMPLETED
## Started: 2026-03-19
## Completed: 2026-03-19

## Problem Statement
Restaurants need the ability to auto-translate their menus into multiple languages using Claude AI. Translations should be stored separately from the source menu, support staleness detection when the source changes, and be served to public consumers via a `?lang=` query parameter.

## Implementation Summary

### Phase 1: Core Domain
- **TranslationStatus enum** - `Pending`, `InProgress`, `Completed`, `Failed`, `Stale`
- **TranslatedMenuContents value object** - Mirrors translatable string fields from MenuContents with OriginalIndex for positional mapping
- **MenuTranslation entity** - Extends BaseEntity (not BaseTenantEntity), stores TenantId, MenuExternalId, LanguageCode, TranslatedContentsJson (JSONB), SourceContentHash (SHA-256), TranslationStatus
- **IAiTranslationService interface** - Translates MenuContents to target language
- **IMenuTranslationRepository interface** - CRUD + MarkAllStale for translations

### Phase 2: Infrastructure
- **MenuTranslationConfiguration** - EF Core config with composite unique index (MenuExternalId, LanguageCode), TenantId index, JSONB column type
- **AppDbContext** - Added MenuTranslations DbSet + manual tenant query filter
- **MenuTranslationRepository** - EF Core implementation of IMenuTranslationRepository
- **AnthropicTranslationService** - Claude API integration using claude-3-5-haiku-latest model
- **DI Registration** - Scoped repository + HttpClient-backed translation service
- **Migration** - 20260319120000_AddMenuTranslations

### Phase 3: Use Cases (CQRS)
- **TranslateMenuCommand/Handler** - AI translation with skip logic for current translations, stale detection
- **UpdateMenuTranslationCommand/Handler** - Manual edit of translation content
- **DeleteMenuTranslationCommand/Handler** - Delete specific language translation
- **GetMenuTranslationsQuery/Handler** - List all translations as summaries
- **GetMenuTranslationDetailQuery/Handler** - Get full translation detail
- **Modified GetPublicMenuQuery** - Added optional LanguageCode parameter
- **Modified GetPublicMenuHandler** - Serves translated content, populates AvailableLanguages
- **Modified UpdateTenantMenusHandler** - Marks translations stale when source changes
- **Modified PublicMenuDto** - Added AvailableLanguages property, made Name/Description settable

### Phase 4: Web Endpoints
- `POST /TenantMenus/{id}/translations/translate` - AI translate (rate-limited: 2/60s)
- `GET /TenantMenus/{id}/translations` - List translations
- `GET /TenantMenus/{id}/translations/{lang}` - Get translation detail
- `PUT /TenantMenus/{id}/translations/{lang}` - Update translation
- `DELETE /TenantMenus/{id}/translations/{lang}` - Delete translation
- `GET /public/menus/{id}?lang=es` - Serve translated public menu
- Added `AiTranslate` rate limit policy

### Phase 5: Unit Tests
- TranslateMenuHandlerTests (6 tests: not found, skip current, retranslate stale, new translation, AI failure, multiple languages)
- UpdateMenuTranslationHandlerTests (2 tests: success, not found)
- GetMenuTranslationsHandlerTests (2 tests: summaries, empty list)
- DeleteMenuTranslationHandlerTests (2 tests: success, not found)
- MenuTranslationEntityTests (12 tests: constructor validation, status transitions, content updates)
- ContentHashHelperTests (5 tests: determinism, uniqueness, edge cases)
- Updated GetPublicMenuHandlerTests for new constructor
- Updated UpdateTenantMenusHandlerTests for new constructor

### Pre-existing Issues Fixed
- IMenuItemViewRepository.cs missing `using OnlineMenu.Core.Common`
- MenuAnalyticsDetailDto.cs missing `using OnlineMenu.UseCases.QrScans.DTOs`
- TrackMenuItemView.cs had corrupted casing (Status204noContent, IsnullOrEmpty, noContentAsync, Categoryname, Itemname)
- GetMenuAnalyticsDetail.cs missing BOM encoding
- Multiple files with LF-only line endings fixed to CRLF
- Multiple files missing UTF-8 BOM encoding
- EndpointRoutesAndDtosTests.cs updated for GetPublicMenuRequest change

## Verification Results
- [x] `onlinemenu-lint` - PASSED
- [x] `onlinemenu-yagni` - PASSED
- [x] `onlinemenu-unit-tests` - PASSED
- [x] `onlinemenu-api` - PASSED (container rebuilds and starts successfully)

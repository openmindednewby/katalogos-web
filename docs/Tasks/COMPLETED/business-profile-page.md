# Business Profile Page

> **Status**: IN_PROGRESS (Phases 7-9 complete, visual-qa + E2E pending)
> **Priority**: P0
> **Started**: 2026-03-16
> **Phase**: 1.6 Settings
> **Scope**: Full-stack (Backend + Frontend)
> **Backend tests**: 537 passing (34 new for BusinessProfile)
> **Frontend tests**: 58 new (22 useOperatingHours + 10 BusinessProfileSettingsScreen + 17 menuStructuredData + 9 useBusinessProfileNudge)

---

## 1. Problem

Restaurant owners have no way to manage their business details -- name, address, phone number, website URL, logo, and operating hours. These details are needed in three places:

1. **Admin Settings** -- the business owner edits their profile (this feature).
2. **Public Menu** -- the public-facing menu page should display restaurant name, logo, address, phone, and hours so customers can find and contact the business.
3. **Welcome Wizard** -- step 1 already captures business name via `updateTenant`; step 2 captures logo. A complete business profile page completes the picture.

Currently the Tenant entity only stores: `Name`, `Slug`, `TenantStatus`, `LogoUrl`, `PrimaryColor`, `ThemeConfigJson`, and authentication configuration fields. There are no fields for address, phone, website, description, or operating hours.

---

## 2. Architecture Decisions

### ADR-1: Extend Tenant Entity vs. Create Separate BusinessProfile Entity

**Context**: Business profile data (address, phone, hours) is needed. Where does it live?

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| A. Add fields to existing `Tenant` entity | Simple, single table, no JOINs, Tenant already has Name+Logo | Tenant entity grows large, mixes concerns (auth config + business info) |
| B. New `BusinessProfile` entity (1:1 with Tenant) | Clean separation, can evolve independently, follows SRP | Extra JOIN, migration complexity, two entities to keep in sync |
| C. New standalone `BusinessService` microservice | Maximum decoupling, independent scaling | Over-engineering for what is essentially tenant metadata, adds operational cost |

**Decision**: **Option B -- New `BusinessProfile` entity in IdentityService** (1:1 relationship with Tenant).

**Rationale**:
- The Tenant entity is already mixing authentication config with branding (LogoUrl, PrimaryColor, ThemeConfigJson). Adding address, phone, hours, and description would further bloat it.
- A `BusinessProfile` entity keeps business contact info cleanly separated from tenant management/auth config.
- It stays in IdentityService because business profile is tenant metadata -- it belongs with the tenant, not in a product-specific service (per the architecture philosophy: "shared services are product-agnostic").
- No new microservice is warranted. Business profile is simple CRUD on tenant metadata.
- The 1:1 relationship ensures every tenant gets exactly one profile. The entity is created lazily on first access (upsert pattern).

**Consequences**:
- Requires a new EF Core migration in IdentityService.
- Existing tenant endpoints (UpdateTenant) continue to handle `Name`, `LogoUrl`, `PrimaryColor` -- the BusinessProfile endpoint handles the new fields.
- Public menu will need to call a new public endpoint to fetch business profile for display.

### ADR-2: Operating Hours Data Model

**Context**: Operating hours vary by day-of-week and some businesses have split hours (e.g., 11am-2pm, 5pm-10pm).

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| A. JSON blob column | Flexible, no extra table, easy to extend | Harder to query/filter by hours, no referential integrity |
| B. Separate `OperatingHour` table (7+ rows per tenant) | Relational, queryable, normalized | More complexity, 7+ rows per tenant, JOIN overhead |
| C. 7 column pairs (MondayOpen/MondayClose...) | Simple reads | Rigid, cannot handle split hours, 14 columns |

**Decision**: **Option A -- JSON blob column on BusinessProfile** (`OperatingHoursJson`).

**Rationale**:
- Operating hours are always read/written as a complete set (never queried individually).
- The public menu displays them as a block. No need to filter "find restaurants open at 2pm" -- this is not a marketplace.
- JSON supports split hours, special hours, and future extensions without migrations.
- Consistent with the existing `ThemeConfigJson` pattern on Tenant.

**Schema**:
```json
{
  "timezone": "America/New_York",
  "hours": [
    { "day": 0, "open": "09:00", "close": "22:00", "isClosed": false },
    { "day": 1, "open": "09:00", "close": "22:00", "isClosed": false },
    { "day": 2, "open": "09:00", "close": "22:00", "isClosed": false },
    { "day": 3, "open": "09:00", "close": "22:00", "isClosed": false },
    { "day": 4, "open": "09:00", "close": "23:00", "isClosed": false },
    { "day": 5, "open": "10:00", "close": "23:00", "isClosed": false },
    { "day": 6, "isClosed": true }
  ]
}
```
Day values: 0=Monday through 6=Sunday (ISO 8601 convention). Max JSON size: 4KB.

### ADR-3: Self-Service Endpoints (Me/BusinessProfile) vs. Admin Endpoints (Tenants/{id}/BusinessProfile)

**Context**: Who should be able to edit the business profile?

**Decision**: **Two endpoint groups**:
1. `GET/PUT /me/business-profile` -- Self-service for the tenant admin (Admin role). Automatically scoped to the caller's tenant via JWT claims. This is what the Settings page uses.
2. `GET /tenants/{tenantId}/business-profile` -- Read-only, public (AllowAnonymous). This is what the public menu page uses to display business info. Only returns non-sensitive fields (no internal notes).

**Rationale**:
- Follows the existing `Me/` pattern established by user profile endpoints.
- The public endpoint must be anonymous because public menu viewers are unauthenticated.
- Keeps the `Tenants/` admin endpoints for superUser management.

### ADR-4: Logo Upload Strategy

**Context**: Logo upload already exists via ContentService (presigned URL flow). The welcome wizard already captures a logo.

**Decision**: **Reuse existing ContentService upload flow**. The business profile screen will use the same `RequestUploadUrl` + `CompleteUpload` flow that already exists. The `logoUrl` field on the Tenant entity is already populated by the welcome wizard via `updateTenant`. The business profile page will read it from the Tenant and allow changing it via the same flow.

**Rationale**: No new upload infrastructure needed. ContentService handles storage, the business profile just stores the content URL/ID reference.

---

## 3. Data Model

### New Entity: `BusinessProfile`

```csharp
// IdentityService.Core/Entities/BusinessProfile.cs
public class BusinessProfile : BaseEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public Guid TenantId { get; set; }

    // Contact Information
    public string? Phone { get; set; }           // MaxLength: 20
    public string? Email { get; set; }            // MaxLength: 254
    public string? Website { get; set; }          // MaxLength: 2048

    // Location
    public string? AddressLine1 { get; set; }     // MaxLength: 200
    public string? AddressLine2 { get; set; }     // MaxLength: 200
    public string? City { get; set; }             // MaxLength: 100
    public string? State { get; set; }            // MaxLength: 100
    public string? PostalCode { get; set; }       // MaxLength: 20
    public string? Country { get; set; }          // MaxLength: 100

    // Business Details
    public string? Description { get; set; }      // MaxLength: 2000
    public string? CuisineType { get; set; }      // MaxLength: 100

    // Operating Hours (JSON blob, max 4KB)
    public string? OperatingHoursJson { get; set; }

    [Required]
    public new DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    [Required]
    public new DateTime LastUpdatedDate { get; set; } = DateTime.UtcNow;
}
```

**Key design notes**:
- Uses `BaseEntity` (not `BaseTenantEntity`) because `TenantId` is the 1:1 FK to Tenant, not a multi-tenancy filter. There is exactly one BusinessProfile per Tenant.
- `Name` and `LogoUrl` remain on the Tenant entity (they are used for tenant identification and branding, not just business contact info). The business profile screen reads them from the Tenant and writes them via the existing `UpdateTenant` endpoint.
- The `CuisineType` field supports schema.org structured data enrichment (Restaurant.servesCuisine).

---

## 4. API Endpoint Design

### Endpoint 1: GET /me/business-profile

**Purpose**: Get the current tenant's business profile (for the settings page).

```
Route:   GET /me/business-profile
Auth:    Roles(Admin)
Tag:     Me
Response: BusinessProfileResponse (200) or empty default (200, no profile yet)
```

**Response DTO**:
```csharp
public record BusinessProfileResponse(
    // From Tenant entity
    string Name,
    string? LogoUrl,

    // From BusinessProfile entity
    string? Phone,
    string? Email,
    string? Website,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? Description,
    string? CuisineType,
    string? OperatingHoursJson
);
```

**Behavior**: Joins Tenant + BusinessProfile. If no BusinessProfile row exists yet, returns the Tenant name/logo with all other fields null. Never returns 404.

### Endpoint 2: PUT /me/business-profile

**Purpose**: Update (or create) the current tenant's business profile.

```
Route:   PUT /me/business-profile
Auth:    Roles(Admin)
Tag:     Me
Request: UpdateBusinessProfileRequest
Response: 200 OK (no body) on success
```

**Request DTO**:
```csharp
public record UpdateBusinessProfileRequest(
    // Tenant fields (updates Tenant entity)
    string Name,
    string? LogoUrl,

    // BusinessProfile fields (upserts BusinessProfile entity)
    string? Phone,
    string? Email,
    string? Website,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? Description,
    string? CuisineType,
    string? OperatingHoursJson
);
```

**Behavior**:
- Extracts TenantId from JWT claims.
- Updates the Tenant entity's Name (and optionally LogoUrl).
- Upserts the BusinessProfile entity (creates if not exists, updates if exists).
- Validates all fields via FluentValidation.
- Single database transaction.

**Validation Rules**:
```
Name:            Required, MaxLength(200)
Phone:           MaxLength(20), regex for phone format (when provided)
Email:           MaxLength(254), valid email format (when provided)
Website:         MaxLength(2048), valid URL format (when provided)
AddressLine1:    MaxLength(200)
AddressLine2:    MaxLength(200)
City:            MaxLength(100)
State:           MaxLength(100)
PostalCode:      MaxLength(20)
Country:         MaxLength(100)
Description:     MaxLength(2000)
CuisineType:     MaxLength(100)
OperatingHoursJson: MaxLength(4000), valid JSON structure (when provided)
```

### Endpoint 3: GET /tenants/{tenantId}/business-profile (Public)

**Purpose**: Get a tenant's public business profile (for the public menu page).

```
Route:   GET /tenants/{tenantId}/business-profile
Auth:    AllowAnonymous
Tag:     Tenants
Response: PublicBusinessProfileResponse (200) or 404
```

**Response DTO** (subset of full profile -- no internal details):
```csharp
public record PublicBusinessProfileResponse(
    string Name,
    string? LogoUrl,
    string? Phone,
    string? Email,
    string? Website,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? Description,
    string? CuisineType,
    string? OperatingHoursJson
);
```

**Behavior**: Returns tenant name + logo + business profile data. Caches with ETag for performance (public menus are read-heavy). Returns 404 if tenant does not exist.

---

## 5. Implementation Plan

### Phase 1: Backend -- Entity & Migration

- [x] Create `BusinessProfile` entity at `IdentityService/src/IdentityService.Core/Entities/BusinessProfile.cs`
- [x] Add `DbSet<BusinessProfile> BusinessProfiles` to `IdentityDbContext`
- [x] Configure entity in `OnModelCreating` (1:1 FK to Tenant, unique index on TenantId, field max lengths)
- [x] Generate EF Core migration: `20260316120000_AddBusinessProfile.cs`
- [ ] Apply migration to dev database

### Phase 2: Backend -- Endpoints

- [x] Create `Me/GetBusinessProfile.cs` (GET /me/business-profile)
- [x] Create `Me/UpdateBusinessProfile.cs` (PUT /me/business-profile)
- [x] Create `Me/UpdateBusinessProfile.Validator.cs` (FluentValidation)
- [x] Create `Tenants/GetTenantBusinessProfile.cs` (GET /tenants/{tenantId}/business-profile, AllowAnonymous)
- [x] Create shared DTOs: `BusinessProfileResponse`, `UpdateBusinessProfileRequest`, `PublicBusinessProfileResponse`

### Phase 3: Backend -- Unit Tests

- [x] Validator tests for `UpdateBusinessProfileRequestValidator`
- [x] Endpoint tests for `GetBusinessProfile` (happy path, no profile yet, unauthorized)
- [x] Endpoint tests for `UpdateBusinessProfile` (create, update, validation errors)
- [x] Endpoint tests for `GetTenantBusinessProfile` (happy path, 404, anonymous access)
- [x] Entity tests for `BusinessProfile` (construction, update behavior)

### Phase 4: Frontend -- Screen Scaffolding

- [x] Add `BUSINESS_PROFILE_SETTINGS = '/settings/business-profile'` to `navigation/routes.ts`
- [x] Create `src/shared/testIds/businessProfileTestIds.ts` with all test IDs
- [x] Add translation keys to `src/localization/locales/en.json` under `settings.businessProfile`
- [x] Create route file `app/(protected)/settings/business-profile.tsx` (corrected from `(app)` to `(protected)`)

### Phase 5: Frontend -- Components

- [x] Create `src/components/Settings/BusinessProfileSettings/index.ts` (barrel export)
- [x] Create `src/components/Settings/BusinessProfileSettings/constants.ts` (form field limits, section spacing)
- [x] Create `src/components/Settings/BusinessProfileSettings/components/BusinessProfileSettingsScreen.tsx` (main screen)
- [x] Create `src/components/Settings/BusinessProfileSettings/components/BusinessInfoSection.tsx` (name, description, cuisine type)
- [x] Create `src/components/Settings/BusinessProfileSettings/components/ContactInfoSection.tsx` (phone, email, website)
- [x] Create `src/components/Settings/BusinessProfileSettings/components/AddressSection.tsx` (address fields)
- [x] Create `src/components/Settings/BusinessProfileSettings/components/OperatingHoursSection.tsx` (day-by-day hour editor)
- [x] Add `BusinessProfileSettingsScreen` export to `src/components/Settings/index.ts`
- [x] Create mock API hooks at `hooks/useBusinessProfileApi.ts` (temporary, replaced in Phase 7)

### Phase 6: Frontend -- Operating Hours Editor

- [x] Create `src/components/Settings/BusinessProfileSettings/hooks/useOperatingHours.ts` (parse/serialize JSON, day toggle, time input state)
- [x] Create `src/components/Settings/BusinessProfileSettings/components/DayHoursRow.tsx` (single day: open/close/closed toggle)
- [x] Unit test `useOperatingHours` hook (parse, serialize, toggle, edge cases)
- [x] Unit test `BusinessProfileSettingsScreen` logic (save mutation, notifications, derived state)

**Quality gate results (2026-03-16)**:
- `frontend-lint-fix`: PASSED
- `frontend-yagni`: PASSED
- `frontend-unit-tests`: PASSED
- `frontend-prod-build`: PASSED

### Code Review -- Backend (2026-03-16)

7 issues found, all fixed:

1. **SECURITY (HIGH)**: Changed `BusinessProfile` from `BaseEntity` to `BaseTenantEntity` for automatic tenant query filters. Added `SetTenantFilter<BusinessProfile>()` in `OnModelCreating`. New migration `20260316130000_AddBusinessProfileUserId` adds UserId column.
2. **ARCHITECTURE (HIGH)**: Created full CQRS layer — `IdentityService.UseCases/BusinessProfile/` with 3 MediatR handlers (`GetBusinessProfileQuery`, `UpdateBusinessProfileCommand`, `GetPublicBusinessProfileQuery`). All endpoints refactored from direct `IdentityDbContext` to `IMediator` dispatch. Added `IBusinessProfileDbContext` interface.
3. **ENTITY (HIGH)**: Removed `new` keyword property shadows on `CreatedDate`/`LastUpdatedDate`. Now properly inherited from `BaseTenantEntity`. `Create()` factory requires `userId`, calls `SetTenant()`/`SetUser()`. `UpdateFrom()` calls `UpdateTimestamp()`.
4. **VALIDATOR (MEDIUM)**: Fixed `.WithMessage()` ordering — now before `.When()` in all 10 rules.
5. **TESTS (MEDIUM)**: Migrated all 5 test files from `Assert.*` to Shouldly assertions.
6. **ANNOTATIONS (LOW)**: Removed `[Required]`, `[Key]`, `[DatabaseGenerated]` data annotations from entity.

**Backend verification after fixes**: `identity-lint` OK, `identity-yagni` OK, `identity-unit-tests` OK (537 tests, 0 failures)

### Code Review -- Frontend (2026-03-16)

6 issues found, all fixed:

1. **Component structure order (MEDIUM)**: Moved `useTheme()` after TanStack Query hooks in `BusinessProfileSettingsScreen`
2. **JSX ternary (MEDIUM)**: `DayHoursRow` isClosed pattern kept as ternary (linter enforces `react/jsx-no-leaked-render` — `&&` pattern flagged)
3. **Hardcoded placeholders (MEDIUM)**: Replaced `"09:00"`/`"22:00"` with `FM()` keys, added `openTimePlaceholder`/`closeTimePlaceholder` to en.json
4. **Complex condition (MEDIUM)**: Extracted `isDayHours` compound check into 4 named booleans (`hasDay`, `hasOpen`, `hasClose`, `hasIsClosed`)
5. **Props naming (MEDIUM)**: Renamed all 5 custom Props interfaces to standard `interface Props`
6. **Comments (LOW)**: Removed all JSDoc comment blocks from all files

**Linter auto-fixes applied**: Removed unused `primary`/`errorColor` theme vars (replaced with `colors.text`), removed unused `TITLE_GAP` import

**Final frontend quality gate**: All 4 checks PASSED (lint, YAGNI, unit tests, prod build)

### Phase 7: Integration -- API Wiring (COMPLETED 2026-03-18)

- [x] Rebuild identity-api container (`mcp__tilt__trigger_and_wait("identity-api")`)
- [x] Download updated swagger spec from identity service
- [x] Run Orval hook generation (`npx orval --config orval.config.js --project identityApi`)
- [x] Wire generated hooks into `BusinessProfileSettingsScreen`
  - Replaced mock `useGetBusinessProfile`/`useUpdateBusinessProfile` with real Orval hooks
  - Added `useQueryClient` + cache invalidation on save success
  - Extracted `buildRequestData()` and `emptyToNull()` helpers
- [x] Wire generated hooks into public menu page (fetch business profile for display)
  - **BLOCKED**: Public menu response (`TenantMenusDto`) does not include `tenantId`. The public business profile endpoint requires `GET /tenants/{tenantId}/business-profile`. Backend change needed to include tenantId in public menu response. Structured data utilities accept business profile data but actual page wiring deferred.

### Phase 8: Public Menu Integration (COMPLETED 2026-03-18)

- [x] Update `SeoHead.tsx` to include address, phone, operating hours in JSON-LD structured data
  - Added `businessProfile?: BusinessProfileData` prop
  - Passes data through to `generateMenuJsonLd` and `generateMenuMetaTags`
- [x] Update `menuStructuredData.ts` to generate `PostalAddress` and `OpeningHoursSpecification` schema.org types
  - New `businessProfileSchema.ts` with `buildPostalAddress()` and `buildOpeningHours()`
  - New `buildProfileFields()` in `menuStructuredData.ts` (returns Partial<SchemaRestaurant>)
  - SchemaRestaurant enriched with telephone, email, address, servesCuisine, openingHoursSpecification
- [x] Update `menuMetaTags.ts` to include business info in OG tags
  - Enhanced `buildDescription()` to append city/state from business profile
- [x] Unit test structured data generation with business profile fields
  - 17 new tests: telephone, email, cuisine, PostalAddress, openingHoursSpecification, edge cases
  - Tests for `buildPostalAddress` and `buildOpeningHours` standalone functions
- [ ] Update `MenuContentView.tsx` to display business profile data (address, phone, hours)
  - Deferred: requires backend change (tenantId in public menu response) per Phase 7 note

### Phase 9: Dashboard Nudge (COMPLETED 2026-03-18)

- [x] Created `BusinessProfileNudge` component at `Dashboard/components/BusinessProfileNudge.tsx`
  - Card with building emoji, title, description, CTA button linking to settings
  - All text via FM(), proper testIDs and accessibilityLabel/accessibilityHint
- [x] Created `useBusinessProfileNudge` hook at `Dashboard/hooks/useBusinessProfileNudge.ts`
  - Queries business profile, returns boolean for nudge visibility
  - Shows nudge when: hasContent AND profile loaded AND (phone OR address missing)
- [x] Integrated nudge into `DashboardPage.tsx`
  - Extracted `DashboardCards` component to reduce complexity below threshold
- [x] Added translation keys to `en.json` (dashboard.businessProfileNudge.*)
- [x] Added test IDs (DASHBOARD_BUSINESS_PROFILE_NUDGE, DASHBOARD_BUSINESS_PROFILE_NUDGE_CTA)
- [x] Unit tests for nudge logic (9 test cases in useBusinessProfileNudge.test.ts)

### Phase 10: Quality Assurance

- [x] quality-gate: backend (`identity-lint`, `identity-unit-tests`, `identity-yagni`) — ALL PASS (537 tests)
- [x] quality-gate: frontend (`frontend-lint-fix`, `frontend-unit-tests`, `frontend-prod-build`, `frontend-yagni`) — ALL PASS (phases 1-6)
- [x] quality-gate: frontend (phases 7-9) — ALL PASS (lint clean in my files, YAGNI OK, unit tests OK, prod build OK)
- [x] code-reviewer: backend — REVIEW_FAILED → 7 issues fixed → ALL PASS
- [x] code-reviewer: frontend — REVIEW_FAILED → 6 issues fixed → ALL PASS
- [ ] visual-qa: business profile settings screen (all sections, mobile responsive) — blocked (Chrome MCP tools)
- [ ] regression-tester: E2E tests for business profile CRUD — ready for testing
- [ ] regression-tester: E2E tests for public menu with business info display — blocked (tenantId in public menu response)

---

## 6. Files to Create/Modify

### Backend (IdentityService)

**New Files**:
| File | Purpose |
|------|---------|
| `IdentityService/src/IdentityService.Core/Entities/BusinessProfile.cs` | Entity definition |
| `IdentityService/src/IdentityService.API/Me/GetBusinessProfile.cs` | GET /me/business-profile endpoint |
| `IdentityService/src/IdentityService.API/Me/UpdateBusinessProfile.cs` | PUT /me/business-profile endpoint |
| `IdentityService/src/IdentityService.API/Me/UpdateBusinessProfile.Validator.cs` | FluentValidation rules |
| `IdentityService/src/IdentityService.API/Tenants/GetTenantBusinessProfile.cs` | GET /tenants/{tenantId}/business-profile (public) |
| `IdentityService/src/IdentityService.Infrastructure/Data/Migrations/YYYYMMDD_AddBusinessProfile.cs` | EF migration |
| `IdentityService/tests/IdentityService.Tests/BusinessProfile/GetBusinessProfileEndpointTests.cs` | Endpoint tests |
| `IdentityService/tests/IdentityService.Tests/BusinessProfile/UpdateBusinessProfileEndpointTests.cs` | Endpoint tests |
| `IdentityService/tests/IdentityService.Tests/BusinessProfile/UpdateBusinessProfileValidatorTests.cs` | Validator tests |
| `IdentityService/tests/IdentityService.Tests/BusinessProfile/GetTenantBusinessProfileEndpointTests.cs` | Public endpoint tests |
| `IdentityService/tests/IdentityService.Tests/BusinessProfile/BusinessProfileEntityTests.cs` | Entity tests |
| `IdentityService/src/IdentityService.Core/Interfaces/IBusinessProfileDbContext.cs` | DbContext interface for UseCases layer |
| `IdentityService/src/IdentityService.UseCases/DTOs/BusinessProfileDto.cs` | Shared DTO record |
| `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetBusinessProfile/GetBusinessProfileQuery.cs` | MediatR query |
| `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetBusinessProfile/GetBusinessProfileHandler.cs` | Query handler |
| `IdentityService/src/IdentityService.UseCases/BusinessProfile/Commands/UpdateBusinessProfile/UpdateBusinessProfileCommand.cs` | MediatR command |
| `IdentityService/src/IdentityService.UseCases/BusinessProfile/Commands/UpdateBusinessProfile/UpdateBusinessProfileHandler.cs` | Command handler |
| `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetPublicBusinessProfile/GetPublicBusinessProfileQuery.cs` | MediatR query (public) |
| `IdentityService/src/IdentityService.UseCases/BusinessProfile/Queries/GetPublicBusinessProfile/GetPublicBusinessProfileHandler.cs` | Query handler (public) |
| `IdentityService/src/IdentityService.Infrastructure/Data/Migrations/20260316130000_AddBusinessProfileUserId.cs` | Migration for UserId column |

**Modified Files**:
| File | Change |
|------|--------|
| `IdentityService/src/IdentityService.Infrastructure/Data/IdentityDbContext.cs` | Add `DbSet<BusinessProfile>`, configure entity, `SetTenantFilter`, implement `IBusinessProfileDbContext` |
| `IdentityService/src/IdentityService.API/ProgramExtensions.cs` | Register MediatR handlers for BusinessProfile |

### Frontend (BaseClient)

**New Files**:
| File | Purpose |
|------|---------|
| `BaseClient/src/components/Settings/BusinessProfileSettings/index.ts` | Barrel export |
| `BaseClient/src/components/Settings/BusinessProfileSettings/constants.ts` | Form limits, spacing constants |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/BusinessProfileSettingsScreen.tsx` | Main screen (~180 lines) |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/BusinessProfileSettingsScreen.test.ts` | Unit test |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/BusinessInfoSection.tsx` | Name, description, cuisine, logo section |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/ContactInfoSection.tsx` | Phone, email, website section |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/AddressSection.tsx` | Address fields section |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/OperatingHoursSection.tsx` | Hours editor section |
| `BaseClient/src/components/Settings/BusinessProfileSettings/components/DayHoursRow.tsx` | Single day row component |
| `BaseClient/src/components/Settings/BusinessProfileSettings/hooks/useOperatingHours.ts` | Hours state management hook |
| `BaseClient/src/components/Settings/BusinessProfileSettings/hooks/useOperatingHours.test.ts` | Hook unit tests |
| `BaseClient/src/shared/testIds/businessProfileTestIds.ts` | Test ID constants |
| `BaseClient/src/shared/enums/DayOfWeek.ts` | Const enum for day of week (0-6) |
| `BaseClient/app/(protected)/settings/business-profile.tsx` | Route file |

**Modified Files**:
| File | Change |
|------|--------|
| `BaseClient/src/navigation/routes.ts` | Add `BUSINESS_PROFILE_SETTINGS` route |
| `BaseClient/src/localization/locales/en.json` | Add ~40 translation keys under `settings.businessProfile` |
| `BaseClient/src/components/Settings/index.ts` | Export `BusinessProfileSettingsScreen` |
| `BaseClient/src/components/PublicMenu/components/MenuContentView.tsx` | Display business info (phone, address, hours) |
| `BaseClient/src/components/PublicMenu/components/SeoHead.tsx` | Pass business profile data to structured data |
| `BaseClient/src/components/PublicMenu/utils/menuStructuredData.ts` | Add PostalAddress, telephone, openingHoursSpecification |
| `BaseClient/src/components/PublicMenu/utils/menuMetaTags.ts` | Include business info in meta description |

---

## 7. Frontend Component Hierarchy

```
BusinessProfileSettingsScreen
  |-- Heading ("Business Profile")
  |-- BusinessInfoSection
  |     |-- TextInput (Business Name) [from Tenant]
  |     |-- TextInput (Description)
  |     |-- TextInput (Cuisine Type)
  |     |-- LogoUpload (ImagePicker + ContentService) [from Tenant.LogoUrl]
  |-- ContactInfoSection
  |     |-- TextInput (Phone)
  |     |-- TextInput (Email)
  |     |-- TextInput (Website URL)
  |-- AddressSection
  |     |-- TextInput (Address Line 1)
  |     |-- TextInput (Address Line 2)
  |     |-- TextInput (City)
  |     |-- TextInput (State/Province)
  |     |-- TextInput (Postal Code)
  |     |-- TextInput (Country)
  |-- OperatingHoursSection
  |     |-- DayHoursRow (Monday) [toggle closed, open time, close time]
  |     |-- DayHoursRow (Tuesday)
  |     |-- DayHoursRow (Wednesday)
  |     |-- DayHoursRow (Thursday)
  |     |-- DayHoursRow (Friday)
  |     |-- DayHoursRow (Saturday)
  |     |-- DayHoursRow (Sunday)
  |-- Button ("Save Changes")
```

**File size estimates** (all within ESLint limits):
- `BusinessProfileSettingsScreen.tsx`: ~180 lines (form state, loading/error states, save handler)
- `BusinessInfoSection.tsx`: ~80 lines
- `ContactInfoSection.tsx`: ~70 lines
- `AddressSection.tsx`: ~90 lines
- `OperatingHoursSection.tsx`: ~60 lines (maps over days, renders DayHoursRow)
- `DayHoursRow.tsx`: ~70 lines (closed toggle + two time inputs)
- `useOperatingHours.ts`: ~50 lines (parse JSON, update day, serialize)

---

## 8. Integration Points

### 8.1 Welcome Wizard --> Business Profile

The welcome wizard (step 1: business name, step 2: logo) writes to the Tenant entity via `useIdentityServiceAPITenantsUpdateTenant`. The business profile page reads the Tenant's `Name` and `LogoUrl` and displays them alongside the new BusinessProfile fields. When the user saves the business profile form, it updates both the Tenant (name, logo) and the BusinessProfile (everything else) in a single API call.

### 8.2 Public Menu --> Business Profile

The public menu page (`/public/menu/[id]`) currently receives `restaurantName` and `logoUrl` from the menu data. With this feature:
1. The public menu page will also call `GET /tenants/{tenantId}/business-profile` to fetch phone, address, and operating hours.
2. The `MenuContentView` will display a business info section (phone, address, hours) below the menu header.
3. The `SeoHead` will include structured data for `PostalAddress`, `telephone`, and `OpeningHoursSpecification` per schema.org.

### 8.3 Landing Pages --> Business Profile

No direct integration needed. Landing pages are marketing pages, not tenant-specific.

### 8.4 Settings Sidebar

The Settings sidebar navigation needs a new entry: "Business Profile" linking to `/settings/business-profile`. This should be positioned prominently (first or second item) since it is the most important settings page for a restaurant owner.

---

## 9. Security Considerations

| Risk | Mitigation |
|------|------------|
| IDOR (editing another tenant's profile) | TenantId extracted from JWT `sub` claim via `ICurrentTenantService`, never from request body |
| XSS in business description/address | All string fields sanitized on input (FluentValidation max lengths), HTML-encoded on output by React |
| PII exposure via public endpoint | Public endpoint returns only business-relevant fields (no internal IDs, no user data) |
| OperatingHoursJson injection | Validated as well-formed JSON with known schema, max 4KB |
| Rate limiting on public endpoint | Protected by existing rate limiting infrastructure |
| Logo URL manipulation | LogoUrl validated as proper URL format; images served through ContentService with proper CSP headers |

---

## 10. Schema.org Structured Data Enhancement

After this feature, the public menu JSON-LD will be enriched from:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Joe's Diner",
  "url": "https://example.com/public/menu/abc",
  "hasMenu": { ... }
}
```

To:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Joe's Diner",
  "url": "https://example.com/public/menu/abc",
  "logo": "https://cdn.example.com/logos/joes.png",
  "telephone": "+1-555-0123",
  "email": "info@joesdiner.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Springfield",
    "addressRegion": "IL",
    "postalCode": "62701",
    "addressCountry": "US"
  },
  "servesCuisine": "American",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Monday",
      "opens": "09:00",
      "closes": "22:00"
    }
  ],
  "hasMenu": { ... }
}
```

This significantly improves SEO and Google Business integration readiness.

---

## 11. Translation Keys

All keys added under `settings.businessProfile` namespace in `en.json`:

```
settings.businessProfile.title
settings.businessProfile.businessInfo.heading
settings.businessProfile.businessInfo.name
settings.businessProfile.businessInfo.namePlaceholder
settings.businessProfile.businessInfo.description
settings.businessProfile.businessInfo.descriptionPlaceholder
settings.businessProfile.businessInfo.cuisineType
settings.businessProfile.businessInfo.cuisineTypePlaceholder
settings.businessProfile.businessInfo.logo
settings.businessProfile.businessInfo.uploadLogo
settings.businessProfile.businessInfo.changeLogo
settings.businessProfile.contact.heading
settings.businessProfile.contact.phone
settings.businessProfile.contact.phonePlaceholder
settings.businessProfile.contact.email
settings.businessProfile.contact.emailPlaceholder
settings.businessProfile.contact.website
settings.businessProfile.contact.websitePlaceholder
settings.businessProfile.address.heading
settings.businessProfile.address.line1
settings.businessProfile.address.line1Placeholder
settings.businessProfile.address.line2
settings.businessProfile.address.line2Placeholder
settings.businessProfile.address.city
settings.businessProfile.address.cityPlaceholder
settings.businessProfile.address.state
settings.businessProfile.address.statePlaceholder
settings.businessProfile.address.postalCode
settings.businessProfile.address.postalCodePlaceholder
settings.businessProfile.address.country
settings.businessProfile.address.countryPlaceholder
settings.businessProfile.hours.heading
settings.businessProfile.hours.closed
settings.businessProfile.hours.open
settings.businessProfile.hours.close
settings.businessProfile.save
settings.businessProfile.saveHint
settings.businessProfile.messages.saveSuccess
settings.businessProfile.messages.saveError
settings.businessProfile.messages.loadError
settings.businessProfile.days.monday
settings.businessProfile.days.tuesday
settings.businessProfile.days.wednesday
settings.businessProfile.days.thursday
settings.businessProfile.days.friday
settings.businessProfile.days.saturday
settings.businessProfile.days.sunday
```

---

## 12. Dependencies & Risks

| Dependency | Status | Risk |
|------------|--------|------|
| IdentityService Tenant entity | Exists | Low -- adding 1:1 related entity, not modifying Tenant |
| ContentService upload flow | Exists | Low -- reusing existing flow for logo |
| FluentValidation + Validation.Defaults | Exists | Low -- using existing `ValidationLimits` constants |
| Orval hook generation pipeline | Exists | Low -- standard re-generation after swagger update |
| Public menu page | Exists | Medium -- needs modification to fetch and display business profile |
| Welcome wizard | Exists | Low -- no changes to wizard, only dashboard nudge |
| EF Core migration | Required | Low -- additive migration (new table, no schema changes to existing tables) |

---

## 13. Delegation Strategy

This is a **two-domain task** (backend + frontend). Use parallel delegation:

### Backend Agent (`backend-dev`)
- Phases 1-3 (Entity, Endpoints, Unit Tests)
- Domain: `IdentityService/`
- Quality gate: `identity-lint`, `identity-unit-tests`, `identity-yagni`

### Frontend Agent (`frontend-dev`)
- Phases 4-6 (Screen scaffolding, Components, Operating hours editor)
- Can start immediately (mock data) while backend is built
- Domain: `BaseClient/`
- Quality gate: `frontend-lint-fix`, `frontend-unit-tests`, `frontend-prod-build`, `frontend-yagni`

### Integration (sequential, after both complete)
- Phase 7: Orval generation + API wiring
- Phase 8: Public menu integration
- Phase 9: Welcome wizard connection

### QA (parallel after integration)
- Phase 10: quality-gate + code-reviewer + visual-qa + regression-tester

---

## 14. Success Criteria

- [ ] Restaurant owner can view and edit all business profile fields from `/settings/business-profile`
- [ ] Business name and logo are pre-populated from existing Tenant data
- [ ] Operating hours editor allows setting open/close times per day and marking days as closed
- [ ] Public menu page displays business name, phone, address, and operating hours
- [ ] schema.org structured data includes PostalAddress, telephone, and OpeningHoursSpecification
- [ ] All fields validate correctly (phone format, email format, URL format, max lengths)
- [ ] Unauthenticated users can view business profile via public endpoint
- [ ] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [ ] All text uses FM() with keys in en.json
- [ ] Files under 300 lines, components under 200, functions under 50
- [ ] Backend unit tests cover validators, endpoints, and entity logic
- [ ] Frontend unit tests cover useOperatingHours hook logic
- [ ] quality-gate PASSED for both domains
- [ ] code-reviewer PASSED for both domains

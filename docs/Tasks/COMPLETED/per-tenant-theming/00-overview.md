# Per-Tenant Theming System - Master Plan

> **Status**: COMPLETED
> **Priority**: High
> **Architecture Decision**: Hybrid (Option C) - Theme config in IdentityService, assets in ContentService
> **Date**: 2026-02-14
> **Completed**: 2026-03-06

---

## Vision

Make the frontend fully customizable per tenant via a centralized theme configuration system. Each tenant gets their own branding (colors, logo, typography) applied at runtime. All UI components consume theme tokens from a single source of truth.

---

## Architecture Decision Record

### Decision: No dedicated white-label service

**Theme config JSON** stored in IdentityService (owns the Tenant entity, already has `logoUrl` + `primaryColor` fields).
**Logo/asset files** stored via ContentService (already has SeaweedFS, presigned uploads, public URLs, tenant-scoped paths).
**Caching** via Redis (already running for NotificationService).

### Rationale

- A 2-5KB JSON blob with CRUD operations does not justify a new microservice
- IdentityService already owns the Tenant entity - theme is a property of the tenant
- ContentService already handles file storage with tenant-scoped paths
- Zero new infrastructure: no new DB, Docker containers, Tilt resources, or deployment pipelines
- Can be extracted to a dedicated BrandingService later if scope grows significantly

---

## Completion Summary (2026-03-06)

All 13 tasks implemented and verified across 6 parallel waves.

### Test Coverage

| Project | Unit/Integration | Stress Tests | E2E Tests | Total |
|---------|-----------------|--------------|-----------|-------|
| BaseClient | 2,368 | 115 | 31 | 2,514 |
| IdentityService | 51 | -- | -- | 51 |
| TenantThemeEditor | 83 | 69 | 20 | 172 |
| **Total** | **2,502** | **184** | **51** | **2,737** |

### Key Deliverables

- Type system: `TenantThemeConfig`, `ResolvedTheme`, `ColorScale`, `ThemeModeColors`
- Palette generator: HSL-based shade generation (50-900), 1000 scales in ~15ms
- ThemeProvider + `useTheme()` hook: React Context with Redux sync, backwards-compatible
- 5 built-in presets: Default, Tag Heuer, Ocean, Forest, Sunset
- 35+ core components refactored to `useTheme()`
- Backend: GET/PUT theme endpoints, Redis caching (15-min TTL), ETag support
- Theme fetch/cache: localStorage + React Query + ETag conditional requests
- Theme settings page: Preset grid, color pickers, shade previews, branding upload, live preview
- TenantThemeEditor: Standalone Vite + React + Zustand + Tailwind micro-frontend (302KB gzipped)
- Domain migration complete, `useThemeColors()` deprecated (zero consumers)
- Stress tests: 500 random colors, rapid state changes, cache corruption, performance benchmarks
- E2E tests: Theme settings, persistence, multi-tenant isolation, component theming, editor flows

---

## Current State

### Frontend (BaseClient)
- **163 components** in 28 folders, pure React Native (no Syncfusion, no CSS)
- **Theme system**: Redux `uiSlice.theme` stores `'light'` | `'dark'`, colors in `palette.ts`
- **5 styling patterns** in use, most common: `useSelector → themePalette.dark/light`
- **`useThemeColors()` hook** exists but underutilized
- **Two separate color systems**: app theme vs public menu ColorScheme

### Backend (IdentityService)
- Tenant entity has `LogoUrl` (string?) and `PrimaryColor` (string?) fields
- Full CRUD API endpoints for tenants
- `tenantId` flows from JWT → Redux → `X-Tenant-Id` header
- `GetTenantAuthConfig` endpoint is AllowAnonymous (pattern for theme endpoint)

### SyncfusionThemeStudio (reference)
- Comprehensive ThemeConfig: color scales (50-900), status colors, typography, spacing, shadows, borders, transitions, animations, 26 component configs
- Zustand store + CSS variable injection
- 12+ built-in presets, import/export JSON

---

## Task Execution Order

### Phase 1: Theme Infrastructure (Frontend)
Tasks must be done in order within phase:

```
01-theme-type-system
  ├─> 02-palette-generator (needs types)
  └─> 04-default-theme-preset (needs types)
        └─> 03-theme-provider (needs types + palette generator + default preset)
```

### Phase 2: Core Component Library (Frontend, parallel streams)
All 4 tasks can run in parallel after Phase 1:

```
05-core-buttons ──────────┐
06-core-forms ────────────┤
07-core-layout-navigation ┤
08-core-feedback ─────────┘─> 12-migrate-domain-components
```

### Phase 3: Backend + Runtime (parallel with Phase 2)

```
09-backend-tenant-theme ─────> 10-tenant-theme-fetch-cache ─> 11-tenant-theme-settings-page
                         └───> 13-tenant-theme-editor-micro-frontend (standalone app)
```

### Phase 4: Theme Editor Micro-Frontend (parallel with Phase 2 + 3)

```
13-tenant-theme-editor-micro-frontend
  ├─> 13a: Scaffold project (Vite + React + Orval + Tiltfile)
  ├─> 13b: Build editor UI (presets, colors, typography, branding, preview)
  ├─> 13c: API integration (IdentityService + ContentService)
  ├─> 13d: Tiltfile integration (main SaaS Tiltfile + backup)
  └─> 13e: E2E tests (Playwright)
```

### Phase 5: Final Migration
After Phase 2 + 3 complete:

```
12-migrate-domain-components
```

---

## Micro-Frontend Architecture

The theme editor is a **standalone Vite + React app** (like SyncfusionThemeStudio), NOT a page inside BaseClient. This follows the same pattern as the existing Online Menu and Questioner modules.

| Aspect | TenantThemeEditor | SyncfusionThemeStudio (reference) |
|--------|-------------------|-----------------------------------|
| Framework | Vite + React 18 | Same |
| State | Zustand | Same |
| API | Orval + React Query | Same |
| Styling | Tailwind CSS | Same |
| Testing | Vitest + Playwright | Same |
| Dev Port | 4446 | 4444 |
| Prod Port | 4447 | 4445 |

BaseClient links to the theme editor via admin navigation. Auth is shared via JWT.

---

## Data Flow

```
Tenant Admin (Theme Editor @ port 4446) ─> PUT /tenants/{id}/theme ─> IdentityService DB
                                                                     |
                                                              Redis Cache
                                                                     |
User Login ─> JWT (tenantId) ─> GET /tenants/{id}/theme ─> ThemeProvider (Context)
                                                                     |
                                                          useTheme() hook
                                                                     |
                                                          All Components
```

---

## Core Component Inventory (35 components)

| Category | Components |
|----------|-----------|
| **Primitives** | Button (primary/secondary/outline/ghost/danger), Icon, Heading, Title, FieldLabel |
| **Forms** | FormField, FormSwitch, FormActions, ChipSelector, Checkbox, 6 native inputs |
| **Layout** | Section, PageHeaderWithActions, ActionRow, ProtectedLayout |
| **Feedback** | ConfirmDialog, ModalShell, StatusBadge, Toast |
| **Navigation** | Sidebar, Topbar, Tabs, PaginatedList, PaginationControls |
| **Branding** | TenantLogo (new), ThemeSwitcher (existing, enhanced) |

---

## Files Index

| Task | Document |
|------|----------|
| Overview (this file) | `00-overview.md` |
| Theme type system | `01-theme-type-system.md` |
| Palette generator | `02-palette-generator.md` |
| ThemeProvider + useTheme | `03-theme-provider.md` |
| Default theme preset | `04-default-theme-preset.md` |
| Core Buttons | `05-core-buttons.md` |
| Core Forms | `06-core-forms.md` |
| Core Layout/Navigation | `07-core-layout-navigation.md` |
| Core Feedback | `08-core-feedback.md` |
| Backend tenant theme | `09-backend-tenant-theme.md` |
| Tenant theme fetch/cache | `10-tenant-theme-fetch-cache.md` |
| Theme settings page (BaseClient) | `11-tenant-theme-editor.md` |
| Domain component migration | `12-migrate-domain-components.md` |
| **Theme Editor Micro-Frontend** | `13-tenant-theme-editor-micro-frontend.md` |

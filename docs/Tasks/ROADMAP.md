# MenuFlow Product Roadmap

## Vision

A self-service platform where businesses engage their customers through two powerful tools: **digital menus** with QR code sharing for restaurants, and **customizable questionnaires** for customer feedback — no technical skills required.

**Core value**: Professional customer-facing tools, instantly shareable, fully branded per business.

---

## Architecture Philosophy: Reusable Services, Multiple Products

### The Platform, Not a Monolith

This is NOT a single monolithic SaaS app. It is a **platform of reusable, independent services** that power **multiple standalone products**:

| Product | Description | Target Market |
|---------|-------------|---------------|
| **OnlineMenu** | Digital menu creation and sharing for restaurants | Restaurants, cafes, bars, food trucks |
| **Questioner** | Survey/questionnaire builder and response collector | Any business needing feedback, forms, quizzes |

These are **two separate products** that can be sold, deployed, and marketed independently. They happen to share a common foundation — but a customer using OnlineMenu never needs to know Questioner exists, and vice versa.

### Shared Core (Reusable Across All Products)

Every service we build must be designed as a **reusable building block** that any product in the ecosystem can consume. Nothing is OnlineMenu-specific or Questioner-specific at the infrastructure level.

**Shared Services** (used by ALL products):

| Service | Purpose | Reusability |
|---------|---------|-------------|
| **IdentityService** | Authentication, users, tenants, roles | Any multi-tenant app needs auth |
| **ContentService** | File upload, storage, image/video management | Any app with media needs content storage |
| **NotificationService** | Real-time notifications, email, push | Any app needs to notify users |
| **PaymentService** | Subscriptions, billing, invoices | Any SaaS needs billing |
| **White-Label Service** (**DONE**) | Branding, themes, custom domains, custom CSS/HTML injection | Any multi-tenant SaaS needs branding |

**Shared Frontend Core** (BaseClient modules):

| Module | Purpose | Reusability |
|--------|---------|-------------|
| `identity-module` | Login, registration, user management UI | Every product needs auth UI |
| `notification-client` | Notification bell, toast, preferences | Every product needs notifications |
| `tenant-theme-editor-module` | Per-tenant branding UI | Every product needs tenant customization |
| Core components (buttons, forms, modals, layout) | UI building blocks | Every product uses these |

**Product-Specific Modules** (independent, pluggable):

| Module | Product | Can be enabled/disabled independently |
|--------|---------|--------------------------------------|
| `onlinemenu-module` | OnlineMenu | Yes — via feature flags |
| `questioner-module` | Questioner | Yes — via feature flags |
| `OnlineMenuService` (backend) | OnlineMenu | Separate microservice, own database |
| `QuestionerService` (backend) | Questioner | Separate microservice, own database |

### How This Works in Practice

The **feature flag system** already supports this:

```
OnlineMenu Product = identity-module + onlinemenu-module + shared services
Questioner Product = identity-module + questioner-module + shared services
Full Platform      = identity-module + onlinemenu-module + questioner-module + shared services
```

Each deployment is the same codebase with different flags enabled. No code duplication, no separate repos.

### Design Rules for All New Services

Every new service or feature MUST follow these principles:

1. **No cross-product dependencies** — OnlineMenuService must NEVER import from QuestionerService and vice versa. They communicate only through shared services (events via RabbitMQ, content via ContentService, etc.)
2. **Shared services are product-agnostic** — IdentityService, ContentService, NotificationService must not contain any OnlineMenu-specific or Questioner-specific logic. They are generic building blocks.
3. **Frontend modules are self-contained** — Each product module registers its own routes, components, and API hooks. The core shell just renders whatever modules are enabled.
4. **Backend services own their data** — Each service has its own database. No shared databases between product services. Cross-service communication happens via events (RabbitMQ) or API calls.
5. **NuGet/npm packages for shared logic** — Common utilities, types, and clients are published as packages (`@dloizides/utils`, `@dloizides/notification-client`, DomainCore NuGet, etc.), not copied between services.
6. **New services = new products possible** — When building a new service (e.g., ReservationService, LoyaltyService), ask: "Could this be its own product someday?" If yes, design it as a standalone module from day one.

### Future Product Possibilities

Because services are reusable, new products become composition exercises:

| Potential Product | Services Needed |
|-------------------|-----------------|
| **ReservationApp** | IdentityService + ReservationService (new) + NotificationService + PaymentService |
| **LoyaltyApp** | IdentityService + LoyaltyService (new) + NotificationService + PaymentService |
| **FeedbackApp** | IdentityService + QuestionerService + NotificationService (already exists!) |
| **Full Restaurant Suite** | All of the above combined |

This architecture means we build once, sell many times.

---

## Phase 0: Foundation (Pre-Launch Blockers)

These MUST be done before any public launch. Without them, the product is not production-viable.

### 0.1 Security & Infrastructure

| Task | Status | Priority | File |
|------|--------|----------|------|
| Secrets management (extract hardcoded creds) | **DONE** | **P0** | `COMPLETED/secrets-management.md` |
| Rate limiting (prevent abuse/DDoS) | **DONE** | **P0** | `COMPLETED/rate-limiting-nuget.md` |
| Input validation pipeline (FluentValidation) | **DONE** | **P0** | `COMPLETED/input-validation-pipeline.md` |
| Production environment config (appsettings) | **DONE** | **P0** | `COMPLETED/production-environment-config.md` |
| Database backup strategy | **DONE** | **P0** | `COMPLETED/database-backup-strategy.md` |
| Backend CI/CD pipeline | **DONE** | **P0** | `COMPLETED/credential-rotation-and-cicd-pipeline.md` |
| Credential rotation & git history cleanup | **DONE** | **P1** | `COMPLETED/credential-rotation-and-cicd-pipeline.md` |
| Tilt per-environment image builds | **DONE** — Per-service docker-compose overrides (staging + production), Tiltfile `--env` flag, Dockerfile `ENVIRONMENT` build arg, `.env.{env}.example` templates, CI/CD `environment` input, `deploy.sh` script. Dev workflow preserved | **P1** | `TODO/devops/tilt-per-environment-builds.md` |
| GDPR compliance (cookie consent, privacy) | **DONE** | **P1** | `COMPLETED/gdpr-compliance.md` |

### 0.3 Resilience & Critical Coverage (NEW — Launch Blockers)

| Task | Status | Priority | File |
|------|--------|----------|------|
| **Resilience patterns (retry, circuit breaker, graceful degradation)** | **DONE** | **P0** | `COMPLETED/backend-resilience-patterns.md` |
| **Identity test coverage ≥40%** (promoted from Phase 4 — security-critical service) | **DONE** (82.81%, 619 tests) | **P0** | `COMPLETED/backend-identity-test-coverage-82pct.md` |

**Why resilience is Phase 0:** With 5+ microservices communicating via RabbitMQ, unhandled failures cascade. MassTransit has built-in retry/circuit breaker policies — configuring them is low effort, high impact. Must answer: What happens when NotificationService is down? When Stripe webhooks fail? When ContentService is unreachable?

### 0.2 Core UX Gaps (NEW - Must Fix Before Launch)

| Task | Description | Status | Priority | Docs |
|------|-------------|--------|----------|------|
| **QR code generation** | Generate downloadable/printable QR codes per menu — this is the #1 distribution channel for restaurant menus | **DONE** | **P0** | `COMPLETED/qr-code-generation.md` |
| **Landing page / marketing site** | Dedicated landing pages per service (Online Menus + Questionnaires), brand hub at `/`, pricing page | **DONE** | **P0** | `COMPLETED/landing-pages.md` |
| **Pricing page & plan selection** | 3-tier pricing (Free, Pro, Enterprise) with feature comparison. Delivered as part of landing pages | **DONE** | **P0** | `COMPLETED/landing-pages.md` |
| **Empty dashboard → guided action** | Dashboard with guided action cards for new users, overview cards for existing users, quick actions, empty list states | **DONE** | **P0** | `COMPLETED/empty-dashboard-guided-action.md` |
| **Translation infrastructure** | FM()-only convention enforced via ESLint `no-restricted-imports` at `error` level. Full codebase migration: ~104 files from `useTranslation`/`t()` to `FM()`, 177 translation keys added to `en.json` (1068 total), 22 local jest mocks consolidated to global, 7 unit test assertions updated. Zero lint errors, all 196 unit test suites pass. **i18n lint enforcement complete (2026-03-19)**: `i18next/no-literal-string` and `react/jsx-no-literals` upgraded from `warn` to `error` in both BaseClient and SyncfusionThemeStudio. 49 warnings fixed in STS (23 translation keys added, typed lookup maps for runtime strings). `has-accessibility-hint` also upgraded to `error`. Zero warnings policy fully enforced | **DONE** | **P0** | `COMPLETED/i18n-lint-enforcement.md` |
| **Mobile-responsive admin** | All 6 phases complete: useBreakpoint hook, sidebar, dashboard, list pages, menu editor modal (full-screen on phone, responsive tabs), forms/settings (DayHoursRow stacks, BillingHistoryTable scroll, PlanComparisonSection grid). 91 FM() accessibility fixes | **DONE** | **P1** | `COMPLETED/mobile-responsive-admin.md`, `COMPLETED/mobile-responsive-admin-phases-5-6.md` |
| **Error states & feedback** | Success/error toasts on all mutation handlers, empty states on list pages, loading indicators, `t()` → `FM()` migration across ~8 files, ~30 translation keys added | **DONE** | **P1** | `COMPLETED/error-states-feedback.md` |

---

## Phase 1: UX Overhaul (Make It Delightful)

The current UI is functional but utilitarian. To win in the restaurant SaaS market, the UX must feel effortless and polished.

### 1.1 Onboarding & First-Time Experience

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **Welcome wizard** | 3-step onboarding: business name → upload logo → create first menu. Full implementation: WelcomeWizard, WizardStepContent, WizardProgressBar, useWelcomeWizard hook. **Server-side state persistence**: WizardCompleted + ChecklistDismissed fields on UserPreference entity (EF migration), two-tier read (localStorage fast-cache + server authoritative), error resilience fallback. 9 new test cases. Quality gate passed, code review passed | **DONE** | **P0** |
| **Starter menu templates** | Full stack: MenuTemplate aggregate (BaseEntity, slug-based), EF Core config + migration with 5 seed templates (Cafe, Fine Dining, Pizzeria, Bar, Food Truck), GET /MenuTemplates endpoint, CreateTenantMenus extended with optional TemplateSlug. Frontend: MenuTemplateDto, useMenuTemplates hook, TemplateGallery/TemplateCard in Welcome Wizard Step 3. 15+ backend tests (entity + handler + create-with-template) | **DONE** | **P0** |
| **Interactive tooltips** | First-time contextual hints on key UI elements (editor, preview, activate button). useTooltipTour hook + TooltipOverlay + TooltipProvider + TooltipBubble. 3 tours (dashboard, editor, public-menu) x 3 steps. Triggers on dashboard, editor modal, menus page. Reset button in Preferences Settings. 20 unit tests, 30+ i18n keys. **DONE** | **P2** |
| **Progress checklist** | SetupChecklist card on dashboard with 5 auto-detecting steps (logo, menu, items, QR, share). useSetupChecklist hook aggregates API data + localStorage flags. Progress bar, clickable steps with navigation, dismissable. markQrGenerated/markMenuShared utilities for cross-feature integration. **Server-side dismiss persistence** (ChecklistDismissed on UserPreference, two-tier read). 16+4 unit tests, 12 translation keys, 8 testIDs. **DONE** | **P1** |

### 1.2 Menu Editor UX

| Task | Description | Priority |
|------|-------------|----------|
| **Drag-and-drop reordering** | Move up/down buttons for categories and items. `useReorder` hook + `ReorderButtons` component, integrated into MenuContentEditor/CategoryEditor/MenuItemEditor. 20 unit tests (12 hook + 8 integration). No new dependencies (React Native/Expo compatible). Full a11y (testID, labels, hints, disabled state). **DONE** | **P0** |
| **Inline editing** | `useInlineEdit` hook + `InlineEditableText` shared component. Click category/item name text → toggles to input, Enter/blur commits, Escape cancels. Integrated into CategoryEditor + MenuItemEditor headers. Unit tests for hook + component. **DONE** | **P1** |
| **Bulk actions** | Multi-select items for bulk delete, move to category, price change, availability toggle. Frontend-only (items are JSON blob). `useBulkSelection` + `useBulkActions` hooks, `BulkActionBar` + `ItemSelectionCheckbox` + `BulkPriceRow` components. Selection mode in `MenuContentEditor`, `CategoryEditor`, `MenuItemEditor`. 32 unit tests, 20 translation keys, 14 testIDs. **DONE** | **P1** |
| **Undo/redo** | `useUndoRedo` hook (50-snapshot cap), `UndoRedoBar` component. Keyboard: Ctrl+Z undo, Ctrl+Y/Ctrl+Shift+Z redo, Meta+Z redo (Mac). Integrated into FullMenuEditor | **DONE** | **P1** |
| **Auto-save with indicator** | Debounced auto-save with "Saved"/"Unsaved changes" indicator. Integrated into FullMenuEditor alongside undo/redo | **DONE** | **P1** |
| **Image cropping** | Web-only (`react-easy-crop`): `CropModal`, `AspectRatioSelector`, `useImageCrop` hook. `AspectRatioPreset` enum (square, landscape, portrait, etc.). Canvas-to-blob conversion. Integrated into `ImagePicker` + menu/category editor flows. Native uses expo-image-picker's built-in editing. 14 unit tests | **DONE** | **P1** |
| **AI menu import** | Full stack: Claude Vision (Sonnet) extracts categories, items, prices, dietary tags from photo/PDF. Backend: `AnthropicMenuImportService`, `POST /TenantMenus/import-from-image` (multipart, 10MB max, rate limited 5/60s), `POST /TenantMenus/{id}/apply-import` with Replace/Merge strategies. Frontend: 4-step wizard (AiImportModal: Upload → Processing → Review/Edit → Apply), drag-and-drop file picker, editable extracted data, merge strategy selection. Feature gating: Free=1 import, Pro+=unlimited. 40+ backend tests, 26 frontend tests, 40+ i18n keys. **DONE** | **P2** |
| **CSV/Excel menu import** | Multi-step import wizard: Upload → Map Columns (auto-detection, 40+ aliases) → Preview & Validate (color-coded) → Confirm. Native CSV parser (RFC-compliant, BOM), lazy-loaded XLSX. Price parsing ($12.99, 12,99, 1.234,56). Merges with existing categories. ImportMenuModal, useMenuImport, parseMenuFile, columnDetection, validateMenuRows, buildMenuContents. 66 unit tests, 70+ translation keys. **DONE** | **P1** |
| **Menu data export** | CSV + JSON export. `useMenuExport` hook, `ExportMenuButton` with format toggle. CSV compatible with import wizard columns. JSON structured with categories→items hierarchy + export metadata. `downloadFile` utility with sanitized filenames. 12 new files, 35 unit tests, 11 i18n keys. **DONE** | **P2** |
| **Allergen/dietary tags** | Full stack: DietaryTag aggregate + repository + seed data + CQRS + FastEndpoints + EF migration. Frontend: DietaryTagBadge/Selector/Filter components + hooks. Code review: cross-tenant fix, 201 status. **DONE** | **P1** |
| **Item variants & modifiers** | Full stack: VariantGroup/Variant/ModifierGroup/Modifier domain model + FluentValidation (MenuValidationLimits). Frontend: VariantGroupEditor/ModifierGroupEditor + VariantModifierDisplay with "from $X" pricing. 72 validator + 30 helper tests. **DONE** | **P1** |
| **Seasonal/time-based menus** | Full stack: `MenuSchedule` with `ScheduledDays` flags enum + start/end time + `TimeZoneId` (IANA). PUT/DELETE `/TenantMenus/{id}/schedule` endpoints. Public menu auto-filters by day/time with timezone conversion. FluentValidation for flags combos + timezone. Seasonal item availability: `AvailableFrom`/`AvailableTo` (MM-dd) on MenuItem with wrap-around support (Nov-Feb). 67 backend tests. **Frontend**: ScheduleEditor (day chips with weekday/weekend quick-select, time range, timezone picker, preview text), SeasonalAvailabilityPicker (month+day inputs, wrap-around preview, clear), ScheduleIndicator + SeasonalBadge on public menu, `useSetMenuSchedule`/`useRemoveMenuSchedule` hooks, 34 frontend tests, 55+ i18n keys, 18 testIDs. **DONE** | **P2** |
| **Category icons/emoji** | Curated `EmojiPicker` component with 41 emojis across 4 groups (Food, Drinks, Desserts, Other). Toggle button in CategoryEditor, clear option. Icon displayed before category name in editor + public menu. `icon` field added to Category type. 4 new files, 7 modified, 11 unit tests, 11 i18n keys. **DONE** | **P2** |

### 1.3 Public Menu Viewer UX

| Task | Description | Priority |
|------|-------------|----------|
| **Beautiful responsive themes** | 12 polished presets (6 light: Minimal, Modern, Fresh, Classic, Rustic, Vibrant; 6 dark: Elegant, Dark, Coastal, Warm, Botanical, Midnight). Theme resolution: URL `?theme=` → menu themePresetId → legacy colorScheme → default. Responsive phone-first layout (720px max-width desktop). Wired to both public menu pages + embed. 99 unit tests, 25 translation keys. **DONE** | **P0** |
| **Search & filter** | `useMenuFilter` hook with search bar (case-insensitive name matching) + dietary tag filter chips (horizontal scroll, active/inactive toggle) + "Clear All" button + empty state. Featured section auto-hidden when filters active. 25 unit tests, 18 translation keys, 6 testIDs. **DONE** | **P1** |
| **Item detail modal** | Tap item → modal with large image, price ("From $X" for variants), full description, dietary tag badges, variant groups + modifier groups, staff pick badge + quoted note. Responsive (full-screen mobile, centered desktop). Close via X/backdrop/Escape. 8 unit tests, 22 translation keys, 12 testIDs. **DONE** | **P1** |
| **Multi-language menus** | Language switcher on public page when `availableLanguages >= 2`. Re-fetches with `?lang=xx` (backend already done). URL persistence for shareable links. Auto-detects browser language. RTL support (Arabic/Hebrew/Farsi/Urdu). `usePublicMenuLanguage` hook, 18 unit tests. **DONE** | **P1** |
| **Accessibility (WCAG 2.1 AA)** | Skip navigation link in admin layout. `useHighContrast` hook (`prefers-contrast: more`). `useEscapeKey` hook for consistent keyboard dismiss. Focus trap (`useFocusTrap`) in all modals/dropdowns. `AriaLiveRegion` component for screen reader announcements (filter results). `accessibilityRole="header"` on all section headings (8 components). `accessibilityState={{ expanded/selected }}` on dropdowns, menus, nav. Navigation landmarks on sidebar. 7 new files, 15 modified, 10 unit tests, 20 translation keys. **DONE** | **P1** |
| **Offline support (PWA)** | Service worker with stale-while-revalidate for public menu API (24h cache), cache-first for static assets. `useOnlineStatus` hook + `OfflineBanner` ("You're viewing a cached version"). Programmatic `menuCacheManager` (clear/list). Only caches public pages, not admin. PWA manifest already existed. 5 new files, 7 modified, 18 unit tests, 3 i18n keys. **DONE** | **P2** |
| **Social sharing** | ShareButton FAB with dropdown (WhatsApp, Facebook, Twitter, CopyLink, NativeShare). 12 unit tests for shareUtils. OG meta tags previously done. **DONE** | **P1** |
| **Menu PDF export** | Lazy-loaded jsPDF. Formatted layout: restaurant name, menu title, categories as section headers, items with name+price, descriptions, variants with prices, dietary tags, featured items with star, page numbers. `useMenuPdfExport` hook + `ExportPdfButton` with spinner. 8 new files, 17 unit tests, 10 i18n keys. **DONE** | **P2** |

### 1.4 Dashboard & Analytics

| Task | Description | Priority |
|------|-------------|----------|
| **Dashboard redesign** | Guided action cards, overview cards, welcome header, quick actions — **DONE** (delivered as `empty-dashboard-guided-action`). Remaining: popular items, recent activity | **P0** |
| **Menu view analytics** | Track how many times each menu is viewed, by device type, by time of day. Backend: `MenuViewed` event + consumer, aggregation endpoint. Frontend: `AnalyticsDashboardScreen` with metrics visualization. Tenant analytics dashboard with service-level aggregation. Feature flags + server-side tracking pipeline. All 5 analytics phases complete | **DONE** | **P1** |
| **Popular items heatmap** | Show which items customers look at most (scroll tracking on public page). IntersectionObserver visibility tracking on public menu items (>1s = impression), click tracking on item tap, GDPR consent gated. Admin dashboard PopularItemsCard with time period selector (Today/7d/30d), view/click/CTR stats. ItemPopularityBadge (Hot/Popular/Normal) in menu editor. **DONE** | **P2** |
| **QR code scan tracking** | Track which QR codes are scanned, with GDPR-compliant analytics | **DONE** (delivered with QR code generator) | **P2** |
| **Analytics integration** | Multi-provider analytics (Umami + PostHog). **ALL 5 PHASES DONE**: Phase 1 — frontend abstraction (MultiProviderClient, DevClient, UmamiClient, NoOpClient), consent gating, DNT. Phase 2 — event instrumentation (19 track() calls across 13 files: menus, QR, share, themes, notifications, quizzes, errors). Phase 3 — PostHog client + shared sanitizeProperties (17 tests, env-var activated). Phase 4 — tenant analytics dashboard (GET /api/analytics/tenant-summary endpoint, StatCard/TopMenusList/AnalyticsDashboardScreen, admin-only sidebar entry). Phase 5 — useFeatureFlag/useFeatureFlagValue hooks (18 tests), server-side AnalyticsPipelineBehavior + UmamiAnalyticsPublisher (15 tests), Umami Docker Compose in Tiltfile. **Total: ~80 new tests, ~50 files** | **DONE** | **P2** |

### 1.5 Navigation & Layout

| Task | Description | Priority |
|------|-------------|----------|
| **Simplified sidebar** | Grouped flat items into 4 expandable sections (Menus, Feedback, Settings, Admin) via `groupSidebarItems` utility at render time. Modules stay decoupled. Mobile collapsed sidebar updated. 10 unit tests, 4 translation keys, 4 testIDs. **DONE** | **P0** |
| **Breadcrumb navigation** | Static route-to-breadcrumb map + `usePathname()`. `useBreadcrumbs` hook, `Breadcrumb` shared component, `breadcrumbMap.ts` with all 9 settings sub-paths. Integrated into all 9 settings screens. Supports `dynamicLabel` for future menu name breadcrumbs. 13 unit tests. **DONE** | **P1** |
| **Keyboard shortcuts** | `useKeyboardShortcuts` hook + `KeyboardShortcutsProvider` context + `KeyboardShortcutsModal`. Global: Ctrl+S save, Ctrl+N new menu, Ctrl+K command palette. Navigation: Alt+1/2/3 Dashboard/Menus/Settings. Help: ? or Ctrl+/ shows shortcuts modal. Platform-aware (Cmd/Ctrl). Input-aware suppression. 10 new files, 23 unit tests, 17 i18n keys. **DONE** | **P2** |
| **Dark mode toggle** | Three-way toggle (Light/Dark/System) in sidebar. `useDarkMode` hook with localStorage persistence + `prefers-color-scheme` OS detection. `DarkModeToggle` (desktop segmented buttons) + `MobileDarkModeButton` (icon cycling). Wired into ThemeProvider context. 6 new files, 11 modified, 13 unit tests, 8 i18n keys. **DONE** | **P2** |

### 1.6 Settings & Account

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **User profile page** | Full-stack: 7 Me/ endpoints, UserPreference entity + migration, CQRS handlers, 3 frontend screens wired to Orval-generated hooks, validator + handler unit tests with Shouldly. **Account Settings Hub**: `/settings` index page with profile summary + 4 SettingsNavCard components, sidebar "Account" entry, route preloading. Visual QA passed (code-analysis, 4 LOW observations — no blocking issues) | **DONE** | **P1** |
| **Business profile page** | Full-stack: BusinessProfile entity (BaseTenantEntity, 1:1 with Tenant), 3 CQRS handlers, 3 FastEndpoints, FluentValidation, ETag caching. Frontend wired to Orval hooks. Public menu integration: BusinessInfoSection (phone/email/website/address/hours), schema.org structured data (PostalAddress, OpeningHoursSpecification, servesCuisine), meta tags enrichment. Dashboard nudge for profile completion. Visual QA passed (code-analysis, responsive DayHoursRow verified) | **DONE** | **P0** |
| **Billing & subscription page** | Subscription management, plan comparison with billing cycle toggle, billing history table, cancel confirmation dialog, trial countdown, Stripe portal session. 8 React Query hooks, 3 unit test suites | **DONE** | **P1** |
| **Custom domain settings** | Custom domain mapping UI: add domain form, DNS instructions, status badge, domain validation, verification polling. Backend: CustomDomainAggregate, DNS verification, proxy config, 6 CRUD endpoints. Frontend wired to backend API | **DONE** | **P1** |
| **Team management** | Full stack. Backend: TeamMember + TeamInvitation entities (BaseTenantEntity), 5 CQRS commands + 2 queries, 7 FastEndpoints, FluentValidation, MassTransit events, EF migration, 56 backend tests. Authorization: Admin-only for mutations, all roles for reads. Business rules: last-owner protection, unique pending invites, token-based acceptance with expiry. **Frontend**: TeamManagementScreen (`/settings/team`) with member list (role badges, change/remove), pending invitations (revoke), InviteTeamMemberModal (email + role selector), AcceptInvitationPage (`/team/accept/[token]`), TeamConfirmDialogs, 8 custom hooks (`useListTeamMembers`, `useListTeamInvitations`, `useInviteTeamMember`, `useUpdateMemberRole`, `useRemoveMember`, `useRevokeInvitation`, `useAcceptInvitation`), `useTeamActions`/`useTeamMutations` hooks, TeamRole enum, Account Settings Hub card, sidebar + breadcrumb + route preloader, 30+ frontend tests, 60+ i18n keys, 26 testIDs. **DONE** | **P2** |

---

## Phase 2: Growth & Monetization

### 2.1 Payment & Billing

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **Payment service (Stripe)** | Full PaymentService microservice: entities, Stripe provider, CQRS handlers, FastEndpoints, background scheduler, Docker (port 5018/5437), Tilt resources. 115 backend tests. Orval pipeline configured, all 8 hooks wired to generated API. Cross-service feature gating: useSubscription hook, SubscriptionTier/FeatureCode enums, featureLimits utility, UpgradePrompt + FreeTierWatermark components. UI gating wired: menu creation limits, item limits, theme gating (premium lock), custom domain gating, public menu watermark. `ShowWatermark` field added to PublicMenuDto with ISubscriptionStatusService (Clean Architecture). Full E2E suite: 37 unique tests × 3 browsers = 116 total, split into sub-batches (`billing-subscription`: 21 tests, `billing-pricing`: 16 tests). 3 Tilt resources, workers=3. Shared `createAuthenticatedContext()` auth helper. Code review: 4 issues fixed (.nth()→filter, testIdSelector, shared auth, web-first assertions) | **DONE** | **P0** |
| **Free tier** | 1 menu, 10 items, basic themes, "Powered by MenuFlow" watermark | **DONE** (defined in PaymentService) | **P0** |
| **Pro tier** | Unlimited menus, all themes, custom domain, no watermark, analytics. $29/mo, $290/yr | **DONE** (defined in PaymentService) | **P0** |
| **Enterprise tier** | Multi-location, API access, white-label, priority support. $99/mo, $990/yr | **DONE** (defined in PaymentService) | **P1** |
| **Trial period** | 14-day free trial of Pro features. Convert to free or paid after. Background scheduler processes expired trials | **DONE** (implemented in PaymentService) | **P0** |

### 2.2 Distribution & Sharing

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **QR code generator** | Generate QR codes per menu with customizable colors, download PNG/SVG, copy link | **DONE** | **P0** |
| **QR code designer** | Template-based printable materials (table tent, sticker, poster) with QR code + branding. SVG rendering, PNG/SVG/PDF download, text/color customization. 39 unit tests | **DONE** | **P1** |
| **Custom domains** | Full-stack: backend CustomDomainAggregate with DNS verification (CNAME + TXT), background IHostedService, Nginx proxy config, 6 CRUD endpoints. Frontend settings screen with add form, DNS instructions, status badge, verification polling. Wired to API | **DONE** | **P1** |
| **Embeddable widget** | Embed route (`/public/menu/embed/[id]`), vanilla JS widget loader (2.8KB), Embed Widget modal with tabs (iframe/JS), config panel (width/height/theme/accent), code preview with copy. Nginx frame-ancestors CSP header | **DONE** | **P1** |
| **SEO & structured data** | JSON-LD structured data (schema.org Restaurant > Menu > MenuSection > MenuItem), meta tags (title, description, OG), SeoHead component, robots.txt, sitemap.xml. 30 unit tests | **DONE** | **P1** |
| **Google Business integration** | Push menu updates to Google Business Profile automatically | TODO | **P2** |
| **Social media auto-post** | When menu is updated, auto-share to connected Instagram/Facebook | TODO | **P3** |

### 2.3 Communication

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **Email service** | Email.Abstractions + Email.Smtp NuGet packages (MailKit), 6 HTML templates (OTP, welcome, password-reset, payment-receipt, payment-failed, account-deletion), Mailpit dev SMTP capture, IdentityService CompositeNotificationService (SMS + Email), EmbeddedResourceTemplateRenderer | **DONE** | **P0** |
| **Email marketing** | Menu update announcements, promotional emails to customer list | NEW | **P3** |

---

## Phase 3: Competitive Differentiation

### 3.1 Advanced Menu Features

| Task | Description | Priority |
|------|-------------|----------|
| **Multi-location support** | Full stack DONE. Backend: Location aggregate, MenuLocation join, MenuItemOverride, 5 CRUD endpoints, 37 files, 37 tests. Frontend: `/settings/locations` page (LocationList + LocationCard + LocationForm, Enterprise gate, 14 files, 60+ i18n keys, 30 testIDs). Location Override Editor in menu editor (LocationSelector chips, OverrideIndicator badges, ItemOverrideControls with price/availability/description, useLocationOverrides hook, 8 files, 14 tests, 30 i18n keys). Public Menu Location Picker (LocationPicker dropdown, usePublicMenuLocation hook with URL persistence, 3 files, 14 tests, 7 i18n keys). Orval hooks generated. **DONE** | **P1** |
| **Menu versioning** | Full stack: `MenuVersion` entity (BaseTenantEntity), auto-snapshot on every menu update, configurable limit (50). CQRS: CreateMenuVersion, RestoreMenuVersion, GetMenuVersions (paginated), GetMenuVersion, CompareMenuVersions (recursive JSON diff). 4 FastEndpoints. `MenuVersionRepository` with cleanup. 40 backend tests. **Frontend**: VersionHistoryPanel (paginated list, current badge, load more), VersionDetailView (snapshot preview, restore button), VersionDiffView (color-coded Added/Removed/Modified, path display, summary), RestoreConfirmModal, History tab in menu editor, 4 custom hooks (`useMenuVersions`, `useMenuVersion`, `useRestoreMenuVersion`, `useCompareMenuVersions`), versionDiffHelpers utils, 20+ frontend tests, 37 i18n keys, 20 testIDs. **DONE** | **P2** |
| **A/B test menus** | Full stack: `MenuExperiment` entity (Draft→Running→Completed→Archived), SHA256-based 50/50 variant assignment (`VariantAssigner`), per-variant view/click metrics. Backend: 6 FastEndpoints (CRUD + start/stop + record view), `MenuExperimentRepository`, EF migration. Frontend: ExperimentListScreen with Enterprise gating, CreateExperimentModal, ExperimentDetailView with start/stop controls, MetricsComparison (side-by-side progress bars), SignificanceIndicator, ExperimentStatusBadge. 6 custom hooks + tests, `calculateSignificance` utility (13 tests), 50+ i18n keys, 40 testIDs. Zero AI cost. **DONE** | **P3** |
| **Digital ordering integration** | Optional: let customers add items to cart, submit order to kitchen (integration with POS) | **P2** |
| **Nutritional info auto-fill** | Full stack: Claude Haiku estimates calories, protein, carbs, fat, fiber, sodium, serving size, allergens from ingredients text. Backend: `AnthropicNutritionService`, `POST /TenantMenus/{id}/generate-nutrition` (rate limited 20/60s), `NutritionalInfo` + `Ingredients` on MenuItem in JSON blob, range validation. Frontend: IngredientsInput textarea, NutritionCard (editable macros grid), MacroField, NutritionSection, NutritionLabel on public menu item detail. Pro+ AI gating (manual entry free for all). 42 backend tests, 39 frontend tests, 42+ i18n keys. **DONE** | **P3** |
| **Staff picks / featured items** | Full stack: `isFeatured`, `staffNote`, `featuredOrder` on MenuItem; `featuredSectionEnabled`, `featuredSectionTitle` on MenuContents. Frontend: `FeaturedItemControls` editor, `FeaturedSection` + `FeaturedItemCard` display. 12 test IDs, 18 translation keys. **DONE** | **P1** |
| **Seasonal availability** | `AvailableFrom`/`AvailableTo` (MM-dd) on MenuItem in JSON blob. Supports normal ranges (Sep 1 - Nov 30) and wrap-around (Nov 1 - Feb 28). Public menu auto-filters unavailable items. Delivered with seasonal/time-based menus. **DONE** | **P2** |

### 3.2 White-Label & API

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **White-label service** | **Full stack DONE.** Backend: ThemeConfigJson with 8 white-label fields, `BrandedEmailTemplateRenderer` with `TenantBrandingProvider`, all 6 email templates branded. Frontend: `/settings/white-label` page (BrandIdentitySection, AppearanceSection, AttributionSection, SupportSection), Pro+ tier gating via `UpgradePrompt`. Runtime: `useWhiteLabelRuntime` hook injects custom CSS + favicon, `WhiteLabelHeader`/`WhiteLabelFooter` render custom HTML (DOMPurify sanitized), `usePublicWhiteLabelConfig` fetches tenant config for public pages. Watermark respects both subscription tier and white-label config. Breadcrumb + sidebar integration | **DONE** | **P2** |
| **Public API** | API key management in IdentityService (SHA-256 hashed, `mk_live_` format, CRUD endpoints, scopes, rate limit tiers). 3 public read-only endpoints in OnlineMenu (`/public-api/menus`, `/menus/{id}`, `/menus/{id}/items`). `ApiKeyAuthMiddleware` for key validation + tenant resolution. Decoupled public DTOs. 28 new files, 41 tests (684 Identity + 747 OnlineMenu). **DONE** | **P2** |
| **API versioning** | `/api/v1/` URL-based versioning across all 7 services. `ApiVersionRedirectMiddleware` (308 redirects) for backward compat. Fixed 30+ route constant bugs (double `/api/api/`, inconsistent manual prefixes). Swagger + Orval hooks regenerated. Token refresh URL fixed (was pointing to wrong service). E2E paths updated. All services: lint + unit tests + API rebuild passed. **DONE** | **P2** |
| **Webhooks** | Full outbound webhook system in NotificationService. WebhookSubscription + WebhookDelivery entities, 7 CRUD endpoints, HMAC-SHA256 signing (`X-Webhook-Signature`), circuit breaker (5 failures→Degraded, 50→Disabled), exponential backoff retries (1/5/30min), dead-lettering. `WebhookEventConsumer` (MassTransit) for MenuUpdated/QuestionnaireSubmitted/TemplateUpdated/UserInvited. Test endpoint for debugging. 26 new files, 41 tests (273 total Notification). **DONE** | **P3** |

### 3.3 AI Quick Wins (Low Complexity, High Value)

These can ship in days using Claude API. Single API calls, no dedicated infrastructure needed.

| Task | Description | Priority |
|------|-------------|----------|
| **AI menu descriptions** | Full stack: Backend FastEndpoint `POST /TenantMenus/{id}/generate-description`, AnthropicDescriptionService (Claude API), rate limiting (20/60s), Result<T> pattern, 6 tests. Frontend: AiDescriptionButton component + hook integrated into MenuItemEditor. **DONE** | **P1** |
| **AI translation** | Full stack: `MenuTranslation` aggregate, `TranslationStatus` enum, rate limiting (2 req/60s), Claude API batch translation with language auto-detection. Frontend: `useMenuTranslations` hook, `TranslationManager` + `TranslationEditModal` + `LanguageSwitcher`. Public menu: `GET /public/menus/{id}?lang=es` returns translated content, `AvailableLanguages` in response. 46+ translation keys. **DONE** | **P1** |

### 3.4 AI Infrastructure (Dedicated Services Required)

These require dedicated processing pipelines and are longer-term investments.

| Task | Description | Priority |
|------|-------------|----------|
| **AI menu import (photo/PDF)** | Delivered via Claude Vision API in Phase 1.2 — no dedicated pipeline needed. **DONE** | **P2** |
| **AI image enhancement** | Auto-enhance food photos (brightness, contrast, warmth, background blur). Needs image processing service | **P3** |
| **Smart pricing suggestions** | Analyze competitor menus, suggest pricing adjustments. Needs market data + ML pipeline | **P3** |

---

## Phase 4: Scale & Operations

### 4.1 Infrastructure

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **Kubernetes deployment** | Production K8s with auto-scaling | TODO (exists: `TODO/devops/kubernetes-deployment.md`) | **P1** |
| **CDN configuration** | Cloudflare for static assets + menu images | TODO (exists: `TODO/infrastructure/cdn-configuration.md`) | **P1** |
| **Content storage upgrade** | RustFS migration, image processing, virus scanning | Partial (exists: `TODO/partially-implemented/content-storage-distribution-system.md`) | **P1** |
| **WSL2 migration** | Dev environment perf improvement | TODO (exists: `TODO/devops/migrate-dev-environment-to-wsl2.md`) | **P2** |
| **Docker stability optimization** | Container memory allocation reduced from 7.9 GB → 3.8 GB (51% reduction) to fit within 4 GB WSL2 limit. Data-driven: baseline snapshot showed DBs at 5% utilization, APIs at 28-56%. Changes: 6 DBs 512→128 MB, Identity API 512→384 MB, 5 APIs 512→256 MB, RabbitMQ 512→384 MB, Loki 512→256 MB. All 6 APIs switched to Workstation GC (`DOTNET_SYSTEM_GC_SERVER=0`). Enhanced health monitor with per-container `docker stats` snapshots every 5 min + peak tracking. Tiltfile `deps` watch for auto-restart on script changes. **DONE** | **P0** |

### 4.2 Monitoring & Reliability

| Task | Description | Status | Priority |
|------|-------------|--------|----------|
| **Error monitoring (Sentry)** | Cloud Sentry (free tier), DSN-gated no-ops in dev. Frontend: `@sentry/react` wrapper module (`src/lib/monitoring/`), `ErrorBoundary` + `errorReporter` wired, `useSentryUser` hook, 13 tests. Backend: `Serilog.Sinks.Sentry` + `Sentry.AspNetCore` in `Logging.Client` NuGet v1.2.0 (propagates to all 6 services), `SentryUserContextMiddleware` (JWT user/tenant + correlation ID), 26 tests. GDPR: `SendDefaultPii=false`, opaque GUIDs only. **DONE** | **P1** |
| **Alerting (Slack/PagerDuty)** | Grafana contact points configured for Slack + Email + PagerDuty. Notification policies provisioned via YAML. Alert routing implemented | **DONE** | **P1** |
| **Distributed tracing** | `Tracing.Client` NuGet package (v1.0.0) wrapping OpenTelemetry. Auto-instruments ASP.NET Core, HttpClient, EF Core, MassTransit. Jaeger all-in-one container (OTLP on 4317, UI on 16686, 256MB). Integrated in all 6 services. Configurable sampling (100% dev, 10% prod via `Tracing:SamplingRatio`). No-op when Jaeger unavailable. Grafana Jaeger datasource with traces-to-logs linking to Loki. W3C TraceContext propagation. 17 NuGet tests. **DONE** | **P2** |
| **Performance optimization** | Bundle size, Lighthouse 90+ | **DONE** — Lighthouse 99/100, LCP 0.9s, TBT 0ms, CLS 0, cache TTL 100/100. Post-build HTML injection for critical CSS/SEO/preconnect, `serve.json` cache headers, lazy-loaded CookieConsentBanner. Production HTML now correctly includes all `+html.tsx` customizations (were being discarded by `expo export`) | **P1** |
| **Frontend bundle size optimization** | Lazy-loaded NotificationBellButton (React.lazy), switched to lightweight sub-path imports for `@dloizides/notification-client`. Restructured `.size-limit.json` into 4 budgets: initial load (556/600 KB), route chunks (186/250 KB), lazy libs (277/300 KB), total (1020/1100 KB). Documented SignalR in common chunk (future npm package fix needed) | **DONE** | **P1** |
| **Uptime monitoring & health aggregator** | `Metrics.Client` NuGet package (v1.0.0) with `prometheus-net.AspNetCore` — HTTP metrics middleware integrated in all 6 services. Prometheus config with 6 scrape jobs + alert rules (ServiceDown, HighErrorRate, HighLatency). 2 Grafana dashboards provisioned (service-health-overview + service-detail). Health aggregator endpoint `GET /api/v1/health/aggregate` in IdentityService (concurrent polling, IMemoryCache, resilient). Frontend: `StatusPage` component + `useServiceHealth` hook. All 8 Prometheus targets UP, all 6 services healthy (9-31ms response). Bug fix: 3 service ports corrected from 8081 (HTTPS) → 8080 (HTTP) in prometheus.yml + GetAggregateHealth.cs | **DONE** | **P1** |

### 4.3 Code Quality & Test Coverage

#### Reusable Component Library & Enforcement

All UI components must be **product-agnostic, reusable building blocks**. No component in `src/components/` should contain product-specific logic (OnlineMenu, Questioner). Product features consume shared components — they don't create their own one-off variants.

| Task | Description | Status | Priority | File |
|------|-------------|--------|----------|------|
| **Reusable common component audit** | Audit + full remediation: 62 components inventoried, 3 product-coupled violations fixed (ExportButtons moved, CollapsibleSection/SliderRow promoted), 6 duplicated patterns resolved (CancelConfirmDialog deleted, legacy ActionRow deleted, ModalDropdown extracted, ErrorState extracted, StatusBadge consolidated, EmptyListState adopted), FormActions upgraded to core/Button. All 10 recommendations implemented | **DONE** | **P1** | `COMPLETED/component-audit.md` |
| **Component reusability ESLint rules** | 2 custom ESLint plugins: `no-product-imports-in-shared` (bans product imports in shared components, 24 pre-existing violations at warn), `no-duplicate-shared-patterns` (warns on duplicate component basenames). Unit tests for both rules | **DONE** | **P1** | `COMPLETED/eslint-reusability-rules.md` |
| **Shared component storybook / showcase** | In-app showcase at `/showcase/components` (behind `enableThemeEditor` flag) + markdown docs at `docs/component-library/`. 27 components documented across 6 categories (Layout, Inputs, Buttons, Feedback, Data Display, Icons). 80+ translation keys | **DONE** | **P2** | `COMPLETED/component-showcase.md` |

#### Coverage Improvement

Floor thresholds enforced via Tilt to prevent regression. All 6 product services have met or exceeded their coverage targets. Identity test suite fully migrated from Moq to NSubstitute (2026-03-19). **Total: 5,560+ backend tests, 4,007 frontend tests (2026-03-21 final quality check). 9,567+ tests across all domains.**

#### Current Coverage Metrics (2026-03-21)

| Service | Lines | Branches | Tests | Floor Threshold | Target | Status |
|---------|-------|----------|-------|-----------------|--------|--------|
| **Identity** | 81.26% | 78.71% | 784 | 15% (enforced) | 50% | **TARGET EXCEEDED** |
| **Questioner** | 37.3%* | 31.1%* | 210+ | 20% (enforced) | 50% | **ABOVE FLOOR** |
| **OnlineMenu** | 60.62% | 52.45% | 1,026 | 50% (enforced) | 50% | **TARGET EXCEEDED** |
| **Content** | 99.4% | 93.4% | 159 | 95% (enforced) | 50% | **TARGET EXCEEDED** |
| **Notification** | 97.7% | 88.7% | 202 | 55% (enforced) | 60% | **TARGET EXCEEDED** |
| **Payment** | 83.47% | 79.16% | 301 | 40% (enforced) | 50% | **DONE** (83.47%, +125 tests) |
| **Logging.Client** | 74.8% | 60.7% | 73 | 70% (enforced) | 80% | PASS |

*Questioner: Raw total without coverage exclusions. With exclusions (non-testable infrastructure), coverage is ~96.5%.

Frontend coverage (for reference):

| Project | Lines | Threshold | Tests | Status |
|---------|-------|-----------|-------|--------|
| **BaseClient** | 73.7%+ | 50% (enforced) | 4,007 | PASS |
| **@dloizides/utils** | 100% | 100% (enforced) | — | PASS |
| **@dloizides/notification-client** | 81.8% | 70% (enforced) | — | PASS |

#### Coverage Improvement Tasks

| Task | Description | Status | Priority | File |
|------|-------------|--------|----------|------|
| **Coverage thresholds infrastructure** | Add coverlet.msbuild + Tilt threshold enforcement for all backend services | **DONE** | **P0** | `COMPLETED/backend-coverage-thresholds-enforcement.md` |
| **Identity coverage: 15% → 88.4%** | **PROMOTED TO PHASE 0 BLOCKER — EXCEEDED.** 651 tests (+362 new). 18 new endpoint test files covering Auth, Privacy (GDPR), Tenants, Users, LogIngestion. Security-critical service fully covered. Moq→NSubstitute migration (59 files) completed 2026-03-19 | **DONE** | **P0** | `COMPLETED/backend-identity-test-coverage-82pct.md`, `COMPLETED/backend-coverage-identity.md` |
| **Questioner coverage: 21% → 96.5%** | 210 tests (+194 new). Template CRUD, completed questioner, question types, skip conditions, mappers, infrastructure, messaging, validators all covered. Coverage exclusions for non-testable infrastructure aligned with Content service pattern | **DONE** | **P1** | `COMPLETED/backend-coverage-remaining-services.md` |
| **OnlineMenu coverage: 13% → 57.6%** | 694 tests (+618 new). Domain, mappers, validators, security, infrastructure (Anthropic AI, Nginx, DNS, DomainVerification), web layers, analytics handler. Flaky BackgroundService tests fixed. Target exceeded | **DONE** | **P1** | `COMPLETED/backend-onlinemenu-unit-test-coverage.md`, `COMPLETED/backend-coverage-onlinemenu.md` |
| **Content coverage: 32% → 99%** | 159 tests (+116 new). Domain, mappers, handlers, infrastructure fully covered. Target massively exceeded | **DONE** | **P2** | `COMPLETED/backend-content-service-test-coverage.md` |
| **Notification coverage: 44% → 99.4%** | 202 tests (+91 new). Consumers, validators, services, mappers, EfRepository. Coverage exclusions for non-testable infrastructure aligned with Content service pattern | **DONE** | **P2** | `COMPLETED/backend-notification-unit-test-coverage.md`, `COMPLETED/backend-coverage-remaining-services.md` |
| **Payment coverage: 19% → 83.5%** | 301 tests (+187 total). Phase 1: Core 96.9%, UseCases 91%. Phase 2: API layer 10.8%→66.4% (+125 endpoint tests), UseCases 91→99%. Total 83.47% line, 79.2% branch, 91.5% method | **DONE** | **P1** | `COMPLETED/backend-payment-unit-test-coverage.md`, `COMPLETED/payment-coverage-50-percent.md` |

---

## Existing TODO Tasks Mapped to Phases

| Existing Task | Phase | Section |
|---------------|-------|---------|
| ~~secrets-management~~ (DONE) | Phase 0 | 0.1 Security |
| ~~rate-limiting~~ (DONE) | Phase 0 | 0.1 Security |
| ~~input-validation-pipeline~~ (DONE) | Phase 0 | 0.1 Security |
| ~~production-environment-config~~ (DONE) | Phase 0 | 0.1 Infrastructure |
| ~~database-backup-strategy~~ (DONE) | Phase 0 | 0.1 Infrastructure |
| ~~backend-ci-cd-pipeline~~ (DONE — GitHub Actions for 6 services, frontend, E2E, Docker, NuGet) | Phase 0 | 0.1 Infrastructure |
| ~~credential-rotation-git-history~~ (DONE — secret audit 35 findings, rotation script, gitleaks pre-commit) | Phase 0 | 0.1 Security |
| ~~tilt-per-environment-builds~~ (DONE — per-service overrides, Tiltfile --env flag, deploy.sh, CI/CD integration) | Phase 0 | 0.1 Infrastructure |
| ~~gdpr-compliance~~ (DONE) | Phase 0 | 0.1 Compliance |
| ~~qr-code-generation~~ (DONE) | Phase 0 | 0.2 Core UX Gaps |
| ~~landing-pages~~ (DONE) | Phase 0 | 0.2 Core UX Gaps |
| ~~qr-code-scan-tracking~~ (DONE) | Phase 1 | 1.4 Dashboard |
| ~~user-onboarding-flow~~ (DONE — welcome wizard, quality gate + code review passed) | Phase 1 | 1.1 Onboarding |
| ~~user-profile-account-page~~ (DONE — all phases complete, visual QA remaining) | Phase 1 | 1.6 Settings |
| ~~business-profile-page~~ (DONE — Orval wired, public menu integration, dashboard nudge, visual QA remaining) | Phase 1 | 1.6 Settings |
| ~~analytics-tracking~~ (ALL 5 PHASES DONE — abstraction, instrumentation, PostHog, dashboard, feature flags + server-side pipeline) | Phase 1 | 1.4 Dashboard |
| ~~payment-service-implementation~~ (DONE — Orval wired, feature gating, full E2E suite 116 tests in 2 sub-batches, all code review fixes, `useMenuActions.ts` bug fix) | Phase 2 | 2.1 Payment |
| ~~email-service-integration~~ (DONE — NuGet packages, 6 templates, Mailpit, CompositeNotificationService) | Phase 2 | 2.3 Communication |
| ~~qr-code-designer~~ (DONE — table tent, sticker, poster, 39 tests) | Phase 2 | 2.2 Distribution |
| ~~custom-domains~~ (DONE — full stack, DNS verification, proxy config) | Phase 2 | 2.2 Distribution |
| ~~embeddable-widget~~ (DONE — embed route, JS loader, config modal) | Phase 2 | 2.2 Distribution |
| ~~seo-structured-data~~ (DONE — JSON-LD, meta tags, 30 tests) | Phase 2 | 2.2 Distribution |
| ~~white-label-service~~ (DONE — full stack, backend + frontend settings + runtime injection, DOMPurify sanitization) | Phase 3 | 3.2 White-Label |
| ~~public-api-architecture~~ (DONE — API key auth, 3 public endpoints, middleware) | Phase 3 | 3.2 API |
| ~~api-versioning~~ (DONE — `/api/v1/` across 7 services, 308 redirects, 30+ route fixes) | Phase 3 | 3.2 API |
| ~~webhooks-architecture~~ (DONE — outbound webhooks, HMAC signing, circuit breaker, retries) | Phase 3 | 3.2 API |
| kubernetes-deployment | Phase 4 | 4.1 Infrastructure |
| cdn-configuration | Phase 4 | 4.1 Infrastructure |
| content-storage-distribution-system | Phase 4 | 4.1 Infrastructure |
| migrate-dev-environment-to-wsl2 | Phase 4 | 4.1 Infrastructure |
| ~~error-monitoring-sentry~~ (DONE — frontend + backend, Logging.Client v1.2.0, Status Page component) | Phase 4 | 4.2 Monitoring |
| ~~alerting-integration~~ (DONE — Grafana contact points, Slack + Email + PagerDuty, provisioned policies) | Phase 4 | 4.2 Monitoring |
| ~~distributed-tracing~~ (DONE — Tracing.Client NuGet, Jaeger container, all 6 services integrated, Grafana datasource) | Phase 4 | 4.2 Monitoring |
| ~~docker-stability-optimization~~ (DONE — 7.9 GB → 3.8 GB, 51% reduction, Workstation GC, enhanced monitoring) | Phase 4 | 4.1 Infrastructure |
| ~~performance-optimization-plan~~ (DONE — Lighthouse 99/100, post-build HTML injection, cache headers, lazy loading) | Phase 4 | 4.2 Monitoring |
| ~~frontend-bundle-size-optimization~~ (DONE — 1000 KB → 742 KB, 750 KB limit restored) | Phase 4 | 4.2 Monitoring |
| ~~backend-coverage-thresholds-enforcement~~ (DONE) | Phase 4 | 4.3 Code Quality |
| ~~identity-coverage-improvement~~ (DONE — 82.8%, 619 tests, +330 new) | Phase 4 | 4.3 Code Quality |
| ~~questioner-coverage-improvement~~ (DONE — 96.5%, 210 tests) | Phase 4 | 4.3 Code Quality |
| ~~onlinemenu-coverage-improvement~~ (DONE — 61.3%, 639 tests) | Phase 4 | 4.3 Code Quality |
| ~~content-coverage-improvement~~ (DONE — 99.4%, 159 tests) | Phase 4 | 4.3 Code Quality |
| ~~notification-coverage-improvement~~ (DONE — 99.4%, 202 tests) | Phase 4 | 4.3 Code Quality |

| ~~reusable-common-component-audit~~ (DONE — 62 inventoried, all 10 recommendations implemented) | Phase 4 | 4.3 Code Quality |
| ~~component-reusability-eslint-rules~~ (DONE — 2 plugins, 24 pre-existing violations at warn) | Phase 4 | 4.3 Code Quality |
| ~~shared-component-storybook~~ (DONE — in-app showcase + markdown docs, 27 components) | Phase 4 | 4.3 Code Quality |

| ~~payment-coverage-improvement~~ (DONE — 83.47%, 301 tests, API layer 66.4%) | Phase 4 | 4.3 Code Quality |

**Completed on 2026-03-18**: ~~credential-rotation-and-cicd-pipeline~~ (DONE — GitHub Actions for all services, secret audit, rotation script, gitleaks), ~~backend-resilience-patterns~~ (DONE — MassTransit circuit breaker + retry + outbox, TryPublish, 34 tests), ~~backend-identity-test-coverage-82pct~~ (DONE — 15.8%→82.8%, +330 tests, 18 new endpoint test files), ~~allergen-dietary-tags~~ (DONE — full stack, DietaryTag aggregate + CQRS + frontend components), ~~item-variants-modifiers~~ (DONE — full stack, domain model + validators + editors + display, 72+30 tests), ~~mobile-responsive-phases-5-6~~ (DONE — menu editor modal, forms/settings, 91 FM() fixes), ~~social-sharing-buttons~~ (DONE — ShareButton FAB, 12 tests), ~~ai-menu-descriptions~~ (DONE — full stack, Claude API integration, AiDescriptionButton), ~~frontend-starter-menu-templates~~ (DONE — TemplateGallery/TemplateCard in wizard), ~~subscription-feature-gating-ui~~ (DONE — menu/item limits, theme lock, domain gate, watermark), ~~public-menu-business-profile~~ (DONE — BusinessInfoSection, structured data, meta tags), ~~fix-no-product-imports-in-shared~~ (DONE — 23 files moved to features/), ~~component-audit~~ (DONE — all 10 recommendations), ~~eslint-reusability-rules~~ (DONE), ~~component-showcase~~ (DONE), plus 4 code review fix tasks

**Completed since last update**: ~~backend-starter-menu-templates~~ (DONE — MenuTemplate aggregate, 5 seed templates, GET /MenuTemplates, CreateTenantMenus with TemplateSlug, 15+ tests, all OnlineMenu checks pass), ~~backend-questioner-unit-test-coverage~~ (LIKELY DONE — 184 tests, coverage % needs verification), ~~frontend-bundle-size-optimization~~ (DONE — 1000 KB → 742 KB gzipped, lazy-loaded NotificationBellButton, sub-path imports for notification-client, 3-budget .size-limit.json, 750 KB limit restored), ~~payment-billing-e2e-tests~~ (DONE — 38 tests × 3 browsers = 114 total, 4 new spec files, shared auth helper, code review fixes), ~~simplified-sidebar~~ (DONE — 4 expandable groups via groupSidebarItems utility, 10 tests), ~~drag-and-drop-reordering~~ (DONE — move up/down buttons, useReorder hook + ReorderButtons component, 20 tests), ~~beautiful-responsive-themes~~ (DONE — 12 presets, theme resolution pipeline, responsive layout, 99 tests), ~~bundle-size-budget-restructuring~~ (DONE — 4-category .size-limit.json, SignalR fix documented), ~~inline-editing~~ (DONE — useInlineEdit hook + InlineEditableText shared component, integrated into CategoryEditor + MenuItemEditor), ~~progress-checklist~~ (DONE — SetupChecklist card, 5 auto-detecting steps, useSetupChecklist hook, 16 tests), ~~csv-excel-menu-import~~ (DONE — multi-step wizard, CSV/XLSX parsing, column auto-detection, 66 tests), ~~watermark-backend-field~~ (DONE — ShowWatermark on PublicMenuDto, ISubscriptionStatusService, 4 tests)

**Completed on 2026-03-19**: ~~performance-optimization~~ (DONE — Lighthouse 99/100, post-build HTML injection for critical CSS/SEO/preconnect, `serve.json` cache headers, lazy-loaded CookieConsentBanner, production HTML fix), ~~backend-coverage-identity~~ (DONE — 82.8%→88.4%, +32 tests, Moq→NSubstitute migration of 59 files), ~~backend-coverage-onlinemenu~~ (DONE — 55%→61.3%, +353 tests, flaky BackgroundService tests fixed), ~~backend-coverage-questioner~~ (DONE — 50.3%→96.5%, +27 validator tests, coverage exclusions aligned), ~~backend-coverage-notification~~ (DONE — 42.2%→99.4%, +12 EfRepository tests, coverage exclusions aligned). Code review: 11 issues found and fixed across frontend (TranslateFn fallback pattern, hardcoded URL, test colocation, unsafe member access) and backend (Moq→NSubstitute, dead 404 branch, Shouldly assertions, missing else branch, primary constructors, UTF-8 BOM)

**Completed on 2026-03-19 (Tier 1 close-out)**: ~~i18n-lint-enforcement~~ (DONE — `i18next/no-literal-string` + `react/jsx-no-literals` upgraded to `error` in both BaseClient and SyncfusionThemeStudio, 49 STS warnings fixed with FM() calls + typed lookup maps, `has-accessibility-hint` upgraded to `error`, zero-warnings policy fully enforced), ~~payment-billing-e2e-tests~~ (DONE — 38 tests × 3 browsers = 114 total, 4 new spec files: pricing page, subscription flow, upgrade/downgrade, cancellation. `playwright-e2e-billing-all` Tilt resource. Code review: 4 issues fixed, shared `createAuthenticatedContext()` auth helper extracted)

**Completed on 2026-03-19 (Tier 4 Business Features)**: ~~analytics-integration-phases-2-5~~ (DONE — Phase 2: 19 track() calls across 13 files, 6 new event names. Phase 3: PostHogClient + shared sanitizeProperties, 17 tests. Phase 4: GET /api/analytics/tenant-summary backend endpoint + AnalyticsDashboardScreen frontend, admin-only sidebar. Phase 5: useFeatureFlag/useFeatureFlagValue hooks, server-side AnalyticsPipelineBehavior + UmamiAnalyticsPublisher, Umami Docker Compose. ~80 new tests total), ~~account-settings-hub~~ (DONE — /settings index page, AccountSettingsHubScreen + SettingsNavCard, sidebar entry, route preloading, 4 pre-existing issues fixed), ~~onboarding-server-state~~ (DONE — WizardCompleted + ChecklistDismissed on UserPreference entity, EF migration, two-tier localStorage + server read, error resilience, 9 new frontend + 6 new backend tests)

**Completed on 2026-03-19 (Next Roadmap Candidates)**: ~~api-versioning~~ (DONE — `/api/v1/` across 7 services, ApiVersionRedirectMiddleware 308 redirects, 30+ route fixes, swagger regen, E2E path updates), ~~bulk-actions~~ (DONE — frontend-only, 4 operations, useBulkSelection + useBulkActions, BulkActionBar/ItemSelectionCheckbox/BulkPriceRow, 32 tests), ~~breadcrumb-navigation~~ (DONE — breadcrumbMap + useBreadcrumbs + Breadcrumb component, 9 settings screens, 13 tests), ~~sentry-error-monitoring~~ (DONE — frontend @sentry/react wrapper + backend Serilog sink in Logging.Client v1.2.0, all 6 services, GDPR compliant, 127 tests)

**Completed on 2026-03-19 (Phase 1-3 Feature Sweep)**: ~~undo-redo-autosave~~ (DONE — useUndoRedo hook with 50-snapshot cap, UndoRedoBar component, keyboard shortcuts Ctrl+Z/Y/Shift+Z, debounced auto-save with indicator, integrated into FullMenuEditor), ~~image-cropping~~ (DONE — react-easy-crop, CropModal + AspectRatioSelector + useImageCrop hook, AspectRatioPreset enum, canvas-to-blob, integrated into ImagePicker, web-only with native fallback, 14 tests), ~~staff-picks-featured-items~~ (DONE — full stack, isFeatured/staffNote/featuredOrder on MenuItem, FeaturedItemControls editor, FeaturedSection + FeaturedItemCard display, 12 testIDs, 18 translation keys), ~~ai-menu-translation~~ (DONE — full stack, MenuTranslation aggregate, Claude API batch translation, TranslationManager + TranslationEditModal + LanguageSwitcher, public menu `?lang=` support, 46+ translation keys), ~~alerting-integration~~ (DONE — Grafana contact points for Slack + Email + PagerDuty, notification policies provisioned via YAML)

**Completed on 2026-03-20 (Quality Check & Code Review Fixes)**: Full-platform quality check across all 7 domains (5,164 backend + 3,458 frontend tests verified). Code review found and fixed 13 issues: **Frontend** (5 fixes) — httpInterceptor.ts hardcoded string → FM() localization, ErrorBoundary.tsx raw testID → TestIds constant, menuContentViewStyles.ts color constants documented, MenuContentEditor.tsx fallback colors → theme-derived (`themePalette.light.border`/`textSecondary`), debounce.ts dead `useThrottledCallback` removed. **Identity** (4 fixes) — UpdatePreferences.cs null tenant Guid.Empty fallback → 401 Unauthorized, UpdatePreferencesEndpointTests.cs try/catch → proper StatusCode assertion, UserPreference.cs public setters → private set + Update() method (domain encapsulation), LogIngestionEndpoint.cs mutable request → init setters. **OnlineMenu** (2 fixes) — UpdateTenantMenusHandler.cs name validation before domain call (Result.Invalid), Update.Validator.cs + request `contents` → `Contents` PascalCase. **Notification** (2 fixes) — 5 endpoints ThrowError("...", 500) → Send.StringAsync for proper HTTP 500 responses, 6 endpoints added Roles(OnlineMenuRoles.Admin, OnlineMenuRoles.User) authorization declarations

**Completed on 2026-03-20 (Docker Stability)**: ~~docker-stability-optimization~~ (DONE — Container memory allocation reduced from 7.9 GB → 3.8 GB (51% reduction) based on baseline snapshot data. 6 DBs: 512→128 MB (5% utilization). Identity API: 512→384 MB. 5 APIs: 512→256 MB. RabbitMQ: 512→384 MB. Loki: 512→256 MB. All 6 APIs switched to Workstation GC (`DOTNET_SYSTEM_GC_SERVER=0`). Enhanced health monitor with per-container `docker stats` snapshots every 5 min + peak WSL2 tracking + total memory sum. Tiltfile `deps` watch for auto-restart on script changes. Total allocation now fits within 4 GB WSL2 limit)

**Completed on 2026-03-20 (Tier 1 Close-Out)**: ~~uptime-monitoring-prometheus~~ (DONE — all 6 API containers rebuilt, /metrics verified, all 8 Prometheus targets UP, 2 Grafana dashboards provisioned, health aggregator returning Healthy for all 6 services. Bug fix: 3 service ports 8081→8080 in prometheus.yml + GetAggregateHealth.cs). ~~visual-qa-settings~~ (QA_PASSED — code-analysis of all 5 settings pages, 4 LOW observations, 0 blocking issues). ~~health-check-e2e-fixes~~ (DONE — ContentService migrated from local ServiceDefaults to `ServiceDefaults.HealthChecks` NuGet, added Postgres readiness check + `MarkAsReady()`. 17/17 health E2E tests now passing)

**Completed on 2026-03-20 (Tier 3 Features)**: ~~public-menu-search-filter~~ (DONE — `useMenuFilter` hook, search bar with case-insensitive matching, dietary tag filter chips with horizontal scroll + active/inactive toggle, "Clear All" button, empty state, featured section auto-hidden when filtering. 6 new files, 10 modified, 25 unit tests, 18 translation keys, 6 testIDs). ~~item-detail-modal~~ (DONE — tap item → responsive modal with large image, formatted price ("From $X" for variants), full description, dietary tag badges, variant groups + modifier groups with prices, staff pick badge + quoted note. Full-screen mobile, centered desktop. Close via X/backdrop/Escape. 6 new files, 9 modified, 8 unit tests, 22 translation keys, 12 testIDs). ~~multi-language-public-viewer~~ (DONE — language switcher on public page when `availableLanguages >= 2`, re-fetches with `?lang=xx`, URL persistence via `history.replaceState()` for shareable links, auto-detects browser language, RTL support for Arabic/Hebrew/Farsi/Urdu, loading overlay during fetch. `usePublicMenuLanguage` hook, 18 unit tests). ~~payment-coverage-50pct~~ (DONE — 43.1% → 83.5% line coverage, far exceeded 50% target. 114 → 301 tests (+187). 11 new test files covering BillingScheduler, all subscription handlers, pricing plans, infrastructure, feature gating. Fixed pre-existing Stripe webhook `NullReferenceException` bug)

**Completed on 2026-03-20 (Priority A — Launch Critical)**: ~~per-env-builds~~ (DONE — **Last Phase 0 blocker cleared.** Per-service docker-compose overrides (staging + production) for all 6 services, Tiltfile `--env` flag (`tilt up -- --env=staging`), Dockerfile `ENVIRONMENT` build arg, `.env.staging.example` + `.env.production.example` templates, CI/CD `environment` input in `docker-publish-platform.yml`, `deploy.sh` script, PaymentService missing `appsettings.Staging/Production.json` created. Dev workflow fully preserved, Tilt healthy). ~~wcag-accessibility~~ (DONE — **Last Phase 1 P1 item.** Skip navigation link in admin layout, `useHighContrast` hook (`prefers-contrast: more`), `useEscapeKey` hook for consistent keyboard dismiss, focus trap in all modals/dropdowns, `AriaLiveRegion` for screen reader announcements, `accessibilityRole="header"` on all section headings (8 components), `accessibilityState={{ expanded/selected }}` on dropdowns/menus/nav, navigation landmarks on sidebar. 7 new files, 15 modified, 10 unit tests, 20 translation keys)

**Completed on 2026-03-20 (Option 3 — Polish & Harden)**: ~~keyboard-shortcuts~~ (DONE — `useKeyboardShortcuts` hook + `KeyboardShortcutsProvider` context + `KeyboardShortcutsModal`. Global: Ctrl+S save, Ctrl+N new, Ctrl+K command palette. Navigation: Alt+1/2/3. Help: ? or Ctrl+/. Platform-aware Cmd/Ctrl. 10 new files, 23 tests, 17 i18n keys). ~~offline-pwa-support~~ (DONE — service worker: stale-while-revalidate for public menu API (24h cache), cache-first for static assets. `useOnlineStatus` hook + `OfflineBanner`. `menuCacheManager` for programmatic cache clearing. Only public pages cached, not admin. 5 new files, 7 modified, 18 tests, 3 i18n keys). ~~distributed-tracing~~ (DONE — `Tracing.Client` NuGet package (v1.0.0) wrapping OpenTelemetry: ASP.NET Core + HttpClient + EF Core + MassTransit auto-instrumentation. Jaeger all-in-one container (256MB, OTLP 4317, UI 16686). Integrated in all 6 services. Configurable sampling (100% dev, 10% prod). No-op when Jaeger unavailable. Grafana Jaeger datasource with traces-to-logs linking. W3C TraceContext. 17 NuGet tests)

**Completed on 2026-03-20 (Option 2 — Enterprise Revenue)**: ~~multi-location-backend~~ (DONE — Location aggregate with CRUD, MenuLocation join, MenuItemOverride for per-location overrides. 37 new files, 37 tests, 747 total OnlineMenu tests. Frontend UI pending Orval hook gen). ~~public-api~~ (DONE — API key auth in IdentityService (SHA-256, `mk_live_` format, scopes, rate tiers), 3 public endpoints in OnlineMenu, ApiKeyAuthMiddleware, decoupled DTOs. 28 files, 41 tests). ~~webhooks~~ (DONE — full outbound system in NotificationService: WebhookSubscription + WebhookDelivery, 7 CRUD endpoints, HMAC-SHA256 signing, circuit breaker, exponential retries, MassTransit consumer for 4 event types, test endpoint. 26 files, 41 tests, 273 total). ~~dark-mode~~ (DONE — Light/Dark/System toggle, `useDarkMode` hook, localStorage + OS detection. 6 files, 13 tests). ~~menu-pdf-export~~ (DONE — lazy jsPDF, formatted layout with categories/items/variants/tags/featured. 8 files, 17 tests). ~~menu-data-export~~ (DONE — CSV + JSON, import-compatible columns. 12 files, 35 tests). ~~category-emoji~~ (DONE — 41 curated emojis, EmojiPicker, editor + public display. 4 files, 11 tests)

**Completed on 2026-03-20 (Tilt Health — Zero Errors)**: Fixed 5 Tilt errors: Jaeger image tag `1.62`→`1.62.0`, Tracing.Client OTLP exporter conflict + 14 new coverage tests (100%), Portainer restart with `MSYS_NO_PATHCONV=1`, PaymentService rate limit 100→1000/min for E2E, billing E2E fixed after API restart. **138/138 resources healthy**

**Completed on 2026-03-21 (6 Backend + 3 Frontend Features — Roadmap Finalization)**: **Backend**: ~~team-management~~ (DONE — full stack in IdentityService: TeamMember + TeamInvitation entities, 5 CQRS commands + 2 queries, 7 FastEndpoints, FluentValidation, MassTransit events, last-owner protection, 56 unit tests, 784 total Identity tests). ~~menu-versioning~~ (DONE — MenuVersion entity, auto-snapshot on update, paginated list, restore/rollback, JSON diff comparison, configurable 50-version limit, 40 unit tests, 862 total OnlineMenu tests). ~~seasonal-menus-availability~~ (DONE — MenuSchedule with ScheduledDays flags + TimeZoneId, time-based menu visibility, AvailableFrom/AvailableTo seasonal items with wrap-around, 67 unit tests). ~~white-label-frontend~~ (DONE — /settings/white-label page, runtime CSS/favicon/header/footer injection, DOMPurify sanitization, Pro+ tier gating). ~~interactive-tooltips~~ (DONE — 3 guided tours, TooltipProvider/Overlay, reset in settings, 20 tests). ~~popular-items-heatmap~~ (DONE — IntersectionObserver tracking, GDPR gated, PopularItemsCard + ItemPopularityBadge). Quality check: 18 code review issues found and fixed. **Frontend wiring**: ~~team-management-frontend~~ (DONE — /settings/team page: TeamManagementScreen, TeamMemberRow, PendingInvitationRow, InviteTeamMemberModal, TeamConfirmDialogs, AcceptInvitationPage, 8 custom hooks, useTeamActions/useTeamMutations, Account Hub card, sidebar + breadcrumb, 30+ tests, 60+ i18n keys, 26 testIDs). ~~menu-versioning-frontend~~ (DONE — History tab in editor: VersionHistoryPanel, VersionDetailView, VersionDiffView with color-coded changes, RestoreConfirmModal, 4 custom hooks, versionDiffHelpers, 20+ tests, 37 i18n keys, 20 testIDs). ~~seasonal-menus-frontend~~ (DONE — ScheduleEditor with day chips + time pickers + timezone, SeasonalAvailabilityPicker with wrap-around, ScheduleIndicator + SeasonalBadge on public menu, 2 schedule hooks, scheduleUtils + seasonalUtils, 34 tests, 55+ i18n keys, 18 testIDs). **Total: 3,908 frontend tests, 137/137 Tilt resources healthy**

**Completed on 2026-03-21 (AI Features — Competitive Differentiation)**: ~~ai-menu-import~~ (DONE — full stack: Claude Vision (Sonnet) photo/PDF → structured menu extraction, AnthropicMenuImportService, import + apply endpoints with Replace/Merge strategies, rate limited 5/60s, 10MB max. Frontend: 4-step AiImportModal wizard (Upload → Processing → Review/Edit → Apply), drag-and-drop, editable preview. Free=1 import, Pro+=unlimited. 40+ backend tests, 26 frontend tests). ~~ab-test-menus~~ (DONE — full stack: MenuExperiment entity with lifecycle, SHA256 variant assignment, per-variant metrics, 6 endpoints. Frontend: ExperimentListScreen with Enterprise gating, CreateExperimentModal, ExperimentDetailView, MetricsComparison with significance. Zero AI cost. 40 backend tests, 19+ frontend tests). ~~nutritional-info-autofill~~ (DONE — full stack: Claude Haiku ingredient→nutrition estimation, NutritionalInfo on MenuItem, range validation. Frontend: IngredientsInput, NutritionCard, NutritionLabel on public menu. Pro+ AI gating, manual entry free. 42 backend tests, 39 frontend tests). Total AI cost per customer: <$0.70 lifetime

---

## Completed Work Not Listed Above

These major work streams have been completed but weren't originally in the roadmap:

| Work Stream | Tasks Completed | Key Deliverables |
|-------------|-----------------|------------------|
| **Notification Service (full stack)** | 7 tasks | Backend core, NuGet packages, client SDK, UI components (bell, toasts, preferences), service worker OS notifications |
| **Online Menu Management** | 22+ tasks | Menu CRUD, customization/styling, preview, content display, activate/deactivate, display order, filtering, E2E tests |
| **Content Service** | 4 tasks | Microservice setup, upload components, backend integration, E2E tests |
| **Per-Tenant Theming** | 6 tasks | Config type system, editor page, micro-frontend, fetch/cache, ETag optimization |
| **HTTP Interceptor Architecture** | 8 tasks | Core architecture, Axios interceptors, error handling, React integration, migration, testing |
| **Menu Customization & Styling** | 10+ tasks | Typography, colors, layout templates, category styling, price styling, media positioning, box styles, header editor |
| **Lighthouse & Performance** | 5 tasks | CI integration, accessibility score fixes, SEO improvements, bundle analysis, production performance optimization (post-build HTML injection, cache headers, lazy loading — Lighthouse 99/100) |
| **Logging Service** | 2 tasks | Frontend logging service, stage 1 implementation |
| **Docker Stability & Dev Environment** | 1 task | Container memory optimization: 7.9 GB → 3.8 GB (51% reduction). Data-driven — baseline snapshot showed DBs at 5%, APIs at 28-56% utilization. 6 DBs 512→128 MB, APIs 512→256-384 MB, Workstation GC for all .NET services, Loki 512→256 MB, RabbitMQ 512→384 MB. Enhanced health monitor with per-container snapshots every 5 min. Total allocation now fits within 4 GB WSL2 limit |
| **npm Packages Ecosystem** | 1 task | Package structure, publishing, shared utilities |
| **NuGet Packages** | 3 tasks | Messaging contracts, Storage S3, Rate limiting |
| **Syncfusion Theme Studio** | 10+ tasks | Theme presets, bug fixes, feature pages, component showcase, forms showcase |
| **QR Code Generation (full stack)** | 5 tasks | QR modal with color customization, PNG/SVG download, copy link, GDPR-compliant scan tracking (HMACSHA256), analytics endpoint, 13 E2E tests |
| **Landing Pages (multi-service)** | 1 task | Dedicated landing pages for Online Menus + Questionnaires, brand hub at `/`, 3-tier pricing page, responsive (desktop/tablet/mobile), web-only (mobile apps redirect to auth), SEO (robots.txt, sitemap.xml, per-page meta), 9 reusable landing components, `Routes.HOME` → `Routes.DASHBOARD` migration |
| **GDPR Compliance (full stack)** | 9 tasks | Cookie consent, legal pages, privacy settings, data export/deletion, event consumers across all services |
| **E2E Test Infrastructure** | 8+ tasks | Playwright setup, test suites for all features, performance optimization, dedicated linter, flaky test fixes (page.goto 60s timeout, cross-tab 60s suite timeout, element visibility 30s timeout), billing suite split into sub-batches (billing-subscription + billing-pricing, ≤32 unique tests each) |
| **Native Components Library** | 8+ tasks | Forms, accordion, toolbar, menu, breadcrumb, toggle, grid, table components |
| **Code Quality & Refactoring** | 20+ tasks | ESLint rules (including 2 new component reusability plugins), file splitting, barrel exports, dependency analysis, i18n enforcement (full: `no-literal-string` + `jsx-no-literals` at `error` in both BaseClient + SyncfusionThemeStudio, `has-accessibility-hint` at `error`, zero-warnings policy fully enforced), FM()-only translation convention (error-level, ~104 files migrated, 177 keys added), `useThemeColors` shared hook extraction, console warning fixes (shadow*/useNativeDriver) |
| **Reusable Component Library** | 3 tasks (all done) | Component audit + full remediation (62 inventoried, 10 recommendations implemented: ExportButtons moved, duplicates deleted, ModalDropdown/ErrorState/StatusBadge extracted, CollapsibleSection/SliderRow promoted, FormActions upgraded, EmptyListState adopted), ESLint reusability rules (2 plugins), in-app showcase + markdown docs (27 components documented) |
| **Backend Test Coverage Blitz** | 8 tasks (all done) | All 6 services above 50% target. Identity 15%→85.8% (651 tests, Moq→NSubstitute migration), Questioner 21%→37.3% raw / 96.5% with exclusions (210+ tests), OnlineMenu 13%→57.6% (694 tests), Content 32%→99.4% (159 tests), Notification 44%→97.7% (202 tests), Payment 19%→83.5% (301 tests, +187 on 2026-03-20). **Total: 2,217+ backend tests** |
| **Public Menu Viewer UX** | 4 tasks (all done) | Search & filter (useMenuFilter, dietary tag chips, 25 tests), item detail modal (variants/modifiers/staff picks, responsive, 8 tests), multi-language viewer (usePublicMenuLanguage, URL persistence, RTL, 18 tests), social sharing (ShareButton FAB, 12 tests). **Total: 63 new tests, 58 translation keys** |
| **User Profile Self-Service (full stack)** | 8 tasks | 7 Me/ endpoints, UserPreference entity + migration, CQRS handlers, 3 frontend screens (Profile, Security, Preferences), Orval hook integration, session management UI |
| **Identity Service Restructure** | 3 tasks | Removed `Endpoints/` wrapper folder (56 namespace updates), code review fixes (security: session ownership, magic numbers → constants, route constants), test mock pattern refactor |
| **Settings & Account Screens** | 5 tasks | Scaffolded 3 screens, unit tests, Orval API hook wiring, reusable SettingsDropdown component. **Account Settings Hub**: `/settings` index page with AccountSettingsHubScreen (profile summary + 4 SettingsNavCard components), sidebar "Account" entry, route preloading, 4 pre-existing issues fixed (ESLint plugin bug, unsafe assignment, function length violations, broken test) |
| **Error States & Feedback** | 1 task | Success/error toasts on mutations, empty states on lists, ~30 translation keys, `t()` → `FM()` migration |
| **Analytics Integration (All 5 Phases)** | 8 tasks | Phase 1: Multi-provider abstraction (MultiProviderClient, UmamiClient, DevClient, NoOpClient), consent gating, DNT, 7 test suites. Phase 2: Event instrumentation — 19 track() calls across menus, QR, share, themes, notifications, quizzes, errors. AnalyticsErrorBoundary wrapper. Phase 3: PostHogClient + shared sanitizeProperties, env-var activation, 17 tests. Phase 4: Backend GET /api/analytics/tenant-summary (3 new IQrScanEventRepository methods), frontend AnalyticsDashboardScreen + StatCard + TopMenusList, admin-only sidebar. Phase 5: useFeatureFlag + useFeatureFlagValue hooks, server-side AnalyticsPipelineBehavior + UmamiAnalyticsPublisher (fire-and-forget, success-only), Umami Docker Compose in Tiltfile. **Total: ~50 new files, ~80 new tests** |
| **Payment & Billing (full stack)** | 10 tasks | PaymentService microservice (entities, Stripe provider, CQRS, FastEndpoints, background scheduler). 3-tier plans (Free $0, Pro $29/mo, Enterprise $99/mo) + 14-day trial. Docker (port 5018/5437), Tilt resources. Orval pipeline + 8 generated hooks with DTO mappers. Frontend billing UI. Cross-service feature gating: useSubscription hook, SubscriptionTier/FeatureCode enums, featureLimits, UpgradePrompt, FreeTierWatermark. UI gating: menu/item creation limits, premium theme lock, custom domain gate, public menu watermark. 115 backend + 3 frontend test suites. **Full E2E suite: 37 unique tests × 3 browsers = 116 total**, split into 2 sub-batches: `billing-subscription` (21 tests: subscription, subscription-flow, cancellation) and `billing-pricing` (16 tests: pricing-page, upgrade-downgrade, history). 3 Tilt resources (`playwright-e2e-billing-all`, `-subscription`, `-pricing`), workers=3. Shared auth helper. Code review: 14 issues fixed total. Bug fix: `useMenuActions.ts` missing `/api/v1/` prefix on activate/deactivate URLs (2026-03-20) |
| **Email Service (NuGet packages)** | 3 tasks | Email.Abstractions (IEmailService, IEmailTemplateRenderer, zero-dep), Email.Smtp (MailKit, SmtpNotificationBridge, EmbeddedResourceTemplateRenderer), 6 HTML templates, Mailpit dev SMTP capture, IdentityService CompositeNotificationService (SMS via Twilio + Email via SMTP) |
| **Custom Domains (full stack)** | 4 tasks | Backend: CustomDomainAggregate, CNAME+TXT DNS verification, background IHostedService, NginxConfigProvider, 6 CRUD endpoints. Frontend: settings screen, add form, DNS instructions, status badge, verification polling. Wired to API with TanStack Query hooks |
| **Embeddable Widget** | 2 tasks | Embed route `/public/menu/embed/[id]`, vanilla JS widget loader (2.8KB, postMessage auto-resize), Embed Widget modal (iframe/JS tabs, config panel, code preview), Nginx frame-ancestors CSP |
| **QR Code Designer** | 1 task | Template-based printable materials (table tent, sticker, poster). SVG rendering engine, text/color customization, PNG/SVG/PDF download (lazy jsPDF). 39 unit tests |
| **SEO & Structured Data** | 1 task | JSON-LD structured data (schema.org Restaurant > Menu > MenuSection > MenuItem), meta tags (title, description, OG), SeoHead component, noindex for embeds. 30 unit tests |
| **Welcome Wizard & Onboarding (full stack)** | 2 tasks | 3-step wizard (business name → logo → create menu). 8 components, useWelcomeWizard hook, 23 translation keys, 10 test IDs. **Server-side state persistence**: WizardCompleted + ChecklistDismissed on UserPreference entity (IdentityService), EF migration, two-tier read (localStorage fast-cache + server authoritative), error resilience fallback. 9 new frontend tests + 6 new backend tests. Quality gate + code review passed (both domains) |
| **Business Profile Page (full stack)** | 1 task (done) | Backend: BusinessProfile entity (BaseTenantEntity, 1:1 Tenant), 3 CQRS MediatR handlers, 3 FastEndpoints, FluentValidation, ETag caching, 2 EF migrations, 34 new tests. Frontend: 7 components wired to Orval hooks, 32 unit tests, 47 translation keys. Public menu: BusinessInfoSection (phone/email/website/address/hours), schema.org structured data (PostalAddress, OpeningHoursSpecification, servesCuisine), meta tags enrichment. Dashboard profile nudge. Code review: 13 issues fixed |
| **AI Menu Translation (full stack)** | 2 tasks | Backend: `MenuTranslation` aggregate, `TranslationStatus` enum, Claude API batch translation, rate limiting (2 req/60s). Frontend: `TranslationManager` + `TranslationEditModal` + `LanguageSwitcher`. Public menu: `?lang=` query parameter support, `AvailableLanguages` in response. 46+ translation keys |
| **Staff Picks / Featured Items (full stack)** | 2 tasks | Backend: `isFeatured`, `staffNote`, `featuredOrder` on MenuItem, `featuredSectionEnabled`/`featuredSectionTitle` on MenuContents. Frontend: `FeaturedItemControls` editor, `FeaturedSection` + `FeaturedItemCard` display. 12 testIDs, 18 translation keys |
| **Menu Editor Advanced (undo/redo, auto-save, image crop)** | 1 task | `useUndoRedo` hook (50-snapshot cap), `UndoRedoBar`, keyboard shortcuts (Ctrl+Z/Y). Debounced auto-save with "Saved"/"Unsaved" indicator. `react-easy-crop` image cropping (web-only): `CropModal`, `AspectRatioSelector`, `useImageCrop`. 14 unit tests |
| **Prometheus Metrics & Health Monitoring** | 1 task (done) | `Metrics.Client` NuGet package (v1.0.0), `prometheus-net.AspNetCore` integrated in all 6 services, 6 Prometheus scrape jobs, alert rules (ServiceDown, HighErrorRate, HighLatency), 2 Grafana dashboards, Health aggregator endpoint `GET /api/v1/health/aggregate` in IdentityService, frontend `StatusPage` component + `useServiceHealth` hook. All 8 Prometheus targets UP, verified 2026-03-20 |
| **Alerting Integration** | 1 task | Grafana contact points for Slack + Email + PagerDuty, notification policies provisioned via YAML, alert routing |
| **API Versioning (all services)** | 2 tasks | `/api/v1/` RoutePrefix across 7 services, `ApiVersionRedirectMiddleware` (308 redirects), 30+ route constant bug fixes, swagger JSON regenerated, E2E paths updated, token refresh URL fixed |
| **Per-Environment Builds** | 1 task (done) | Per-service docker-compose overrides (staging + production) for all 6 services, Tiltfile `--env` flag, Dockerfile `ENVIRONMENT` build arg, `.env.{env}.example` templates, CI/CD integration, `deploy.sh` script. Phase 0 complete |
| **WCAG 2.1 AA Accessibility** | 1 task (done) | Skip navigation, `useHighContrast` + `useEscapeKey` hooks, focus trap in modals, `AriaLiveRegion` for screen readers, heading roles (8 components), `accessibilityState` on dropdowns/nav, navigation landmarks. 7 new files, 15 modified, 10 tests, 20 i18n keys |

---

## Recommended Launch Order

```
NOTE: Phases are priority tiers, not a waterfall. Execution is parallel —
Phase 2 (100%) has outpaced Phase 1 (~99%). This is fine.

LAUNCH BLOCKERS (must complete before public launch):
  Phase 0: ALL DONE! (per-env builds completed 2026-03-20)
  Phase 1 P0: ALL DONE!
  → ✅ READY TO LAUNCH — no blockers remaining

POST-LAUNCH (iterate based on user feedback):
  Phase 1 remaining P2 items, Phase 3 advanced features, Phase 4 scale

Phase 0:  Security, infrastructure, CI/CD, resilience
          STATUS: 11/11 DONE. Per-env builds completed 2026-03-20
Phase 1:  UX overhaul + data import/export
          STATUS: ALL P0 DONE. ALL P1 DONE. Dark mode DONE. PDF export DONE. Data export DONE.
          Category icons DONE. Keyboard shortcuts DONE. Offline PWA DONE. WCAG DONE.
          Remaining P2: seasonal menus, interactive tooltips, AI menu import (photo/PDF),
          popular items heatmap (DONE).
Phase 2:  Payment, email, distribution
          STATUS: 100% DONE.
Phase 3:  AI quick wins + advanced features + competitive differentiation
          STATUS: Multi-location DONE (full stack — backend + frontend + public page).
          Public API DONE. Webhooks DONE. White-label backend foundation DONE (frontend pending).
          Remaining: white-label frontend, menu versioning, ordering integration.
Phase 4:  Scale infrastructure as users grow
          STATUS: Performance DONE (Lighthouse 99/100). Bundle size DONE. Docker stability DONE
          (3.8 GB, 51% reduction). All coverage targets exceeded (6/6 above floor, 4 >83%).
          Prometheus DONE (8 targets UP, 2 dashboards, health aggregator). Sentry DONE.
          Alerting DONE. Distributed tracing DONE (Tracing.Client + Jaeger, 31 tests).
          Tilt: 138/138 healthy, ZERO errors. 9,722 tests (6,048 backend + 3,674 frontend).
          Remaining: K8s, CDN
```

---

## Key UX Principles for Restaurant Owners

1. **Speed over features** — A restaurant owner has 5 minutes between lunch rush and dinner prep. Every action should take < 3 clicks.
2. **Visual over textual** — Show, don't tell. Preview-first editing. WYSIWYG.
3. **Mobile-first admin** — Restaurant staff are on their feet with phones, not at desks with laptops.
4. **Instant gratification** — Menu should look professional the moment it's created, before any customization.
5. **Zero jargon** — No "tenant", "instance", "endpoint". Use "restaurant", "menu", "share link".
6. **Forgiveness** — Undo everything. Auto-save everything. Never lose work.

---

## Competitive Landscape

### OnlineMenu Competitors

| Competitor | Strength | Our Opportunity |
|------------|----------|-----------------|
| **GloriaFood** | Free tier, POS integration | Better UX, modern design, multi-language |
| **MenuDrive** | Ordering built-in | Start simpler (menus first), expand to ordering |
| **Flavor Plates** | Beautiful templates | Match design quality, add AI features |
| **Square for Restaurants** | Full ecosystem | Be the best at ONE thing: digital menus |
| **Canva Menus** | Design flexibility | We're menu-specific: categories, items, prices, allergens |

### Questioner Competitors

| Competitor | Strength | Our Opportunity |
|------------|----------|-----------------|
| **Typeform** | Beautiful UX, conversational forms | Self-hosted, no per-response pricing, white-label |
| **Google Forms** | Free, ubiquitous | Branding, skip logic, real-time analytics |
| **SurveyMonkey** | Enterprise features | Lower price, simpler UX, modern stack |
| **Tally** | Free tier, clean design | Multi-tenant, embeddable, API-first |

### Pricing Strategy & Free Tier Considerations

| Tier | Price | Competitor Benchmark | Notes |
|------|-------|---------------------|-------|
| **Free** | $0 | GloriaFood (free), Google Forms (free) | 1 menu, 10 items — **consider raising to 20-25 items** (a small cafe has 20-30 items; 10 may churn users before they see value) |
| **Pro** | $29/mo ($290/yr) | Typeform ($25/mo), MenuDrive (~$99/mo) | Competitive with form builders, significantly cheaper than restaurant SaaS. 17% annual discount |
| **Enterprise** | $99/mo ($990/yr) | Square (ecosystem), SurveyMonkey ($75+/mo) | Multi-location + API access + white-label justifies premium |

**Key risk:** Free tier too restrictive → users bounce before conversion. Free tier too generous → no reason to upgrade. Recommend testing with 20 items and monitoring upgrade conversion rates.

### Platform Differentiator

**Our edge isn't one product — it's the platform.** Each product is purpose-built for its domain, but they share infrastructure that would cost competitors millions to replicate. A restaurant using OnlineMenu can add Questioner for customer feedback in one click. A business using Questioner can add OnlineMenu when they open a cafe. The shared IdentityService, NotificationService, ContentService, and PaymentService mean each new product costs us less to build than our competitors' first product cost them.

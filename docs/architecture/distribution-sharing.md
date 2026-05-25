# Distribution & Sharing Architecture

## Overview

Distribution & Sharing enables restaurant owners to share their menus across multiple channels: direct links, QR codes, printed materials, embedded widgets on external websites, custom domains, and search engine discoverability. Each feature targets a different distribution channel while sharing the same underlying public menu infrastructure.

### Feature Summary

| Feature | Status | Stack | Channel |
|---------|--------|-------|---------|
| QR Code Generator | Done | Frontend only | Print / mobile scan |
| QR Code Designer | Done | Frontend only | Print materials (table tents, stickers, posters) |
| Embeddable Widget | Done | Frontend + Nginx | External websites |
| Custom Domains | Done | Full-stack | Branded URLs |
| SEO & Structured Data | Done | Frontend only | Search engines |
| Social Media Auto-Post | TODO (P3) | TBD | Social platforms |

---

## Feature Architecture

### 2.1 QR Code Generator

**Purpose**: Generates QR codes for any published menu with customizable foreground/background colors. Users can download the QR as PNG or SVG and copy the public menu link to clipboard.

**Architecture**: Pure frontend. The `QrCodeModal` renders a QR code via a third-party React component, applies user-selected colors, and provides download actions that convert the DOM-rendered QR into image files.

**Key Components**:
- `QrCodeModal` -- main modal with color inputs, QR display, and download/copy actions
- `QrCodeDisplay` -- renders the QR code with configurable colors
- `QrCodeColorInputs` -- foreground and background color pickers
- `QrCodeActions` -- download PNG, download SVG, copy link buttons

**Entry Point**: `src/components/OnlineMenus/QrCode/index.ts`

**File Tree**:
```
src/components/OnlineMenus/QrCode/
├── index.ts                          # Barrel export
├── QrCodeModal.tsx                   # Main modal (pre-existing)
├── components/
│   ├── QrCodeDisplay.tsx             # QR rendering
│   ├── QrCodeColorInputs.tsx         # Color pickers
│   └── QrCodeActions.tsx             # Download/copy buttons
└── utils/
    ├── qrCodeConstants.ts            # DEFAULT_FG_COLOR, DEFAULT_BG_COLOR, DEFAULT_QR_SIZE
    ├── qrCodeDownload.ts             # downloadQrAsPng, downloadQrAsSvg, copyToClipboard
    ├── qrCodeDownload.test.ts
    └── qrCodeStyles.ts               # StyleSheet definitions
```

---

### 2.2 QR Code Designer

**Purpose**: Template-based design tool for creating printable materials (table tent cards, stickers, posters) featuring the menu QR code, restaurant branding, and customizable text.

**Architecture**: Pure frontend. SVG string templates are assembled from fragment helpers, rendered via `dangerouslySetInnerHTML`, and exported as PNG (canvas), SVG (blob), or PDF (jspdf). No server interaction required.

```
┌─────────────────────┐       ┌───────────────────────┐
│  TemplateSelector    │──────▶│  useDesignerState      │
│  (pick template)     │       │  (useReducer)          │
└─────────────────────┘       └──────────┬────────────┘
                                         │ state
┌─────────────────────┐                  │
│  DesignerCustomize   │◀────────────────┤
│  Panel (text/colors) │─── dispatchers ─┤
└─────────────────────┘                  │
                                         ▼
┌─────────────────────┐       ┌───────────────────────┐
│  DesignerPreview     │◀─────│  designerTemplates.ts  │
│  (live SVG render)   │      │  (SVG fragment helpers) │
└─────────────────────┘       └───────────────────────┘
                                         │
                                         ▼
┌─────────────────────┐       ┌───────────────────────┐
│  DesignerDownload    │─────▶│  qrDesignerDownload.ts │
│  Actions (PNG/SVG/   │      │  extractQrDataUri      │
│  PDF buttons)        │      │  downloadDesignAs*     │
└─────────────────────┘       └───────────────────────┘
                                         │
                                    lazy-loaded
                                         ▼
                              ┌───────────────────────┐
                              │  jspdf (~300KB)        │
                              │  (PDF export only)     │
                              └───────────────────────┘
```

**Key Components**:
- `QrCodeDesignerModal` -- main modal, 136 lines, orchestrates all sub-components
- `TemplateSelector` -- horizontal ScrollView with template cards (Table Tent, Sticker, Poster)
- `DesignerPreview` -- hidden QR source element + live SVG rendering via `dangerouslySetInnerHTML`
- `DesignerCustomizePanel` -- text and color inputs for restaurant name, tagline, call-to-action, colors
- `DesignerDownloadActions` -- PNG, SVG, PDF download buttons

**State Management**:
- `useDesignerState` -- `useReducer`-based hook managing template selection, text fields, and color values. `buildInitialState(menuName, publicUrl)` factory creates initial state from menu data. Dispatchers are stable callbacks derived from the reducer dispatch.
- `useQrDesigner` -- simple open/close state hook (lives in `src/hooks/`) for modal visibility

**Template Engine** (`designerTemplates.ts`):
- SVG fragment helpers: `centeredText()`, `svgRect()`, `centeredImage()`
- Three template renderers, each producing a complete SVG string
- Template dispatcher maps `TemplateType` enum to the correct renderer
- All user-supplied strings pass through `escapeXml()` for SVG injection prevention

**Download Pipeline**:
1. `extractQrDataUri()` -- reads the QR code from a hidden DOM element as a data URI
2. `renderTemplate()` -- assembles the full SVG string from state + QR data URI
3. Download as format:
   - **PNG**: Render SVG to canvas via `Image` + `canvas.toBlob()`, trigger download
   - **SVG**: Create a `Blob` from the SVG string, trigger download
   - **PDF**: Lazy-load `jspdf`, render SVG to canvas, add as JPEG image to PDF page

**Security**: User text is escaped via `escapeXml()` before SVG insertion, preventing XML entity injection attacks through restaurant name, tagline, or call-to-action fields.

**File Tree**:
```
src/components/OnlineMenus/QrCode/
├── QrCodeDesignerModal.tsx               # Main designer modal
├── enums/
│   └── TemplateType.ts                   # const enum: TableTent, Sticker, Poster
├── hooks/
│   ├── useDesignerState.ts               # Reducer-based state management
│   └── useDesignerState.test.ts          # 9 tests
├── components/
│   ├── TemplateSelector.tsx              # Template card picker
│   ├── DesignerPreview.tsx               # Live SVG preview
│   ├── DesignerCustomizePanel.tsx        # Text/color inputs
│   └── DesignerDownloadActions.tsx       # Download buttons
└── utils/
    ├── qrDesignerConstants.ts            # TEMPLATE_DIMENSIONS, element IDs
    ├── qrDesignerStyles.ts               # StyleSheet definitions
    ├── designerTemplates.ts              # SVG fragment helpers + 3 template renderers
    ├── designerTemplates.test.ts         # 17 tests (escaping, SVG validity, XSS)
    ├── qrDesignerDownload.ts             # PNG/SVG/PDF download functions
    └── qrDesignerDownload.test.ts        # 8 tests

src/hooks/
├── useQrDesigner.ts                      # Modal open/close state
└── useQrDesigner.test.ts                 # 5 tests
```

---

### 2.3 Embeddable Widget

**Purpose**: Allows restaurant owners to embed their menu on an external website via an iframe. Provides two integration methods: a raw `<iframe>` tag or a JS widget loader that handles creation and auto-resizing.

**Architecture**: Three layers -- a dedicated embed route (minimal layout), a vanilla JS loader served as a static asset, and a dashboard modal for generating embed code.

```
External Website                          SaaS Application
┌──────────────────────┐                 ┌──────────────────────────────┐
│                      │                 │                              │
│  <div data-menu-     │                 │  /public/widget.js           │
│   widget ...>        │                 │  (vanilla JS, ~2.8KB)        │
│  <script src="       │◀────GET────────│                              │
│   .../widget.js">    │                 │  /public/menu/embed/[id]     │
│                      │                 │  (dedicated embed route)     │
│  ┌────────────────┐  │                 │  ┌────────────────────────┐  │
│  │  <iframe>      │──┼────GET─────────┼──│  EmbedLayout           │  │
│  │                │  │                 │  │  ├─ LazyQueryProvider   │  │
│  │  Menu content  │  │                 │  │  └─ EmbedMenuPage      │  │
│  │                │◀─┼──postMessage────┼──│     ├─ MenuContentView │  │
│  │  (auto-resize) │  │  (resize event) │  │     └─ postMessage()   │  │
│  └────────────────┘  │                 │  └────────────────────────┘  │
│                      │                 │                              │
└──────────────────────┘                 └──────────────────────────────┘
```

**Embed Route** (`app/public/menu/embed/`):
- `_layout.tsx` -- minimal layout with only `LazyQueryProvider` + `Stack`. No auth provider, no toast notifications, no PWA registration, no analytics.
- `[id].tsx` -- fetches the menu via `usePublicMenuGetById`, renders `MenuContentView`, sends `postMessage` with content height on every layout change for iframe auto-resize.

**Widget JS** (`public/widget.js`):
- Vanilla JavaScript IIFE, approximately 2.8KB unminified
- Scans for `[data-menu-widget]` elements, reads `data-menu-id`, `data-origin`, and optional `data-width`, `data-height`, `data-theme`, `data-accent-color` attributes
- Creates a sandboxed iframe (`allow-scripts allow-same-origin`) with lazy loading
- Listens for `postMessage` events, validates `event.origin` matches the expected SaaS origin, and auto-resizes the iframe height

**Security**:
- `event.origin` validation on all postMessage handlers (both widget.js and embed page)
- iframe `sandbox` attribute limits capabilities to `allow-scripts allow-same-origin`
- Nginx sets `Content-Security-Policy: frame-ancestors *` on `/public/menu/` paths to allow embedding
- Embed pages set `noindex, nofollow` robots meta to prevent duplicate search indexing

**Dashboard Modal** (`EmbedWidgetModal`):
- Two tabs: iframe snippet and JS widget snippet
- Configuration panel: width presets (100%, 800px, 600px), height input, theme override (light/dark), accent color
- Code preview with one-click copy to clipboard
- `useEmbedCode` hook generates both iframe and JS code strings from the current configuration
- `embedUrlBuilder` pure function constructs the embed URL with query parameters

**File Tree**:
```
app/public/menu/embed/
├── _layout.tsx                           # Minimal embed layout
└── [id].tsx                              # Embed page with postMessage resize

public/
└── widget.js                             # Vanilla JS widget loader (~2.8KB)

src/components/OnlineMenus/EmbedWidget/
├── index.ts                              # Barrel export
├── EmbedWidgetModal.tsx                  # Main modal with tabs + config + preview
├── components/
│   ├── EmbedTabBar.tsx                   # iframe/JS tab switcher
│   ├── EmbedConfigPanel.tsx              # Width, height, theme, accent config
│   └── EmbedCodePreview.tsx              # Code display with copy button
├── hooks/
│   ├── useEmbedCode.ts                   # Generates iframe and JS snippets
│   └── useEmbedCode.test.ts
└── utils/
    ├── embedUrlBuilder.ts                # Pure URL construction function
    ├── embedUrlBuilder.test.ts
    ├── embedCodeConstants.ts             # DEFAULT_EMBED_WIDTH, DEFAULT_EMBED_HEIGHT
    └── embedWidgetStyles.ts              # StyleSheet definitions

src/hooks/
├── useMenuEmbed.ts                       # Modal open/close state (analogous to useMenuQrCode)
└── useMenuEmbed.test.ts

src/shared/enums/
└── EmbedTab.ts                           # const enum: Iframe, JsWidget

nginx.conf                                # frame-ancestors * on /public/menu/ paths
```

---

### 2.4 Custom Domains

**Purpose**: Allows restaurant owners to map a custom domain (e.g., `menu.myrestaurant.com`) to their public menu page, providing a branded URL experience.

**Architecture**: Full-stack feature spanning the OnlineMenu backend service (entity, CQRS handlers, DNS verification background service, Nginx proxy configuration) and the BaseClient frontend (settings screen, domain management hook).

#### Backend

```
                        ┌─────────────────────────────┐
                        │  DomainVerificationService   │
                        │  (IHostedService, 60s poll)  │
                        └──────────────┬──────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
  ┌─────────────────┐     ┌──────────────────────┐    ┌──────────────────┐
  │  IDnsVerifier    │     │  ICustomDomain       │    │  IProxyConfig    │
  │  (TXT + CNAME)   │     │  Repository          │    │  Provider        │
  └────────┬────────┘     └──────────┬───────────┘    └────────┬─────────┘
           │                         │                          │
           ▼                         ▼                          ▼
  ┌─────────────────┐     ┌──────────────────────┐    ┌──────────────────┐
  │  DotnetDns      │     │  CustomDomain        │    │  NginxConfig     │
  │  Verifier       │     │  Repository (EF)     │    │  Provider        │
  │  (System.Net)   │     │  + IgnoreQueryFilters│    │  (server blocks) │
  └─────────────────┘     └──────────────────────┘    └──────────────────┘
```

**Entity** (`CustomDomain`):
- Inherits `BaseTenantEntity` + `IAggregateRoot`
- Fields: `DomainName`, `OwnershipToken` (format: `saas-{guid}`), `Status`, `VerifiedAt`, `LastVerificationAttempt`, `LastVerificationError`
- Status lifecycle: `PendingVerification` -> `Active` | `Failed` -> (retry) `PendingVerification`
- Domain methods: `MarkVerified()`, `MarkFailed(error)`, `Revoke()`, `RequestVerification()`, `RecordVerificationAttempt()`
- One custom domain per tenant (not per menu)

**Status Enum** (`CustomDomainStatus`):
- `PendingVerification` (0) -- awaiting DNS verification
- `Active` (1) -- DNS verified, domain is live
- `Failed` (2) -- DNS verification failed
- `Revoked` (3) -- soft-deleted by tenant

**CQRS Handlers**:

| Handler | Type | Purpose |
|---------|------|---------|
| `AddCustomDomainHandler` | Command | Creates domain, generates ownership token, checks cross-tenant uniqueness via `IgnoreQueryFilters` |
| `RemoveCustomDomainHandler` | Command | Revokes domain, removes proxy config |
| `RequestVerificationHandler` | Command | Resets status to `PendingVerification` for re-verification |
| `GetCustomDomainByTenantHandler` | Query | Returns the current tenant's domain (if any) |
| `ResolveDomainHandler` | Query | Resolves a domain name to a tenant ID (public, anonymous) |

**DNS Verification** (`DomainVerificationService`):
- `IHostedService` / `BackgroundService` polling every 60 seconds (configurable)
- Processes up to 20 pending domains per batch
- Minimum 60 seconds between retry attempts per domain (exponential backoff)
- Verification steps per domain:
  1. Verify TXT record contains the ownership token
  2. Verify CNAME record points to the expected target
  3. Configure the reverse proxy via `IProxyConfigProvider`
  4. Mark domain as `Active`
- Any step failure marks the domain as `Failed` with an error message

**Proxy Configuration** (`NginxConfigProvider`):
- Implements `IProxyConfigProvider` (proxy-agnostic interface)
- Writes an Nginx server block config file per domain (`{domainName}.conf`)
- Server block includes `proxy_pass`, standard proxy headers, and an `X-Custom-Domain` header
- Signals Nginx to reload after config changes
- Removing a domain deletes the config file and triggers reload

**Endpoints** (6 total, under `OnlineMenu.Web/CustomDomains/`):

| Endpoint | Method | Route | Auth | Purpose |
|----------|--------|-------|------|---------|
| `Add` | POST | `/CustomDomains` | Admin | Register a new custom domain |
| `Remove` | DELETE | `/CustomDomains/{ExternalId}` | Admin | Remove a custom domain |
| `GetByTenant` | GET | `/CustomDomains` | Admin | Get current tenant's domain |
| `RequestVerification` | POST | `/CustomDomains/{ExternalId}/verify` | Admin | Re-trigger DNS verification |
| `CheckDomain` | GET | `/internal/domains/check?domain=` | Anonymous, rate-limited | Internal: check if domain exists |
| `GetByDomain` | GET | `/public/domains/resolve?domain=` | Anonymous, rate-limited | Public: resolve domain to tenant |

**Security**:
- Cross-tenant uniqueness check uses `IgnoreQueryFilters` to prevent two tenants from claiming the same domain
- TXT ownership token (`saas-{guid}`) proves domain ownership -- the tenant must add this TXT record to their DNS
- Public/internal endpoints are rate-limited to prevent abuse
- Domain names are normalized to lowercase and trimmed on creation

#### Frontend

**Add Domain Flow**:
```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AddDomainForm   │────▶│  useCustomDomain  │────▶│  POST /Custom    │
│  (validates with │     │  .addDomain()     │     │  Domains         │
│  isValidDomain)  │     └────────┬─────────┘     └──────────────────┘
└──────────────────┘              │
                                  │ invalidate query
                                  ▼
                    ┌──────────────────────────┐
                    │  CustomDomainSettings     │
                    │  Screen re-renders with   │
                    │  DomainStatusBadge +       │
                    │  DnsInstructions           │
                    └──────────────────────────┘
```

**DNS Verification Polling**:
```
useCustomDomain hook
  └─ useQuery with refetchInterval:
       - PendingVerification status → poll every 30s
       - Other statuses → poll every 60s (background health check)
  └─ UI updates automatically as status transitions
```

**Public Request Routing** (custom domain in production):
```
Browser: GET https://menu.myrestaurant.com/
    │
    ▼
┌──────────────────────────────────────────┐
│  Nginx (domain-specific server block)    │
│  server_name menu.myrestaurant.com       │
│  proxy_pass http://onlinemenu-api:8080   │
│  X-Custom-Domain: menu.myrestaurant.com  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  OnlineMenu API                          │
│  GET /public/domains/resolve?domain=...  │
│  → Returns tenantId + menu config        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Frontend renders public menu page       │
│  (same PublicMenu components)            │
└──────────────────────────────────────────┘
```

**Key Frontend Components**:
- `CustomDomainSettingsScreen` -- main settings screen with add form or domain status view
- `AddDomainForm` -- domain name input with client-side validation via `isValidDomain()`
- `DomainStatusBadge` -- visual badge showing current status (Pending, Active, Failed, Revoked)
- `DnsInstructions` -- step-by-step DNS setup instructions showing CNAME target and TXT ownership token

**Frontend Hook** (`useCustomDomain`):
- Wraps TanStack Query around the four CRUD endpoints
- Conditional polling: 30s when `PendingVerification`, 60s otherwise
- Returns `{ domain, isLoading, error, addDomain, removeDomain, requestVerification }`
- Domain mutations invalidate the query cache on success

**Domain Validation** (`isValidDomain`):
- Pure function, no external dependencies
- Validates: at least two labels, no empty labels, each label 1-63 chars, alphanumeric + hyphens only, total max 253 chars
- Used client-side only; the backend performs its own validation

**File Tree**:
```
# Backend (OnlineMenuService)
OnlineMenu/src/OnlineMenu.Core/
├── CustomDomainAggregate/
│   ├── CustomDomain.cs                   # Entity (BaseTenantEntity + IAggregateRoot)
│   └── CustomDomainStatus.cs             # Enum: Pending, Active, Failed, Revoked
└── Interfaces/
    ├── ICustomDomainRepository.cs         # Repository with cross-tenant queries
    ├── IDnsVerifier.cs                    # DNS verification interface
    └── IProxyConfigProvider.cs            # Proxy-agnostic config interface

OnlineMenu/src/OnlineMenu.UseCases/CustomDomains/
├── DTOs/CustomDomainDto.cs
├── Add/AddCustomDomainCommand.cs + Handler.cs
├── Remove/RemoveCustomDomainCommand.cs + Handler.cs
├── GetByTenant/GetCustomDomainByTenantQuery.cs + Handler.cs
├── RequestVerification/RequestVerificationCommand.cs + Handler.cs
└── ResolveDomain/ResolveDomainQuery.cs + Handler.cs

OnlineMenu/src/OnlineMenu.Infrastructure/
├── Data/
│   ├── CustomDomainRepository.cs          # EfRepository with IgnoreQueryFilters
│   └── Config/CustomDomainConfiguration.cs
├── Dns/DotnetDnsVerifier.cs               # System.Net.Dns-based verifier
├── Proxy/NginxConfigProvider.cs           # Nginx server block writer
├── Services/DomainVerificationService.cs  # Background IHostedService (60s poll)
└── Migrations/20260315120000_AddCustomDomains.cs

OnlineMenu/src/OnlineMenu.Web/CustomDomains/
├── Add.cs
├── Remove.cs
├── GetByTenant.cs
├── RequestVerification.cs
├── CheckDomain.cs
└── GetByDomain.cs

OnlineMenu/tests/OnlineMenu.UnitTests/
├── Domain/CustomDomainEntityTests.cs
├── UseCases/CustomDomains/
│   ├── AddCustomDomainHandlerTests.cs
│   ├── RemoveCustomDomainHandlerTests.cs
│   ├── GetCustomDomainByTenantHandlerTests.cs
│   ├── RequestVerificationHandlerTests.cs
│   └── ResolveDomainHandlerTests.cs
└── Infrastructure/Services/DomainVerificationServiceTests.cs

# Frontend (BaseClient)
src/components/Settings/CustomDomainSettings/
├── index.ts                               # Barrel export
├── constants.ts                           # Spacing, timing constants
├── components/
│   ├── CustomDomainSettingsScreen.tsx      # Main settings screen
│   ├── AddDomainForm.tsx                  # Domain name input + validation
│   ├── DomainStatusBadge.tsx              # Status indicator badge
│   └── DnsInstructions.tsx                # DNS setup instructions
└── utils/
    ├── domainValidation.ts                # isValidDomain pure function
    └── domainValidation.test.ts

src/lib/hooks/customDomain/
├── hooks/useCustomDomain.ts               # TanStack Query wrapper
├── constants.ts                           # Query keys, poll intervals
├── enums/CustomDomainStatus.ts            # Frontend status enum (mirrors backend)
└── types.ts                               # CustomDomainDto, UseCustomDomainReturn
```

---

### 2.5 SEO & Structured Data

**Purpose**: Makes public menus discoverable by search engines through JSON-LD structured data and meta tags. This is a self-hosted alternative to the Google Business Profile API, requiring no external service dependencies.

**Architecture**: Pure frontend. A `SeoHead` component injects schema.org JSON-LD and Open Graph meta tags into the document head on public menu pages. The embed route excludes SEO tags (uses `noindex, nofollow`) to prevent duplicate indexing.

**Schema.org Type Hierarchy**:
```
Restaurant (@context: https://schema.org)
├── name: restaurant name or menu name
├── url: public menu URL
├── logo: restaurant logo URL (optional)
└── hasMenu: Menu
    ├── name: menu name
    ├── description: menu description (optional)
    └── hasMenuSection: MenuSection[]
        ├── name: category name
        └── hasMenuItem: MenuItem[]
            ├── name: item name
            ├── description: item description (optional)
            └── offers: Offer (optional)
                ├── price: formatted price
                └── priceCurrency: "USD" (default)
```

**Key Components**:
- `SeoHead` -- React component that injects JSON-LD via a `useEffect` hook (creates a `<script type="application/ld+json">` tag) and renders Open Graph meta tags via `expo-router/head`. Renders nothing on native platforms.
- `generateMenuJsonLd()` -- pure function that builds the complete schema.org Restaurant object from menu data. Skips categories and items with empty names.
- `generateMenuMetaTags()` -- pure function that builds title, description, and Open Graph tags. Truncates descriptions to 160 characters with ellipsis. Uses `FM()` for localized title format and default description.

**Embed Page Handling**: Embed pages (`/public/menu/embed/[id]`) do not include `SeoHead` -- they are served with `noindex, nofollow` to prevent search engines from indexing the same menu content at multiple URLs.

**File Tree**:
```
src/components/PublicMenu/
├── components/
│   └── SeoHead.tsx                        # JSON-LD injection + meta tags
├── utils/
│   ├── menuStructuredData.ts              # generateMenuJsonLd (Restaurant > Menu > MenuSection > MenuItem)
│   ├── menuStructuredData.test.ts
│   ├── menuMetaTags.ts                    # generateMenuMetaTags (title, description, OG tags)
│   └── menuMetaTags.test.ts
└── index.ts                               # Exports SeoHead, generateMenuJsonLd, generateMenuMetaTags
```

---

## Cross-Cutting Concerns

### Localization
All features use `FM()` from `src/localization/helpers` for user-facing text. Translation keys are added to `src/localization/locales/en.json`. The QR Code Designer added 30+ keys under `onlineMenus.qrCode.designer`, the Embeddable Widget added 19 keys under `onlineMenus.embedWidget`, and Custom Domains added keys under `settings.customDomain`.

### Accessibility
All interactive elements across all features have `testID`, `accessibilityLabel`, and `accessibilityHint` attributes. Test IDs are defined in `src/shared/testIds/menuTestIds.ts`. Modal containers use `accessibilityViewIsModal` and `role="dialog"`.

### Module Structure
All feature directories with 4+ source files follow the enforced module structure convention: hooks in `hooks/`, sub-components in `components/`, utilities in `utils/`, data files in `data/`. This is enforced by ESLint rules `enforce-module-structure` and `enforce-test-colocation`. Tests are co-located next to source files.

### Testing Philosophy
Unit tests focus on logic, not rendering:
- Template engine tests verify SVG validity, content inclusion, and XSS prevention
- Download utility tests verify filename sanitization and data URI extraction
- Hook tests verify state transitions and callback behavior
- Domain validation tests verify edge cases (empty, too long, invalid characters)

E2E tests (when added) would cover the full user flows through the UI.

### Shared Public Menu Infrastructure
All distribution channels render the same public menu using shared `PublicMenu` components (`MenuContentView`, `CategorySection`, `MenuItemDisplay`). This ensures visual consistency whether the menu is accessed via direct link, QR code, embed, or custom domain.

---

## Future Features

### Social Media Auto-Post
**Status**: P3, not started.
Would allow automatic posting of menu updates to social media platforms. No architecture decisions made yet.

### Custom Domain SSL via Caddy
**Status**: Production enhancement (not started).
The current `NginxConfigProvider` generates HTTP-only server blocks. For production, Caddy's automatic HTTPS (via Let's Encrypt) would eliminate manual certificate management. The `IProxyConfigProvider` abstraction was designed with this migration in mind -- a `CaddyConfigProvider` implementation would be a drop-in replacement.

### Standalone Lightweight Embed Bundle
**Status**: Performance optimization (not started).
Currently the embed route loads the full Expo/React Native web bundle. A dedicated lightweight build (React only, no Expo runtime) could reduce the embed payload significantly. The dedicated embed route (`/public/menu/embed/`) was chosen partly to make this optimization possible without affecting the main application.

### Google Business Profile Integration
**Status**: Replaced by Schema.org SEO approach.
Initially considered for direct Google Business Profile API integration, but the schema.org structured data approach was chosen instead. It is self-hosted, has no external API dependencies, and achieves similar discoverability through standard search engine crawling.

---

## Decision Log

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| **SVG strings over React SVG components** (QR Designer) | React SVG components, canvas-only rendering | SVG strings are simpler to export as files. No React reconciliation needed for download pipeline. Fragment helpers compose cleanly. |
| **iframe over standalone bundle** (Embed Widget) | Standalone JS bundle, Web Components, server-side rendering | iframe reuses the existing build infrastructure, provides natural style isolation, and works with the auto-resize postMessage pattern. A standalone bundle is a future optimization. |
| **Dedicated embed route over query parameter** (Embed Widget) | `?embed=true` query parameter on existing public route | A separate route allows a completely different layout (`_layout.tsx`) with no toast/PWA/analytics overhead, and makes a future standalone bundle migration straightforward. |
| **Nginx over Caddy for v1** (Custom Domains) | Caddy (automatic HTTPS), Traefik | Nginx is already in the Docker stack with lower resource overhead. The `IProxyConfigProvider` abstraction keeps the door open for Caddy in production. |
| **IProxyConfigProvider abstraction** (Custom Domains) | Direct Nginx coupling | Proxy-agnostic interface enables swapping Nginx for Caddy (or any reverse proxy) without changing domain logic. Different environments may use different proxies. |
| **Per-tenant domains over per-menu** (Custom Domains) | One custom domain per menu, wildcard subdomains | Simpler mental model (one domain per restaurant). Covers the primary use case. Per-menu domains can be added later if needed. |
| **Schema.org over Google Business API** (SEO) | Google Business Profile API, Yelp API | Self-hosted with zero external dependencies. Works with all search engines, not just Google. No API keys, rate limits, or terms-of-service constraints. |
| **jspdf lazy-loaded** (QR Designer) | Eager import, server-side PDF generation | jspdf is approximately 300KB. Lazy loading via dynamic `import()` defers this cost until the user actually clicks the PDF download button. Most users will use PNG or SVG. |
| **postMessage auto-resize** (Embed Widget) | Fixed height, ResizeObserver in parent, MutationObserver | postMessage is the standard cross-origin communication mechanism for iframes. Origin validation provides security. The embed page sends height changes on every layout event. |
| **TXT ownership token** (Custom Domains) | Email verification, HTTP challenge (like Let's Encrypt), manual admin approval | TXT records prove domain ownership at the DNS level. Standard industry practice (used by Google, AWS, etc.). No user interaction delay beyond DNS propagation. |

---

*Last Updated: 2026-03-15*

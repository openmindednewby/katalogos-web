# Task 13: Tenant Theme Editor Micro-Frontend

> **Status**: COMPLETED (2026-03-06) — 83 unit tests, standalone Vite+React app at TenantThemeEditor/
> **Agent**: `frontend-dev` + `chief-architect` (for scaffolding decisions)
> **Blocked by**: 09 (backend theme endpoints must exist)
> **Blocks**: None (runs in parallel with BaseClient theme migration)
> **Estimated effort**: Large
> **Pattern**: Follows SyncfusionThemeStudio architecture exactly

---

## Problem Statement

The tenant theme editor needs to be a standalone micro-frontend, following the same pattern as SyncfusionThemeStudio and the existing Online Menu / Questioner modules. This gives tenants a dedicated, polished experience for customizing their branding.

---

## Architecture (Replicate SyncfusionThemeStudio Pattern)

### Tech Stack
| Aspect | Choice | Reason |
|--------|--------|--------|
| Framework | Vite + React 18 | Same as SyncfusionThemeStudio |
| State | Zustand | Same as SyncfusionThemeStudio |
| API | Orval + React Query | Auto-generated hooks from OpenAPI |
| Styling | Tailwind CSS | Same as SyncfusionThemeStudio |
| Testing | Vitest (unit) + Playwright (E2E) | Same pattern |
| Dev Port | 4446 | Next available after ThemeStudio (4444/4445) |
| Prod Port | 4447 | Preview port |

### Project Structure
```
SaaS/
├── TenantThemeEditor/                   # NEW - Standalone micro-frontend
│   ├── package.json
│   ├── vite.config.ts                   # Proxy to IdentityService + ContentService
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── Tiltfile                         # Dev/Build/E2E/Quality groups
│   ├── orval.config.ts                  # Generate hooks from IdentityService OpenAPI
│   ├── src/
│   │   ├── main.tsx                     # Entry point
│   │   ├── app/
│   │   │   └── App.tsx                  # Router + auth wrapper
│   │   ├── api/
│   │   │   ├── generated/               # Auto-generated React Query hooks
│   │   │   ├── mutators/
│   │   │   │   ├── identityMutator.ts   # IdentityService API (theme endpoints)
│   │   │   │   └── contentMutator.ts    # ContentService API (logo uploads)
│   │   │   └── swagger/
│   │   │       ├── identity.json        # IdentityService OpenAPI spec
│   │   │       └── content.json         # ContentService OpenAPI spec
│   │   ├── components/
│   │   │   ├── layout/                  # App shell, sidebar, header
│   │   │   ├── theme-editor/            # Main editor sections
│   │   │   │   ├── PresetSelector.tsx
│   │   │   │   ├── ColorEditor.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   ├── ColorScalePreview.tsx
│   │   │   │   ├── ModeEditor.tsx       # Light/dark mode overrides
│   │   │   │   ├── TypographyEditor.tsx
│   │   │   │   ├── BrandingEditor.tsx   # Logo/favicon upload
│   │   │   │   └── LivePreview.tsx      # Real-time preview panel
│   │   │   └── shared/                  # Reusable UI components
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── axiosInstance.ts
│   │   │   │   └── interceptors/
│   │   │   │       ├── authInterceptor.ts
│   │   │   │       └── tenantInterceptor.ts
│   │   │   └── palette-generator.ts     # SHARED - copy or npm package from BaseClient
│   │   ├── stores/
│   │   │   └── themeEditor/             # Zustand store for editor state
│   │   │       ├── index.ts
│   │   │       ├── types.ts
│   │   │       └── actions/
│   │   ├── theme/                       # App's own theme (can use SyncfusionThemeStudio pattern)
│   │   └── styles/
│   │       └── base.css                 # Tailwind base + CSS variables
│   ├── e2e/
│   │   ├── page-objects/
│   │   ├── tests/
│   │   │   ├── preset-selection.spec.ts
│   │   │   ├── color-editor.spec.ts
│   │   │   ├── logo-upload.spec.ts
│   │   │   ├── save-theme.spec.ts
│   │   │   └── live-preview.spec.ts
│   │   └── shared/
│   │       └── testIds.ts
│   └── vitest.config.ts
```

---

## Requirements

### Sub-Task 13a: Scaffold the Project

1. **Initialize project**: Vite + React + TypeScript template
2. **Install dependencies**: Match SyncfusionThemeStudio's stack
   - React 18, React Router v7, Zustand, React Query
   - Tailwind CSS, PostCSS
   - Orval for API hook generation
   - Vitest + Playwright for testing
3. **Configure Vite**:
   - Dev server on port 4446
   - Proxy `/api/identity/*` → `http://localhost:5002` (IdentityService)
   - Proxy `/api/content/*` → `http://localhost:5009` (ContentService)
4. **Configure Orval**: Generate hooks from IdentityService + ContentService OpenAPI specs
5. **Set up auth**: Token-based auth (receive JWT from parent app or own login)
6. **Create Tiltfile**: Full pipeline with Dev/Build/E2E/Quality groups

### Sub-Task 13b: Build the Editor UI

#### Preset Selector Section
- Grid of theme preset cards
- Each card shows color swatches (primary, secondary, accent)
- Click to apply preset as base
- Selected preset highlighted
- "Start from scratch" option

#### Color Editor Section
- Color wheel / spectrum picker for visual selection
- Hex input field for precise values
- 3 primary editors: Primary, Secondary, Accent
- Live shade scale preview (50-900) generated by palette generator
- Optional: Semantic color overrides (success, warning, error, info)

#### Mode Editor Section (Light/Dark)
- Toggle between light/dark preview
- Per-mode overrides: background, surface, text, border colors
- "Auto-generate from primary" button
- Side-by-side comparison view

#### Typography Editor Section
- Font family selector (system fonts + Google Fonts)
- Font size scale preview
- Heading vs body text preview
- Font weight options

#### Branding Editor Section
- Logo upload with drag-and-drop
  - Integrates with ContentService upload pipeline
  - Preview of uploaded logo
  - Max 2MB, PNG/JPG/SVG
- Favicon upload (same pattern, 64x64 recommended)
- App name / display name override

#### Live Preview Panel
- Real-time preview of theme applied to sample UI
- Shows: Buttons, form fields, cards, sidebar, text hierarchy
- Toggle light/dark mode in preview
- Responsive: collapsible on smaller screens

### Sub-Task 13c: API Integration

1. **Fetch current theme**: `GET /api/tenants/{tenantId}/theme`
2. **Save theme**: `PUT /api/tenants/{tenantId}/theme`
3. **List presets**: `GET /api/tenants/theme-presets`
4. **Upload logo**: ContentService upload flow (presigned URL → upload → complete)
5. **Resolve logo URL**: `GET /api/content/{contentId}/public-url`

### Sub-Task 13d: Tiltfile Integration

Add to the main `SaaS/Tiltfile` (and backup):
```python
# ===============================================================================
# TENANT THEME EDITOR
# ===============================================================================

local_resource(
    name='theme-editor-lint',
    labels=['TenantThemeEditor'],
    cmd='npm run lint',
    dir='TenantThemeEditor',
    allow_parallel=True,
)

local_resource(
    name='theme-editor-unit-tests',
    labels=['TenantThemeEditor'],
    cmd='npm run test:coverage',
    dir='TenantThemeEditor',
    resource_deps=['theme-editor-lint'],
    allow_parallel=True,
)

local_resource(
    name='theme-editor',
    labels=['TenantThemeEditor'],
    serve_cmd='npm run dev',
    serve_dir='TenantThemeEditor',
    resource_deps=['theme-editor-unit-tests', 'identity-api', 'content-api'],
    readiness_probe=probe(
        tcp_socket=tcp_socket_action(port=4446),
        initial_delay_secs=10,
        period_secs=5,
    ),
    links=[
        link('http://localhost:4446', 'Theme Editor'),
    ],
)
```

### Sub-Task 13e: E2E Tests

Playwright E2E tests covering:
- Preset selection and application
- Color picker interaction
- Logo upload flow
- Theme save and reload
- Light/dark mode toggle
- Live preview accuracy
- Error handling (API failures, invalid uploads)

Add Tilt resource and npm scripts to E2E test suite.

---

## Acceptance Criteria

- [ ] Standalone Vite + React project at `SaaS/TenantThemeEditor/`
- [ ] Dev server running on port 4446 with hot reload
- [ ] Vite proxy configured for IdentityService + ContentService
- [ ] Orval generates React Query hooks from OpenAPI specs
- [ ] Auth working (JWT from BaseClient session or own login)
- [ ] Preset selector with visual preview cards
- [ ] Color editor with picker + hex input + shade preview
- [ ] Light/dark mode override editors
- [ ] Logo upload via ContentService pipeline
- [ ] Live preview panel with sample UI components
- [ ] Save/load theme via IdentityService API
- [ ] Tiltfile with full Dev/Build/E2E pipeline
- [ ] Unit tests (Vitest) for editor logic
- [ ] E2E tests (Playwright) for main flows
- [ ] Lint + typecheck passing
- [ ] Production build succeeds
- [ ] All text via i18n (t() function)
- [ ] All interactive elements have testID + accessibilityLabel

---

## Files to Reference

- `SyncfusionThemeStudio/package.json` - Dependency list to replicate
- `SyncfusionThemeStudio/vite.config.ts` - Vite configuration pattern
- `SyncfusionThemeStudio/Tiltfile` - Tiltfile structure to replicate
- `SyncfusionThemeStudio/orval.config.ts` - Orval configuration pattern
- `SyncfusionThemeStudio/src/stores/theme/` - Theme store architecture
- `SyncfusionThemeStudio/src/components/layout/ThemeSettingsDrawer/` - Editor UI reference
- `SyncfusionThemeStudio/src/components/theme-sections/` - Section component reference
- `SyncfusionThemeStudio/e2e/` - E2E test structure to replicate
- `BaseClient/src/theme/palette-generator.ts` - Palette generator (from Task 02)
- `BaseClient/src/theme/presets/` - Preset definitions (from Task 04)

---

## Integration with BaseClient

The theme editor micro-frontend is accessed from BaseClient via:
1. **Navigation link**: Admin sidebar links to `http://localhost:4446/` (or deployed URL)
2. **Shared auth**: JWT token passed via URL parameter or shared cookie/localStorage
3. **Theme sync**: After saving in the editor, BaseClient's theme cache is invalidated (via event or polling)

The palette generator utility and preset definitions should be shared:
- **Option A**: Copy the files (simple, but duplication)
- **Option B**: Extract to a shared npm package in `NpmPackages/packages/theme-utils` (preferred for long-term)
- **Option C**: Import from BaseClient's published build

---

## Relationship to Task 11

Task 11 (Tenant Theme Editor UI) described an in-app editor page within BaseClient. This task (13) supersedes that approach with a standalone micro-frontend. Task 11 should be updated to become a "theme settings summary" page in BaseClient that:
- Shows current theme preview
- Links to the full theme editor micro-frontend
- Allows quick preset switching without leaving BaseClient

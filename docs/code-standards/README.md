# Code Standards Hub

> **Single Source of Truth** for all coding standards, architecture patterns, and best practices in this SaaS codebase.

**All agents (implementors, reviewers, testers) MUST read from this location.**

---

## Quick Links

| Standard | File | Purpose |
|----------|------|---------|
| **Architecture Patterns** | [architecture-patterns.md](architecture-patterns.md) | HOW things are built (structure, patterns, consistency) |
| **State Management** | [state-management-architecture.md](state-management-architecture.md) | TanStack Query + SignalR real-time architecture |
| **Frontend (React/Expo)** | [frontend-react.md](frontend-react.md) | React Native/Expo coding standards |
| **Backend (C#/.NET)** | [backend-csharp.md](backend-csharp.md) | Clean Architecture, CQRS, .NET best practices |
| **E2E Tests (Playwright)** | [e2e-playwright.md](e2e-playwright.md) | Playwright testing standards |
| **API Hooks** | [api-hooks-guide.md](api-hooks-guide.md) | Orval hook generation guide |

---

## For Agents

### Implementation Agents (frontend-dev, backend-dev)

Before writing code, review:
1. [architecture-patterns.md](architecture-patterns.md) - Understand existing patterns
2. [state-management-architecture.md](state-management-architecture.md) - **CRITICAL** for real-time features
3. Your domain-specific standards:
   - Frontend: [frontend-react.md](frontend-react.md)
   - Backend: [backend-csharp.md](backend-csharp.md)
4. [api-hooks-guide.md](api-hooks-guide.md) - For API integration

### Review Agents (code-reviewer)

When reviewing code, check compliance with:
1. [architecture-patterns.md](architecture-patterns.md) - Pattern compliance
2. Domain-specific standards based on file type
3. Cross-cutting concerns (multi-tenancy, logging, etc.)

### Test Agents (regression-tester)

When writing/running tests, follow:
1. [e2e-playwright.md](e2e-playwright.md) - E2E testing standards

### Quality Checks (run independently by each agent)

Technical verification (lint, tests, build) - standards are enforced via:
- ESLint (frontend) - configured in `BaseClient/eslint.config.mjs`
  - Custom `smart-max-lines` plugin for intelligent function size limits
- dotnet format (backend) - configured in `.editorconfig`
- Playwright config - configured in `E2ETests/playwright.config.ts`

Each agent runs quality checks independently for their domain - no aggregate quality gate needed.

---

## Standards Overview

### Architecture Patterns (`architecture-patterns.md`)

Defines HOW features are implemented:

| Topic | Description |
|-------|-------------|
| Project Structure | Monorepo layout, service structure |
| Backend Patterns | Clean Architecture, CQRS, FastEndpoints, Repositories |
| Frontend Patterns | Component structure, API hooks, testIds |
| Multi-Tenancy | BaseTenantEntity, AppDbContext filtering |
| Cross-Cutting | When to create NuGet/npm packages |
| Testing | Unit vs E2E philosophy |
| Reference Implementations | Gold standard examples |

### State Management (`state-management-architecture.md`)

**CRITICAL for real-time features** - Defines state management with TanStack Query + SignalR:

| Topic | Key Rules |
|-------|-----------|
| Single Source of Truth | TanStack Query cache holds all server data |
| Real-Time Updates | SignalR updates cache via custom hook abstraction |
| Hook Pattern | Wrap Orval hooks with `useRealtimeQuery` for real-time |
| QueryClient Access | **NEVER** expose directly - hide in hooks |
| Orval Integration | Use exported `getXxxQueryKey()` for cache updates |
| Optimistic Updates | Use onMutate for instant UI, SignalR confirms |

### Frontend Standards (`frontend-react.md`)

| Topic | Key Rules |
|-------|-----------|
| Component Order | Redux → Query → State → Hooks → Effects → Handlers → Returns |
| Naming | PascalCase components, camelCase functions, handle* for events |
| API Calls | Always use generated hooks, never manual fetch |
| Accessibility | testID + accessibilityLabel + accessibilityHint required |
| Styling | No inline colors, use theme tokens |
| Localization | All text via FM() from localization/helpers (never t()) |
| Forms | FormType, FormFields, getInitialFormState pattern |

### Backend Standards (`backend-csharp.md`)

| Topic | Key Rules |
|-------|-----------|
| Architecture | Clean Architecture with strict layer separation |
| CQRS | Commands (write) and Queries (read) with MediatR |
| Endpoints | FastEndpoints, not MVC Controllers |
| Results | Return Result<T>, don't throw for business logic |
| Repositories | Generic repository with specifications |
| Naming | Create/Update/Delete + EntityCommand, Get/List + EntityQuery |
| Testing | AAA pattern, mock repositories, Shouldly assertions |

### E2E Standards (`e2e-playwright.md`)

| Topic | Key Rules |
|-------|-----------|
| Locators | data-testid preferred, no XPath, no .or() chains |
| Waiting | Web-first assertions, NO waitForTimeout() |
| Navigation | waitUntil: 'commit', not 'networkidle' |
| Page Objects | Locators in constructor, expect* for assertions |
| Test Independence | Each test sets up its own state |
| UI Testing | Test through UI, never bypass with API calls |

### API Hooks (`api-hooks-guide.md`)

| Topic | Key Rules |
|-------|-----------|
| Generation | Run `npm run generate:hooks` after API changes |
| Imports | From `@/server/autoGeneratedHooks/[service]` |
| Never | Write manual API hooks - always generate |
| Types | Use generated TypeScript types |

---

## Compliance Checklist

### Before Marking Work Complete

#### Frontend Changes
- [ ] Component follows structure order
- [ ] Uses generated API hooks (not manual fetch)
- [ ] All text uses FM() from localization/helpers (never t())
- [ ] All interactive elements have testID
- [ ] All TouchableOpacity have accessibilityHint
- [ ] No hardcoded color literals
- [ ] Files under 300 lines
- [ ] React components under 200 lines
- [ ] Regular functions under 50 lines (warning at 30)

#### Backend Changes
- [ ] Follows Clean Architecture layers
- [ ] Uses CQRS (Command/Query + Handler)
- [ ] Uses FastEndpoints (not MVC)
- [ ] Tenant entities inherit BaseTenantEntity
- [ ] Uses Result<T> pattern
- [ ] Has unit tests for handlers

#### E2E Changes
- [ ] Uses data-testid locators
- [ ] No waitForTimeout() calls
- [ ] No networkidle waits
- [ ] Tests through UI (no API bypass)
- [ ] Page Object pattern followed

---

## Updating Standards

When updating standards:

1. Edit the relevant file in this folder
2. Update this README if adding new sections
3. Notify team of changes
4. Update agent prompts if needed

**Do NOT create duplicate standards files elsewhere.** This is the single source of truth.

---

## Translation Architecture

All translation keys live in a single file: `src/localization/locales/en.json`.

**Important**: The `locales/en/` subdirectory (`core.json`, `features.json`, `layout.json`) is **NOT loaded** by i18n. All keys MUST go in `en.json`.

**Adding new translations**: Add keys to `src/localization/locales/en.json`. Use `FM()` from `localization/helpers` - never use `t()` from `useTranslation()`.

---

## File Structure

```
BaseClient/docs/code-standards/
├── README.md                        # This file (index)
├── architecture-patterns.md         # HOW things are built
├── state-management-architecture.md # TanStack Query + SignalR real-time
├── frontend-react.md                # React/Expo standards
├── backend-csharp.md                # C#/.NET standards
├── e2e-playwright.md                # Playwright standards
└── api-hooks-guide.md               # Hook generation guide
```

---

*Last Updated: 2026-03-18*

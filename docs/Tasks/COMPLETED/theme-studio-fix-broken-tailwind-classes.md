# CRITICAL: Fix Broken Tailwind CSS Classes Across Entire Codebase

## Status: TODO
## Priority: CRITICAL
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
The codebase uses **1,657+ broken Tailwind CSS class names** that don't resolve to any styles. This is the root cause of most visual issues across all feature pages.

## Broken Class Patterns

### 1. `text-text-*` classes (500+ occurrences) - MOST WIDESPREAD
- `text-text-primary` should be `text-primary` (or whatever the correct Tailwind config key is)
- `text-text-secondary` should be `text-secondary`
- `text-text-muted` should be `text-muted`
- **Impact**: Text renders with browser defaults instead of theme colors

### 2. `bg-surface-hover` (5+ occurrences)
- Not defined in Tailwind config
- Used in: LanguageSwitcher, AccordionNative, DialogNative, MenuNative, EditorToolbar, DocumentList
- **Impact**: Hover states on buttons/menus don't work

### 3. `bg-surface-primary`, `bg-surface-secondary` (43 occurrences)
- Not defined in Tailwind config
- Used in: Admin pages (IntegrationDetail, PluginDetail, RoleManagement), Chat (ChannelList)
- **Impact**: Background colors missing on admin and chat sections

### 4. `border-border-primary`, `border-brand-primary` (43 occurrences)
- Not defined in Tailwind config
- Used in: RoleManagement, Chat (ChannelHeader, ChannelList)
- **Impact**: Borders render with wrong/missing colors

### 5. `bg-surface-100/200/700/800` (5 occurrences)
- Numeric surface variants don't exist
- Used in: PWAInstallPrompt, PWAUpdatePrompt
- **Impact**: PWA prompts render without proper backgrounds

## Root Cause
Mismatch between class names used in components and what's actually defined in `tailwind.config.ts`. Either:
- Option A: The Tailwind config was changed/simplified after components were written
- Option B: Components were written with assumed class names that were never added to config

## Fix Strategy
Two approaches (choose one):

### Option A: Fix Tailwind Config (add missing classes)
Add the missing color definitions to `tailwind.config.ts`:
```
surface-hover, surface-primary, surface-secondary
border-primary, brand-primary
surface-100 through surface-900
```
Then fix `text-text-*` to `text-*` everywhere.

### Option B: Fix All Component Classes (use existing config)
Update all 1,657+ occurrences to use classes that actually exist in config.
This is more work but ensures config stays clean.

## Affected Areas (nearly everything)
- All feature pages
- Core UI components (AccordionNative, DialogNative, MenuNative)
- Layout components (LanguageSwitcher)
- PWA components
- Editor components
- Chat components
- Admin pages

## Tasks
- [ ] Audit `tailwind.config.ts` to understand what classes ARE defined
- [ ] Decide on Option A vs Option B
- [ ] Fix `text-text-*` → correct class name (500+ files)
- [ ] Fix `bg-surface-hover` → correct class name (5+ files)
- [ ] Fix `bg-surface-primary/secondary` → correct class name (43 files)
- [ ] Fix `border-border-primary/brand-primary` → correct class name (43 files)
- [ ] Fix `bg-surface-100/200/700/800` → correct class name (5 files)
- [ ] Run visual-qa on all pages to verify fixes
- [ ] Run full E2E suite to verify no regressions

## Files
- `tailwind.config.ts` - Source of truth for available classes
- Nearly all files in `src/features/` and `src/components/`

## Additional Issues Found by Bug Agent
- `dangerouslySetInnerHTML` without sanitization in `PreviewPanel.tsx` (RTE)
- 20+ silent `.catch(() => {})` blocks swallowing CSS load errors
- 3 TODO comments for unimplemented integrations (Sentry, auth, multi-tenant)

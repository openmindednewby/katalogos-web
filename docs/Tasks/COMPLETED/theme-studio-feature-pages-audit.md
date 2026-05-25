# Theme Studio Feature Pages - Audit Summary

## Status: TODO
## Created: 2026-03-05
## Domain: SyncfusionThemeStudio (Frontend)

## Overview
Comprehensive audit of all feature pages in the Theme Studio app. Identified 12 tasks total: 1 critical, 5 high, 3 medium, 2 low, and 1 component extraction task.

## Bug Tasks (by priority)

### CRITICAL
| Task | Page | Issue |
|------|------|-------|
| [fix-broken-tailwind-classes](theme-studio-fix-broken-tailwind-classes.md) | **ALL pages** | 1,657+ broken CSS classes (`text-text-primary`, `bg-surface-hover`, etc.) — root cause of most styling issues |

### HIGH PRIORITY
| Task | Page | Issue |
|------|------|-------|
| [fix-pdf-viewer](theme-studio-fix-pdf-viewer.md) | `/pdf-viewer` | PDF viewer renders completely blank |
| [fix-rich-text-editor](theme-studio-fix-rich-text-editor.md) | `/editor` | Formatting toolbar missing |
| [fix-spreadsheet](theme-studio-fix-spreadsheet.md) | `/spreadsheet` | Color picker overlay + broken ribbon toolbar |
| [fix-file-manager](theme-studio-fix-file-manager.md) | `/file-manager` | NetworkError - missing mock API |
| [fix-broken-routes](theme-studio-fix-broken-routes.md) | `/admin/*`, `/alerts` | 3 sidebar items lead to 404 |

### MEDIUM PRIORITY
| Task | Page | Issue |
|------|------|-------|
| [fix-gantt-chart](theme-studio-fix-gantt-chart.md) | `/gantt` | Timeline bars blank, toolbar unstyled, broken i18n keys |
| [fix-calendar](theme-studio-fix-calendar.md) | `/calendar` | Header navigation missing, day names truncated |
| [fix-hardcoded-colors](theme-studio-fix-hardcoded-colors.md) | Multiple | Hardcoded hex colors in AlertKpiCards, LoginPage |

### LOW PRIORITY
| Task | Page | Issue |
|------|------|-------|
| [fix-diagram-toolbar](theme-studio-fix-diagram-toolbar.md) | `/diagram` | Toolbar buttons render as plain text |
| [fix-products-filter](theme-studio-fix-products-filter-styling.md) | `/products` | Filter row inputs unstyled/truncated |

## Component Extraction Task
| Task | Scope |
|------|-------|
| [extract-reusable-components](theme-studio-extract-reusable-components.md) | StatCard, FormDialog, CrudTable, Badge variants, Chart wrappers |

## Pages That Work Correctly
- Dashboard (`/dashboard`) - Charts, stats, layout all render properly
- Customers (`/customers`) - Table, search, CRUD functional
- Orders (`/orders`) - Table with status badges, filters work
- Activity Log (`/activity-log`) - Table with filters, data displays correctly
- Chat (`/chat`) - Channel list, messages, send functionality works
- Profile (`/profile`) - Form fields, avatar, save button all work
- Forms (`/forms`) - Contact form with validation works
- Maps (`/maps`) - Office locations list + map render correctly
- Kanban (`/kanban`) - Board columns and cards render

## Common Root Cause Patterns

### 1. Broken Tailwind Classes (CRITICAL)
1,657+ components use CSS class names that don't exist in `tailwind.config.ts`. For example `text-text-primary` instead of the correct class. This affects text colors, backgrounds, borders, and hover states across nearly every page. **Fixing this single issue will resolve most styling problems.**

### 2. Syncfusion CSS Loading
Many Syncfusion component bugs (PDF Viewer, Spreadsheet, Calendar, Gantt) share a root cause: CSS modules not loading correctly. The app uses `loadSyncfusionCss()` with silent `.catch(() => {})` that swallows errors. A systematic fix of the CSS loading + error reporting could resolve multiple bugs.

### 3. Admin Pages Don't Use Core Components
Admin pages (Integrations, Plugins, RoleManagement, SystemSettings) build custom modals, toggles, inputs, and badges instead of using the core component library. DialogNative, ToggleNative, InputNative, BadgeNative all exist but are unused.

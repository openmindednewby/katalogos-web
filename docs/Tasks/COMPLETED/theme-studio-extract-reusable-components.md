# Extract Feature-Local Components into Core Reusable Library

## Status: TODO
## Priority: MEDIUM
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
Several UI patterns are duplicated across feature pages as local components instead of being part of the core `src/components/` reusable library. This leads to inconsistency and duplicated maintenance.

## Components to Extract

### HIGH PRIORITY (Used in 3+ feature pages)

#### 1. StatCard / KPI Card
- **Used in**: DashboardPage, DashboardKpisPage, DashboardMetricsPage, AlertsManagementPage
- **Current location**: `src/features/dashboard/pages/DashboardPage/components/StatCard.tsx`
- **What it does**: Displays a metric with label, value, and trend indicator (+12.5%, -2.4%)
- **Extract to**: `src/components/ui/native/StatCardNative.tsx`

#### 2. CRUD Table Wrapper
- **Used in**: CustomersPage, OrdersPage, UserManagementPage, ActivityLogPage
- **Current location**: Feature-local `sections/` directories
- **What it does**: Table with search, filter, add/edit/delete actions, status badges
- **Note**: TableNative exists in core, but each feature re-implements the CRUD wrapper pattern
- **Extract to**: `src/components/ui/native/CrudTableNative.tsx` (generic CRUD shell)

#### 3. Form Dialog
- **Used in**: CustomersPage (CustomerDialog), OrdersPage (OrderDialog), UserManagementPage (UserDialog)
- **Current location**: Feature-local `sections/` directories
- **What it does**: Modal dialog with form fields, validation, save/cancel buttons
- **Note**: DialogNative exists but no FormDialog pattern
- **Extract to**: `src/components/ui/native/FormDialogNative.tsx`

### MEDIUM PRIORITY (Used in 2 feature pages)

#### 4. Status/Role Badge Variants
- **Used in**: UserManagementPage (UserStatusBadge, UserRoleBadge), OrdersPage (status badges)
- **Current location**: Feature-local sections
- **What it does**: Colored badge with semantic variant (active/inactive, admin/viewer, delivered/pending)
- **Note**: BadgeNative exists but lacks semantic variant system
- **Extract to**: Extend `src/components/ui/native/BadgeNative.tsx` with variant prop

#### 5. Chart Wrappers
- **Used in**: DashboardPage, DashboardKpisPage, DashboardMetricsPage
- **Current location**: Feature-local `components/` directories
- **What it does**: Wraps Syncfusion chart components with consistent styling and data format
- **Charts**: RevenueChart, OrdersByStatusChart, TopProductsChart, UserActivityChart, KpiSparkCard
- **Note**: No chart components in core library at all
- **Extract to**: `src/components/ui/syncfusion/Chart/` directory

### LOW PRIORITY (Feature-specific but pattern is reusable)

#### 6. Filter Toolbar
- **Used in**: ActivityLogPage, AlertsManagementPage, ProductsListPage
- **Current location**: Feature-local components
- **What it does**: Horizontal bar with search input, dropdown filters, date range picker

## Tasks
- [ ] Extract StatCard to core components with configurable trend indicator
- [ ] Create FormDialog pattern in core (wraps DialogNative + form validation)
- [ ] Add semantic variants to BadgeNative (success, warning, error, info, neutral)
- [ ] Create chart wrapper directory in core syncfusion components
- [ ] Create CrudTable wrapper that composes TableNative with CRUD actions
- [ ] Update feature pages to import from core instead of local
- [ ] Add unit tests for new core components

## Acceptance Criteria
- Each extracted component has props interface documented
- Feature pages use core component (no local duplicates)
- Visual appearance matches existing feature implementations
- All existing E2E tests still pass

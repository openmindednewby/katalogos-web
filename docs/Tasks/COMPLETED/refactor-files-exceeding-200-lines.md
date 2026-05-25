# Refactor Files Exceeding 200 Line Limit

## Status: COMPLETED

## Problem Statement
Several files in the BaseClient codebase exceed the 200-line limit enforced by ESLint for React components and hooks. These files need to be refactored to improve maintainability and pass linting.

## Files Refactored

### 1. useMenuPageHandlers.ts (was ~247 lines)
- **Now**: 12-line re-export facade
- **Extracted to** `src/hooks/menuHandlers/`:
  - `index.ts` (7 lines) - Barrel export
  - `menuErrorUtils.ts` (22 lines) - Error message extraction utilities
  - `menuMutationHandlers.ts` (107 lines) - Delete, activate toggle, open external handlers
  - `menuQueryHooks.ts` (57 lines) - Query hooks and refetch logic
  - `menuSaveHandlers.ts` (158 lines) - Create and update save handlers

### 2. useUserPageHandlers.ts (was ~289 lines)
- **Now**: 12-line re-export facade
- **Extracted to** `src/hooks/userHandlers/`:
  - `index.ts` (7 lines) - Barrel export
  - `userMutationHandlers.ts` (168 lines) - Create, delete, toggle enabled handlers
  - `userPasswordHandlers.ts` (45 lines) - Password submit handler
  - `userQueryHooks.ts` (118 lines) - Query hooks and user list mapping

### 3. useUploadContent.ts (was ~288 lines, at `src/lib/hooks/content/hooks/`)
- **Now**: 196 lines (under 200 limit)
- **Extracted to** `src/lib/hooks/content/utils/uploadUtils.ts` (177 lines):
  - XHR upload functions, file validation, API communication
  - Constants: PROGRESS_COMPLETE, HTTP status ranges, byte constants
- Main hook file retains composition logic, mutation callbacks, cancel/reset

### 4. layout.ts (was ~279 lines, at `src/theme/utils/`)
- **Now**: 98-line re-export + core styles facade
- **Extracted to** `src/theme/utils/`:
  - `layoutSidebar.ts` (67 lines) - Sidebar container, mobile sidebar, theme-aware generator
  - `layoutTopbar.ts` (63 lines) - Topbar container, mobile topbar, theme-aware generator
  - `layoutForms.ts` (99 lines) - Form rows, inputs, tabs, checkboxes, section cards
  - `layoutDrawer.ts` (62 lines) - Overlay, drawer panels, dropdown panels

### Test Files
- Test files were NOT refactored (they are exempt from the 200-line limit per task scope)

## Backward Compatibility
- All original import paths preserved via re-export facades
- `useMenuPageHandlers.ts` re-exports all hooks from `menuHandlers/`
- `useUserPageHandlers.ts` re-exports all hooks from `userHandlers/`
- `useUploadContent.ts` re-exports `validateFile` from `uploadUtils`
- `layout.ts` re-exports all style objects and generators from sub-modules

## Additional Cleanup
- Removed unused `MenuQueries` and `UserQueries` type re-exports from facade files and barrel indexes (flagged by YAGNI check; types still available at their source modules)

## Quality Verification Results
- [x] `npm run lint:fix` - passes with no errors
- [x] `npm run yagni` - no new unused exports from refactored files
- [x] `npm run test:coverage` - 182 suites, 2415 tests all pass
- [x] `npx expo export --platform web` - build succeeds

## Success Criteria
- [x] All source files under 200 lines (components/hooks) / 300 lines (any file)
- [x] `npm run lint` passes without warnings about file length
- [x] All tests still pass
- [x] Build succeeds

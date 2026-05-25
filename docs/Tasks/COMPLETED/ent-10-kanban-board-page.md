# ENT-10: Kanban Board Page (Backend + Frontend)

## Status: IN_PROGRESS
## Priority: Medium
## Agent: frontend-dev

## Problem Statement

Add a Kanban board page for project/task management using Syncfusion's Kanban component. This requires both MockServer backend (CRUD API for KanbanTask entity) and SyncfusionThemeStudio frontend (Kanban page with drag-and-drop, custom cards, task dialogs).

## Implementation Plan

### Backend (MockServer)

1. Create `KanbanTask` entity in MockServer.Core
2. Create `KanbanTaskDto` in MockServer.UseCases/DTOs
3. Create CRUD use cases (List, Create, Update, Delete) following MediatR pattern
4. Add DtoMapper for KanbanTask
5. Create FastEndpoints for all 4 CRUD operations
6. Add DbSet and seed data in MockServer.Infrastructure
7. Regenerate OpenAPI spec and orval hooks

### Frontend (SyncfusionThemeStudio)

1. Install `@syncfusion/ej2-react-kanban`
2. Create kanban feature directory structure
3. Create KanbanPage with board, toolbar, task cards, priority badges, and dialog
4. Add routing (RouteSegment, RoutePath, RoutePrefix)
5. Add sidebar navigation entry
6. Add i18n keys to en.json
7. Add testIds

## Files to Modify

### Backend (New Files)
- `MockServer.Core/Entities/KanbanTask.cs`
- `MockServer.UseCases/DTOs/KanbanTaskDto.cs`
- `MockServer.UseCases/KanbanTasks/List/*`
- `MockServer.UseCases/KanbanTasks/Create/*`
- `MockServer.UseCases/KanbanTasks/Update/*`
- `MockServer.UseCases/KanbanTasks/Delete/*`
- `MockServer.Web/KanbanTasks/*.cs` (endpoints)

### Backend (Modified Files)
- `MockServer.UseCases/Mappers/DtoMapper.cs`
- `MockServer.Infrastructure/Data/MockDbContext.cs`
- `MockServer.Infrastructure/Data/SeedData.cs`

### Frontend (New Files)
- `src/features/kanban/pages/KanbanPage/index.tsx`
- `src/features/kanban/pages/KanbanPage/components/*.tsx`
- `src/features/kanban/pages/KanbanPage/hooks/useKanbanTasks.ts`
- `src/features/kanban/types.ts`
- `src/features/kanban/constants.ts`

### Frontend (Modified Files)
- `src/app/routes/routeSegment.ts`
- `src/app/routes/routePath.ts`
- `src/app/routes/routePrefix.ts`
- `src/app/routes/lazyPages.ts`
- `src/app/router.tsx`
- `src/components/layout/Sidebar/sidebarNavData.ts`
- `src/components/layout/Sidebar/utils/iconName.ts`
- `src/shared/testIds.ts`
- `src/localization/locales/en.json`

## Success Criteria
- [ ] MockServer builds and seeds 20+ kanban tasks
- [ ] All 4 CRUD endpoints work
- [ ] Kanban board renders with 4 columns
- [ ] Drag-and-drop moves cards and updates API
- [ ] Custom card template with priority, assignee, tags
- [ ] Create/edit/delete tasks via dialog
- [ ] Respects dark/light theme
- [ ] Frontend builds without errors
- [ ] Linting passes

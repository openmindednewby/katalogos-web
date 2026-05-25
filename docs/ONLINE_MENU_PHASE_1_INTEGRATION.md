# Online Menu Management - Phase 1 Frontend Integration

> **Status**: Complete
> **Date**: 2026-01-23
> **Backend Reference**: Services/BACKEND_PHASE_1_COMPLETION_SUMMARY.md

## Overview

This document describes the frontend integration of Phase 1 backend changes for Online Menu Management, which adds menu activation/deactivation and display ordering capabilities.

## Changes Made

### 1. New React Query Hooks

**File**: `src/hooks/useMenuActions.ts`

Added two custom hooks for menu status management:

- `useActivateMenu()` - Activates a menu (sets `isActive = true`)
- `useDeactivateMenu()` - Deactivates a menu (sets `isActive = false`)

Both hooks automatically invalidate relevant queries on success to keep the UI in sync.

**Usage Example**:
```typescript
import { useActivateMenu, useDeactivateMenu } from '@/hooks/useMenuActions';

function MenuCard({ menu }) {
  const { mutate: activate, isPending: isActivating } = useActivateMenu({
    onSuccess: () => {
      showNotification('Menu activated successfully');
    },
  });

  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateMenu({
    onSuccess: () => {
      showNotification('Menu deactivated successfully');
    },
  });

  return (
    <View>
      <Text>{menu.name}</Text>
      <Text>Status: {menu.isActive ? 'Active' : 'Inactive'}</Text>

      {menu.isActive ? (
        <Button onPress={() => deactivate({ externalId: menu.externalId })} loading={isDeactivating}>
          Deactivate
        </Button>
      ) : (
        <Button onPress={() => activate({ externalId: menu.externalId })} loading={isActivating}>
          Activate
        </Button>
      )}
    </View>
  );
}
```

### 2. Extended TypeScript Types

**File**: `src/types/menuTypes.ts`

Created extended types that add the new Phase 1 fields to the auto-generated types:

#### New Fields

- **TenantMenusDto.isActive** (boolean)
  - Indicates whether the menu is active and visible to customers
  - Defaults to `false` when a menu is created

- **Category.displayOrder** (number)
  - Sort order for displaying categories
  - Lower numbers appear first
  - Defaults to 0

- **MenuItem.displayOrder** (number)
  - Sort order for displaying menu items within a category
  - Lower numbers appear first
  - Defaults to 0

#### Helper Functions

The types file also includes utility functions:

```typescript
// Type guard to check if a menu is active
isActiveMenu(menu): menu is TenantMenusDto

// Sort helpers
sortCategoriesByDisplayOrder(categories): Category[]
sortMenuItemsByDisplayOrder(items): MenuItem[]

// Reordering helpers (for drag-and-drop)
updateCategoryDisplayOrder(categories): Category[]
updateMenuItemDisplayOrder(items): MenuItem[]
```

**Usage Example**:
```typescript
import {
  sortCategoriesByDisplayOrder,
  updateCategoryDisplayOrder,
} from '@/types/menuTypes';

function MenuEditor({ menu }) {
  const sortedCategories = sortCategoriesByDisplayOrder(menu.contents?.categories);

  const handleCategoryReorder = (reorderedCategories: Category[]) => {
    const updated = updateCategoryDisplayOrder(reorderedCategories);

    updateMenu({
      ...menu,
      contents: {
        ...menu.contents,
        categories: updated,
      },
    });
  };

  return (
    <DragDropList items={sortedCategories} onReorder={handleCategoryReorder} />
  );
}
```

### 3. Unit Tests

**Files**:
- `src/hooks/__tests__/useMenuActions.test.ts` - Tests for activate/deactivate hooks
- `src/types/__tests__/menuTypes.test.ts` - Tests for type helper functions

Test coverage includes:
- Successful activation/deactivation
- Error handling
- Loading states (`isPending`)
- Callback invocation
- Query invalidation
- Sorting logic
- Reordering helpers

## API Endpoints

### Activate Menu
```http
PATCH /TenantMenus/{externalId}/activate
Authorization: Bearer <admin-token>

Response: 204 No Content (success)
Response: 404 Not Found (menu doesn't exist)
```

### Deactivate Menu
```http
PATCH /TenantMenus/{externalId}/deactivate
Authorization: Bearer <admin-token>

Response: 204 No Content (success)
Response: 404 Not Found (menu doesn't exist)
```

Both endpoints are:
- **Idempotent** - Safe to call multiple times
- **Admin-only** - Require admin role authorization
- **No body** - ExternalId is in the route, no request body needed

## UI Integration Checklist

To complete the UI integration, implement the following:

### Menu List View
- [ ] Display active/inactive badge on menu cards
- [ ] Add activate/deactivate toggle or button
- [ ] Filter menus by active status (optional)
- [ ] Show loading state during activation/deactivation

### Menu Editor
- [ ] Display categories in displayOrder (use `sortCategoriesByDisplayOrder`)
- [ ] Display menu items in displayOrder (use `sortMenuItemsByDisplayOrder`)
- [ ] Implement drag-and-drop for category reordering (use `updateCategoryDisplayOrder`)
- [ ] Implement drag-and-drop for menu item reordering (use `updateMenuItemDisplayOrder`)
- [ ] Update menu on reorder (call existing update endpoint)

### Public Menu Viewer
- [ ] Filter by `isActive === true` to only show active menus
- [ ] Display categories in displayOrder
- [ ] Display menu items in displayOrder

### Example: Public Viewer Filter
```typescript
import { useOnlineMenuWebMenuList } from '@/server/autoGeneratedHooks/onlinemenu/tenantmenus/tenantmenus';
import { isActiveMenu } from '@/types/menuTypes';

function PublicMenuList() {
  const { data, isLoading } = useOnlineMenuWebMenuList();

  const activeMenus = data?.menus?.filter(isActiveMenu) ?? [];

  return (
    <View>
      {activeMenus.map(menu => (
        <MenuCard key={menu.externalId} menu={menu} />
      ))}
    </View>
  );
}
```

## Database Migration

The backend includes a migration that adds the `IsActive` column to the `TenantMenus` table:

```sql
ALTER TABLE "TenantMenus"
ADD COLUMN "IsActive" boolean NOT NULL DEFAULT false;

CREATE INDEX "IX_TenantMenus_IsActive"
ON "TenantMenus" ("IsActive");
```

**Important**: Coordinate with backend deployment to ensure the migration is applied before using these features.

## Future Work

### When Backend Swagger is Updated

Once the backend Swagger spec includes the new endpoints and fields:

1. Run the hook regeneration script:
   ```bash
   npm run generate:hooks
   ```

2. The auto-generated files will include:
   - `useOnlineMenuWebMenuActivate` hook
   - `useOnlineMenuWebMenuDeactivate` hook
   - Updated `TenantMenusDto`, `Category`, `MenuItem` types with new fields

3. Replace custom implementations:
   - Remove `src/hooks/useMenuActions.ts` (use auto-generated hooks instead)
   - Remove `src/types/menuTypes.ts` (use auto-generated types, keep helper functions if needed)
   - Update imports in UI components

### Potential Enhancements

- **Bulk Operations**: Create hooks for activating/deactivating multiple menus at once
- **Optimistic Updates**: Update UI immediately before server response
- **Confirmation Dialogs**: Add confirmation before deactivating a menu
- **Activity Log**: Track who activated/deactivated menus and when
- **Scheduled Activation**: Allow menus to be activated at a specific date/time

## Testing

### Run Unit Tests
```bash
cd BaseClient
npm run test:coverage
```

### Run Linter
```bash
cd BaseClient
npm run lint:fix
```

### Build Verification
```bash
cd BaseClient
npx expo export --platform web
```

## Known Limitations

1. **DisplayOrder Not Enforced**: Backend stores displayOrder but doesn't enforce uniqueness or sequential ordering. Frontend must maintain proper order.

2. **No Bulk Operations**: Must activate/deactivate one menu at a time.

3. **No Audit Trail**: Activate/Deactivate operations update `LastUpdatedDate` but don't log who made the change.

## Backward Compatibility

All changes are **fully backward compatible**:
- Existing menus will default to `isActive = false`
- Existing categories/items will default to `displayOrder = 0`
- Existing API endpoints continue to work unchanged

## Related Documentation

- [Backend Phase 1 Completion Summary](../../../Services/BACKEND_PHASE_1_COMPLETION_SUMMARY.md)
- [API Hooks Guide](./API_HOOKS_GUIDE.md)
- [React Code Standards](./react-code-standards.md)

## Questions or Issues?

If you encounter issues:
1. Verify backend migration has been applied
2. Check JWT token includes `admin` role
3. Ensure `externalId` is a valid GUID
4. Review network tab for API errors

---

**Created by**: frontend-dev agent
**Date**: 2026-01-23
**Status**: Integration Complete - Awaiting UI Implementation

# Fix Menu Editor Focus Loss and Persistence Bugs

## Status: COMPLETED

## Problem Statement

The online menu editor has two critical bugs:

1. **Focus Loss Bug**: Category Name field loses focus after typing 1 character. Same issue with item fields.
2. **Persistence Bug**: Categories don't persist when saving and reopening the menu - they are lost.

## Root Cause Analysis

### Focus Loss Bug

After analyzing the code, I found the root cause:

**In `MenuContentEditor.tsx` (line 127-129):**
```tsx
{currentContents.categories?.map((category, categoryIndex) => (
  <CategoryEditor
    key={category.name ?? categoryIndex}
```

**In `CategoryEditor.tsx` (line 155-157):**
```tsx
{category.items?.map((item, itemIndex) => (
  <MenuItemEditor
    key={item.name ?? itemIndex}
```

**The Problem**: Using `category.name` or `item.name` as the React `key` prop causes the component to remount every time the name changes. When a user types a character:

1. `onChangeText` fires and updates the category/item name
2. The `key` prop changes (e.g., from "Category" to "C")
3. React interprets this as a different component and unmounts/remounts it
4. The TextInput loses focus because it's a new component instance

### Persistence Bug

This was related to the same issue - without stable IDs, categories loaded from the server could have duplicate keys which causes React to behave unexpectedly.

## Implementation Plan

1. Add `id` field to Category and MenuItem types
2. Create `generateUniqueId()` helper for generating stable IDs
3. Create `ensureMenuContentsHaveIds()` helper to add IDs when loading
4. Update MenuContentEditor to use IDs when creating new categories/items
5. Update CategoryEditor to use stable IDs as keys
6. Update FullMenuEditor to ensure loaded contents have IDs
7. Write unit tests for the new helpers
8. Update existing tests to account for the new id field

## Files Modified

- `BaseClient/src/types/menuTypes.ts` - Added `id` field to Category and MenuItem, added helper functions
- `BaseClient/src/components/OnlineMenus/MenuContentEditor.tsx` - Use stable IDs for keys and when creating
- `BaseClient/src/components/OnlineMenus/CategoryEditor.tsx` - Use stable IDs for item keys
- `BaseClient/src/components/OnlineMenus/FullMenuEditor.tsx` - Ensure loaded contents have IDs
- `BaseClient/src/components/OnlineMenus/MetadataTab.tsx` - Updated import to use local MenuContents type
- `BaseClient/src/types/__tests__/menuTypes.test.ts` - Added tests for new helpers
- `BaseClient/src/components/OnlineMenus/__tests__/MenuContentEditor.categoryManagement.test.tsx` - Updated to expect id field
- `BaseClient/src/components/OnlineMenus/__tests__/MenuContentEditor.menuItems.test.tsx` - Updated to expect id field

## Success Criteria

- [x] Category name input retains focus when typing
- [x] Item name input retains focus when typing
- [x] Categories persist after save and reload (IDs ensure stable keys)
- [x] Unit tests pass (520 tests, all passing)
- [x] Lint passes (0 errors, 1 warning about file length)
- [x] Build succeeds

## Changes Made

### 1. Added ID fields to types (`menuTypes.ts`)

Added optional `id?: string` field to both `Category` and `MenuItem` interfaces.

### 2. Added helper functions (`menuTypes.ts`)

```typescript
// Generate unique IDs using timestamp + counter
export function generateUniqueId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// Ensure all categories and items have IDs when loading from server
export function ensureMenuContentsHaveIds(contents: MenuContents | null | undefined): MenuContents {
  if (!contents) return { categories: [] };
  const categories = (contents.categories ?? []).map((category) => ({
    ...category,
    id: category.id ?? generateUniqueId('cat'),
    items: (category.items ?? []).map((item) => ({
      ...item,
      id: item.id ?? generateUniqueId('item'),
    })),
  }));
  return { ...contents, categories };
}
```

### 3. Updated component key props

Changed from using name as key to using id:
- `key={category.id ?? \`cat-${categoryIndex}\`}` in MenuContentEditor
- `key={item.id ?? \`item-${itemIndex}\`}` in CategoryEditor

### 4. Generate IDs when creating new items

Added `id: generateUniqueId('cat')` when creating new categories and `id: generateUniqueId('item')` when creating new menu items.

### 5. Ensure loaded contents have IDs

In FullMenuEditor, call `ensureMenuContentsHaveIds(item?.contents)` when loading existing menus.

## Test Results

```
Test Suites: 82 passed, 82 total
Tests:       520 passed, 520 total
```

Build: SUCCESS (1.86 MB bundle)
Lint: 0 errors, 1 warning (file length in test file)

## Notes

- The `id` field is optional and client-side only - it's used purely for React keys
- IDs are generated using timestamp + counter to ensure uniqueness within a session
- When loading from the server, any items without IDs will have IDs assigned automatically
- The fallback `cat-${index}` or `item-${index}` keys are only used if somehow id is undefined

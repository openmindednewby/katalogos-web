# Breadcrumb Navigation for Menu Editor

## Problem Statement
The FullMenuEditor modal needs breadcrumb navigation to show the user their current location within the modal. Since this is a modal (not a route), breadcrumbs derive from modal-local state.

## Breadcrumb Trail
- Metadata tab: `Online Menus > [Menu Name] > Metadata`
- Content tab, no category: `Online Menus > [Menu Name] > Content`
- Content tab, category focused: `Online Menus > [Menu Name] > Content > [Category Name]`
- Preview tab: `Online Menus > [Menu Name] > Preview`

## Implementation Plan

### Phase 1: Foundation (test IDs already exist, add translations)
- [x] BreadcrumbTestIds already exists
- [x] testIds.ts already imports BreadcrumbTestIds
- [ ] Add translations to en.json under `onlineMenus.breadcrumb`

### Phase 2: State Layer
- [ ] Modify useMenuHandlers: add onCategoryFocus callback, handleCollapseAll
- [ ] Modify MenuContentEditor: add onCategoryFocus, collapseAllRef props

### Phase 3: Logic Hook
- [ ] Create useBreadcrumbState.ts hook
- [ ] Create tests for useBreadcrumbState

### Phase 4: UI Component
- [ ] Create BreadcrumbBar.tsx in Shared
- [ ] Create tests for BreadcrumbBar

### Phase 5: Wire into FullMenuEditor
- [ ] Add activeCategoryId state to useFullMenuEditorState
- [ ] Integrate useBreadcrumbState
- [ ] Render BreadcrumbBar in FullMenuEditor
- [ ] Pass props through to MenuContentEditor

## Files to Modify
- `src/localization/locales/en.json` - translations
- `src/components/OnlineMenus/hooks/useMenuHandlers.ts` - category focus
- `src/components/OnlineMenus/MenuContentEditor.tsx` - new props
- `src/components/OnlineMenus/hooks/useBreadcrumbState.ts` - NEW
- `src/components/Shared/BreadcrumbBar.tsx` - NEW
- `src/features/onlinemenus/hooks/useFullMenuEditorState.ts` - activeCategoryId
- `src/features/onlinemenus/components/FullMenuEditor.tsx` - render breadcrumb
- `src/features/onlinemenus/components/EditorTabContent.tsx` - pass new props

## Success Criteria
- Breadcrumb shows correct trail for each tab
- Clicking "Online Menus" closes the modal
- Clicking menu name navigates to Metadata
- Clicking "Content" when category focused clears focus
- Terminal crumb is non-interactive
- Phone truncation shows last 2 items with ellipsis
- All text uses FM()
- All interactive elements have testID + accessibilityLabel + accessibilityHint
- Unit tests pass
- Lint passes

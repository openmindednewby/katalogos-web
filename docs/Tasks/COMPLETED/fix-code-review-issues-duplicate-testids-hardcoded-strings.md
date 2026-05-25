# Fix Code Review Issues: Duplicate TestIDs, Hardcoded Strings, Missing Role

## Problem Statement
Code review found 4 issues:
1. **HIGH**: Duplicate testID `CATEGORY_NAME_INPUT` in CategoryEditor.tsx (inline + expanded input)
2. **HIGH**: Duplicate testID `MENU_ITEM_NAME_INPUT` in MenuItemEditor.tsx (inline + expanded input)
3. **MEDIUM**: Hardcoded English strings in NotificationBellButton.tsx accessibility props
4. **MEDIUM**: Missing `accessibilityRole="button"` in UploadStep.tsx

## Implementation Plan

### Issue 1 & 2: Duplicate testIDs
- Add `CATEGORY_NAME_FULL_INPUT` and `MENU_ITEM_NAME_FULL_INPUT` to `menuTestIds.ts`
- Update CategoryEditor.tsx line 131 to use new testID
- Update MenuItemEditor.tsx line 116 to use new testID
- Add matching entries to E2E `shared/testIds.ts`
- Update E2E page objects to use new testIDs for expanded inputs

### Issue 3: Hardcoded strings in NotificationBellButton.tsx
- Add translation keys to `en.json` under `notifications` section
- Replace hardcoded strings with FM() calls

### Issue 4: Missing accessibilityRole
- Add `accessibilityRole="button"` to TouchableOpacity in UploadStep.tsx

## Files to Modify
- `BaseClient/src/shared/testIds/menuTestIds.ts`
- `BaseClient/src/components/OnlineMenus/CategoryEditor.tsx`
- `BaseClient/src/components/OnlineMenus/MenuItemEditor.tsx`
- `BaseClient/src/components/Notifications/NotificationBellButton.tsx`
- `BaseClient/src/components/OnlineMenus/MenuImport/components/UploadStep.tsx`
- `BaseClient/src/localization/locales/en.json`
- `E2ETests/shared/testIds.ts`
- `E2ETests/pages/OnlineMenusPage.ts`

## Success Criteria
- No duplicate testIDs in the same component tree
- All user-facing strings use FM()
- All interactive elements have accessibilityRole
- Lint, unit tests, and build pass

## Results
All 4 issues fixed. Verification pipeline passed:
- `frontend-lint-fix`: OK
- `frontend-yagni`: OK
- `frontend-unit-tests`: OK
- `frontend-prod-build`: OK

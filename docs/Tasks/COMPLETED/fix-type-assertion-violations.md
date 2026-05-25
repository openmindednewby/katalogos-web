# Fix All Type Assertion Violations

## Status: COMPLETED

## Problem Statement

The ESLint rule `@typescript-eslint/consistent-type-assertions` with `assertionStyle: 'never'` has been enabled. There were **134 violations** initially, which were reduced during earlier work. This session completed fixing the remaining **45 violations**.

Type assertions (`as` keyword) are a code smell that bypasses TypeScript's type checking. They were replaced with:
- Proper generic types on functions
- Type guards for runtime checks
- Correct function return types
- Variable type annotations
- Destructuring patterns

## Implementation Approach

### Key Patterns Used

1. **Type Guards**: Created `isXxx` functions to safely narrow types
   ```typescript
   function isErrorWithMessage(value: unknown): value is ErrorWithMessage {
     return typeof value === 'object' && isValueDefined(value) && 'message' in value;
   }
   ```

2. **Variable Type Annotations**: Replaced `value as Type` with `const typed: Type = value`
   ```typescript
   // Before:
   const data = listQuery.data as { menus?: TenantMenusDto[] };
   // After:
   const data: MenuListData | undefined = isMenuListData(listQuery.data) ? listQuery.data : undefined;
   ```

3. **Destructuring**: For hooks like `useTranslation()`
   ```typescript
   // Before:
   const translation = useTranslation() as unknown as TranslationHook;
   const t = translation.t;
   // After:
   const { t } = useTranslation();
   ```

4. **Explicit Return Type Annotations**: For function results
   ```typescript
   // Before:
   type: uiToApiType(q.type) as ApiQuestionTypeT
   // After:
   const typeValue: ApiQuestionTypeT = uiToApiType(q.type);
   ```

## Files Modified (This Session)

### App Pages
- `app/(protected)/menus/index.tsx` - Added `isMenuListData` type guard
- `app/(protected)/notifications/index.tsx` - Added `isUseNotificationsResult` type guard
- `app/(protected)/quiz-active/index.tsx` - Used destructuring for useTranslation
- `app/(protected)/quiz-active/ThankYouOverlay.tsx` - Used variable annotation for require
- `app/(protected)/quiz-active/quizHelpers.ts` - Used variable annotation for API type
- `app/(protected)/quiz-answers/index.tsx` - Used destructuring for useTranslation
- `app/(protected)/quiz-templates/index.tsx` - Added `isErrorWithMessage` type guard
- `app/(protected)/tenants/index.tsx` - Added `isErrorWithMessage` type guard
- `app/(protected)/users/index.tsx` - Added `isTenantsData` type guard

### Public Pages
- `app/public/menu/[id].tsx` - Added `isErrorWithMessage` type guard
- `app/public/menus/index.tsx` - Added `isErrorWithMessage` type guard

### Components
- `src/components/Content/ContentPreview.tsx` - Removed unnecessary ImageStyle cast
- `src/components/OnlineMenus/FullMenuEditor.tsx` - Used destructuring for useTranslation
- `src/components/OnlineMenus/GlobalStylingControls.tsx` - Used destructuring for useTranslation
- `src/components/OnlineMenus/MenuContentEditor.tsx` - Used destructuring for useTranslation
- `src/components/OnlineMenus/MenuEditorModal.tsx` - Used destructuring for useTranslation
- `src/components/OnlineMenus/MenuLivePreview.tsx` - Used destructuring for useTranslation
- `src/components/OnlineMenus/ThemeSelector.tsx` - Used destructuring for useTranslation
- `src/components/QuestionerTemplates/Editor/QuestionEditor.tsx` - Used explicit return type
- `src/components/QuestionerTemplates/TemplateEditorModal.tsx` - Added `isQuestionerContents` type guard
- `src/components/QuestionerTemplates/TemplateForm.tsx` - Used variable annotation
- `src/components/Sidebar/MobileSidebarCollapsed.tsx` - Used explicit route typing
- `src/components/Sidebar/Sidebar.tsx` - Used explicit route typing

### Hooks
- `src/hooks/useMenuPageHandlers.ts` - Added `isErrorWithMessage` type guard
- `src/server/customHooks/useCompletedQuestionersWithUsers.ts` - Used variable annotation

## Success Criteria

- [x] `npm run lint` passes with 0 type assertion errors (`consistent-type-assertions`)
- [x] `npm run test` - All 312 tests pass
- [x] `npx expo export --platform web` - Build succeeds
- [x] No `as` keyword used except for `as const`

## Test Results

```
Test Suites: 50 passed, 50 total
Tests:       312 passed, 312 total
Time:        21.987 s
```

Build completed successfully - exported to `dist` folder.

## Remaining Lint Issues (Not Related to Type Assertions)

There are 6 pre-existing errors unrelated to this task:
- `notifications/index.tsx`: Boolean expression and unsafe call errors
- `ThankYouOverlay.tsx`: Unsafe assignment (require statement)
- `SafeNotificationBell.tsx`: Naming convention for NotificationContext
- `SafeRealTimeToastContainer.tsx`: Naming convention for NotificationContext
- `utils.ts`: Unnecessary conditional

These should be addressed in separate tasks.

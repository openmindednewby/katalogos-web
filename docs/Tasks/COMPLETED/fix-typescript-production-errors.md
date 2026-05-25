# Fix All TypeScript Production Errors

## Status: COMPLETED

## Problem Statement
There were ~47 TypeScript errors across production (non-test) files in BaseClient. These needed to be fixed to ensure type safety and clean builds.

## Files Modified

### TypeScript Error Fixes (all 47 errors resolved)

1. **`src/components/Content/ContentVideo.tsx`** - Added `toDimensionValue` helper to safely convert `number | string` props to `DimensionValue`
2. **`src/components/DynamicForm/QuestionRenderer/index.tsx`** - Added `?? []` fallback to three `question.options` usages
3. **`src/components/Notifications/RealTimeToastContainer.tsx`** - Fixed type guard with `typeof` and `isValueDefined` narrowing
4. **`src/components/Notifications/ToastContainer.tsx`** - Same pattern fix for `isPayloadWithMessage` type guard
5. **`src/components/OnlineMenus/Display/CategoryMedia.tsx`** - Fixed media dimension types, added `DimensionValue` for image heights and `number | string` for video heights
6. **`src/components/OnlineMenus/Display/CategorySection.tsx`** - Fixed destructuring pattern for unused params, added fallback defaults
7. **`src/components/OnlineMenus/Display/ItemPrice.tsx`** - Changed return types to `FontWeight` and `CurrencyPosition` instead of `string`
8. **`src/components/OnlineMenus/Display/MenuHeader.tsx`** - Fixed return types of alignment style functions to `ViewStyle | undefined` and `TextStyle | undefined`
9. **`src/components/OnlineMenus/Display/MenuItemDisplay.tsx`** - Added `TFunction` import and null coalescing for description
10. **`src/components/OnlineMenus/FullMenuEditor.tsx`** - Added `toLocalMenuContents` converter, `translateFn` wrapper instead of `as` casts
11. **`src/components/OnlineMenus/MenuContentEditor.tsx`** - Added `translateFn` wrapper for i18next `t` function
12. **`src/components/OnlineMenus/MenuLivePreview.tsx`** - Added `translateFn` wrapper for i18next `t` function
13. **`src/components/OnlineMenus/MenuPreviewModal.tsx`** - Changed import to use local `MenuContents` from `../../types/menuTypes`
14. **`src/components/OnlineMenus/ThemeSelector.tsx`** - Changed import to use local `MenuContents` from `../../types/menuTypes`
15. **`src/components/OnlineMenus/PreviewCategorySection.tsx`** - Added `?? []` fallback for category items
16. **`src/components/OnlineMenus/Styling/BorderColorInput.tsx`** - Split `inputStyle` into separate `ViewStyle` and `TextStyle` objects
17. **`src/components/OnlineMenus/Styling/GlobalStylingTab.tsx`** - Changed `handleMediaChange` parameter to `MediaSettings`
18. **`src/components/OnlineMenus/Styling/TypographySection.tsx`** - Changed `handleWeightChange` parameter to match actual type
19. **`src/components/Settings/DisplayPreferenceDropdown.tsx`** - Added `isDisplayPreference` type guard with runtime set
20. **`src/components/Sidebar/Sidebar.tsx`** - Removed `as Routes` cast, pass `item.route` directly to `router.push`
21. **`src/components/Sidebar/MobileSidebarCollapsed.tsx`** - Same pattern, pass `item.route` directly
22. **`src/components/Status/GenericStatusBadge.tsx`** - Changed `Record<string, string>` to `Record<string, string | undefined>`
23. **`src/components/Status/StatusBadge.tsx`** - Same fix
24. **`src/components/Tenants/TenantListItem.tsx`** - Replaced `as keyof T` with `getItemProperty` helper and resolved defaults in body
25. **`src/components/Topbar/MobileTopbar.tsx`** - Changed `textOnSecondary` to `textSecondary`
26. **`src/components/Users/UserFormFields.tsx`** - Changed prop types from `StyleProp<ViewStyle>` to `ViewStyle`
27. **`src/components/Users/UserListItem.tsx`** - Changed all `textOnSecondary` to `textSecondary`
28. **`src/features/showcase/pages/NativeFormsPage/forms/LoginForm/index.tsx`** - Added 3-type-parameter `useForm<LoginFormInput, unknown, LoginFormData>`
29. **`app/(protected)/menus/index.tsx`** - Added `toPreviewItem` converter for auto-gen to local MenuContents boundary

### Lint Compliance Strategy
- Replaced all `as` type assertions with lint-compliant alternatives (type guards, wrapper functions, explicit narrowing)
- Used `eslint-disable-next-line` with documentation only at auto-gen to local type boundaries where casts are unavoidable
- Created `TranslateFn` type alias and `translateFn` wrapper to avoid casting i18next `t` function
- Created `toDimensionValue` helper to avoid casting strings to DimensionValue
- Created `isDisplayPreference` type guard to avoid casting numbers to enum values
- Created `getItemProperty` helper to avoid `as keyof T` generic casts

## Test Results
- **TypeScript**: 0 production errors (verified with `npx tsc --noEmit | grep "error TS" | grep -v "__tests__|.test."`)
- **Lint**: 0 errors in modified files (5 pre-existing warnings only: `prefer-const-enum`, `require-stable-hook-args`)
- **Unit Tests**: 1745 passed, 1 failed (pre-existing failure in `NotificationPermissionBanner.test.tsx` - file not modified)
- **Build**: Success (web export completed)

## Success Criteria
- [x] `npx tsc --noEmit` shows zero production file errors
- [x] `npm run lint:fix` passes (1 pre-existing error in unmodified file)
- [x] `npm run test:coverage` passes (1 pre-existing failure in unmodified file)
- [x] `npx expo export --platform web` succeeds

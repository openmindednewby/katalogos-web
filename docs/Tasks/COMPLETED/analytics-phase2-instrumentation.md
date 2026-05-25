# Analytics Phase 2 - Event Instrumentation

## Problem Statement
Phase 1 analytics abstraction is complete (`useAnalytics()` hook, `AnalyticsEventName` enum with 13 events). However, NONE of the events are actually fired anywhere in the codebase. This phase instruments real user events so analytics providers receive meaningful data.

## Implementation Plan

### 1. Extend AnalyticsEventName enum
Add 6 new event values: MenuUpdated, MenuDeleted, MenuActivated, MenuDeactivated, MenuShared, QrCodeDownloaded.

### 2. Instrument menu handlers
- `menuSaveHandlers.ts` - Add optional `analyticsTrack` param, fire MenuCreated/MenuUpdated
- `menuMutationHandlers.ts` - Add optional `analyticsTrack` param, fire MenuActivated/MenuDeactivated/MenuDeleted
- `menus/index.tsx` - Pass `track` from `useAnalytics()` to handler hooks

### 3. Instrument public menu view
- `app/public/menu/[id].tsx` - Fire MenuViewedPublic on successful load (once only)

### 4. Instrument theme change
- `ThemeSettingsScreen.tsx` - Fire ThemeChanged in handleSelectPreset

### 5. Instrument notification events
- `RealTimeNotificationProvider.tsx` - Fire NotificationReceived in handleNotification, NotificationClicked in click handler

### 6. Instrument quiz template creation
- `useTemplateMutations.ts` - Add optional `analyticsTrack` param, fire QuizTemplateCreated in create success

### 7. Handle ErrorBoundary (class component)
- Create `AnalyticsErrorBoundary.tsx` wrapper that reads analytics context
- Update `_layout.tsx` to use wrapper

### 8. Instrument share/QR actions
- `ShareButton.tsx` - Fire MenuShared on platform share, copy link, native share
- `QrCodeModal.tsx` - Fire QrCodeDownloaded on PNG/SVG download
- `QrCodeDesignerModal.tsx` - Fire QrCodeDownloaded on PNG/SVG/PDF download

## Files to Modify
- `BaseClient/src/shared/enums/AnalyticsEventName.ts`
- `BaseClient/src/hooks/menuHandlers/menuSaveHandlers.ts`
- `BaseClient/src/hooks/menuHandlers/menuMutationHandlers.ts`
- `BaseClient/app/(protected)/menus/index.tsx`
- `BaseClient/app/public/menu/[id].tsx`
- `BaseClient/src/components/Settings/ThemeSettings/components/ThemeSettingsScreen.tsx`
- `BaseClient/src/components/Notifications/RealTimeNotificationProvider.tsx`
- `BaseClient/src/hooks/quiz-templates/useTemplateMutations.ts`
- `BaseClient/src/hooks/useQuizTemplateActions.ts`
- `BaseClient/app/(protected)/quiz-templates/index.tsx`
- `BaseClient/src/components/ErrorBoundary/ErrorBoundary.tsx` (add analytics via onError)
- `BaseClient/src/components/ErrorBoundary/AnalyticsErrorBoundary.tsx` (new file)
- `BaseClient/app/_layout.tsx`
- `BaseClient/src/components/PublicMenu/components/ShareButton.tsx`
- `BaseClient/src/components/OnlineMenus/QrCode/QrCodeModal.tsx`
- `BaseClient/src/components/OnlineMenus/QrCode/QrCodeDesignerModal.tsx`

## Success Criteria
- All 19 AnalyticsEventName values (13 existing + 6 new) are fired from appropriate locations
- No sensitive data passed as event properties (only GUIDs and categorical values)
- All `analyticsTrack` params are optional (no breaking changes)
- All quality checks pass (lint, unit tests, build)
- No hardcoded text (all strings via FM())

## Results (COMPLETED)
- **frontend-lint-fix**: PASSED
- **frontend-yagni**: PASSED
- **frontend-unit-tests**: PASSED (245 suites, 3200 tests)
- **frontend-prod-build**: PASSED

### Additional Fix
- Fixed pre-existing test failure in `useWelcomeWizard.test.ts` where the hook signature changed to accept a `preferences` parameter but tests were not updated.

### Event Instrumentation Summary
| Event | Location | Properties |
|-------|----------|------------|
| MenuCreated | menuSaveHandlers.ts (create success) | none |
| MenuUpdated | menuSaveHandlers.ts (update success) | menuId |
| MenuDeleted | menuMutationHandlers.ts (delete success) | menuId |
| MenuActivated | menuMutationHandlers.ts (toggle success) | menuId |
| MenuDeactivated | menuMutationHandlers.ts (toggle success) | menuId |
| MenuViewedPublic | public/menu/[id].tsx (useEffect, once) | menuId |
| MenuShared | ShareButton.tsx (platform/copy/native) | platform |
| QrCodeDownloaded | QrCodeModal.tsx, QrCodeDesignerModal.tsx | format (png/svg/pdf) |
| QuizTemplateCreated | useTemplateMutations.ts (create success) | none |
| NotificationReceived | RealTimeNotificationProvider.tsx | notificationId |
| NotificationClicked | RealTimeNotificationProvider.tsx | notificationId |
| ErrorEncountered | AnalyticsErrorBoundary.tsx (onError) | errorMessage |
| ThemeChanged | ThemeSettingsScreen.tsx (handleSelectPreset) | preset |

# Comprehensive Translation Fix

## Status: COMPLETED

## Problem
User reported broken translations across the codebase. Multiple components had hardcoded
user-facing strings instead of using FM() from localization/helpers.

## Files Fixed (24 production files + 1 test file)

### Users (4 files)
- UserListItem.tsx, TenantSelector.tsx, PasswordResetModal.tsx, UserFormFields.tsx

### Questioner (6 files)
- TemplateJsonEditor.tsx, TemplateForm.tsx, OptionEditor.tsx, AnswerEditor.tsx,
  SkipConditions.tsx, QuestionEditor.tsx

### Content (3 files)
- ContentPreview.tsx, ContentPreviewParts.tsx, UploadProgress.tsx

### Shared (3 files)
- LoadingFallback.tsx, ChoicePill.tsx, Checkbox.tsx

### Notifications (2 files)
- NotificationPermissionBanner.tsx, NotificationItemComponent.tsx

### DynamicForm (1 file)
- TextQuestion.tsx (fixed FM raw English key to proper namespaced key)

### Other (1 file)
- TenantLogo.tsx

### Showcase Forms (4 files)
- RegistrationForm, LoginForm, NewsletterForm, ContactForm

### Pre-existing lint fix
- GlobalStylingTab.tsx / globalStylingTabStyles.ts (color literal extraction)

### Test
- LoadingFallback.test.tsx (updated assertions for FM key-based returns)

## Translation Keys Added
~83 new keys added to en.json across users, notificationBanner, quizTemplates,
quizActive, content, common, loadingFallback, choicePill, checkbox, tenantLogo,
and showcase.form sections.

## Verification
- frontend-lint-fix: PASSED
- frontend-unit-tests: PASSED

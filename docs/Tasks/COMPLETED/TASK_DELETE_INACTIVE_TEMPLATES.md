# Task: Delete Inactive Templates Feature

## Overview
Integrate the `DELETE /questionerTemplates/delete/inactive` API endpoint with the frontend. This endpoint returns `{ deletedCount: number }` and should display a notification showing how many templates were deleted.

## Requirements

### 1. Localization Helper Functions
Create utility functions for formatting localized messages:

**Location:** `src/localization/helpers.ts`

```typescript
export function FM(id: LocaleId, parameterOne?: string, parameterTwo?: string): string
export function FD(date?: Date | null, formatDateOptions?: FormatDateOptions): string
```

- `FM` = Format Message with parameters `{p1}`, `{p2}`
- `FD` = Format Date with optional formatting options
- Parameters must use `{p1}`, `{p2}` convention (not `{{param}}`)

### 2. ESLint Rule for Localization Parameters
Add/update linting to enforce `{p1}`, `{p2}` parameter naming in translation strings.

**Affected files:**
- `.eslintrc.js` or equivalent
- `en.json` - update any existing parameters to use `{p1}`, `{p2}` format

### 3. Centralized Notification Message Manager
Create a notification manager that maps API responses to localized messages.

**Location:** `src/lib/apiNotifications.ts`

**Features:**
- Map by: `path`, `method`, `isSuccess/isError`
- Support passing response data to message templates
- Example: For `DELETE /questionerTemplates/delete/inactive`:
  - Success with count > 0: "Deleted {p1} inactive templates"
  - Success with count = 0: "No inactive templates found"
  - Error: Standard error message

### 4. UI Implementation

**Location:** `app/(protected)/quiz-templates/index.tsx`

**Add:**
- "Delete Inactive" button in the page header/actions area
- Confirmation dialog before executing the delete
- Call `useQuestionerWebQuestionerTemplatesDeleteInactive` mutation
- Display appropriate notification based on response

**Button behavior:**
- Shows confirmation dialog: "Are you sure you want to delete all inactive templates?"
- On confirm: calls API
- On success: shows notification with count
- On error: shows error notification
- Refresh the template list after successful deletion

### 5. Translation Strings

**Location:** `src/localization/locales/en.json`

Add under `quizTemplates`:
```json
{
  "deleteInactive": "Delete Inactive",
  "confirmDeleteInactive": "Are you sure you want to delete all inactive templates?",
  "messages": {
    "deleteInactiveSuccess": "Deleted {p1} inactive templates",
    "deleteInactiveNone": "No inactive templates found"
  }
}
```

### 6. Test IDs

**Location:** `src/shared/testIds.ts`

Add:
```typescript
DELETE_INACTIVE_BUTTON: 'delete-inactive-button',
CONFIRM_DIALOG: 'confirm-dialog',
CONFIRM_BUTTON: 'confirm-button',
CANCEL_CONFIRM_BUTTON: 'cancel-confirm-button',
```

### 7. Unit Tests (TDD)

**Create tests BEFORE implementation:**

#### 7.1 Localization Helpers Tests
**File:** `src/localization/__tests__/helpers.test.ts`

Test cases:
- `FM` returns formatted message with no parameters
- `FM` returns formatted message with one parameter
- `FM` returns formatted message with two parameters
- `FD` formats date correctly
- `FD` returns empty string for null/undefined date

#### 7.2 API Notifications Tests
**File:** `src/lib/__tests__/apiNotifications.test.ts`

Test cases:
- Returns correct message for DELETE inactive success with count > 0
- Returns correct message for DELETE inactive success with count = 0
- Returns error message on failure
- Returns default message for unmapped endpoints

#### 7.3 Delete Inactive Button Component Test
**File:** `src/components/QuestionerTemplates/__tests__/DeleteInactiveButton.test.tsx`

Test cases:
- Renders delete inactive button
- Opens confirmation dialog on click
- Closes dialog on cancel
- Calls mutation on confirm
- Shows success notification with count
- Shows "no templates found" message when count is 0

### 8. Playwright E2E Tests

**File:** `E2ETests/tests/questioner/templates/delete-inactive-templates.spec.ts`

#### Test Setup:
- Create multiple inactive templates before tests
- Ensure at least one active template exists (should NOT be deleted)

#### Test Cases:

**Test 1: Delete inactive templates shows correct count**
- Create 3 inactive templates
- Click "Delete Inactive" button
- Confirm the dialog
- Verify notification shows "Deleted 3 inactive templates"
- Verify inactive templates are removed from list
- Verify active templates remain

**Test 2: Delete inactive with no inactive templates**
- Ensure all templates are active
- Click "Delete Inactive" button
- Confirm the dialog
- Verify notification shows "No inactive templates found"

**Test 3: Cancel delete inactive**
- Click "Delete Inactive" button
- Click cancel in confirmation dialog
- Verify no API call is made
- Verify all templates remain

#### Page Object Updates:
**File:** `E2ETests/pages/QuizTemplatesPage.ts`

Add methods:
```typescript
async clickDeleteInactive(): Promise<void>
async confirmDeleteInactive(): Promise<number> // returns deletedCount
async cancelDeleteInactive(): Promise<void>
```

## Implementation Order (TDD Approach) - COMPLETED

1. **Phase 1: Foundation**
   - [x] Write unit tests for localization helpers (RED)
   - [x] Implement localization helpers (GREEN)
   - [x] Write unit tests for API notifications (RED)
   - [x] Implement API notifications manager (GREEN)

2. **Phase 2: UI Components**
   - [x] Add translation strings to en.json
   - [x] Add test IDs to testIds.ts
   - [x] Write unit tests for ConfirmDialog (RED)
   - [x] Implement confirmation dialog component (GREEN)
   - [x] Write unit tests for DeleteInactiveButton (RED)
   - [x] Implement delete inactive button (GREEN)

3. **Phase 3: Integration**
   - [x] Integrate button into quiz-templates page
   - [x] Wire up mutation and notifications

4. **Phase 4: E2E Tests**
   - [x] Update QuizTemplatesPage page object
   - [x] Write E2E test specs

## API Reference

**Endpoint:** `DELETE /questionerTemplates/delete/inactive`

**Response:**
```typescript
interface DeleteInactiveQuestionerTemplatesResponse {
  deletedCount?: number;
}
```

**Auto-generated hook:** `useQuestionerWebQuestionerTemplatesDeleteInactive`

## Files to Create/Modify

### New Files:
- `src/localization/helpers.ts`
- `src/localization/__tests__/helpers.test.ts`
- `src/lib/apiNotifications.ts`
- `src/lib/__tests__/apiNotifications.test.ts`
- `src/components/QuestionerTemplates/DeleteInactiveButton.tsx`
- `src/components/QuestionerTemplates/__tests__/DeleteInactiveButton.test.tsx`
- `src/components/Shared/ConfirmDialog.tsx`
- `src/components/Shared/__tests__/ConfirmDialog.test.tsx`
- `E2ETests/tests/questioner/templates/delete-inactive-templates.spec.ts`

### Modified Files:
- `src/localization/locales/en.json`
- `src/shared/testIds.ts`
- `app/(protected)/quiz-templates/index.tsx`
- `E2ETests/pages/QuizTemplatesPage.ts`

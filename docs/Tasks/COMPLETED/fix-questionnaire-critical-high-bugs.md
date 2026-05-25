# Fix Critical and High Severity Bugs - Questionnaire Feature

## Status: COMPLETED

## Problem Statement
Eight bugs (BUG-QUIZ-001 through BUG-QUIZ-008) have been identified in the quiz/questionnaire feature. These include stale closure race conditions, form state resets, setState during render, incomplete validation, double navigation conflicts, JSON editor feedback loops, wrong CSV columns, and unmemoized callbacks.

## Implementation Plan

### BUG-QUIZ-001 + BUG-QUIZ-008: Stale closure + unmemoized callbacks in useQuizForm
- Files: `src/hooks/quiz/useQuizForm.ts`
- Added refs for `s.form`, `s.currentPage`, `data`, `t`
- Wrapped `handleSubmit`, `handleNext`, `handleBack` in `useCallback` with refs
- Extracted `useSubmit` and `useReset` helper hooks with typed interface params

### BUG-QUIZ-002: Form state reset when i18n `t` changes
- File: `src/hooks/quiz/useQuizFormState.ts`
- Removed `t` from useEffect deps, used `useRef(t)` pattern (tRef.current = t)

### BUG-QUIZ-003: setState during render
- File: `src/components/QuestionerTemplates/TemplateEditorModal.tsx`
- Moved `syncStateFromItem` into a `useEffect` with `[item, visible]` deps
- Added `prevItemIdRef` to prevent redundant re-syncs

### BUG-QUIZ-004: Validation only checks last page
- File: `src/hooks/quiz/useQuizFormState.ts`
- Added `validateAllPages()` function that iterates ALL questions across all pages
- Updated `handleSubmit` in useQuizForm to call `s.validateAllPages()`

### BUG-QUIZ-005: Double navigation conflict
- File: `src/hooks/quiz/useQuizFormState.ts`
- Removed `computeNavTarget` and auto-advance logic from `updateAnswer`
- Skip-based navigation now handled solely by the useEffect checking `pageHasVisibleQuestion`

### BUG-QUIZ-006: JSON editor feedback loop
- File: `src/components/QuestionerTemplates/TemplateEditorModal.tsx`
- Added `justSwitchedToJsonRef` and `prevActiveTabRef`
- Only syncs contents to jsonText when first switching to JSON tab

### BUG-QUIZ-007: CSV export wrong ID column
- File: `src/components/Buttons/ExportButtons/generateCsvExport.ts`
- Changed first column from `quoteCsv(String(respondentId))` to `quoteCsv(String(record.externalId ?? ''))`

## Files Modified
- `src/hooks/quiz/useQuizForm.ts` - Major refactor with refs and extracted helpers
- `src/hooks/quiz/useQuizFormState.ts` - Major refactor with extracted helpers
- `src/components/QuestionerTemplates/TemplateEditorModal.tsx` - useEffect sync, feedback loop fix
- `src/components/Buttons/ExportButtons/generateCsvExport.ts` - CSV ID column fix

## Tests Added/Updated
- `src/hooks/quiz/__tests__/useQuizForm.test.tsx` (NEW) - BUG-001/008, BUG-004, error handling, resetQuiz
- `src/hooks/quiz/__tests__/useQuizFormState.test.tsx` (NEW) - BUG-002, BUG-004, BUG-005, form initialization
- `src/components/QuestionerTemplates/__tests__/TemplateEditorModal.test.tsx` (NEW) - BUG-003, BUG-006
- `src/components/Buttons/ExportButtons/__tests__/generateCsvExport.test.ts` (UPDATED) - BUG-007

## Verification Results
- `npm run lint:fix` - PASSED (0 errors, 0 warnings)
- `npm run yagni` - PASSED (no new unused exports)
- `npm run test:coverage` - PASSED (150 suites, 1864 tests)
- `npx expo export --platform web` - PASSED (build succeeded)

## Success Criteria - ALL MET
- [x] All 8 bugs fixed
- [x] Unit tests added/updated for each fix
- [x] `npm run lint:fix` passes
- [x] `npm run test:coverage` passes
- [x] `npx expo export --platform web` succeeds

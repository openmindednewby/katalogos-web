# Task: Unit Tests for Settings Screens

## Problem Statement
The 3 new settings screens (Profile, Security, Preferences) and their sub-components lack unit tests. Tests should focus on logic, not rendering, per project testing philosophy.

## Components to Test

### 1. ChangePasswordForm (`SecuritySettings/components/ChangePasswordForm.tsx`)
- `validatePasswordForm` pure function: required fields, min length, password mismatch
- `handleSubmit` callback: validation gating, mutation call shape, success/error notifications

### 2. SettingsDropdown (`PreferencesSettings/components/SettingsDropdown.tsx`)
- `selectedLabel` computation: finds matching option label, falls back to raw value
- `handleSelect` callback: calls onChange with correct value
- `keyExtractor`: returns item.value

### 3. ProfileSettingsScreen (`ProfileSettings/components/ProfileSettingsScreen.tsx`)
- `handleSave` callback: mutation call with correct data shape, success/error notifications, query invalidation
- `isSaving` / `saveLabel` derived state

### 4. SessionItem (`SecuritySettings/components/SessionItem.tsx`)
- `formatTimestamp` pure function: undefined input, valid epoch
- `handleRevoke` callback: only calls onRevoke when session.id is defined

## Files to Create
- `SecuritySettings/components/ChangePasswordForm.test.ts`
- `PreferencesSettings/components/SettingsDropdown.test.ts`
- `ProfileSettings/components/ProfileSettingsScreen.test.ts`
- `SecuritySettings/components/SessionItem.test.ts`

## Success Criteria
- All tests pass via `frontend-unit-tests`
- No lint errors via `frontend-lint`
- Tests focus on logic, not rendering
- Test files co-located with source files

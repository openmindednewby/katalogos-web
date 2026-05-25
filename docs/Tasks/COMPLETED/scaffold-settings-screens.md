# Scaffold User Profile, Security, and Preferences Settings Screens

## Status: COMPLETED

## Problem Statement
Build three new settings screens (Profile, Security, Preferences) following the established PrivacySettings pattern. These are static layouts - API hooks will be wired later after backend endpoints are built.

## Changes Made

### Files Created (11 files)
1. `src/shared/testIds/profileTestIds.ts` - Test IDs for all three screens (profile, security, preferences)
2. `src/components/Settings/ProfileSettings/index.ts` - Barrel export
3. `src/components/Settings/ProfileSettings/constants.ts` - Style constants
4. `src/components/Settings/ProfileSettings/components/ProfileSettingsScreen.tsx` - Profile screen with editable name/email/phone fields and read-only role/tenant badges
5. `src/components/Settings/SecuritySettings/index.ts` - Barrel export
6. `src/components/Settings/SecuritySettings/constants.ts` - Style constants + MIN_PASSWORD_LENGTH
7. `src/components/Settings/SecuritySettings/components/SecuritySettingsScreen.tsx` - Security screen combining password form + sessions placeholder
8. `src/components/Settings/SecuritySettings/components/ChangePasswordForm.tsx` - Password change form with client-side validation
9. `src/components/Settings/PreferencesSettings/index.ts` - Barrel export
10. `src/components/Settings/PreferencesSettings/constants.ts` - Style constants + LANGUAGES/TIMEZONES/DATE_FORMATS data
11. `src/components/Settings/PreferencesSettings/components/PreferencesSettingsScreen.tsx` - Preferences screen with dropdown selectors
12. `src/components/Settings/PreferencesSettings/components/SettingsDropdown.tsx` - Reusable dropdown component for string options

### Files Modified (4 files)
1. `src/navigation/routes.ts` - Added PROFILE_SETTINGS, SECURITY_SETTINGS, PREFERENCES_SETTINGS routes
2. `src/localization/locales/en.json` - Added settings.profile, settings.security, settings.preferences translation keys
3. `src/shared/testIds.ts` - Added ProfileTestIds import and spread
4. `src/components/Settings/index.ts` - Added barrel exports for all three new screens

## Quality Checks
- **Lint**: PASS (no errors from new files; all 10 errors and 107 warnings are pre-existing)
- **YAGNI**: PASS (no unused exports)
- **Unit Tests**: PASS (2464 tests pass; 6 pre-existing suite failures in user hooks)
- **Prod Build**: PASS

## Design Decisions
- Used `FM()` from `localization/helpers` for all user-facing text (not `t()` from `useTranslation()`)
- All translation keys added to `en.json` (not `en/` subdirectory)
- All interactive elements have `testID`, `accessibilityLabel`, and `accessibilityHint`
- Used `useAuth()` to display current user data on profile screen
- Form submissions log to console (no API calls yet)
- Created reusable `SettingsDropdown` component for the preferences screen
- Password validation enforces minimum 8 characters and matching confirmation
- Each component under 200 lines; each file under 300 lines
- No hardcoded colors; all from `useTheme()` tokens
- No magic numbers; all extracted to named constants

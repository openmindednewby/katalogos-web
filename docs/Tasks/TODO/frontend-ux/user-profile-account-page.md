# User Profile & Account Settings Page

> **Status**: TODO
> **Priority**: P3 - User Experience
> **Estimated Scope**: Medium (Frontend + Backend)
> **Estimated Effort**: 1 week

---

## 1. Problem

No user profile or account management page. Users cannot:
- Change their password
- Update their email or display name
- View their role and tenant membership
- Manage active sessions
- Set preferences (language, timezone)

Currently only theme toggle and notification preferences exist in settings.

---

## 2. Required Screens

### 2.1 Profile Page (`/settings/profile`)

| Section | Fields | Editable |
|---------|--------|----------|
| Avatar | Profile picture (upload via ContentService) | Yes |
| Display Name | First name, last name | Yes |
| Email | Email address | Yes (with verification) |
| Phone | Phone number | Yes |
| Role | Current role (admin, manager, etc.) | No (display only) |
| Tenant | Current tenant name | No (display only) |

### 2.2 Security Page (`/settings/security`)

| Feature | Description |
|---------|-------------|
| Change Password | Current + new password form |
| Two-Factor Auth | Enable/disable OTP (already have OTP infrastructure) |
| Active Sessions | List active sessions with device info, revoke option |
| Login History | Recent login attempts with IP, device, timestamp |

### 2.3 Preferences Page (`/settings/preferences`)

| Preference | Options |
|-----------|---------|
| Language | English (+ future languages from i18n) |
| Timezone | Dropdown of IANA timezones |
| Date Format | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD |
| Theme | Light / Dark / System (enhance existing) |

---

## 3. Backend Requirements

### 3.1 IdentityService Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/me` | GET | Get current user profile |
| `/api/users/me` | PUT | Update profile (name, email, phone) |
| `/api/users/me/avatar` | PUT | Upload/update avatar |
| `/api/users/me/password` | PUT | Change password |
| `/api/users/me/sessions` | GET | List active sessions |
| `/api/users/me/sessions/{id}` | DELETE | Revoke a session |
| `/api/users/me/preferences` | GET/PUT | Get/update preferences |

### 3.2 Keycloak Integration

- Password change: Call Keycloak Admin API to update password
- Email change: May require Keycloak email verification flow
- Sessions: Query Keycloak user sessions API

---

## 4. Implementation Steps

### Phase 1: Profile Page (3-4 days)
1. Create `/settings/profile` route
2. Add profile view with user data from IdentityService
3. Add edit form with validation (Zod + React Hook Form)
4. Add avatar upload via ContentService
5. Add profile API endpoints to IdentityService

### Phase 2: Security Page (2-3 days)
1. Create `/settings/security` route
2. Add password change form
3. Add active sessions list
4. Add session revocation
5. Integrate with Keycloak Admin API

### Phase 3: Preferences (1-2 days)
1. Create `/settings/preferences` route
2. Add language, timezone, date format dropdowns
3. Enhance theme toggle to include "System" option
4. Store preferences in IdentityService database
5. Apply preferences globally (dates, times, language)

---

## 5. Verification

- [ ] User can view and edit their profile
- [ ] Password change works and requires current password
- [ ] Avatar upload and display works
- [ ] Active sessions visible with revoke option
- [ ] Preferences persist across sessions
- [ ] System theme option follows OS preference
- [ ] All form inputs have validation and i18n labels

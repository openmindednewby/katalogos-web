# Team Management Frontend UI

**Status**: COMPLETED
**Date**: 2026-03-21

## Problem Statement
Implement the Team Management frontend UI for the existing backend API endpoints in IdentityService. The UI allows tenant admins to manage team members, invite new members, change roles, and revoke invitations.

## Backend API Endpoints
- POST /api/v1/team/invite (Admin only) - Invite team member
- GET /api/v1/team/members (Admin + User) - List team members
- PUT /api/v1/team/members/{Id}/role (Admin only) - Update member role
- DELETE /api/v1/team/members/{Id} (Admin only) - Remove member
- GET /api/v1/team/invitations (Admin + User) - List invitations
- POST /api/v1/team/invitations/{Token}/accept (Authenticated) - Accept invitation
- DELETE /api/v1/team/invitations/{Id} (Admin only) - Revoke invitation

## Implementation Summary

### Custom API Hooks Created
- `src/server/customHooks/team/teamTypes.ts` - TypeScript interfaces for API DTOs
- `src/server/customHooks/team/useListTeamMembers.ts` - GET team members query
- `src/server/customHooks/team/useListTeamInvitations.ts` - GET pending invitations query
- `src/server/customHooks/team/useInviteTeamMember.ts` - POST invite mutation
- `src/server/customHooks/team/useUpdateMemberRole.ts` - PUT role change mutation
- `src/server/customHooks/team/useRemoveMember.ts` - DELETE member mutation
- `src/server/customHooks/team/useRevokeInvitation.ts` - DELETE invitation mutation
- `src/server/customHooks/team/useAcceptInvitation.ts` - POST accept invitation mutation

### UI Components Created
- `src/components/Settings/TeamManagement/components/TeamManagementScreen.tsx` - Main screen
- `src/components/Settings/TeamManagement/components/TeamMemberRow.tsx` - Member row with role badge
- `src/components/Settings/TeamManagement/components/PendingInvitationRow.tsx` - Invitation row with status
- `src/components/Settings/TeamManagement/components/InviteTeamMemberModal.tsx` - Invite modal with email + role
- `src/components/Settings/TeamManagement/components/TeamConfirmDialogs.tsx` - Extracted confirm dialogs
- `src/components/Settings/TeamManagement/hooks/useTeamActions.ts` - State management hook
- `src/components/Settings/TeamManagement/hooks/useTeamMutations.ts` - Mutation wrapper hook
- `src/components/Settings/TeamManagement/constants.ts` - Shared style constants
- `src/components/Settings/TeamManagement/index.ts` - Barrel export
- `app/(protected)/settings/team.tsx` - Route page
- `app/(protected)/team/accept/[token].tsx` - Accept invitation page

### Navigation & Routing
- Added `TEAM_SETTINGS` and `TEAM_ACCEPT_INVITATION` to `src/navigation/routes.ts`
- Added breadcrumb entry in `src/navigation/breadcrumbMap.ts`
- Added sidebar item `nav-team` in `packages/identity-module/src/index.ts` (admin only, order 82)
- Added sidebar group mapping in `src/components/Sidebar/utils/groupSidebarItems.ts`
- Added route preloader entries in `src/config/routePreloader.ts`
- Added Team card to AccountSettingsHub screen

### Translations
- Added 60+ translation keys under `settings.team.*` in `src/localization/locales/en.json`
- Added hub card keys under `settings.hub.teamCard*`
- Added `menu.team` for sidebar label

### Test IDs & Enums
- `src/shared/testIds/teamTestIds.ts` - 26 test IDs
- `src/shared/testIds/accountHubTestIds.ts` - Added ACCOUNT_HUB_TEAM_CARD
- `src/shared/enums/TeamRole.ts` - TeamRole const enum + helper functions

### Unit Tests
- `src/server/customHooks/team/useListTeamMembers.test.ts` - Query hook tests
- `src/server/customHooks/team/useInviteTeamMember.test.ts` - Mutation hook tests
- `src/components/Settings/TeamManagement/hooks/useTeamActions.test.ts` - Actions hook tests
- `src/shared/enums/TeamRole.test.ts` - Enum helper tests

### Pre-existing Issues Fixed
- `src/server/customHooks/useMenuSchedule.test.ts` - Fixed import from deprecated `@testing-library/react-hooks` to `@testing-library/react-native`, fixed `onError` assertion
- `src/components/OnlineMenus/utils/scheduleUtils.ts` - Fixed unsafe enum comparisons
- `src/components/OnlineMenus/utils/seasonalUtils.ts` - Moved constants before functions (enforce-function-style)
- `src/components/OnlineMenus/components/ScheduleEditor.tsx` - Fixed import formatting to stay under max-lines

## Quality Gate Results
- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED (314 suites, 3908 tests)
- frontend-prod-build: PASSED

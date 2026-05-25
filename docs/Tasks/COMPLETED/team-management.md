# Team Management (Phase 1.6, P2)

## Problem Statement

Tenants need the ability to invite team members, assign roles (Owner, Manager, Staff), and manage their team within the platform. This is a core identity feature that enables collaborative use of the SaaS platform.

## Implementation Summary

### Domain Layer (IdentityService.Core) - 5 new files

| File | Purpose |
|------|---------|
| `Entities/TeamMember.cs` | BaseTenantEntity with Role, InvitedByUserId, JoinedAt. Factory method `Create()`, `UpdateRole()` with last-owner protection |
| `Entities/TeamInvitation.cs` | BaseTenantEntity with Email, Role, Token, Status, InvitedByUserId, InvitedAt, AcceptedAt, ExpiresAt. Token-based acceptance with `Accept()`, `Revoke()`, `IsAcceptable()` |
| `Enums/TeamRole.cs` | Owner=0, Manager=1, Staff=2 |
| `Enums/InvitationStatus.cs` | Pending=0, Accepted=1, Revoked=2 |
| `Interfaces/ITeamDbContext.cs` | DbSet<TeamMember>, DbSet<TeamInvitation>, DbSet<Tenant>, SaveChangesAsync |

### Application Layer (IdentityService.UseCases) - 14 new files

**Commands (10 files):**
- `InviteTeamMember/` - Validates email uniqueness, prevents Owner invites, publishes TeamMemberInvitedEvent
- `AcceptInvitation/` - Token-based acceptance, creates TeamMember, prevents duplicate membership, publishes TeamMemberAcceptedEvent
- `UpdateMemberRole/` - Prevents Owner assignment and last-owner demotion
- `RemoveTeamMember/` - Prevents removing last Owner
- `RevokeInvitation/` - Revokes pending invitations only

**Queries (4 files):**
- `ListTeamMembers/` - Returns all members ordered by role then join date
- `ListPendingInvitations/` - Returns only Pending invitations ordered by most recent

**DTOs:** TeamMemberDto, TeamInvitationDto
**Events:** TeamMemberInvitedEvent, TeamMemberAcceptedEvent (local records for MassTransit publishing)

### API Layer (IdentityService.API) - 10 new files

| Endpoint | Method | Route | Auth |
|----------|--------|-------|------|
| Invite.cs | POST | `/api/v1/team/invite` | Admin only |
| ListMembers.cs | GET | `/api/v1/team/members` | Admin + User |
| UpdateRole.cs | PUT | `/api/v1/team/members/{Id}/role` | Admin only |
| RemoveMember.cs | DELETE | `/api/v1/team/members/{Id}` | Admin only |
| ListInvitations.cs | GET | `/api/v1/team/invitations` | Admin + User |
| AcceptInvitation.cs | POST | `/api/v1/team/invitations/{Token}/accept` | AllowAnonymous |
| RevokeInvitation.cs | DELETE | `/api/v1/team/invitations/{Id}` | Admin only |

**Validators:** Invite.Validator.cs, AcceptInvitation.Validator.cs, UpdateRole.Validator.cs

### Infrastructure Layer - 2 changes

- `IdentityDbContext.cs` - Added DbSet<TeamMember>, DbSet<TeamInvitation>, entity configurations with indexes, tenant query filters
- `Migrations/20260321120000_AddTeamManagement.cs` - Creates TeamMembers and TeamInvitations tables with proper indexes

### DI Registration

- `ProgramExtensions.cs` - Registered ITeamDbContext abstraction

### NotificationService.Contracts - 3 new files (for future package publish)

- `Events/TeamMemberInvitedEvent.cs`
- `Events/TeamMemberAcceptedEvent.cs`
- `Enums/NotificationType.cs` - Added TeamMemberInvited, TeamMemberAccepted constants

### Unit Tests - 10 new files, 56 new tests

| Test File | Tests | Coverage |
|-----------|-------|----------|
| TeamMemberEntityTests.cs | 4 | Create, roles, UpdateRole |
| TeamInvitationEntityTests.cs | 13 | Create, normalize email, empty email, unique tokens, Accept, Revoke, IsAcceptable, GenerateToken |
| InviteTeamMemberHandlerTests.cs | 5 | Valid input, empty email, Owner role rejection, duplicate pending, save + publish |
| AcceptInvitationHandlerTests.cs | 6 | Valid token, empty token, not found, already accepted, already member, publish event |
| UpdateMemberRoleHandlerTests.cs | 4 | Valid update, not found, Owner role rejection, last owner demotion |
| RemoveTeamMemberHandlerTests.cs | 3 | Valid removal, not found, last owner protection |
| RevokeInvitationHandlerTests.cs | 3 | Valid revoke, not found, already accepted |
| InviteTeamMemberValidatorTests.cs | 5 | Valid, empty email, invalid email, too long, invalid role |
| AcceptInvitationValidatorTests.cs | 3 | Valid token, empty token, too long |
| UpdateRoleValidatorTests.cs | 3 | Valid, invalid ID, invalid role |

## Verification Results

| Check | Result |
|-------|--------|
| `identity-lint` | PASSED |
| `identity-yagni` | PASSED |
| `identity-unit-tests` | PASSED (784 tests, 0 failed) |
| `identity-api` | PASSED (container rebuilt) |

## Business Rules Enforced

1. Cannot invite a user as Owner (use ownership transfer)
2. Cannot demote the last Owner
3. Cannot remove the last Owner
4. Only one pending invitation per email per tenant
5. A user cannot accept if already a member
6. Revoked/accepted invitations cannot be re-accepted
7. Expired invitations are rejected

## Status

- **Started**: 2026-03-21
- **Completed**: 2026-03-21
- **Status**: COMPLETED
- **Files Created**: 42 new files
- **Total Tests**: 784 (56 new)

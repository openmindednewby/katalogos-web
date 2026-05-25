/** DTO representing a team member from the API. */
export interface TeamMemberDto {
  id: number;
  externalId: string;
  userId: string;
  role: string;
  invitedByUserId: string;
  joinedAt: string;
}

/** DTO representing a team invitation from the API. */
export interface TeamInvitationDto {
  id: number;
  externalId: string;
  email: string;
  role: string;
  status: string;
  invitedByUserId: string;
  invitedAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
}

/** Response shape for the list members endpoint. */
export interface ListMembersResponse {
  members: TeamMemberDto[];
}

/** Response shape for the list invitations endpoint. */
export interface ListInvitationsResponse {
  invitations: TeamInvitationDto[];
}

/** Request body for the invite team member endpoint. */
export interface InviteTeamMemberRequest {
  email: string;
  role: number;
}

/** Request body for the update role endpoint. */
export interface UpdateMemberRoleRequest {
  newRole: number;
}

/**
 * Mutation hook for inviting a new team member via the Identity API.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getListTeamInvitationsQueryKey } from './useListTeamInvitations';
import { identityInstance } from '../../mutators/identityMutator';

import type { InviteTeamMemberRequest, TeamInvitationDto } from './teamTypes';
import type { UseMutationResult } from '@tanstack/react-query';

/** Sends an invitation to join the team. */
async function inviteTeamMember(data: InviteTeamMemberRequest): Promise<TeamInvitationDto> {
  return identityInstance<TeamInvitationDto>({
    url: '/api/v1/team/invite',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

/** Hook for inviting a team member. Invalidates the invitations query on success. */
export function useInviteTeamMember(): UseMutationResult<TeamInvitationDto, Error, InviteTeamMemberRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTeamInvitationsQueryKey() }).catch(() => {});
    },
  });
}

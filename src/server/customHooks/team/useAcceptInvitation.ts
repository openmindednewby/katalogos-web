/**
 * Mutation hook for accepting a team invitation via the Identity API.
 */
import { useMutation } from '@tanstack/react-query';

import { identityInstance } from '../../mutators/identityMutator';

import type { TeamMemberDto } from './teamTypes';
import type { UseMutationResult } from '@tanstack/react-query';

/** Accepts a team invitation by token. */
async function acceptInvitation(token: string): Promise<TeamMemberDto> {
  return identityInstance<TeamMemberDto>({
    url: `/api/v1/team/invitations/${token}/accept`,
    method: 'POST',
  });
}

/** Hook for accepting a team invitation. */
export function useAcceptInvitation(): UseMutationResult<TeamMemberDto, Error, string> {
  return useMutation({
    mutationFn: acceptInvitation,
  });
}

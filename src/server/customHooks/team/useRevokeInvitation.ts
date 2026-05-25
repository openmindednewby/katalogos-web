/**
 * Mutation hook for revoking a team invitation via the Identity API.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getListTeamInvitationsQueryKey } from './useListTeamInvitations';
import { identityInstance } from '../../mutators/identityMutator';

import type { UseMutationResult } from '@tanstack/react-query';

/** Revokes a team invitation by ID. */
async function revokeInvitation(invitationId: number): Promise<undefined> {
  await identityInstance<undefined>({
    url: `/api/v1/team/invitations/${String(invitationId)}`,
    method: 'DELETE',
  });
  return undefined;
}

/** Hook for revoking a team invitation. Invalidates the invitations query on success. */
export function useRevokeInvitation(): UseMutationResult<undefined, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTeamInvitationsQueryKey() }).catch(() => {});
    },
  });
}

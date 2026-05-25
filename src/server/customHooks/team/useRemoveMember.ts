/**
 * Mutation hook for removing a team member via the Identity API.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getListTeamMembersQueryKey } from './useListTeamMembers';
import { identityInstance } from '../../mutators/identityMutator';

import type { UseMutationResult } from '@tanstack/react-query';

/** Removes a team member by ID. */
async function removeMember(memberId: number): Promise<undefined> {
  await identityInstance<undefined>({
    url: `/api/v1/team/members/${String(memberId)}`,
    method: 'DELETE',
  });
  return undefined;
}

/** Hook for removing a team member. Invalidates the members query on success. */
export function useRemoveMember(): UseMutationResult<undefined, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() }).catch(() => {});
    },
  });
}

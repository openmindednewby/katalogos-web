/**
 * Mutation hook for updating a team member's role via the Identity API.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getListTeamMembersQueryKey } from './useListTeamMembers';
import { identityInstance } from '../../mutators/identityMutator';

import type { TeamMemberDto, UpdateMemberRoleRequest } from './teamTypes';
import type { UseMutationResult } from '@tanstack/react-query';

interface UpdateRoleVariables {
  memberId: number;
  data: UpdateMemberRoleRequest;
}

/** Updates a team member's role. */
async function updateMemberRole({ memberId, data }: UpdateRoleVariables): Promise<TeamMemberDto> {
  return identityInstance<TeamMemberDto>({
    url: `/api/v1/team/members/${String(memberId)}/role`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

/** Hook for updating a team member's role. Invalidates the members query on success. */
export function useUpdateMemberRole(): UseMutationResult<TeamMemberDto, Error, UpdateRoleVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() }).catch(() => {});
    },
  });
}

/**
 * Custom hook for fetching team members from the Identity API.
 */
import { useQuery } from '@tanstack/react-query';

import { identityInstance } from '../../mutators/identityMutator';

import type { ListMembersResponse } from './teamTypes';
import type { UseQueryResult } from '@tanstack/react-query';

const STALE_TIME_MS = 30_000;

/** Query key for team members. */
export function getListTeamMembersQueryKey(): string[] {
  return ['team', 'members'];
}

/** Fetches team members from the Identity API. */
async function fetchTeamMembers(signal?: AbortSignal): Promise<ListMembersResponse> {
  return identityInstance<ListMembersResponse>({
    url: '/api/v1/team/members',
    method: 'GET',
    signal,
  });
}

/** Hook for fetching team members. */
export function useListTeamMembers(): UseQueryResult<ListMembersResponse> {
  return useQuery({
    queryKey: getListTeamMembersQueryKey(),
    queryFn: async ({ signal }) => fetchTeamMembers(signal),
    staleTime: STALE_TIME_MS,
  });
}

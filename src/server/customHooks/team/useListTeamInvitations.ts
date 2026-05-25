/**
 * Custom hook for fetching pending team invitations from the Identity API.
 */
import { useQuery } from '@tanstack/react-query';

import { identityInstance } from '../../mutators/identityMutator';

import type { ListInvitationsResponse } from './teamTypes';
import type { UseQueryResult } from '@tanstack/react-query';

const STALE_TIME_MS = 30_000;

/** Query key for team invitations. */
export function getListTeamInvitationsQueryKey(): string[] {
  return ['team', 'invitations'];
}

/** Fetches pending invitations from the Identity API. */
async function fetchTeamInvitations(signal?: AbortSignal): Promise<ListInvitationsResponse> {
  return identityInstance<ListInvitationsResponse>({
    url: '/api/v1/team/invitations',
    method: 'GET',
    signal,
  });
}

/** Hook for fetching pending team invitations. */
export function useListTeamInvitations(): UseQueryResult<ListInvitationsResponse> {
  return useQuery({
    queryKey: getListTeamInvitationsQueryKey(),
    queryFn: async ({ signal }) => fetchTeamInvitations(signal),
    staleTime: STALE_TIME_MS,
  });
}

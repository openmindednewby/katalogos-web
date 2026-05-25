import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { get } from '../../lib/httpService';
import { Endpoints } from '../endpoints';

/** Time constants for query configuration */
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
/** Number of retry attempts for failed queries */
const QUERY_RETRY_COUNT = 1;

export function useTenantUsers(): UseQueryResult<UserRecord[]> {
  return useQuery<UserRecord[]>({
    queryKey: ['users', 'tenants', Endpoints.onlinemenuWebTenantsUsersList],
    queryFn: async () => fetchTenantUsers(),
    staleTime: MS_PER_SECOND * SECONDS_PER_MINUTE,
    retry: QUERY_RETRY_COUNT,
  });
}


export type UserRecord = Record<string, unknown>;

async function fetchTenantUsers(): Promise<UserRecord[]> {
  return await get<undefined, UserRecord[]>(Endpoints.onlinemenuWebTenantsUsersList, undefined, {
    withToken: true,
    withCredentials: true,
  });
}

export default useTenantUsers;

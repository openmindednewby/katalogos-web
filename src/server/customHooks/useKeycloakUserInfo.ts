import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { keycloakConfig } from '../../auth/keycloakConfig';
import { getByEndpoint } from '../../lib/httpService';
import { Endpoints } from '../endpoints';

import type { KeycloakUserInfo } from '../../auth/keycloakTypes';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const STALE_TIME_MINUTES = 5;
const QUERY_RETRY_COUNT = 1;

export function useKeycloakUserInfo(
  options?: Partial<UseQueryOptions<KeycloakUserInfo, Error, KeycloakUserInfo>>,
): UseQueryResult<KeycloakUserInfo> {
  const queryKey = ['keycloak', 'userinfo'];

  const queryFn = async (): Promise<KeycloakUserInfo> => {
    const resp = await getByEndpoint<undefined, KeycloakUserInfo>(
      Endpoints.onlinemenuWebKeycloakUserInfo,
      {
        withToken: true,
        withCredentials: true,
        baseURL: keycloakConfig.issuer,
      },
    );
    return resp;
  };

  return useQuery<KeycloakUserInfo, Error, KeycloakUserInfo>({
    queryKey,
    queryFn,
    staleTime: MS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES,
    retry: QUERY_RETRY_COUNT,
    ...(options ?? {}),
  });
}

export default useKeycloakUserInfo;

/** Demo helper: fetch tenant list using the new endpoint-aware httpService helper. */
export async function fetchTenantListDemo(): Promise<unknown> {
  const resp = await getByEndpoint<undefined, unknown>(Endpoints.onlinemenuWebTenantsList);
  return resp;
}

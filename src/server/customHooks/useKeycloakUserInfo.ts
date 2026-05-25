import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { keycloakConfig } from '../../auth/keycloakConfig';
import { getByEndpoint } from '../../lib/httpService';
import { Endpoints } from '../endpoints';

import type { KeycloakUserInfo } from '../../auth/keycloakTypes';

/** Time constants for query configuration */
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
/** Stale time for user info query in minutes */
const STALE_TIME_MINUTES = 5;
/** Number of retry attempts for failed queries */
const QUERY_RETRY_COUNT = 1;

export function useKeycloakUserInfo(
  options?: Partial<UseQueryOptions<KeycloakUserInfo, Error, KeycloakUserInfo>>,
): UseQueryResult<KeycloakUserInfo> {
  const queryKey = ['keycloak', 'userinfo'];

  const queryFn = async (): Promise<KeycloakUserInfo> => {
    // Use the endpoint-aware helper; pass the Keycloak issuer as baseURL so the
    // same endpoint path works across environments.
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

/**
 * Demo helper: fetch tenant list using the new endpoint-aware httpService helper.
 * This demonstrates calling an application API via `getByEndpoint` and is safe
 * to call from application code (it uses the app API base URL).
 */
export async function fetchTenantListDemo(): Promise<unknown> {
  // Example: call the Tenants list endpoint via the Endpoints enum
  const resp = await getByEndpoint<undefined, unknown>(Endpoints.onlinemenuWebTenantsList);
  return resp;
}

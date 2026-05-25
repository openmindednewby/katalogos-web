/**
 * React Query hook that polls backend service health endpoints.
 *
 * Each service's `/health/ready` endpoint is fetched every POLL_INTERVAL_MS.
 * Results are aggregated into an OverallHealthState.
 */

import { useCallback, useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import ServiceHealthStatus from '../../../shared/enums/ServiceHealthStatus';
import {
  SERVICE_CONFIGS,
  buildHealthUrl,
  deriveOverallStatus,
  determineStatus,
} from '../utils/statusHelpers';

import type { OverallHealthState, ServiceHealthResult } from '../types';

/** Polling interval in milliseconds. */
const POLL_INTERVAL_MS = 30_000;

/** Query key for the service health check. */
const HEALTH_QUERY_KEY = ['service-health'] as const;

/** Timeout for individual health check requests in milliseconds. */
const REQUEST_TIMEOUT_MS = 5000;

/** Stable empty array to prevent useMemo dependency changes. */
const EMPTY_SERVICES: ServiceHealthResult[] = [];

/**
 * Fetch the health status of a single service.
 * Uses the Fetch API directly (not axios) because this hits the raw
 * health endpoint which does not require auth headers.
 */
async function checkServiceHealth(baseUrl: string, serviceKey: string): Promise<ServiceHealthResult> {
  const url = buildHealthUrl({ key: serviceKey, nameKey: '', baseUrl });
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const elapsed = Math.round(performance.now() - startTime);

    return {
      serviceKey,
      status: determineStatus(response.status, elapsed),
      responseTimeMs: elapsed,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch {
    return {
      serviceKey,
      status: ServiceHealthStatus.Down,
      responseTimeMs: null,
      lastCheckedAt: new Date().toISOString(),
    };
  }
}

/** Fetch all service health statuses concurrently. */
async function fetchAllServiceHealth(): Promise<ServiceHealthResult[]> {
  const checks = SERVICE_CONFIGS.map(
    async (config): Promise<ServiceHealthResult> => checkServiceHealth(config.baseUrl, config.key),
  );
  return Promise.all(checks);
}

/**
 * Hook that returns the aggregated health state of all backend services.
 *
 * Polls every 30 seconds. Provides a `refresh` callback for manual refresh.
 */
function useServiceHealth(): OverallHealthState & { refresh: () => void } {
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: fetchAllServiceHealth,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });

  const services = useMemo(() => data ?? EMPTY_SERVICES, [data]);

  const overallStatus = useMemo(
    () => deriveOverallStatus(services),
    [services],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEY }).catch(() => undefined);
  }, [queryClient]);

  return {
    status: overallStatus,
    services,
    isRefreshing: isFetching,
    refresh,
  };
}

export {
  useServiceHealth,
  checkServiceHealth,
  fetchAllServiceHealth,
  POLL_INTERVAL_MS,
  HEALTH_QUERY_KEY,
  REQUEST_TIMEOUT_MS,
};

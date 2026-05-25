/**
 * Custom hook for fetching a single experiment with metrics.
 * Uses the OnlineMenu API: GET /api/v1/experiments/{id}
 */
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { ExperimentWithMetricsDto } from './types';
import type { UseQueryResult } from '@tanstack/react-query';

const EXPERIMENTS_ENDPOINT = '/api/v1/experiments';
const EXPERIMENT_DETAIL_PREFIX = 'experiment-detail';

async function fetchExperiment(
  experimentId: string,
  signal?: AbortSignal,
): Promise<ExperimentWithMetricsDto> {
  return customInstance<ExperimentWithMetricsDto>({
    url: `${EXPERIMENTS_ENDPOINT}/${experimentId}`,
    method: 'GET',
    signal,
  });
}

export function getExperimentQueryKey(
  experimentId: string,
): readonly string[] {
  return [EXPERIMENT_DETAIL_PREFIX, experimentId] as const;
}

export function useGetExperiment(
  experimentId: string,
): UseQueryResult<ExperimentWithMetricsDto> {
  const isValidId = experimentId !== '';

  return useQuery({
    queryKey: getExperimentQueryKey(experimentId),
    queryFn: async ({ signal }) => fetchExperiment(experimentId, signal),
    enabled: isValidId,
  });
}

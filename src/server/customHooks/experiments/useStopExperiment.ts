/**
 * Custom hook for stopping an experiment.
 * Uses the OnlineMenu API: POST /api/v1/experiments/{id}/stop
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { ExperimentDto } from './types';
import type { UseMutationResult } from '@tanstack/react-query';

const EXPERIMENTS_ENDPOINT = '/api/v1/experiments';
const EXPERIMENTS_QUERY_PREFIX = 'experiments-list';
const EXPERIMENT_DETAIL_PREFIX = 'experiment-detail';

interface StopExperimentVariables {
  experimentId: string;
}

async function stopExperiment(
  experimentId: string,
): Promise<ExperimentDto> {
  return customInstance<ExperimentDto>({
    url: `${EXPERIMENTS_ENDPOINT}/${experimentId}/stop`,
    method: 'POST',
  });
}

export function useStopExperiment(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}): UseMutationResult<ExperimentDto, unknown, StopExperimentVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['stopExperiment'],
    mutationFn: async (variables: StopExperimentVariables) =>
      stopExperiment(variables.experimentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_PREFIX] });
      await queryClient.invalidateQueries({ queryKey: [EXPERIMENT_DETAIL_PREFIX] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

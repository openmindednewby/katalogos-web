/**
 * Custom hook for creating an experiment.
 * Uses the OnlineMenu API: POST /api/v1/experiments
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { CreateExperimentRequest, ExperimentDto } from './types';
import type { UseMutationResult } from '@tanstack/react-query';

const EXPERIMENTS_ENDPOINT = '/api/v1/experiments';
const EXPERIMENTS_QUERY_PREFIX = 'experiments-list';

async function createExperiment(
  request: CreateExperimentRequest,
): Promise<ExperimentDto> {
  return customInstance<ExperimentDto>({
    url: EXPERIMENTS_ENDPOINT,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  });
}

export function useCreateExperiment(options?: {
  onSuccess?: (data: ExperimentDto) => void;
  onError?: (error: unknown) => void;
}): UseMutationResult<ExperimentDto, unknown, CreateExperimentRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createExperiment'],
    mutationFn: async (request: CreateExperimentRequest) =>
      createExperiment(request),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: [EXPERIMENTS_QUERY_PREFIX] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Custom hook for recording an experiment view on public menu pages.
 * Uses the OnlineMenu API: POST /api/v1/experiments/{id}/view
 * This endpoint allows anonymous access.
 */
import { useMutation } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { RecordViewRequest } from './types';
import type { UseMutationResult } from '@tanstack/react-query';

const EXPERIMENTS_ENDPOINT = '/api/v1/experiments';

interface RecordViewVariables {
  experimentId: string;
  variant: string;
}

async function recordView(
  experimentId: string,
  request: RecordViewRequest,
): Promise<undefined> {
  await customInstance<undefined>({
    url: `${EXPERIMENTS_ENDPOINT}/${experimentId}/view`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  });
  return undefined;
}

export function useRecordExperimentView(): UseMutationResult<
  undefined,
  unknown,
  RecordViewVariables
> {
  return useMutation({
    mutationKey: ['recordExperimentView'],
    mutationFn: async (variables: RecordViewVariables) =>
      recordView(variables.experimentId, { variant: variables.variant }),
  });
}

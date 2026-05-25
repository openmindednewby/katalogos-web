import { useMutation } from '@tanstack/react-query';

import { customInstance } from '../server/httpClient';

import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

interface GenerateNutritionRequest {
  menuExternalId: string;
  itemName: string;
  ingredients: string;
}

interface GenerateNutritionApiBody {
  itemName: string;
  ingredients: string;
}

interface GenerateNutritionResponse {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sodiumMg: number;
  servingSize: string;
  detectedAllergens: string[];
}

/**
 * Calls the backend AI nutrition generation endpoint.
 */
export async function generateNutrition(
  request: GenerateNutritionRequest,
): Promise<GenerateNutritionResponse> {
  const body: GenerateNutritionApiBody = {
    itemName: request.itemName,
    ingredients: request.ingredients,
  };

  return customInstance<GenerateNutritionResponse>({
    url: `/api/v1/TenantMenus/${request.menuExternalId}/generate-nutrition`,
    method: 'POST',
    data: body,
  });
}

/**
 * React Query mutation hook for generating AI nutritional info.
 * No cache invalidation needed since this returns ephemeral data.
 */
export function useGenerateNutrition<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    GenerateNutritionResponse,
    TError,
    GenerateNutritionRequest,
    TContext
  >,
): UseMutationResult<GenerateNutritionResponse, TError, GenerateNutritionRequest, TContext> {
  return useMutation({
    ...options,
    mutationFn: generateNutrition,
  });
}

export type { GenerateNutritionRequest, GenerateNutritionResponse };

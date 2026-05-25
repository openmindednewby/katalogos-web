import { useMutation } from '@tanstack/react-query';

import { customInstance } from '../server/httpClient';

import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

interface GenerateDescriptionRequest {
  menuExternalId: string;
  itemName: string;
  categoryName: string;
  price: number | undefined;
  existingDescription: string | undefined;
}

interface GenerateDescriptionApiBody {
  itemName: string;
  categoryName: string;
  price: number | undefined;
  existingDescription: string | undefined;
}

interface GenerateDescriptionResponse {
  description: string;
}

/**
 * Calls the backend AI description generation endpoint.
 */
export async function generateMenuItemDescription(
  request: GenerateDescriptionRequest,
): Promise<GenerateDescriptionResponse> {
  const body: GenerateDescriptionApiBody = {
    itemName: request.itemName,
    categoryName: request.categoryName,
    price: request.price,
    existingDescription: request.existingDescription,
  };

  return customInstance<GenerateDescriptionResponse>({
    url: `/TenantMenus/${request.menuExternalId}/generate-description`,
    method: 'POST',
    data: body,
  });
}

/**
 * React Query mutation hook for generating AI menu item descriptions.
 * No cache invalidation needed since this returns ephemeral data.
 */
export function useGenerateMenuItemDescription<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    GenerateDescriptionResponse,
    TError,
    GenerateDescriptionRequest,
    TContext
  >,
): UseMutationResult<GenerateDescriptionResponse, TError, GenerateDescriptionRequest, TContext> {
  return useMutation({
    ...options,
    mutationFn: generateMenuItemDescription,
  });
}

import { useMutation } from '@tanstack/react-query';

import { customInstance } from '../server/httpClient';

import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

interface DuplicateMenuRequest {
  externalId: string;
}

interface DuplicateMenuResponse {
  externalId: string;
}

/**
 * Calls the backend duplicate-menu endpoint, which clones the source menu
 * (name + contents + schedule) into a new inactive draft and returns its id.
 * The endpoint is hand-wired (not yet in the generated client).
 */
async function duplicateMenu(request: DuplicateMenuRequest): Promise<DuplicateMenuResponse> {
  return customInstance<DuplicateMenuResponse>({
    url: `/TenantMenus/${request.externalId}/duplicate`,
    method: 'POST',
  });
}

/** React Query mutation hook for duplicating a menu. */
export function useDuplicateMenu<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<DuplicateMenuResponse, TError, DuplicateMenuRequest, TContext>,
): UseMutationResult<DuplicateMenuResponse, TError, DuplicateMenuRequest, TContext> {
  return useMutation({
    ...options,
    mutationFn: duplicateMenu,
  });
}

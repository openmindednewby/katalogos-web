/**
 * Mutation hook for saving white-label configuration.
 *
 * Sends a PUT to the existing tenant theme endpoint with white-label fields.
 * Preserves existing theme fields by merging with the current theme data.
 * Invalidates the tenant theme query cache on success.
 */
import { useMemo } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { queryKeys } from '../../../lib/queryClient';
import { identityInstance } from '../../../server/mutators/identityMutator';
import { isValueDefined } from '../../../utils/is';

import type { RootState } from '../../../store/reduxStore';
import type { WhiteLabelFormState } from '../types';
import type { QueryClient, UseMutationResult } from '@tanstack/react-query';

interface SaveResponse {
  success: boolean;
}

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseWhiteLabelMutationReturn {
  saveWhiteLabel: (form: WhiteLabelFormState) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

function extractTenantId(state: RootState): string | undefined {
  const userInfo = state.auth.userInfo;
  if (!isValueDefined(userInfo)) return undefined;
  const tenantId = userInfo.tenantId;
  if (typeof tenantId === 'string' && tenantId.length > 0) return tenantId;
  return undefined;
}

export function toApiPayload(form: WhiteLabelFormState): Record<string, unknown> {
  return {
    customLogoUrl: form.customLogoUrl !== '' ? form.customLogoUrl : null,
    customFaviconUrl: form.customFaviconUrl !== '' ? form.customFaviconUrl : null,
    customCss: form.customCss !== '' ? form.customCss : null,
    headerHtml: form.headerHtml !== '' ? form.headerHtml : null,
    footerHtml: form.footerHtml !== '' ? form.footerHtml : null,
    showPoweredBy: form.showPoweredBy,
    companyName: form.companyName !== '' ? form.companyName : null,
    supportEmail: form.supportEmail !== '' ? form.supportEmail : null,
  };
}

async function saveWhiteLabelConfig(
  tenantId: string,
  form: WhiteLabelFormState,
): Promise<SaveResponse> {
  return identityInstance<SaveResponse>({
    url: `/api/tenants/${tenantId}/theme`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: toApiPayload(form),
  });
}

function buildMutationConfig(
  tenantId: string | undefined,
  queryClient: QueryClient,
  callbacks?: MutationCallbacks,
): {
  mutationFn: (form: WhiteLabelFormState) => Promise<SaveResponse>;
  onSuccess: () => void;
  onError: (error: Error) => void;
} {
  return {
    mutationFn: async (form: WhiteLabelFormState) => {
      if (!isValueDefined(tenantId))
        return Promise.reject(new Error('No tenant ID available'));
      return saveWhiteLabelConfig(tenantId, form);
    },
    onSuccess: () => {
      if (isValueDefined(tenantId))
        queryClient
          .invalidateQueries({ queryKey: queryKeys.tenantTheme.byTenant(tenantId) })
          .catch(() => {});
      callbacks?.onSuccess?.();
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  };
}

function buildReturn(
  mutation: UseMutationResult<SaveResponse, Error, WhiteLabelFormState>,
): UseWhiteLabelMutationReturn {
  return {
    saveWhiteLabel: (form: WhiteLabelFormState) => mutation.mutate(form),
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useWhiteLabelMutation(
  callbacks?: MutationCallbacks,
): UseWhiteLabelMutationReturn {
  const tenantId = useSelector(extractTenantId);
  const queryClient = useQueryClient();

  const config = buildMutationConfig(tenantId, queryClient, callbacks);
  const mutation = useMutation<SaveResponse, Error, WhiteLabelFormState>(config);

  return useMemo(() => buildReturn(mutation), [mutation]);
}

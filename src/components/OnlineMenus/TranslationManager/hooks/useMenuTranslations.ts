/**
 * Hook for managing menu translations via the OnlineMenu API.
 * Uses React Query for caching, refetching, and mutation state.
 */
import { useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import { FM } from '@/localization/helpers';

import { notify } from '../../../../lib/notifications';
import { customInstance } from '../../../../server/mutators/onlineMenuMutator';
import { isValueDefined } from '../../../../utils/is';

import type { MenuTranslationSummary, TranslatedMenuContents } from '../../../../types/menuTypes';
import type { UseMutationResult } from '@tanstack/react-query';

interface TranslationsListResponse {
  translations: MenuTranslationSummary[];
}

interface TranslateMenuRequest {
  languageCodes: string[];
}

interface UpdateTranslationRequest {
  languageCode: string;
  contents: TranslatedMenuContents;
}

function getTranslationsQueryKey(menuExternalId: string): string[] {
  return [`/TenantMenus/${menuExternalId}/translations`];
}

async function fetchTranslations(menuExternalId: string, signal?: AbortSignal): Promise<TranslationsListResponse> {
  return customInstance<TranslationsListResponse>({
    url: `/TenantMenus/${menuExternalId}/translations`,
    method: 'GET',
    signal,
  });
}

async function triggerTranslation(menuExternalId: string, body: TranslateMenuRequest): Promise<undefined> {
  await customInstance<undefined>({ url: `/TenantMenus/${menuExternalId}/translations/translate`, method: 'POST', data: body });
  return undefined;
}

async function updateTranslationApi(menuExternalId: string, languageCode: string, contents: TranslatedMenuContents): Promise<undefined> {
  await customInstance<undefined>({ url: `/TenantMenus/${menuExternalId}/translations/${languageCode}`, method: 'PUT', data: contents });
  return undefined;
}

async function removeTranslation(menuExternalId: string, languageCode: string): Promise<undefined> {
  await customInstance<undefined>({ url: `/TenantMenus/${menuExternalId}/translations/${languageCode}`, method: 'DELETE' });
  return undefined;
}

interface UseMenuTranslationsReturn {
  translations: MenuTranslationSummary[];
  isLoading: boolean;
  translateMenu: (languageCodes: string[]) => void;
  isTranslating: boolean;
  deleteTranslation: (languageCode: string) => void;
  isDeleting: boolean;
  updateTranslationContents: (languageCode: string, contents: TranslatedMenuContents) => void;
  isUpdating: boolean;
}

function useTranslationsQuery(menuExternalId: string | undefined): { data: TranslationsListResponse | undefined; isLoading: boolean } {
  const queryKey = isValueDefined(menuExternalId) ? getTranslationsQueryKey(menuExternalId) : [];
  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!isValueDefined(menuExternalId)) return { translations: [] };
      return fetchTranslations(menuExternalId, signal);
    },
    enabled: isValueDefined(menuExternalId),
  });
}

function useInvalidateTranslations(menuExternalId: string | undefined): () => void {
  const queryClient = useQueryClient();
  return useCallback(() => {
    if (isValueDefined(menuExternalId))
      queryClient.invalidateQueries({ queryKey: getTranslationsQueryKey(menuExternalId) }).catch(() => undefined);
  }, [menuExternalId, queryClient]);
}

function useTranslateMutation(
  menuExternalId: string | undefined,
  invalidateList: () => void,
): UseMutationResult<undefined, Error, TranslateMenuRequest> {
  return useMutation({
    mutationFn: async (body: TranslateMenuRequest) => {
      if (!isValueDefined(menuExternalId)) return undefined;
      return triggerTranslation(menuExternalId, body);
    },
    onSuccess: () => { notify('success', FM('translations.translateSuccess')); invalidateList(); },
    onError: () => { notify('error', FM('translations.translateError')); },
  });
}

function useDeleteMutation(
  menuExternalId: string | undefined,
  invalidateList: () => void,
): UseMutationResult<undefined, Error, string> {
  return useMutation({
    mutationFn: async (languageCode: string) => {
      if (!isValueDefined(menuExternalId)) return undefined;
      return removeTranslation(menuExternalId, languageCode);
    },
    onSuccess: () => { notify('success', FM('translations.deleteSuccess')); invalidateList(); },
    onError: () => { notify('error', FM('translations.deleteError')); },
  });
}

function useUpdateMutation(
  menuExternalId: string | undefined,
  invalidateList: () => void,
): UseMutationResult<undefined, Error, UpdateTranslationRequest> {
  return useMutation({
    mutationFn: async (req: UpdateTranslationRequest) => {
      if (!isValueDefined(menuExternalId)) return undefined;
      return updateTranslationApi(menuExternalId, req.languageCode, req.contents);
    },
    onSuccess: () => { notify('success', FM('translations.saveSuccess')); invalidateList(); },
    onError: () => { notify('error', FM('translations.saveError')); },
  });
}

export function useMenuTranslations(menuExternalId: string | undefined): UseMenuTranslationsReturn {
  const { data, isLoading } = useTranslationsQuery(menuExternalId);
  const invalidateList = useInvalidateTranslations(menuExternalId);
  const translateMutation = useTranslateMutation(menuExternalId, invalidateList);
  const deleteMutation = useDeleteMutation(menuExternalId, invalidateList);
  const updateMutation = useUpdateMutation(menuExternalId, invalidateList);

  return {
    translations: data?.translations ?? [],
    isLoading,
    translateMenu: useCallback((codes: string[]) => { translateMutation.mutate({ languageCodes: codes }); }, [translateMutation]),
    isTranslating: translateMutation.isPending,
    deleteTranslation: useCallback((code: string) => { deleteMutation.mutate(code); }, [deleteMutation]),
    isDeleting: deleteMutation.isPending,
    updateTranslationContents: useCallback((code: string, c: TranslatedMenuContents) => { updateMutation.mutate({ languageCode: code, contents: c }); }, [updateMutation]),
    isUpdating: updateMutation.isPending,
  };
}

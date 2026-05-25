/**
 * Custom hook for importing menu data from an image or PDF using AI.
 * Uses the OnlineMenu API: POST /api/v1/TenantMenus/import-from-image
 */
import { useMutation } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { ImportedMenuData } from '../../types/aiImportTypes';
import type { UseMutationResult } from '@tanstack/react-query';

const IMPORT_ENDPOINT = '/api/v1/TenantMenus/import-from-image';

async function importMenuFromImage(
  file: File,
): Promise<ImportedMenuData> {
  const formData = new FormData();
  formData.append('file', file);

  return customInstance<ImportedMenuData>({
    url: IMPORT_ENDPOINT,
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function useImportMenuFromImage(options?: {
  onSuccess?: (data: ImportedMenuData) => void;
  onError?: (error: unknown) => void;
}): UseMutationResult<ImportedMenuData, unknown, File> {
  return useMutation({
    mutationKey: ['importMenuFromImage'],
    mutationFn: importMenuFromImage,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

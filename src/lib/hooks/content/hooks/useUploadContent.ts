import { useCallback, useRef, useState } from 'react';

import { blobFromUri, uploadImage } from '@dloizides/content-upload';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isValueDefined } from '../../../../utils/is';
import {
  CONTENT_UPLOAD_ENDPOINT,
  fetchContent,
  PROGRESS_COMPLETE,
  validateFile,
} from '../utils/uploadUtils';

import type {
  ContentCategory,
  ContentDto,
  FileInfo,
  UploadContentOptions,
  UploadState,
} from '../types';

const DEFAULT_UPLOAD_STATE: UploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  contentId: null,
};

/**
 * Query key for content list queries.
 */
export function getContentListQueryKey(category?: ContentCategory): string[] {
  if (isValueDefined(category))
    return ['content', 'list', category];

  return ['content', 'list'];
}

/**
 * Query key for single content queries.
 */
export function getContentQueryKey(contentId: string): string[] {
  return ['content', contentId];
}

/** Hook for uploading content with progress tracking and cancellation support. */
export function useUploadContent(options: UploadContentOptions): UploadHookResult {
  const { category, isPublic = false, onProgress, onSuccess, onError } = options;
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<UploadState>(DEFAULT_UPLOAD_STATE);

  const mutationFn = useCallback(
    async (file: FileInfo): Promise<ContentDto> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const config: UploadFlowConfig = { file, category, isPublic, signal: controller.signal };
      return performUploadFlow(config, onProgress, setState);
    },
    [category, isPublic, onProgress],
  );

  const { handleSuccess, handleError } = useUploadCallbacks(category, onSuccess, onError, setState);
  const uploadMutation = useMutation({ mutationFn, onMutate: () => setState(createUploadingState()), onSuccess: handleSuccess, onError: handleError });

  const upload = useCallback(async (file: FileInfo): Promise<ContentDto | null> => {
    try { return await uploadMutation.mutateAsync(file); } catch { return null; }
  }, [uploadMutation]);

  const { cancel, reset } = useCancelAndReset(abortControllerRef, setState);

  return { upload, cancel, state, reset };
}

export default useUploadContent;

interface UploadFlowConfig {
  file: FileInfo;
  category: ContentCategory;
  isPublic: boolean;
  signal: AbortSignal;
}

function createUploadingState(): UploadState {
  return { isUploading: true, progress: 0, error: null, contentId: null };
}

interface UploadHookResult {
  upload: (file: FileInfo) => Promise<ContentDto | null>;
  cancel: () => void;
  state: UploadState;
  reset: () => void;
}

async function performUploadFlow(
  config: UploadFlowConfig,
  onProgress: ((progress: number) => void) | undefined,
  setState: React.Dispatch<React.SetStateAction<UploadState>>,
): Promise<ContentDto> {
  const validation = validateFile(config.file, config.category);
  if (!validation.valid) throw new Error(validation.error);

  const blob = await blobFromUri(config.file.uri);
  const uploadResponse = await uploadImage(blob, {
    endpoint: CONTENT_UPLOAD_ENDPOINT,
    fileName: config.file.name,
    category: config.category,
    isPublic: config.isPublic,
    requireUrl: false,
    onProgress,
    signal: config.signal,
  });
  setState((prev) => ({ ...prev, contentId: uploadResponse.contentId }));

  return fetchContent(uploadResponse.contentId);
}

function useUploadCallbacks(
  category: ContentCategory,
  onSuccess: ((content: ContentDto) => void) | undefined,
  onError: ((error: Error) => void) | undefined,
  setState: React.Dispatch<React.SetStateAction<UploadState>>,
): { handleSuccess: (content: ContentDto) => void; handleError: (error: Error) => void } {
  const queryClient = useQueryClient();

  const handleSuccess = useCallback((content: ContentDto) => {
    setState((prev) => ({ ...prev, isUploading: false, progress: PROGRESS_COMPLETE }));
    queryClient.invalidateQueries({ queryKey: getContentListQueryKey(category) }).catch(() => {});
    if (isValueDefined(onSuccess)) onSuccess(content);
  }, [category, onSuccess, queryClient, setState]);

  const handleError = useCallback((error: Error) => {
    setState((prev) => ({ ...prev, isUploading: false, error }));
    if (isValueDefined(onError)) onError(error);
  }, [onError, setState]);

  return { handleSuccess, handleError };
}

function abortCurrentUpload(controllerRef: React.MutableRefObject<AbortController | null>): void {
  const controller = controllerRef.current;
  if (isValueDefined(controller)) {
    controller.abort();
    // eslint-disable-next-line no-param-reassign -- Refs are designed to be mutated
    controllerRef.current = null;
  }
}

export { validateFile } from '../utils/uploadUtils';

function useCancelAndReset(
  abortControllerRef: React.MutableRefObject<AbortController | null>,
  setState: React.Dispatch<React.SetStateAction<UploadState>>,
): { cancel: () => void; reset: () => void } {
  const cancel = useCallback(() => {
    abortCurrentUpload(abortControllerRef);
    setState((prev) => ({ ...prev, isUploading: false, error: new Error('Upload was cancelled') }));
  }, [abortControllerRef, setState]);

  const reset = useCallback(() => setState(DEFAULT_UPLOAD_STATE), [setState]);

  return { cancel, reset };
}

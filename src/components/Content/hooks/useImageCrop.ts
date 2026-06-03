/**
 * Hook managing the image crop modal lifecycle.
 *
 * Opens a promise-based crop flow: the caller awaits `requestCrop`,
 * the modal calls `onApply` or `onCancel` to resolve/reject the promise.
 */
import { useCallback, useRef, useState } from 'react';

import { Platform } from 'react-native';

import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import { isValueDefined } from '../../../utils/is';
import { blobToFileInfo, cropImageToBlob, getAspectRatioValue } from '../utils/cropImageUtils';

import type { FileInfo } from '../../../lib/hooks/content/types';
import type { PixelCrop } from '../utils/cropImageUtils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CropModalState {
  isVisible: boolean;
  imageUri: string;
  originalFile: FileInfo | null;
}

interface UseImageCropResult {
  /** Current modal state. */
  modalState: CropModalState;
  /** Current aspect ratio preset. */
  aspectPreset: AspectRatioPreset;
  /** Numeric aspect ratio (undefined = free). */
  aspectRatio: number | undefined;
  /** Sets the aspect ratio preset. */
  setAspectPreset: (preset: AspectRatioPreset) => void;
  /** Opens the crop modal and returns the cropped FileInfo. Resolves null on cancel. */
  requestCrop: (file: FileInfo) => Promise<FileInfo | null>;
  /** Applies the crop with given pixel coordinates. */
  onApply: (pixelCrop: PixelCrop) => void;
  /** Cancels the crop modal. */
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_STATE: CropModalState = {
  isVisible: false,
  imageUri: '',
  originalFile: null,
};

const CROPPED_FILE_PREFIX = 'cropped-';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolves the crop promise and resets modal state. */
function resolveAndReset(
  resolverRef: React.MutableRefObject<((file: FileInfo | null) => void) | null>,
  setModalState: React.Dispatch<React.SetStateAction<CropModalState>>,
  result: FileInfo | null,
): void {
  resolverRef.current?.(result);
  resolverRef.current = null; // eslint-disable-line no-param-reassign -- intentional ref mutation
  setModalState(INITIAL_STATE);
}

interface PerformCropParams {
  imageUri: string;
  pixelCrop: PixelCrop;
  originalFile: FileInfo;
  resolverRef: React.MutableRefObject<((file: FileInfo | null) => void) | null>;
  setModalState: React.Dispatch<React.SetStateAction<CropModalState>>;
}

/** Performs the crop, resolves the promise, and resets the modal. */
async function performCrop(params: PerformCropParams): Promise<void> {
  const { imageUri, pixelCrop, originalFile, resolverRef, setModalState } = params;
  try {
    const blob = await cropImageToBlob(imageUri, pixelCrop, originalFile.type);
    const fileName = `${CROPPED_FILE_PREFIX}${originalFile.name}`;
    const fileInfo = blobToFileInfo(blob, fileName, originalFile.type);
    resolveAndReset(resolverRef, setModalState, fileInfo);
  } catch {
    resolveAndReset(resolverRef, setModalState, null);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useImageCrop(initialPreset: AspectRatioPreset = AspectRatioPreset.Square): UseImageCropResult {
  const [modalState, setModalState] = useState<CropModalState>(INITIAL_STATE);
  const [aspectPreset, setAspectPreset] = useState<AspectRatioPreset>(initialPreset);
  const resolverRef = useRef<((file: FileInfo | null) => void) | null>(null);

  const aspectRatio = getAspectRatioValue(aspectPreset);

  const requestCrop = useCallback(async (file: FileInfo): Promise<FileInfo | null> => {
    if (Platform.OS !== 'web') return file;

    setModalState({ isVisible: true, imageUri: file.uri, originalFile: file });

    return new Promise<FileInfo | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const onApply = useCallback((pixelCrop: PixelCrop) => {
    const { originalFile } = modalState;
    if (!isValueDefined(originalFile)) return;

    performCrop({ imageUri: modalState.imageUri, pixelCrop, originalFile, resolverRef, setModalState }).catch(() => {});
  }, [modalState]);

  const onCancel = useCallback(() => {
    resolveAndReset(resolverRef, setModalState, null);
  }, []);

  return { modalState, aspectPreset, aspectRatio, setAspectPreset, requestCrop, onApply, onCancel };
}

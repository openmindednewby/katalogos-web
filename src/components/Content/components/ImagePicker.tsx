import React, { useCallback } from 'react';

import * as ExpoImagePicker from 'expo-image-picker';

import { ContentUploader } from './ContentUploader';
import CropModal from './CropModal';
import { useContent, useContentUrl, usePublicContentUrl } from '../../../lib/hooks/content';
import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import ContentCategory from '../../../shared/enums/ContentCategory';
import { isValueDefined } from '../../../utils/is';
import { useImageCrop } from '../hooks/useImageCrop';

import type { FileInfo } from '../../../lib/hooks/content/types';


const DEFAULT_HINT = 'JPEG, PNG, GIF, or WebP (max 10MB)';
const DEFAULT_QUALITY = 0.8;


function assetToFileInfo(asset: ExpoImagePicker.ImagePickerAsset): FileInfo {
  const fileName = getFileNameFromUri(asset.uri);
  const mimeType = asset.mimeType ?? getMimeType(fileName);
  const fileSize = asset.fileSize ?? 0;
  return { uri: asset.uri, name: fileName, type: mimeType, size: fileSize };
}

interface PreviewUrlState {
  url?: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  refetch: () => void;
}

function useContentPreviewUrl(isPublic: boolean, value?: string): PreviewUrlState {
  const publicUrlQuery = usePublicContentUrl(isPublic ? value : undefined);
  const authenticatedUrlQuery = useContentUrl(isPublic ? undefined : value);
  const urlQuery = isPublic ? publicUrlQuery : authenticatedUrlQuery;

  let errorMessage: string | undefined;
  if (urlQuery.isError)
    errorMessage = urlQuery.error instanceof Error ? urlQuery.error.message : undefined;

  const refetch = useCallback((): void => {
    urlQuery.refetch().catch(() => undefined);
  }, [urlQuery]);

  return {
    url: urlQuery.data?.url,
    isLoading: urlQuery.isLoading,
    isError: urlQuery.isError,
    errorMessage,
    refetch,
  };
}


export const ImagePicker = ({
  value, onChange, label, required = false, disabled = false,
  isPublic = false, hint, aspect, allowsEditing = true,
  quality = DEFAULT_QUALITY, enableCrop = false, initialPreset = AspectRatioPreset.Square,
}: Props): React.ReactElement => {
  const { data: content, isLoading: isContentLoading } = useContent(value);
  const preview = useContentPreviewUrl(isPublic, value);
  const crop = useImageCrop(initialPreset);

  const handlePickFile = useCallback(async (): Promise<FileInfo | null> => {
    const permissionResult = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== ExpoImagePicker.PermissionStatus.GRANTED) return null;

    const result = await ExpoImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing, aspect, quality });
    if (result.canceled === true || result.assets.length === 0) return null;

    const file = assetToFileInfo(result.assets[0]);
    if (enableCrop) return crop.requestCrop(file);
    return file;
  }, [allowsEditing, aspect, quality, enableCrop, crop]);

  return (
    <>
      <ContentUploader
        category={ContentCategory.Image}
        content={content}
        disabled={disabled}
        hint={hint ?? DEFAULT_HINT}
        isLoading={isContentLoading || preview.isLoading}
        isPublic={isPublic}
        label={label}
        previewError={preview.errorMessage}
        previewIsError={preview.isError}
        previewUrl={preview.url}
        required={required}
        value={value}
        onChange={onChange}
        onPickFile={handlePickFile}
        onPreviewRetry={preview.refetch}
      />
      {enableCrop && isValueDefined(crop.modalState) ? (
        <CropModal
          aspectPreset={crop.aspectPreset}
          aspectRatio={crop.aspectRatio}
          imageUri={crop.modalState.imageUri}
          visible={crop.modalState.isVisible}
          onApply={crop.onApply}
          onAspectChange={crop.setAspectPreset}
          onCancel={crop.onCancel}
        />
      ) : null}
    </>
  );
};


interface Props {
  value?: string;
  onChange?: (contentId: string | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  isPublic?: boolean;
  hint?: string;
  aspect?: [number, number];
  allowsEditing?: boolean;
  quality?: number;
  enableCrop?: boolean;
  initialPreset?: AspectRatioPreset;
}


function getFileNameFromUri(uri: string): string {
  const parts = uri.split('/');
  const fileName = parts[parts.length - 1];
  const nameWithoutQuery = fileName.split('?')[0];
  return nameWithoutQuery !== '' ? nameWithoutQuery : 'image.jpg';
}

function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

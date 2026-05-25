


/**
 * Video picker component for selecting and uploading videos.
 *
 * Uses expo-image-picker for video selection and ContentUploader for upload handling.
 * Shows a file size warning for large files.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import * as ExpoImagePicker from 'expo-image-picker';

import { FM } from '@/localization/helpers';

import { ContentUploader } from './ContentUploader';
import { MAX_FILE_SIZES, useContent, useContentUrl, usePublicContentUrl } from '../../../lib/hooks/content';
import ContentCategory from '../../../shared/enums/ContentCategory';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';

import type { FileInfo } from '../../../lib/hooks/content/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Bytes per kilobyte */
const BYTES_PER_KB = 1024;
/** Bytes per megabyte */
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
/** Bytes per gigabyte */
const BYTES_PER_GB = BYTES_PER_MB * BYTES_PER_KB;

/** Warning threshold in MB - show warning when file is larger than 100MB */
const WARNING_THRESHOLD_MB = 100;

// Warning threshold - show warning when file is larger than 100MB
const WARNING_THRESHOLD = WARNING_THRESHOLD_MB * BYTES_PER_MB;

const styles = StyleSheet.create({
  container: {},
  warning: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  /** Current content ID value (if already uploaded) */
  value?: string;
  /** Callback when video is uploaded or removed */
  onChange?: (contentId: string | null) => void;
  /** Optional label text */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether uploads should be public */
  isPublic?: boolean;
  /** Hint text to display in the upload area */
  hint?: string;
  /** Video quality preset */
  videoQuality?: ExpoImagePicker.UIImagePickerControllerQualityType;
  /** Maximum duration in seconds (optional) */
  videoMaxDuration?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts file name from URI.
 */
function getFileNameFromUri(uri: string): string {
  const parts = uri.split('/');
  const fileName = parts[parts.length - 1];
  const nameWithoutQuery = fileName.split('?')[0];
  return nameWithoutQuery !== '' ? nameWithoutQuery : 'video.mp4';
}

/**
 * Gets MIME type from file name.
 */
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'mp4') return 'video/mp4';
  if (extension === 'mov') return 'video/quicktime';
  if (extension === 'avi') return 'video/x-msvideo';
  if (extension === 'webm') return 'video/webm';
  return 'video/mp4';
}

/**
 * Formats bytes to human readable size.
 */
function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  if (bytes < BYTES_PER_GB) return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
  return `${(bytes / BYTES_PER_GB).toFixed(1)} GB`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const VideoPicker = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  isPublic = false,
  hint,
  videoQuality,
  videoMaxDuration,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const warningColor = theme.semantic.warning['500'];
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  // Fetch content data if we have a value
  const { data: content, isLoading: isContentLoading } = useContent(value);

  // Use public or authenticated URL based on isPublic prop
  const publicUrlQuery = usePublicContentUrl(isPublic ? value : undefined);
  const authenticatedUrlQuery = useContentUrl(isPublic ? undefined : value);
  const urlQuery = isPublic ? publicUrlQuery : authenticatedUrlQuery;
  const {
    data: urlData,
    isLoading: isUrlLoading,
    isError: isUrlError,
    error: urlError,
  } = urlQuery;

  // Determine loading state - loading content metadata or URL
  const isLoading = isContentLoading || isUrlLoading;

  // Format error message for display
  const getUrlErrorMessage = (): string | undefined => {
    if (!isUrlError) return undefined;
    return urlError instanceof Error ? urlError.message : 'Failed to load video URL';
  };
  const urlFetchError = getUrlErrorMessage();

  const warningStyles = useMemo(() => {
    const containerStyle = {
      backgroundColor: `${warningColor  }20`, // 20% opacity
    };
    const textStyle: TextStyle = {
      color: warningColor,
    };
    return { container: containerStyle, text: textStyle };
  }, [warningColor]);

  const handlePickFile = useCallback(async (): Promise<FileInfo | null> => {
    // Request permission
    const permissionResult = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== ExpoImagePicker.PermissionStatus.GRANTED)
      return null;


    // Launch video picker
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
      videoQuality,
      videoMaxDuration,
    });

    if (result.canceled === true || result.assets.length === 0) {
      setSelectedFileSize(null);
      return null;
    }

    const asset = result.assets[0];
    const fileName = getFileNameFromUri(asset.uri);
    const mimeType = asset.mimeType ?? getMimeType(fileName);
    const fileSize = asset.fileSize ?? 0;

    setSelectedFileSize(fileSize);

    return {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
      size: fileSize,
    };
  }, [videoQuality, videoMaxDuration]);

  const maxSizeMB = Math.round(MAX_FILE_SIZES.Video / BYTES_PER_MB);
  const displayHint = hint ?? `MP4, MOV, AVI, or WebM (max ${maxSizeMB}MB)`;

  const showSizeWarning =
    isValueDefined(selectedFileSize) &&
    selectedFileSize > WARNING_THRESHOLD &&
    selectedFileSize <= MAX_FILE_SIZES.Video;

  return (
    <View style={styles.container}>
      {showSizeWarning ? (
        <View style={[styles.warning, warningStyles.container]}>
          <Text style={[styles.warningText, warningStyles.text]}>
            {FM('content.largeFileWarning', formatFileSize(selectedFileSize))}
          </Text>
        </View>
      ) : null}
      <ContentUploader
        category={ContentCategory.Video}
        content={content}
        disabled={disabled}
        hint={displayHint}
        isLoading={isLoading}
        isPublic={isPublic}
        label={label}
        previewError={urlFetchError}
        previewUrl={urlData?.url ?? content?.thumbnailUrl}
        required={required}
        value={value}
        onChange={onChange}
        onPickFile={handlePickFile}
      />
    </View>
  );
}

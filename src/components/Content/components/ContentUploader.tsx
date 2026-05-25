


/**
 * Generic content uploader component.
 *
 * Wraps the file picker components with upload functionality,
 * progress tracking, and preview.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { ContentPreviewView, ErrorDisplay, type ThemeStyles, UploaderLabel, UploadProgressView } from './ContentUploaderViews';
import { useUploadContent } from '../../../lib/hooks/content';
import { DISABLED_OPACITY } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';

import type { ContentCategory, ContentDto, FileInfo } from '../../../lib/hooks/content/types';


const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  uploadButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  uploadText: {
    fontSize: 14,
  },
  uploadHint: {
    fontSize: 12,
    marginTop: 4,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  /** Current content ID value (if already uploaded) */
  value?: string;
  /** Callback when content is uploaded or removed */
  onChange?: (contentId: string | null) => void;
  /** Content category to accept */
  category: ContentCategory;
  /** Optional label text */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Whether uploads should be public */
  isPublic?: boolean;
  /** Function to open file picker - must be provided by parent */
  onPickFile: () => Promise<FileInfo | null>;
  /** Hint text to display in the upload area */
  hint?: string;
  /** Current content data (optional, for preview) */
  content?: ContentDto;
  /** URL for preview (optional) */
  previewUrl?: string;
  /** Error message from loading the preview URL */
  previewError?: string;
  /** Whether the preview URL query is in an error state */
  previewIsError?: boolean;
  /** Callback to retry loading the preview URL */
  onPreviewRetry?: () => void;
  /** Whether content metadata or URL is loading */
  isLoading?: boolean;
}

interface UploaderColors {
  text: string;
  surface: string;
  border: string;
  primary: string;
  textSecondary: string;
  error: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates theme styles for the uploader.
 */
function createUploaderThemeStyles(colors: UploaderColors, disabled: boolean): ThemeStyles {
  return {
    label: { color: colors.text },
    uploadButton: {
      backgroundColor: colors.surface,
      borderColor: disabled ? colors.border : colors.primary,
      opacity: disabled ? DISABLED_OPACITY : 1,
    },
    uploadText: { color: colors.primary },
    uploadHint: { color: colors.textSecondary },
    errorText: { color: colors.error },
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ContentUploader = ({
  value,
  onChange,
  category,
  label,
  required = false,
  disabled = false,
  isPublic = false,
  onPickFile,
  hint,
  content,
  previewUrl,
  previewError,
  previewIsError = false,
  onPreviewRetry,
  isLoading = false,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors: UploaderColors = useMemo(() => ({
    text: theme.colors.text,
    surface: theme.colors.surface,
    border: theme.colors.border,
    primary: theme.palette.primary['500'],
    textSecondary: theme.colors.textSecondary,
    error: theme.semantic.error['500'],
  }), [theme]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleUploadSuccess = useCallback((uploadedContent: ContentDto) => {
    setUploadError(null);
    setUploadedFileName(uploadedContent.fileName);
    if (isValueDefined(onChangeRef.current))
      onChangeRef.current(uploadedContent.id);
  }, []);

  const handleUploadError = useCallback((error: Error) => {
    setUploadError(error.message);
  }, []);

  const uploadOptions = useMemo(() => ({
    category,
    isPublic,
    onSuccess: handleUploadSuccess,
    onError: handleUploadError,
  }), [category, isPublic, handleUploadSuccess, handleUploadError]);

  const { upload, cancel, state, reset } = useUploadContent(uploadOptions);

  const themeStyles = useMemo<ThemeStyles>(() => createUploaderThemeStyles(colors, disabled), [colors, disabled]);

  const handlePickFile = useCallback(async () => {
    if (disabled) return;

    setUploadError(null);
    const file = await onPickFile();

    if (isValueDefined(file)) {
      setUploadedFileName(file.name);
      await upload(file);
    }
  }, [disabled, onPickFile, upload]);

  const handleDelete = useCallback(() => {
    reset();
    setUploadedFileName(null);
    setUploadError(null);
    if (isValueDefined(onChange))
      onChange(null);

  }, [onChange, reset]);

  const handleCancel = useCallback(() => {
    cancel();
    setUploadedFileName(null);
  }, [cancel]);

  // Show upload progress
  const isShowingProgress = state.isUploading && isValueDefined(uploadedFileName);
  if (isShowingProgress)
    return (
      <UploadProgressView
        disabled={disabled}
        label={label}
        progress={state.progress}
        required={required}
        themeStyles={themeStyles}
        uploadedFileName={uploadedFileName}
        onCancel={handleCancel}
      />
    );


  // Show content preview if we have a value
  const hasValue = isValueDefined(value) && value !== '';
  if (hasValue)
    return (
      <ContentPreviewView
        category={category}
        content={content}
        disabled={disabled}
        isLoading={isLoading}
        label={label}
        previewError={previewError}
        previewIsError={previewIsError}
        previewUrl={previewUrl}
        required={required}
        themeStyles={themeStyles}
        uploadedFileName={uploadedFileName}
        onDelete={handleDelete}
        onPreviewRetry={onPreviewRetry}
      />
    );


  // Show upload button
  const defaultHint = `Tap to select a ${category.toLowerCase()}`;
  const displayHint = hint ?? defaultHint;
  const buttonStyle: ViewStyle[] = [styles.uploadButton, themeStyles.uploadButton];

  return (
    <View style={styles.container} testID={TestIds.CONTENT_UPLOADER}>
      <UploaderLabel label={label} required={required} themeStyles={themeStyles} />
      <TouchableOpacity
        accessibilityHint={`Opens file picker to select a ${category.toLowerCase()} to upload`}
        accessibilityLabel={`Upload ${category.toLowerCase()}`}
        accessibilityRole="button"
        disabled={disabled}
        style={buttonStyle}
        testID={TestIds.CONTENT_UPLOADER_BUTTON}
        onPress={handlePickFile}
      >
        <Text style={[styles.uploadText, themeStyles.uploadText]}>{FM('common.upload')}</Text>
        <Text style={[styles.uploadHint, themeStyles.uploadHint]}>{displayHint}</Text>
      </TouchableOpacity>
      <ErrorDisplay stateError={state.error} themeStyles={themeStyles} uploadError={uploadError} />
    </View>
  );
};

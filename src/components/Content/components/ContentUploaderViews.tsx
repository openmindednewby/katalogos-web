


/**
 * Sub-components for ContentUploader.
 *
 * Extracted to reduce file size of main ContentUploader component.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { ContentPreview } from './ContentPreview';
import { UploadProgress } from './UploadProgress';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';

import type { ContentCategory, ContentDto } from '../../../lib/hooks/content/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeStyles {
  label: TextStyle;
  uploadButton: ViewStyle;
  uploadText: TextStyle;
  uploadHint: TextStyle;
  errorText: TextStyle;
}

interface LabelProps {
  label: string | undefined;
  required: boolean;
  themeStyles: ThemeStyles;
}

interface UploadProgressViewProps {
  label: string | undefined;
  required: boolean;
  themeStyles: ThemeStyles;
  disabled: boolean;
  uploadedFileName: string;
  progress: number;
  onCancel: () => void;
}

interface ContentPreviewViewProps {
  label: string | undefined;
  required: boolean;
  themeStyles: ThemeStyles;
  category: ContentCategory;
  content?: ContentDto;
  disabled: boolean;
  previewError?: string;
  previewIsError?: boolean;
  uploadedFileName: string | null;
  isLoading: boolean;
  previewUrl?: string;
  onDelete: () => void;
  onPreviewRetry?: () => void;
}

interface ErrorDisplayProps {
  uploadError: string | null;
  stateError: Error | null;
  themeStyles: ThemeStyles;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/**
 * Renders the optional label.
 */
export const UploaderLabel = ({ label, required, themeStyles }: LabelProps): React.ReactNode => {
  if (!isValueDefined(label))
    return null;

  return (
    <Text style={[styles.label, themeStyles.label]}>
      {label} {required ? '*' : ''}
    </Text>
  );
};

/**
 * Renders the upload progress view.
 */
export const UploadProgressView = ({
  label,
  required,
  themeStyles,
  disabled,
  uploadedFileName,
  progress,
  onCancel,
}: UploadProgressViewProps): React.ReactElement => (
  <View style={styles.container} testID={TestIds.CONTENT_UPLOADER}>
    <UploaderLabel label={label} required={required} themeStyles={themeStyles} />
    <UploadProgress disabled={disabled} fileName={uploadedFileName} progress={progress} onCancel={onCancel} />
  </View>
);

/**
 * Renders the content preview view.
 */
export const ContentPreviewView = ({
  label,
  required,
  themeStyles,
  category,
  content,
  disabled,
  previewError,
  previewIsError = false,
  uploadedFileName,
  isLoading,
  previewUrl,
  onDelete,
  onPreviewRetry,
}: ContentPreviewViewProps): React.ReactElement => (
  <View style={styles.container} testID={TestIds.CONTENT_UPLOADER}>
    <UploaderLabel label={label} required={required} themeStyles={themeStyles} />
    <ContentPreview
      category={category}
      content={content}
      disabled={disabled}
      error={previewError}
      fileName={uploadedFileName ?? content?.fileName}
      isError={previewIsError}
      isLoading={isLoading}
      url={previewUrl}
      onDelete={onDelete}
      onRetry={onPreviewRetry}
    />
  </View>
);

/**
 * Renders error messages.
 */
export const ErrorDisplay = ({ uploadError, stateError, themeStyles }: ErrorDisplayProps): React.ReactNode => {
  if (isValueDefined(uploadError))
    return (
      <Text style={[styles.errorText, themeStyles.errorText]} testID={TestIds.CONTENT_UPLOADER_ERROR}>
        {uploadError}
      </Text>
    );

  if (isValueDefined(stateError))
    return (
      <Text style={[styles.errorText, themeStyles.errorText]} testID={TestIds.CONTENT_UPLOADER_ERROR}>
        {stateError.message}
      </Text>
    );

  return null;
};

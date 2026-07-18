


/**
 * Sub-components for ContentUploader.
 *
 * Extracted to reduce file size of main ContentUploader component.
 */
import React from 'react';

import { StyleSheet, Text } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { ContentPreview } from './ContentPreview';
import { UploadProgress } from './UploadProgress';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { Field } from '../../Forms';

import type { ContentCategory, ContentDto } from '../../../lib/hooks/content/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeStyles {
  uploadButton: ViewStyle;
  uploadText: TextStyle;
  uploadHint: TextStyle;
  errorText: TextStyle;
}

interface UploadProgressViewProps {
  label: string | undefined;
  required: boolean;
  disabled: boolean;
  uploadedFileName: string;
  progress: number;
  onCancel: () => void;
}

interface ContentPreviewViewProps {
  label: string | undefined;
  required: boolean;
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
 * Renders the upload progress view.
 */
export const UploadProgressView = ({
  label,
  required,
  disabled,
  uploadedFileName,
  progress,
  onCancel,
}: UploadProgressViewProps): React.ReactElement => (
  <Field label={label} required={required} testID={TestIds.CONTENT_UPLOADER}>
    <UploadProgress disabled={disabled} fileName={uploadedFileName} progress={progress} onCancel={onCancel} />
  </Field>
);

/**
 * Renders the content preview view.
 */
export const ContentPreviewView = ({
  label,
  required,
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
  <Field label={label} required={required} testID={TestIds.CONTENT_UPLOADER}>
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
  </Field>
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

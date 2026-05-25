/**
 * Sub-components for ContentUploader.
 * Extracted to reduce main component file size.
 */
import React from 'react';

import { Text, View } from 'react-native';

import { ContentPreview } from './ContentPreview';
import { UploadProgress } from './UploadProgress';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { styles, type ThemeStyles } from '../utils/ContentUploader.styles';

import type { ContentCategory, ContentDto } from '../../../lib/hooks/content/types';

interface LabelProps {
  label: string | undefined;
  required: boolean;
  themeStyles: ThemeStyles;
}

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

interface UploadProgressViewProps {
  label: string | undefined;
  required: boolean;
  themeStyles: ThemeStyles;
  disabled: boolean;
  uploadedFileName: string;
  progress: number;
  onCancel: () => void;
}

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
    <UploadProgress
      disabled={disabled}
      fileName={uploadedFileName}
      progress={progress}
      onCancel={onCancel}
    />
  </View>
);

interface ContentPreviewViewProps {
  label: string | undefined;
  required: boolean;
  themeStyles: ThemeStyles;
  category: ContentCategory;
  content?: ContentDto;
  disabled: boolean;
  previewError?: string;
  uploadedFileName: string | null;
  isLoading: boolean;
  previewUrl?: string;
  onDelete: () => void;
}

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
  uploadedFileName,
  isLoading,
  previewUrl,
  onDelete,
}: ContentPreviewViewProps): React.ReactElement => (
  <View style={styles.container} testID={TestIds.CONTENT_UPLOADER}>
    <UploaderLabel label={label} required={required} themeStyles={themeStyles} />
    <ContentPreview
      category={category}
      content={content}
      disabled={disabled}
      error={previewError}
      fileName={uploadedFileName ?? content?.fileName}
      isLoading={isLoading}
      url={previewUrl}
      onDelete={onDelete}
    />
  </View>
);

interface ErrorDisplayProps {
  uploadError: string | null;
  stateError: Error | null;
  themeStyles: ThemeStyles;
}

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

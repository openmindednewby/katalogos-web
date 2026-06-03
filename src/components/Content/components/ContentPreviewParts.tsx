/**
 * Sub-components for ContentPreview.
 */
import React from 'react';

import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import ContentCategory from '../../../shared/enums/ContentCategory';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { styles, getDocumentIcon } from '../utils/ContentPreviewStyles';


import type { ThemeStyles } from '../utils/ContentPreviewStyles';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RETRY_BUTTON_MARGIN_TOP = 12;
const RETRY_BUTTON_PADDING_V = 6;
const RETRY_BUTTON_PADDING_H = 14;
const RETRY_BUTTON_BORDER_RADIUS = 6;
const RETRY_BUTTON_FONT_SIZE = 13;
const ERROR_STATE_PADDING = 12;
const RETRY_TEXT_COLOR = '#ffffff';

const errorStateStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: ERROR_STATE_PADDING,
  },
  retryButton: {
    marginTop: RETRY_BUTTON_MARGIN_TOP,
    paddingVertical: RETRY_BUTTON_PADDING_V,
    paddingHorizontal: RETRY_BUTTON_PADDING_H,
    borderRadius: RETRY_BUTTON_BORDER_RADIUS,
  },
  retryText: {
    fontSize: RETRY_BUTTON_FONT_SIZE,
    fontWeight: '600',
    color: RETRY_TEXT_COLOR,
  },
});

interface ImagePreviewProps {
  displayUrl: string;
  displayFileName: string;
}

const ImagePreviewContent = ({ displayUrl, displayFileName }: ImagePreviewProps): React.JSX.Element => (
  <Image
    accessibilityIgnoresInvertColors
    accessibilityHint={FM('content.imagePreviewHint')}
    accessibilityLabel={FM('content.imagePreviewLabel', displayFileName)}
    resizeMode="cover"
    source={{ uri: displayUrl }}
    style={styles.previewImage}
    testID={TestIds.CONTENT_PREVIEW_IMAGE}
  />
);

interface VideoPreviewProps {
  displayUrl: string | undefined;
  displayFileName: string;
  themeStyles: ThemeStyles;
}

const VideoPreviewContent = ({ displayUrl, displayFileName, themeStyles }: VideoPreviewProps): React.JSX.Element => {
  if (isValueDefined(displayUrl))
    return (
      <Image
        accessibilityIgnoresInvertColors
        accessibilityHint={FM('content.videoThumbnailHint')}
        accessibilityLabel={FM('content.videoThumbnailLabel', displayFileName)}
        resizeMode="cover"
        source={{ uri: displayUrl }}
        style={styles.previewImage}
        testID={TestIds.CONTENT_PREVIEW_VIDEO_THUMBNAIL}
      />
    );


  return (
    <View style={styles.documentIconContainer}>
      <Text style={[styles.documentIcon, themeStyles.documentIcon]}>{FM('common.video')}</Text>
      <Text ellipsizeMode="middle" numberOfLines={2} style={[styles.documentName, themeStyles.documentName]}>
        {displayFileName}
      </Text>
    </View>
  );
};

interface DocumentPreviewProps {
  displayFileName: string;
  contentType: string;
  themeStyles: ThemeStyles;
}

export const DocumentPreviewContent = ({ displayFileName, contentType, themeStyles }: DocumentPreviewProps): React.JSX.Element => (
  <>
    <Text style={[styles.documentIcon, themeStyles.documentIcon]}>{getDocumentIcon(contentType)}</Text>
    <Text ellipsizeMode="middle" numberOfLines={2} style={[styles.documentName, themeStyles.documentName]}>
      {displayFileName}
    </Text>
  </>
);

interface PreviewContentRendererProps {
  isLoading: boolean;
  error: string | undefined;
  isError: boolean;
  displayCategory: ContentCategory;
  displayUrl: string | undefined;
  displayFileName: string;
  themeStyles: ThemeStyles;
  primaryColor: string;
  onRetry?: () => void;
}

interface ErrorStateViewProps {
  error: string | undefined;
  themeStyles: ThemeStyles;
  primaryColor: string;
  onRetry?: () => void;
}

const ErrorStateView = ({ error, themeStyles, primaryColor, onRetry }: ErrorStateViewProps): React.JSX.Element => {
  const message = isValueDefined(error) && error !== '' ? error : FM('content.previewLoadError');
  return (
    <View style={errorStateStyles.container} testID={TestIds.ERROR_STATE}>
      <Text style={[styles.errorText, themeStyles.errorText]}>{message}</Text>
      {isValueDefined(onRetry) ? (
        <TouchableOpacity
          accessibilityHint={FM('content.retryPreviewHint')}
          accessibilityLabel={FM('content.retryPreview')}
          accessibilityRole="button"
          style={[errorStateStyles.retryButton, { backgroundColor: primaryColor }]}
          testID={TestIds.ERROR_STATE_RETRY}
          onPress={onRetry}
        >
          <Text style={errorStateStyles.retryText}>
            {FM('content.retryPreview')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const PreviewContentRenderer = ({
  isLoading,
  error,
  isError,
  displayCategory,
  displayUrl,
  displayFileName,
  themeStyles,
  primaryColor,
  onRetry,
}: PreviewContentRendererProps): React.ReactNode => {
  if (isLoading)
    return <ActivityIndicator color={primaryColor} size="large" />;


  if (isError || hasError(error))
    return <ErrorStateView error={error} primaryColor={primaryColor} themeStyles={themeStyles} onRetry={onRetry} />;


  const isImage = displayCategory === ContentCategory.Image && isValueDefined(displayUrl);
  if (isImage)
    return <ImagePreviewContent displayFileName={displayFileName} displayUrl={displayUrl} />;


  if (displayCategory === ContentCategory.Video)
    return <VideoPreviewContent displayFileName={displayFileName} displayUrl={displayUrl} themeStyles={themeStyles} />;


  return null;
};

interface PreviewContainerState {
  isLoading: boolean;
  error: string | undefined;
  isError: boolean;
  isDocumentPreview: boolean;
}

export function buildPreviewContainerStyles(
  themeStyles: ThemeStyles,
  state: PreviewContainerState,
): ViewStyle[] {
  const { isLoading, error, isError, isDocumentPreview } = state;
  const showErrorContainer = isError || hasError(error);
  const styleArray: Array<ViewStyle | null> = [
    styles.previewContainer,
    themeStyles.previewContainer,
    isLoading ? styles.loadingContainer : null,
    showErrorContainer ? styles.errorContainer : null,
    isDocumentPreview ? styles.documentIconContainer : null,
  ];
  return styleArray.filter((s): s is ViewStyle => isValueDefined(s));
}

function hasError(error: string | undefined): error is string {
  return isValueDefined(error) && error !== '';
}

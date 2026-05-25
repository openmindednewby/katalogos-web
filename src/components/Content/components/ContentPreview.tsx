


/**
 * Content preview component.
 *
 * Displays a preview of uploaded content (image, video thumbnail, or document icon).
 * Includes a delete button and loading state.
 */
import React, { useMemo } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { DocumentPreviewContent, PreviewContentRenderer, buildPreviewContainerStyles } from './ContentPreviewParts';
import ContentCategory from '../../../shared/enums/ContentCategory';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';
import {
  styles,
  createContainerStyles,
  createTextStyles,
  createFooterStyles,
  createDeleteStyles,
} from '../utils/ContentPreviewStyles';


import type { ContentDto } from '../../../lib/hooks/content/types';
import type { ThemeStyles, ThemeColors } from '../utils/ContentPreviewStyles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  content?: ContentDto;
  url?: string;
  category?: ContentCategory;
  fileName?: string;
  isLoading?: boolean;
  error?: string;
  isError?: boolean;
  onDelete?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
}

interface DeleteButtonProps {
  onDelete: () => void;
  disabled: boolean;
  isLoading: boolean;
  themeStyles: ThemeStyles;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts display values from props and content.
 */
function getDisplayValues(
  url: string | undefined,
  category: ContentCategory | undefined,
  fileName: string | undefined,
  content: ContentDto | undefined,
): { displayUrl: string | undefined; displayCategory: ContentCategory; displayFileName: string; contentType: string } {
  return {
    displayUrl: url ?? content?.url ?? content?.thumbnailUrl,
    displayCategory: category ?? content?.category ?? ContentCategory.Document,
    displayFileName: fileName ?? content?.fileName ?? 'Unknown file',
    contentType: content?.contentType ?? '',
  };
}

/**
 * Creates theme colors object from resolved theme.
 */
function buildThemeColors(theme: { colors: { surface: string; border: string; text: string }; palette: { primary: { '500': string } }; semantic: { error: { '500': string } } }): ThemeColors {
  return {
    surface: theme.colors.surface,
    border: theme.colors.border,
    primary: theme.palette.primary['500'],
    text: theme.colors.text,
    error: theme.semantic.error['500'],
  };
}

function createThemeStyles(colors: ThemeColors, errorColor: string, disabled: boolean): ThemeStyles {
  const containerStyles = createContainerStyles(colors);
  const textStyles = createTextStyles(colors);
  const deleteStyles = createDeleteStyles(colors, disabled);

  return {
    container: containerStyles.container,
    previewContainer: containerStyles.previewContainer,
    documentIcon: textStyles.documentIcon,
    documentName: textStyles.documentName,
    footer: createFooterStyles(colors),
    fileName: textStyles.fileName,
    deleteButton: deleteStyles.button,
    deleteText: deleteStyles.text,
    errorText: { color: errorColor },
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const DeleteButton = ({ onDelete, disabled, isLoading, themeStyles }: DeleteButtonProps): React.JSX.Element => (
  <TouchableOpacity
    accessibilityHint={FM('content.deleteContentHint')}
    accessibilityLabel={FM('content.deleteContentLabel')}
    accessibilityRole="button"
    disabled={disabled || isLoading}
    style={[styles.deleteButton, themeStyles.deleteButton]}
    testID={TestIds.CONTENT_PREVIEW_DELETE_BUTTON}
    onPress={onDelete}
  >
    <Text style={[styles.deleteText, themeStyles.deleteText]}>{FM('common.delete')}</Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ContentPreview = ({
  content,
  url,
  category,
  fileName,
  isLoading = false,
  error,
  isError = false,
  onDelete,
  onRetry,
  disabled = false,
}: Props): React.JSX.Element => {
  const { theme } = useTheme();
  const errorColor = theme.semantic.error['500'];
  const primary = theme.palette.primary['500'];

  const { displayUrl, displayCategory, displayFileName, contentType } = getDisplayValues(url, category, fileName, content);

  const themeColors = useMemo(() => buildThemeColors(theme), [theme]);
  const themeStyles = useMemo<ThemeStyles>(
    () => createThemeStyles(themeColors, errorColor, disabled),
    [themeColors, errorColor, disabled],
  );

  const previewContent = PreviewContentRenderer({
    isLoading,
    error,
    isError,
    displayCategory,
    displayUrl,
    displayFileName,
    themeStyles,
    primaryColor: primary,
    onRetry,
  });

  const isDocumentPreview = !isValueDefined(previewContent);
  const previewContainerStyles = buildPreviewContainerStyles(themeStyles, {
    isLoading,
    error,
    isError,
    isDocumentPreview,
  });
  const documentTestId = isDocumentPreview ? TestIds.CONTENT_PREVIEW_DOCUMENT : undefined;

  return (
    <View style={[styles.container, themeStyles.container]} testID={TestIds.CONTENT_PREVIEW}>
      <View style={previewContainerStyles} testID={documentTestId}>
        {isDocumentPreview ? (
          <DocumentPreviewContent contentType={contentType} displayFileName={displayFileName} themeStyles={themeStyles} />
        ) : (
          previewContent
        )}
      </View>
      <View style={[styles.footer, themeStyles.footer]}>
        <Text ellipsizeMode="middle" numberOfLines={1} style={[styles.fileName, themeStyles.fileName]}>
          {displayFileName}
        </Text>
        {isValueDefined(onDelete) ? (
          <DeleteButton disabled={disabled} isLoading={isLoading} themeStyles={themeStyles} onDelete={onDelete} />
        ) : null}
      </View>
    </View>
  );
};

/**
 * Content Image component.
 *
 * Fetches and displays an image from the Content Service using its content ID.
 *
 * Option B (#238B): the image bytes are served same-origin THROUGH the BFF
 * (`/bff/api/content/.../download`) rather than via a resolved S3 URL. The old
 * `/url` + `/public-url` endpoints returned a presigned/public S3 URL on the
 * INTERNAL host (`http://seaweedfs-s3:8333`) that the browser cannot reach, so
 * images were blank after reload. A same-origin GET carries the BFF session
 * cookie, which the BFF swaps for a bearer before proxying to content-api.
 */
import React, { useMemo } from 'react';

import {
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type { DimensionValue, ImageStyle, StyleProp, ViewStyle } from 'react-native';

import { BFF_API_BASE } from '../../../server/bffRoutes';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_HEIGHT = 150;
const DEFAULT_BORDER_RADIUS = 8;

// ContentService is reached same-origin through the BFF (`/bff/api/content`),
// which does segment passthrough to content-api and attaches the bearer.
const CONTENT_API_BASE = BFF_API_BASE.content;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  /**
   * The content ID from the Content Service.
   * If undefined or empty, nothing is rendered.
   */
  contentId: string | null | undefined;

  /**
   * Optional style for the container.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Optional style for the image.
   */
  imageStyle?: StyleProp<ImageStyle>;

  /**
   * Optional test ID for the container.
   */
  testID?: string;

  /**
   * Optional accessibility label for the image.
   */
  accessibilityLabel?: string;

  /**
   * Optional accessibility hint for the image.
   */
  accessibilityHint?: string;

  /**
   * Optional width for the image container.
   * Defaults to 100%.
   */
  width?: DimensionValue;

  /**
   * Optional height for the image container.
   * Defaults to 150.
   */
  height?: DimensionValue;

  /**
   * Optional border radius.
   * Defaults to 8.
   */
  borderRadius?: number;

  /**
   * Whether to use the public (unauthenticated) streaming endpoint.
   * Set to true for public pages where users may not be logged in.
   * Defaults to false (authenticated).
   */
  isPublic?: boolean;
}

interface ImageContentProps {
  containerStyle: ViewStyle;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  url: string;
  borderRadius: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a content ID is valid (non-empty string).
 */
function isValidContentId(contentId: string | null | undefined): contentId is string {
  return isValueDefined(contentId) && contentId !== '';
}

/**
 * Builds the same-origin BFF streaming URI for a content image.
 * Authenticated callers hit `/download`; public pages hit `/public-download`.
 */
function buildStreamUri(contentId: string, isPublic: boolean): string {
  const path = isPublic ? 'public-download' : 'download';
  return `${CONTENT_API_BASE}/api/v1/content/${contentId}/${path}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** CSS for the web lazy <img> — fills the sized container and keeps cover crop. */
function webImageStyle(borderRadius: number): React.CSSProperties {
  return { width: '100%', height: '100%', objectFit: 'cover', borderRadius };
}

/**
 * Renders the actual image content.
 */
const ImageContent = ({
  containerStyle,
  style,
  imageStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  url,
  borderRadius,
}: ImageContentProps): React.ReactElement => (
  <View style={[styles.container, containerStyle, style]} testID={testID}>
    {Platform.OS === 'web' ? (
      // Native lazy-loading on web: RN-web's Image cannot emit loading/decoding,
      // so a real <img> defers off-screen menu images (Lighthouse + bandwidth win).
      <img
        alt={accessibilityLabel ?? 'Content image'}
        decoding="async"
        loading="lazy"
        src={url}
        style={webImageStyle(borderRadius)}
      />
    ) : (
      <Image
        accessibilityIgnoresInvertColors
        accessibilityHint={accessibilityHint ?? 'Displays content image'}
        accessibilityLabel={accessibilityLabel ?? 'Content image'}
        resizeMode="cover"
        source={{ uri: url }}
        style={[styles.image, { borderRadius }, imageStyle]}
      />
    )}
  </View>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ContentImage = ({
  contentId,
  style,
  imageStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  width,
  height = DEFAULT_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
  isPublic = false,
}: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const surfaceColor = theme.colors.surface;
  const hasContentId = isValidContentId(contentId);

  const containerStyle = useMemo<ViewStyle>(() => ({
    width: width ?? '100%',
    height,
    borderRadius,
    backgroundColor: surfaceColor,
  }), [width, height, borderRadius, surfaceColor]);

  const url = useMemo(
    () => (hasContentId ? buildStreamUri(contentId, isPublic) : ''),
    [hasContentId, contentId, isPublic],
  );

  if (!hasContentId) return null;

  return (
    <ImageContent
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      borderRadius={borderRadius}
      containerStyle={containerStyle}
      imageStyle={imageStyle}
      style={style}
      testID={testID}
      url={url}
    />
  );
};

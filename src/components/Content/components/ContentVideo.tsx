


/**
 * Displays a video from the Content Service.
 * Fetches the content URL using the provided content ID.
 */
/**
 * Content Video component.
 *
 * Fetches and displays a video from the Content Service using its content ID.
 * Handles loading states, errors, and provides a consistent display for content videos.
 *
 * On web: Uses HTML5 video element for playback.
 * On native: Displays a placeholder with play icon (requires expo-av for full playback).
 */
import React, { useMemo } from 'react';

import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { VideoContent, VideoLoadingState } from './ContentVideoParts';
import { useContentUrl, usePublicContentUrl } from '../../../lib/hooks/content';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';

import type { ContentUrlResponse } from '../../../lib/hooks/content';
import type { UseQueryResult } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_HEIGHT = 200;
const DEFAULT_BORDER_RADIUS = 8;
const DEFAULT_WIDTH: DimensionValue = '100%';

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
   * Optional test ID for the container.
   */
  testID?: string;

  /**
   * Optional accessibility label for the video.
   */
  accessibilityLabel?: string;

  /**
   * Optional accessibility hint for the video.
   */
  accessibilityHint?: string;

  /**
   * Optional width for the video container.
   * Defaults to 100%.
   */
  width?: number | string;

  /**
   * Optional height for the video container.
   * Defaults to 200.
   */
  height?: number | string;

  /**
   * Optional border radius.
   * Defaults to 8.
   */
  borderRadius?: number;

  /**
   * Whether to use public (unauthenticated) URL fetching.
   * Set to true for public pages where users may not be logged in.
   * Defaults to false (authenticated).
   */
  isPublic?: boolean;

  /**
   * Whether video controls should be shown.
   * Defaults to true.
   */
  showControls?: boolean;

  /**
   * Whether video should autoplay (muted).
   * Defaults to false.
   */
  autoPlay?: boolean;

  /**
   * Whether video should loop.
   * Defaults to false.
   */
  loop?: boolean;

  /**
   * Whether video should be muted.
   * Defaults to true when autoPlay is true, false otherwise.
   */
  muted?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a number or string dimension to a DimensionValue.
 * Numbers are passed through; strings are treated as percentage/auto values.
 */
function toDimensionValue(value: number | string | undefined, fallback: DimensionValue): DimensionValue {
  if (!isValueDefined(value)) return fallback;
  if (typeof value === 'number') return value;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- string dimensions from props are assumed valid DimensionValue patterns
  return value as DimensionValue;
}

/**
 * Checks if a content ID is valid (non-empty string).
 */
function isValidContentId(contentId: string | null | undefined): contentId is string {
  return isValueDefined(contentId) && contentId !== '';
}

/**
 * Checks if the URL data contains a valid URL.
 */
function hasValidUrl(urlData: ContentUrlResponse | undefined): urlData is ContentUrlResponse & { url: string } {
  return isValueDefined(urlData?.url) && urlData.url !== '';
}

/**
 * Custom hook to fetch the content URL based on public/authenticated mode.
 */
function useContentQuery(contentIdForQuery: string | undefined, isPublic: boolean): UseQueryResult<ContentUrlResponse> {
  const authenticatedQuery = useContentUrl(isPublic ? undefined : contentIdForQuery);
  const publicQuery = usePublicContentUrl(isPublic ? contentIdForQuery : undefined);
  return isPublic ? publicQuery : authenticatedQuery;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ContentVideo = ({
  contentId,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  width,
  height = DEFAULT_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
  isPublic = false,
  showControls = true,
  autoPlay = false,
  loop = false,
  muted,
}: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const surfaceColor = theme.colors.surface;
  const primary = theme.palette.primary['500'];
  const textColor = theme.colors.text;

  const hasContentId = isValidContentId(contentId);
  const contentIdForQuery = hasContentId ? contentId : undefined;
  const queryResult = useContentQuery(contentIdForQuery, isPublic);
  const { data: urlData, isLoading, isError } = queryResult;

  const containerWidth = toDimensionValue(width, DEFAULT_WIDTH);
  const containerHeight = toDimensionValue(height, DEFAULT_HEIGHT);
  const containerStyle = useMemo<ViewStyle>(() => ({
    width: containerWidth,
    height: containerHeight,
    borderRadius,
    backgroundColor: surfaceColor,
  }), [containerWidth, containerHeight, borderRadius, surfaceColor]);

  const effectiveMuted = muted ?? autoPlay;
  const resolvedWidth = width ?? DEFAULT_WIDTH;

  if (!hasContentId)
    return null;


  if (isLoading)
    return (
      <VideoLoadingState
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        containerStyle={containerStyle}
        primaryColor={primary}
        style={style}
        testID={testID}
      />
    );


  const shouldNotRender = isError || !hasValidUrl(urlData);
  if (shouldNotRender)
    return null;


  return (
    <VideoContent
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      autoPlay={autoPlay}
      borderRadius={borderRadius}
      containerStyle={containerStyle}
      effectiveMuted={effectiveMuted}
      height={height}
      loop={loop}
      primaryColor={primary}
      showControls={showControls}
      style={style}
      testID={testID}
      textColor={textColor}
      url={urlData.url}
      width={resolvedWidth}
    />
  );
};

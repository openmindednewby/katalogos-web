


import React, { useMemo } from 'react';

import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { VideoContent, VideoLoadingState } from './ContentVideoParts';
import { useContentUrl, usePublicContentUrl } from '../../../lib/hooks/content';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';

import type { ContentUrlResponse } from '../../../lib/hooks/content';
import type { UseQueryResult } from '@tanstack/react-query';


const DEFAULT_HEIGHT = 200;
const DEFAULT_BORDER_RADIUS = 8;
const DEFAULT_WIDTH: DimensionValue = '100%';


interface Props {
  contentId: string | null | undefined;

  style?: StyleProp<ViewStyle>;

  testID?: string;

  accessibilityLabel?: string;

  accessibilityHint?: string;

  width?: number | string;

  height?: number | string;

  borderRadius?: number;

  isPublic?: boolean;

  showControls?: boolean;

  autoPlay?: boolean;

  loop?: boolean;

  muted?: boolean;
}


function toDimensionValue(value: number | string | undefined, fallback: DimensionValue): DimensionValue {
  if (!isValueDefined(value)) return fallback;
  if (typeof value === 'number') return value;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- string dimensions from props are assumed valid DimensionValue patterns
  return value as DimensionValue;
}

function isValidContentId(contentId: string | null | undefined): contentId is string {
  return isValueDefined(contentId) && contentId !== '';
}

function hasValidUrl(urlData: ContentUrlResponse | undefined): urlData is ContentUrlResponse & { url: string } {
  return isValueDefined(urlData?.url) && urlData.url !== '';
}

function useContentQuery(contentIdForQuery: string | undefined, isPublic: boolean): UseQueryResult<ContentUrlResponse> {
  const authenticatedQuery = useContentUrl(isPublic ? undefined : contentIdForQuery);
  const publicQuery = usePublicContentUrl(isPublic ? contentIdForQuery : undefined);
  return isPublic ? publicQuery : authenticatedQuery;
}


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

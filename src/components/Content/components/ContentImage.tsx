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


const DEFAULT_HEIGHT = 150;
const DEFAULT_BORDER_RADIUS = 8;

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


interface Props {
  contentId: string | null | undefined;

  style?: StyleProp<ViewStyle>;

  imageStyle?: StyleProp<ImageStyle>;

  testID?: string;

  accessibilityLabel?: string;

  accessibilityHint?: string;

  width?: DimensionValue;

  height?: DimensionValue;

  borderRadius?: number;

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


function isValidContentId(contentId: string | null | undefined): contentId is string {
  return isValueDefined(contentId) && contentId !== '';
}

function buildStreamUri(contentId: string, isPublic: boolean): string {
  const path = isPublic ? 'public-download' : 'download';
  return `${CONTENT_API_BASE}/api/v1/content/${contentId}/${path}`;
}


function webImageStyle(borderRadius: number): React.CSSProperties {
  return { width: '100%', height: '100%', objectFit: 'cover', borderRadius };
}

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

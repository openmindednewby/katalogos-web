


/**
 * Sub-components for ContentVideo.
 */
import React from 'react';

import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { SvgIcon } from '../../Icons';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    opacity: 0.8,
  },
  videoLabel: {
    fontSize: 12,
    marginTop: 8,
  },
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/**
 * Web video component using HTML5 video element.
 */
interface WebVideoProps {
  url: string;
  width: number | string;
  height: number | string;
  borderRadius: number;
  showControls: boolean;
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const WebVideo = ({
  url,
  width,
  height,
  borderRadius,
  showControls,
  autoPlay,
  loop,
  muted,
  accessibilityLabel,
  accessibilityHint,
}: WebVideoProps): React.ReactElement => {
  const videoStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius,
    objectFit: 'cover' as const,
  };

  const ariaDescription = accessibilityHint ?? 'Video playback control';

  return (
    <video
      playsInline
      aria-describedby={ariaDescription}
      aria-label={accessibilityLabel ?? 'Video content'}
      autoPlay={autoPlay}
      controls={showControls}
      loop={loop}
      muted={muted}
      style={videoStyle}
    >
      <source src={url} type="video/mp4" />
      <source src={url} type="video/webm" />
    </video>
  );
};

/**
 * Native placeholder component showing play icon.
 * Full native video playback requires expo-av package.
 */
interface NativePlaceholderProps {
  textColor: string;
  primaryColor: string;
}

const NativePlaceholder = ({
  textColor,
  primaryColor,
}: NativePlaceholderProps): React.ReactElement => (
  <View style={styles.placeholderContainer}>
    <View style={styles.playIconContainer}>
      <SvgIcon color={primaryColor} name="play" size={48} />
    </View>
    <Text style={[styles.videoLabel, { color: textColor }]}>{FM('common.videoLabel')}</Text>
  </View>
);

interface VideoLoadingStateProps {
  containerStyle: ViewStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  primaryColor: string;
}

/**
 * Renders the loading state for the video.
 */
export const VideoLoadingState = ({
  containerStyle,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  primaryColor,
}: VideoLoadingStateProps): React.ReactElement => (
  <View
    accessibilityHint={accessibilityHint ?? 'Loading video content'}
    accessibilityLabel={accessibilityLabel ?? 'Loading video'}
    style={[styles.container, styles.loadingContainer, containerStyle, style]}
    testID={testID}
  >
    <ActivityIndicator color={primaryColor} size="small" />
  </View>
);

interface VideoContentProps {
  containerStyle: ViewStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  url: string;
  width: number | string;
  height: number | string;
  borderRadius: number;
  showControls: boolean;
  autoPlay: boolean;
  loop: boolean;
  effectiveMuted: boolean;
  textColor: string;
  primaryColor: string;
}

/**
 * Renders the video content (web or native placeholder).
 */
export const VideoContent = ({
  containerStyle,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  url,
  width,
  height,
  borderRadius,
  showControls,
  autoPlay,
  loop,
  effectiveMuted,
  textColor,
  primaryColor,
}: VideoContentProps): React.ReactElement => {
  const isWeb = Platform.OS === 'web';

  return (
    <View
      accessibilityHint={accessibilityHint ?? 'Displays video content'}
      accessibilityLabel={accessibilityLabel ?? 'Video content'}
      style={[styles.container, containerStyle, style]}
      testID={testID}
    >
      {isWeb ? (
        <WebVideo
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          autoPlay={autoPlay}
          borderRadius={borderRadius}
          height={height}
          loop={loop}
          muted={effectiveMuted}
          showControls={showControls}
          url={url}
          width={width}
        />
      ) : (
        <NativePlaceholder
          primaryColor={primaryColor}
          textColor={textColor}
        />
      )}
    </View>
  );
};

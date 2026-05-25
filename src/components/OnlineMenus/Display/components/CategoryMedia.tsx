


// =============================================================================
// Component
// =============================================================================

/**
 * CategoryMedia component for rendering category images and videos with overlay.
 */
/**
 * CategoryMedia - Renders category image/video with overlay support.
 *
 * Handles media display including:
 * - Position-based layout (background, left, right, top, bottom)
 * - Size and fit settings
 * - Optional overlay with configurable color and opacity
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */
import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';
import type { DimensionValue, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import MediaPosition from '../../../../types/enums/MediaPosition';
import { isValueDefined } from '../../../../utils/is';
import { DEFAULT_CATEGORY_IMAGE_SETTINGS } from '../../../../utils/menuDefaults';
import { generateMediaStyles } from '../../../../utils/menuStyleGenerator';
import { ContentImage, ContentVideo } from '../../../Content';


import type { OverlaySettings } from '../../../../types/menuStyleTypes';
import type { Category, MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  /** The category containing media settings */
  category: Category;
  /** Global menu styles for color scheme */
  globalStyles?: MenuContents;
  /** Whether media should be positioned as background */
  isBackground: boolean;
}

interface OverlayViewProps {
  overlay: OverlaySettings;
  categoryId: string | undefined;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MEDIA_HEIGHT = 120;
const DEFAULT_VIDEO_HEIGHT = 150;
const DEFAULT_BORDER_RADIUS = 8;

/**
 * Resolves media dimensions based on whether the media is a background.
 */
const FULL_SIZE_IMAGE: DimensionValue = '100%';
const FULL_SIZE_VIDEO = '100%';

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  mediaContainer: {
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mediaWrapper: {
    marginBottom: 12,
  },
  horizontalMedia: {
    flex: 1,
    marginRight: 12,
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Checks if overlay settings are valid and enabled.
 */
function isOverlayEnabled(overlay: OverlaySettings | undefined): overlay is OverlaySettings {
  return isValueDefined(overlay) && overlay.enabled === true;
}

/**
 * Gets media container style based on position.
 */
function getMediaContainerStyle(isBackground: boolean, isHorizontal: boolean): ViewStyle {
  if (isBackground) return styles.backgroundContainer;
  if (isHorizontal) return styles.horizontalMedia;
  return styles.mediaWrapper;
}

/**
 * Checks if media position is horizontal (left or right).
 */
function isHorizontalPosition(category: Category): boolean {
  const position = category.imageSettings?.position ?? DEFAULT_CATEGORY_IMAGE_SETTINGS.position;
  return position === MediaPosition.Left || position === MediaPosition.Right;
}

/**
 * Extracts media flags from a category.
 */
function getCategoryMediaFlags(category: Category): { hasImage: boolean; hasVideo: boolean } {
  const imageContentId = category.imageContentId;
  const videoContentId = category.videoContentId;
  const hasImage = isValueDefined(imageContentId) && imageContentId !== '';
  const hasVideo = isValueDefined(videoContentId) && videoContentId !== '';
  return { hasImage, hasVideo };
}

function getMediaDimensions(
  isBackground: boolean,
  _borderRadius: number,
): { imageHeight: DimensionValue; videoHeight: number | string } {
  const imageHeight: DimensionValue = isBackground ? FULL_SIZE_IMAGE : DEFAULT_MEDIA_HEIGHT;
  const videoHeight: number | string = isBackground ? FULL_SIZE_VIDEO : DEFAULT_VIDEO_HEIGHT;
  return { imageHeight, videoHeight };
}

// =============================================================================
// Sub-Components
// =============================================================================

/**
 * Renders the overlay layer for media.
 */
const OverlayView: React.FC<OverlayViewProps> = ({ overlay, categoryId }) => {
  const overlayStyle = useMemo<ViewStyle>(() => ({
    ...styles.overlay,
    backgroundColor: overlay.color,
    opacity: overlay.opacity,
  }), [overlay.color, overlay.opacity]);

  return (
    <View
      pointerEvents="none"
      style={overlayStyle}
      testID={`${TestIds.MEDIA_PREVIEW}-overlay-${categoryId ?? 'unknown'}`}
    />
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const CategoryMedia: React.FC<Props> = ({
  category,
  globalStyles: _globalStyles,
  isBackground,
}) => {
  const categoryId = category.id ?? category.name;
  const imageSettings = category.imageSettings ?? DEFAULT_CATEGORY_IMAGE_SETTINGS;
  const overlay = imageSettings.overlay;

  const { hasImage, hasVideo } = getCategoryMediaFlags(category);
  const showOverlay = isOverlayEnabled(overlay);

  const isHorizontal = isHorizontalPosition(category);
  const containerStyle = getMediaContainerStyle(isBackground, isHorizontal);

  const mediaStyles = useMemo(
    () => generateMediaStyles(imageSettings),
    [imageSettings],
  );

  const borderRadius = Number(mediaStyles.borderRadius ?? DEFAULT_BORDER_RADIUS);
  const { imageHeight, videoHeight } = getMediaDimensions(isBackground, borderRadius);

  const hasNoMedia = !hasImage && !hasVideo;
  if (hasNoMedia) return null;

  return (
    <View
      style={[styles.mediaContainer, containerStyle, { borderRadius }]}
      testID={`${TestIds.MEDIA_PREVIEW}-${categoryId}`}
    >
      {hasImage ? <ContentImage
          accessibilityHint={FM('accessibility.categoryImageHint', category.name ?? FM('onlineMenus.category'))}
          accessibilityLabel={FM('accessibility.categoryImageAlt', category.name ?? FM('onlineMenus.category'))}
          borderRadius={borderRadius}
          contentId={category.imageContentId}
          height={imageHeight}
          testID={`${TestIds.CONTENT_IMAGE_CATEGORY}-${categoryId}`}
        /> : null}

      {hasVideo && !hasImage ? <ContentVideo
          accessibilityHint={FM('accessibility.categoryVideoHint', category.name ?? FM('onlineMenus.category'))}
          accessibilityLabel={FM('accessibility.categoryVideoAlt', category.name ?? FM('onlineMenus.category'))}
          contentId={category.videoContentId}
          height={videoHeight}
          testID={`${TestIds.CONTENT_VIDEO_CATEGORY}-${categoryId}`}
        /> : null}

      {showOverlay ? <OverlayView categoryId={categoryId} overlay={overlay} /> : null}
    </View>
  );
};

export default CategoryMedia;

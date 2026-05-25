

/**
 * ItemImage - Renders the menu item image with proper positioning.
 */
import React from 'react';

import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import MediaPosition from '../../../../types/enums/MediaPosition';
import { ContentImage } from '../../../Content';
import {
  getImageSize,
  styles,
  DEFAULT_IMAGE_BORDER_RADIUS,
} from '../utils/menuItemDisplayStyles';



import type { MediaSettings } from '../../../../types/menuStyleTypes';

interface Props {
  contentId: string | null | undefined;
  itemName: string;
  position: MediaPosition;
  settings?: MediaSettings;
  testID: string;
  isPublic?: boolean;
}

/**
 * Renders the image for a menu item based on position settings.
 */
const ItemImage: React.FC<Props> = ({
  contentId,
  itemName,
  position,
  settings,
  testID,
  isPublic = false,
}) => {
  if (position === MediaPosition.None) return null;

  const imageSize = getImageSize(settings?.size);
  const borderRadius = settings?.borderRadius ?? DEFAULT_IMAGE_BORDER_RADIUS;
  const isHorizontal = position === MediaPosition.Left || position === MediaPosition.Right;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.imageContainer,
    isHorizontal ? styles.imageHorizontal : styles.imageVertical,
    { borderRadius },
  ];

  const imageHeight = isHorizontal ? imageSize : imageSize;
  const imageWidth = isHorizontal ? imageSize : undefined;

  return (
    <View style={containerStyle}>
      <ContentImage
        accessibilityHint={FM('accessibility.itemImageHint', itemName)}
        accessibilityLabel={FM('accessibility.itemImageAlt', itemName)}
        borderRadius={borderRadius}
        contentId={contentId}
        height={imageHeight}
        isPublic={isPublic}
        testID={testID}
        width={imageWidth}
      />
    </View>
  );
};

export default ItemImage;

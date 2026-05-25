


/**
 * AvailabilityBadge - Displays the availability status badge.
 */
import React from 'react';

import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import BadgePosition from '../../../../types/enums/BadgePosition';
import { styles } from '../utils/menuItemDisplayStyles';

import type { AvailabilityBadgeStyle } from '../../../../types/menuStyleTypes';

interface Props {
  isAvailable: boolean;
  badgeStyle?: AvailabilityBadgeStyle;
  testID: string;
}

const DEFAULT_UNAVAILABLE_BG = '#EF4444';
const DEFAULT_UNAVAILABLE_TEXT = '#FFFFFF';

/**
 * Gets the position style for the badge.
 */
function getBadgePositionStyle(position?: BadgePosition): StyleProp<ViewStyle> {
  if (position === BadgePosition.TopLeft) return styles.badgeTopLeft;
  if (position === BadgePosition.BottomLeft) return styles.badgeBottomLeft;
  if (position === BadgePosition.BottomRight) return styles.badgeBottomRight;
  return styles.badgeTopRight;
}

/**
 * Renders an availability badge when item is unavailable.
 */
const AvailabilityBadge: React.FC<Props> = ({
  isAvailable,
  badgeStyle,
  testID,
}) => {

  const showBadge = badgeStyle?.show ?? true;
  if (isAvailable || !showBadge) return null;

  const text = badgeStyle?.unavailableText ?? FM('menuItem.unavailable');
  const backgroundColor = badgeStyle?.unavailableBackgroundColor ?? DEFAULT_UNAVAILABLE_BG;
  const textColor = badgeStyle?.unavailableColor ?? DEFAULT_UNAVAILABLE_TEXT;
  const positionStyle = getBadgePositionStyle(badgeStyle?.position);

  return (
    <View
      accessibilityHint={FM('onlineMenus.display.unavailableBadgeHint')}
      accessibilityLabel={text}
      style={[styles.badge, positionStyle, { backgroundColor }]}
      testID={testID}
    >
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

export default AvailabilityBadge;

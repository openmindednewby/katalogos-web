/**
 * DietaryTagBadge - Colored badge displaying a dietary tag (icon + name).
 *
 * Used on menu item cards in both admin and public views.
 * Renders a small pill-shaped badge with the tag's color as background tint.
 */
import React, { useMemo } from 'react';

import { Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { BADGE_OPACITY } from '../utils/dietaryTagConstants';
import { badgeStyles } from '../utils/dietaryTagStyles';
import { hexToRgba } from '../utils/hexToRgba';

import type { DietaryTagDto } from '../../../../lib/hooks/dietaryTag/types';

interface DietaryTagBadgeProps {
  tag: DietaryTagDto;
  testID?: string;
}

export const DietaryTagBadge: React.FC<DietaryTagBadgeProps> = ({
  tag,
  testID = 'dietary-tag-badge',
}) => {
  const backgroundStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: hexToRgba(tag.color, BADGE_OPACITY),
  }), [tag.color]);

  return (
    <View
      accessibilityHint={FM('dietaryTags.tagBadgeHint', tag.name)}
      accessibilityLabel={tag.name}
      style={[badgeStyles.badge, backgroundStyle]}
      testID={`${testID}-${tag.key}`}
    >
      <Text style={[badgeStyles.iconText, { color: tag.color }]}>
        {tag.icon}
      </Text>
      <Text style={[badgeStyles.badgeText, { color: tag.color }]}>
        {tag.name}
      </Text>
    </View>
  );
};

export default DietaryTagBadge;

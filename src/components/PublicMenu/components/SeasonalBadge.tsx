/**
 * SeasonalBadge - Small badge indicating an item has seasonal availability.
 * Shown on menu items in both the editor and public menu.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { hasSeasonalAvailability } from '../../OnlineMenus/utils/seasonalUtils';

interface Props {
  availableFrom: string | null | undefined;
  availableTo: string | null | undefined;
  primaryColor: string;
  textOnPrimary: string;
}

const BADGE_BORDER_RADIUS = 4;
const BADGE_FONT_SIZE = 10;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BADGE_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '600',
  },
});

const SeasonalBadge: React.FC<Props> = ({
  availableFrom, availableTo, primaryColor, textOnPrimary,
}) => {
  if (!hasSeasonalAvailability(availableFrom, availableTo)) return null;

  return (
    <View
      accessibilityHint={FM('onlineMenus.seasonal.badgeHint')}
      accessibilityLabel={FM('onlineMenus.seasonal.badge')}
      style={[styles.badge, { backgroundColor: primaryColor }]}
      testID={TestIds.SEASONAL_BADGE}
    >
      <Text style={[styles.badgeText, { color: textOnPrimary }]}>
        {FM('onlineMenus.seasonal.badge')}
      </Text>
    </View>
  );
};

export default SeasonalBadge;

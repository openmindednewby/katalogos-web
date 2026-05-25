import React, { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';
import PopularityTier from '@/shared/enums/PopularityTier';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

const BADGE_PADDING_VERTICAL = 2;
const BADGE_PADDING_HORIZONTAL = 8;
const BADGE_BORDER_RADIUS = 10;
const BADGE_FONT_SIZE = 11;

const styles = StyleSheet.create({
  badge: {
    paddingVertical: BADGE_PADDING_VERTICAL,
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    borderRadius: BADGE_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '700',
  },
});

interface ItemPopularityBadgeProps {
  tier: PopularityTier;
  itemName: string;
}

const ItemPopularityBadge = memo(({
  tier,
  itemName,
}: ItemPopularityBadgeProps): React.ReactElement | null => {
  const { theme } = useTheme();
  const { colors } = theme;
  const errorColor = theme.semantic.error['500'];
  const accent = theme.palette.accent['500'];

  if (tier === PopularityTier.Normal) return null;

  const isHot = tier === PopularityTier.Hot;
  const label = isHot
    ? FM('analytics.popularItems.badge.hot')
    : FM('analytics.popularItems.badge.popular');

  const backgroundColor = isHot ? errorColor : accent;
  const textColor = colors.background;

  return (
    <View
      accessibilityHint={FM('analytics.popularItems.badge.badgeHint', label)}
      accessibilityLabel={FM('analytics.popularItems.badge.badgeLabel', itemName, label)}
      style={[styles.badge, { backgroundColor }]}
      testID={TestIds.ITEM_POPULARITY_BADGE}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
});

ItemPopularityBadge.displayName = 'ItemPopularityBadge';

export default ItemPopularityBadge;

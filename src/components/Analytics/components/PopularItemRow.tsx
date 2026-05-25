import React, { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import { computeClickThroughRate } from '../utils/popularityUtils';

import type { PopularItemEntry } from '../types';

const ROW_PADDING_VERTICAL = 10;
const ROW_BORDER_BOTTOM_WIDTH = 1;
const NAME_FONT_SIZE = 15;
const CATEGORY_FONT_SIZE = 12;
const STAT_FONT_SIZE = 13;
const STATS_GAP = 12;
const BAR_HEIGHT = 4;
const BAR_BORDER_RADIUS = 2;
const BAR_MARGIN_TOP = 6;
const MAX_BAR_WIDTH_FRACTION = 1;

const styles = StyleSheet.create({
  row: {
    paddingVertical: ROW_PADDING_VERTICAL,
    borderBottomWidth: ROW_BORDER_BOTTOM_WIDTH,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: NAME_FONT_SIZE,
    fontWeight: '500',
  },
  categoryName: {
    fontSize: CATEGORY_FONT_SIZE,
  },
  statsRow: {
    flexDirection: 'row',
    gap: STATS_GAP,
  },
  stat: {
    fontSize: STAT_FONT_SIZE,
  },
  barContainer: {
    height: BAR_HEIGHT,
    borderRadius: BAR_BORDER_RADIUS,
    marginTop: BAR_MARGIN_TOP,
  },
  barFill: {
    height: BAR_HEIGHT,
    borderRadius: BAR_BORDER_RADIUS,
  },
});

interface PopularItemRowProps {
  item: PopularItemEntry;
  maxViewCount: number;
}

const PopularItemRow = memo(({
  item,
  maxViewCount,
}: PopularItemRowProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const accent = theme.palette.accent['500'];

  const ctr = computeClickThroughRate(item.viewCount, item.clickCount);
  const PERCENT_MULTIPLIER = 100;
  const barWidth = maxViewCount > 0
    ? `${(item.viewCount / maxViewCount) * MAX_BAR_WIDTH_FRACTION * PERCENT_MULTIPLIER}%`
    : '0%';
  return (
    <View
      accessibilityHint={FM('analytics.popularItems.rowHint')}
      accessibilityLabel={FM(
        'analytics.popularItems.rowLabel',
        item.itemName,
        item.categoryName,
      )}
      style={[styles.row, { borderBottomColor: colors.border }]}
      testID={TestIds.POPULAR_ITEMS_ROW}
    >
      <View style={styles.topRow}>
        <View style={styles.nameContainer}>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {item.itemName}
          </Text>
          <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
            {item.categoryName}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {FM('analytics.popularItems.viewCount', String(item.viewCount))}
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {FM('analytics.popularItems.clickCount', String(item.clickCount))}
          </Text>
          <Text style={[styles.stat, { color: accent }]}>
            {FM('analytics.popularItems.ctr', String(ctr))}
          </Text>
        </View>
      </View>

      <View style={[styles.barContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: primary }]} />
      </View>
    </View>
  );
});

PopularItemRow.displayName = 'PopularItemRow';

export default PopularItemRow;

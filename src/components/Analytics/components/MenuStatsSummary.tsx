import React, { memo } from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';

import StatCard from './StatCard';

const STATS_GAP = 12;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: STATS_GAP,
  },
  statItem: {
    flexBasis: '30%',
    flexGrow: 1,
  },
});

interface MenuStatsSummaryProps {
  totalViews: number;
  uniqueVisitors: number;
  avgViewDuration: number;
}

const MenuStatsSummary = memo(({
  totalViews,
  uniqueVisitors,
  avgViewDuration,
}: MenuStatsSummaryProps): React.ReactElement => (
  <View style={styles.grid}>
    <View style={styles.statItem}>
      <StatCard
        label={FM('analytics.detail.totalViews')}
        testID={TestIds.MENU_ANALYTICS_STAT_TOTAL_VIEWS}
        value={totalViews}
      />
    </View>
    <View style={styles.statItem}>
      <StatCard
        label={FM('analytics.detail.uniqueVisitors')}
        testID={TestIds.MENU_ANALYTICS_STAT_UNIQUE_VISITORS}
        value={uniqueVisitors}
      />
    </View>
    <View style={styles.statItem}>
      <StatCard
        label={FM('analytics.detail.avgDuration')}
        testID={TestIds.MENU_ANALYTICS_STAT_AVG_DURATION}
        value={avgViewDuration}
      />
    </View>
  </View>
));

MenuStatsSummary.displayName = 'MenuStatsSummary';

export default MenuStatsSummary;

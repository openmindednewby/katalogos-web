import React, { useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { usePopularItems } from '@/server/customHooks/usePopularItems';
import TimePeriod from '@/shared/enums/TimePeriod';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import PopularItemRow from './PopularItemRow';
import TimePeriodSelector from './TimePeriodSelector';
import { getDateRangeForPeriod, getTopItems } from '../utils/popularityUtils';

const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 12;
const CARD_BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 16;
const TITLE_MARGIN_BOTTOM = 12;
const HEADER_MARGIN_BOTTOM = 16;
const EMPTY_FONT_SIZE = 14;
const EMPTY_PADDING = 20;
const ERROR_FONT_SIZE = 14;
const RETRY_FONT_SIZE = 13;
const RETRY_PADDING_VERTICAL = 8;
const RETRY_PADDING_HORIZONTAL = 16;
const RETRY_BORDER_RADIUS = 6;
const RETRY_MARGIN_TOP = 8;
const MAX_ITEMS = 10;

const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  emptyText: {
    fontSize: EMPTY_FONT_SIZE,
    textAlign: 'center',
    paddingVertical: EMPTY_PADDING,
  },
  errorText: {
    fontSize: ERROR_FONT_SIZE,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: RETRY_PADDING_VERTICAL,
    paddingHorizontal: RETRY_PADDING_HORIZONTAL,
    borderRadius: RETRY_BORDER_RADIUS,
    marginTop: RETRY_MARGIN_TOP,
    alignSelf: 'center',
  },
  retryText: {
    fontSize: RETRY_FONT_SIZE,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const PopularItemsCard = (): React.ReactElement => {
  const [period, setPeriod] = useState<TimePeriod>(TimePeriod.SevenDays);
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const dateRange = useMemo(() => getDateRangeForPeriod(period), [period]);
  const { data, isLoading, isError, refetch } = usePopularItems(dateRange.from, dateRange.to);

  const topItems = useMemo(
    () => getTopItems(data?.items ?? [], MAX_ITEMS),
    [data],
  );

  const maxViewCount = useMemo(
    () => topItems.reduce((max, item) => Math.max(max, item.viewCount), 0),
    [topItems],
  );

  const handleRetry = useCallback((): void => {
    refetch().catch(() => {});
  }, [refetch]);

  const hasData = !isLoading && !isError;
  const showEmpty = hasData && topItems.length === 0;
  const showItems = hasData && topItems.length > 0;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={TestIds.POPULAR_ITEMS_CARD}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('analytics.popularItems.title')}
      </Text>

      <View style={styles.header}>
        <TimePeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent} testID={TestIds.POPULAR_ITEMS_LOADING}>
          <ActivityIndicator color={primary} size="small" />
          <Text style={{ color: colors.textSecondary }}>
            {FM('analytics.popularItems.loading')}
          </Text>
        </View>
      ) : null}

      {isError ? <View style={styles.centerContent} testID={TestIds.POPULAR_ITEMS_ERROR}>
          <Text style={[styles.errorText, { color: errorColor }]}>
            {FM('analytics.popularItems.error')}
          </Text>
          <TouchableOpacity
            accessibilityHint={FM('analytics.popularItems.retryHint')}
            accessibilityLabel={FM('analytics.popularItems.retry')}
            accessibilityRole="button"
            style={[styles.retryButton, { backgroundColor: primary }]}
            testID={TestIds.POPULAR_ITEMS_RETRY_BUTTON}
            onPress={handleRetry}
          >
            <Text style={[styles.retryText, { color: colors.background }]}>
              {FM('analytics.popularItems.retry')}
            </Text>
          </TouchableOpacity>
        </View> : null}

      {showEmpty ? <Text
          style={[styles.emptyText, { color: colors.textSecondary }]}
          testID={TestIds.POPULAR_ITEMS_EMPTY}
        >
          {FM('analytics.popularItems.empty')}
        </Text> : null}

      {showItems
        ? topItems.map((item) => (
          <PopularItemRow
            key={item.itemId}
            item={item}
            maxViewCount={maxViewCount}
          />
        ))
        : null}
    </View>
  );
};

export default PopularItemsCard;

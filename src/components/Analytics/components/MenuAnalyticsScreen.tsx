import React, { useCallback, useMemo, useState } from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '@/localization/helpers';
import { Routes } from '@/navigation/routes';
import AnalyticsTimeRange from '@/shared/enums/AnalyticsTimeRange';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { layoutStyles } from '@/theme/utils/styles';

import DeviceBreakdownChart from './DeviceBreakdownChart';
import MenuAnalyticsErrorState from './MenuAnalyticsErrorState';
import MenuAnalyticsLoadingState from './MenuAnalyticsLoadingState';
import MenuStatsSummary from './MenuStatsSummary';
import TimeRangeSelector from './TimeRangeSelector';
import TopItemsList from './TopItemsList';
import ViewsOverTimeChart from './ViewsOverTimeChart';
import { useMenuAnalytics } from '../hooks/useMenuAnalytics';

import type { MenuAnalyticsDetail } from '../types';

const SEVEN_DAYS = 7;
const THIRTY_DAYS = 30;
const SECTION_GAP = 24;
const TITLE_FONT_SIZE = 20;
const TITLE_MARGIN_BOTTOM = 16;
const BACK_FONT_SIZE = 14;
const BACK_MARGIN_BOTTOM = 12;
const SCROLL_PADDING_BOTTOM = 32;

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: SCROLL_PADDING_BOTTOM },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', marginBottom: TITLE_MARGIN_BOTTOM },
  section: { marginTop: SECTION_GAP },
  backButton: { marginBottom: BACK_MARGIN_BOTTOM },
  backText: { fontSize: BACK_FONT_SIZE, fontWeight: '500' },
});

function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(range: AnalyticsTimeRange): { from: string; to: string } {
  const now = new Date();
  const to = dateToString(now);

  if (range === AnalyticsTimeRange.Today)
    return { from: to, to };

  const daysBack = range === AnalyticsTimeRange.SevenDays ? SEVEN_DAYS : THIRTY_DAYS;
  const from = new Date(now);
  from.setDate(from.getDate() - daysBack);
  return { from: dateToString(from), to };
}

interface MenuAnalyticsScreenProps {
  menuId: string;
}

function getDisplayTitle(data: MenuAnalyticsDetail | undefined): string {
  const menuName = data?.menuName ?? '';
  return menuName.length > 0 ? menuName : FM('analytics.detail.title');
}

const AnalyticsBackButton = ({ primaryColor, onPress }: {
  primaryColor: string;
  onPress: () => void;
}): React.ReactElement => {
  return (
    <TouchableOpacity
      accessibilityHint={FM('analytics.detail.backHint')}
      accessibilityLabel={FM('analytics.detail.backButton')}
      accessibilityRole="button"
      style={styles.backButton}
      testID="menu-analytics-back-button"
      onPress={onPress}
    >
      <Text style={[styles.backText, { color: primaryColor }]}>
        {FM('analytics.detail.backButton')}
      </Text>
    </TouchableOpacity>
  );
}

const AnalyticsCharts = ({ data }: { data: MenuAnalyticsDetail | undefined }): React.ReactElement => {
  return (
    <>
      <View style={styles.section}>
        <MenuStatsSummary
          avgViewDuration={data?.avgViewDuration ?? 0}
          totalViews={data?.totalViews ?? 0}
          uniqueVisitors={data?.uniqueVisitors ?? 0}
        />
      </View>
      <View style={styles.section}>
        <ViewsOverTimeChart data={data?.viewsByDay ?? []} />
      </View>
      <View style={styles.section}>
        <DeviceBreakdownChart data={data?.deviceBreakdown ?? []} />
      </View>
      <View style={styles.section}>
        <TopItemsList items={data?.topItems ?? []} />
      </View>
    </>
  );
}

const MenuAnalyticsScreen = ({ menuId }: MenuAnalyticsScreenProps): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(AnalyticsTimeRange.SevenDays);

  const { from, to } = useMemo(() => getDateRange(timeRange), [timeRange]);
  const { data, isLoading, isError, refetch } = useMenuAnalytics(menuId, from, to);

  const handleRetry = useCallback((): void => {
    refetch().catch(() => {});
  }, [refetch]);

  const handleBack = useCallback((): void => {
    router.push(Routes.ANALYTICS);
  }, [router]);

  const backButton = <AnalyticsBackButton primaryColor={primary} onPress={handleBack} />;

  if (isLoading)
    return <MenuAnalyticsLoadingState backButton={backButton} />;

  if (isError)
    return <MenuAnalyticsErrorState backButton={backButton} onRetry={handleRetry} />;

  return (
    <ScrollView
      contentContainerStyle={[layoutStyles.container, styles.scrollContent]}
      style={{ backgroundColor: colors.background }}
      testID={TestIds.MENU_ANALYTICS_SCREEN}
    >
      {backButton}
      <Text style={[styles.title, { color: colors.text }]}>
        {getDisplayTitle(data)}
      </Text>

      <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
      <AnalyticsCharts data={data} />
    </ScrollView>
  );
};

export default MenuAnalyticsScreen;

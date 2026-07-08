import React, { useCallback } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { FM } from '@/localization/helpers';
import { Routes } from '@/navigation/routes';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { layoutStyles } from '@/theme/utils/styles';

import StatCard from './StatCard';
import TopMenusList from './TopMenusList';
import { useTenantAnalytics } from '../hooks/useTenantAnalytics';

const STATS_GAP = 12;
const SECTION_MARGIN_TOP = 24;
const ERROR_FONT_SIZE = 16;
const ERROR_PADDING = 24;
const RETRY_PADDING_VERTICAL = 10;
const RETRY_PADDING_HORIZONTAL = 20;
const RETRY_BORDER_RADIUS = 8;
const RETRY_MARGIN_TOP = 12;
const RETRY_FONT_SIZE = 14;
const TITLE_FONT_SIZE = 20;
const TITLE_MARGIN_BOTTOM = 16;
const SCROLL_CONTENT_PADDING_BOTTOM = 32;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SCROLL_CONTENT_PADDING_BOTTOM,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: STATS_GAP,
  },
  statItem: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  // UX Move 4: on wide desktops the four stat cards form a single dense row
  // instead of a sparse 2x2 grid. Phone/tablet keep the 48% two-column layout.
  statItemWide: {
    flexBasis: '22%',
  },
  topMenusSection: {
    marginTop: SECTION_MARGIN_TOP,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ERROR_PADDING,
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
  },
  retryButtonText: {
    fontSize: RETRY_FONT_SIZE,
    fontWeight: '600',
  },
});

const AnalyticsDashboardScreen = (): React.ReactElement => {
  const { data, isLoading, isError, refetch } = useTenantAnalytics();
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];
  const router = useRouter();
  // UX Move 4: relax the stat grid to a single dense row on wide desktops.
  const { isDesktop } = useBreakpoint();
  const statItemStyle = isDesktop ? [styles.statItem, styles.statItemWide] : styles.statItem;

  const handleRetry = useCallback((): void => {
    refetch().catch(() => {});
  }, [refetch]);

  const handleMenuPress = useCallback((menuId: string): void => {
    router.push(`${Routes.MENU_ANALYTICS}/${menuId}`);
  }, [router]);

  if (isLoading)
    return (
      <View
        style={[layoutStyles.container, { backgroundColor: colors.background }]}
        testID={TestIds.ANALYTICS_SCREEN}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={primary}
            size="large"
            testID={TestIds.ANALYTICS_LOADING}
          />
          <Text style={{ color: colors.textSecondary }}>
            {FM('analytics.loading')}
          </Text>
        </View>
      </View>
    );

  if (isError)
    return (
      <View
        style={[layoutStyles.container, { backgroundColor: colors.background }]}
        testID={TestIds.ANALYTICS_SCREEN}
      >
        <View style={styles.errorContainer} testID={TestIds.ANALYTICS_ERROR}>
          <Text style={[styles.errorText, { color: errorColor }]}>
            {FM('analytics.error')}
          </Text>
          <TouchableOpacity
            accessibilityHint={FM('analytics.retryHint')}
            accessibilityLabel={FM('analytics.retry')}
            accessibilityRole="button"
            style={[styles.retryButton, { backgroundColor: primary }]}
            testID={TestIds.ANALYTICS_RETRY_BUTTON}
            onPress={handleRetry}
          >
            <Text style={[styles.retryButtonText, { color: colors.background }]}>
              {FM('analytics.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  const summary = data;
  const totalMenus = summary?.totalMenus ?? 0;
  const activeMenus = summary?.activeMenus ?? 0;
  const scansToday = summary?.scansToday ?? 0;
  const totalQrScans = summary?.totalQrScans ?? 0;
  const topMenus = summary?.topMenusByScans ?? [];

  return (
    <ScrollView
      contentContainerStyle={[layoutStyles.container, styles.scrollContent]}
      style={{ backgroundColor: colors.background }}
      testID={TestIds.ANALYTICS_SCREEN}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('analytics.title')}
      </Text>

      <View style={styles.statsGrid}>
        <View style={statItemStyle}>
          <StatCard
            label={FM('analytics.totalMenus')}
            testID={TestIds.ANALYTICS_STAT_TOTAL_MENUS}
            value={totalMenus}
          />
        </View>
        <View style={statItemStyle}>
          <StatCard
            label={FM('analytics.activeMenus')}
            testID={TestIds.ANALYTICS_STAT_ACTIVE_MENUS}
            value={activeMenus}
          />
        </View>
        <View style={statItemStyle}>
          <StatCard
            label={FM('analytics.qrScansToday')}
            testID={TestIds.ANALYTICS_STAT_SCANS_TODAY}
            value={scansToday}
          />
        </View>
        <View style={statItemStyle}>
          <StatCard
            label={FM('analytics.qrScansTotal')}
            testID={TestIds.ANALYTICS_STAT_SCANS_TOTAL}
            value={totalQrScans}
          />
        </View>
      </View>

      <View style={styles.topMenusSection}>
        <TopMenusList
          menus={topMenus}
          testID={TestIds.ANALYTICS_TOP_MENUS_LIST}
          onMenuPress={handleMenuPress}
        />
      </View>
    </ScrollView>
  );
};

export default AnalyticsDashboardScreen;

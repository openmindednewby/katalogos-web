import React, { useCallback, useMemo, useState } from 'react';

import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useNotifications } from '@dloizides/notification-client/react';

import { FM } from '@/localization/helpers';

import NotificationItemComponent from '../../../src/components/Notifications/NotificationItemComponent';
import PageHeaderWithActions from '../../../src/components/Shared/PageHeaderWithActions';
import { Routes } from '../../../src/navigation/routes';
import { TestIds } from '../../../src/shared/testIds';
import { useTheme } from '../../../src/theme/hooks/useTheme';
import { isNullOrUndefined } from '../../../src/utils/is';

import type { NotificationItem, ThemeColors } from '../../../src/components/Notifications/NotificationItemComponent';

interface UseNotificationsResult {
  notifications: NotificationItem[];
  connectionStatus: string;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const REFRESH_DELAY_MS = 500;
const CONNECTION_BANNER_PADDING = 8;
const SETTINGS_ICON_SIZE = 20;
const SETTINGS_BUTTON_PADDING = 8;
const SETTINGS_GEAR_ICON = '\u2699';

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingHorizontal: 16 },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  markAllReadButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  markAllReadText: { fontSize: 14 },
  connectionBanner: { padding: CONNECTION_BANNER_PADDING, alignItems: 'center' },
  connectionText: { fontSize: 12 },
  listContent: { paddingBottom: 16 },
  listContentEmpty: { paddingBottom: 16, flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16 },
  settingsButton: { padding: SETTINGS_BUTTON_PADDING },
  settingsIcon: { fontSize: SETTINGS_ICON_SIZE },
});

function isUseNotificationsResult(value: unknown): value is UseNotificationsResult {
  if (isNullOrUndefined(value)) return false;
  if (typeof value !== 'object') return false;
  return 'notifications' in value && 'connectionStatus' in value;
}

function useNotificationsScreenData(): UseNotificationsResult {
  const hookResult: unknown = useNotifications();
  if (isUseNotificationsResult(hookResult)) return hookResult;
  return {
    notifications: [],
    connectionStatus: 'disconnected',
    markAsRead: async () => {},
    markAllAsRead: async () => {},
  };
}

const NotificationsScreen = (): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const colors: ThemeColors = useMemo(() => ({
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    border: theme.colors.border,
    primary: theme.palette.primary['500'],
  }), [theme]);

  const { notifications, connectionStatus, markAsRead, markAllAsRead } = useNotificationsScreenData();
  const [refreshing, setRefreshing] = useState(false);

  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const hasUnreadNotifications = notificationsList.some((n) => n.isRead === false);
  const isConnected = connectionStatus === 'connected';

  const handleSettingsPress = useCallback((): void => {
    router.push(Routes.NOTIFICATION_PREFERENCES);
  }, [router]);

  const handleRefresh = useCallback((): void => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), REFRESH_DELAY_MS);
  }, []);

  const handleNotificationPress = useCallback((notification: NotificationItem): void => {
    if (notification.isRead === false) markAsRead(notification.id).catch(() => {});
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback((): void => {
    markAllAsRead().catch(() => {});
  }, [markAllAsRead]);

  const renderItem = useCallback(({ item }: { item: NotificationItem }): React.ReactElement => (
    <NotificationItemComponent colors={colors} item={item} onPress={handleNotificationPress} />
  ), [colors, handleNotificationPress]);

  const keyExtractor = useCallback((item: NotificationItem): string => item.id, []);

  const renderEmptyComponent = useCallback((): React.ReactElement => (
    <View style={styles.emptyContainer} testID={TestIds.NOTIFICATION_EMPTY_STATE}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{FM('notifications.empty')}</Text>
    </View>
  ), [colors.textSecondary]);

  const listContentStyle = notificationsList.length === 0 ? styles.listContentEmpty : styles.listContent;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.NOTIFICATION_SCREEN}>
      <View style={styles.headerWrapper}>
        <PageHeaderWithActions
          refreshing={refreshing}
          refreshLabel={FM('common.refresh')}
          title={FM('notifications.title')}
          onRefresh={handleRefresh}
        >
          <TouchableOpacity
            accessibilityHint={FM('notifications.settingsHint')}
            accessibilityLabel={FM('menu.notificationPreferences')}
            accessibilityRole="button"
            style={styles.settingsButton}
            testID={TestIds.NOTIFICATION_SETTINGS_BUTTON}
            onPress={handleSettingsPress}
          >
            <Text style={[styles.settingsIcon, { color: colors.text }]}>{SETTINGS_GEAR_ICON}</Text>
          </TouchableOpacity>
        </PageHeaderWithActions>
      </View>

      {!isConnected ? (
        <View
          style={[styles.connectionBanner, { backgroundColor: theme.semantic.warning['100'] }]}
          testID={TestIds.NOTIFICATION_CONNECTION_STATUS}
        >
          <Text style={[styles.connectionText, { color: theme.semantic.warning['800'] }]}>
            {FM('notifications.connectionStatus')}: {connectionStatus}
          </Text>
        </View>
      ) : null}

      {hasUnreadNotifications ? (
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityHint={FM('notifications.markAllReadHint')}
            accessibilityLabel={FM('notifications.markAllRead')}
            accessibilityRole="button"
            style={[styles.markAllReadButton, { backgroundColor: colors.primary }]}
            testID={TestIds.NOTIFICATION_MARK_ALL_READ}
            onPress={handleMarkAllAsRead}
          >
            <Text style={[styles.markAllReadText, { color: theme.colors.background }]}>
              {FM('notifications.markAllRead')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={listContentStyle}
        data={notificationsList}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={renderItem}
        testID={TestIds.NOTIFICATION_LIST}
      />
    </View>
  );
};

export default NotificationsScreen;

import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import { SvgIcon } from '../Icons';

/**
 * Notification item interface
 */
export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Theme colors interface for styling
 */
export interface ThemeColors {
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  border: string;
  primary: string;
}

interface NotificationItemComponentProps {
  item: NotificationItem;
  colors: ThemeColors;
  onPress: (notification: NotificationItem) => void;
}

const UNREAD_INDICATOR_SIZE = 8;
const ICON_SIZE = 40;
const ICON_SVG_SIZE = 20;
const TITLE_FONT_SIZE = 14;
const BODY_FONT_SIZE = 13;
const TIME_FONT_SIZE = 12;
const ITEM_PADDING = 16;
const ICON_MARGIN = 12;
const TITLE_MARGIN_BOTTOM = 4;

const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    padding: ITEM_PADDING,
    borderBottomWidth: 1,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 6,
    top: '50%',
    width: UNREAD_INDICATOR_SIZE,
    height: UNREAD_INDICATOR_SIZE,
    borderRadius: UNREAD_INDICATOR_SIZE / 2,
    marginTop: -UNREAD_INDICATOR_SIZE / 2,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ICON_MARGIN,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  body: {
    fontSize: BODY_FONT_SIZE,
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  time: {
    fontSize: TIME_FONT_SIZE,
  },
});

/**
 * Formats a date string to a relative time display with i18n support
 */
function useFormatRelativeTime(): (dateString: string) => string {
  return useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / MS_PER_MINUTE);
    const diffHours = Math.floor(diffMinutes / MINUTES_PER_HOUR);
    const diffDays = Math.floor(diffHours / HOURS_PER_DAY);

    if (diffMinutes < 1) return FM('notifications.time.justNow');
    if (diffMinutes < MINUTES_PER_HOUR) return FM('notifications.time.minutesAgo', String(diffMinutes));
    if (diffHours < HOURS_PER_DAY) return FM('notifications.time.hoursAgo', String(diffHours));
    if (diffDays < DAYS_PER_WEEK) return FM('notifications.time.daysAgo', String(diffDays));
    return date.toLocaleDateString();
  }, []);
}

/**
 * A single notification item component with unread indicator, icon, and relative time.
 */
const NotificationItemComponent = ({ item, colors, onPress }: NotificationItemComponentProps): React.ReactElement => {
  const formatRelativeTime = useFormatRelativeTime();

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const isUnread = !item.isRead;
  const titleWeight = isUnread ? 'bold' : 'normal';
  const backgroundColor = isUnread ? colors.surface : colors.background;
  const hasCustomIcon = isValueDefined(item.icon) && item.icon !== '';

  return (
    <TouchableOpacity
      accessibilityHint={FM('notifications.openDetailsHint')}
      accessibilityLabel={`${item.title}${isUnread ? ', unread' : ''}`}
      accessibilityRole="button"
      style={[styles.notificationItem, { backgroundColor, borderBottomColor: colors.border }]}
      testID={`${TestIds.NOTIFICATION_ITEM}-${item.id}`}
      onPress={handlePress}
    >
      {isUnread ? <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} /> : null}
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        {hasCustomIcon
          ? <Text style={{ fontSize: ICON_SVG_SIZE }}>{item.icon}</Text>
          : <SvgIcon color={colors.text} name="bell" size={ICON_SVG_SIZE} />}
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text, fontWeight: titleWeight }]}>{item.title}</Text>
        {isValueDefined(item.body) ? <Text numberOfLines={2} style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text> : null}
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItemComponent;

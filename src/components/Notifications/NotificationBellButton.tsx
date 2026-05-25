import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useUnreadCount } from '@dloizides/notification-client/react/hooks';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { SvgIcon } from '../Icons';

const BELL_SIZE = 24;
const BADGE_SIZE = 18;
const MAX_BADGE_COUNT = 99;
const BADGE_FONT_SIZE = 10;
const BADGE_HORIZONTAL_PADDING = 4;
const BADGE_BORDER_RADIUS = 9;
const CONTAINER_PADDING = 8;
const BADGE_TOP_OFFSET = -4;
const BADGE_RIGHT_OFFSET = -4;
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: CONTAINER_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: BADGE_TOP_OFFSET,
    right: BADGE_RIGHT_OFFSET,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: BADGE_HORIZONTAL_PADDING,
  },
  badgeText: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: 'bold',
  },
});

/**
 * Notification bell button with unread count badge.
 * Navigates to the notifications screen when pressed.
 */
const NotificationBellButton = (): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();

  const unreadCountValue = useUnreadCount();
  const unreadCount = typeof unreadCountValue === 'number' ? unreadCountValue : 0;

  const handlePress = useCallback((): void => {
    router.push('/(protected)/notifications');
  }, [router]);

  const hasBadge = unreadCount > 0;
  const badgeText = unreadCount > MAX_BADGE_COUNT ? '99+' : String(unreadCount);

  return (
    <TouchableOpacity
      accessibilityHint={FM('notifications.bellHint')}
      accessibilityLabel={FM('notifications.bellLabel')}
      accessibilityRole="button"
      style={styles.container}
      testID={TestIds.NOTIFICATION_BELL}
      onPress={handlePress}
    >
      <SvgIcon color={theme.colors.text} name="bell" size={BELL_SIZE} />
      {hasBadge ? (
        <View
          accessibilityHint={FM('notifications.badgeHint')}
          accessibilityLabel={FM('notifications.badgeLabel', String(unreadCount))}
          style={[styles.badge, { backgroundColor: theme.palette.primary['500'] }]}
          testID={TestIds.NOTIFICATION_BELL_BADGE}
        >
          <Text style={[styles.badgeText, { color: theme.colors.surfaceElevated }]}>{badgeText}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default NotificationBellButton;
